// admin-trades.js
// PART 1
// ADMIN TRADE MANAGEMENT SYSTEM

import {
    auth,
    db,
    ref,
    get,
    push,
    set,
    update,
    remove,
    onValue
} from "./firebase.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

/*==================================================
DOM
==================================================*/

const loader=document.getElementById("pageLoader");

const table=document.getElementById("tradeTable");

const totalTrades=document.getElementById("totalTrades");

const activeTrades=document.getElementById("activeTrades");

const completedTrades=document.getElementById("completedTrades");

const cancelledTrades=document.getElementById("cancelledTrades");

const pausedTrades=document.getElementById("pausedTrades");

const tradeVolume=document.getElementById("tradeVolume");

const search=document.getElementById("tradeSearch");

const assetFilter=document.getElementById("assetFilter");

const statusFilter=document.getElementById("statusFilter");

let tradeCache=[];

/*==================================================
ADMIN AUTH
==================================================*/

onAuthStateChanged(auth,async(user)=>{

    if(!user){

        location.replace("login.html");
        return;

    }

    const adminSnap=await get(

        ref(db,"users/"+user.uid)

    );

    if(!adminSnap.exists()){

        await signOut(auth);

        location.replace("login.html");

        return;

    }

    const admin=adminSnap.val();

    if(admin.role!=="admin"){

        await signOut(auth);

        location.replace("login.html");

        return;

    }

    loader.style.display="none";

    loadTrades();

});

/*==================================================
LOAD ALL USER TRADES
==================================================*/

