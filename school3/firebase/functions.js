/* ==========================================================
MathCloud Tutorial Academy
File: firebase/functions.js
Production Ready
========================================================== */

import { getFunctions, httpsCallable } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-functions.js";

import { app } from "./firebase-config.js";

const functions = getFunctions(app);

/* ==========================================================
CREATE SYSTEM USER
========================================================== */

export async function createSystemUser(user){

    const callable = httpsCallable(

        functions,

        "createSystemUser"

    );

    const result = await callable(user);

    return result.data;

}

/* ==========================================================
END OF FILE
========================================================== */

