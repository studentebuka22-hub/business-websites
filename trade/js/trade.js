// trade.js
// PART 1 OF REBUILT CONTINUOUS FILE
// Realtime Timestamp Trading Engine

import {
    auth,
    db,
    ref,
    push,
    set,
    get,
    update,
    onValue,
    increment,
    serverTimestamp
} from "./firebase.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

/*==========================================================
DOM
==========================================================*/

const loader=document.getElementById("pageLoader");
const form=document.getElementById("tradeForm");

const plan=document.getElementById("plan");
const amount=document.getElementById("amount");
const duration=document.getElementById("duration");
const asset=document.getElementById("asset");
const risk=document.getElementById("risk");

const expectedProfit=document.getElementById("expectedProfit");
const targetBalance=document.getElementById("targetBalance");

const walletBalance=document.getElementById("walletBalance");
const availableBalance=document.getElementById("availableBalance");
const runningTrades=document.getElementById("runningTrades");
const completedTrades=document.getElementById("completedTrades");
const totalProfit=document.getElementById("totalProfit");

const tradeHistory=document.getElementById("tradeHistory");

const notification=document.getElementById("notification");
const notificationText=document.getElementById("notificationText");

const pageOverlay=document.getElementById("pageOverlay");

const logoutBtn=document.getElementById("logoutBtn");

/*==========================================================
GLOBALS
==========================================================*/

let currentUser=null;

let wallet={
    balance:0,
    tradingBalance:0,
    totalProfit:0,
    totalDeposit:0,
    totalWithdrawal:0,
    activeTrade:false
};

let trades=[];

let walletUnsubscribe=null;
let tradeUnsubscribe=null;

let engineInterval=null;
let uiInterval=null;

/*==========================================================
TRADE SETTINGS
==========================================================*/

const TRADE_DURATIONS={

    "24 Hours":{
        milliseconds:86400000,
        roi:0.10
    },

    "3 Days":{
        milliseconds:259200000,
        roi:0.20
    },

    "7 Days":{
        milliseconds:604800000,
        roi:0.35
    },

    "14 Days":{
        milliseconds:1209600000,
        roi:0.50
    },

    "30 Days":{
        milliseconds:2592000000,
        roi:0.75
    }

};

/*==========================================================
AUTH
==========================================================*/

onAuthStateChanged(auth,user=>{

    if(!user){

        location.replace("login.html");

        return;

    }

    currentUser=user;

    initializeTradingEngine();

});

/*==========================================================
INITIALIZE
==========================================================*/

function initializeTradingEngine(){

    loader.style.display="none";

    bindEvents();

    listenWallet();

    listenTrades();

    synchronizeTrades();

    startRealtimeEngine();

}

/*==========================================================
EVENTS
==========================================================*/

function bindEvents(){

    logoutBtn?.addEventListener("click",async()=>{

        await signOut(auth);

        location.replace("login.html");

    });

    plan.addEventListener("change",calculateTrade);

    amount.addEventListener("input",calculateTrade);

    duration.addEventListener("change",calculateTrade);

    form.addEventListener("submit",startTrade);

}

/*==========================================================
WALLET LISTENER
==========================================================*/

function listenWallet(){

    if(walletUnsubscribe){

        walletUnsubscribe();

    }

    walletUnsubscribe=onValue(

        ref(db,"wallets/"+currentUser.uid),

        snapshot=>{

            if(snapshot.exists()){

                wallet=snapshot.val();

            }

            updateWallet();

            calculateTrade();

        }

    );

}

/*==========================================================
TRADE LISTENER
==========================================================*/

function listenTrades(){

    if(tradeUnsubscribe){

        tradeUnsubscribe();

    }

    tradeUnsubscribe=onValue(

        ref(db,"trades/"+currentUser.uid),

        snapshot=>{

            trades=[];

            if(snapshot.exists()){

                snapshot.forEach(item=>{

                    trades.push({

                        id:item.key,

                        ...item.val()

                    });

                });

            }

            renderTrades();

        }

    );

}

/*==========================================================
UPDATE WALLET
==========================================================*/

function updateWallet(){

    walletBalance.textContent=money(wallet.balance);

    availableBalance.textContent=money(wallet.balance);

    totalProfit.textContent=money(wallet.totalProfit);

}

/*==========================================================
CALCULATOR
==========================================================*/

function calculateTrade(){

    const investment=Number(amount.value||0);

    if(

        investment<=0 ||

        !TRADE_DURATIONS[duration.value]

    ){

        expectedProfit.value="$0.00";

        targetBalance.value="$0.00";

        return;

    }

    const roi=

        TRADE_DURATIONS[duration.value].roi;

    const profit=

        investment*roi;

    expectedProfit.value=

        money(profit);

    targetBalance.value=

        money(

            investment+profit

        );

}

/*==========================================================
FORMAT MONEY
==========================================================*/

