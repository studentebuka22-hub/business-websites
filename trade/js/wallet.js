/*==================================================
wallet.js
PART 1
AUTH • WALLET SUMMARY • FIREBASE LISTENERS
==================================================*/

import {
    auth,
    db,
    ref,
    get,
    onValue
} from "./firebase.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

/*==================================================
DOM
==================================================*/

const loader = document.getElementById("pageLoader");

const walletBalance = document.getElementById("walletBalance");

const summaryBalance = document.getElementById("summaryBalance");

const tradingBalance = document.getElementById("tradingBalance");

const summaryProfit = document.getElementById("summaryProfit");

const totalInvested = document.getElementById("totalInvested");

const activeTrades = document.getElementById("activeTrades");

const completedTrades = document.getElementById("completedTrades");

const walletDeposits = document.getElementById("walletDeposits");

const walletWithdrawals = document.getElementById("walletWithdrawals");

const walletEquity = document.getElementById("walletEquity");

const walletROI = document.getElementById("walletROI");

/*==================================================
ACTIVE TRADE DOM
==================================================*/

const walletPlan = document.getElementById("walletPlan");

const walletAsset = document.getElementById("walletAsset");

const walletRisk = document.getElementById("walletRisk");

const walletInvestment =
document.getElementById("walletInvestment");

const walletExpectedProfit =
document.getElementById("walletExpectedProfit");

const walletCurrentProfit =
document.getElementById("walletCurrentProfit");

const walletCurrentBalance =
document.getElementById("walletCurrentBalance");

const walletTargetBalance =
document.getElementById("walletTargetBalance");

const walletStarted =
document.getElementById("walletStarted");

const walletFinish =
document.getElementById("walletFinish");

const walletStatus =
document.getElementById("walletStatus");

const walletProgressBar =
document.getElementById("walletProgressBar");

const walletProgressText =
document.getElementById("walletProgressText");

const walletCountdown =
document.getElementById("walletCountdown");

/*==================================================
OTHER DOM
==================================================*/

const runningTradesContainer =
document.getElementById("runningTradesContainer");

const completedTradeHistory =
document.getElementById("completedTradeHistory");

const walletTransactionHistory =
document.getElementById("walletTransactionHistory");

const walletNotifications =
document.getElementById("walletNotifications");

const walletToast =
document.getElementById("walletToast");

const walletToastText =
document.getElementById("walletToastText");

/*==================================================
GLOBALS
==================================================*/

let currentUser = null;

let wallet = {};

let trades = {};

let activeTrade = null;

let countdownInterval = null;

/*==================================================
AUTH
==================================================*/

onAuthStateChanged(auth, async (user) => {

    if (!user) {

        location.replace("login.html");

        return;

    }

    currentUser = user;

    loader.style.display = "none";

    loadWallet();

    loadTrades();

});

/*==================================================
LOAD WALLET
==================================================*/

function loadWallet() {

    onValue(

        ref(db, "wallets/" + currentUser.uid),

        (snapshot) => {

            if (!snapshot.exists()) {

                summaryBalance.textContent = "$0.00";

                walletBalance.textContent = "$0.00";

                summaryProfit.textContent = "$0.00";

                tradingBalance.textContent = "$0.00";

                walletEquity.textContent = "$0.00";

                return;

            }

            wallet = snapshot.val();

            summaryBalance.textContent =
                money(wallet.balance);

            walletBalance.textContent =
                money(wallet.balance);

            summaryProfit.textContent =
                money(wallet.totalProfit);

            tradingBalance.textContent =
                money(wallet.tradingBalance || 0);

            walletDeposits.textContent =
                money(wallet.totalDeposits || 0);

            walletWithdrawals.textContent =
                money(wallet.totalWithdrawals || 0);

            walletEquity.textContent =
                money(
                    Number(wallet.balance || 0) +
                    Number(wallet.tradingBalance || 0)
                );

        }

    );

}

/*==================================================
LOAD USER TRADES
==================================================*/

