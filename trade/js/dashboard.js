// dashboard.js
// Part 1

import {
    auth,
    db,
    ref,
    get,
    onValue,
    TRADE_ASSETS,
    MARKET_STATUS
} from "./firebase.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

/*==========================================================
    DOM
==========================================================*/

const welcomeName =
    document.getElementById("welcomeName");

const walletBalance =
    document.getElementById("walletBalance");

const demoBalance =
    document.getElementById("demoBalance");

const totalProfit =
    document.getElementById("totalProfit");

const totalDeposit =
    document.getElementById("totalDeposit");

const totalWithdrawal =
    document.getElementById("totalWithdrawal");

const tradeStatus =
    document.getElementById("tradeStatus");

const tradeAsset =
    document.getElementById("tradeAsset");

const tradeProgress =
    document.getElementById("tradeProgress");

const progressBar =
    document.getElementById("progressBar");

const targetBalance =
    document.getElementById("targetBalance");

const currentBalance =
    document.getElementById("currentBalance");

const countdown =
    document.getElementById("countdown");

const marketStatus =
    document.getElementById("marketStatus");

const recentNotification =
    document.getElementById("recentNotification");

const portfolioContainer =
    document.getElementById("portfolioContainer");

/*==========================================================
    VARIABLES
==========================================================*/

let currentUID = "";

let wallet = {};

let trade = {};

let notifications = {};

let statusIndex = 0;

/*==========================================================
    FORMATTERS
==========================================================*/

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

function percent(value) {

    return Number(value || 0)

        .toFixed(2) + "%";

}

/*==========================================================
    LISTEN WALLET
==========================================================*/

function listenWallet(uid) {

    onValue(ref(db, "wallets/" + uid), snapshot => {

        if (!snapshot.exists()) {

            walletBalance.textContent = money(0);
            demoBalance.textContent = money(0);
            totalProfit.textContent = money(0);
            totalDeposit.textContent = money(0);
            totalWithdrawal.textContent = money(0);

            return;
        }

        wallet = snapshot.val();

        walletBalance.textContent = money(wallet.balance || 0);
        demoBalance.textContent = money(wallet.demoBalance || 0);
        totalProfit.textContent = money(wallet.totalProfit || 0);
        totalDeposit.textContent = money(wallet.totalDeposit || 0);
        totalWithdrawal.textContent = money(wallet.totalWithdrawal || 0);

        const portfolioValue =
            document.getElementById("portfolioValue");

        if (portfolioValue) {

            portfolioValue.textContent =
                money(
                    (wallet.balance || 0) +
                    (wallet.demoBalance || 0)
                );

        }

    });

}

/*==========================================================
    LISTEN TRADE
==========================================================*/

function listenTrade(uid) {

    onValue(ref(db, "trades/" + uid), snapshot => {

        if (!snapshot.exists()) {

            tradeStatus.textContent = "NO ACTIVE TRADE";
            tradeAsset.textContent = "-";
            tradeProgress.textContent = "0%";
            currentBalance.textContent = money(0);
            targetBalance.textContent = money(0);

            if (progressBar)
                progressBar.style.width = "0%";

            return;
        }

        trade = snapshot.val();

        tradeStatus.textContent =
            trade.status || "ACTIVE";

        tradeAsset.textContent =
            trade.asset || "-";

        tradeProgress.textContent =
            percent(trade.progress || 0);

        currentBalance.textContent =
            money(trade.currentBalance || 0);

        targetBalance.textContent =
            money(trade.targetBalance || 0);

        if (progressBar) {

            progressBar.style.width =
                (trade.progress || 0) + "%";

        }

        const currentAsset =
            document.getElementById("currentAsset");

        if (currentAsset)
            currentAsset.textContent =
                trade.asset || "-";

        const currentProfit =
            document.getElementById("currentProfit");

        if (currentProfit) {

            currentProfit.textContent =
                money(
                    (trade.currentBalance || 0) -
                    (trade.deposit || 0)
                );

        }

        renderPortfolio();

    });

}

/*==========================================================
    SAFE BREAK
==========================================================*/
// dashboard.js
// Part 2

/*==========================================================
    LISTEN NOTIFICATIONS
==========================================================*/

function listenNotifications(uid) {

    onValue(ref(db, "notifications/" + uid), snapshot => {

        if (!snapshot.exists()) {

            if (recentNotification)
                recentNotification.textContent =
                    "No notifications available.";

            return;

        }

        const list = Object.values(snapshot.val());

        list.sort((a, b) =>
            (b.createdAt || 0) -
            (a.createdAt || 0)
        );

        if (recentNotification && list.length) {

            recentNotification.textContent =
                list[0].title +
                " - " +
                list[0].body;

        }

    });

}
/*==========================================================
    PORTFOLIO
==========================================================*/

