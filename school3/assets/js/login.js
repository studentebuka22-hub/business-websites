/* ==========================================================
MathCloud Tutorial Academy Management System
File: assets/js/login.js
Production Ready
========================================================== */

import {

login

} from "../../firebase/auth.js";

document.addEventListener(

    "DOMContentLoaded",

    initializeLogin

);

/* ==========================================
INITIALIZE
========================================== */

function initializeLogin(){

    const form=

    document.getElementById(

        "loginForm"

    );

    if(!form) return;

    form.addEventListener(

        "submit",

        handleLogin

    );

}

/* ==========================================
LOGIN
========================================== */

async function handleLogin(event){

    event.preventDefault();

    const email=

    document

    .getElementById("email")

    .value

    .trim();

    const password=

    document

    .getElementById("password")

    .value;

    const remember=

    document

    .getElementById("rememberMe")

    ?.checked ?? true;

    const button=

    document.querySelector(

        "#loginForm button[type='submit']"

    );

    if(button){

        button.disabled=true;

        button.innerHTML=

        "Signing In...";

    }

    try{

        const result=

        await login(

            email,

            password,

            remember

        );

        if(!result.success){

            alert(

                result.message ||

                "Login failed."

            );

            restoreButton(button);

            return;

        }

        const role=

        result.profile?.role ||

        "super_admin";

        switch(role){

            case "super_admin":

                window.location.replace(

                "pages/super-admin/dashboard.html"

                );

                break;

            case "admin":

                window.location.replace(

                "pages/super-admin/dashboard.html"

                );

                break;

            case "teacher":

                window.location.replace(

                "pages/teacher/dashboard.html"

                );

                break;

            case "parent":

                window.location.replace(

                "pages/parent/dashboard.html"

                );

                break;

            case "student":

                window.location.replace(

                "pages/student/dashboard.html"

                );

                break;

            default:

                alert(

                "Account role is invalid."

                );

                restoreButton(button);

        }

    }

    catch(error){

        console.error(error);

        alert(

        "Unable to login."

        );

        restoreButton(button);

    }

}

/* ==========================================
BUTTON
========================================== */

function restoreButton(button){

    if(!button) return;

    button.disabled=false;

    button.innerHTML=

    "Login";

}

/* ==========================================
END OF FILE
========================================== */

