// =============================================================================
// helpers.js
// Small, generic utility functions shared across the app, exposed on the
// global `Helpers` object (plain script, no import/export, so it can run
// directly from a file:// page).
// =============================================================================

var Helpers = (function () {

  /** Turns a page title into a URL-friendly slug. */
  function slugify(text) {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  /** Returns an ISO timestamp string for createdDate/updatedDate fields. */
  function nowISO() {
    return new Date().toISOString();
  }

  /** Formats an ISO date string into a short, human friendly string. */
  function formatDate(isoString) {
    if (!isoString) return "—";
    var d = new Date(isoString);
    if (isNaN(d.getTime())) return "—";
    return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
  }

  /** Debounces a function so it only runs after `delay` ms of silence. */
  function debounce(fn, delay) {
    delay = delay || 200;
    var timer = null;
    return function () {
      var args = arguments;
      clearTimeout(timer);
      timer = setTimeout(function () { fn.apply(null, args); }, delay);
    };
  }

  /** Escapes HTML special characters before inserting admin-entered text into the DOM. */
  function escapeHTML(str) {
    if (str === null || str === undefined) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  /** Generates a short random id (fallback only - Firebase push() keys are preferred). */
  function randomId(prefix) {
    prefix = prefix || "id";
    return prefix + "_" + Math.random().toString(36).slice(2, 10);
  }

  /** Reads a value from localStorage safely (used only for caching/theme prefs). */
  function cacheGet(key, fallback) {
    try {
      var raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : (fallback === undefined ? null : fallback);
    } catch (e) {
      return fallback === undefined ? null : fallback;
    }
  }

  /** Writes a value to localStorage safely (used only for caching/theme prefs). */
  function cacheSet(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) { /* ignore quota / privacy-mode errors */ }
  }

  /** Simple query-string reader, used for ?page=slug routing on index.html. */
  function getQueryParam(name) {
    return new URLSearchParams(window.location.search).get(name);
  }

  /** Readable label + Bootstrap Icon class for each button target type. */
  var TARGET_TYPES = {
    internal: { label: "Internal Page", icon: "bi-signpost-2" },
    external: { label: "External Link", icon: "bi-box-arrow-up-right" },
    whatsapp: { label: "WhatsApp", icon: "bi-whatsapp" },
    telephone: { label: "Telephone", icon: "bi-telephone" },
    email: { label: "Email", icon: "bi-envelope" },
    maps: { label: "Google Maps", icon: "bi-geo-alt" },
    file: { label: "Download File", icon: "bi-file-earmark-arrow-down" }
  };

  return {
    slugify: slugify,
    nowISO: nowISO,
    formatDate: formatDate,
    debounce: debounce,
    escapeHTML: escapeHTML,
    randomId: randomId,
    cacheGet: cacheGet,
    cacheSet: cacheSet,
    getQueryParam: getQueryParam,
    TARGET_TYPES: TARGET_TYPES
  };
})();
