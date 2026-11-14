// admin-users.js
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
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

/*====================================
DOM
====================================*/

const loader=document.getElementById("adminLoader");

const table=document.getElementById("usersTable");

const totalUsers=document.getElementById("totalUsers");

const onlineUsers=document.getElementById("onlineUsers");

const verifiedUsers=document.getElementById("verifiedUsers");

const disabledUsers=document.getElementById("disabledUsers");

const activeTraders=document.getElementById("activeTraders");

const walletBalance=document.getElementById("walletBalance");

const userDeposits=document.getElementById("userDeposits");

const userProfit=document.getElementById("userProfit");

const searchInput=document.getElementById("searchUser");

const statusFilter=document.getElementById("statusFilter");

const countryFilter=document.getElementById("countryFilter");

const refreshUsers=document.getElementById("refreshUsers");

const exportUsers=document.getElementById("exportUsers");

/*====================================
STORAGE
====================================*/

let users=[];

let wallets=[];

let trades=[];

let filtered=[];

let currentPage=1;

const perPage=15;

/*====================================
HELPERS
====================================*/

function money(value){

return "$"+

Number(value||0)

.toLocaleString(undefined,{

minimumFractionDigits:2,

maximumFractionDigits:2

});

}

function safe(value){

return value??"";

}

function formatDate(value){

if(!value)return "-";

return new Date(value).toLocaleString();

}

function badge(status,color){

return `<span class="badge ${color}">${status}</span>`;

}

/*====================================
AUTHENTICATION
====================================*/

onAuthStateChanged(auth, async (user) => {

    if (!user) {
        location.replace("login.html");
        return;
    }

    try {

        const adminRef = ref(db, "users/" + user.uid);

        const snapshot = await get(adminRef);

        if (!snapshot.exists()) {
            alert("Admin account not found.");
            return;
        }

        const admin = snapshot.val();

        if (admin.role && admin.role.toLowerCase() === "admin") {

            loader.style.display = "none";
            initialize();
            return;

        }

        alert("Access denied.");

        location.replace("dashboard.html");

    } catch (error) {

        console.error(error);

    }

});

/*====================================
START
====================================*/

function initialize(){

listenUsers();

listenWallets();

listenTrades();

bindEvents();

clock();

}
/*====================================
REALTIME USERS
====================================*/

function listenUsers(){

onValue(

ref(db,"users"),

snapshot=>{

users=[];

if(snapshot.exists()){

Object.entries(snapshot.val())

.forEach(([uid,user])=>{

users.push({

uid,

...user

});

});

}

calculateCards();

populateCountries();

applyFilters();

}

);

}

/*====================================
REALTIME WALLETS
====================================*/

function listenWallets(){

onValue(

ref(db,"wallets"),

snapshot=>{

wallets=[];

let balance=0;

let deposits=0;

let profit=0;

if(snapshot.exists()){

Object.entries(snapshot.val())

.forEach(([uid,wallet])=>{

wallets.push({

uid,

...wallet

});

balance+=Number(wallet.balance||0);

deposits+=Number(wallet.totalDeposit||0);

profit+=Number(wallet.totalProfit||0);

});

}

walletBalance.textContent=money(balance);

userDeposits.textContent=money(deposits);

userProfit.textContent=money(profit);

renderUsers();

}

);

}

/*====================================
REALTIME TRADES
====================================*/

function listenTrades(){

onValue(

ref(db,"trades"),

snapshot=>{

trades=[];

let active=0;

if(snapshot.exists()){

Object.entries(snapshot.val())

.forEach(([uid,data])=>{

if(typeof data==="object"){

Object.entries(data)

.forEach(([id,trade])=>{

trades.push({

uid,

id,

...trade

});

if(trade.status==="active"){

active++;

}

});

}

});

}

activeTraders.textContent=active;

renderUsers();

}

);

}

/*====================================
SUMMARY CARDS
====================================*/

function calculateCards(){

totalUsers.textContent=users.length;

onlineUsers.textContent=

users.filter(

u=>u.online===true

).length;

verifiedUsers.textContent=

users.filter(

u=>u.verified===true

).length;

disabledUsers.textContent=

users.filter(

u=>u.status==="disabled"

).length;

}
/*====================================
COUNTRIES
====================================*/

function populateCountries(){

if(!countryFilter)return;

const countries=[

...new Set(

users

.map(

u=>safe(u.country)

)

.filter(Boolean)

)

]

.sort();

countryFilter.innerHTML=

'<option value="all">All Countries</option>';

countries.forEach(country=>{

countryFilter.innerHTML+=`

<option value="${country}">

${country}

</option>

`;

});

}

