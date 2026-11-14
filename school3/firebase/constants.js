/* ==========================================================
   MathCloud Tutorial Academy Management System
   System Constants
   File: firebase/constants.js
   ========================================================== */

/* ==========================================================
   APPLICATION
   ========================================================== */

export const APP = {

    NAME: "MathCloud Tutorial Academy",

    SHORT_NAME: "MathCloud",

    VERSION: "1.0.0",

    AUTHOR: "MathCloud Tutorial Academy",

    COUNTRY: "Nigeria",

    CURRENCY: "NGN",

    SYMBOL: "₦",

    TIMEZONE: "Africa/Lagos",

    LANGUAGE: "en"

};

/* ==========================================================
   USER ROLES
   ========================================================== */

export const ROLES = {

    SUPER_ADMIN: "super_admin",

    ADMIN: "admin",

    PRINCIPAL: "principal",

    VICE_PRINCIPAL: "vice_principal",

    HOD: "head_of_department",

    TEACHER: "teacher",

    STUDENT: "student",

    PARENT: "parent",

    ACCOUNTANT: "accountant",

    LIBRARIAN: "librarian",

    EXAM_OFFICER: "exam_officer",

    ADMISSION_OFFICER: "admission_officer",

    RECEPTIONIST: "receptionist",

    ICT_ADMIN: "ict_admin"

};

/* ==========================================================
   ACCOUNT STATUS
   ========================================================== */

export const STATUS = {

    ACTIVE: "active",

    SUSPENDED: "suspended",

    DISABLED: "disabled",

    PENDING: "pending",

    GRADUATED: "graduated",

    EXPELLED: "expelled",

    ARCHIVED: "archived"

};

/* ==========================================================
   GENDER
   ========================================================== */

export const GENDER = {

    MALE: "male",

    FEMALE: "female"

};

/* ==========================================================
   TERMS
   ========================================================== */

export const TERMS = {

    FIRST: "First Term",

    SECOND: "Second Term",

    THIRD: "Third Term"

};

/* ==========================================================
   EXAM TYPES
   ========================================================== */

export const EXAMS = {

    ASSIGNMENT: "Assignment",

    TEST: "Test",

    PROJECT: "Project",

    MIDTERM: "Midterm",

    EXAMINATION: "Examination",

    PRACTICAL: "Practical"

};

/* ==========================================================
   RESULT GRADES
   ========================================================== */

export const GRADES = {

    A1: { min: 75, max: 100, remark: "Excellent" },

    B2: { min: 70, max: 74, remark: "Very Good" },

    B3: { min: 65, max: 69, remark: "Good" },

    C4: { min: 60, max: 64, remark: "Credit" },

    C5: { min: 55, max: 59, remark: "Credit" },

    C6: { min: 50, max: 54, remark: "Pass" },

    D7: { min: 45, max: 49, remark: "Fair" },

    E8: { min: 40, max: 44, remark: "Weak" },

    F9: { min: 0, max: 39, remark: "Fail" }

};

/* ==========================================================
   FILE TYPES
   ========================================================== */

export const FILES = {

    IMAGE: [

        "jpg",

        "jpeg",

        "png",

        "gif",

        "webp"

    ],

    DOCUMENT: [

        "pdf",

        "doc",

        "docx",

        "ppt",

        "pptx",

        "xls",

        "xlsx"

    ],

    AUDIO: [

        "mp3",

        "wav",

        "aac"

    ],

    VIDEO: [

        "mp4",

        "webm",

        "mov"

    ]

};

/* ==========================================================
   FILE SIZE LIMITS
   ========================================================== */

export const LIMITS = {

    IMAGE: 5 * 1024 * 1024,

    DOCUMENT: 20 * 1024 * 1024,

    AUDIO: 25 * 1024 * 1024,

    VIDEO: 100 * 1024 * 1024

};

/* ==========================================================
   LOCAL STORAGE KEYS
   ========================================================== */

export const STORAGE_KEYS = {

    THEME: "mta-theme",

    SESSION: "mta-session",

    REMEMBER: "mta-remember",

    SETTINGS: "mta-settings"

};

/* ==========================================================
   NOTIFICATION TYPES
   ========================================================== */

export const NOTIFICATION = {

    SUCCESS: "success",

    ERROR: "error",

    WARNING: "warning",

    INFO: "info"

};

/* ==========================================================
   END OF FILE
   ========================================================== */

