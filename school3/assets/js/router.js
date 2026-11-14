/* ========================================= */
/* assets/js/router.js */
/* ========================================= */

const PUBLIC_PAGES = [
    "/",
    "/index.html",
    "/login.html",
    "/forgot-password.html",
    "/404.html"
];

document.addEventListener("DOMContentLoaded", () => {

    initializeRouter();

});

/* ========================================= */
/* Initialize Router */
/* ========================================= */

function initializeRouter() {

    highlightActiveMenu();

    protectCurrentPage();

}

/* ========================================= */
/* Highlight Active Navigation */
/* ========================================= */

function highlightActiveMenu() {

    const currentPage = window.location.pathname.split("/").pop() || "index.html";

    document.querySelectorAll(".navMenu a").forEach(link => {

        const href = link.getAttribute("href");

        if (!href) return;

        if (href.endsWith(currentPage)) {

            link.classList.add("active");

        }

    });

}

/* ========================================= */
/* Page Protection */
/* ========================================= */

function protectCurrentPage(){

    const path=

    window.location.pathname;

    const isPublic=

    PUBLIC_PAGES.some(

        page=>path.endsWith(page)

    );

    if(isPublic) return;

    const session=

    getSession();

    if(!session){

        window.location.replace(

        "../../login.html"

        );

        return;

    }

    if(

        session.role===

        "super_admin"

    ){

        return;

    }

}

/* ========================================= */
/* Navigation */
/* ========================================= */

export function navigate(page) {

    window.location.href = page;

}

/* ========================================= */
/* Logout */
/* ========================================= */

export function logout() {

    sessionStorage.removeItem("mta-session");

    localStorage.removeItem("rememberLogin");

    window.location.replace("../../login.html");

}

/* ========================================= */
/* Session */
/* ========================================= */

export function saveSession(user) {

    sessionStorage.setItem(

        "mta-session",

        JSON.stringify(user)

    );

}

export function getSession() {

    const data = sessionStorage.getItem("mta-session");

    return data ? JSON.parse(data) : null;

}

export function isAuthenticated() {

    return getSession() !== null;

}

/* ========================================= */
/* Role Redirect */
/* ========================================= */

export function redirectByRole(role) {

    switch (role) {

        case "super_admin":

            navigate("pages/super-admin/dashboard.html");

            break;

        case "admin":

    navigate("pages/super-admin/dashboard.html");

    break;

        default:

            logout();

    }

}

/* ========================================= */
/* END OF router.js */
/* ========================================= */

