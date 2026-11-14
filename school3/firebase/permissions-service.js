/* ==========================================================
MathCloud Tutorial Academy
File: firebase/permissions-service.js
Production Ready
========================================================== */

import { db } from "./firebase-config.js";

import {

ref,
get,
set,
update,
remove,
push

} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-database.js";

/* ==========================================
CREATE PERMISSION
========================================== */

export async function createPermission(permission){

    const newPermission = push(ref(db,"permissions"));

    await set(newPermission,{

        id:newPermission.key,

        name:permission.name,

        description:permission.description || "",

        module:permission.module || "",

        createdAt:new Date().toISOString(),

        updatedAt:new Date().toISOString()

    });

    return newPermission.key;

}

/* ==========================================
GET PERMISSION
========================================== */

export async function getPermission(id){

    const snapshot = await get(

        ref(db,"permissions/"+id)

    );

    return snapshot.exists()

        ? snapshot.val()

        : null;

}

/* ==========================================
GET ALL PERMISSIONS
========================================== */

export async function getPermissions(){

    const snapshot = await get(

        ref(db,"permissions")

    );

    return snapshot.exists()

        ? snapshot.val()

        : {};

}

/* ==========================================
UPDATE PERMISSION
========================================== */

export async function updatePermission(id,data){

    data.updatedAt =

    new Date().toISOString();

    await update(

        ref(db,"permissions/"+id),

        data

    );

}

/* ==========================================
DELETE PERMISSION
========================================== */

export async function deletePermission(id){

    await remove(

        ref(db,"permissions/"+id)

    );

}

/* ==========================================
END OF FILE
========================================== */

