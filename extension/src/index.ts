import { log } from "./logging";
import { assert } from "./assert";

function renderBookmarks(nodes: chrome.bookmarks.BookmarkTreeNode[], container: HTMLElement) {
	log("Nodes ", nodes);
	for (const node of nodes) {
        renderNodeAsBookmark(node, container);
	}
}

function renderNodeAsBookmark(node: chrome.bookmarks.BookmarkTreeNode, container: HTMLElement) {
    if (!node.url) {
        // Folder
        createBookmarkFolder(node, container);
        return;
    }
    createBookmark(node, container);

}

/**
 * Returns an img element that shows the website favicon.
 */
function getFaviconElement(node: chrome.bookmarks.BookmarkTreeNode): HTMLImageElement {
    assert(node.url, "Node has to have a url to get favicon");

    const faviconIcon = document.createElement("img");
    faviconIcon.className = "bookmarkIcon";
	faviconIcon.alt = "";
	const faviconUrl = new URL(chrome.runtime.getURL("/_favicon/"));

	log("Favicon url ", faviconUrl);

	faviconUrl.searchParams.set("pageUrl", node.url);
	faviconUrl.searchParams.set("size", "24");

	faviconIcon.src = faviconUrl.toString();

	faviconIcon.addEventListener("error", () => {
		faviconIcon.style.visibility = "hidden";
	});

    return faviconIcon;

}

/**
 * Creates a bookmark element with the correct UI
 *
 * <div class="bookmark">
 *     <img src="<node.url>" alt="" class="bookmarkIcon">
 *     <a class="bookmarkTitle" href="<node.url>"><node.title></a>
 * </div>
 */
function createBookmark(node: chrome.bookmarks.BookmarkTreeNode, container: HTMLElement) {
    assert(node.url, "Node has to have a url to build a bookmark");

    const bookmark = document.createElement("div");
    bookmark.className = "bookmark";
    bookmark.dataset.bookmarkType = "bookmark";
    bookmark.dataset.id = node.id;
    const bookmarkIcon = getFaviconElement(node);
    const mainLink = document.createElement("a");
    mainLink.className = "bookmarkTitle";
    mainLink.href = node.url;
    mainLink.textContent = node.title;
    bookmark.append(bookmarkIcon, mainLink);
    container.appendChild(bookmark);
}

/**
 * Creates a folder element with the correct UI
 *
 *  <div class="bookmarkFolder bookmark">
 *      <h3 class="folderTitle"></node.title></h3>
 *      <div class="folderBookmarks">
 *          <node.children>
 *      </div>
 *  </div>
 */
function createBookmarkFolder(node: chrome.bookmarks.BookmarkTreeNode, container: HTMLElement) {
	const folder = document.createElement("div");
    folder.className = "bookmarkFolder bookmark";
    folder.dataset.bookmarkType = "folder";
    folder.dataset.id = node.id;
    const folderTitle = document.createElement("h3");
    folderTitle.className = "folderTitle";
    folderTitle.textContent = node.title;
    const folderBookmarks = document.createElement("div");
    folderBookmarks.className = "folderBookmarks";
    for (const child of node.children || []) {
        renderNodeAsBookmark(child, folderBookmarks);
    }
    folder.append(folderTitle, folderBookmarks);
    container.appendChild(folder);


}

function getBookmarkBarMarks(tree: chrome.bookmarks.BookmarkTreeNode[]) {
	const children = tree[0].children || [];
	const marks = children.find((node) => node.folderType === "bookmarks-bar" || node.title == "Bookmarks bar");
	log("Marks ", marks);
	if (!marks) {
		return [];
	}
	return marks.children || [];
}

function loadAndApplyBookmarks() {
	const leftBookmarksList = document.getElementById("leftBookmarksList");
	const rightBookmarksList = document.getElementById("rightBookmarksList");
	if (!leftBookmarksList || !rightBookmarksList) {
		throw new Error("Left or right bookmarkList not found");
	}
	chrome.bookmarks.getTree((tree) => {
		log("Tree ", tree);
		leftBookmarksList.replaceChildren();
		const bookmarksFromBar = getBookmarkBarMarks(tree);
		renderBookmarks(bookmarksFromBar, leftBookmarksList);
        log("All bookmarks");
		renderBookmarks(tree[0].children || [], rightBookmarksList);
	});
}

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