function loadTrades() {

    onValue(

        ref(db, "trades/" + currentUser.uid),

        (snapshot) => {

            trades = {};

            activeTrade = null;

            let invested = 0;

            let profit = 0;

            let active = 0;

            let completed = 0;

            if (!snapshot.exists()) {

                activeTrades.textContent = "0";

                completedTrades.textContent = "0";

                totalInvested.textContent = "$0.00";

                walletROI.textContent = "0%";

                return;

            }

            snapshot.forEach(item => {

                const trade = item.val();

                trades[item.key] = trade;

                invested += Number(trade.amount || 0);

                profit += Number(trade.profit || 0);

                if (trade.status === "active") {

                    active++;

                    if (!activeTrade) {

                        activeTrade = {

                            id: item.key,

                            ...trade

                        };

                    }

                }

                if (trade.status === "completed") {

                    completed++;

                }

            });

            activeTrades.textContent = active;

            completedTrades.textContent = completed;

            totalInvested.textContent =
                money(invested);

            summaryProfit.textContent =
                money(profit);

            walletROI.textContent =
                invested > 0
                ? ((profit / invested) * 100).toFixed(2) + "%"
                : "0%";

            renderActiveTrade();

            renderRunningTrades();

            renderCompletedTrades();

        }

    );

}

/*==================================================
MONEY FORMAT
==================================================*/

function money(value) {

    return "$" +

        Number(value || 0)

        .toLocaleString(

            undefined,

            {

                minimumFractionDigits: 2,

                maximumFractionDigits: 2

            }

        );

}
/*==================================================
wallet.js
PART 2
ACTIVE TRADE • COUNTDOWN • LIVE PROGRESS
==================================================*/

/*==================================================
RENDER ACTIVE TRADE
==================================================*/

function renderActiveTrade() {

    clearInterval(countdownInterval);

    if (!activeTrade) {

        walletPlan.textContent = "No Active Trade";

        walletAsset.textContent = "--";

        walletRisk.textContent = "--";

        walletInvestment.textContent = "$0.00";

        walletExpectedProfit.textContent = "$0.00";

        walletCurrentProfit.textContent = "$0.00";

        walletCurrentBalance.textContent = "$0.00";

        walletTargetBalance.textContent = "$0.00";

        walletStarted.textContent = "--";

        walletFinish.textContent = "--";

        walletStatus.textContent = "Waiting";

        walletProgressBar.style.width = "0%";

        walletProgressText.textContent = "0%";

        walletCountdown.textContent = "00d 00h 00m 00s";

        return;

    }

    walletPlan.textContent =
        activeTrade.plan || "-";

    walletAsset.textContent =
        activeTrade.asset || "-";

    walletRisk.textContent =
        activeTrade.risk || "-";

    walletInvestment.textContent =
        money(activeTrade.amount);

    walletExpectedProfit.textContent =
        money(activeTrade.profit);

    walletCurrentProfit.textContent =
        money(activeTrade.profit);

    walletCurrentBalance.textContent =
        money(activeTrade.currentBalance);

    walletTargetBalance.textContent =
        money(
            Number(activeTrade.amount) +
            Number(activeTrade.profit)
        );

    walletStarted.textContent =
        new Date(
            activeTrade.createdAt
        ).toLocaleString();

    walletFinish.textContent =
        new Date(
            activeTrade.finishAt
        ).toLocaleString();

    walletStatus.textContent =
        activeTrade.status.toUpperCase();

    walletStatus.className =
        "badge " + activeTrade.status;

    updateProgress();

    startCountdown();

}

/*==================================================
COUNTDOWN
==================================================*/

function startCountdown() {

    countdownInterval = setInterval(() => {

        if (!activeTrade) {

            clearInterval(countdownInterval);

            return;

        }

        const remain =
            activeTrade.finishAt - Date.now();

        if (remain <= 0) {

            walletCountdown.textContent =
                "Trade Completed";

            walletProgressBar.style.width = "100%";

            walletProgressText.textContent = "100%";

            clearInterval(countdownInterval);

            return;

        }

        const days =
            Math.floor(remain / 86400000);

        const hours =
            Math.floor(
                (remain % 86400000) / 3600000
            );

        const mins =
            Math.floor(
                (remain % 3600000) / 60000
            );

        const secs =
            Math.floor(
                (remain % 60000) / 1000
            );

        walletCountdown.textContent =

            `${days}d ${hours}h ${mins}m ${secs}s`;

        updateProgress();

    }, 1000);

}

/*==================================================
LIVE PROGRESS
==================================================*/

function updateProgress() {

    if (!activeTrade) return;

    const total =

        activeTrade.finishAt -

        activeTrade.createdAt;

    const elapsed =

        Date.now() -

        activeTrade.createdAt;

    let percent =

        (elapsed / total) * 100;

    if (percent < 0)

        percent = 0;

    if (percent > 100)

        percent = 100;

    walletProgressBar.style.width =

        percent + "%";

    walletProgressText.textContent =

        percent.toFixed(1) + "%";

}