/*====================================
FILTERS
====================================*/

function applyFilters(){

const keyword=

searchInput.value

.toLowerCase()

.trim();

const status=

statusFilter.value;

const country=

countryFilter.value;

filtered=

users.filter(user=>{

const text=

`

${safe(user.firstName)}

${safe(user.lastName)}

${safe(user.email)}

${safe(user.phone)}

${safe(user.uid)}

`

.toLowerCase();

const searchMatch=

text.includes(keyword);

let statusMatch=true;

switch(status){

case "active":

statusMatch=

user.status==="active";

break;

case "disabled":

statusMatch=

user.status==="disabled";

break;

case "verified":

statusMatch=

user.verified===true;

break;

case "unverified":

statusMatch=

user.verified!==true;

break;

case "online":

statusMatch=

user.online===true;

break;

case "offline":

statusMatch=

user.online!==true;

break;

}

const countryMatch=

country==="all"

||

safe(user.country)===country;

return(

searchMatch

&&

statusMatch

&&

countryMatch

);

});

currentPage=1;

renderUsers();

}
/*====================================
RENDER TABLE
====================================*/

function renderUsers(){

if(!table)return;

table.innerHTML="";

const start=

(currentPage-1)

*

perPage;

const end=

start+

perPage;

const list=

filtered.slice(

start,

end

);

if(list.length===0){

table.innerHTML=`

<tr>

<td colspan="14">

No users found.

</td>

</tr>

`;

updatePagination();

return;

}

list.forEach(user=>{

const wallet=

wallets.find(

w=>w.uid===user.uid

)||{};

const trade=

trades.find(

t=>t.uid===user.uid

);

table.innerHTML+=`

<tr>

<td>

<img

src="${
user.photo||

'images/avatar.png'
}"

class="table-avatar">

</td>

<td>

${safe(user.firstName)}

${safe(user.lastName)}

</td>

<td>

${safe(user.email)}

</td>

<td>

${safe(user.phone)}

</td>

<td>

${safe(user.country)}

</td>

<td>

${money(wallet.balance)}

</td>

<td>

${money(wallet.totalDeposit)}

</td>

<td>

${money(wallet.totalProfit)}

</td>

<td>

${trade?

badge("ACTIVE","green"):

badge("NONE","gray")

}

</td>

<td>

${user.status==="active"

?

badge("ACTIVE","green")

:

badge("DISABLED","red")

}

</td>

<td>

${user.verified

?

badge("YES","green")

:

badge("NO","orange")

}

</td>

<td>

${user.online

?

badge("ONLINE","green")

:

badge("OFFLINE","gray")

}

</td>

<td>

${formatDate(user.createdAt)}

</td>

<td>

<button

class="primary-btn viewUser"

data-id="${user.uid}">

View

</button>

</td>

</tr>

`;

});

updatePagination();

bindViewButtons();

}
/*====================================
PAGINATION
====================================*/

function updatePagination(){

const totalPages=

Math.max(

1,

Math.ceil(

filtered.length/

perPage

)

);

document.getElementById("pageInfo").textContent=

`Page ${currentPage} of ${totalPages}`;

document.getElementById("firstPage").disabled=

currentPage===1;

document.getElementById("previousPage").disabled=

currentPage===1;

document.getElementById("nextPage").disabled=

currentPage===totalPages;

document.getElementById("lastPage").disabled=

currentPage===totalPages;

}

document

.getElementById("firstPage")

.addEventListener(

"click",

()=>{

currentPage=1;

renderUsers();

}

);

document

.getElementById("previousPage")

.addEventListener(

"click",

()=>{

if(currentPage>1){

currentPage--;

renderUsers();

}

}

);

document

.getElementById("nextPage")

.addEventListener(

"click",

()=>{

const totalPages=

Math.max(

1,

Math.ceil(

filtered.length/

perPage

)

);

if(currentPage<totalPages){

currentPage++;

renderUsers();

}

}

);

document

.getElementById("lastPage")

.addEventListener(

"click",

()=>{

currentPage=

Math.max(

1,

Math.ceil(

filtered.length/

perPage

)

);

renderUsers();

}

);

/*====================================
EVENTS
====================================*/

function bindEvents(){

searchInput.addEventListener(

"input",

applyFilters

);

statusFilter.addEventListener(

"change",

applyFilters

);

countryFilter.addEventListener(

"change",

applyFilters

);

refreshUsers.addEventListener(

"click",

()=>{

applyFilters();

}

);

exportUsers.addEventListener(

"click",

exportCSV

);

}
/*====================================
VIEW USER
====================================*/

