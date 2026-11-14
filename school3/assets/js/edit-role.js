/* ==========================================================
MathCloud Tutorial Academy
File: assets/js/edit-role.js
Production Ready
========================================================== */

import { getRole, updateRole } from "../../firebase/roles-service.js";

/* ==========================================
AVAILABLE PERMISSIONS
========================================== */

const permissions = [

"dashboard",
"users",
"students",
"teachers",
"classes",
"subjects",
"attendance",
"results",
"finance",
"library",
"settings",
"reports"

];

/* ==========================================
INITIALIZE
========================================== */

document.addEventListener("DOMContentLoaded", () => {

    initializeEditRole();

});

async function initializeEditRole(){

    const params = new URLSearchParams(location.search);

    const id = params.get("id");

    if(!id){

        alert("Role not found.");

        location.href="roles.html";

        return;

    }

    await loadRole(id);

    initializeForm(id);

}

/* ==========================================
LOAD ROLE
========================================== */

async function loadRole(id){

    const role = await getRole(id);

    if(!role){

        alert("Role not found.");

        return;

    }

    document.getElementById("roleName").value =

    role.name || "";

    document.getElementById("description").value =

    role.description || "";

    const container =

    document.getElementById("permissionGrid");

    container.innerHTML = "";

    permissions.forEach(permission=>{

        container.innerHTML += `

        <label>

        <input

        type="checkbox"

        value="${permission}"

        ${role.permissions?.includes(permission)
        ? "checked"
        : ""}

        >

        ${permission.charAt(0).toUpperCase() +
        permission.slice(1)}

        </label>

        `;

    });

}

/* ==========================================
UPDATE ROLE
========================================== */

function initializeForm(id){

    const form =

    document.getElementById("editRoleForm");

    form.addEventListener("submit",async(event)=>{

        event.preventDefault();

        const selectedPermissions=[];

        document

        .querySelectorAll(

        "#permissionGrid input:checked"

        )

        .forEach(item=>{

            selectedPermissions.push(item.value);

        });

        await updateRole(id,{

            name:

            document.getElementById("roleName")

            .value.trim(),

            description:

            document.getElementById("description")

            .value.trim(),

            permissions:selectedPermissions

        });

        alert("Role updated successfully.");

        location.href="roles.html";

    });

}

/* ==========================================
END OF FILE
========================================== */

