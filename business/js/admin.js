//=====================================
// js/admin.js (Part 1)
//=====================================

import {

auth,
db,
storage,
ref,
push,
set,
get,
update,
remove,
onValue,
storageRef,
uploadBytes,
getDownloadURL

} from "./firebase.js";

import {

onAuthStateChanged

} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";


//=====================================
// ADMIN AUTH CHECK
//=====================================

onAuthStateChanged(auth,(user)=>{

if(!user){

window.location="login.html";

return;

}

});


//=====================================
// DASHBOARD STATISTICS
//=====================================

onValue(ref(db,"customers"),(snapshot)=>{

document.getElementById("totalCustomers").innerHTML=

snapshot.exists()

?Object.keys(snapshot.val()).length

:0;

});

onValue(ref(db,"products"),(snapshot)=>{

document.getElementById("totalProducts").innerHTML=

snapshot.exists()

?Object.keys(snapshot.val()).length

:0;

});

onValue(ref(db,"services"),(snapshot)=>{

document.getElementById("totalServices").innerHTML=

snapshot.exists()

?Object.keys(snapshot.val()).length

:0;

});

onValue(ref(db,"contacts"),(snapshot)=>{

document.getElementById("totalMessages").innerHTML=

snapshot.exists()

?Object.keys(snapshot.val()).length

:0;

});


//=====================================
// ADD PRODUCT
//=====================================

const productForm=document.getElementById("productForm");

if(productForm){

productForm.addEventListener("submit",async(e)=>{

e.preventDefault();

const name=document.getElementById("productName").value;

const price=document.getElementById("productPrice").value;

const category=document.getElementById("productCategory").value;

const description=document.getElementById("productDescription").value;

const image=document.getElementById("productImage").files[0];

let imageURL="";

if(image){

const imgRef=storageRef(

storage,

"products/"+Date.now()+"_"+image.name

);

await uploadBytes(imgRef,image);

imageURL=await getDownloadURL(imgRef);

}

const id=push(ref(db,"products"));

set(id,{

name,

price,

category,

description,

image:imageURL,

created:new Date().toLocaleString(),

timestamp:Date.now()

}).then(()=>{

alert("Product Added Successfully");

productForm.reset();

});

});

}


//=====================================
// LOAD PRODUCTS
//=====================================

onValue(ref(db,"products"),(snapshot)=>{

const productList=document.getElementById("productList");

productList.innerHTML="";

if(!snapshot.exists()){

productList.innerHTML="<p>No Products Found.</p>";

return;

}

snapshot.forEach((item)=>{

const key=item.key;

const product=item.val();

productList.innerHTML+=`

<div style="padding:15px;
margin-bottom:15px;
border:1px solid #ddd;
border-radius:10px;">

<img src="${product.image}"
style="width:100%;
max-height:180px;
object-fit:cover;
border-radius:8px;">

<h3>${product.name}</h3>

<p>${product.category}</p>

<strong>₦${Number(product.price).toLocaleString()}</strong>

<br><br>

<button
onclick="deleteProduct('${key}')">

Delete

</button>

</div>

`;

});

});
//=====================================
// js/admin.js (Part 2)
//=====================================


//=====================================
// DELETE PRODUCT
//=====================================

window.deleteProduct=function(id){

if(!confirm("Delete this product?")) return;

remove(ref(db,"products/"+id))

.then(()=>{

alert("Product Deleted Successfully");

});

};


//=====================================
// ADD SERVICE
//=====================================

const serviceForm=document.getElementById("serviceForm");

if(serviceForm){

serviceForm.addEventListener("submit",(e)=>{

e.preventDefault();

const id=push(ref(db,"services"));

set(id,{

name:document.getElementById("serviceName").value,

description:document.getElementById("serviceDescription").value,

created:new Date().toLocaleString(),

timestamp:Date.now()

}).then(()=>{

alert("Service Saved Successfully");

serviceForm.reset();

});

});

}


//=====================================
// LOAD SERVICES
//=====================================

onValue(ref(db,"services"),(snapshot)=>{

const serviceList=document.getElementById("serviceList");

serviceList.innerHTML="";

if(!snapshot.exists()){

serviceList.innerHTML="<p>No Services Available.</p>";

return;

}

snapshot.forEach((item)=>{

const key=item.key;

const service=item.val();

serviceList.innerHTML+=`

<div style="padding:15px;
margin-bottom:15px;
border:1px solid #ddd;
border-radius:10px;">

<h3>${service.name}</h3>

<p>${service.description}</p>

<button
onclick="deleteService('${key}')">

Delete

</button>

</div>

`;

});

});

