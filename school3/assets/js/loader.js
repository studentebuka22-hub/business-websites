/* =========================================
   assets/js/loader.js
========================================= */

document.addEventListener("DOMContentLoaded", () => {

    const preloader = document.getElementById("preloader");

    if (!preloader) return;

    document.body.style.overflow = "hidden";

    window.addEventListener("load", () => {

        setTimeout(() => {

            preloader.style.opacity = "0";
            preloader.style.visibility = "hidden";
            preloader.style.pointerEvents = "none";
            preloader.style.transition = "all .5s ease";

            document.body.style.overflow = "auto";

            setTimeout(() => {

                preloader.remove();

            }, 500);

        }, 2000);

    });

});

/* =========================================
   Loader Functions
========================================= */

export function showLoader() {

    const preloader = document.getElementById("preloader");

    if (!preloader) return;

    preloader.style.display = "flex";
    preloader.style.opacity = "1";
    preloader.style.visibility = "visible";
    preloader.style.pointerEvents = "auto";

    document.body.style.overflow = "hidden";

}

export function hideLoader() {

    const preloader = document.getElementById("preloader");

    if (!preloader) return;

    preloader.style.opacity = "0";
    preloader.style.visibility = "hidden";
    preloader.style.pointerEvents = "none";

    document.body.style.overflow = "auto";

    setTimeout(() => {

        preloader.remove();

    }, 500);

}