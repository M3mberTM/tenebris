import Logger from "./logging";
import { setRenameFunc, openRenameModal, closeRenameModal } from "./renaming";

// custom context menu
const contextMenu = document.getElementById(
    "bookmarkContextMenu"
) as HTMLDivElement;

let activeSidebar: HTMLElement | null = null;

export function closeContextMenu() {
    contextMenu.hidden = true;
    contextMenu.dataset.bookmarkId = undefined;
    contextMenu.dataset.bookmarkType = undefined;
}

function openContextMenu(event: MouseEvent, bookmark: HTMLElement) {
    contextMenu.hidden = false;
    contextMenu.dataset.bookmarkId = bookmark.dataset.id;
    contextMenu.dataset.bookmarkType = bookmark.dataset.bookmarkType;

    const menuWidth = contextMenu.offsetWidth;
    const menuHeight = contextMenu.offsetHeight;

    // Keep the menu inside the visible viewport.
    contextMenu.style.left =
        `${Math.max(0, Math.min(event.clientX, window.innerWidth - menuWidth))}px`;

    contextMenu.style.top =
        `${Math.max(0, Math.min(event.clientY, window.innerHeight - menuHeight))}px`;
}

export function isActivelyHovered(): boolean {
    const hoverArea = activeSidebar?.closest(".bookmarksHoverable");

    return hoverArea?.matches(":hover") ? true : false;
}

export function closeSidebar() {
    activeSidebar?.classList.remove("open");
    activeSidebar = null;
}

function openSidebar(sidebar: HTMLElement) {
    activeSidebar = sidebar;
    activeSidebar.classList.add("open");
}

export function handleContextMenu(event: MouseEvent) {
    const target = event.target;

    if (!(target instanceof Element)) return;
    const item = target.closest<HTMLElement>("[data-id]");

    if (!item) {
        closeContextMenu();
        return;
    }
    const sidebar = item.closest<HTMLElement>(".bookmarksSidebar");

    if (!sidebar) {
        closeContextMenu();
        return;
    }

    event.preventDefault();

    openSidebar(sidebar);
    openContextMenu(event, item);

}

export function isMouseInMenu(event: MouseEvent) {
    return contextMenu.contains(event.target as Node);
}

async function handleMenuClick(event: MouseEvent) {

    const target = event.target;
    console.log("Target ", target);
    if (!(target instanceof HTMLElement) || !activeSidebar?.dataset.bookmarkId) {
        Logger.error("Invalid target");
    };

    if (!(target instanceof HTMLButtonElement)) {
        Logger.error("Invalid target");
        return;
    }
    const action = target.dataset.action;

    console.log("Button ", action);
    const id = contextMenu.dataset.bookmarkId;
    const type = contextMenu.dataset.bookmarkType;

    if (!id || !type) return;

    closeContextMenu();
    closeSidebar();

    try {
        if (action === "rename") {
            setRenameFunc(async (name: string) => {
                await chrome.bookmarks.update(id, {
                    title: name
                });
                closeRenameModal();
            });
            openRenameModal();
        }
        if (action === "remove") {
            if (type === "folder") {
                await chrome.bookmarks.removeTree(id);
            } else {
                await chrome.bookmarks.remove(id);
            }
        }
    } catch (error) {
        Logger.error("Could not modify bookmark:", error);
        alert("Could not modify this bookmark. It may be protected or already removed.");
    }
}


// Handle Rename and Remove.
contextMenu.addEventListener("click", async (event: MouseEvent) => {
    handleMenuClick(event);
});