function loadTrades(){

    onValue(

        ref(db,"trades"),

        async(snapshot)=>{

            tradeCache=[];

            table.innerHTML="";

            let total=0;
            let active=0;
            let completed=0;
            let paused=0;
            let cancelled=0;
            let volume=0;

            if(!snapshot.exists()){

                table.innerHTML=`

<tr>

<td colspan="12">

No trades found.

</td>

</tr>

`;

                return;

            }

            const usersSnapshot=await get(ref(db,"users"));

            const users=usersSnapshot.exists()

            ?usersSnapshot.val()

            :{};

            Object.entries(snapshot.val())

            .forEach(([uid,userTrades])=>{

                Object.entries(userTrades)

                .forEach(([tradeId,trade])=>{

                    total++;

                    volume+=Number(trade.amount||0);

                    switch(trade.status){

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

                    const profile=users[uid]||{};

                    tradeCache.push({

                        uid,
                        tradeId,
                        ...trade,
                        name:
                        (profile.firstName||"")+" "+
                        (profile.lastName||""),

                        email:
                        profile.email||""

                    });

                });

            });

            renderTrades(tradeCache);

            totalTrades.innerHTML=total;

            activeTrades.innerHTML=active;

            completedTrades.innerHTML=completed;

            pausedTrades.innerHTML=paused;

            cancelledTrades.innerHTML=cancelled;

            tradeVolume.innerHTML="$"+

            volume.toLocaleString();

        }

    );

}
/*==================================================
PART 2
RENDER TRADES • SEARCH • FILTER
==================================================*/

function renderTrades(trades){

    table.innerHTML="";

    if(!trades.length){

        table.innerHTML=`
        <tr>
            <td colspan="13" style="text-align:center;padding:40px;">
                No matching trades found.
            </td>
        </tr>
        `;
        return;
    }

    trades.forEach(trade=>{

        table.innerHTML+=`

<tr>

<td>${trade.name}</td>

<td>${trade.email}</td>

<td>${trade.asset}</td>

<td>$${Number(trade.amount||0).toLocaleString()}</td>

<td>$${Number(trade.currentBalance||0).toLocaleString()}</td>

<td>$${Number(trade.profit||0).toLocaleString()}</td>

<td>${Number(trade.roi||0)}%</td>

<td>

<div class="progress">

<div style="width:${Number(trade.progress||0)}%"></div>

</div>

${Number(trade.progress||0).toFixed(1)}%

</td>

<td>

${trade.status.toUpperCase()}

</td>

<td>

${new Date(
trade.createdAt
).toLocaleString()}

</td>

<td>

<button
class="view"
onclick="viewTrade('${trade.uid}','${trade.tradeId}')">

View

</button>

<button
class="edit"
onclick="editTrade('${trade.uid}','${trade.tradeId}')">

Edit

</button>

<button
class="pause"
onclick="pauseTrade('${trade.uid}','${trade.tradeId}')">

Pause

</button>

<button
class="complete"
onclick="completeTrade('${trade.uid}','${trade.tradeId}')">

Complete

</button>

<button
class="cancel"
onclick="cancelTrade('${trade.uid}','${trade.tradeId}')">

Cancel

</button>

</td>

</tr>

`;

    });

}

/*==================================================
SEARCH
==================================================*/

function filterTrades(){

    const keyword=
    search.value.toLowerCase().trim();

    const asset=
    assetFilter.value.toLowerCase();

    const status=
    statusFilter.value.toLowerCase();

    const filtered=

    tradeCache.filter(trade=>{

        const matchesKeyword=

        trade.name.toLowerCase().includes(keyword) ||

        trade.email.toLowerCase().includes(keyword) ||

        trade.asset.toLowerCase().includes(keyword);

        const matchesAsset=

        asset==="all" ||

        trade.asset.toLowerCase()===asset;

        const matchesStatus=

        status==="all" ||

        trade.status.toLowerCase()===status;

        return (
            matchesKeyword &&
            matchesAsset &&
            matchesStatus
        );

    });

    renderTrades(filtered);

}

search.addEventListener(
"keyup",
filterTrades
);

assetFilter.addEventListener(
"change",
filterTrades
);

statusFilter.addEventListener(
"change",
filterTrades
);

/*==================================================
AUTO REFRESH SUMMARY
==================================================*/

setInterval(()=>{

    filterTrades();

},3000);
/*==================================================
PART 3
VIEW • CREATE • EDIT TRADE
==================================================*/

let selectedUID = null;
let selectedTradeID = null;

/*==================================================
VIEW TRADE
==================================================*/

window.viewTrade = async function(uid, tradeId){

    const snap = await get(
        ref(db,`trades/${uid}/${tradeId}`)
    );

    if(!snap.exists()){

        alert("Trade not found.");
        return;

    }

    const trade = snap.val();

    alert(`

TRADE DETAILS

Asset:
${trade.asset}

Investment:
$${Number(trade.amount).toLocaleString()}

Current Balance:
$${Number(trade.currentBalance).toLocaleString()}

Profit:
$${Number(trade.profit).toLocaleString()}

ROI:
${trade.roi}%

Duration:
${trade.duration} Days

Progress:
${trade.progress||0}%

Status:
${trade.status}

Created:
${new Date(trade.createdAt).toLocaleString()}

Ends:
${new Date(trade.finishAt).toLocaleString()}

`);

};

/*==================================================
OPEN EDIT
==================================================*/

window.editTrade = async function(uid,tradeId){

    selectedUID = uid;
    selectedTradeID = tradeId;

    const snap = await get(
        ref(db,`trades/${uid}/${tradeId}`)
    );

    if(!snap.exists()) return;

    const trade = snap.val();

    editAsset.value = trade.asset;
    editAmount.value = trade.amount;
    editBalance.value = trade.currentBalance;
    editProfit.value = trade.profit;
    editROI.value = trade.roi;
    editProgress.value = trade.progress||0;
    editStatus.value = trade.status;
    editDuration.value = trade.duration;

    tradeModal.style.display="flex";

};

/*==================================================
SAVE EDIT
==================================================*/

saveTrade.onclick = async()=>{

    if(!selectedUID || !selectedTradeID) return;

    const duration = Number(editDuration.value);

    await update(

        ref(db,
        `trades/${selectedUID}/${selectedTradeID}`),

        {

            asset:editAsset.value,

            amount:Number(editAmount.value),

            currentBalance:Number(editBalance.value),

            profit:Number(editProfit.value),

            roi:Number(editROI.value),

            progress:Number(editProgress.value),

            duration:duration,

            status:editStatus.value,

            finishAt:
            Date.now()+
            (duration*86400000),

            updatedAt:Date.now()

        }

    );

    tradeModal.style.display="none";

    alert("Trade updated successfully.");

};

/*==================================================
CREATE TRADE FOR USER
==================================================*/

window.createTrade = async function(uid){

    const amount = Number(prompt("Investment Amount"));

    if(!amount) return;

    const asset = prompt("Asset");

    if(!asset) return;

    const roi = Number(prompt("ROI (%)"));

    const duration = Number(prompt("Duration (Days)"));

    const tradeRef = push(

        ref(db,`trades/${uid}`)

    );

    await set(

        tradeRef,

        {

            asset,

            amount,

            roi,

            duration,

            progress:0,

            profit:0,

            currentBalance:amount,

            status:"active",

            createdAt:Date.now(),

            updatedAt:Date.now(),

            finishAt:
            Date.now()+
            (duration*86400000)

        }

    );

    alert("Trade created successfully.");

};
/*==================================================
PART 4
TRADE CONTROL
PAUSE • RESUME • COMPLETE • CANCEL • DELETE
==================================================*/

/*==================================================
PAUSE TRADE
==================================================*/

window.pauseTrade = async function(uid, tradeId){

    if(!confirm("Pause this trade?")) return;

    await update(
        ref(db,`trades/${uid}/${tradeId}`),
        {
            status:"paused",
            updatedAt:Date.now()
        }
    );

};

/*==================================================
RESUME TRADE
==================================================*/

window.resumeTrade = async function(uid, tradeId){

    if(!confirm("Resume this trade?")) return;

    await update(
        ref(db,`trades/${uid}/${tradeId}`),
        {
            status:"active",
            updatedAt:Date.now()
        }
    );

};

/*==================================================
COMPLETE TRADE
==================================================*/

window.completeTrade = async function(uid, tradeId){

    if(!confirm("Complete this trade?")) return;

    const tradeRef = ref(db,`trades/${uid}/${tradeId}`);

    const snap = await get(tradeRef);

    if(!snap.exists()) return;

    const trade = snap.val();

    const walletRef = ref(db,`wallets/${uid}`);

    const walletSnap = await get(walletRef);

    let wallet = walletSnap.exists()
        ? walletSnap.val()
        : {};

    const finalBalance =
        Number(trade.amount) +
        Number(trade.profit);

    await update(tradeRef,{

        status:"completed",
        progress:100,
        currentBalance:finalBalance,
        completed:true,
        updatedAt:Date.now()

    });

    await update(walletRef,{

        balance:
            Number(wallet.balance||0)+
            finalBalance,

        totalProfit:
            Number(wallet.totalProfit||0)+
            Number(trade.profit),

        updatedAt:Date.now()

    });

    alert("Trade completed successfully.");

};

/*==================================================
CANCEL TRADE
==================================================*/

window.cancelTrade = async function(uid, tradeId){

    if(!confirm("Cancel this trade?")) return;

    await update(
        ref(db,`trades/${uid}/${tradeId}`),
        {
            status:"cancelled",
            updatedAt:Date.now()
        }
    );

    alert("Trade cancelled.");

};

/*==================================================
DELETE TRADE
==================================================*/

window.deleteTrade = async function(uid, tradeId){

    if(!confirm("Delete this trade permanently?")) return;

    await remove(
        ref(db,`trades/${uid}/${tradeId}`)
    );

    alert("Trade deleted.");

};

/*==================================================
RESET TRADE
==================================================*/

window.resetTrade = async function(uid, tradeId){

    if(!confirm("Reset this trade?")) return;

    const snap = await get(
        ref(db,`trades/${uid}/${tradeId}`)
    );

    if(!snap.exists()) return;

    const trade = snap.val();

    await update(

        ref(db,`trades/${uid}/${tradeId}`),

        {

            progress:0,

            profit:0,

            currentBalance:trade.amount,

            status:"active",

            createdAt:Date.now(),

            finishAt:
                Date.now()+
                (trade.duration*86400000),

            updatedAt:Date.now()

        }

    );

    alert("Trade restarted.");

};

/*==================================================
EXTEND TRADE
==================================================*/

window.extendTrade = async function(uid, tradeId){

    const days = Number(
        prompt("Extend by how many days?")
    );

    if(!days) return;

    const tradeRef =
        ref(db,`trades/${uid}/${tradeId}`);

    const snap = await get(tradeRef);

    if(!snap.exists()) return;

    const trade = snap.val();

    await update(tradeRef,{

        finishAt:
            Number(trade.finishAt)+
            (days*86400000),

        duration:
            Number(trade.duration)+days,

        updatedAt:Date.now()

    });

    alert("Trade extended successfully.");

};

/*==================================================
END PART 4
==================================================*/
/*==================================================
PART 5
LIVE TRADE ENGINE
ADMIN CONTROL PANEL
==================================================*/

/*==================================================
UPDATE TRADE
==================================================*/

window.updateTradeEngine = async function(
    uid,
    tradeId,
    progress,
    balance,
    profit
){

    await update(

        ref(db,`trades/${uid}/${tradeId}`),

        {

            progress:Number(progress),

            currentBalance:Number(balance),

            profit:Number(profit),

            updatedAt:Date.now()

        }

    );

};

/*==================================================
INCREASE PROFIT
==================================================*/

window.addProfit = async function(uid,tradeId){

    const value = Number(
        prompt("Profit to Add")
    );

    if(isNaN(value)) return;

    const tradeRef =
    ref(db,`trades/${uid}/${tradeId}`);

    const snap = await get(tradeRef);

    if(!snap.exists()) return;

    const trade = snap.val();

    await update(tradeRef,{

        profit:
        Number(trade.profit||0)+value,

        currentBalance:
        Number(trade.currentBalance||0)+value,

        updatedAt:Date.now()

    });

};

/*==================================================
DECREASE PROFIT
==================================================*/

window.removeProfit = async function(uid,tradeId){

    const value = Number(
        prompt("Profit to Remove")
    );

    if(isNaN(value)) return;

    const tradeRef =
    ref(db,`trades/${uid}/${tradeId}`);

    const snap = await get(tradeRef);

    if(!snap.exists()) return;

    const trade = snap.val();

    await update(tradeRef,{

        profit:
        Math.max(0,
        Number(trade.profit||0)-value),

        currentBalance:
        Math.max(
            Number(trade.amount),
            Number(trade.currentBalance||0)-value
        ),

        updatedAt:Date.now()

    });

};

/*==================================================
CHANGE ROI
==================================================*/

window.changeROI = async function(uid,tradeId){

    const roi = Number(
        prompt("New ROI (%)")
    );

    if(isNaN(roi)) return;

    await update(

        ref(db,`trades/${uid}/${tradeId}`),

        {

            roi,

            updatedAt:Date.now()

        }

    );

};

/*==================================================
CHANGE PROGRESS
==================================================*/

window.changeProgress = async function(uid,tradeId){

    const progress = Number(
        prompt("Progress (%)")
    );

    if(isNaN(progress)) return;

    await update(

        ref(db,`trades/${uid}/${tradeId}`),

        {

            progress,

            updatedAt:Date.now()

        }

    );

};

/*==================================================
AUTO COMPLETE CHECK
==================================================*/

setInterval(async()=>{

    const snapshot = await get(ref(db,"trades"));

    if(!snapshot.exists()) return;

    Object.entries(snapshot.val()).forEach(

        async([uid,trades])=>{

            Object.entries(trades).forEach(

                async([tradeId,trade])=>{

                    if(

                        trade.status==="active" &&

                        Date.now()>=trade.finishAt

                    ){

                        await completeTrade(uid,tradeId);

                    }

                }

            );

        }

    );

},60000);

/*==================================================
END PART 5
==================================================*/
/*==================================================
PART 6
ADMIN DASHBOARD
STATISTICS • NOTIFICATIONS • AUDIT LOG
==================================================*/

/*==================================================
UPDATE DASHBOARD STATISTICS
==================================================*/

async function updateStatistics(){

    const tradeSnap = await get(ref(db,"trades"));
    const userSnap = await get(ref(db,"users"));
    const walletSnap = await get(ref(db,"wallets"));

    let users = 0;
    let active = 0;
    let completed = 0;
    let paused = 0;
    let cancelled = 0;
    let investment = 0;
    let profit = 0;
    let walletBalance = 0;

    if(userSnap.exists()){

        users = Object.keys(userSnap.val()).length;

    }

    if(walletSnap.exists()){

        Object.values(walletSnap.val()).forEach(wallet=>{

            walletBalance += Number(wallet.balance||0);
            profit += Number(wallet.totalProfit||0);

        });

    }

    if(tradeSnap.exists()){

        Object.values(tradeSnap.val()).forEach(userTrades=>{

            Object.values(userTrades).forEach(trade=>{

                investment += Number(trade.amount||0);

                switch(trade.status){

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

            });

        });

    }

    document.getElementById("totalUsers").textContent = users;
    document.getElementById("activeTrades").textContent = active;
    document.getElementById("completedTrades").textContent = completed;
    document.getElementById("pausedTrades").textContent = paused;
    document.getElementById("cancelledTrades").textContent = cancelled;
    document.getElementById("tradeVolume").textContent = "$"+investment.toLocaleString();
    document.getElementById("walletBalance").textContent = "$"+walletBalance.toLocaleString();
    document.getElementById("totalProfit").textContent = "$"+profit.toLocaleString();

}

setInterval(updateStatistics,5000);

/*==================================================
SEND NOTIFICATION
==================================================*/

window.sendNotification = async function(uid,title,message){

    const id = push(ref(db,"notifications/"+uid));

    await set(id,{

        title,
        message,
        read:false,
        createdAt:Date.now()

    });

};

/*==================================================
BROADCAST
==================================================*/

window.broadcastMessage = async function(){

    const title = prompt("Notification Title");

    if(!title) return;

    const message = prompt("Message");

    if(!message) return;

    const users = await get(ref(db,"users"));

    if(!users.exists()) return;

    Object.keys(users.val()).forEach(async(uid)=>{

        const id = push(ref(db,"notifications/"+uid));

        await set(id,{

            title,
            message,
            read:false,
            createdAt:Date.now()

        });

    });

    alert("Broadcast completed.");

};

/*==================================================
AUDIT LOG
==================================================*/

async function writeAudit(action,uid){

    const log = push(ref(db,"auditLogs"));

    await set(log,{

        action,
        uid,
        admin:auth.currentUser.email,
        timestamp:Date.now()

    });

}

/*==================================================
LOGOUT
==================================================*/

document.getElementById("logoutBtn")

.addEventListener("click",async()=>{

    if(confirm("Logout Administrator?")){

        await signOut(auth);

        location.replace("login.html");

    }

});

/*==================================================
SYSTEM HEARTBEAT
==================================================*/

setInterval(async()=>{

    await update(ref(db,"system"),{

        adminOnline:true,
        heartbeat:Date.now()

    });

},30000);

/*==================================================
INITIALIZE
==================================================*/

window.addEventListener("load",()=>{

    updateStatistics();

    console.log("=======================================");
    console.log("ADMIN TRADE MANAGEMENT INITIALIZED");
    console.log("Realtime Monitoring Enabled");
    console.log("Firebase Connected");
    console.log("=======================================");

});
/*==================================================
admin-trades.js
PART 7
CREATE TRADE MODAL • EXPORT • LIVE CLOCK
==================================================*/

/*==================================================
OPEN CREATE TRADE
==================================================*/

window.openCreateTrade = async function(){

    selectedUID = null;
    selectedTradeID = null;

    editAsset.value = "";
    editAmount.value = "";
    editBalance.value = "";
    editProfit.value = "";
    editROI.value = "";
    editProgress.value = 0;
    editDuration.value = "";
    editStatus.value = "active";

    const uid = prompt("Enter User UID");

    if(!uid) return;

    selectedUID = uid;

    tradeModal.style.display = "flex";

};

/*==================================================
CREATE NEW TRADE
==================================================*/

saveTrade.onclick = async()=>{

    if(!selectedUID) return;

    if(selectedTradeID){

        await update(

            ref(db,
            `trades/${selectedUID}/${selectedTradeID}`),

            {

                asset:editAsset.value,

                amount:Number(editAmount.value),

                currentBalance:Number(editBalance.value),

                profit:Number(editProfit.value),

                roi:Number(editROI.value),

                progress:Number(editProgress.value),

                duration:Number(editDuration.value),

                status:editStatus.value,

                updatedAt:Date.now()

            }

        );

        alert("Trade Updated Successfully.");

    }else{

        const tradeRef = push(

            ref(db,`trades/${selectedUID}`)

        );

        await set(

            tradeRef,

            {

                asset:editAsset.value,

                amount:Number(editAmount.value),

                currentBalance:Number(editBalance.value),

                profit:Number(editProfit.value),

                roi:Number(editROI.value),

                progress:Number(editProgress.value),

                duration:Number(editDuration.value),

                status:editStatus.value,

                createdAt:Date.now(),

                updatedAt:Date.now(),

                finishAt:
                Date.now()+
                (Number(editDuration.value)*86400000)

            }

        );

        alert("Trade Created Successfully.");

    }

    tradeModal.style.display="none";

};

/*==================================================
EXPORT CSV
==================================================*/

window.exportTrades=function(){

    let csv=[];

    csv.push(

"Name,Email,Asset,Investment,Balance,Profit,ROI,Status"

    );

    tradeCache.forEach(t=>{

        csv.push(

`${t.name},
${t.email},
${t.asset},
${t.amount},
${t.currentBalance},
${t.profit},
${t.roi},
${t.status}`

        );

    });

    const blob=new Blob(

        [csv.join("\n")],

        {

            type:"text/csv"

        }

    );

    const a=document.createElement("a");

    a.href=

    URL.createObjectURL(blob);

    a.download="Trades_Report.csv";

    a.click();

};

/*==================================================
LIVE CLOCK
==================================================*/

setInterval(()=>{

    const clock=document.getElementById("liveClock");

    if(clock){

        clock.innerHTML=

        new Date().toLocaleString();

    }

},1000);

/*==================================================
ENGINE STATUS
==================================================*/

const messages=[

"Monitoring Live Trades",

"Checking Wallets",

"Updating ROI",

"Scanning Database",

"Monitoring Investments",

"Synchronizing Firebase",

"Trade Engine Online"

];

let index=0;

setInterval(()=>{

    const status=

    document.getElementById("engineStatus");

    if(status){

        status.innerHTML=messages[index];

    }

    index++;

    if(index>=messages.length){

        index=0;

    }

},4000);

/*==================================================
END PART 7
==================================================*/

/*==================================================
END OF admin-trades.js
==================================================*/