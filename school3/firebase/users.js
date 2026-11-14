/* ==========================================================
   MathCloud Tutorial Academy Management System
   User Management Engine
   File: firebase/users.js
   ========================================================== */

import { auth, DB } from "./firebase-config.js";

import {

    create,

    createAuto,

    read,

    edit,

    destroy,

    where

} from "./database.js";

/* ==========================================================
   CREATE USER PROFILE
   ========================================================== */

export async function createUser(userData) {

    const uid = userData.uid;

    if (!uid) throw new Error("User UID is required.");

    return await create(`${DB.USERS}/${uid}`, {

        uid,

        fullName: userData.fullName || "",

        email: userData.email || "",

        phone: userData.phone || "",

        role: userData.role || "student",

        status: "active",

        gender: userData.gender || "",

        passport: userData.passport || "",

        permissions: userData.permissions || [],

        createdBy: auth.currentUser?.uid || "",

        createdAt: Date.now(),

        updatedAt: Date.now()

    });

}

/* ==========================================================
   GET USER
   ========================================================== */

export async function getUser(uid) {

    return await read(`${DB.USERS}/${uid}`);

}

/* ==========================================================
   UPDATE USER
   ========================================================== */

export async function updateUser(uid, data) {

    return await edit(`${DB.USERS}/${uid}`, {

        ...data,

        updatedAt: Date.now()

    });

}

/* ==========================================================
   DELETE USER
   ========================================================== */

export async function deleteUser(uid) {

    return await destroy(`${DB.USERS}/${uid}`);

}

/* ==========================================================
   SUSPEND USER
   ========================================================== */

export async function suspendUser(uid) {

    return await updateUser(uid, {

        status: "suspended"

    });

}

/* ==========================================================
   ACTIVATE USER
   ========================================================== */

export async function activateUser(uid) {

    return await updateUser(uid, {

        status: "active"

    });

}

/* ==========================================================
   CHANGE ROLE
   ========================================================== */

export async function changeUserRole(uid, role) {

    return await updateUser(uid, {

        role

    });

}

/* ==========================================================
   UPDATE PERMISSIONS
   ========================================================== */

export async function updatePermissions(uid, permissions) {

    return await updateUser(uid, {

        permissions

    });

}

/* ==========================================================
   FIND USER BY EMAIL
   ========================================================== */

export async function findUserByEmail(email) {

    return await where(

        DB.USERS,

        "email",

        email

    );

}

/* ==========================================================
   FIND USER BY PHONE
   ========================================================== */

export async function findUserByPhone(phone) {

    return await where(

        DB.USERS,

        "phone",

        phone

    );

}

/* ==========================================================
   SAVE AUDIT LOG
   ========================================================== */

export async function saveAuditLog(action, details = {}) {

    return await createAuto(DB.LOGS, {

        action,

        userId: auth.currentUser?.uid || "",

        timestamp: Date.now(),

        ...details

    });

}

/* ==========================================================
   LAST LOGIN
   ========================================================== */

export async function updateLastLogin(uid) {

    return await updateUser(uid, {

        lastLogin: Date.now()

    });

}

/* ==========================================================
   USER EXISTS
   ========================================================== */

export async function userExists(uid) {

    const user = await getUser(uid);

    return user !== null;

}

/* ==========================================================
   END OF FILE
   ========================================================== */

