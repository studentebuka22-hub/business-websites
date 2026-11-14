/* ==========================================================
MathCloud Tutorial Academy
File: firebase/dashboard-service.js
Production Ready
========================================================== */

import { db } from "./firebase-config.js";

import {

ref,
get,
onValue,
update

} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-database.js";

/* ==========================================
GET TOTAL DOCUMENTS
========================================== */

export async function getCount(path){

    try{

        const snapshot = await get(ref(db,path));

        if(snapshot.exists()){

            return Object.keys(snapshot.val()).length;

        }

        return 0;

    }

    catch(error){

        console.error(error);

        return 0;

    }

}

/* ==========================================
REALTIME COUNTER
========================================== */

export function watchCount(path,callback){

    onValue(ref(db,path),(snapshot)=>{

        if(snapshot.exists()){

            callback(

                Object.keys(snapshot.val()).length

            );

        }else{

            callback(0);

        }

    });

}

/* ==========================================
SYSTEM SETTINGS
========================================== */

export async function getSchoolSettings(){

    const snapshot = await get(

        ref(db,"settings")

    );

    return snapshot.exists()

        ? snapshot.val()

        : {};

}

/* ==========================================
LAST LOGIN
========================================== */

export async function updateLastLogin(uid){

    try{

        await update(

            ref(db,"users/"+uid),

            {

                lastLogin:

                new Date().toISOString()

            }

        );

    }

    catch(error){

        console.error(error);

    }

}

/* ==========================================
DASHBOARD SUMMARY
========================================== */

export async function getDashboardSummary(){

    const [

        users,
        students,
        teachers,
        classes

    ] = await Promise.all([

        getCount("users"),
        getCount("students"),
        getCount("teachers"),
        getCount("classes")

    ]);

    return{

        users,
        students,
        teachers,
        classes

    };

}

/* ==========================================
END OF FILE
========================================== */

