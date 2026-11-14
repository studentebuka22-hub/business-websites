/* ==========================================================
MathCloud Tutorial Academy
File: assets/js/view-user.js
Production Ready
========================================================== */

import { db } from "../../firebase/firebase-config.js";

import {
    ref,
    get,
    remove
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-database.js";

/* ==========================================
INITIALIZE
========================================== */

document.addEventListener("DOMContentLoaded", () => {

    initializeViewUser();

});

async function initializeViewUser() {

    const params = new URLSearchParams(window.location.search);

    const uid = params.get("uid");

    if (!uid) {

        alert("User ID not found.");

        return;

    }

    await loadUser(uid);

    initializeDelete(uid);

    initializeEdit(uid);

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

        document.getElementById("profilePhoto").src =
            user.photo || "../../assets/images/avatar.png";

        document.getElementById("fullName").textContent =
            user.fullName || "-";

        document.getElementById("userRole").textContent =
            user.role || "-";

        document.getElementById("userStatus").textContent =
            user.status || "Active";

        document.getElementById("email").textContent =
            user.email || "-";

        document.getElementById("phone").textContent =
            user.phone || "-";

        document.getElementById("createdAt").textContent =
            user.createdAt || "-";

        document.getElementById("lastLogin").textContent =
            user.lastLogin || "Never";

    } catch (error) {

        console.error(error);

        alert("Unable to load user.");

    }

}

/* ==========================================
EDIT USER
========================================== */

function initializeEdit(uid) {

    const button = document.getElementById("editUser");

    if (!button) return;

    button.addEventListener("click", () => {

        window.location.href =
            "edit-user.html?uid=" + uid;

    });

}

/* ==========================================
DELETE USER
========================================== */

function initializeDelete(uid) {

    const button = document.getElementById("deleteUser");

    if (!button) return;

    button.addEventListener("click", async () => {

        if (!confirm("Delete this user?")) return;

        try {

            await remove(ref(db, "users/" + uid));

            alert("User deleted successfully.");

            window.location.href = "users.html";

        } catch (error) {

            console.error(error);

            alert("Unable to delete user.");

        }

    });

}

/* ==========================================
END OF FILE
========================================== */

