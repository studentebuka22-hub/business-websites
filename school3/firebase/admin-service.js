/* ==========================================================
MathCloud Tutorial Academy
File: firebase/admin-service.js
Production Ready
========================================================== */

import {
    database
} from "./firebase-config.js";

import {
    ref,
    push,
    set,
    get,
    update,
    remove,
    query,
    orderByChild,
    equalTo,
    onValue
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-database.js";

const COLLECTION = "admins";

/* ==========================================
CREATE ADMIN
========================================== */

export async function createAdmin(admin){

    const adminsRef = ref(database, COLLECTION);

    const newAdmin = push(adminsRef);

    const timestamp = Date.now();

    const data = {

        id: newAdmin.key,

        status: "active",

        deleted: false,

        createdAt: timestamp,

        updatedAt: timestamp,

        ...admin

    };

    await set(newAdmin, data);

    return data;

}

/* ==========================================
GET ADMIN
========================================== */

export async function getAdmin(adminId){

    const snapshot = await get(

        ref(database, `${COLLECTION}/${adminId}`)

    );

    return snapshot.exists()

        ? snapshot.val()

        : null;

}

/* ==========================================
GET ALL ADMINS
========================================== */

export async function getAllAdmins(){

    const snapshot = await get(

        ref(database, COLLECTION)

    );

    return snapshot.exists()

        ? Object.values(snapshot.val())

        : [];

}

/* ==========================================
UPDATE ADMIN
========================================== */

export async function updateAdmin(adminId, data){

    data.updatedAt = Date.now();

    await update(

        ref(database, `${COLLECTION}/${adminId}`),

        data

    );

}

/* ==========================================
SOFT DELETE
========================================== */

export async function deleteAdmin(adminId){

    await update(

        ref(database, `${COLLECTION}/${adminId}`),

        {

            deleted: true,

            status: "deleted",

            updatedAt: Date.now()

        }

    );

}

/* ==========================================
RESTORE
========================================== */

export async function restoreAdmin(adminId){

    await update(

        ref(database, `${COLLECTION}/${adminId}`),

        {

            deleted: false,

            status: "active",

            updatedAt: Date.now()

        }

    );

}

/* ==========================================
PERMANENT DELETE
========================================== */

export async function permanentlyDeleteAdmin(adminId){

    await remove(

        ref(database, `${COLLECTION}/${adminId}`)

    );

}

/* ==========================================
SEARCH
========================================== */

export async function findAdminByEmail(email){

    const adminQuery = query(

        ref(database, COLLECTION),

        orderByChild("email"),

        equalTo(email)

    );

    const snapshot = await get(adminQuery);

    return snapshot.exists()

        ? Object.values(snapshot.val())

        : [];

}

/* ==========================================
REALTIME LISTENER
========================================== */

export function watchAdmins(callback){

    onValue(

        ref(database, COLLECTION),

        snapshot => {

            callback(

                snapshot.exists()

                    ? Object.values(snapshot.val())

                    : []

            );

        }

    );

}

/* ==========================================
END OF FILE
========================================== */

