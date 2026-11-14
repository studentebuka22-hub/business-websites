/* ==========================================================
MathCloud Tutorial Academy
File: firebase/permission-assignment-service.js
Production Ready
========================================================== */

import { db } from "./firebase-config.js";

import {

ref,
set,
get,
update,
remove,
push

} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-database.js";

/* ==========================================
ASSIGN ROLE TO USER
========================================== */

export async function assignRoleToUser(uid, roleId){

    await update(

        ref(db,"users/"+uid),

        {

            roleId,

            updatedAt:new Date().toISOString()

        }

    );

}

/* ==========================================
ASSIGN PERMISSIONS TO ROLE
========================================== */

export async function assignPermissions(roleId, permissions){

    await update(

        ref(db,"roles/"+roleId),

        {

            permissions,

            updatedAt:new Date().toISOString()

        }

    );

}

/* ==========================================
GET ROLE PERMISSIONS
========================================== */

export async function getRolePermissions(roleId){

    const snapshot = await get(

        ref(db,"roles/"+roleId+"/permissions")

    );

    return snapshot.exists()

        ? snapshot.val()

        : [];

}

/* ==========================================
CHECK USER PERMISSION
========================================== */

export async function hasPermission(uid, permission){

    const userSnapshot = await get(

        ref(db,"users/"+uid)

    );

    if(!userSnapshot.exists()) return false;

    const user = userSnapshot.val();

    if(!user.roleId) return false;

    const permissionSnapshot = await get(

        ref(db,"roles/"+user.roleId+"/permissions")

    );

    if(!permissionSnapshot.exists()) return false;

    return permissionSnapshot

        .val()

        .includes(permission);

}

/* ==========================================
REMOVE USER ROLE
========================================== */

export async function removeRole(uid){

    await update(

        ref(db,"users/"+uid),

        {

            roleId:null,

            updatedAt:new Date().toISOString()

        }

    );

}

/* ==========================================
END OF FILE
========================================== */

