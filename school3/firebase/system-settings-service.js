/* ==========================================================
MathCloud Tutorial Academy
File: firebase/system-settings-service.js
Production Ready
========================================================== */

import { db } from "./firebase-config.js";

import {

ref,
get,
set,
update

} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-database.js";

/* ==========================================
DEFAULT SETTINGS
========================================== */

const defaultSettings = {

    appName:"MathCloud Tutorial Academy",

    supportEmail:"",

    supportPhone:"",

    schoolAddress:"",

    timezone:"Africa/Lagos",

    currency:"NGN",

    language:"English",

    maintenanceMode:false,

    allowRegistration:true,

    updatedAt:new Date().toISOString()

};

/* ==========================================
INITIALIZE SETTINGS
========================================== */

export async function initializeSettings(){

    const snapshot = await get(

        ref(db,"systemSettings")

    );

    if(!snapshot.exists()){

        await set(

            ref(db,"systemSettings"),

            defaultSettings

        );

    }

}

/* ==========================================
GET SETTINGS
========================================== */

export async function getSettings(){

    const snapshot = await get(

        ref(db,"systemSettings")

    );

    return snapshot.exists()

        ? snapshot.val()

        : defaultSettings;

}

/* ==========================================
SAVE SETTINGS
========================================== */

export async function saveSettings(settings){

    settings.updatedAt =

    new Date().toISOString();

    await set(

        ref(db,"systemSettings"),

        settings

    );

}

/* ==========================================
UPDATE SETTINGS
========================================== */

export async function updateSettings(data){

    data.updatedAt =

    new Date().toISOString();

    await update(

        ref(db,"systemSettings"),

        data

    );

}

/* ==========================================
GET MAINTENANCE MODE
========================================== */

export async function isMaintenanceMode(){

    const snapshot = await get(

        ref(db,"systemSettings/maintenanceMode")

    );

    return snapshot.exists()

        ? snapshot.val()

        : false;

}

/* ==========================================
END OF FILE
========================================== */

