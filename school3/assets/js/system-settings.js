/* ==========================================================
MathCloud Tutorial Academy
File: assets/js/system-settings.js
Production Ready
========================================================== */

import { db } from "../../firebase/firebase-config.js";

import {

ref,
get,
set

} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-database.js";

/* ==========================================
INITIALIZE
========================================== */

document.addEventListener("DOMContentLoaded",()=>{

    initializeSystemSettings();

});

async function initializeSystemSettings(){

    await loadSettings();

    initializeForm();

}

/* ==========================================
LOAD SETTINGS
========================================== */

async function loadSettings(){

    try{

        const snapshot=

        await get(ref(db,"systemSettings"));

        if(!snapshot.exists()) return;

        const settings=snapshot.val();

        document.getElementById("appName").value=

        settings.appName || "";

        document.getElementById("supportEmail").value=

        settings.supportEmail || "";

        document.getElementById("supportPhone").value=

        settings.supportPhone || "";

        document.getElementById("schoolAddress").value=

        settings.schoolAddress || "";

        document.getElementById("timezone").value=

        settings.timezone || "Africa/Lagos";

    }

    catch(error){

        console.error(error);

        alert("Unable to load settings.");

    }

}

/* ==========================================
SAVE SETTINGS
========================================== */

function initializeForm(){

    const form=

    document.getElementById(

    "systemSettingsForm"

    );

    if(!form) return;

    form.addEventListener("submit",async(event)=>{

        event.preventDefault();

        const settings={

            appName:

            document.getElementById(

            "appName"

            ).value.trim(),

            supportEmail:

            document.getElementById(

            "supportEmail"

            ).value.trim(),

            supportPhone:

            document.getElementById(

            "supportPhone"

            ).value.trim(),

            schoolAddress:

            document.getElementById(

            "schoolAddress"

            ).value.trim(),

            timezone:

            document.getElementById(

            "timezone"

            ).value,

            updatedAt:

            new Date().toISOString()

        };

        try{

            await set(

                ref(db,"systemSettings"),

                settings

            );

            alert(

            "System settings saved successfully."

            );

        }

        catch(error){

            console.error(error);

            alert(

            "Unable to save settings."

            );

        }

    });

}

/* ==========================================
END OF FILE
========================================== */