function bindViewButtons(){

document

.querySelectorAll(".viewUser")

.forEach(button=>{

button.onclick=()=>{

openUser(

button.dataset.id

);

};

});

}

async function openUser(uid){

const user=

users.find(

u=>u.uid===uid

);

if(!user)return;

const wallet=

wallets.find(

w=>w.uid===uid

)||{};

const trade=

trades.find(

t=>t.uid===uid

);

document.getElementById("modalUID").textContent=uid;

document.getElementById("modalName").textContent=

`${safe(user.firstName)} ${safe(user.lastName)}`;

document.getElementById("modalEmail").textContent=

safe(user.email);

document.getElementById("modalPhone").textContent=

safe(user.phone);

document.getElementById("modalCountry").textContent=

safe(user.country);

document.getElementById("modalStatus").textContent=

safe(user.status);

document.getElementById("modalVerified").textContent=

user.verified?"Verified":"Not Verified";

document.getElementById("modalOnline").textContent=

user.online?"Online":"Offline";

document.getElementById("modalBalance").textContent=

money(wallet.balance);

document.getElementById("modalDeposit").textContent=

money(wallet.totalDeposit);

document.getElementById("modalProfit").textContent=

money(wallet.totalProfit);

document.getElementById("modalWithdrawal").textContent=

money(wallet.totalWithdrawal);

document.getElementById("modalTrade").textContent=

trade?"Active":"None";

document.getElementById("modalCreated").textContent=

formatDate(user.createdAt);

document.getElementById("modalLastLogin").textContent=

formatDate(user.lastLogin);

document.getElementById("modalActivity").textContent=

formatDate(user.lastActivity);

document.getElementById("userPhoto").src=

user.photo||

"images/avatar.png";

document.getElementById("userModal").style.display="flex";

selectedUser=uid;

}

document

.getElementById("closeUserModal")

.onclick=()=>{

document.getElementById("userModal").style.display="none";

};
/*====================================
EDIT USER
====================================*/

let selectedUser=null;

document

.getElementById("editUserBtn")

.onclick=()=>{

if(!selectedUser)return;

const user=

users.find(

u=>u.uid===selectedUser

);

if(!user)return;

document.getElementById("editUID").value=

selectedUser;

document.getElementById("editFirstName").value=

safe(user.firstName);

document.getElementById("editLastName").value=

safe(user.lastName);

document.getElementById("editEmail").value=

safe(user.email);

document.getElementById("editPhone").value=

safe(user.phone);

document.getElementById("editCountry").value=

safe(user.country);

document.getElementById("editStatus").value=

user.status||"active";

document.getElementById("editRole").value=

user.role||"user";

document.getElementById("editVerified").value=

String(user.verified);

document.getElementById("editUserModal").style.display=

"flex";

};

document

.getElementById("cancelEdit")

.onclick=()=>{

document.getElementById("editUserModal").style.display=

"none";

};

document

.getElementById("closeEditModal")

.onclick=()=>{

document.getElementById("editUserModal").style.display=

"none";

};

document

.getElementById("editUserForm")

.addEventListener(

"submit",

async e=>{

e.preventDefault();

const uid=

document.getElementById("editUID").value;

await update(

ref(db,"users/"+uid),

{

firstName:

document.getElementById("editFirstName").value,

lastName:

document.getElementById("editLastName").value,

phone:

document.getElementById("editPhone").value,

country:

document.getElementById("editCountry").value,

status:

document.getElementById("editStatus").value,

role:

document.getElementById("editRole").value,

verified:

document.getElementById("editVerified").value==="true",

updatedAt:

Date.now()

}

);

document.getElementById("editUserModal").style.display="none";

document.getElementById("userModal").style.display="none";

}

);
/*====================================
ACCOUNT ACTIONS
====================================*/

document

.getElementById("verifyBtn")

.onclick=async()=>{

if(!selectedUser)return;

await update(

ref(db,"users/"+selectedUser),

{

verified:true,

updatedAt:Date.now()

}

);

alert("User verified successfully.");

document.getElementById("userModal").style.display="none";

};

document

.getElementById("disableBtn")

.onclick=async()=>{

if(!selectedUser)return;

const user=

users.find(

u=>u.uid===selectedUser

);

const newStatus=

user.status==="disabled"

?

"active"

:

"disabled";

await update(

ref(db,"users/"+selectedUser),

{

status:newStatus,

updatedAt:Date.now()

}

);

alert(

"Account "+newStatus

);

document.getElementById("userModal").style.display="none";

};

document

.getElementById("deleteUserBtn")

