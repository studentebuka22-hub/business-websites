// ================================
// js/app.js  (Part 1)
// ================================

import {

db,
ref,
push,
set,
onValue

} from "./firebase.js";


//==================================
// CONTACT FORM
//==================================

const contactForm=document.getElementById("contactForm");

if(contactForm){

contactForm.addEventListener("submit",function(e){

e.preventDefault();

const fullName=document.getElementById("name").value.trim();

const email=document.getElementById("email").value.trim();

const phone=document.getElementById("phone").value.trim();

const whatsapp=document.getElementById("whatsapp").value.trim();

const message=document.getElementById("message").value.trim();

const agree=document.getElementById("agree").checked;

if(!agree){

alert("Please agree before submitting.");

return;

}

const contactRef=push(ref(db,"contacts"));

set(contactRef,{

name:fullName,

email:email,

phone:phone,

whatsapp:whatsapp,

message:message,

date:new Date().toLocaleString(),

timestamp:Date.now()

}).then(()=>{

document.getElementById("toast").classList.add("show");

setTimeout(()=>{

document.getElementById("toast").classList.remove("show");

},3000);

contactForm.reset();

});

});

}


//==================================
// NEWSLETTER
//==================================

const newsletter=document.getElementById("newsletterForm");

if(newsletter){

newsletter.addEventListener("submit",function(e){

e.preventDefault();

const subscriberName=document.getElementById("subscriberName").value.trim();

const subscriberEmail=document.getElementById("subscriberEmail").value.trim();

const newsRef=push(ref(db,"newsletter"));

set(newsRef,{

name:subscriberName,

email:subscriberEmail,

date:new Date().toLocaleString(),

timestamp:Date.now()

}).then(()=>{

alert("Subscription Successful.");

newsletter.reset();

});

});

}


//==================================
// WEBSITE STATISTICS
//==================================

onValue(ref(db,"contacts"),(snapshot)=>{

const total=snapshot.exists()
?Object.keys(snapshot.val()).length
:0;

document.getElementById("messageCount").textContent=total;

});

onValue(ref(db,"customers"),(snapshot)=>{

const total=snapshot.exists()
?Object.keys(snapshot.val()).length
:0;

document.getElementById("customerCount").textContent=total;

});

onValue(ref(db,"products"),(snapshot)=>{

const total=snapshot.exists()
?Object.keys(snapshot.val()).length
:0;

document.getElementById("productCount").textContent=total;

});

onValue(ref(db,"services"),(snapshot)=>{

const total=snapshot.exists()
?Object.keys(snapshot.val()).length
:0;

document.getElementById("serviceCount").textContent=total;

});
//==================================
// LOAD PRODUCTS FROM FIREBASE
//==================================

const productContainer = document.getElementById("productContainer");

if (productContainer) {

onValue(ref(db,"products"), (snapshot)=>{

productContainer.innerHTML="";

if(!snapshot.exists()){

productContainer.innerHTML=`

<div class="productCard">

<img src="images/no-product.jpg">

<div class="productInfo">

<h3>No Products Available</h3>

<p>

Products added from the Admin Dashboard
will automatically appear here.

</p>

<div class="price">₦0.00</div>

<a href="#contact" class="buyBtn">

Contact Us

</a>

</div>

</div>

`;

return;

}

snapshot.forEach((child)=>{

const product=child.val();

productContainer.innerHTML += `

<div class="productCard">

<img src="${product.image}">

<div class="productInfo">

<h3>${product.name}</h3>

<p>${product.description}</p>

<div class="price">

₦${Number(product.price).toLocaleString()}

</div>

<a

href="https://wa.me/2348102341648?text=Hello,%20I%20am%20interested%20in%20${encodeURIComponent(product.name)}"

target="_blank"

class="buyBtn">

Buy Now

</a>

</div>

</div>

`;

});

});

}


//==================================
// LOAD SOCIAL MEDIA LINKS
//==================================

onValue(ref(db,"socialMedia"),(snapshot)=>{

if(!snapshot.exists()) return;

const social=snapshot.val();

const ids={

facebookLink:social.facebook||"#",

instagramLink:social.instagram||"#",

xLink:social.x||"#",

linkedinLink:social.linkedin||"#",

youtubeLink:social.youtube||"#",

telegramLink:social.telegram||"#",

tiktokLink:social.tiktok||"#",

threadsLink:social.threads||"#",

footerFacebook:social.facebook||"#",

footerInstagram:social.instagram||"#",

footerTikTok:social.tiktok||"#",

footerYoutube:social.youtube||"#",

footerLinkedin:social.linkedin||"#",

footerThreads:social.threads||"#",

footerTelegram:social.telegram||"#"

};

Object.keys(ids).forEach((id)=>{

const element=document.getElementById(id);

if(element){

element.href=ids[id];

element.target="_blank";

}

});

});


//==================================
// LOAD BUSINESS DETAILS
//==================================

onValue(ref(db,"business"),(snapshot)=>{

if(!snapshot.exists()) return;

const business=snapshot.val();

document.title=business.name || "Infinity Connect Business Hub";

const logo=document.querySelector(".logo span");

if(logo){

logo.textContent=business.name;

}

});


//==================================
// END OF app.js PART 2
//==================================

