/* ========================================= */
/* assets/js/theme.js */
/* ========================================= */

const STORAGE_KEY = "mta-theme";

document.addEventListener("DOMContentLoaded", () => {

    initializeTheme();

});

/* ========================================= */
/* Initialize Theme */
/* ========================================= */

function initializeTheme() {

    const toggleButton = document.getElementById("themeToggle");

    const savedTheme = localStorage.getItem(STORAGE_KEY);

    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

    const theme = savedTheme || (prefersDark ? "dark" : "light");

    applyTheme(theme);

    if (!toggleButton) return;

    toggleButton.addEventListener("click", toggleTheme);

}

/* ========================================= */
/* Toggle Theme */
/* ========================================= */

function toggleTheme() {

    const currentTheme = document.documentElement.getAttribute("data-theme") || "light";

    const newTheme = currentTheme === "light" ? "dark" : "light";

    applyTheme(newTheme);

}

/* ========================================= */
/* Apply Theme */
/* ========================================= */

function applyTheme(theme) {

    document.documentElement.setAttribute("data-theme", theme);

    localStorage.setItem(STORAGE_KEY, theme);

    updateThemeIcon(theme);

    updateThemeColor(theme);

}

/* ========================================= */
/* Update Theme Icon */
/* ========================================= */

function updateThemeIcon(theme) {

    const icon = document.querySelector("#themeToggle i");

    if (!icon) return;

    icon.className = theme === "dark"
        ? "fa-solid fa-sun"
        : "fa-solid fa-moon";

}

/* ========================================= */
/* Update Browser Theme */
/* ========================================= */

function updateThemeColor(theme) {

    const meta = document.querySelector('meta[name="theme-color"]');

    if (!meta) return;

    meta.setAttribute(

        "content",

        theme === "dark"
            ? "#0F172A"
            : "#0D6EFD"

    );

}

/* ========================================= */
/* Listen For System Theme Changes */
/* ========================================= */

window.matchMedia("(prefers-color-scheme: dark)")
.addEventListener("change", event => {

    if (localStorage.getItem(STORAGE_KEY)) return;

    applyTheme(event.matches ? "dark" : "light");

});

/* ========================================= */
/* Public Functions */
/* ========================================= */

export function setDarkMode() {

    applyTheme("dark");

}

export function setLightMode() {

    applyTheme("light");

}

export function getCurrentTheme() {

    return document.documentElement.getAttribute("data-theme") || "light";

}

/* ========================================= */
/* END OF theme.js */
/* ========================================= */

