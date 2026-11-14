/* ==========================================================
   MathCloud Tutorial Academy
   File: firebase/setup.js
   One-Time Super Admin Installer
   ========================================================== */

import {
    auth,
    database
} from "./firebase-config.js";

import {
    createUserWithEmailAndPassword,
    updateProfile
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";

import {
    ref,
    get,
    set
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-database.js";

/* ==========================================================
   ELEMENTS
   ========================================================== */

const form = document.getElementById("setupForm");

const fullName = document.getElementById("name");

const email = document.getElementById("email");

const password = document.getElementById("password");

const confirmPassword = document.getElementById("confirmPassword");

const createButton = document.getElementById("createAccount");

const status = document.getElementById("status");

const togglePassword = document.getElementById("togglePassword");

const toggleConfirm = document.getElementById("toggleConfirm");

/* ==========================================================
   PASSWORD TOGGLE
   ========================================================== */

togglePassword.addEventListener("click", () => {

    password.type = password.type === "password"
        ? "text"
        : "password";

    togglePassword.innerHTML =
        password.type === "password"
            ? '<i class="fa-solid fa-eye"></i>'
            : '<i class="fa-solid fa-eye-slash"></i>';

});

toggleConfirm.addEventListener("click", () => {

    confirmPassword.type = confirmPassword.type === "password"
        ? "text"
        : "password";

    toggleConfirm.innerHTML =
        confirmPassword.type === "password"
            ? '<i class="fa-solid fa-eye"></i>'
            : '<i class="fa-solid fa-eye-slash"></i>';

});

/* ==========================================================
   CHECK IF SYSTEM ALREADY INSTALLED
   ========================================================== */

async function checkInstallation() {

    try {

        const snapshot = await get(

            ref(database, "system/initialized")

        );

        if (snapshot.exists() && snapshot.val() === true) {

            window.location.replace("login.html");

        }

    }

    catch (error) {

        console.error(error);

    }

}

checkInstallation();

/* ==========================================================
   CREATE SUPER ADMIN
   ========================================================== */

form.addEventListener("submit", async (e) => {

    e.preventDefault();

    createButton.disabled = true;

    createButton.innerHTML = `
        <i class="fa-solid fa-spinner fa-spin"></i>
        Creating...
    `;

    status.style.color = "#0D6EFD";

    status.textContent = "Creating Super Admin...";

    const name = fullName.value.trim();

    const mail = email.value.trim();

    const pass = password.value;

    const confirm = confirmPassword.value;

    if (!name) {

        status.style.color = "red";

        status.textContent = "Enter full name.";

        resetButton();

        return;

    }

    if (pass.length < 6) {

        status.style.color = "red";

        status.textContent = "Password must be at least 6 characters.";

        resetButton();

        return;

    }

    if (pass !== confirm) {

        status.style.color = "red";

        status.textContent = "Passwords do not match.";

        resetButton();

        return;

    }

    try {

        const installed = await get(

            ref(database, "system/initialized")

        );

        if (installed.exists() && installed.val() === true) {

            alert("System has already been installed.");

            window.location.replace("login.html");

            return;

        }

        const credential = await createUserWithEmailAndPassword(

            auth,

            mail,

            pass

        );

        const user = credential.user;

        await updateProfile(user, {

            displayName: name

        });

        const userData = {

            uid: user.uid,

            name: name,

            email: mail,

            role: "super_admin",

            status: "active",

            photo: "",

            phone: "",

            gender: "",

            address: "",

            permissions: {

                fullAccess: true

            },

            createdBy: "System",

            createdAt: Date.now(),

            updatedAt: Date.now(),

            lastLogin: "",

            lastLogout: ""

        };

        await set(

            ref(database, "users/" + user.uid),

            userData

        );

        await set(

            ref(database, "superAdmins/" + user.uid),

            userData

        );

        await set(

            ref(database, "admins/" + user.uid),

            userData

        );

        await set(

            ref(database, "system/initialized"),

            true

        );

        await set(

            ref(database, "system/info"),

            {

                installed: true,

                installedAt: Date.now(),

                installedBy: user.uid,

                schoolName: "MathCloud Tutorial Academy",

                version: "1.0.0"

            }

        );

        status.style.color = "green";

        status.textContent = "Super Admin created successfully.";

        setTimeout(() => {

            window.location.replace("login.html");

        }, 1500);

    }

    catch (error) {

        console.error(error);

        status.style.color = "red";

        status.textContent = error.message;

        resetButton();

    }

});

/* ==========================================================
   RESET BUTTON
   ========================================================== */

function resetButton() {

    createButton.disabled = false;

    createButton.innerHTML = `
        <i class="fa-solid fa-user-shield"></i>
        Create Super Admin
    `;

}

/* ==========================================================
   END OF FILE
   ========================================================== */