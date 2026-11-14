/* ==========================================================
MathCloud Tutorial Academy
Firebase Cloud Functions
File: functions/index.js
Production Ready
========================================================== */

const { onCall } = require("firebase-functions/v2/https");

const admin = require("firebase-admin");

admin.initializeApp();

/* ==========================================================
IMPORT FUNCTIONS
========================================================== */

const { createSystemUser } = require("./create-user");

/* ==========================================================
EXPORT FUNCTIONS
========================================================== */

exports.createSystemUser = onCall(createSystemUser);

/* ==========================================================
END OF FILE
========================================================== */

