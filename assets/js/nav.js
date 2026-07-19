const MOBILE_NAV_QUERY = window.matchMedia("(max-width: 62rem)");

function setExpanded(element, expanded) {
  element?.setAttribute("aria-expanded", expanded ? "true" : "false");
}

function normalizeText(value) {
  return value == null ? "" : String(value).trim();
}

function normalizeSearchValue(value) {
  return normalizeText(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[đĐ]/g, "d")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
}

function normalizePathname(pathname) {
  const normalized = normalizeText(pathname);
  if (!normalized || normalized === "/") {
    return "/";
  }

  return normalized.replace(/\/+$/, "") || "/";
}

function isSameRoute(linkUrl, currentUrl) {
  if (linkUrl.hash && !linkUrl.search) {
    return (
      normalizePathname(linkUrl.pathname) === normalizePathname(currentUrl.pathname) &&
      linkUrl.hash === currentUrl.hash
    );
  }

  if (normalizePathname(linkUrl.pathname) !== normalizePathname(currentUrl.pathname)) {
    return false;
  }

  if (normalizePathname(currentUrl.pathname) === "/search.html") {
    const linkQuery = normalizeSearchValue(linkUrl.searchParams.get("q"));
    const currentQuery = normalizeSearchValue(currentUrl.searchParams.get("q"));
    return Boolean(linkQuery) && linkQuery === currentQuery;
  }

  if (linkUrl.search) {
    return linkUrl.search === currentUrl.search;
  }

  return true;
}

function applyActiveNavState(siteNav, navItems) {
  const currentUrl = new URL(window.location.href);
  const navLinks = Array.from(siteNav.querySelectorAll("a[href]"));

  navLinks.forEach((link) => {
    const href = normalizeText(link.getAttribute("href"));
    if (!href || href === "#") {
      return;
    }

    let isActive = false;
    try {
      isActive = isSameRoute(new URL(href, currentUrl.origin), currentUrl);
    } catch (error) {
      isActive = false;
    }

    link.classList.toggle("is-active", isActive);
    if (isActive) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  });

  navItems.forEach((item) => {
    const hasActiveDescendant = Boolean(item.querySelector(".submenu a.is-active"));
    item.classList.toggle("has-active-descendant", hasActiveDescendant);
  });
}

function syncFooterYear() {
  const yearNodes = document.querySelectorAll("[data-current-year]");
  if (!yearNodes.length) {
    return;
  }

  const currentYear = String(new Date().getFullYear());
  yearNodes.forEach((node) => {
    node.textContent = currentYear;
  });
}

function closeSubmenu(item) {
  item.classList.remove("is-open");
  setExpanded(item.querySelector(".submenu-toggle"), false);
}

function closeAllSubmenus(items) {
  items.forEach(closeSubmenu);
}

function toggleSubmenu(item, navItems) {
  const submenuToggle = item.querySelector(".submenu-toggle");
  const shouldOpen = !item.classList.contains("is-open");
  closeAllSubmenus(navItems);
  item.classList.toggle("is-open", shouldOpen);
  setExpanded(submenuToggle, shouldOpen);
}

function closeMenu(header, menuButton, navItems) {
  header.classList.remove("is-nav-open");
  setExpanded(menuButton, false);
  closeAllSubmenus(navItems);
}

function main() {
  syncFooterYear();

  const header = document.querySelector(".site-header");
  const menuButton = document.querySelector(".menu-button");
  const siteNav = document.querySelector(".site-nav");
  const navItems = Array.from(document.querySelectorAll(".nav-item.has-submenu"));

  if (!header || !menuButton || !siteNav) {
    return;
  }

  applyActiveNavState(siteNav, navItems);

  menuButton.addEventListener("click", () => {
    const shouldOpen = !header.classList.contains("is-nav-open");
    header.classList.toggle("is-nav-open", shouldOpen);
    setExpanded(menuButton, shouldOpen);

    if (!shouldOpen) {
      closeAllSubmenus(navItems);
    }
  });

  navItems.forEach((item) => {
    const navLinkRow = item.querySelector(".nav-link-row");
    const navLink = item.querySelector(".nav-link");
    const submenuToggle = item.querySelector(".submenu-toggle");
    if (!navLinkRow || !navLink || !submenuToggle) {
      return;
    }

    navLinkRow.addEventListener("click", (event) => {
      const clickedTrigger = event.target.closest(".nav-link, .submenu-toggle");
      if (!clickedTrigger) {
        return;
      }

      if (navLink.getAttribute("href") === "#") {
        event.preventDefault();
      }

      if (!MOBILE_NAV_QUERY.matches) {
        return;
      }

      toggleSubmenu(item, navItems);
    });
  });

  siteNav.addEventListener("click", (event) => {
    if (!MOBILE_NAV_QUERY.matches) {
      return;
    }

    const clickedLink = event.target.closest("a");
    if (!clickedLink) {
      return;
    }

    const isSubmenuTrigger =
      clickedLink.classList.contains("nav-link") &&
      clickedLink.closest(".nav-item.has-submenu") &&
      clickedLink.getAttribute("href") === "#";

    if (isSubmenuTrigger) {
      return;
    }

    closeMenu(header, menuButton, navItems);
  });

  document.addEventListener("click", (event) => {
    if (!MOBILE_NAV_QUERY.matches) {
      return;
    }

    if (!event.target.closest(".site-header")) {
      closeMenu(header, menuButton, navItems);
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") {
      return;
    }

    closeMenu(header, menuButton, navItems);
    menuButton.focus();
  });

  MOBILE_NAV_QUERY.addEventListener("change", (event) => {
    if (!event.matches) {
      closeMenu(header, menuButton, navItems);
      return;
    }

    header.classList.remove("is-nav-open");
    setExpanded(menuButton, false);
    closeAllSubmenus(navItems);
  });

}

main();