function money(value){

    return "$"+

    Number(value||0)

    .toLocaleString(

        undefined,

        {

            minimumFractionDigits:2,

            maximumFractionDigits:2

        }

    );

}
/*==========================================================
START NEW TRADE
==========================================================*/

async function startTrade(e){

    e.preventDefault();

    if(wallet.activeTrade){

        notify("You already have an active trade.");

        return;

    }

    const investment=Number(amount.value);

    if(investment<=0){

        notify("Enter a valid amount.");

        return;

    }

    if(investment>wallet.balance){

        notify("Insufficient wallet balance.");

        return;

    }

    const settings=TRADE_DURATIONS[duration.value];

    if(!settings){

        notify("Invalid duration.");

        return;

    }

    showLoader();

    try{

        const start=Date.now();

        const finish=start+settings.milliseconds;

        const expectedProfit=Number(

            (investment*settings.roi).toFixed(2)

        );

        const target=Number(

            (investment+expectedProfit).toFixed(2)

        );

        const tradeRef=push(

            ref(db,"trades/"+currentUser.uid)

        );

        await set(tradeRef,{

            plan:plan.value,

            asset:asset.value,

            risk:risk.value,

            amount:investment,

            duration:duration.value,

            roi:settings.roi,

            expectedProfit,

            currentProfit:0,

            currentBalance:investment,

            targetBalance:target,

            startedAt:start,

            finishAt:finish,

            lastUpdate:start,

            remainingTime:settings.milliseconds,

            durationMilliseconds:settings.milliseconds,

            progress:0,

            status:"running",

            completed:false,

            payoutDone:false,

            createdAt:serverTimestamp()

        });

        await update(

            ref(db,"wallets/"+currentUser.uid),

            {

                balance:Number(wallet.balance)-investment,

                tradingBalance:increment(investment),

                activeTrade:true,

                lastUpdated:Date.now()

            }

        );

        form.reset();

        expectedProfit.value="$0.00";

        targetBalance.value="$0.00";

        notify("Trade started successfully.");

    }catch(error){

        alert(error.message);

    }

    hideLoader();

}

/*==========================================================
REALTIME ENGINE
==========================================================*/

function startRealtimeEngine(){

    if(engineInterval){

        clearInterval(engineInterval);

    }

    if(uiInterval){

        clearInterval(uiInterval);

    }

    synchronizeTrades();

    engineInterval=setInterval(

        synchronizeTrades,

        10000

    );

    uiInterval=setInterval(

        renderTrades,

        1000

    );

}

/*==========================================================
SYNC ALL TRADES
==========================================================*/

async function synchronizeTrades(){

    if(!currentUser) return;

    const snap=await get(

        ref(db,"trades/"+currentUser.uid)

    );

    if(!snap.exists()) return;

    const data=snap.val();

    for(const id in data){

        await synchronizeTrade(

            id,

            data[id]

        );

    }

}
/*==========================================================
SYNC SINGLE TRADE
Realtime Timestamp Engine
==========================================================*/

async function synchronizeTrade(tradeId, trade) {

    if (!trade) return;

    if (trade.completed || trade.status === "completed") {

        return;

    }

    const now = Date.now();

    const started = Number(trade.startedAt || now);

    const finish = Number(trade.finishAt || now);

    const totalTime = finish - started;

    const elapsed = Math.max(0, now - started);

    let progress = elapsed / totalTime;

    if (progress > 1) progress = 1;
    if (progress < 0) progress = 0;

    const currentProfit = Number(
        (trade.expectedProfit * progress).toFixed(2)
    );

    const currentBalance = Number(
        (trade.amount + currentProfit).toFixed(2)
    );

    const remainingTime = Math.max(
        0,
        finish - now
    );

    const percent = Number(
        (progress * 100).toFixed(2)
    );

    const updates = {

        progress: percent,

        currentProfit,

        currentBalance,

        remainingTime,

        lastUpdate: now

    };

    await update(

        ref(
            db,
            "trades/" +
            currentUser.uid +
            "/" +
            tradeId
        ),

        updates

    );

    if (remainingTime <= 0) {

        await finishTrade(
            tradeId,
            trade,
            currentBalance,
            currentProfit
        );

    }

}

/*==========================================================
COMPLETE TRADE
(Duplicate-safe)
==========================================================*/

