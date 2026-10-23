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

    const url = node.url;
    const bookmark = document.createElement("div");
    bookmark.className = "bookmark";
    bookmark.dataset.bookmarkType = "bookmark";
    bookmark.dataset.id = node.id;
    const bookmarkIcon = getFaviconElement(node);
    const mainLink = document.createElement("a");
    mainLink.className = "bookmarkTitle";
    mainLink.href = url;
    mainLink.textContent = node.title;
    if (url.startsWith("file:///")) {
        mainLink.addEventListener("click", (event) => {
            event.preventDefault();
            chrome.tabs.update({ url });
        });
    }
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

export function loadAndApplyBookmarks() {
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