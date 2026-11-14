/* ==========================================================
MathCloud Tutorial Academy
File: assets/js/create-role.js
Production Ready
========================================================== */

import { createRole } from "../../firebase/roles-service.js";

/* ==========================================
INITIALIZE
========================================== */

document.addEventListener("DOMContentLoaded", () => {

    initializeCreateRole();

});

export function initializeCreateRole(){

    initializeForm();

}

/* ==========================================
CREATE ROLE
========================================== */

function initializeForm(){

    const form = document.getElementById("createRoleForm");

    if(!form) return;

    form.addEventListener("submit", async(event)=>{

        event.preventDefault();

        const permissions = [];

        document
        .querySelectorAll(".permissionGrid input:checked")
        .forEach(item=>{

            permissions.push(item.value);

        });

        const role = {

            name:

            document
            .getElementById("roleName")
            .value
            .trim(),

            description:

            document
            .getElementById("description")
            .value
            .trim(),

            permissions

        };

        try{

            await createRole(role);

            alert("Role created successfully.");

            form.reset();

            window.location.href = "roles.html";

        }

        catch(error){

            console.error(error);

            alert("Unable to create role.");

        }

    });

}

/* ==========================================
END OF FILE
========================================== */