function renderPortfolio() {

    if (!portfolioContainer)
        return;

    portfolioContainer.innerHTML = "";

    TRADE_ASSETS.forEach(asset => {

        const active =

            trade.asset === asset.symbol;

        portfolioContainer.innerHTML += `

        <div class="portfolio-card ${active ? "active" : ""}">

            <h3>${asset.symbol}</h3>

            <p>${asset.name}</p>

            <small>

                Target ROI

                ${(asset.targetROI * 100).toFixed(0)}%

            </small>

        </div>

        `;

    });

}

/*==========================================================
    COUNTDOWN
==========================================================*/

function updateCountdown() {

    if (

        !trade.finishAt ||

        !countdown

    ) {

        return;

    }

    const remaining =

        trade.finishAt -

        Date.now();

    if (remaining <= 0) {

        countdown.textContent =

            "Completed";

        return;

    }

    const days =

        Math.floor(

            remaining /

            86400000

        );

    const hours =

        Math.floor(

            (remaining % 86400000) /

            3600000

        );

    const minutes =

        Math.floor(

            (remaining % 3600000) /

            60000

        );

    const seconds =

        Math.floor(

            (remaining % 60000) /

            1000

        );

    countdown.textContent =

        `${days}d ${hours}h ${minutes}m ${seconds}s`;

}

/*==========================================================
    MARKET STATUS
==========================================================*/

function rotateMarketStatus() {

    if (!marketStatus)
        return;

    marketStatus.textContent =

        MARKET_STATUS[statusIndex];

    statusIndex++;

    if (

        statusIndex >=

        MARKET_STATUS.length

    ) {

        statusIndex = 0;

    }

}

/*==========================================================
    SAFE BREAK
==========================================================*/
// dashboard.js
// Part 3

/*==========================================================
    LOAD USER PROFILE
==========================================================*/

async function loadProfile(uid) {

    const snap = await get(
        ref(db, "users/" + uid)
    );

    if (!snap.exists()) return;

    const user = snap.val();

    const fullName =
        `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
        user.fullName ||
        user.name ||
        "Trader";

    const fields = {

        welcomeName: fullName,
        userName: fullName,

        firstName: user.firstName || "",
        lastName: user.lastName || "",

        fullName: fullName,

        email: user.email || "",
        userEmail: user.email || "",

        phone: user.phone || "",
        userPhone: user.phone || "",

        country: user.country || "",
        userCountry: user.country || "",

        role: user.role || "User",
        userRole: user.role || "User",

        accountStatus: user.status || "Active",

        joinedDate: user.createdAt
            ? new Date(user.createdAt).toLocaleDateString()
            : "-"

    };

    Object.keys(fields).forEach(id => {

        const el = document.getElementById(id);

        if (el) {

            el.textContent = fields[id];

        }

    });

    const avatar = document.getElementById("profilePhoto");

    if (avatar && user.photo) {

        avatar.src = user.photo;

    }

}

/*==========================================================
    AUTH
==========================================================*/

onAuthStateChanged(auth, async (user) => {

    if (!user) {
        location.replace("login.html");
        return;
    }

    try {

        const snap = await get(ref(db, "users/" + user.uid));

        if (!snap.exists()) {
            location.replace("login.html");
            return;
        }

        const profile = snap.val();

        // Prevent admins from opening the user dashboard
        if (profile.role === "admin") {
            location.replace("admin.html");
            return;
        }

        currentUID = user.uid;

        await loadProfile(user.uid);

        listenWallet(user.uid);

        listenTrade(user.uid);

        listenNotifications(user.uid);

        renderPortfolio();

        rotateMarketStatus();

        updateCountdown();

    } catch (error) {

        console.error(error);

        location.replace("login.html");

    }

});

/*==========================================================
    AUTO REFRESH
==========================================================*/

setInterval(

    updateCountdown,

    1000

);

setInterval(

    rotateMarketStatus,

    3000

);

setInterval(

    renderPortfolio,

    5000

);

/*==========================================================
    WINDOW FOCUS
==========================================================*/

window.addEventListener(

    "focus",

    () => {

        if (

            currentUID

        ) {

            renderPortfolio();

            updateCountdown();

        }

    }

);

/*==========================================================
    END OF dashboard.js
==========================================================*/

