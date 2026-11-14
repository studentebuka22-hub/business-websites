// =============================================================================
// ui.js
// Reusable UI building blocks: theme switching, the full-page loader, toast
// notifications, and the HTML renderers for button "tiles" and the
// breadcrumb trail. Exposed on the global `UI` object.
// =============================================================================

var UI = (function () {

  /* ----------------------------- THEME (light/dark) ------------------------ */

  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    Helpers.cacheSet("directory_theme", theme);
    var icon = document.querySelector("#themeToggleIcon");
    if (icon) icon.className = theme === "dark" ? "bi bi-sun" : "bi bi-moon-stars";
  }

  function getInitialTheme(defaultTheme) {
    return Helpers.cacheGet("directory_theme", defaultTheme || "light");
  }

  function initThemeToggle() {
    var btn = document.querySelector("#themeToggleBtn");
    if (!btn) return;
    btn.addEventListener("click", function () {
      var current = document.documentElement.getAttribute("data-theme") || "light";
      applyTheme(current === "dark" ? "light" : "dark");
    });
  }

  /* ----------------------------- LOADER -------------------------------------*/

  function hideLoader() {
    var el = document.querySelector("#pageLoader");
    if (el) el.classList.add("hidden");
  }

  function showLoader() {
    var el = document.querySelector("#pageLoader");
    if (el) el.classList.remove("hidden");
  }

  /* ----------------------------- TOASTS -------------------------------------*/

  function showToast(message, type) {
    type = type || "info";
    var stack = document.querySelector("#toastStack");
    if (!stack) {
      stack = document.createElement("div");
      stack.id = "toastStack";
      stack.className = "toast-stack";
      document.body.appendChild(stack);
    }
    var icons = { success: "bi-check-circle-fill", error: "bi-x-circle-fill", info: "bi-info-circle-fill" };
    var item = document.createElement("div");
    item.className = "toast-item " + type;
    item.innerHTML = '<i class="bi ' + (icons[type] || icons.info) + '"></i><span>' + Helpers.escapeHTML(message) + "</span>";
    stack.appendChild(item);
    setTimeout(function () {
      item.style.opacity = "0";
      item.style.transform = "translateY(8px)";
      item.style.transition = "all .25s ease";
      setTimeout(function () { item.remove(); }, 250);
    }, 3200);
  }

  /* ----------------------------- BREADCRUMB ---------------------------------*/

  function renderBreadcrumb(trail) {
    var el = document.querySelector("#crumbTrail");
    if (!el) return;
    el.innerHTML = trail.map(function (item, i) {
      var isLast = i === trail.length - 1;
      var sep = i > 0 ? '<i class="bi bi-chevron-right crumb-sep"></i>' : "";
      if (isLast) return sep + '<span class="crumb current">' + Helpers.escapeHTML(item.label) + "</span>";
      var href = item.slug ? "index.html?page=" + encodeURIComponent(item.slug) : "index.html";
      return sep + '<a class="crumb" href="' + href + '">' + Helpers.escapeHTML(item.label) + "</a>";
    }).join("");
  }

  /* ----------------------------- BUTTON TILES -------------------------------*/

  function resolveButtonTarget(button) {
    switch (button.type) {
      case "internal":
        return { href: "index.html?page=" + encodeURIComponent(button.target), external: false };
      case "external":
        return { href: button.target, external: true };
      case "whatsapp": {
        var digits = String(button.target).replace(/[^\d]/g, "");
        return { href: "https://wa.me/" + digits, external: true };
      }
      case "telephone":
        return { href: "tel:" + button.target, external: false };
      case "email":
        return { href: "mailto:" + button.target, external: false };
      case "maps":
        return { href: "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(button.target), external: true };
      case "file":
        return { href: button.target, external: true };
      default:
        return { href: "#", external: false };
    }
  }

  function renderTile(button) {
    var disabled = button.status === "disabled" || button.status === false;
    var resolved = resolveButtonTarget(button);
    var accent = button.backgroundColor || "#5B5FEF";
    var textColor = button.textColor || "#ffffff";
    var typeInfo = Helpers.TARGET_TYPES[button.type] || { label: button.type, icon: "bi-link-45deg" };
    var icon = button.icon || typeInfo.icon;

    var imageHTML = button.image
      ? '<img src="' + Helpers.escapeHTML(button.image) + '" class="tile-image" alt="' + Helpers.escapeHTML(button.title) + '">'
      : "";

    var inner =
      '<span class="tile-type-chip">' + Helpers.escapeHTML(typeInfo.label) + "</span>" +
      '<span class="tile-icon" style="background:' + accent + ";color:" + textColor + ';"><i class="bi ' + icon + '"></i></span>' +
      '<span class="tile-title">' + Helpers.escapeHTML(button.title) + "</span>" +
      (button.subtitle ? '<span class="tile-subtitle">' + Helpers.escapeHTML(button.subtitle) + "</span>" : "") +
      imageHTML;

    if (disabled) {
      return '<div class="tile tile-disabled" style="--tile-accent:' + accent + ';" title="Currently unavailable">' + inner + "</div>";
    }

    var targetAttr = resolved.external ? 'target="_blank" rel="noopener"' : "";
    return '<a class="tile" style="--tile-accent:' + accent + ';" href="' + Helpers.escapeHTML(resolved.href) + '" ' + targetAttr +
      ' data-button-id="' + Helpers.escapeHTML(button.id || "") + '">' + inner + "</a>";
  }

  function renderTileGrid(container, buttons) {
    if (!buttons || buttons.length === 0) {
      container.innerHTML =
        '<div class="empty-state"><i class="bi bi-inbox"></i><h4>Nothing here yet</h4><p>This page doesn\'t have any buttons yet.</p></div>';
      return;
    }
    container.className = "tiles-grid";
    container.innerHTML = buttons.map(renderTile).join("");
  }

  return {
    applyTheme: applyTheme,
    getInitialTheme: getInitialTheme,
    initThemeToggle: initThemeToggle,
    hideLoader: hideLoader,
    showLoader: showLoader,
    showToast: showToast,
    renderBreadcrumb: renderBreadcrumb,
    resolveButtonTarget: resolveButtonTarget,
    renderTile: renderTile,
    renderTileGrid: renderTileGrid
  };
})();
