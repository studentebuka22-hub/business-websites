/* ==========================================================
MathCloud Tutorial Academy
File: firebase/parent-service.js
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

const COLLECTION = "parents";

/* ==========================================
CREATE PARENT
========================================== */

export async function createParent(parent){

    const parentsRef = ref(database, COLLECTION);

    const newParent = push(parentsRef);

    const timestamp = Date.now();

    const data = {

        id: newParent.key,

        status: "active",

        deleted: false,

        createdAt: timestamp,

        updatedAt: timestamp,

        ...parent

    };

    await set(newParent, data);

    return data;

}

/* ==========================================
GET PARENT
========================================== */

export async function getParent(parentId){

    const snapshot = await get(

        ref(database, `${COLLECTION}/${parentId}`)

    );

    return snapshot.exists() ? snapshot.val() : null;

}

/* ==========================================
GET ALL PARENTS
========================================== */

export async function getAllParents(){

    const snapshot = await get(

        ref(database, COLLECTION)

    );

    return snapshot.exists()

        ? Object.values(snapshot.val())

        : [];

}

/* ==========================================
UPDATE PARENT
========================================== */

export async function updateParent(parentId, data){

    data.updatedAt = Date.now();

    await update(

        ref(database, `${COLLECTION}/${parentId}`),

        data

    );

}

/* ==========================================
SOFT DELETE
========================================== */

export async function deleteParent(parentId){

    await update(

        ref(database, `${COLLECTION}/${parentId}`),

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

export async function restoreParent(parentId){

    await update(

        ref(database, `${COLLECTION}/${parentId}`),

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

export async function permanentlyDeleteParent(parentId){

    await remove(

        ref(database, `${COLLECTION}/${parentId}`)

    );

}

/* ==========================================
SEARCH
========================================== */

export async function findParentByEmail(email){

    const parentQuery = query(

        ref(database, COLLECTION),

        orderByChild("email"),

        equalTo(email)

    );

    const snapshot = await get(parentQuery);

    return snapshot.exists()

        ? Object.values(snapshot.val())

        : [];

}

/* ==========================================
REALTIME LISTENER
========================================== */

export function watchParents(callback){

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