.onclick=async()=>{

if(!selectedUser)return;

if(

!confirm(

"Delete this user?"

)

)return;

await remove(

ref(db,"users/"+selectedUser)

);

alert(

"User deleted."

);

document.getElementById("userModal").style.display="none";

};

document

.getElementById("logoutUserBtn")

.onclick=async()=>{

if(!selectedUser)return;

await update(

ref(db,"users/"+selectedUser),

{

online:false,

lastSeen:Date.now()

}

);

alert(

"User logged out."

);

document.getElementById("userModal").style.display="none";

};

document

.getElementById("notificationBtn")

.onclick=()=>{

alert(

"Notification module will be connected in the next section."

);

};

document

.getElementById("walletBtn")

.onclick=()=>{

location.href=

"admin-wallets.html?uid="+selectedUser;

};

document

.getElementById("tradeBtn")

.onclick=()=>{

location.href=

"admin-trades.html?uid="+selectedUser;

};

document

.getElementById("depositBtn")

.onclick=()=>{

location.href=

"admin-deposits.html?uid="+selectedUser;

};

document

.getElementById("withdrawBtn")

.onclick=()=>{

location.href=

"admin-withdrawals.html?uid="+selectedUser;

};
/*====================================
EXPORT CSV
====================================*/

function exportCSV(){

let csv=[];

csv.push([
"Name",
"Email",
"Phone",
"Country",
"Wallet",
"Deposit",
"Profit",
"Status",
"Verified",
"Online",
"Joined"
].join(","));

filtered.forEach(user=>{

const wallet=

wallets.find(

w=>w.uid===user.uid

)||{};

csv.push([

`"${safe(user.firstName)} ${safe(user.lastName)}"`,

`"${safe(user.email)}"`,

`"${safe(user.phone)}"`,

`"${safe(user.country)}"`,

wallet.balance||0,

wallet.totalDeposit||0,

wallet.totalProfit||0,

user.status||"active",

user.verified?"Yes":"No",

user.online?"Online":"Offline",

formatDate(user.createdAt)

].join(","));

});

const blob=

new Blob(

[csv.join("\n")],

{

type:"text/csv"

}

);

const url=

URL.createObjectURL(blob);

const a=

document.createElement("a");

a.href=url;

a.download="users.csv";

a.click();

URL.revokeObjectURL(url);

}

/*====================================
LIVE CLOCK
====================================*/

function clock(){

const liveClock=

document.getElementById("liveClock");

setInterval(()=>{

liveClock.textContent=

new Date()

.toLocaleTimeString();

},1000);

}

/*====================================
END
====================================*/

window.addEventListener(

"click",

e=>{

if(

e.target===

document.getElementById("userModal")

){

document.getElementById("userModal").style.display="none";

}

if(

e.target===

document.getElementById("editUserModal")

){

document.getElementById("editUserModal").style.display="none";

}

});
/*====================================
ADMIN USER UTILITIES
====================================*/

function showNotification(message){

const box=document.getElementById("adminNotification");

const text=document.getElementById("adminNotificationText");

text.textContent=message;

box.style.display="flex";

setTimeout(()=>{

box.style.display="none";

},3000);

}

function showLoader(){

document.getElementById("pageOverlay").style.display="flex";

}

function hideLoader(){

document.getElementById("pageOverlay").style.display="none";

}

refreshUsers.onclick=()=>{

showLoader();

setTimeout(()=>{

applyFilters();

hideLoader();

showNotification("Users synchronized successfully.");

},800);

};

/*====================================
KEYBOARD SHORTCUTS
====================================*/

document.addEventListener(

"keydown",

e=>{

if(e.key==="Escape"){

document.getElementById("userModal").style.display="none";

document.getElementById("editUserModal").style.display="none";

}

if(e.ctrlKey&&e.key==="f"){

e.preventDefault();

searchInput.focus();

}

if(e.key==="F5"){

e.preventDefault();

refreshUsers.click();

}

});

/*====================================
AUTO REFRESH
====================================*/

setInterval(()=>{

applyFilters();

},30000);

/*====================================
READY
====================================*/

console.log(

"Admin User Manager Loaded Successfully."

);
/*====================================
END OF FILE
====================================*/

document.addEventListener(

"DOMContentLoaded",

()=>{

showNotification(

"User Manager Ready"

);

applyFilters();

}

);

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

console.log(
"===================================="
);

console.log(
"CRYPTO ADMIN USER MANAGER"
);

console.log(
"Realtime Firebase Connected"
);

console.log(
"User Management Initialized"
);

console.log(
"Developed for Crypto Investment Platform"
);

console.log(
"====================================");