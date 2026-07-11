const PAGE_LOADER_SELECTOR = "[data-page-loader]";
const PAGE_LOADER_HIDDEN_CLASS = "is-hidden";
const PAGE_LOADING_CLASS = "is-page-loading";
const PAGE_LOADER_FADE_DURATION = 220;
const PAGE_LOADER_FALLBACK_TIMEOUT = 12000;

function createPageLoader() {
  const loader = document.createElement("div");
  loader.className = "page-loader";
  loader.dataset.pageLoader = "true";
  loader.setAttribute("role", "status");
  loader.setAttribute("aria-live", "polite");

  const media = document.createElement("div");
  media.className = "page-loader-media";

  const image = document.createElement("img");
  image.className = "page-loader-image";
  image.src = "assets/img/core/loader.gif";
  image.alt = "Đang tải";
  image.width = 96;
  image.height = 96;
  image.decoding = "async";

  const text = document.createElement("p");
  text.className = "page-loader-text";
  text.textContent = "Đang tải dữ liệu...";

  media.appendChild(image);
  loader.append(media, text);
  return loader;
}

function getPageLoader() {
  return document.querySelector(PAGE_LOADER_SELECTOR);
}

function ensurePageLoader() {
  const existingLoader = getPageLoader();
  if (existingLoader) {
    return existingLoader;
  }

  const loader = createPageLoader();
  document.body.appendChild(loader);
  return loader;
}

function showPageLoader(message) {
  if (!document.body) {
    return;
  }

  const loader = ensurePageLoader();
  const textNode = loader.querySelector(".page-loader-text");

  if (textNode && message) {
    textNode.textContent = message;
  }

  loader.hidden = false;
  loader.classList.remove(PAGE_LOADER_HIDDEN_CLASS);
  document.body.classList.add(PAGE_LOADING_CLASS);
  document.body.setAttribute("aria-busy", "true");
}

function hidePageLoader() {
  const loader = getPageLoader();
  if (!loader) {
    document.body?.classList.remove(PAGE_LOADING_CLASS);
    document.body?.removeAttribute("aria-busy");
    return;
  }

  loader.classList.add(PAGE_LOADER_HIDDEN_CLASS);
  document.body?.classList.remove(PAGE_LOADING_CLASS);
  document.body?.removeAttribute("aria-busy");

  window.setTimeout(() => {
    loader.hidden = true;
  }, PAGE_LOADER_FADE_DURATION);
}

window.BiaCungPageLoader = {
  show: showPageLoader,
  hide: hidePageLoader
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    showPageLoader();
  }, { once: true });
} else {
  showPageLoader();
}

window.setTimeout(() => {
  hidePageLoader();
}, PAGE_LOADER_FALLBACK_TIMEOUT);
