//=====================================
// js/dashboard.js
//=====================================

import {

auth,
db,
storage,
ref,
get,
set,
update,
push,
onValue,
storageRef,
uploadBytes,
getDownloadURL

} from "./firebase.js";

import {

onAuthStateChanged

} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";


//=====================================
// LOAD CUSTOMER PROFILE
//=====================================

onAuthStateChanged(auth,(user)=>{

if(!user) return;

const uid=user.uid;

get(ref(db,"customers/"+uid)).then((snapshot)=>{

if(snapshot.exists()){

const data=snapshot.val();

document.getElementById("profileName").innerHTML=data.fullname;

document.getElementById("profileEmail").innerHTML=data.email;

document.getElementById("updateName").value=data.fullname;

document.getElementById("updatePhone").value=data.phone;

if(data.photo){

document.getElementById("profilePhoto").src=data.photo;

}

}

});


//=====================================
// LOAD USER STATISTICS
//=====================================

onValue(ref(db,"orders/"+uid),(snapshot)=>{

document.getElementById("myOrders").innerHTML=

snapshot.exists()

?Object.keys(snapshot.val()).length

:0;

});

onValue(ref(db,"messages/"+uid),(snapshot)=>{

document.getElementById("messagesSent").innerHTML=

snapshot.exists()

?Object.keys(snapshot.val()).length

:0;

});

onValue(ref(db,"contacts/"+uid),(snapshot)=>{

document.getElementById("savedContacts").innerHTML=

snapshot.exists()

?Object.keys(snapshot.val()).length

:0;

});

onValue(ref(db,"appointments/"+uid),(snapshot)=>{

document.getElementById("appointments").innerHTML=

snapshot.exists()

?Object.keys(snapshot.val()).length

:0;

});


//=====================================
// UPDATE PROFILE
//=====================================

const form=document.getElementById("updateProfileForm");

form.addEventListener("submit",async(e)=>{

e.preventDefault();

const name=document.getElementById("updateName").value;

const phone=document.getElementById("updatePhone").value;

const image=document.getElementById("profileImage").files[0];

let photoURL="";

if(image){

const imageRef=storageRef(

storage,

"profileImages/"+uid

);

await uploadBytes(imageRef,image);

photoURL=await getDownloadURL(imageRef);

}

const updates={

fullname:name,

phone:phone

};

if(photoURL!=""){

updates.photo=photoURL;

}

update(

ref(db,"customers/"+uid),

updates

).then(()=>{

alert("Profile Updated Successfully");

location.reload();

});

});

});


//=====================================
// LIVE BUSINESS ANNOUNCEMENTS
//=====================================

onValue(ref(db,"announcements"),(snapshot)=>{

if(!snapshot.exists()) return;

snapshot.forEach((item)=>{

console.log(item.val());

});

});


//=====================================
// QUICK WHATSAPP SUPPORT
//=====================================

window.openWhatsApp=function(){

window.open(

"https://wa.me/2348102341648",

"_blank"

);

};


//=====================================
// END dashboard.js
//=====================================

