/* ==========================================================
   MathCloud Tutorial Academy Management System
   Route Guards & Access Control
   File: firebase/guards.js
   ========================================================== */

import { auth } from "./firebase-config.js";

import { authListener, logout } from "./auth.js";

import { read } from "./database.js";

/* ==========================================================
   LOGIN GUARD
   ========================================================== */

export function requireLogin() {

    authListener(user => {

        if (!user) {

            window.location.replace("/login.html");

        }

    });

}

/* ==========================================================
   GUEST GUARD
   ========================================================== */

export function requireGuest() {

    authListener(user => {

        if (user) {

            window.location.replace("/pages/dashboard.html");

        }

    });

}

/* ==========================================================
   ROLE GUARD
   ========================================================== */

export async function requireRole(expectedRole) {

    return new Promise((resolve, reject) => {

        authListener(async user => {

            if (!user) {

                window.location.replace("/login.html");

                reject(false);

                return;

            }

            const profile = await read(`users/${user.uid}`);

            if (!profile) {

                await logout();

                reject(false);

                return;

            }

            if (profile.status !== "active") {

                await logout();

                reject(false);

                return;

            }

            if (profile.role !== expectedRole) {

                window.location.replace("/403.html");

                reject(false);

                return;

            }

            resolve(profile);

        });

    });

}

/* ==========================================================
   MULTIPLE ROLES
   ========================================================== */

export async function requireAnyRole(roles = []) {

    return new Promise((resolve, reject) => {

        authListener(async user => {

            if (!user) {

                window.location.replace("/login.html");

                reject(false);

                return;

            }

            const profile = await read(`users/${user.uid}`);

            if (!profile) {

                await logout();

                reject(false);

                return;

            }

            if (!roles.includes(profile.role)) {

                window.location.replace("/403.html");

                reject(false);

                return;

            }

            resolve(profile);

        });

    });

}

/* ==========================================================
   SUPER ADMIN GUARD
   ========================================================== */

export function superAdminGuard() {

    return requireRole("super_admin");

}

/* ==========================================================
   ADMIN GUARD
   ========================================================== */

export function adminGuard() {

    return requireRole("admin");

}

/* ==========================================================
   ACCOUNT STATUS
   ========================================================== */

export async function accountIsActive() {

    const user = auth.currentUser;

    if (!user) return false;

    const profile = await read(`users/${user.uid}`);

    return profile?.status === "active";

}

/* ==========================================================
   EMAIL VERIFICATION
   ========================================================== */

export function emailVerified() {

    return auth.currentUser

        ? auth.currentUser.emailVerified

        : false;

}

/* ==========================================================
   CURRENT USER PROFILE
   ========================================================== */

export async function currentProfile() {

    const user = auth.currentUser;

    if (!user) return null;

    return await read(`users/${user.uid}`);

}

/* ==========================================================
   HAS PERMISSION
   ========================================================== */

export async function hasPermission(permission) {

    const profile = await currentProfile();

    if (!profile) return false;

    if (profile.role === "super_admin") return true;

    if (!profile.permissions) return false;

    return profile.permissions.includes(permission);

}

/* ==========================================================
   PAGE TITLE
   ========================================================== */

export function setPageTitle(title) {

    document.title = `${title} | MathCloud Tutorial Academy`;

}

/* ==========================================================
   END OF FILE
   ========================================================== */

