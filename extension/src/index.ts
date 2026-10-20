function renderBookmarks(nodes: chrome.bookmarks.BookmarkTreeNode[], container: HTMLElement) {
    console.log("Nodes ", nodes);
	for (const node of nodes) {
		// Folder: show its name and its children
		if (!node.url) {
			const folder = document.createElement("details");
			const title = document.createElement("summary");
			const children = document.createElement("div");

			title.textContent = node.title || "Bookmarks";
			children.className = "bookmark-folder";

			folder.appendChild(title);
			folder.appendChild(children);
			container.appendChild(folder);

			renderBookmarks(node.children || [], children);
			continue;
		}

		// Bookmark: create a clickable link
        const link = document.createElement("a");
        link.className = "bookmark-link";
        link.href = node.url;
        link.title = node.url;

        // Website favicon
        const favicon = document.createElement("img");
        favicon.className = "bookmark-favicon";
        favicon.alt = "";
        const faviconUrl = new URL(
            chrome.runtime.getURL("/_favicon/")
        );

        console.log(faviconUrl);

        faviconUrl.searchParams.set("pageUrl", node.url);
        faviconUrl.searchParams.set("size", "32");

        favicon.src = faviconUrl.toString();

        favicon.addEventListener("error", () => {
        favicon.style.visibility = "hidden";
        });

        const title = document.createElement("span");
        title.className = "bookmark-name";
        title.textContent = node.title || node.url;

        link.append(favicon, title);
        container.appendChild(link);

	}
}

function getBookmarkBarMarks(tree: chrome.bookmarks.BookmarkTreeNode[]) {
    const children = tree[0].children || [];
    const marks = children.find((node) => node.folderType === "bookmarks-bar" || node.title == "Bookmarks bar");
    console.log("Marks ", marks);
    if (!marks) {
        return [];
    }
    return marks.children || [];
}

function loadAndApplyBookmarks() {
	const bookmarkList = document.getElementById("bookmarksList");
	if (!bookmarkList) {
		throw new Error("bookmarkList not found");
	}
	chrome.bookmarks.getTree((tree) => {
        console.log("Tree ", tree);
		bookmarkList.replaceChildren();
        const bookmarks = getBookmarkBarMarks(tree);
		renderBookmarks(bookmarks, bookmarkList);
	});
}


// document.addEventListener("DOMContentLoaded", loadAndApplyBookmarks);