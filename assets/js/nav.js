const MOBILE_NAV_QUERY = window.matchMedia("(max-width: 62rem)");

function setExpanded(element, expanded) {
  element?.setAttribute("aria-expanded", expanded ? "true" : "false");
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
