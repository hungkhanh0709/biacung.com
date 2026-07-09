(function () {
  const SITE_URL = "https://biacung.com/";
  const FALLBACK_IMAGE = "https://biacung.com/assets/img/favicon/android-chrome-512x512.png";

  function normalizeText(value) {
    return value == null ? "" : String(value).trim();
  }

  function toAbsoluteUrl(value) {
    const normalized = normalizeText(value);
    if (!normalized) {
      return "";
    }

    try {
      return new URL(normalized, SITE_URL).toString();
    } catch (error) {
      return "";
    }
  }

  function setMeta(selector, content) {
    const node = document.querySelector(selector);
    if (node) {
      node.setAttribute("content", normalizeText(content));
    }
  }

  function setCanonical(href) {
    const node = document.querySelector('link[rel="canonical"]');
    const absoluteUrl = toAbsoluteUrl(href);
    if (node && absoluteUrl) {
      node.setAttribute("href", absoluteUrl);
    }
  }

  function setStructuredData(id, payload) {
    const node = document.getElementById(id);
    if (!node) {
      return;
    }

    node.textContent = JSON.stringify(payload, null, 2);
  }

  window.BiaCungSEO = {
    SITE_URL,
    FALLBACK_IMAGE,
    normalizeText,
    toAbsoluteUrl,
    setCanonical,
    setStructuredData,
    setMetaByName(name, content) {
      setMeta(`meta[name="${name}"]`, content);
    },
    setMetaByProperty(name, content) {
      setMeta(`meta[property="${name}"]`, content);
    }
  };
})();
