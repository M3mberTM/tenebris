const textureUrl = chrome.runtime.getURL("images/texture.png");

function applyBackground() {
	document.body.style.setProperty("background-image", `url("${textureUrl}")`, "important");

	document.body.style.setProperty("background-size", "cover", "important");
	document.body.style.setProperty("background-position", "center", "important");
	document.body.style.setProperty("background-attachment", "fixed", "important");
}

if (document.body) {
	applyBackground();
} else {
	document.addEventListener("DOMContentLoaded", applyBackground);
}