/*==================================================
LIVE TRADE VALUE
==================================================*/

setInterval(() => {

    if (!activeTrade)

        return;

    walletCurrentProfit.textContent =

        money(activeTrade.profit);

    walletCurrentBalance.textContent =

        money(activeTrade.currentBalance);

}, 2000);

/*==================================================
ACTIVE TRADE NOTIFICATION
==================================================*/

let notifiedTrade = null;

function notifyActiveTrade() {

    if (!activeTrade)

        return;

    if (notifiedTrade === activeTrade.id)

        return;

    notifiedTrade = activeTrade.id;

    showToast(

        "Active Trade Detected: " +

        activeTrade.asset +

        " (" +

        activeTrade.plan +

        ")"

    );

}

/*==================================================
WATCH ACTIVE TRADE
==================================================*/

setInterval(() => {

    notifyActiveTrade();

}, 5000);
/*==================================================
wallet.js
PART 3
RUNNING TRADES • COMPLETED TRADES • TRANSACTIONS
==================================================*/

/*==================================================
RENDER RUNNING TRADES
==================================================*/

function renderRunningTrades() {

    runningTradesContainer.innerHTML = "";

    const activeList = Object.entries(trades)

        .filter(([id, trade]) =>

            trade.status === "active"

        );

    if (activeList.length === 0) {

        runningTradesContainer.innerHTML = `

        <div class="empty-state">

            <h3>No Active Trades</h3>

            <p>Your running trades will appear here automatically.</p>

        </div>

        `;

        return;

    }

    activeList.forEach(([id, trade]) => {

        const progress = Number(

            trade.progress || 0

        ).toFixed(1);

        runningTradesContainer.innerHTML += `

        <div class="trade-card">

            <div class="trade-card-header">

                <h3>${trade.plan || "-"}</h3>

                <span class="badge ${trade.status}">

                    ${trade.status.toUpperCase()}

                </span>

            </div>

            <div class="trade-grid">

                <div>

                    <label>Asset</label>

                    <h4>${trade.asset}</h4>

                </div>

                <div>

                    <label>Risk</label>

                    <h4>${trade.risk || "-"}</h4>

                </div>

                <div>

                    <label>Investment</label>

                    <h4>${money(trade.amount)}</h4>

                </div>

                <div>

                    <label>Profit</label>

                    <h4>${money(trade.profit)}</h4>

                </div>

                <div>

                    <label>Balance</label>

                    <h4>${money(trade.currentBalance)}</h4>

                </div>

                <div>

                    <label>Progress</label>

                    <h4>${progress}%</h4>

                </div>

            </div>

            <div class="progress-bar">

                <div class="progress-fill"

                     style="width:${progress}%">

                </div>

            </div>

        </div>

        `;

    });

}

/*==================================================
COMPLETED TRADES
==================================================*/

function renderCompletedTrades() {

    completedTradeHistory.innerHTML = "";

    const completedList = Object.entries(trades)

        .filter(([id, trade]) =>

            trade.status === "completed"

        )

        .reverse();

    if (completedList.length === 0) {

        completedTradeHistory.innerHTML = `

        <tr>

            <td colspan="7">

                No completed trades.

            </td>

        </tr>

        `;

        return;

    }

    completedList.forEach(([id, trade]) => {

        completedTradeHistory.innerHTML += `

        <tr>

            <td>${trade.plan || "-"}</td>

            <td>${trade.asset}</td>

            <td>${money(trade.amount)}</td>

            <td>${money(trade.profit)}</td>

            <td>${money(trade.currentBalance)}</td>

            <td>

                ${new Date(

                    trade.updatedAt ||

                    trade.finishAt

                ).toLocaleString()}

            </td>

            <td>

                <span class="badge completed">

                    COMPLETED

                </span>

            </td>

        </tr>

        `;

    });

}

/*==================================================
TRANSACTIONS
==================================================*/

