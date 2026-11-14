/* ==========================================================
   MathCloud Tutorial Academy Management System
   Firebase Utility Functions
   File: firebase/helpers.js
   ========================================================== */

import { auth } from "./firebase-config.js";

/* ==========================================================
   GENERATE UNIQUE ID
   ========================================================== */

export function generateId(prefix = "") {

    const random = Math.random()

        .toString(36)

        .substring(2, 8)

        .toUpperCase();

    return `${prefix}${Date.now()}${random}`;

}

/* ==========================================================
   DATE & TIME
   ========================================================== */

export function currentTimestamp() {

    return Date.now();

}

export function currentDate() {

    return new Date().toISOString().split("T")[0];

}

export function currentTime() {

    return new Date().toLocaleTimeString();

}

/* ==========================================================
   FORMAT DATE
   ========================================================== */

export function formatDate(timestamp) {

    if (!timestamp) return "";

    return new Date(timestamp).toLocaleDateString(

        "en-NG",

        {

            year: "numeric",

            month: "long",

            day: "numeric"

        }

    );

}

/* ==========================================================
   FORMAT DATE & TIME
   ========================================================== */

export function formatDateTime(timestamp) {

    if (!timestamp) return "";

    return new Date(timestamp).toLocaleString(

        "en-NG"

    );

}

/* ==========================================================
   CAPITALIZE
   ========================================================== */

export function capitalize(text = "") {

    return text.replace(/\b\w/g, letter =>

        letter.toUpperCase()

    );

}

/* ==========================================================
   EMAIL VALIDATION
   ========================================================== */

export function validEmail(email) {

    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

}

/* ==========================================================
   PHONE VALIDATION
   ========================================================== */

export function validPhone(phone) {

    return /^(\+234|0)[789][01]\d{8}$/.test(phone);

}

/* ==========================================================
   PASSWORD VALIDATION
   ========================================================== */

export function strongPassword(password) {

    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(password);

}

/* ==========================================================
   RANDOM PASSWORD
   ========================================================== */

export function generatePassword(length = 10) {

    const chars =

        "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789@#$%";

    let password = "";

    for (let i = 0; i < length; i++) {

        password += chars.charAt(

            Math.floor(Math.random() * chars.length)

        );

    }

    return password;

}

/* ==========================================================
   USER UID
   ========================================================== */

export function uid() {

    return auth.currentUser?.uid || "";

}

/* ==========================================================
   USER EMAIL
   ========================================================== */

export function email() {

    return auth.currentUser?.email || "";

}

/* ==========================================================
   USER NAME
   ========================================================== */

export function displayName() {

    return auth.currentUser?.displayName || "";

}

/* ==========================================================
   COPY TO CLIPBOARD
   ========================================================== */

export async function copy(text) {

    await navigator.clipboard.writeText(text);

}

/* ==========================================================
   DOWNLOAD JSON
   ========================================================== */

export function downloadJSON(filename, data) {

    const blob = new Blob(

        [JSON.stringify(data, null, 2)],

        {

            type: "application/json"

        }

    );

    const link = document.createElement("a");

    link.href = URL.createObjectURL(blob);

    link.download

