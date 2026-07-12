const PAGE_LOADER_SELECTOR = "[data-page-loader]";
const PAGE_LOADER_HIDDEN_CLASS = "is-hidden";
const PAGE_LOADING_CLASS = "is-page-loading";
const PAGE_LOADER_FADE_DURATION = 220;
const PAGE_LOADER_FALLBACK_TIMEOUT = 12000;
let pageLoaderFallbackTimer = 0;

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
  window.clearTimeout(pageLoaderFallbackTimer);

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

function handoffPageLoader(message) {
  const loader = getPageLoader();
  const textNode = loader?.querySelector(".page-loader-text");

  if (textNode && message) {
    textNode.textContent = message;
  }

  hidePageLoader();
}

function markImageState(frameNode, state) {
  if (!frameNode) {
    return;
  }

  frameNode.dataset.imageState = state;
}

function mountManagedImage({
  imageNode,
  frameNode,
  src,
  alt = "",
  fallbackSrc = "",
  loading = "lazy",
  decoding = "async",
  defer = true
}) {
  if (!imageNode) {
    return;
  }

  const resolvedFrameNode = frameNode || imageNode.parentElement;
  let fallbackApplied = false;
  let settled = false;

  imageNode.alt = alt;
  imageNode.loading = loading;
  imageNode.decoding = decoding;
  imageNode.classList.remove("is-loaded");
  imageNode.removeAttribute("data-image-state");
  markImageState(resolvedFrameNode, "loading");

  const markLoaded = () => {
    if (settled) {
      return;
    }

    settled = true;
    imageNode.classList.add("is-loaded");
    imageNode.dataset.imageState = "loaded";
    markImageState(resolvedFrameNode, "loaded");
  };

  const markError = () => {
    settled = true;
    imageNode.classList.add("is-loaded");
    imageNode.dataset.imageState = "error";
    markImageState(resolvedFrameNode, "error");
  };

  imageNode.onload = () => {
    markLoaded();
  };

  imageNode.onerror = () => {
    if (fallbackSrc && !fallbackApplied) {
      fallbackApplied = true;
      settled = false;
      imageNode.src = fallbackSrc;
      return;
    }

    markError();
  };

  const assignSource = () => {
    imageNode.src = src || fallbackSrc || "";

    if (imageNode.complete) {
      if (imageNode.naturalWidth > 0) {
        markLoaded();
        return;
      }

      imageNode.onerror?.();
    }
  };

  if (defer) {
    window.requestAnimationFrame(assignSource);
    return;
  }

  assignSource();
}

function createSkeletonLine(className) {
  const line = document.createElement("span");
  line.className = className;
  return line;
}

function createBookCardSkeleton({ showDescription = false, showMeta = true } = {}) {
  const article = document.createElement("article");
  article.className = "book-card book-card--skeleton";

  const surface = document.createElement("div");
  surface.className = "book-card-surface";
  surface.setAttribute("aria-hidden", "true");

  const media = document.createElement("div");
  media.className = "book-media";
  media.dataset.imageState = "loading";

  const content = document.createElement("div");
  content.className = "book-card-content";

  content.appendChild(createSkeletonLine("skeleton-block skeleton-line skeleton-line--title"));
  content.appendChild(createSkeletonLine("skeleton-block skeleton-line skeleton-line--subtitle"));

  if (showDescription) {
    content.appendChild(createSkeletonLine("skeleton-block skeleton-line skeleton-line--description"));
  }

  if (showMeta) {
    content.appendChild(createSkeletonLine("skeleton-block skeleton-line skeleton-line--meta"));
  }

  surface.append(media, content);
  article.appendChild(surface);
  return article;
}

function renderBookCardSkeletons(containerNode, count, options = {}) {
  if (!containerNode) {
    return;
  }

  const itemCount = Math.max(1, Number(count) || 0);
  containerNode.replaceChildren();

  for (let index = 0; index < itemCount; index += 1) {
    containerNode.appendChild(createBookCardSkeleton(options));
  }
}

window.BiaCungPageLoader = {
  show: showPageLoader,
  hide: hidePageLoader,
  handoff: handoffPageLoader
};

window.BiaCungImageLoader = {
  mount: mountManagedImage
};

window.BiaCungSkeleton = {
  createBookCard: createBookCardSkeleton,
  renderBookCardGrid: renderBookCardSkeletons
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    showPageLoader();
  }, { once: true });
} else {
  showPageLoader();
}

pageLoaderFallbackTimer = window.setTimeout(() => {
  hidePageLoader();
}, PAGE_LOADER_FALLBACK_TIMEOUT);
