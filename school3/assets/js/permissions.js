/* ==========================================================
MathCloud Tutorial Academy
File: assets/js/permissions.js
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

    initializePermissionsPage();

});

export function initializePermissionsPage() {

    loadPermissions();

    initializeSearch();

}

/* ==========================================
LOAD PERMISSIONS
========================================== */

function loadPermissions() {

    const tbody = document.querySelector("#permissionsTable tbody");

    if (!tbody) return;

    onValue(ref(db, "permissions"), (snapshot) => {

        tbody.innerHTML = "";

        if (!snapshot.exists()) {

            tbody.innerHTML = `

            <tr>

                <td colspan="4">

                    No permissions found.

                </td>

            </tr>

            `;

            return;

        }

        snapshot.forEach(permission => {

            const data = permission.val();

            tbody.innerHTML += `

            <tr>

                <td>

                    <span class="permissionBadge">

                        ${data.name || ""}

                    </span>

                </td>

                <td>${data.module || "-"}</td>

                <td>${data.description || "-"}</td>

                <td>

                    <div class="actionButtons">

                        <button
                        class="editButton"
                        data-id="${permission.key}">

                            <i class="fa-solid fa-pen"></i>

                        </button>

                        <button
                        class="deleteButton"
                        data-id="${permission.key}">

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

    document.querySelectorAll(".editButton")
    .forEach(button => {

        button.onclick = () => {

            location.href =
            "edit-permission.html?id=" +
            button.dataset.id;

        };

    });

    document.querySelectorAll(".deleteButton")
    .forEach(button => {

        button.onclick = async () => {

            if (!confirm("Delete this permission?")) return;

            await remove(

                ref(db,
                "permissions/" + button.dataset.id)

            );

        };

    });

}

/* ==========================================
SEARCH
========================================== */

function initializeSearch() {

    const search = document.getElementById("searchPermission");

    if (!search) return;

    search.addEventListener("input", () => {

        const keyword = search.value.toLowerCase();

        document
        .querySelectorAll("#permissionsTable tbody tr")
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

