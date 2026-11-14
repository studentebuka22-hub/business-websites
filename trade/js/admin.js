// admin.js

import { auth, db } from "./firebase.js";

import {
    ref,
    get,
    update,
    remove,
    onValue
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-database.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

/*==================================================
AUTHENTICATION
==================================================*/

onAuthStateChanged(auth, async(user)=>{

    if(!user){

        location.replace("login.html");
        return;

    }

    const userSnap=await get(ref(db,"users/"+user.uid));

    if(!userSnap.exists()){

        await signOut(auth);
        location.replace("login.html");
        return;

    }

    const profile=userSnap.val();

    if(profile.role!=="admin"){

        await signOut(auth);
        location.replace("login.html");
        return;

    }

    loadTrades();

});

/*==================================================
LOAD TRADES
==================================================*/

function loadTrades(){

    onValue(ref(db,"trades"),async(snapshot)=>{

        const tbody=document.getElementById("tradeTable");

        tbody.innerHTML="";

        if(!snapshot.exists()){

            tbody.innerHTML=`
            <tr>
                <td colspan="11" style="text-align:center;padding:60px">
                    No Active Trades Found
                </td>
            </tr>
            `;

            return;

        }

        let total=0;
        let active=0;
        let completed=0;
        let paused=0;
        let cancelled=0;
        let volume=0;

        snapshot.forEach(async(item)=>{

            const uid=item.key;

            const trade=item.val();

            total++;

            volume+=Number(trade.deposit||0);

            switch((trade.status||"").toLowerCase()){

                case "active":
                    active++;
                    break;

                case "completed":
                    completed++;
                    break;

                case "paused":
                    paused++;
                    break;

                case "cancelled":
                    cancelled++;
                    break;

            }

            const userSnap=await get(ref(db,"users/"+uid));

            const user=userSnap.exists()?userSnap.val():{};

            const percent=Math.round(trade.progress||0);

            tbody.innerHTML+=`

<tr>

<td>${user.firstName||""} ${user.lastName||""}</td>

<td>${user.email||""}</td>

<td>${trade.asset||"-"}</td>

<td>$${Number(trade.deposit||0).toLocaleString()}</td>

<td>$${Number(trade.currentBalance||0).toLocaleString()}</td>

<td>$${Number(trade.profit||0).toLocaleString()}</td>

<td>${((trade.roi||0)*100).toFixed(1)}%</td>

<td>

<div class="progress">

<div style="width:${percent}%"></div>

</div>

${percent}%

</td>

<td id="time-${uid}">
--:--:--
</td>

<td>

<span class="status ${(trade.status||"active").toLowerCase()}-status">

${trade.status||"ACTIVE"}

</span>

</td>

<td>

<div class="action">

<button class="view"
onclick="viewTrade('${uid}')">
View
</button>

<button class="edit"
onclick="editTrade('${uid}')">
Edit
</button>

<button class="pause"
onclick="pauseTrade('${uid}')">
Pause
</button>

<button class="complete"
onclick="completeTrade('${uid}')">
Complete
</button>

<button class="cancel"
onclick="cancelTrade('${uid}')">
Cancel
</button>

</div>

</td>

</tr>

`;

            startCountdown(uid,trade.finishAt);

        });

        document.getElementById("totalTrades").textContent=total;

        document.getElementById("activeTrades").textContent=active;

        document.getElementById("completedTrades").textContent=completed;

        document.getElementById("pausedTrades").textContent=paused;

        document.getElementById("cancelledTrades").textContent=cancelled;

        document.getElementById("tradeVolume").textContent="$"+volume.toLocaleString();

    });

}

/*==================================================
COUNTDOWN
==================================================*/

function startCountdown(uid,endTime){

    const label=document.getElementById("time-"+uid);

    if(!label)return;

    const timer=setInterval(()=>{

        let remain=endTime-Date.now();

        if(remain<=0){

            label.innerHTML="Finished";

            clearInterval(timer);

            return;

        }

        let days=Math.floor(remain/86400000);

        let hrs=Math.floor((remain%86400000)/3600000);

        let mins=Math.floor((remain%3600000)/60000);

        label.innerHTML=
        `${days}d ${hrs}h ${mins}m`;

    },1000);

}
/*==================================================
ADMIN ACTIONS
PART 3
==================================================*/

window.viewTrade = async function(uid){

    const snap = await get(ref(db,"trades/"+uid));

    if(!snap.exists()){

        alert("Trade not found.");
        return;

    }

    const trade = snap.val();

    const userSnap = await get(ref(db,"users/"+uid));

    const user = userSnap.exists() ? userSnap.val() : {};

    alert(`

USER: ${user.firstName||""} ${user.lastName||""}

EMAIL: ${user.email||""}

ASSET: ${trade.asset}

DEPOSIT: $${Number(trade.deposit).toLocaleString()}

CURRENT BALANCE: $${Number(trade.currentBalance).toLocaleString()}

PROFIT: $${Number(trade.profit).toLocaleString()}

ROI: ${(trade.roi*100).toFixed(2)}%

STATUS: ${trade.status}

STARTED:
${new Date(trade.startedAt).toLocaleString()}

ENDS:
${new Date(trade.finishAt).toLocaleString()}

`);

};

/*==================================================
PAUSE TRADE
==================================================*/

window.pauseTrade = async function(uid){

    if(!confirm("Pause this trade?")) return;

    await update(ref(db,"trades/"+uid),{

        status:"paused",
        lastUpdate:Date.now()

    });

    alert("Trade paused successfully.");

};

/*==================================================
RESUME TRADE
==================================================*/

window.resumeTrade = async function(uid){

    if(!confirm("Resume this trade?")) return;

    await update(ref(db,"trades/"+uid),{

        status:"active",
        lastUpdate:Date.now()

    });

    alert("Trade resumed.");

};

/*==================================================
COMPLETE TRADE
==================================================*/

window.completeTrade = async function(uid){

    if(!confirm("Force complete this trade?")) return;

    const tradeSnap = await get(ref(db,"trades/"+uid));

    if(!tradeSnap.exists()) return;

    const trade = tradeSnap.val();

    await update(ref(db,"trades/"+uid),{

        status:"completed",
        completed:true,
        progress:100,
        currentBalance:trade.targetBalance,
        profit:trade.targetBalance-trade.deposit,
        lastUpdate:Date.now()

    });

    await update(ref(db,"wallets/"+uid),{

        activeTrade:false,
        demoBalance:trade.targetBalance,
        totalProfit:(trade.targetBalance-trade.deposit)

    });

    alert("Trade completed successfully.");

};

/*==================================================
CANCEL TRADE
==================================================*/

window.cancelTrade = async function(uid){

    if(!confirm("Cancel this trade?")) return;

    await update(ref(db,"trades/"+uid),{

        status:"cancelled",
        completed:true,
        lastUpdate:Date.now()

    });

    await update(ref(db,"wallets/"+uid),{

        activeTrade:false

    });

    alert("Trade cancelled.");

};

/*==================================================
DELETE TRADE
==================================================*/

window.deleteTrade = async function(uid){

    if(!confirm("Delete this trade permanently?")) return;

    await remove(ref(db,"trades/"+uid));

    await update(ref(db,"wallets/"+uid),{

        activeTrade:false

    });

    alert("Trade deleted.");

};

/*==================================================
EDIT TRADE
==================================================*/

window.editTrade = async function(uid){

    const tradeSnap = await get(ref(db,"trades/"+uid));

    if(!tradeSnap.exists()){

        alert("Trade not found.");
        return;

    }

    const trade = tradeSnap.val();

    const deposit = prompt(
        "Edit Deposit Amount",
        trade.deposit
    );

    if(deposit===null) return;

    const balance = prompt(
        "Edit Current Balance",
        trade.currentBalance
    );

    if(balance===null) return;

    const roi = prompt(
        "Edit ROI",
        trade.roi
    );

    if(roi===null) return;

    await update(ref(db,"trades/"+uid),{

        deposit:Number(deposit),
        currentBalance:Number(balance),
        roi:Number(roi),
        profit:Number(balance)-Number(deposit),
        lastUpdate:Date.now()

    });

    alert("Trade updated successfully.");

};

/*==================================================
LOGOUT
==================================================*/

document
.getElementById("logoutBtn")
.addEventListener("click",async()=>{

    if(confirm("Logout Admin?")){

        await signOut(auth);

        location.replace("login.html");

    }

});
/*==================================================
PART 4
SEARCH • FILTER • LIVE REFRESH • EXPORT
==================================================*/

const searchBox = document.getElementById("tradeSearch");
const assetFilter = document.getElementById("assetFilter");
const statusFilter = document.getElementById("statusFilter");

let allTrades = [];

/*==================================================
STORE TRADES
==================================================*/

function cacheTrade(trade){

    const index = allTrades.findIndex(x=>x.uid===trade.uid);

    if(index===-1){

        allTrades.push(trade);

    }else{

        allTrades[index]=trade;

    }

}

/*==================================================
SEARCH
==================================================*/

searchBox.addEventListener("keyup",filterTrades);
assetFilter.addEventListener("change",filterTrades);
statusFilter.addEventListener("change",filterTrades);

function filterTrades(){

    const keyword = searchBox.value.toLowerCase();

    const asset = assetFilter.value;

    const status = statusFilter.value.toLowerCase();

    document
    .querySelectorAll("#tradeTable tr")
    .forEach(row=>{

        const text=row.innerText.toLowerCase();

        let visible=true;

        if(keyword){

            visible=text.includes(keyword);

        }

        if(asset!="all"){

            visible=
            visible &&
            text.includes(asset.toLowerCase());

        }

        if(status!="all"){

            visible=
            visible &&
            text.includes(status);

        }

        row.style.display=
        visible?"":"none";

    });

}

/*==================================================
AUTO REFRESH
==================================================*/

setInterval(()=>{

    loadTrades();

},10000);

/*==================================================
EXPORT CSV
==================================================*/

window.exportTrades=function(){

    let csv=[];

    csv.push("Name,Email,Asset,Deposit,Balance,Profit,ROI,Status");

    allTrades.forEach(t=>{

        csv.push(

`${t.name},
${t.email},
${t.asset},
${t.deposit},
${t.currentBalance},
${t.profit},
${t.roi},
${t.status}`

);

    });

    const blob=new Blob(
        [csv.join("\n")],
        {type:"text/csv"}
    );

    const a=document.createElement("a");

    a.href=URL.createObjectURL(blob);

    a.download="Trades.csv";

    a.click();

};

/*==================================================
REFRESH BUTTON
==================================================*/

window.refreshTrades=function(){

    loadTrades();

    alert("Trade list refreshed.");

};

/*==================================================
TOTAL PROFIT
==================================================*/

async function calculateProfit(){

    const snap=
    await get(ref(db,"trades"));

    if(!snap.exists()) return;

    let total=0;

    snap.forEach(item=>{

        total+=Number(item.val().profit||0);

    });

    const el=document.getElementById("totalProfit");

    if(el){

        el.innerHTML="$"+
        total.toLocaleString();

    }

}

setInterval(calculateProfit,5000);

/*==================================================
LIVE CLOCK
==================================================*/

setInterval(()=>{

    const d=new Date();

    const clock=document.getElementById("liveClock");

    if(clock){

        clock.innerHTML=d.toLocaleString();

    }

},1000);

/*==================================================
SYSTEM STATUS
==================================================*/

const statuses=[

"Trading Engine Online",

"Monitoring Live Trades",

"Updating Portfolio",

"Checking Wallets",

"Synchronizing Firebase",

"AI Engine Running",

"Scanning Market"

];

let statusIndex=0;

setInterval(()=>{

    const engine=document.getElementById("engineStatus");

    if(engine){

        engine.innerHTML=statuses[statusIndex];

    }

    statusIndex++;

    if(statusIndex>=statuses.length){

        statusIndex=0;

    }

},4000);

/*==================================================
END OF PART 4
==================================================*/
/*==================================================
PART 5
PROFESSIONAL TRADE MANAGEMENT MODAL
==================================================*/

let selectedTradeUID = null;

/*==================================================
CREATE MODAL
==================================================*/

const modal = document.createElement("div");

modal.id = "tradeModal";

modal.innerHTML = `

<div class="trade-modal">

<div class="trade-header">

<h2>Edit Trade</h2>

<button id="closeTradeModal">&times;</button>

</div>

<div class="trade-body">

<label>Asset</label>
<select id="editAsset">
<option>BTC</option>
<option>ETH</option>
<option>BNB</option>
<option>SOL</option>
<option>XRP</option>
<option>ADA</option>
<option>DOGE</option>
<option>TRX</option>
<option>LTC</option>
</select>

<label>Deposit</label>
<input type="number" id="editDeposit">

<label>Current Balance</label>
<input type="number" id="editBalance">

<label>Profit</label>
<input type="number" id="editProfit">

<label>ROI (%)</label>
<input type="number" id="editROI">

<label>Status</label>

<select id="editStatus">

<option value="active">ACTIVE</option>

<option value="paused">PAUSED</option>

<option value="completed">COMPLETED</option>

<option value="cancelled">CANCELLED</option>

</select>

<label>Extend Trade (Days)</label>

<input
type="number"
id="extendDays"
placeholder="0">

<label>Admin Remark</label>

<textarea
id="adminRemark"
rows="5"></textarea>

<div class="modal-actions">

<button id="saveTrade">

Save Changes

</button>

<button id="deleteTrade">

Delete Trade

</button>

</div>

</div>

</div>

`;

document.body.appendChild(modal);

/*==================================================
MODAL STYLE
==================================================*/

const style=document.createElement("style");

style.innerHTML=`

#tradeModal{

position:fixed;
inset:0;
background:rgba(0,0,0,.7);
display:none;
justify-content:center;
align-items:center;
z-index:99999;

}

.trade-modal{

width:650px;
max-width:95%;
background:#182436;
border-radius:15px;
overflow:hidden;

}

.trade-header{

display:flex;
justify-content:space-between;
align-items:center;
padding:20px;
background:#101b2d;
color:#fff;

}

.trade-header button{

background:none;
border:none;
font-size:30px;
color:#fff;
cursor:pointer;

}

.trade-body{

padding:25px;
display:grid;
gap:15px;

}

.trade-body label{

font-weight:600;
color:#fff;

}

.trade-body input,
.trade-body select,
.trade-body textarea{

padding:12px;
border-radius:10px;
border:1px solid #314463;
background:#111b2c;
color:#fff;
outline:none;

}

.modal-actions{

display:flex;
gap:15px;
margin-top:20px;

}

.modal-actions button{

flex:1;
padding:14px;
border:none;
border-radius:10px;
cursor:pointer;
font-size:15px;
font-weight:700;

}

#saveTrade{

background:#00c853;
color:#fff;

}

#deleteTrade{

background:#ff5252;
color:#fff;

}

`;

document.head.appendChild(style);

/*==================================================
OPEN MODAL
==================================================*/

window.editTrade = async function(uid){

selectedTradeUID = uid;

const snap = await get(ref(db,"trades/"+uid));

if(!snap.exists()) return;

const trade = snap.val();

editAsset.value = trade.asset;

editDeposit.value = trade.deposit;

editBalance.value = trade.currentBalance;

editProfit.value = trade.profit;

editROI.value = ((trade.roi||0)*100).toFixed(2);

editStatus.value = trade.status;

adminRemark.value = trade.adminRemark || "";

extendDays.value = 0;

tradeModal.style.display="flex";

};

/*==================================================
CLOSE
==================================================*/

closeTradeModal.onclick=()=>{

tradeModal.style.display="none";

};

/*==================================================
SAVE
==================================================*/

saveTrade.onclick=async()=>{

if(!selectedTradeUID) return;

const tradeSnap =
await get(ref(db,"trades/"+selectedTradeUID));

if(!tradeSnap.exists()) return;

const trade = tradeSnap.val();

const extend =
Number(extendDays.value)*86400000;

await update(

ref(db,"trades/"+selectedTradeUID),

{

asset:editAsset.value,

deposit:Number(editDeposit.value),

currentBalance:Number(editBalance.value),

profit:Number(editProfit.value),

roi:Number(editROI.value)/100,

status:editStatus.value,

finishAt:(trade.finishAt||Date.now())+extend,

adminRemark:adminRemark.value,

lastUpdate:Date.now()

}

);

tradeModal.style.display="none";

alert("Trade updated successfully.");

};

/*==================================================
DELETE
==================================================*/

deleteTrade.onclick=async()=>{

if(!selectedTradeUID) return;

if(!confirm("Delete this trade permanently?")) return;

await remove(

ref(db,"trades/"+selectedTradeUID)

);

await update(

ref(db,"wallets/"+selectedTradeUID),

{

activeTrade:false

}

);

tradeModal.style.display="none";

alert("Trade deleted.");

};

/*==================================================
CLICK OUTSIDE TO CLOSE
==================================================*/

window.onclick=e=>{

if(e.target===tradeModal){

tradeModal.style.display="none";

}

};

/*==================================================
END PART 5
==================================================*/
/*==================================================
PART 6
ADMIN WALLET & TRADE CONTROL CENTER
==================================================*/

/*==================================================
CREDIT USER WALLET
==================================================*/

window.creditWallet = async function(uid){

    const amount = prompt("Enter amount to credit:");

    if(amount===null) return;

    const value = Number(amount);

    if(isNaN(value) || value<=0){

        alert("Invalid amount.");
        return;

    }

    const walletRef = ref(db,"wallets/"+uid);

    const snap = await get(walletRef);

    if(!snap.exists()){

        alert("Wallet not found.");
        return;

    }

    const wallet = snap.val();

    await update(walletRef,{

        balance:Number(wallet.balance||0)+value,
        updatedAt:Date.now()

    });

    alert("$"+value.toLocaleString()+" credited successfully.");

};

/*==================================================
DEBIT USER WALLET
==================================================*/

window.debitWallet = async function(uid){

    const amount = prompt("Enter amount to debit:");

    if(amount===null) return;

    const value = Number(amount);

    if(isNaN(value) || value<=0){

        alert("Invalid amount.");
        return;

    }

    const walletRef = ref(db,"wallets/"+uid);

    const snap = await get(walletRef);

    if(!snap.exists()){

        alert("Wallet not found.");
        return;

    }

    const wallet = snap.val();

    const balance = Number(wallet.balance||0);

    if(value>balance){

        alert("Insufficient wallet balance.");
        return;

    }

    await update(walletRef,{

        balance:balance-value,
        updatedAt:Date.now()

    });

    alert("$"+value.toLocaleString()+" debited successfully.");

};

/*==================================================
FREEZE TRADING
==================================================*/

window.freezeTrading = async function(uid){

    if(!confirm("Freeze this user's trading?")) return;

    await update(ref(db,"users/"+uid),{

        tradingStatus:"frozen",
        updatedAt:Date.now()

    });

    alert("Trading frozen.");

};

/*==================================================
UNFREEZE TRADING
==================================================*/

window.unfreezeTrading = async function(uid){

    await update(ref(db,"users/"+uid),{

        tradingStatus:"active",
        updatedAt:Date.now()

    });

    alert("Trading activated.");

};

/*==================================================
RESTART TRADE
==================================================*/

window.restartTrade = async function(uid){

    const snap = await get(ref(db,"trades/"+uid));

    if(!snap.exists()) return;

    const trade = snap.val();

    await update(ref(db,"trades/"+uid),{

        currentBalance:Number(trade.deposit),
        profit:0,
        progress:0,
        completed:false,
        status:"active",
        startedAt:Date.now(),
        finishAt:Date.now()+1209600000,
        lastUpdate:Date.now()

    });

    await update(ref(db,"wallets/"+uid),{

        activeTrade:true

    });

    alert("Trade restarted.");

};

/*==================================================
RESET PROGRESS
==================================================*/

window.resetProgress = async function(uid){

    await update(ref(db,"trades/"+uid),{

        progress:0,
        currentBalance:0,
        profit:0,
        lastUpdate:Date.now()

    });

    alert("Progress reset.");

};

/*==================================================
CHANGE TRADE STATUS
==================================================*/

window.changeTradeStatus = async function(uid){

    const status = prompt(

"Enter Status\n\nactive\npaused\ncompleted\ncancelled"

    );

    if(!status) return;

    await update(ref(db,"trades/"+uid),{

        status:status.toLowerCase(),
        lastUpdate:Date.now()

    });

    alert("Trade status updated.");

};

/*==================================================
EXTEND TRADE
==================================================*/

window.extendTrade = async function(uid){

    const days = prompt("Extend by how many days?");

    if(days===null) return;

    const value = Number(days);

    if(isNaN(value)) return;

    const tradeRef = ref(db,"trades/"+uid);

    const snap = await get(tradeRef);

    if(!snap.exists()) return;

    const trade = snap.val();

    await update(tradeRef,{

        finishAt:Number(trade.finishAt)+(value*86400000),
        lastUpdate:Date.now()

    });

    alert("Trade extended by "+value+" day(s).");

};

/*==================================================
SYSTEM LOG
==================================================*/

async function logAdminAction(action,uid){

    const id = Date.now();

    await update(ref(db,"admin/logs/"+id),{

        uid,
        action,
        admin:auth.currentUser.email,
        time:Date.now()

    });

}

/*==================================================
AUTO REFRESH
==================================================*/

setInterval(()=>{

    loadTrades();

},5000);

/*==================================================
END OF PART 6
==================================================*/
/*==================================================
PART 7
NOTIFICATIONS • AUDIT LOG • TRADE HISTORY
==================================================*/

/*==================================================
SEND USER NOTIFICATION
==================================================*/

window.notifyUser = async function(uid){

    const title = prompt("Notification Title");

    if(title===null || title.trim()=="") return;

    const message = prompt("Notification Message");

    if(message===null || message.trim()=="") return;

    const id = Date.now();

    await update(

        ref(db,"notifications/"+uid+"/"+id),

        {
            title,
            message,
            read:false,
            createdAt:Date.now(),
            sender:"Administrator"
        }

    );

    await logAdminAction(
        "Sent Notification",
        uid
    );

    alert("Notification sent successfully.");

};

/*==================================================
VIEW TRADE HISTORY
==================================================*/

window.tradeHistory = async function(uid){

    const snap = await get(ref(db,"tradeHistory/"+uid));

    if(!snap.exists()){

        alert("No previous trades found.");
        return;

    }

    let history="";

    snap.forEach(item=>{

        const trade=item.val();

        history+=`

Asset : ${trade.asset}

Deposit : $${trade.deposit}

Profit : $${trade.profit}

Status : ${trade.status}

Date :
${new Date(trade.createdAt).toLocaleString()}

----------------------------------

`;

    });

    alert(history);

};

/*==================================================
ARCHIVE TRADE
==================================================*/

window.archiveTrade = async function(uid){

    const tradeSnap =
    await get(ref(db,"trades/"+uid));

    if(!tradeSnap.exists()) return;

    const trade=tradeSnap.val();

    const archiveId=Date.now();

    await update(

        ref(db,"tradeHistory/"+uid+"/"+archiveId),

        trade

    );

    await remove(

        ref(db,"trades/"+uid)

    );

    await logAdminAction(
        "Archived Trade",
        uid
    );

    alert("Trade archived.");

};

/*==================================================
AUDIT LOG
==================================================*/

async function logAdminAction(action,uid){

    const logId=Date.now();

    await update(

        ref(db,"adminLogs/"+logId),

        {

            action,

            user:uid,

            admin:auth.currentUser.email,

            createdAt:Date.now()

        }

    );

}

/*==================================================
EXPORT ADMIN LOG
==================================================*/

window.exportAuditLog = async function(){

    const snap=
    await get(ref(db,"adminLogs"));

    if(!snap.exists()){

        alert("No logs found.");
        return;

    }

    let csv=[];

    csv.push("Admin,Action,User,Time");

    snap.forEach(item=>{

        const log=item.val();

        csv.push(

`${log.admin},
${log.action},
${log.user},
${new Date(log.createdAt).toLocaleString()}`

        );

    });

    const blob=new Blob(

        [csv.join("\n")],

        {
            type:"text/csv"
        }

    );

    const link=document.createElement("a");

    link.href=
    URL.createObjectURL(blob);

    link.download=
    "Admin_Audit_Log.csv";

    link.click();

};

/*==================================================
ONLINE USERS
==================================================*/

onValue(

    ref(db,"users"),

    snapshot=>{

        let online=0;

        snapshot.forEach(item=>{

            if(item.val().online){

                online++;

            }

        });

        const onlineLabel=
        document.getElementById("onlineUsers");

        if(onlineLabel){

            onlineLabel.innerHTML=online;

        }

    }

);

/*==================================================
SYSTEM HEARTBEAT
==================================================*/

setInterval(async()=>{

    await update(

        ref(db,"admin/system"),

        {

            heartbeat:Date.now(),

            status:"ONLINE"

        }

    );

},30000);

/*==================================================
END PART 7
==================================================*/
/*==================================================
PART 8
ADVANCED ADMIN CONTROL PANEL
FINAL PART
==================================================*/

/*==================================================
LIVE STATISTICS
==================================================*/

async function updateDashboardStatistics(){

    const tradeSnap = await get(ref(db,"trades"));
    const userSnap = await get(ref(db,"users"));
    const walletSnap = await get(ref(db,"wallets"));

    let totalUsers = 0;
    let totalBalance = 0;
    let totalProfit = 0;
    let activeTrades = 0;

    if(userSnap.exists()){

        userSnap.forEach(()=>{

            totalUsers++;

        });

    }

    if(walletSnap.exists()){

        walletSnap.forEach(item=>{

            const wallet = item.val();

            totalBalance += Number(wallet.balance || 0);
            totalProfit += Number(wallet.totalProfit || 0);

        });

    }

    if(tradeSnap.exists()){

        tradeSnap.forEach(item=>{

            if((item.val().status || "").toLowerCase()=="active"){

                activeTrades++;

            }

        });

    }

    if(document.getElementById("totalUsers"))
        document.getElementById("totalUsers").innerHTML=totalUsers;

    if(document.getElementById("activeTrades"))
        document.getElementById("activeTrades").innerHTML=activeTrades;

    if(document.getElementById("totalProfit"))
        document.getElementById("totalProfit").innerHTML="$"+totalProfit.toLocaleString();

    if(document.getElementById("walletBalance"))
        document.getElementById("walletBalance").innerHTML="$"+totalBalance.toLocaleString();

}

setInterval(updateDashboardStatistics,5000);

/*==================================================
SEARCH USERS
==================================================*/

const searchInput=document.getElementById("tradeSearch");

if(searchInput){

searchInput.addEventListener("keyup",()=>{

const keyword=searchInput.value.toLowerCase();

document.querySelectorAll("#tradeTable tr").forEach(row=>{

row.style.display=row.innerText.toLowerCase().includes(keyword)
?"":"none";

});

});

}

/*==================================================
ADMIN ANNOUNCEMENT
==================================================*/

window.sendAnnouncement=async function(){

const message=prompt("Announcement");

if(!message)return;

const users=await get(ref(db,"users"));

if(!users.exists())return;

users.forEach(async(item)=>{

await update(

ref(db,"notifications/"+item.key+"/"+Date.now()),

{

title:"Announcement",

message,

read:false,

createdAt:Date.now()

}

);

});

alert("Announcement sent to every user.");

};

/*==================================================
BACKUP DATABASE
==================================================*/

window.backupDatabase=async function(){

const users=await get(ref(db,"users"));
const wallets=await get(ref(db,"wallets"));
const trades=await get(ref(db,"trades"));

const backup={

users:users.val()||{},
wallets:wallets.val()||{},
trades:trades.val()||{},
backupDate:new Date().toISOString()

};

const blob=new Blob(

[JSON.stringify(backup,null,2)],

{type:"application/json"}

);

const link=document.createElement("a");

link.href=URL.createObjectURL(blob);

link.download="Crypto_Admin_Backup.json";

link.click();

};

/*==================================================
RESTORE PLACEHOLDER
==================================================*/

window.restoreBackup=function(){

alert(
"Backup restore will be connected to the upload manager."
);

};

/*==================================================
SYSTEM HEALTH
==================================================*/

setInterval(()=>{

const status=document.getElementById("engineStatus");

if(status){

status.innerHTML="🟢 All Services Operational";

}

},3000);

/*==================================================
AUTO LOGOUT
==================================================*/

let idleTimer;

function resetIdle(){

clearTimeout(idleTimer);

idleTimer=setTimeout(async()=>{

await signOut(auth);

location.replace("login.html");

},30*60*1000);

}

["click","mousemove","keydown","touchstart"].forEach(event=>{

document.addEventListener(event,resetIdle);

});

resetIdle();

/*==================================================
INITIALIZE
==================================================*/

window.addEventListener("load",()=>{

updateDashboardStatistics();

loadTrades();

console.log("Admin Trade Management System Ready");

});

/*==================================================
END OF ADMIN TRADE MANAGEMENT SYSTEM
==================================================*/