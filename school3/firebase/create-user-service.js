/* ==========================================================
MathCloud Tutorial Academy
File: firebase/create-user-service.js
Production Ready
========================================================== */

import { auth } from "./firebase-config.js";
import { db } from "./firebase-config.js";

import {

createUserWithEmailAndPassword

} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";

import {

ref,
set,
serverTimestamp

} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-database.js";

/* ==========================================
CREATE AUTHENTICATION ACCOUNT
========================================== */

export async function registerUser(user){

    try{

        const credential =

        await createUserWithEmailAndPassword(

            auth,

            user.email,

            user.password

        );

        const uid = credential.user.uid;

        await set(

            ref(db,"users/"+uid),

            {

                uid,

                fullName:user.fullName,

                email:user.email,

                phone:user.phone,

                role:user.role,

                status:user.status,

                photo:user.photo || "",

                createdAt:serverTimestamp(),

                updatedAt:serverTimestamp(),

                lastLogin:null,

                createdBy:"Super Admin"

            }

        );

        return{

            success:true,

            uid

        };

    }

    catch(error){

        console.error(error);

        return{

            success:false,

            message:error.message

        };

    }

}

/* ==========================================
END OF FILE
========================================== */

