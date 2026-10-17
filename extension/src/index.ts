const textureUrl = chrome.runtime.getURL("images/texture.png");

document.documentElement.style.setProperty(
  "--tenebris-background",
  `url("${textureUrl}")`
);