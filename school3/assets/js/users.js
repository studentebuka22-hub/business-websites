/* ==========================================================
MathCloud Tutorial Academy
File: assets/js/users.js
Production Ready
========================================================== */

import { db } from "../../firebase/firebase-config.js";

import {

ref,
onValue,
remove,
update

} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-database.js";

/* ==========================================
INITIALIZE
========================================== */

document.addEventListener("DOMContentLoaded", () => {

    initializeUsersPage();

});

export function initializeUsersPage(){

    loadUsers();

    initializeSearch();

}

/* ==========================================
LOAD USERS
========================================== */

function loadUsers(){

    const tbody=document.querySelector("#usersTable tbody");

    if(!tbody) return;

    onValue(ref(db,"users"),(snapshot)=>{

        tbody.innerHTML="";

        if(!snapshot.exists()){

            tbody.innerHTML=`

            <tr>

            <td colspan="6">

            No users found.

            </td>

            </tr>

            `;

            return;

        }

        snapshot.forEach(user=>{

            const data=user.val();

            tbody.innerHTML+=`

            <tr>

            <td>

            <img src="${data.photo||'../../assets/images/avatar.png'}">

            </td>

            <td>${data.fullName||''}</td>

            <td>${data.email||''}</td>

            <td>

            <span class="roleBadge">

            ${data.role||''}

            </span>

            </td>

            <td>

            <span class="${data.status==='Suspended'
            ?'statusSuspended'
            :'statusActive'}">

            ${data.status||'Active'}

            </span>

            </td>

            <td>

            <div class="actionButtons">

            <button
            class="viewButton"
            data-id="${user.key}">

            <i class="fa fa-eye"></i>

            </button>

            <button
            class="editButton"
            data-id="${user.key}">

            <i class="fa fa-pen"></i>

            </button>

            <button
            class="deleteButton"
            data-id="${user.key}">

            <i class="fa fa-trash"></i>

            </button>

            </div>

            </td>

            </tr>

            `;

        });

        bindButtons();

    });

}

/* ==========================================
BUTTON EVENTS
========================================== */

function bindButtons(){

document.querySelectorAll(".deleteButton")

.forEach(button=>{

button.onclick=()=>{

if(confirm("Delete this user?")){

remove(ref(db,"users/"+button.dataset.id));

}

};

});

document.querySelectorAll(".editButton")

.forEach(button=>{

button.onclick=()=>{

alert("Edit User - Coming Next");

};

});

document.querySelectorAll(".viewButton")

.forEach(button=>{

button.onclick=()=>{

alert("User Profile - Coming Next");

};

});

}

/* ==========================================
SEARCH
========================================== */

function initializeSearch(){

const search=document.getElementById("searchUser");

if(!search) return;

search.addEventListener("keyup",()=>{

const keyword=search.value.toLowerCase();

document.querySelectorAll("#usersTable tbody tr")

.forEach(row=>{

row.style.display=

row.innerText.toLowerCase().includes(keyword)

? ""

: "none";

});

});

}

/* ==========================================
END OF FILE
========================================== */

