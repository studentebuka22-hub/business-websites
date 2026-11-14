// admin-deposits.js
// PART 1

import {
auth,
db,
ref,
get,
update,
remove,
onValue
} from "./firebase.js";

import {
onAuthStateChanged,
signOut
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

/*====================================
DOM
====================================*/

const loader=document.getElementById("adminLoader");

const table=document.getElementById("depositTable");

const pendingCount=document.getElementById("pendingCount");

const approvedCount=document.getElementById("approvedCount");

const rejectedCount=document.getElementById("rejectedCount");

const totalDepositAmount=document.getElementById("totalDepositAmount");

const searchInput=document.getElementById("searchDeposit");

const statusFilter=document.getElementById("statusFilter");

const refreshBtn=document.getElementById("refreshDeposits");

const exportBtn=document.getElementById("exportDeposits");

const logoutBtn=document.getElementById("logoutBtn");

/*====================================
MODAL
====================================*/

const modal=document.getElementById("depositModal");

const modalUser=document.getElementById("modalUser");

const modalEmail=document.getElementById("modalEmail");

const modalAmount=document.getElementById("modalAmount");

const modalMethod=document.getElementById("modalMethod");

const modalTransaction=document.getElementById("modalTransaction");

const modalStatus=document.getElementById("modalStatus");

const modalDate=document.getElementById("modalDate");

const modalWallet=document.getElementById("modalWallet");

const modalProof=document.getElementById("modalProof");

const approveBtn=document.getElementById("approveDeposit");

const rejectBtn=document.getElementById("rejectDeposit");

const pendingBtn=document.getElementById("pendingDeposit");

const deleteBtn=document.getElementById("deleteDeposit");

const closeModal=document.getElementById("closeDepositModal");

/*====================================
VARIABLES
====================================*/

let deposits=[];

let users={};

let currentDeposit=null;

/*====================================
HELPERS
====================================*/

function money(value){

return "$"+Number(value||0).toLocaleString(undefined,{

minimumFractionDigits:2,

maximumFractionDigits:2

});

}

function date(value){

if(!value) return "-";

return new Date(value).toLocaleString();

}

function notify(message){

const box=document.getElementById("adminNotification");

const text=document.getElementById("adminNotificationText");

text.textContent=message;

box.style.display="flex";

setTimeout(()=>{

box.style.display="none";

},3000);

}
/*====================================
AUTHENTICATION
====================================*/

onAuthStateChanged(auth,async(user)=>{

if(!user){

location.href="login.html";

return;

}

const adminSnap=await get(

ref(db,"users/"+user.uid)

);

if(!adminSnap.exists()){

alert("Admin account not found.");

location.href="login.html";

return;

}

const admin=adminSnap.val();

if(admin.role!=="admin"){

location.href="dashboard.html";

return;

}

loader.style.display="none";

loadUsers();

loadDeposits();

bindEvents();

});

/*====================================
LOAD USERS
====================================*/

function loadUsers(){

onValue(

ref(db,"users"),

(snapshot)=>{

users={};

if(snapshot.exists()){

users=snapshot.val();

}

}

);

}

/*====================================
LOAD DEPOSITS
====================================*/

function loadDeposits(){

onValue(

ref(db,"deposits"),

(snapshot)=>{

deposits=[];

let pending=0;

let approved=0;

let rejected=0;

let total=0;

if(snapshot.exists()){

Object.entries(snapshot.val())

.forEach(([uid,userDeposits])=>{

Object.entries(userDeposits)

.forEach(([id,deposit])=>{

deposits.push({

uid,

id,

...deposit

});

total+=Number(

deposit.amount||0

);

if(deposit.status==="pending"){

pending++;

}

if(deposit.status==="approved"){

approved++;

}

if(deposit.status==="rejected"){

rejected++;

}

});

});

}

pendingCount.textContent=pending;

approvedCount.textContent=approved;

rejectedCount.textContent=rejected;

totalDepositAmount.textContent=money(total);

renderDeposits();

}

);

}

/*====================================
END PART 2
====================================*/
/*====================================
RENDER DEPOSIT TABLE
====================================*/

function renderDeposits(){

if(!table) return;

table.innerHTML="";

let list=[...deposits];

/*========== SEARCH ==========*/

if(searchInput.value.trim()!==""){

const keyword=searchInput.value

.toLowerCase()

.trim();

list=list.filter(item=>{

const user=users[item.uid]||{};

return(

(user.firstName||"")+" "+(user.lastName||"")+" "+

(user.email||"")+" "+

(item.coin||"")+" "+

(item.transactionId||"")+" "+

(item.status||"")

).toLowerCase().includes(keyword);

});

}

/*========== FILTER ==========*/

if(statusFilter.value!=="all"){

list=list.filter(

item=>item.status===statusFilter.value

);

}

/*========== EMPTY TABLE ==========*/

if(list.length===0){

table.innerHTML=`

<tr>

<td colspan="8">

No Deposit Requests Found

</td>

</tr>

`;

return;

}

/*========== TABLE ==========*/

list.sort(

(a,b)=>

(b.createdAt||0)-

(a.createdAt||0)

);

list.forEach(item=>{

const user=users[item.uid]||{};

const fullName=

(user.firstName||"")+" "+

(user.lastName||"");

table.innerHTML+=`

<tr>

<td>

${fullName}

</td>

<td>

${user.email||"-"}

</td>

<td>

${money(item.amount)}

</td>

<td>

${item.coin||"-"}

</td>

<td>

${item.transactionId||"-"}

</td>

<td>

<span class="badge ${item.status}">

${item.status.toUpperCase()}

</span>

</td>

<td>

${date(item.createdAt)}

</td>

<td>

<button

class="primary-btn viewDeposit"

data-user="${item.uid}"

data-id="${item.id}">

View

</button>

</td>

</tr>

`;

});

bindTableEvents();

}

/*====================================
END PART 3
====================================*/
/*====================================
VIEW DEPOSIT
====================================*/

function bindTableEvents(){

document

.querySelectorAll(".viewDeposit")

.forEach(button=>{

button.onclick=()=>{

openDeposit(

button.dataset.user,

button.dataset.id

);

};

});

}

async function openDeposit(uid,id){

const snap=await get(

ref(

db,

"deposits/"+uid+"/"+id

)

);

if(!snap.exists()) return;

const deposit=snap.val();

currentDeposit={uid,id};

const user=users[uid]||{};

modalUser.textContent=

(user.firstName||"")+" "+

(user.lastName||"");

modalEmail.textContent=

user.email||"-";

modalAmount.textContent=

money(deposit.amount);

modalMethod.textContent=

deposit.coin||"-";

modalTransaction.textContent=

deposit.transactionId||"-";

modalStatus.textContent=

deposit.status||"pending";

modalDate.textContent=

date(deposit.createdAt);

modalWallet.textContent=

deposit.walletAddress||"-";

if(deposit.proof){

modalProof.href=deposit.proof;

modalProof.style.display="inline-block";

}else{

modalProof.removeAttribute("href");

modalProof.textContent="No Proof Uploaded";

}

modal.style.display="flex";

}

/*====================================
MODAL EVENTS
====================================*/

closeModal.onclick=()=>{

modal.style.display="none";

currentDeposit=null;

};

window.onclick=(e)=>{

if(e.target===modal){

modal.style.display="none";

currentDeposit=null;

}

};

/*====================================
END PART 4
====================================*/
/*====================================
APPROVE / REJECT / PENDING / DELETE
====================================*/

approveBtn.onclick=async()=>{

if(!currentDeposit) return;

const depositRef=ref(

db,

`deposits/${currentDeposit.uid}/${currentDeposit.id}`

);

const walletRef=ref(

db,

`wallets/${currentDeposit.uid}`

);

const depositSnap=await get(depositRef);

if(!depositSnap.exists()) return;

const deposit=depositSnap.val();

/* Prevent double credit */

if(deposit.status==="approved"){

notify("Deposit already approved.");

return;

}

/* Update deposit */

await update(depositRef,{

status:"approved",

approved:true,

approvedAt:Date.now(),

approvedBy:auth.currentUser.uid

});

/* Credit wallet */

const walletSnap=await get(walletRef);

if(walletSnap.exists()){

const wallet=walletSnap.val();

await update(walletRef,{

balance:Number(wallet.balance||0)+Number(deposit.amount||0),

totalDeposit:Number(wallet.totalDeposit||0)+Number(deposit.amount||0),

lastUpdated:Date.now()

});

}else{

await update(walletRef,{

balance:Number(deposit.amount||0),

totalDeposit:Number(deposit.amount||0),

totalWithdrawal:0,

lastUpdated:Date.now()

});

}

notify("Deposit approved successfully.");

modal.style.display="none";

};

/*====================================
REJECT
====================================*/

rejectBtn.onclick=async()=>{

if(!currentDeposit) return;

await update(

ref(

db,

`deposits/${currentDeposit.uid}/${currentDeposit.id}`

),

{

status:"rejected",

rejected:true,

rejectedAt:Date.now(),

rejectedBy:auth.currentUser.uid

}

);

notify("Deposit rejected.");

modal.style.display="none";

};

/*====================================
MARK PENDING
====================================*/

pendingBtn.onclick=async()=>{

if(!currentDeposit) return;

await update(

ref(

db,

`deposits/${currentDeposit.uid}/${currentDeposit.id}`

),

{

status:"pending",

approved:false,

rejected:false,

updatedAt:Date.now()

}

);

notify("Deposit marked as pending.");

modal.style.display="none";

};

/*====================================
DELETE
====================================*/

deleteBtn.onclick=async()=>{

if(!currentDeposit) return;

if(!confirm("Delete this deposit?")) return;

await remove(

ref(

db,

`deposits/${currentDeposit.uid}/${currentDeposit.id}`

)

);

notify("Deposit deleted.");

modal.style.display="none";

currentDeposit=null;

};

/*====================================
END PART 5
====================================*/
/*====================================
BUTTON EVENTS
====================================*/

refreshBtn.onclick=()=>{

loadDeposits();

notify("Deposits refreshed.");

};

searchInput.addEventListener(

"input",

renderDeposits

);

statusFilter.addEventListener(

"change",

renderDeposits

);

/*====================================
EXPORT CSV
====================================*/

exportBtn.onclick=()=>{

let csv="User,Email,Amount,Coin,Transaction ID,Status,Date\n";

deposits.forEach(item=>{

const user=users[item.uid]||{};

csv+=`"${(user.firstName||"")+" "+(user.lastName||"")}","${user.email||""}","${item.amount||0}","${item.coin||""}","${item.transactionId||""}","${item.status||""}","${date(item.createdAt)}"\n`;

});

const blob=new Blob(

[csv],

{

type:"text/csv"

}

);

const url=

URL.createObjectURL(blob);

const a=

document.createElement("a");

a.href=url;

a.download=

"Deposits.csv";

a.click();

URL.revokeObjectURL(url);

notify(

"CSV exported successfully."

);

};

/*====================================
LOGOUT
====================================*/

logoutBtn.onclick=async()=>{

if(

!confirm(

"Logout administrator?"

)

) return;

await signOut(auth);

location.href="login.html";

};

/*====================================
READY
====================================*/

document.addEventListener(

"DOMContentLoaded",

()=>{

notify(

"Deposit Manager Ready"

);

});

/*====================================
END OF FILE
====================================*/

console.log(

"==================================="

);

console.log(

"ADMIN DEPOSIT MANAGER LOADED"

);

console.log(

"Realtime Firebase Connected"

);

console.log(

"Ready"

);

console.log(

"==================================="

);
/*====================================
AUTO REFRESH
====================================*/

setInterval(()=>{

loadDeposits();

},60000);

/*====================================
ONLINE / OFFLINE STATUS
====================================*/

window.addEventListener(

"online",

()=>{

notify(

"Internet Connected"

);

});

window.addEventListener(

"offline",

()=>{

notify(

"Internet Disconnected"

);

});

/*====================================
PAGE LOADER
====================================*/

window.addEventListener(

"load",

()=>{

loader.style.display="none";

});

/*====================================
ESC KEY CLOSE MODAL
====================================*/

document.addEventListener(

"keydown",

(event)=>{

if(

event.key==="Escape"

){

modal.style.display="none";

currentDeposit=null;

}

});

/*====================================
PREVENT DOUBLE CLICK
====================================*/

document

.querySelectorAll("button")

.forEach(button=>{

button.addEventListener(

"dblclick",

e=>{

e.preventDefault();

}

);

});

/*====================================
END OF admin-deposits.js
====================================*/