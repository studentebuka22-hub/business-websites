/* ==========================================================
   MathCloud Tutorial Academy Management System
   Firebase Configuration
   File: firebase/firebase-config.js
   Firebase SDK: v11+
   ========================================================== */

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js";

import { getAuth } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";

import { getDatabase } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-database.js";

import { getStorage } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-storage.js";

/* ==========================================================
   FIREBASE CONFIGURATION
   Replace with your Firebase project credentials
   ========================================================== */

const firebaseConfig = {
  apiKey: "AIzaSyBPgv60SxMhLC6XziEXyJYirilX6bVriwU",
  authDomain: "mathcloud-ee33b.firebaseapp.com",
  databaseURL: "https://mathcloud-ee33b-default-rtdb.firebaseio.com",
  projectId: "mathcloud-ee33b",
  storageBucket: "mathcloud-ee33b.firebasestorage.app",
  messagingSenderId: "843674576389",
  appId: "1:843674576389:web:a9f2ea7028160d8f6b5e6c"
};

/* ==========================================================
   INITIALIZE FIREBASE
   ========================================================== */

const app = initializeApp(firebaseConfig);

/* ==========================================================
   SERVICES
   ========================================================== */

const auth = getAuth(app);

const database = getDatabase(app);

const storage = getStorage(app);

/* ==========================================================
   DATABASE ROOT PATHS
   ========================================================== */

const DB = {

    USERS: "users",

    ADMINS: "admins",

    SUPER_ADMINS: "superAdmins",

    STUDENTS: "students",

    TEACHERS: "teachers",

    PARENTS: "parents",

    CLASSES: "classes",

    SUBJECTS: "subjects",

    DEPARTMENTS: "departments",

    ATTENDANCE: "attendance",

    RESULTS: "results",

    ASSIGNMENTS: "assignments",

    CBT: "cbt",

    THEORY_EXAMS: "theoryExams",

    LESSON_NOTES: "lessonNotes",

    TIMETABLE: "timetable",

    EVENTS: "events",

    NEWS: "news",

    GALLERY: "gallery",

    SETTINGS: "settings",

    NOTIFICATIONS: "notifications",

    MESSAGES: "messages",

    LOGS: "logs",

    FEES: "fees",

    PAYMENTS: "payments",

    ADMISSIONS: "admissions"

};

/* ==========================================================
   COLLECTION HELPERS
   ========================================================== */

const USERS_REF = DB.USERS;

const SETTINGS_REF = DB.SETTINGS;

const LOGS_REF = DB.LOGS;

const NEWS_REF = DB.NEWS;

const EVENTS_REF = DB.EVENTS;

const GALLERY_REF = DB.GALLERY;

/* ==========================================================
   APP INFORMATION
   ========================================================== */

const APP = {

    NAME: "MathCloud Tutorial Academy",

    VERSION: "1.0.0",

    AUTHOR: "MathCloud",

    DATABASE: "Firebase Realtime Database"

};

/* ==========================================================
   EXPORTS
   ========================================================== */

export {

    app,

    auth,

    database,

    database as db,

    storage,

    DB,

    USERS_REF,

    SETTINGS_REF,

    LOGS_REF,

    NEWS_REF,

    EVENTS_REF,

    GALLERY_REF,

    APP

};