/* ==========================================================
MathCloud Tutorial Academy
File: assets/js/roles.js
Production Ready
========================================================== */

import { db } from "../../firebase/firebase-config.js";

import {
    ref,
    onValue,
    remove
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-database.js";

/* ==========================================
INITIALIZE
========================================== */

document.addEventListener("DOMContentLoaded", () => {

    initializeRolesPage();

});

export function initializeRolesPage() {

    loadRoles();

    initializeSearch();

}

/* ==========================================
LOAD ROLES
========================================== */

function loadRoles() {

    const tbody = document.querySelector("#rolesTable tbody");

    if (!tbody) return;

    onValue(ref(db, "roles"), (snapshot) => {

        tbody.innerHTML = "";

        if (!snapshot.exists()) {

            tbody.innerHTML = `

            <tr>

            <td colspan="5">

            No roles available.

            </td>

            </tr>

            `;

            return;

        }

        snapshot.forEach(role => {

            const data = role.val();

            tbody.innerHTML += `

            <tr>

            <td>

            <span class="roleBadge">

            ${data.name || ""}

            </span>

            </td>

            <td>${data.description || ""}</td>

            <td>${data.users || 0}</td>

            <td>

            <span class="${
                data.status === "Inactive"
                ? "inactiveBadge"
                : "activeBadge"
            }">

            ${data.status || "Active"}

            </span>

            </td>

            <td>

            <div class="actionButtons">

            <button
            class="permissionButton"
            data-id="${role.key}">

            <i class="fa-solid fa-key"></i>

            </button>

            <button
            class="editButton"
            data-id="${role.key}">

            <i class="fa-solid fa-pen"></i>

            </button>

            <button
            class="deleteButton"
            data-id="${role.key}">

            <i class="fa-solid fa-trash"></i>

            </button>

            </div>

            </td>

            </tr>

            `;

        });

        bindButtons();

    });

}

/* ==========================================
BUTTON EVENTS
========================================== */

function bindButtons() {

    document.querySelectorAll(".permissionButton")
    .forEach(button => {

        button.onclick = () => {

            location.href =
            "role-permissions.html?id=" +
            button.dataset.id;

        };

    });

    document.querySelectorAll(".editButton")
    .forEach(button => {

        button.onclick = () => {

            location.href =
            "edit-role.html?id=" +
            button.dataset.id;

        };

    });

    document.querySelectorAll(".deleteButton")
    .forEach(button => {

        button.onclick = async () => {

            if (!confirm("Delete this role?")) return;

            await remove(

                ref(db, "roles/" + button.dataset.id)

            );

        };

    });

}

/* ==========================================
SEARCH
========================================== */

function initializeSearch() {

    const search = document.getElementById("searchRole");

    if (!search) return;

    search.addEventListener("input", () => {

        const keyword = search.value.toLowerCase();

        document
        .querySelectorAll("#rolesTable tbody tr")
        .forEach(row => {

            row.style.display =
            row.innerText
            .toLowerCase()
            .includes(keyword)
            ? ""
            : "none";

        });

    });

}

/* ==========================================
END OF FILE
========================================== */

