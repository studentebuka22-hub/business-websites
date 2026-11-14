/* ==========================================================
MathCloud Tutorial Academy
File: firebase/users-service.js
Production Ready
========================================================== */

import { db } from "./firebase-config.js";

import {

ref,
push,
set,
update,
remove,
get,
query,
orderByChild,
equalTo

} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-database.js";

/* ==========================================
CREATE USER
========================================== */

export async function createUser(user){

    const userRef = ref(

        db,

        `users/${user.uid}`

    );

    await set(userRef,{

        uid: user.uid,

        fullName: user.fullName,

        email: user.email,

        phone: user.phone || "",

        role: user.role,

        status: user.status || "Active",

        photo: user.photo || "",

        createdAt: user.createdAt || Date.now(),

        updatedAt: user.updatedAt || Date.now()

    });

    return user.uid;

}

/* ==========================================
GET USER
========================================== */

export async function getUser(uid){

    const snapshot = await get(

        ref(db,"users/"+uid)

    );

    return snapshot.exists()

        ? snapshot.val()

        : null;

}

/* ==========================================
GET ALL USERS
========================================== */

export async function getUsers(){

    const snapshot = await get(

        ref(db,"users")

    );

    return snapshot.exists()

        ? snapshot.val()

        : {};

}

/* ==========================================
UPDATE USER
========================================== */

export async function updateUser(uid,data){

    data.updatedAt =

    new Date().toISOString();

    await update(

        ref(db,"users/"+uid),

        data

    );

}

/* ==========================================
DELETE USER
========================================== */

export async function deleteUser(uid){

    await remove(

        ref(db,"users/"+uid)

    );

}

/* ==========================================
SUSPEND USER
========================================== */

export async function suspendUser(uid){

    await update(

        ref(db,"users/"+uid),

        {

            status:"Suspended",

            updatedAt:new Date().toISOString()

        }

    );

}

/* ==========================================
ACTIVATE USER
========================================== */

export async function activateUser(uid){

    await update(

        ref(db,"users/"+uid),

        {

            status:"Active",

            updatedAt:new Date().toISOString()

        }

    );

}

/* ==========================================
SEARCH BY EMAIL
========================================== */

export async function findUserByEmail(email){

    const q = query(

        ref(db,"users"),

        orderByChild("email"),

        equalTo(email)

    );

    const snapshot = await get(q);

    return snapshot.exists()

        ? snapshot.val()

        : null;

}

/* ==========================================
END OF FILE
========================================== */

