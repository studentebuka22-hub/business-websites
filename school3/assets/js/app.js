/* ========================================= */
/* assets/js/app.js */
/* PART 1 */
/* ========================================= */

document.addEventListener("DOMContentLoaded", () => {

    initializeApp();

});

function initializeApp() {

    initializeMobileMenu();

    initializeHeroSlider();

    initializeCounterAnimation();

    initializeScrollAnimation();

    initializeSmoothScroll();

    initializeBackToTop();

    initializeGalleryEffects();

    initializeNavbar();

}

/* ========================================= */
/* Mobile Menu */
/* ========================================= */

function initializeMobileMenu() {

    const menuButton = document.querySelector(".mobileMenu");

    const navMenu = document.querySelector(".navMenu");

    if (!menuButton || !navMenu) return;

    menuButton.addEventListener("click", () => {

        navMenu.classList.toggle("active");

    });

    document.querySelectorAll(".navMenu a").forEach(link => {

        link.addEventListener("click", () => {

            navMenu.classList.remove("active");

        });

    });

}

/* ========================================= */
/* Sticky Navbar */
/* ========================================= */

function initializeNavbar() {

    const header = document.querySelector("header");

    if (!header) return;

    window.addEventListener("scroll", () => {

        if (window.scrollY > 80) {

            header.style.boxShadow = "0 10px 30px rgba(0,0,0,.10)";

        } else {

            header.style.boxShadow = "none";

        }

    });

}

/* ========================================= */
/* Hero Slider */
/* ========================================= */

function initializeHeroSlider() {

    const slides = document.querySelectorAll(".heroSlider img");

    if (!slides.length) return;

    let current = 0;

    setInterval(() => {

        slides[current].classList.remove("active");

        current++;

        if (current >= slides.length) {

            current = 0;

        }

        slides[current].classList.add("active");

    }, 5000);

}

/* ========================================= */
/* Statistics Counter */
/* ========================================= */

function initializeCounterAnimation() {

    const counters = document.querySelectorAll(".statCard h2");

    if (!counters.length) return;

    counters.forEach(counter => {

        const value = parseInt(counter.innerText);

        if (isNaN(value)) return;

        let start = 0;

        const speed = Math.ceil(value / 100);

        const update = () => {

            start += speed;

            if (start >= value) {

                counter.innerText = value + "+";

                return;

            }

            counter.innerText = start + "+";

            requestAnimationFrame(update);

        };

        update();

    });

}

/* ========================================= */
/* assets/js/app.js */
/* PART 2 */
/* Continue below PART 1 */
/* ========================================= */

/* ========================================= */
/* Scroll Animation */
/* ========================================= */

function initializeScrollAnimation() {

    const elements = document.querySelectorAll(

        ".sectionTitle," +
        ".statCard," +
        ".facilityCard," +
        ".academicCard," +
        ".newsCard," +
        ".eventCard," +
        ".testimonialCard," +
        ".contactCard," +
        ".principalSection"

    );

    if (!elements.length) return;

    const observer = new IntersectionObserver((entries) => {

        entries.forEach(entry => {

            if (entry.isIntersecting) {

                entry.target.classList.add("fade-up");

                observer.unobserve(entry.target);

            }

        });

    }, {

        threshold:0.15

    });

    elements.forEach(element => {

        observer.observe(element);

    });

}

/* ========================================= */
/* Smooth Scroll */
/* ========================================= */

function initializeSmoothScroll() {

    document.querySelectorAll('a[href^="#"]').forEach(link => {

        link.addEventListener("click", e => {

            const target = document.querySelector(link.getAttribute("href"));

            if (!target) return;

            e.preventDefault();

            target.scrollIntoView({

                behavior:"smooth",

                block:"start"

            });

        });

    });

}

/* ========================================= */
/* Gallery Hover Effect */
/* ========================================= */

function initializeGalleryEffects() {

    const gallery = document.querySelectorAll(".galleryGrid img");

    if (!gallery.length) return;

    gallery.forEach(image => {

        image.addEventListener("mouseenter", () => {

            image.style.transform = "scale(1.06)";

        });

        image.addEventListener("mouseleave", () => {

            image.style.transform = "";

        });

    });

}

/* ========================================= */
/* Back To Top Button */
/* ========================================= */

function initializeBackToTop() {

    const button = document.createElement("button");

    button.id = "backToTop";

    button.innerHTML = '<i class="fa-solid fa-arrow-up"></i>';

    document.body.appendChild(button);

    Object.assign(button.style,{

        position:"fixed",

        right:"25px",

        bottom:"105px",

        width:"55px",

        height:"55px",

        borderRadius:"50%",

        background:"var(--primary)",

        color:"#fff",

        display:"none",

        justifyContent:"center",

        alignItems:"center",

        fontSize:"20px",

        boxShadow:"0 12px 30px rgba(0,0,0,.20)",

        cursor:"pointer",

        zIndex:"999"

    });

    window.addEventListener("scroll",()=>{

        button.style.display =

        window.scrollY > 500

        ? "flex"

        : "none";

    });

    button.addEventListener("click",()=>{

        window.scrollTo({

            top:0,

            behavior:"smooth"

        });

    });

}

/* ========================================= */
/* END OF app.js */
/* ========================================= */

