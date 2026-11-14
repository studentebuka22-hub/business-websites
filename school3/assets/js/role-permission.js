/* ==========================================================
MathCloud Tutorial Academy
File: assets/js/role-permissions.js
Production Ready
========================================================== */

import { getRole } from "../../firebase/roles-service.js";

/* ==========================================
INITIALIZE
========================================== */

document.addEventListener("DOMContentLoaded", () => {

    initializeRolePermissions();

});

async function initializeRolePermissions() {

    const params = new URLSearchParams(window.location.search);

    const id = params.get("id");

    if (!id) {

        alert("Role not found.");

        location.href = "roles.html";

        return;

    }

    const role = await getRole(id);

    if (!role) {

        alert("Role not found.");

        location.href = "roles.html";

        return;

    }

    displayRole(role);

    initializeEditButton(id);

}

/* ==========================================
DISPLAY ROLE
========================================== */

function displayRole(role) {

    document.getElementById("roleTitle").textContent =

        role.name || "Unknown Role";

    const container =

        document.getElementById("permissionList");

    container.innerHTML = "";

    if (!role.permissions || role.permissions.length === 0) {

        container.innerHTML =

        "<p>No permissions assigned.</p>";

        return;

    }

    role.permissions.forEach(permission => {

        container.innerHTML += `

        <div class="permissionCard">

            <i class="fa-solid fa-check"></i>

            <span>

            ${formatPermission(permission)}

            </span>

        </div>

        `;

    });

}

/* ==========================================
FORMAT PERMISSION
========================================== */

function formatPermission(permission) {

    return permission

        .replace(/-/g, " ")

        .replace(/\b\w/g,

            character => character.toUpperCase()

        );

}

/* ==========================================
EDIT BUTTON
========================================== */

function initializeEditButton(id) {

    document

    .getElementById("editPermissions")

    .addEventListener("click", () => {

        location.href =

        "edit-role.html?id=" + id;

    });

}

/* ==========================================
END OF FILE
========================================== */

