/* ==========================================================
MathCloud Tutorial Academy
File: assets/js/create-user.js
Production Ready
========================================================== */

import { createSystemUser } from "../../firebase/functions.js";

/* ==========================================
INITIALIZE
========================================== */

document.addEventListener("DOMContentLoaded", () => {

    initializeCreateUser();

});

export function initializeCreateUser(){

    initializePhotoPreview();

    initializeForm();

}

/* ==========================================
PHOTO PREVIEW
========================================== */

function initializePhotoPreview(){

    const photo=document.getElementById("photo");

    if(!photo) return;

    photo.addEventListener("change",()=>{

        const file=photo.files[0];

        if(!file) return;

        const reader=new FileReader();

        reader.onload=e=>{

            let preview=document.querySelector(".imagePreview img");

            if(preview){

                preview.src=e.target.result;

            }

        };

        reader.readAsDataURL(file);

    });

}

/* ==========================================
CREATE USER
========================================== */

function initializeForm(){

    const form = document.getElementById("createUserForm");

    if(!form) return;

    form.addEventListener("submit", async (e) => {

        e.preventDefault();

        const password = document.getElementById("password").value;

        const confirm = document.getElementById("confirmPassword").value;

        if(password !== confirm){

            alert("Passwords do not match.");

            return;

        }

        const user = {

            fullName: document.getElementById("fullName").value.trim(),

            email: document.getElementById("email").value.trim(),

            phone: document.getElementById("phone").value.trim(),

            role: document.getElementById("role").value,

            status: document.getElementById("status")?.value || "Active",

            photo: ""

        };

        try{

            const result = await createSystemUser({

                ...user,

                password

            });

            if(!result.success){

                alert(result.message);

                return;

            }

            alert("User created successfully.");

            form.reset();

            window.location.href = "../super-admin/users.html";

        }

        catch(error){

            console.error(error);

            alert(error.message || "Failed to create user.");

        }

    });

}

/* ==========================================
END OF FILE
========================================== */