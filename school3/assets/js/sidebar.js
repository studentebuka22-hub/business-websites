/* ==========================================================
MathCloud Tutorial Academy
File: assets/js/sidebar.js
Production Ready
========================================================== */

const sidebar = document.querySelector(".sidebar");
const menuItems = document.querySelectorAll(".sidebarMenu li");
const menuLinks = document.querySelectorAll(".sidebarMenu a");

const toggleButton = document.getElementById("menuToggle");
const overlay = document.getElementById("sidebarOverlay");

/* ==========================================
INITIALIZE
========================================== */

document.addEventListener("DOMContentLoaded", () => {

    setActiveMenu();

    initializeSidebar();

    initializeResponsiveSidebar();

});

/* ==========================================
ACTIVE MENU
========================================== */

function setActiveMenu() {

    const currentPage = location.pathname
        .split("/")
        .pop()
        .toLowerCase();

    menuItems.forEach(item => item.classList.remove("active"));

    menuLinks.forEach(link => {

        const href =

(link.getAttribute("href") || "")

.replace("#","")

.split("/")

.pop()

.toLowerCase();

if(!href) return;

        if (href === currentPage) {

            link.parentElement.classList.add("active");

        }

    });

}

/* ==========================================
COLLAPSE
========================================== */

function initializeSidebar() {

    if (!toggleButton || !sidebar) return;

    toggleButton.addEventListener("click", () => {

        sidebar.classList.toggle("collapsed");

        localStorage.setItem(

            "sidebar",

            sidebar.classList.contains("collapsed")

                ? "collapsed"

                : "expanded"

        );

    });

    const state = localStorage.getItem("sidebar");

    if (state === "collapsed") {

        sidebar.classList.add("collapsed");

    }

}

/* ==========================================
MOBILE
========================================== */

function initializeResponsiveSidebar() {

    if (!toggleButton || !sidebar) return;

    toggleButton.addEventListener("click", () => {

        if (window.innerWidth <= 992) {

            sidebar.classList.toggle("show");

            if (overlay) {

                overlay.classList.toggle("show");

            }

        }

    });

    if (overlay) {

        overlay.addEventListener("click", () => {

            sidebar.classList.remove("show");

            overlay.classList.remove("show");

        });

    }

}

/* ==========================================
WINDOW RESIZE
========================================== */

window.addEventListener("resize", () => {

    if (window.innerWidth > 992) {

        sidebar.classList.remove("show");

        if (overlay) {

            overlay.classList.remove("show");

        }

    }

});

/* ==========================================
PUBLIC FUNCTIONS
========================================== */

export function openSidebar() {

    sidebar?.classList.add("show");

}

export function closeSidebar() {

    sidebar?.classList.remove("show");

}
/* ==========================================
LOGOUT
========================================== */

const logoutButton =

document.getElementById("logoutBtn");

if(logoutButton){

    logoutButton.addEventListener(

        "click",

        async(event)=>{

            event.preventDefault();

            const { logout } =

            await import(

            "../../firebase/auth.js"

            );

            await logout();

        }

    );

}

/* ==========================================
END OF FILE
========================================== */

