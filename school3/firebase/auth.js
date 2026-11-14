/* ==========================================================
   MathCloud Tutorial Academy Management System
   Firebase Authentication Engine
   File: firebase/auth.js
   ========================================================== */

import { auth } from "./firebase-config.js";

import { read } from "./database.js";

import {

    signInWithEmailAndPassword,

    createUserWithEmailAndPassword,

    sendPasswordResetEmail,

    updateProfile,

    signOut,

    onAuthStateChanged,

    browserLocalPersistence,

    browserSessionPersistence,

    setPersistence

} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";

/* ==========================================================
   LOGIN
   ========================================================== */

export async function login(email, password, remember = true) {

    try {

        await setPersistence(
            auth,
            remember
                ? browserLocalPersistence
                : browserSessionPersistence
        );

        const credential = await signInWithEmailAndPassword(
            auth,
            email.trim(),
            password
        );

        // Load user profile from Realtime Database
        const profile = await getUserProfile(credential.user.uid);

        // Create session required by router.js
        const session = {
            uid: credential.user.uid,
            email: credential.user.email,
            name:
                profile?.fullName ||
                credential.user.displayName ||
                "",
            role:
                profile?.role ||
                "admin",
            loginTime: Date.now()
        };

        sessionStorage.setItem(
            "mta-session",
            JSON.stringify(session)
        );

        if (remember) {

            localStorage.setItem(
                "rememberLogin",
                "true"
            );

        } else {

            localStorage.removeItem(
                "rememberLogin"
            );

        }

        return {

            success: true,

            user: credential.user,

            profile: profile,

            session: session

        };

    }

    catch (error) {

        return {

            success: false,

            message: error.message

        };

    }

}

/* ==========================================================
   CREATE ACCOUNT
   ========================================================== */

export async function createAccount(

    fullName,

    email,

    password

) {

    try {

        const credential = await createUserWithEmailAndPassword(

            auth,

            email.trim(),

            password

        );

        await updateProfile(

            credential.user,

            {

                displayName: fullName

            }

        );

        return {

            success: true,

            uid: credential.user.uid

        };

    }

    catch (error) {

        return {

            success: false,

            message: error.message

        };

    }

}

/* ==========================================================
   PASSWORD RESET
   ========================================================== */

export async function resetPassword(email) {

    try {

        await sendPasswordResetEmail(

            auth,

            email.trim()

        );

        return true;

    }

    catch {

        return false;

    }

}

/* ==========================================================
   LOGOUT
   ========================================================== */

export async function logout() {

    try {

        await signOut(auth);

    } catch (error) {

        console.error(error);

    }

    sessionStorage.removeItem("mta-session");

    localStorage.removeItem("rememberLogin");

    window.location.replace("/login.html");

}

/* ==========================================================
   CURRENT USER
   ========================================================== */

export function currentUser() {

    return auth.currentUser;

}

/* ==========================================================
   USER PROFILE
   ========================================================== */

export async function getUserProfile(uid) {

    return await read(`users/${uid}`);

}

/* ==========================================================
   AUTH STATE
   ========================================================== */

export function authListener(callback) {

    onAuthStateChanged(

        auth,

        callback

    );

}

/* ==========================================================
   AUTH GUARD
   ========================================================== */

export function requireLogin() {

    onAuthStateChanged(

        auth,

        user=>{

            if(!user){

                window.location.href="/login.html";

            }

        }

    );

}

/* ==========================================================
   ROLE GUARD
   ========================================================== */

export async function requireRole(role){

    authListener(async(user)=>{

        if(!user){

            window.location.href="/login.html";

            return;

        }

        const profile=await getUserProfile(user.uid);

        if(!profile){

            await logout();

            return;

        }

        if(profile.role!==role){

            await logout();

        }

    });

}

/* ==========================================================
   SUPER ADMIN
   ========================================================== */

export function superAdminGuard(){

    requireRole("super_admin");

}

/* ==========================================================
   ADMIN
   ========================================================== */

export function adminGuard(){

    requireRole("admin");

}

/* ==========================================================
   USER INFORMATION
   ========================================================== */

export function userInfo(){

    if(!auth.currentUser) return null;

    return{

        uid:auth.currentUser.uid,

        email:auth.currentUser.email,

        name:auth.currentUser.displayName,

        verified:auth.currentUser.emailVerified

    };

}
/* ==========================================================
ADD THIS TO: firebase/auth.js
Production User Creation Engine
========================================================== */

import { createUser } from "./users-service.js";
import { createRole } from "./roles-service.js";
import { createStudent } from "./student-service.js";
import { createTeacher } from "./teacher-service.js";
import { createParent } from "./parent-service.js";
import { createAdmin } from "./admin-service.js";

/* ==========================================================
CREATE COMPLETE USER
========================================================== */

export async function createSystemUser(data){

    try{

        const credential = await createUserWithEmailAndPassword(

            auth,

            data.email.trim(),

            data.password

        );

        const uid = credential.user.uid;

        await updateProfile(

            credential.user,

            {

                displayName:data.fullName

            }

        );

        const profile={

            uid,

            fullName:data.fullName,

            email:data.email,

            phone:data.phone || "",

            role:data.role,

            status:"Active",

            createdAt:Date.now(),

            updatedAt:Date.now()

        };

        await createUser(profile);

        await createRole({

            uid,

            name:data.role,

            description:data.role

        });

        switch(data.role){

            case "Student":

                await createStudent({

                    uid,

                    ...profile,

                    admissionNumber:data.admissionNumber || "",

                    studentClass:data.studentClass || ""

                });

                break;

            case "Teacher":

                await createTeacher({

                    uid,

                    ...profile,

                    staffId:data.staffId || "",

                    department:data.department || ""

                });

                break;

            case "Parent":

                await createParent({

                    uid,

                    ...profile

                });

                break;

            case "Admin":

            case "Super Admin":

            case "Principal":

            case "Vice Principal":

            case "Accountant":

            case "Librarian":

                await createAdmin({

                    uid,

                    ...profile

                });

                break;

        }

        return{

            success:true,

            uid

        };

    }

    catch(error){

        return{

            success:false,

            message:error.message

        };

    }

}
/* ==========================================================
END
========================================================== */

/* ==========================================================
   END OF FILE
   ========================================================== */