// TODO redo this code properly later when it works
// custom context menu
const contextMenu = document.getElementById(
    "bookmarkContextMenu"
) as HTMLDivElement;

let selectedBookmark: HTMLElement | null = null;

let activeSidebar: HTMLElement | null = null;

function closeContextMenu() {
    contextMenu.hidden = true;
    selectedBookmark = null;
}


// Open the custom menu on right-click.
document.addEventListener("contextmenu", (event: MouseEvent) => {
    const target = event.target;

    if (!(target instanceof Element)) return;
    const item = target.closest<HTMLElement>("[data-id]");

    // Only replace the native menu for our bookmark items.
    if (!item) {
        closeContextMenu();
        return;
    }
    const sidebar = item.closest<HTMLElement>(".bookmarksSidebar");

    if (!sidebar) {
        closeContextMenu();
        return;
    }

    activeSidebar = sidebar;
    // TODO figure out a better way of doing this. also doesn't trigger if the user goes away and presses escape as the mouse technically didn't trigger mouseleave
    activeSidebar.addEventListener("mouseleave", () => {
        if (!contextMenu.hidden) return;
        activeSidebar?.classList.remove("open");
        activeSidebar = null;
    })
    event.preventDefault();

    sidebar?.classList.add("open");
    selectedBookmark = item;
    contextMenu.hidden = false;

    // Keep the menu inside the visible viewport.
    const menuWidth = contextMenu.offsetWidth;
    const menuHeight = contextMenu.offsetHeight;

    contextMenu.style.left =
        `${Math.max(0, Math.min(event.clientX, window.innerWidth - menuWidth))}px`;

    contextMenu.style.top =
        `${Math.max(0, Math.min(event.clientY, window.innerHeight - menuHeight))}px`;
});

// Close the menu when clicking elsewhere.
document.addEventListener("click", (event: MouseEvent) => {
    if (!contextMenu.contains(event.target as Node)) {
        contextMenu.hidden = true;
        closeContextMenu();
    }
});

// Close on Escape.
document.addEventListener("keydown", (event: KeyboardEvent) => {
    if (event.key === "Escape") {
        contextMenu.hidden = true;
        closeContextMenu();
    }
});

// Handle Rename and Remove.
contextMenu.addEventListener("click", async (event: MouseEvent) => {
    const target = event.target;
    console.log("Target ", target);

    if (!(target instanceof Element) || !selectedBookmark) return;

    const button = target.closest<HTMLButtonElement>("button[data-action]");
    if (!button) return;

    const id = selectedBookmark.dataset.bookmarkId;
    const type = selectedBookmark.dataset.bookmarkType;

    if (!id || !type) return;

    contextMenu.hidden = true;

    try {
        if (button.dataset.action === "rename") {
            const titleElement = selectedBookmark.querySelector(
                ".folderTitle, .bookmarkTitle"
            );

            const currentTitle = titleElement?.textContent?.trim() ?? "";
            const newTitle = prompt("Rename:", currentTitle);

            if (newTitle === null) return;

            const trimmedTitle = newTitle.trim();
            if (!trimmedTitle || trimmedTitle === currentTitle) return;

            await chrome.bookmarks.update(id, {
                title: trimmedTitle
            });
        }

        if (button.dataset.action === "remove") {
            const name =
                selectedBookmark.querySelector(
                    ".folderTitle, .bookmarkTitle"
                )?.textContent?.trim() || "this item";

            const message = type === "folder"
                ? `Remove the folder "${name}" and all its contents?`
                : `Remove the bookmark "${name}"?`;

            if (!confirm(message)) return;

            if (type === "folder") {
                await chrome.bookmarks.removeTree(id);
            } else {
                await chrome.bookmarks.remove(id);
            }
        }
    } catch (error) {
        console.error("Could not modify bookmark:", error);
        alert("Could not modify this bookmark. It may be protected or already removed.");
    }
});
