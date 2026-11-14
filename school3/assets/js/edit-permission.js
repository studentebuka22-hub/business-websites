/* ==========================================================
MathCloud Tutorial Academy
File: assets/js/edit-permission.js
Production Ready
========================================================== */

import {

    getPermission,
    updatePermission

} from "../../firebase/permissions-service.js";

/* ==========================================
INITIALIZE
========================================== */

document.addEventListener("DOMContentLoaded", () => {

    initializeEditPermission();

});

async function initializeEditPermission() {

    const params = new URLSearchParams(window.location.search);

    const id = params.get("id");

    if (!id) {

        alert("Permission not found.");

        location.href = "permissions.html";

        return;

    }

    await loadPermission(id);

    initializeForm(id);

}

/* ==========================================
LOAD PERMISSION
========================================== */

async function loadPermission(id) {

    try {

        const permission = await getPermission(id);

        if (!permission) {

            alert("Permission not found.");

            location.href = "permissions.html";

            return;

        }

        document.getElementById("permissionName").value =

            permission.name || "";

        document.getElementById("module").value =

            permission.module || "";

        document.getElementById("description").value =

            permission.description || "";

    }

    catch (error) {

        console.error(error);

        alert("Unable to load permission.");

    }

}

/* ==========================================
UPDATE PERMISSION
========================================== */

function initializeForm(id) {

    const form = document.getElementById("editPermissionForm");

    if (!form) return;

    form.addEventListener("submit", async (event) => {

        event.preventDefault();

        const data = {

            name:

            document.getElementById("permissionName")
            .value.trim(),

            module:

            document.getElementById("module")
            .value,

            description:

            document.getElementById("description")
            .value.trim()

        };

        try {

            await updatePermission(id, data);

            alert("Permission updated successfully.");

            location.href = "permissions.html";

        }

        catch (error) {

            console.error(error);

            alert("Unable to update permission.");

        }

    });

}

/* ==========================================
END OF FILE
========================================== */