async function finishTrade(
    tradeId,
    trade,
    finalBalance,
    finalProfit
) {

    const tradeReference = ref(
        db,
        "trades/" +
        currentUser.uid +
        "/" +
        tradeId
    );

    const snapshot = await get(tradeReference);

    if (!snapshot.exists()) return;

    const latest = snapshot.val();

    if (
        latest.completed === true ||
        latest.payoutDone === true
    ) {
        return;
    }

    await update(tradeReference, {

        completed: true,

        payoutDone: true,

        status: "completed",

        progress: 100,

        currentProfit: finalProfit,

        currentBalance: finalBalance,

        remainingTime: 0,

        updatedAt: Date.now(),

        completedAt: Date.now()

    });

    await update(

        ref(
            db,
            "wallets/" +
            currentUser.uid
        ),

        {

            balance: increment(finalBalance),

            tradingBalance: increment(-trade.amount),

            totalProfit: increment(finalProfit),

            activeTrade: false,

            lastUpdated: Date.now()

        }

    );

    const notificationRef = push(

        ref(
            db,
            "notifications/" +
            currentUser.uid
        )

    );

    await set(notificationRef, {

        title: "Trade Completed",

        message:
            trade.asset +
            " trade completed successfully.",

        read: false,

        createdAt: Date.now()

    });

    notify(
        "Trade completed successfully."
    );

}
/*==========================================================
RENDER TRADES
==========================================================*/

function renderTrades() {

    tradeHistory.innerHTML = "";

    let running = 0;
    let completed = 0;

    trades.sort((a, b) => b.startedAt - a.startedAt);

    if (trades.length === 0) {

        tradeHistory.innerHTML = `

        <tr>

            <td colspan="8">

                No trades found.

            </td>

        </tr>

        `;

    }

    trades.forEach(trade => {

        if (trade.status === "running") {

            running++;

        }

        if (trade.status === "completed") {

            completed++;

        }

        const remain = Math.max(
            0,
            Number(trade.finishAt) - Date.now()
        );

        tradeHistory.innerHTML += `

        <tr>

            <td>${trade.plan}</td>

            <td>${trade.asset}</td>

            <td>${money(trade.amount)}</td>

            <td>${money(trade.currentProfit)}</td>

            <td>${trade.duration}</td>

            <td>

                <span class="${trade.status}">

                    ${trade.status.toUpperCase()}

                </span>

            </td>

            <td>

                ${new Date(
                    trade.startedAt
                ).toLocaleString()}

            </td>

            <td>

                ${trade.status==="running"
                ?formatRemaining(remain)
                :"Completed"}

            </td>

        </tr>

        `;

    });

    runningTrades.textContent = running;

    completedTrades.textContent = completed;

}

/*==========================================================
LIVE MARKET
==========================================================*/

const market = {

    btc:118250,
    eth:3820,
    sol:198,
    bnb:812

};

function randomPrice(price){

    const move=(Math.random()-0.5)*0.012;

    return Number(

        (price*(1+move)).toFixed(2)

    );

}

function updateMarket(){

    market.btc=randomPrice(market.btc);
    market.eth=randomPrice(market.eth);
    market.sol=randomPrice(market.sol);
    market.bnb=randomPrice(market.bnb);

    updateCoin("btc",market.btc);
    updateCoin("eth",market.eth);
    updateCoin("sol",market.sol);
    updateCoin("bnb",market.bnb);

}

function updateCoin(symbol,price){

    const priceLabel=document.getElementById(symbol+"Price");
    const changeLabel=document.getElementById(symbol+"Change");

    if(!priceLabel) return;

    priceLabel.textContent=money(price);

    const change=((Math.random()*4)-2).toFixed(2);

    changeLabel.textContent=

        (change>0?"+":"")+change+"%";

    changeLabel.className=

        Number(change)>=0

        ?"green"

        :"red";

}

setInterval(updateMarket,5000);

updateMarket();

/*==========================================================
HELPERS
==========================================================*/

function formatRemaining(ms){

    const d=Math.floor(ms/86400000);

    const h=Math.floor((ms%86400000)/3600000);

    const m=Math.floor((ms%3600000)/60000);

    const s=Math.floor((ms%60000)/1000);

    if(d>0){

        return `${d}d ${h}h ${m}m`;

    }

    if(h>0){

        return `${h}h ${m}m`;

    }

    return `${m}m ${s}s`;

}

function showLoader(){

    pageOverlay.style.display="flex";

}

function hideLoader(){

    pageOverlay.style.display="none";

}

function notify(message){

    notification.style.display="flex";

    notificationText.textContent=message;

    setTimeout(()=>{

        notification.style.display="none";

    },3000);

}

/*==========================================================
AUTO REFRESH
==========================================================*/

setInterval(()=>{

    renderTrades();

    updateWallet();

},1000);

/*==========================================================
INITIAL SYNCHRONIZATION
==========================================================*/

document.addEventListener(

    "visibilitychange",

    ()=>{

        if(

            document.visibilityState==="visible"

        ){

            synchronizeTrades();

        }

    }

);

window.addEventListener(

    "focus",

    synchronizeTrades

);

window.addEventListener(

    "online",

    synchronizeTrades

);

window.addEventListener(

    "load",

    synchronizeTrades

);

/*==========================================================
END OF trade.js
==========================================================*/