/* ==========================================================
MathCloud Tutorial Academy
File: assets/js/assign-permissions.js
Production Ready
========================================================== */

import { db } from "../../firebase/firebase-config.js";

import {

ref,
get

} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-database.js";

import {

assignPermissions,
getRolePermissions

} from "../../firebase/permission-assignment-service.js";

/* ==========================================
INITIALIZE
========================================== */

document.addEventListener("DOMContentLoaded",()=>{

    initializeAssignPermissions();

});

async function initializeAssignPermissions(){

    await loadRoles();

    initializeRoleChange();

    initializeForm();

}

/* ==========================================
LOAD ROLES
========================================== */

async function loadRoles(){

    const select=document.getElementById("roleSelect");

    const snapshot=await get(ref(db,"roles"));

    if(!snapshot.exists()) return;

    snapshot.forEach(item=>{

        const role=item.val();

        select.innerHTML+=`

        <option value="${item.key}">

        ${role.name}

        </option>

        `;

    });

}

/* ==========================================
ROLE CHANGE
========================================== */

function initializeRoleChange(){

    const select=document.getElementById("roleSelect");

    select.addEventListener("change",async()=>{

        await loadPermissions(select.value);

    });

}

/* ==========================================
LOAD PERMISSIONS
========================================== */

async function loadPermissions(roleId){

    const grid=document.getElementById("permissionGrid");

    grid.innerHTML="";

    if(!roleId) return;

    const permissionsSnapshot=

    await get(ref(db,"permissions"));

    const assigned=

    await getRolePermissions(roleId);

    if(!permissionsSnapshot.exists()) return;

    permissionsSnapshot.forEach(item=>{

        const permission=item.val();

        const checked=

        assigned.includes(permission.name)

        ? "checked"

        : "";

        grid.innerHTML+=`

        <label>

        <input

        type="checkbox"

        value="${permission.name}"

        ${checked}

        >

        ${permission.name}

        </label>

        `;

    });

}

/* ==========================================
SAVE
========================================== */

function initializeForm(){

    const form=

    document.getElementById(

    "assignPermissionForm"

    );

    form.addEventListener("submit",async(event)=>{

        event.preventDefault();

        const roleId=

        document.getElementById(

        "roleSelect"

        ).value;

        const permissions=[];

        document

        .querySelectorAll(

        "#permissionGrid input:checked"

        )

        .forEach(item=>{

            permissions.push(item.value);

        });

        try{

            await assignPermissions(

                roleId,

                permissions

            );

            alert(

            "Permissions updated successfully."

            );

        }

        catch(error){

            console.error(error);

            alert(

            "Unable to update permissions."

            );

        }

    });

}

/* ==========================================
END OF FILE
========================================== */

