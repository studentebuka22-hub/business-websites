//======================================
// js/auth.js (Part 1)
//======================================

import {

auth,
db,
ref,
set

} from "./firebase.js";

import {

createUserWithEmailAndPassword,
signInWithEmailAndPassword,
sendPasswordResetEmail,
onAuthStateChanged,
signOut

} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";


//======================================
// REGISTER
//======================================

const registerForm=document.getElementById("registerForm");

if(registerForm){

registerForm.addEventListener("submit",(e)=>{

e.preventDefault();

const fullname=document.getElementById("fullname").value.trim();

const phone=document.getElementById("phone").value.trim();

const email=document.getElementById("email").value.trim();

const password=document.getElementById("password").value;

createUserWithEmailAndPassword(auth,email,password)

.then((userCredential)=>{

const uid=userCredential.user.uid;

set(ref(db,"customers/"+uid),{

uid:uid,

fullname:fullname,

phone:phone,

email:email,

joined:new Date().toLocaleString(),

role:"customer"

});

alert("Registration Successful");

window.location="dashboard.html";

})

.catch((error)=>{

alert(error.message);

});

});

}


//======================================
// LOGIN
//======================================

const loginForm=document.getElementById("loginForm");

if(loginForm){

loginForm.addEventListener("submit",(e)=>{

e.preventDefault();

const email=document.getElementById("loginEmail").value.trim();

const password=document.getElementById("loginPassword").value;

signInWithEmailAndPassword(auth,email,password)

.then(()=>{

window.location="dashboard.html";

})

.catch((error)=>{

document.getElementById("loginMessage").innerHTML=

error.message;

});

});

}


//======================================
// PASSWORD RESET
//======================================

const forgot=document.getElementById("forgotPassword");

if(forgot){

forgot.onclick=()=>{

const email=prompt(

"Enter your registered email address"

);

if(!email) return;

sendPasswordResetEmail(auth,email)

.then(()=>{

alert(

"Password reset email has been sent."

);

})

.catch((error)=>{

alert(error.message);

});

};

}
//======================================
// js/auth.js (Part 2)
//======================================


//======================================
// CHECK AUTHENTICATION
//======================================

onAuthStateChanged(auth,(user)=>{

if(user){

const profileName=document.getElementById("profileName");

const profileEmail=document.getElementById("profileEmail");

const profilePhoto=document.getElementById("profilePhoto");

if(profileName){

ref(db,"customers/"+user.uid);

import("./firebase.js").then(({get})=>{

get(ref(db,"customers/"+user.uid)).then((snapshot)=>{

if(snapshot.exists()){

const data=snapshot.val();

profileName.innerHTML=data.fullname;

profileEmail.innerHTML=data.email;

if(profilePhoto){

profilePhoto.src=data.photo ||
"images/user.png";

}

}

});

});

}

}

});


//======================================
// LOGOUT
//======================================

const logoutBtn=document.getElementById("logoutBtn");

if(logoutBtn){

logoutBtn.onclick=()=>{

if(confirm("Are you sure you want to logout?")){

signOut(auth)

.then(()=>{

window.location="login.html";

})

.catch((error)=>{

alert(error.message);

});

}

};

}


//======================================
// PROTECT PAGES
//======================================

const protectedPages=[

"dashboard.html",

"admin.html",

"profile.html",

"messages.html",

"settings.html"

];

const currentPage=window.location.pathname.split("/").pop();

if(protectedPages.includes(currentPage)){

onAuthStateChanged(auth,(user)=>{

if(!user){

window.location="login.html";

}

});

}


//======================================
// SESSION GREETING
//======================================

onAuthStateChanged(auth,(user)=>{

const welcome=document.getElementById("welcomeUser");

if(user && welcome){

welcome.innerHTML=

`Welcome, ${user.email}`;

}

});


//======================================
// AUTO REDIRECT IF ALREADY LOGGED IN
//======================================

const authPages=[

"login.html",

"register.html"

];

if(authPages.includes(currentPage)){

onAuthStateChanged(auth,(user)=>{

if(user){

window.location="dashboard.html";

}

});

}


//======================================
// END OF auth.js
//======================================

