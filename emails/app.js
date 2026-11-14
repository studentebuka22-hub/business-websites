import { db } from "./firebase-config.js";

import {
ref,
push,
set,
onValue
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-database.js";

const emails=[

"sgandfamilyllc@gmail.com",
"mightymodelogistics@gmail.com",
"tremayne0104@gmail.com",
"littleschooley@gmail.com",
"moolajoseph1@gmail.com",
"esonsconcrete.lestercharleston@gmail.com",
"cdlcareernow@gmail.com",
"abcfreightdispatch@gmail.com",
"chicagolimitlesssolutionsllc@gmail.com",
"hysg@gmail.com",
"dungeoness17@gmail.com",
"calvinoost@gmail.com",
"adamputman7@gmail.com",
"cain.transportationllc@gmail.com",
"roadwrench25@gmail.com",
"jjventures2022@gmail.com",
"coastwidetransportationllc@gmail.com",
"nickyfearsome@gmail.com",
"haywoodld@gmail.com",
"pbcs@gmail.com",
"orleanspbcs@gmail.com",
"sgttrucker@gmail.com",
"amlogistics@gmail.com",
"dandptruckn@gmail.com",
"cccase1974@gmail.com",
"patrick.truckingtalent@gmail.com",
"jerry.haulconnect@gmail.com",
"alysonvb2007@gmail.com",
"bshaulers01@gmail.com",
"tonyderrickfb@gmail.com",
"roadreadyrecruitment24@gmail.com",
"tallenttruckingllc@gmail.com",
"rsmith@smithelitetransport.com",
"kjfergusontradeandlogistics@gmail.com",
"leewaytransportinc@gmail.com",
"tallenttruckingllc.am@gmail.com",
"abarent@gmail.com",
"flexhauling1@gmail.com",
"csmcleancontracting@gmail.com",
"dinka.tong@gmail.com",
"futurelogistics2025@gmail.com",
"kaasitruckingllc@gmail.com",
"dandzcorp@gmail.com",
"conyerstransport@gmail.com",
"xoblndllc@gmail.com",
"appleeyesenterp@gmail.com",
"uprabhjotsingh@gmail.com",
"blaquelogisticllc@gmail.com",
"nwcedispatch@gmail.com",
"pattimccleney@gmail.com"

];

const container=document.getElementById("emailContainer");

document.getElementById("count").innerHTML=
"Total Emails : "+emails.length;

function safeKey(email){

return email.replace(/[.#$[\]/]/g,"_");

}

function createCard(email){

const card=document.createElement("div");
card.className="card";

card.innerHTML=`

<div class="emailHeader">
<span>${email}</span>
<span>▼</span>
</div>

<div class="content">

<button class="copy">Copy Email</button>

<button class="commentBtn">Write Comment</button>

<div class="commentBox" style="display:none;">

<textarea placeholder="Write comment..."></textarea>

<button class="save">Save Comment</button>

</div>

<div class="chat"></div>

</div>

`;
    const header=card.querySelector(".emailHeader");
const content=card.querySelector(".content");
const chat=card.querySelector(".chat");
const commentBox=card.querySelector(".commentBox");
const textarea=card.querySelector("textarea");

header.onclick=()=>{

content.classList.toggle("active");

};

card.querySelector(".copy").onclick=()=>{

navigator.clipboard.writeText(email);

alert("Copied");

};

card.querySelector(".commentBtn").onclick=()=>{

commentBox.style.display=
commentBox.style.display==="block"
?"none"
:"block";

};

const commentsRef=ref(db,"comments/"+safeKey(email));

onValue(commentsRef,(snapshot)=>{

chat.innerHTML="";

if(!snapshot.exists()){

return;

}

const comments=[];

snapshot.forEach(child=>{

comments.push(child.val());

});

comments.sort((a,b)=>a.time-b.time);

comments.forEach(comment=>{

const div=document.createElement("div");

div.className="message";

div.innerHTML=`

<div>${comment.text}</div>

<div class="time">
${new Date(comment.time).toLocaleString()}
</div>

`;

chat.appendChild(div);

});

});

card.querySelector(".save").onclick=async()=>{

const text=textarea.value.trim();

if(text===""){

alert("Enter a comment");

return;

}

const newCommentRef=push(commentsRef);

await set(newCommentRef,{

email:email,

text:text,

time:Date.now()

});

textarea.value="";

commentBox.style.display="none";

alert("Comment saved");

};

container.appendChild(card);

}
emails.forEach(createCard);

document.getElementById("search").addEventListener("keyup",(e)=>{

const text=e.target.value.toLowerCase();

container.innerHTML="";

emails
.filter(email=>email.toLowerCase().includes(text))
.forEach(createCard);

});