function renderTransactions() {

    walletTransactionHistory.innerHTML = "";

    const rows = [];

    Object.values(trades).forEach(trade => {

        rows.push({

            date: trade.createdAt,

            type: "Trade",

            description:

                (trade.plan || "Trade") +

                " - " +

                trade.asset,

            amount: trade.amount,

            status: trade.status

        });

        if (trade.status === "completed") {

            rows.push({

                date: trade.updatedAt ||

                      trade.finishAt,

                type: "Profit",

                description:

                    "Trade Profit",

                amount: trade.profit,

                status: "credited"

            });

        }

    });

    rows.sort(

        (a, b) => b.date - a.date

    );

    if (rows.length === 0) {

        walletTransactionHistory.innerHTML = `

        <tr>

            <td colspan="5">

                No transactions found.

            </td>

        </tr>

        `;

        return;

    }

    rows.forEach(row => {

        walletTransactionHistory.innerHTML += `

        <tr>

            <td>

                ${new Date(

                    row.date

                ).toLocaleString()}

            </td>

            <td>

                ${row.type}

            </td>

            <td>

                ${row.description}

            </td>

            <td>

                ${money(row.amount)}

            </td>

            <td>

                <span class="badge ${row.status}">

                    ${row.status.toUpperCase()}

                </span>

            </td>

        </tr>

        `;

    });

}

/*==================================================
AUTO REFRESH
==================================================*/

setInterval(() => {

    renderRunningTrades();

    renderCompletedTrades();

    renderTransactions();

}, 5000);
/*==================================================
wallet.js
PART 4
NOTIFICATIONS • LIVE MARKET • UTILITIES • INITIALIZE
==================================================*/

/*==================================================
SHOW TOAST
==================================================*/

function showToast(message) {

    walletToastText.textContent = message;

    walletToast.style.display = "flex";

    walletToast.style.opacity = "1";

    setTimeout(() => {

        walletToast.style.opacity = "0";

        setTimeout(() => {

            walletToast.style.display = "none";

        }, 500);

    }, 4000);

}

/*==================================================
WALLET NOTIFICATIONS
==================================================*/

function renderNotifications() {

    walletNotifications.innerHTML = "";

    const notices = [];

    Object.values(trades).forEach(trade => {

        if (trade.status === "active") {

            notices.push({

                time: trade.createdAt,

                text:
                    `${trade.asset} trade is currently running.`

            });

        }

        if (trade.status === "completed") {

            notices.push({

                time: trade.updatedAt || trade.finishAt,

                text:
                    `${trade.asset} trade completed successfully.`

            });

        }

        if (trade.status === "paused") {

            notices.push({

                time: trade.updatedAt,

                text:
                    `${trade.asset} trade has been paused.`

            });

        }

        if (trade.status === "cancelled") {

            notices.push({

                time: trade.updatedAt,

                text:
                    `${trade.asset} trade was cancelled.`

            });

        }

    });

    notices.sort((a, b) => b.time - a.time);

    if (notices.length === 0) {

        walletNotifications.innerHTML = `

        <div class="notification-item">

            No notifications available.

        </div>

        `;

        return;

    }

    notices.forEach(item => {

        walletNotifications.innerHTML += `

        <div class="notification-item">

            <strong>

                ${new Date(item.time).toLocaleString()}

            </strong>

            <br>

            ${item.text}

        </div>

        `;

    });

}

/*==================================================
LIVE MARKET (SIMULATED)
==================================================*/

function randomMove(price, maxPercent = 2) {

    const change =

        (Math.random() * maxPercent * 2) -

        maxPercent;

    return {

        price:

            price + (price * change / 100),

        change

    };

}

function updateMarket() {

    const coins = [

        ["btcPrice", "btcChange", 117240],

        ["ethPrice", "ethChange", 6420],

        ["solPrice", "solChange", 382],

        ["bnbPrice", "bnbChange", 1125]

    ];

    coins.forEach(coin => {

        const result = randomMove(coin[2]);

        document.getElementById(

            coin[0]

        ).textContent =

            money(result.price);

        const label =

            document.getElementById(

                coin[1]

            );

        label.textContent =

            (result.change >= 0 ? "+" : "") +

            result.change.toFixed(2) +

            "%";

        label.className =

            result.change >= 0

            ? "green"

            : "red";

    });

}

setInterval(updateMarket, 5000);

updateMarket();

/*==================================================
INITIALIZE
==================================================*/

setInterval(() => {

    renderNotifications();

}, 5000);

document.addEventListener(

    "DOMContentLoaded",

    () => {

        loader.style.display = "none";

        renderNotifications();

        renderTransactions();

        renderRunningTrades();

        renderCompletedTrades();

        showToast(

            "Wallet synchronized successfully."

        );

    }

);

console.log("================================");

console.log("CRYPTO WALLET READY");

console.log("Realtime Wallet Connected");

console.log("Firebase Synchronization Active");

console.log("================================");

/*==================================================
END OF wallet.js
==================================================*/