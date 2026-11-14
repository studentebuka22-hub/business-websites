/* ==========================================================
MathCloud Tutorial Academy
File: assets/js/edit-user.js
Production Ready
========================================================== */

import { db } from "../../firebase/firebase-config.js";

import {
    ref,
    get,
    update
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-database.js";

/* ==========================================
INITIALIZE
========================================== */

document.addEventListener("DOMContentLoaded", () => {

    initializeEditUser();

});

async function initializeEditUser() {

    const params = new URLSearchParams(window.location.search);

    const uid = params.get("uid");

    if (!uid) {

        alert("User ID not found.");

        window.location.href = "users.html";

        return;

    }

    await loadUser(uid);

    initializeForm(uid);

}

/* ==========================================
LOAD USER
========================================== */

async function loadUser(uid) {

    try {

        const snapshot = await get(ref(db, "users/" + uid));

        if (!snapshot.exists()) {

            alert("User not found.");

            return;

        }

        const user = snapshot.val();

        document.getElementById("fullName").value =
            user.fullName || "";

        document.getElementById("email").value =
            user.email || "";

        document.getElementById("phone").value =
            user.phone || "";

        document.getElementById("role").value =
            user.role || "";

        document.getElementById("status").value =
            user.status || "Active";

    }

    catch (error) {

        console.error(error);

        alert("Unable to load user.");

    }

}

/* ==========================================
UPDATE USER
========================================== */

function initializeForm(uid) {

    const form = document.getElementById("editUserForm");

    if (!form) return;

    form.addEventListener("submit", async (event) => {

        event.preventDefault();

        try {

            await update(ref(db, "users/" + uid), {

                fullName:
                document.getElementById("fullName").value.trim(),

                email:
                document.getElementById("email").value.trim(),

                phone:
                document.getElementById("phone").value.trim(),

                role:
                document.getElementById("role").value,

                status:
                document.getElementById("status").value,

                updatedAt:
                new Date().toISOString()

            });

            alert("User updated successfully.");

            window.location.href =
                "view-user.html?uid=" + uid;

        }

        catch (error) {

            console.error(error);

            alert("Unable to update user.");

        }

    });

}

/* ==========================================
END OF FILE
========================================== */

