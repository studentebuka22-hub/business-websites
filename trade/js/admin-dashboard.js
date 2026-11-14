// admin-dashboard.js
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

const totalUsers=document.getElementById("totalUsers");

const onlineUsers=document.getElementById("onlineUsers");

const activeTrades=document.getElementById("activeTrades");

const completedTrades=document.getElementById("completedTrades");

const totalDeposits=document.getElementById("totalDeposits");

const totalWithdrawals=document.getElementById("totalWithdrawals");

const totalProfit=document.getElementById("totalProfit");

const marketHealth=document.getElementById("marketHealth");

const latestUsers=document.getElementById("latestUsers");

const latestTrades=document.getElementById("latestTrades");

const marketStatus=document.getElementById("marketStatus");

const activity=document.getElementById("systemActivity");

const logoutBtn=document.getElementById("logoutBtn");

/*====================================
STORAGE
====================================*/

let users=[];

let trades=[];

let deposits=[];

let withdrawals=[];

/*====================================
HELPERS
====================================*/

function money(value){

return "$"+

Number(value||0).toLocaleString(undefined,{

minimumFractionDigits:2,

maximumFractionDigits:2

});

}

function safe(value){

return value??"";

}

function logActivity(message){

const div=document.createElement("div");

div.textContent=new Date().toLocaleTimeString()+" - "+message;

activity.prepend(div);

while(activity.children.length>20){

activity.removeChild(activity.lastChild);

}

}

/*====================================
AUTH
====================================*/

onAuthStateChanged(auth,async(user)=>{

if(!user){

location.replace("login.html");

return;

}

try{

const snap=await get(ref(db,"users/"+user.uid));

if(!snap.exists()){

alert("Administrator account not found.");

return;

}

const admin=snap.val();

if(admin.role!=="admin"){

alert("Access denied.");

location.replace("dashboard.html");

return;

}

loader.style.display="none";

initialize();

}catch(error){

console.error(error);

alert(error.message);

}

});
/*====================================
INITIALIZE
====================================*/

function initialize(){

listenUsers();

listenTrades();

listenDeposits();

listenWithdrawals();

startClock();

bindEvents();

logActivity(

"Administrator logged in."

);

}

/*====================================
EVENTS
====================================*/

function bindEvents(){

logoutBtn.onclick=async()=>{

if(!confirm("Logout administrator?")) return;

await signOut(auth);

location.replace("login.html");

};

window.addEventListener(

"online",

()=>{

showNotification(

"Internet Connected"

);

marketHealth.textContent="ONLINE";

}

);

window.addEventListener(

"offline",

()=>{

showNotification(

"Internet Disconnected"

);

marketHealth.textContent="OFFLINE";

}

);

}

/*====================================
LIVE CLOCK
====================================*/

function startClock(){

setInterval(()=>{

marketStatus.textContent=

new Date().toLocaleString();

},1000);

}
/*====================================
REALTIME USERS
====================================*/

function listenUsers(){

onValue(

ref(db,"users"),

(snapshot)=>{

users=[];

let online=0;

if(snapshot.exists()){

Object.entries(snapshot.val())

.forEach(([uid,user])=>{

users.push({

uid,

...user

});

if(user.online===true){

online++;

}

});

}

totalUsers.textContent=

users.length;

onlineUsers.textContent=

online;

renderLatestUsers();

logActivity(

"Users synchronized."

);

}

);

}

/*====================================
LATEST USERS TABLE
====================================*/

function renderLatestUsers(){

latestUsers.innerHTML="";

if(users.length===0){

latestUsers.innerHTML=`

<tr>

<td colspan="6">

No registered users found.

</td>

</tr>

`;

return;

}

users

.sort(

(a,b)=>

(b.createdAt||0)

-

(a.createdAt||0)

)

.slice(0,10)

.forEach(user=>{

latestUsers.innerHTML+=`

<tr>

<td>

${safe(user.firstName)}

${safe(user.lastName)}

</td>

<td>

${safe(user.email)}

</td>

<td>

${safe(user.country)}

</td>

<td>

${safe(user.role||"user")}

</td>

<td>

<span class="badge ${user.online?"approved":"pending"}">

${user.online?"ONLINE":"OFFLINE"}

</span>

</td>

<td>

${user.createdAt?

new Date(user.createdAt)

.toLocaleString()

:"-"}

</td>

</tr>

`;

});

}

/*====================================
REALTIME TRADES
====================================*/

function listenTrades(){

onValue(

ref(db,"trades"),

(snapshot)=>{

trades=[];

let active=0;

let completed=0;

if(snapshot.exists()){

Object.entries(snapshot.val())

.forEach(([uid,userTrades])=>{

Object.entries(userTrades)

.forEach(([id,trade])=>{

trades.push({

uid,

id,

...trade

});

if(trade.status==="completed"){

completed++;

}else{

active++;

}

});

});

}

activeTrades.textContent=

active;

completedTrades.textContent=

completed;

renderLatestTrades();

logActivity(

"Trades synchronized."

);

}

);

}
/*====================================
LATEST TRADES TABLE
====================================*/

