/* ==========================================================
MathCloud Tutorial Academy
Firebase Cloud Functions
File: functions/create-user.js
Production Ready
========================================================== */

const admin = require("firebase-admin");

/* ==========================================================
CREATE SYSTEM USER
========================================================== */

async function createSystemUser(request) {

    const data = request.data;

    const user = await admin.auth().createUser({

        email: data.email,

        password: data.password,

        displayName: data.fullName,

        disabled: false

    });

    const uid = user.uid;

    const profile = {

        uid,

        fullName: data.fullName,

        email: data.email,

        phone: data.phone || "",

        role: data.role,

        status: data.status || "Active",

        photo: "",

        createdAt: Date.now(),

        updatedAt: Date.now()

    };

    const db = admin.database();

    await db.ref(`users/${uid}`).set(profile);

    await db.ref(`roles/${uid}`).set({

        uid,

        name: data.role,

        status: "Active",

        createdAt: Date.now(),

        updatedAt: Date.now()

    });

    switch (data.role) {

        case "Student":

            await db.ref(`students/${uid}`).set(profile);

            break;

        case "Teacher":

            await db.ref(`teachers/${uid}`).set(profile);

            break;

        case "Parent":

            await db.ref(`parents/${uid}`).set(profile);

            break;

        default:

            await db.ref(`admins/${uid}`).set(profile);

    }

    return {

        success: true,

        uid

    };

}

/* ==========================================================
EXPORT
========================================================== */

module.exports = {

    createSystemUser

};

/* ==========================================================
END OF FILE
========================================================== */