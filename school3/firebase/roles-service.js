/* ==========================================================
MathCloud Tutorial Academy
File: firebase/roles-service.js
Production Ready
========================================================== */

import { db } from "./firebase-config.js";

import {

ref,
push,
set,
get,
update,
remove,
query,
orderByChild,
equalTo

} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-database.js";

/* ==========================================
CREATE ROLE
========================================== */

export async function createRole(role){

    const roleRef = ref(

        db,

        `roles/${role.uid}`

    );

    await set(roleRef,{

        uid: role.uid,

        name: role.name,

        description: role.description || "",

        permissions: role.permissions || [],

        status: "Active",

        createdAt: role.createdAt || Date.now(),

        updatedAt: role.updatedAt || Date.now()

    });

    return role.uid;

}

/* ==========================================
GET ROLE
========================================== */

export async function getRole(id){

    const snapshot = await get(

        ref(db,"roles/"+id)

    );

    return snapshot.exists()

        ? snapshot.val()

        : null;

}

/* ==========================================
GET ALL ROLES
========================================== */

export async function getRoles(){

    const snapshot = await get(

        ref(db,"roles")

    );

    return snapshot.exists()

        ? snapshot.val()

        : {};

}

/* ==========================================
UPDATE ROLE
========================================== */

export async function updateRole(id,data){

    data.updatedAt =

    new Date().toISOString();

    await update(

        ref(db,"roles/"+id),

        data

    );

}

/* ==========================================
DELETE ROLE
========================================== */

export async function deleteRole(id){

    await remove(

        ref(db,"roles/"+id)

    );

}

/* ==========================================
FIND ROLE
========================================== */

export async function findRoleByName(name){

    const q = query(

        ref(db,"roles"),

        orderByChild("name"),

        equalTo(name)

    );

    const snapshot = await get(q);

    return snapshot.exists()

        ? snapshot.val()

        : null;

}

/* ==========================================
END OF FILE
========================================== */

