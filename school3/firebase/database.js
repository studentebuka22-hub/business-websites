/* ==========================================================
   MathCloud Tutorial Academy Management System
   Firebase Realtime Database Engine
   File: firebase/database.js
   ========================================================== */

import {

    database

} from "./firebase-config.js";

import {

    ref,

    set,

    push,

    get,

    child,

    update,

    remove,

    onValue,

    off,

    query,

    orderByChild,

    equalTo,

    limitToFirst,

    limitToLast,

    serverTimestamp

} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-database.js";

/* ==========================================================
   CREATE
   ========================================================== */

export async function create(path, data) {

    try {

        await set(ref(database, path), {

            ...data,

            createdAt: Date.now(),

            updatedAt: Date.now()

        });

        return true;

    } catch (error) {

        console.error(error);

        return false;

    }

}

/* ==========================================================
   AUTO ID CREATE
   ========================================================== */

export async function createAuto(path, data) {

    try {

        const newRecord = push(ref(database, path));

        await set(newRecord, {

            ...data,

            id: newRecord.key,

            createdAt: Date.now(),

            updatedAt: Date.now()

        });

        return newRecord.key;

    } catch (error) {

        console.error(error);

        return null;

    }

}

/* ==========================================================
   READ
   ========================================================== */

export async function read(path) {

    try {

        const snapshot = await get(ref(database, path));

        if (snapshot.exists()) {

            return snapshot.val();

        }

        return null;

    } catch (error) {

        console.error(error);

        return null;

    }

}

/* ==========================================================
   UPDATE
   ========================================================== */

export async function edit(path, data) {

    try {

        await update(ref(database, path), {

            ...data,

            updatedAt: Date.now()

        });

        return true;

    } catch (error) {

        console.error(error);

        return false;

    }

}

/* ==========================================================
   DELETE
   ========================================================== */

export async function destroy(path) {

    try {

        await remove(ref(database, path));

        return true;

    } catch (error) {

        console.error(error);

        return false;

    }

}

/* ==========================================================
   EXISTS
   ========================================================== */

export async function exists(path) {

    const snapshot = await get(ref(database, path));

    return snapshot.exists();

}

/* ==========================================================
   REALTIME LISTENER
   ========================================================== */

export function listen(path, callback) {

    const dbRef = ref(database, path);

    onValue(dbRef, (snapshot) => {

        callback(snapshot.val());

    });

    return dbRef;

}

/* ==========================================================
   STOP LISTENER
   ========================================================== */

export function stopListening(reference) {

    off(reference);

}

/* ==========================================================
   QUERY BY FIELD
   ========================================================== */

export async function where(path, field, value) {

    try {

        const q = query(

            ref(database, path),

            orderByChild(field),

            equalTo(value)

        );

        const snapshot = await get(q);

        if (snapshot.exists()) {

            return snapshot.val();

        }

        return {};

    } catch (error) {

        console.error(error);

        return {};

    }

}

/* ==========================================================
   FIRST RECORDS
   ========================================================== */

export async function first(path, total = 10) {

    const q = query(

        ref(database, path),

        limitToFirst(total)

    );

    const snapshot = await get(q);

    return snapshot.exists()

        ? snapshot.val()

        : {};

}

/* ==========================================================
   LAST RECORDS
   ========================================================== */

export async function last(path, total = 10) {

    const q = query(

        ref(database, path),

        limitToLast(total)

    );

    const snapshot = await get(q);

    return snapshot.exists()

        ? snapshot.val()

        : {};

}

/* ==========================================================
   TOTAL RECORDS
   ========================================================== */

export async function count(path) {

    const data = await read(path);

    return data

        ? Object.keys(data).length

        : 0;

}

/* ==========================================================
   DATABASE HEALTH CHECK
   ========================================================== */

export async function databaseOnline() {

    try {

        await get(ref(database, ".info/connected"));

        return true;

    } catch {

        return false;

    }

}

/* ==========================================================
   SERVER TIME
   ========================================================== */

export function timestamp() {

    return serverTimestamp();

}

/* ==========================================================
   END OF FILE
   ========================================================== */

