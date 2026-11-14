/* ==========================================================
MathCloud Tutorial Academy
File: assets/js/assign-role.js
Production Ready
========================================================== */

import { db } from "../../firebase/firebase-config.js";

import {

ref,
get

} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-database.js";

import {

assignRoleToUser

} from "../../firebase/permission-assignment-service.js";

/* ==========================================
INITIALIZE
========================================== */

document.addEventListener("DOMContentLoaded",()=>{

    initializeAssignRole();

});

async function initializeAssignRole(){

    await loadUsers();

    await loadRoles();

    initializeForm();

}

/* ==========================================
LOAD USERS
========================================== */

async function loadUsers(){

    const select=document.getElementById("userSelect");

    const snapshot=await get(ref(db,"users"));

    if(!snapshot.exists()) return;

    snapshot.forEach(item=>{

        const user=item.val();

        select.innerHTML+=`

        <option value="${item.key}">

        ${user.fullName}

        (${user.email})

        </option>

        `;

    });

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
ASSIGN ROLE
========================================== */

function initializeForm(){

    const form=document.getElementById("assignRoleForm");

    if(!form) return;

    form.addEventListener("submit",async(event)=>{

        event.preventDefault();

        const uid=

        document.getElementById("userSelect").value;

        const roleId=

        document.getElementById("roleSelect").value;

        try{

            await assignRoleToUser(uid,roleId);

            alert("Role assigned successfully.");

            form.reset();

        }

        catch(error){

            console.error(error);

            alert("Unable to assign role.");

        }

    });

}

/* ==========================================
END OF FILE
========================================== */

