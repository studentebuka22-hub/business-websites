// deposit.js
// PART 1

import {
auth,
db,
ref,
push,
set,
get,
onValue
} from "./firebase.js";

import {
onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

/*====================================
DOM
====================================*/

const loader=document.getElementById("pageLoader");

const form=document.getElementById("depositForm");

const crypto=document.getElementById("cryptoType");

const wallet=document.getElementById("walletAddress");

const amount=document.getElementById("depositAmount");

const txid=document.getElementById("txid");

const proof=document.getElementById("proofImage");

const qr=document.getElementById("walletQRCode");

const history=document.getElementById("depositHistory");

const availableBalance=document.getElementById("availableBalance");

const walletBalance=document.getElementById("walletBalance");

const totalDeposited=document.getElementById("totalDeposited");

const pendingDeposits=document.getElementById("pendingDeposits");

const approvedDeposits=document.getElementById("approvedDeposits");

let currentUser=null;

const wallets={

BTC:"bc1p65vasf6fg35lzuuxq29rnek29e22xqscct2up4q6pjfavugacgessxsdhv",

ETH:"0x3cA59101cf8B84441Ee98c9b2B57EEd4133b2579",

BASE:"0x3cA59101cf8B84441Ee98c9b2B57EEd4133b2579",

POLYGON:"0x3cA59101cf8B84441Ee98c9b2B57EEd4133b2579",

SOL:"GuyQ5SfR3Bjhw32qcSkCD9LkpwpU8TUB2PaCWgDibdw5",

SUI:"0xb8f3adb4226f5227e3afc340cdde87f9d4178482167506cd21c69ccd1353b3d2",

MONAD:"0x3cA59101cf8B84441Ee98c9b2B57EEd4133b2579"

};

/*====================================
AUTH
====================================*/

onAuthStateChanged(auth,async(user)=>{

if(!user){

location.replace("login.html");

return;

}

currentUser=user;

loader.style.display="none";

loadWallet();

loadDeposits();

});
/*====================================
WALLET SELECTOR
====================================*/

crypto.addEventListener(

"change",

()=>{

const coin=crypto.value;

wallet.value=wallets[coin]||"";

qr.innerHTML=`

<img

src="https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(wallet.value)}"

style="width:220px;height:220px;border-radius:10px;">

`;

}

/*====================================
COPY WALLET
====================================*/

);

document

.getElementById("copyWallet")

.onclick=()=>{

navigator.clipboard.writeText(

wallet.value

);

showNotification(

"Wallet copied successfully."

);

};

/*====================================
LOAD WALLET
====================================*/

function loadWallet(){

onValue(

ref(

db,

"wallets/"+currentUser.uid

),

snapshot=>{

if(snapshot.exists()){

const data=snapshot.val();

availableBalance.textContent=

money(data.balance);

walletBalance.textContent=

money(data.balance);

}else{

availableBalance.textContent="$0.00";

walletBalance.textContent="$0.00";

}

}

);

}

function money(value){

return "$"+

Number(value||0)

.toLocaleString(undefined,{

minimumFractionDigits:2,

maximumFractionDigits:2

});

}
/*====================================
LOAD DEPOSITS
====================================*/

function loadDeposits(){

onValue(

ref(

db,

"deposits/"+currentUser.uid

),

snapshot=>{

history.innerHTML="";

let total=0;

let pending=0;

let approved=0;

if(!snapshot.exists()){

history.innerHTML=`

<tr>

<td colspan="6">

No deposits found.

</td>

</tr>

`;

totalDeposited.textContent="$0.00";

pendingDeposits.textContent="0";

approvedDeposits.textContent="0";

return;

}

Object.entries(snapshot.val())

.reverse()

.forEach(([id,deposit])=>{

total+=Number(deposit.amount||0);

if(deposit.status==="approved"){

approved++;

}else if(deposit.status==="pending"){

pending++;

}

history.innerHTML+=`

<tr>

<td>

${money(deposit.amount)}

</td>

<td>

${deposit.coin}

</td>

<td>

${deposit.transactionId}

</td>

<td>

<span class="badge ${deposit.status}">

${deposit.status.toUpperCase()}

</span>

</td>

<td>

${new Date(deposit.createdAt).toLocaleString()}

</td>

<td>

<button

class="primary-btn viewDeposit"

data-id="${id}">

View

</button>

</td>

</tr>

`;

});

totalDeposited.textContent=

money(total);

pendingDeposits.textContent=

pending;

approvedDeposits.textContent=

approved;

bindViewButtons();

}

);

}
/*====================================
SUBMIT DEPOSIT
====================================*/

form.addEventListener(

"submit",

async(e)=>{

e.preventDefault();

showLoader();

try{

const depositRef=

push(

ref(

db,

"deposits/"+currentUser.uid

)

);

let proofURL="";

if(proof.files.length>0){

proofURL=await new Promise((resolve,reject)=>{

const reader=new FileReader();

reader.onload=e=>resolve(e.target.result);

reader.onerror=()=>reject("Unable to read proof image.");

reader.readAsDataURL(proof.files[0]);

});

}

await set(

depositRef,

{

amount:Number(amount.value),

coin:crypto.value,

walletAddress:wallet.value,

transactionId:txid.value.trim(),

proof:proofURL,

status:"pending",

createdAt:Date.now(),

updatedAt:Date.now()

}

);

form.reset();

wallet.value="";

qr.innerHTML="QR CODE";

hideLoader();

showNotification(

"Deposit request submitted successfully."

);

}catch(error){

hideLoader();

alert(

error.message

);

}

});
/*====================================
VIEW DEPOSIT
====================================*/

let currentDeposit=null;

function bindViewButtons(){

document

.querySelectorAll(".viewDeposit")

.forEach(button=>{

button.onclick=()=>{

openDeposit(

button.dataset.id

);

};

});

}

async function openDeposit(id){

const snapshot=

await get(

ref(

db,

"deposits/"+currentUser.uid+"/"+id

)

);

if(!snapshot.exists()) return;

const deposit=snapshot.val();

currentDeposit=id;

document.getElementById("viewAmount").textContent=

money(deposit.amount);

document.getElementById("viewCoin").textContent=

deposit.coin;

document.getElementById("viewStatus").textContent=

deposit.status.toUpperCase();

document.getElementById("viewWallet").textContent=

deposit.walletAddress;

document.getElementById("viewTxid").textContent=

deposit.transactionId;

document.getElementById("viewDate").textContent=

new Date(

deposit.createdAt

).toLocaleString();

document.getElementById("viewProof").src=

deposit.proof||

"images/no-image.png";

document.getElementById("depositModal").style.display=

"flex";

}

document

.getElementById("closeDepositModal")

.onclick=()=>{

document.getElementById("depositModal").style.display=

"none";

};
/*====================================
NOTIFICATIONS
====================================*/

function showNotification(message){

const box=

document.getElementById("notification");

const text=

document.getElementById("notificationText");

text.textContent=message;

box.style.display="flex";

setTimeout(()=>{

box.style.display="none";

},3000);

}

/*====================================
LOADER
====================================*/

function showLoader(){

document.getElementById("pageOverlay").style.display="flex";

}

function hideLoader(){

document.getElementById("pageOverlay").style.display="none";

}

/*====================================
ONLINE / OFFLINE
====================================*/

window.addEventListener(

"online",

()=>{

showNotification(

"Internet Connected"

);

}

);

window.addEventListener(

"offline",

()=>{

showNotification(

"Internet Disconnected"

);

}

);

/*====================================
READY
====================================*/

document.addEventListener(

"DOMContentLoaded",

()=>{

showNotification(

"Deposit Center Ready"

);

});

/*====================================
END OF FILE
====================================*/

console.log(

"===================================="

);

console.log(

"CRYPTO USER DEPOSIT CENTER"

);

console.log(

"Realtime Firebase Connected"

);

console.log(

"Deposit Module Initialized"

);

console.log(

"===================================="

);