window.deleteService=function(id){

if(!confirm("Delete this service?")) return;

remove(ref(db,"services/"+id));

};


//=====================================
// SAVE SOCIAL MEDIA LINKS
//=====================================

const socialForm=document.getElementById("socialForm");

if(socialForm){

socialForm.addEventListener("submit",(e)=>{

e.preventDefault();

set(ref(db,"socialMedia"),{

facebook:document.getElementById("facebook").value,

instagram:document.getElementById("instagram").value,

tiktok:document.getElementById("tiktok").value,

x:document.getElementById("x").value,

linkedin:document.getElementById("linkedin").value,

youtube:document.getElementById("youtube").value,

telegram:document.getElementById("telegram").value,

threads:document.getElementById("threads").value

}).then(()=>{

alert("Social Media Updated");

});

});

};


//=====================================
// LOAD SOCIAL MEDIA
//=====================================

onValue(ref(db,"socialMedia"),(snapshot)=>{

if(!snapshot.exists()) return;

const s=snapshot.val();

document.getElementById("facebook").value=s.facebook||"";

document.getElementById("instagram").value=s.instagram||"";

document.getElementById("tiktok").value=s.tiktok||"";

document.getElementById("x").value=s.x||"";

document.getElementById("linkedin").value=s.linkedin||"";

document.getElementById("youtube").value=s.youtube||"";

document.getElementById("telegram").value=s.telegram||"";

document.getElementById("threads").value=s.threads||"";

});
//=====================================
// js/admin.js (Part 3)
//=====================================


//=====================================
// SAVE BUSINESS INFORMATION
//=====================================

const businessForm=document.getElementById("businessForm");

if(businessForm){

businessForm.addEventListener("submit",(e)=>{

e.preventDefault();

set(ref(db,"business"),{

name:document.getElementById("businessName").value,

email:document.getElementById("businessEmail").value,

phone:document.getElementById("businessPhone").value,

address:document.getElementById("businessAddress").value,

about:document.getElementById("businessAbout").value,

updated:new Date().toLocaleString(),

timestamp:Date.now()

}).then(()=>{

alert("Business Information Updated Successfully");

});

});

}


//=====================================
// LOAD BUSINESS INFORMATION
//=====================================

onValue(ref(db,"business"),(snapshot)=>{

if(!snapshot.exists()) return;

const business=snapshot.val();

document.getElementById("businessName").value=

business.name || "";

document.getElementById("businessEmail").value=

business.email || "";

document.getElementById("businessPhone").value=

business.phone || "+2348102341648";

document.getElementById("businessAddress").value=

business.address || "";

document.getElementById("businessAbout").value=

business.about || "";

});


//=====================================
// LOAD CONTACT MESSAGES
//=====================================

onValue(ref(db,"contacts"),(snapshot)=>{

const messageList=document.getElementById("messageList");

messageList.innerHTML="";

if(!snapshot.exists()){

messageList.innerHTML="<h3>No Messages Yet.</h3>";

return;

}

snapshot.forEach((item)=>{

const key=item.key;

const msg=item.val();

messageList.innerHTML+=`

<div style="background:#fff;
padding:20px;
margin-bottom:20px;
border-radius:15px;
box-shadow:0 5px 20px rgba(0,0,0,.08);">

<h3>${msg.name}</h3>

<p>

<b>Email:</b> ${msg.email}

</p>

<p>

<b>Phone:</b> ${msg.phone}

</p>

<p>

<b>WhatsApp:</b> ${msg.whatsapp}

</p>

<p>

<b>Message:</b>

<br>

${msg.message}

</p>

<p>

<b>Date:</b>

${msg.date}

</p>

<div style="margin-top:15px;display:flex;gap:10px;flex-wrap:wrap;">

<a

href="https://wa.me/${msg.whatsapp.replace(/\+/g,'').replace(/\s/g,'')}"

target="_blank"

class="btn">

WhatsApp

</a>

<a

href="mailto:${msg.email}"

class="btn2">

Email

</a>

<button

onclick="deleteMessage('${key}')"

class="loginBtn">

Delete

</button>

</div>

</div>

`;

});

});


//=====================================
// DELETE MESSAGE
//=====================================

window.deleteMessage=function(id){

if(confirm("Delete this message?")){

remove(ref(db,"contacts/"+id))

.then(()=>{

alert("Message Deleted");

});

}

};


//=====================================
// END admin.js
//=====================================

