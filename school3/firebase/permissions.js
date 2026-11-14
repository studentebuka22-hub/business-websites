/* ==========================================================
   MathCloud Tutorial Academy Management System
   Role & Permission Engine
   File: firebase/permissions.js
   ========================================================== */

import { read } from "./database.js";

import { auth } from "./firebase-config.js";

/* ==========================================================
   SYSTEM ROLES
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
   PERMISSIONS
   ========================================================== */

export const PERMISSIONS = {

    CREATE_USER: "create_user",

    UPDATE_USER: "update_user",

    DELETE_USER: "delete_user",

    VIEW_USERS: "view_users",

    MANAGE_CLASSES: "manage_classes",

    MANAGE_SUBJECTS: "manage_subjects",

    MANAGE_RESULTS: "manage_results",

    MANAGE_ATTENDANCE: "manage_attendance",

    MANAGE_ASSIGNMENTS: "manage_assignments",

    MANAGE_TIMETABLE: "manage_timetable",

    MANAGE_NEWS: "manage_news",

    MANAGE_GALLERY: "manage_gallery",

    MANAGE_WEBSITE: "manage_website",

    MANAGE_FINANCE: "manage_finance",

    MANAGE_ADMISSION: "manage_admission",

    SEND_NOTIFICATION: "send_notification",

    BACKUP_DATABASE: "backup_database",

    RESTORE_DATABASE: "restore_database",

    VIEW_REPORTS: "view_reports",

    SYSTEM_SETTINGS: "system_settings"

};

/* ==========================================================
   CURRENT USER PROFILE
   ========================================================== */

export async function currentUserProfile() {

    const user = auth.currentUser;

    if (!user) return null;

    return await read(`users/${user.uid}`);

}

/* ==========================================================
   CURRENT ROLE
   ========================================================== */

export async function currentRole() {

    const profile = await currentUserProfile();

    return profile?.role || null;

}

/* ==========================================================
   IS SUPER ADMIN
   ========================================================== */

export async function isSuperAdmin() {

    return (await currentRole()) === ROLES.SUPER_ADMIN;

}

/* ==========================================================
   IS ADMIN
   ========================================================== */

export async function isAdmin() {

    return (await currentRole()) === ROLES.ADMIN;

}

/* ==========================================================
   HAS ROLE
   ========================================================== */

export async function hasRole(role) {

    return (await currentRole()) === role;

}

/* ==========================================================
   HAS ANY ROLE
   ========================================================== */

export async function hasAnyRole(roles = []) {

    const role = await currentRole();

    return roles.includes(role);

}

/* ==========================================================
   HAS PERMISSION
   ========================================================== */

export async function hasPermission(permission) {

    const profile = await currentUserProfile();

    if (!profile) return false;

    if (profile.role === ROLES.SUPER_ADMIN) {

        return true;

    }

    if (!Array.isArray(profile.permissions)) {

        return false;

    }

    return profile.permissions.includes(permission);

}

/* ==========================================================
   REQUIRE PERMISSION
   ========================================================== */

export async function requirePermission(permission) {

    const allowed = await hasPermission(permission);

    if (!allowed) {

        window.location.replace("/403.html");

    }

}

/* ==========================================================
   CHECK MULTIPLE PERMISSIONS
   ========================================================== */

export async function hasPermissions(permissionList = []) {

    const profile = await currentUserProfile();

    if (!profile) return false;

    if (profile.role === ROLES.SUPER_ADMIN) {

        return true;

    }

    if (!Array.isArray(profile.permissions)) {

        return false;

    }

    return permissionList.every(permission =>

        profile.permissions.includes(permission)

    );

}

/* ==========================================================
   END OF FILE
   ========================================================== */

