/* ==========================================================
MathCloud Tutorial Academy
File: firebase/system-logs-service.js
Production Ready
========================================================== */

import { db } from "./firebase-config.js";

import {

ref,
push,
set,
get,
remove,
query,
limitToLast

} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-database.js";

/* ==========================================
CREATE LOG
========================================== */

export async function createSystemLog(log){

    const newLog = push(ref(db,"systemLogs"));

    await set(newLog,{

        id:newLog.key,

        user:log.user || "System",

        activity:log.activity || "",

        module:log.module || "",

        status:log.status || "Success",

        dateTime:new Date().toLocaleString(),

        createdAt:new Date().toISOString()

    });

    return newLog.key;

}

/* ==========================================
GET LOG
========================================== */

export async function getSystemLog(id){

    const snapshot = await get(

        ref(db,"systemLogs/"+id)

    );

    return snapshot.exists()

        ? snapshot.val()

        : null;

}

/* ==========================================
GET ALL LOGS
========================================== */

export async function getSystemLogs(){

    const snapshot = await get(

        ref(db,"systemLogs")

    );

    return snapshot.exists()

        ? snapshot.val()

        : {};

}

/* ==========================================
GET RECENT LOGS
========================================== */

export async function getRecentLogs(limit=50){

    const snapshot = await get(

        query(

            ref(db,"systemLogs"),

            limitToLast(limit)

        )

    );

    return snapshot.exists()

        ? snapshot.val()

        : {};

}

/* ==========================================
DELETE LOG
========================================== */

export async function deleteSystemLog(id){

    await remove(

        ref(db,"systemLogs/"+id)

    );

}

/* ==========================================
END OF FILE
========================================== */

