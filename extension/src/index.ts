import { loadAndApplyBookmarks } from "./bookmarks";
import { handleContextMenu, closeContextMenu, isMouseInMenu, isActivelyHovered, closeSidebar } from "./contextMenu";
import { handleSubmit, closeRenameModal } from "./renaming";

document.addEventListener("DOMContentLoaded", loadAndApplyBookmarks);

// update listeneners
chrome.bookmarks.onChanged.addListener(loadAndApplyBookmarks);
chrome.bookmarks.onCreated.addListener(loadAndApplyBookmarks);
chrome.bookmarks.onMoved.addListener(loadAndApplyBookmarks);
chrome.bookmarks.onRemoved.addListener(loadAndApplyBookmarks);

// expanding folders with a click instead of hover
document.addEventListener("click", (event) => {
    const target = event.target;

    if (!(target instanceof Element)) return;

    const title = target.closest(".folderTitle");
    if (!title) return;

    const folder = title.closest(".bookmarkFolder");
    if (!folder) return;

    folder.classList.toggle("open");
});



document.addEventListener("contextmenu", (event: MouseEvent) => {
    handleContextMenu(event);
});

// Close the menu when clicking elsewhere.
document.addEventListener("click", (event: MouseEvent) => {
    if (!isMouseInMenu(event)) {
        closeContextMenu();
        if (isActivelyHovered()) return;
        closeSidebar();
    }
});

// Close on Escape.
document.addEventListener("keydown", (event: KeyboardEvent) => {
    if (event.key === "Escape") {
        closeContextMenu();
        if (isActivelyHovered()) return;
        closeSidebar();
    }
});


const renameForm = document.getElementById("renameForm") as HTMLFormElement;
const renameModal = document.getElementById("renameModal") as HTMLDivElement;

renameForm.addEventListener("submit", (event: SubmitEvent) => {
    event.preventDefault();
    handleSubmit(event);
});

renameModal.addEventListener("keydown", (event: KeyboardEvent) => {
    if (event.key === "Escape") {
        closeRenameModal();
    }
});