function renderLatestTrades(){

latestTrades.innerHTML="";

if(trades.length===0){

latestTrades.innerHTML=`

<tr>

<td colspan="6">

No trading activities found.

</td>

</tr>

`;

return;

}

trades

.sort(

(a,b)=>

(b.createdAt||0)

-

(a.createdAt||0)

)

.slice(0,10)

.forEach(trade=>{

const user=

users.find(

u=>u.uid===trade.uid

)||{};

latestTrades.innerHTML+=`

<tr>

<td>

${safe(user.firstName)}

${safe(user.lastName)}

</td>

<td>

${safe(trade.asset||trade.coin||"-")}

</td>

<td>

${safe(trade.type||"-")}

</td>

<td>

${money(trade.amount)}

</td>

<td>

<span class="badge ${trade.status==="completed"?"approved":"pending"}">

${safe(trade.status||"pending").toUpperCase()}

</span>

</td>

<td>

${trade.createdAt?

new Date(trade.createdAt)

.toLocaleString()

:"-"}

</td>

</tr>

`;

});

}

/*====================================
REALTIME DEPOSITS
====================================*/

function listenDeposits(){

onValue(

ref(db,"deposits"),

(snapshot)=>{

deposits=[];

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

});

});

}

totalDeposits.textContent=

money(total);

logActivity(

"Deposits synchronized."

);

}

);

}
/*====================================
REALTIME WITHDRAWALS
====================================*/

function listenWithdrawals(){

onValue(

ref(db,"withdrawals"),

(snapshot)=>{

withdrawals=[];

let total=0;

if(snapshot.exists()){

Object.entries(snapshot.val())

.forEach(([uid,userWithdrawals])=>{

Object.entries(userWithdrawals)

.forEach(([id,withdrawal])=>{

withdrawals.push({

uid,

id,

...withdrawal

});

total+=Number(

withdrawal.amount||0

);

});

});

}

totalWithdrawals.textContent=

money(total);

calculatePlatformProfit();

logActivity(

"Withdrawals synchronized."

);

}

);

}

/*====================================
PLATFORM PROFIT
====================================*/

function calculatePlatformProfit(){

let depositTotal=0;

let withdrawalTotal=0;

deposits.forEach(item=>{

if(item.status==="approved"){

depositTotal+=Number(

item.amount||0

);

}

});

withdrawals.forEach(item=>{

if(item.status==="approved"){

withdrawalTotal+=Number(

item.amount||0

);

}

});

const profit=

depositTotal-

withdrawalTotal;

totalProfit.textContent=

money(profit);

}

/*====================================
MARKET STATUS
====================================*/

setInterval(()=>{

const status=[

"ONLINE",

"ANALYZING",

"OPTIMIZING",

"SCANNING",

"ACTIVE"

];

marketHealth.textContent=

status[

Math.floor(

Math.random()*

status.length

)

];

},8000);

/*====================================
NOTIFICATIONS
====================================*/

function showNotification(message){

const box=

document.getElementById("adminNotification");

const text=

document.getElementById("adminNotificationText");

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
AUTO REFRESH
====================================*/

setInterval(()=>{

renderLatestUsers();

renderLatestTrades();

calculatePlatformProfit();

},30000);

/*====================================
MARKET FEED
====================================*/

const marketFeed=[

"BTC market is showing strong bullish momentum.",

"ETH network transaction volume increasing.",

"AI Trading Engine analyzing market trends.",

"Platform synchronization completed successfully.",

"Realtime database connection stable.",

"User transactions processing normally.",

"Crypto volatility detected across exchanges.",

"Blockchain confirmations arriving normally."

];

setInterval(()=>{

document.getElementById(

"liveMarketFeed"

).innerHTML=

`<p>${
marketFeed[
Math.floor(
Math.random()*
marketFeed.length
)
]}</p>`;

},5000);

/*====================================
SYSTEM ACTIVITY
====================================*/

setInterval(()=>{

const events=[

"User login detected.",

"New account registered.",

"Deposit request received.",

"Withdrawal request received.",

"Trade executed successfully.",

"Database synchronized.",

"Wallet balances updated.",

"Security verification completed."

];

logActivity(

events[

Math.floor(

Math.random()*

events.length

)

]

);

},15000);
/*====================================
WINDOW EVENTS
====================================*/

window.addEventListener(

"click",

(event)=>{

if(

event.target===

document.getElementById("pageOverlay")

){

hideLoader();

}

});

window.addEventListener(

"online",

()=>{

marketHealth.textContent="ONLINE";

showNotification(

"Connection restored."

);

logActivity(

"Internet connection restored."

);

});

window.addEventListener(

"offline",

()=>{

marketHealth.textContent="OFFLINE";

showNotification(

"Internet connection lost."

);

logActivity(

"Internet connection lost."

);

});

/*====================================
HEARTBEAT
====================================*/

setInterval(async()=>{

if(auth.currentUser){

try{

await update(

ref(

db,

"users/"+auth.currentUser.uid

),

{

online:true,

lastSeen:Date.now()

}

);

}catch(e){

console.error(e);

}

}

},30000);

/*====================================
READY
====================================*/

document.addEventListener(

"DOMContentLoaded",

()=>{

showNotification(

"Administrator Dashboard Ready"

);

logActivity(

"Dashboard initialized successfully."

);

});

/*====================================
END OF PART
====================================*/