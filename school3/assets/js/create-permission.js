/* ==========================================================
MathCloud Tutorial Academy
File: assets/js/create-permission.js
Production Ready
========================================================== */

import {

createPermission

} from "../../firebase/permissions-service.js";

/* ==========================================
INITIALIZE
========================================== */

document.addEventListener("DOMContentLoaded",()=>{

    initializeCreatePermission();

});

export function initializeCreatePermission(){

    initializeForm();

}

/* ==========================================
CREATE PERMISSION
========================================== */

function initializeForm(){

    const form =

    document.getElementById(

    "createPermissionForm"

    );

    if(!form) return;

    form.addEventListener("submit",async(event)=>{

        event.preventDefault();

        const permission={

            name:

            document.getElementById(

            "permissionName"

            ).value.trim(),

            module:

            document.getElementById(

            "module"

            ).value,

            description:

            document.getElementById(

            "description"

            ).value.trim()

        };

        try{

            await createPermission(permission);

            alert(

            "Permission created successfully."

            );

            form.reset();

            location.href=

            "permissions.html";

        }

        catch(error){

            console.error(error);

            alert(

            "Unable to create permission."

            );

        }

    });

}

/* ==========================================
END OF FILE
========================================== */

