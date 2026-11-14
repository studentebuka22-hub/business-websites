// firebase.js
// Part 1

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import {
    getAuth,
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

import {
    getDatabase,
    ref,
    set,
    update,
    get,
    push,
    remove,
    onValue,
    off,
    serverTimestamp,
    increment
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-database.js";

/*==========================================================
    REPLACE WITH YOUR FIREBASE CONFIG
==========================================================*/

const firebaseConfig = {
    apiKey: "AIzaSyCNQbqTQvKwrtpbGXHgu56hbAVaKgIQ7nc",
    authDomain: "mathcloud-72a42.firebaseapp.com",
    projectId: "mathcloud-72a42",
    storageBucket: "mathcloud-72a42.firebasestorage.app",
    messagingSenderId: "123322117435",
    appId: "1:123322117435:web:ff3d2ac5c9dedc1a439b1e"
  };

/*==========================================================
    INITIALIZE
==========================================================*/

export const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

export const db = getDatabase(app);

/*==========================================================
    GLOBAL REFERENCES
==========================================================*/

export const usersRef = ref(db, "users");

export const tradesRef = ref(db, "trades");

export const walletsRef = ref(db, "wallets");

export const depositsRef = ref(db, "deposits");

export const withdrawalsRef = ref(db, "withdrawals");

export const notificationsRef = ref(db, "notifications");

export const settingsRef = ref(db, "settings");

export const assetsRef = ref(db, "assets");

export const pricesRef = ref(db, "marketPrices");

export const adminRef = ref(db, "admin");

/*==========================================================
    SUPPORTED ASSETS
==========================================================*/

export const TRADE_ASSETS = [

    {
        symbol: "BTC",
        name: "Bitcoin",
        color: "#f7931a",
        targetROI: 0.72
    },

    {
        symbol: "ETH",
        name: "Ethereum",
        color: "#627eea",
        targetROI: 0.68
    },

    {
        symbol: "BNB",
        name: "BNB",
        color: "#f3ba2f",
        targetROI: 0.63
    },

    {
        symbol: "SOL",
        name: "Solana",
        color: "#14f195",
        targetROI: 0.70
    },

    {
        symbol: "TON",
        name: "Toncoin",
        color: "#0098ea",
        targetROI: 0.66
    },

    {
        symbol: "XRP",
        name: "Ripple",
        color: "#00aae4",
        targetROI: 0.58
    },

    {
        symbol: "DOGE",
        name: "Dogecoin",
        color: "#c2a633",
        targetROI: 0.55
    },

    {
        symbol: "ADA",
        name: "Cardano",
        color: "#2a6df4",
        targetROI: 0.61
    },

    {
        symbol: "TRX",
        name: "Tron",
        color: "#ff002e",
        targetROI: 0.54
    },

    {
        symbol: "LTC",
        name: "Litecoin",
        color: "#345d9d",
        targetROI: 0.59
    }

];

/*==========================================================
    TRADING SETTINGS
==========================================================*/

export const TRADE_DURATION =
    14 * 24 * 60 * 60 * 1000;

export const UPDATE_INTERVAL =
    60000;

export const GRAPH_REFRESH =
    3000;

export const STATUS_REFRESH =
    5000;

export const NOTIFICATION_REFRESH =
    10000;

export const DASHBOARD_REFRESH =
    1500;
// firebase.js
// Part 2

/*==========================================================
    USER HELPERS
==========================================================*/

export function userRef(uid) {
    return ref(db, `users/${uid}`);
}

export function walletRef(uid) {
    return ref(db, `wallets/${uid}`);
}

export function tradeRef(uid) {
    return ref(db, `trades/${uid}`);
}

export function notificationRef(uid) {
    return ref(db, `notifications/${uid}`);
}

export function depositRef(uid) {
    return ref(db, `deposits/${uid}`);
}

export function withdrawalRef(uid) {
    return ref(db, `withdrawals/${uid}`);
}

/*==========================================================
    SAVE USER
==========================================================*/

export async function saveUser(uid, data) {

    await set(
        userRef(uid),
        data
    );

}

/*==========================================================
    UPDATE USER
==========================================================*/

export async function updateUser(uid, data) {

    await update(
        userRef(uid),
        data
    );

}

/*==========================================================
    CREATE WALLET
==========================================================*/

export async function createWallet(uid) {

    await set(walletRef(uid), {

        balance: 0,

        demoBalance: 0,

        totalProfit: 0,

        totalDeposit: 0,

        totalWithdrawal: 0,

        activeTrade: false,

        createdAt: Date.now()

    });

}

/*==========================================================
    START TRADE
==========================================================*/

export async function createTrade(

    uid,
    asset,
    deposit

) {

    const assetInfo =
        TRADE_ASSETS.find(
            a => a.symbol === asset
        );

    const startTime =
        Date.now();

    const finishTime =
        startTime +
        TRADE_DURATION;

    const targetBalance =
        Number(
            (
                deposit +
                (deposit * assetInfo.targetROI)
            ).toFixed(2)
        );

    await set(tradeRef(uid), {

        asset,

        deposit,

        targetBalance,

        currentBalance: deposit,

        profit: 0,

        roi: assetInfo.targetROI,

        status: "active",

        startedAt: startTime,

        finishAt: finishTime,

        lastUpdate: startTime,

        progress: 0,

        completed: false,

        message:
            "AI Engine Started",

        createdAt:
            serverTimestamp()

    });

    await update(walletRef(uid), {

        activeTrade: true,

        totalDeposit:
            increment(deposit)

    });

}

/*==========================================================
    COMPLETE TRADE
==========================================================*/

export async function completeTrade(
    uid,
    finalBalance
) {

    await update(
        tradeRef(uid),
        {

            status: "completed",

            completed: true,

            progress: 100,

            currentBalance:
                finalBalance,

            lastUpdate:
                Date.now(),

            message:
                "Trading Completed"

        }
    );

    await update(
        walletRef(uid),
        {

            activeTrade: false,

            demoBalance:
                increment(finalBalance),

            totalProfit:
                increment(finalBalance)

        }
    );

}

/*==========================================================
    NOTIFICATIONS
==========================================================*/

export async function addNotification(

    uid,
    title,
    body

) {

    const id = push(
        notificationRef(uid)
    );

    await set(id, {

        title,

        body,

        read: false,

        createdAt:
            serverTimestamp()

    });

}
// firebase.js
// Part 3 (Complete)

/*==========================================================
    REAL-TIME LISTENERS
==========================================================*/

export function listenUser(uid, callback) {

    return onValue(
        userRef(uid),
        snapshot => {

            callback(
                snapshot.exists()
                    ? snapshot.val()
                    : null
            );

        }
    );

}

export function listenWallet(uid, callback) {

    return onValue(
        walletRef(uid),
        snapshot => {

            callback(
                snapshot.exists()
                    ? snapshot.val()
                    : null
            );

        }
    );

}

export function listenTrade(uid, callback) {

    return onValue(
        tradeRef(uid),
        snapshot => {

            callback(
                snapshot.exists()
                    ? snapshot.val()
                    : null
            );

        }
    );

}

export function listenNotifications(uid, callback) {

    return onValue(
        notificationRef(uid),
        snapshot => {

            callback(
                snapshot.exists()
                    ? snapshot.val()
                    : {}
            );

        }
    );

}

/*==========================================================
    READ DATA
==========================================================*/

export async function readUser(uid) {

    const snap = await get(userRef(uid));

    return snap.exists()
        ? snap.val()
        : null;

}

export async function readWallet(uid) {

    const snap = await get(walletRef(uid));

    return snap.exists()
        ? snap.val()
        : null;

}

export async function readTrade(uid) {

    const snap = await get(tradeRef(uid));

    return snap.exists()
        ? snap.val()
        : null;

}

/*==========================================================
    REMOVE DATA
==========================================================*/

export async function deleteTrade(uid) {

    await remove(
        tradeRef(uid)
    );

}

export async function deleteNotification(uid, id) {

    await remove(
        ref(
            db,
            `notifications/${uid}/${id}`
        )
    );

}

/*==========================================================
    AUTH LISTENER
==========================================================*/

export function requireLogin(success) {

    onAuthStateChanged(

        auth,

        user => {

            if (!user) {

                location.href =
                    "login.html";

                return;

            }

            success(user);

        }

    );

}

/*==========================================================
    LOGOUT
==========================================================*/

export async function logout() {

    await signOut(auth);

    location.href =
        "login.html";

}

/*==========================================================
    MARKET STATUS
==========================================================*/

export const MARKET_STATUS = [

    "Connecting to Global Market...",
    "Scanning BTC Trend...",
    "Analyzing ETH Momentum...",
    "Detecting Smart Entry...",
    "AI Engine Executing Orders...",
    "Monitoring Liquidity...",
    "Buying Opportunity Found...",
    "Profit Secured...",
    "Managing Portfolio...",
    "Watching Volatility...",
    "Optimizing Risk...",
    "Trade Running Smoothly...",
    "Updating Portfolio...",
    "Monitoring Blockchain...",
    "Trade Confirmed...",
    "Generating Profit..."

];

/*==========================================================
    DASHBOARD CARDS
==========================================================*/

export const DASHBOARD_CARDS = [

    "Current Balance",
    "Today's Profit",
    "Open Position",
    "Portfolio Value",
    "Trade Progress",
    "Profit %",
    "AI Confidence",
    "Market Trend"

];

/*==========================================================
    DEFAULT USER PROFILE
==========================================================*/

export const DEFAULT_PROFILE = {

    firstName: "",

    lastName: "",

    email: "",

    phone: "",

    country: "",

    photo: "",

    verified: false,

    createdAt: Date.now()

};

/*==========================================================
    EXPORTS
==========================================================*/

export {

    set,
    get,
    update,
    push,
    remove,
    ref,
    onValue,
    off,
    serverTimestamp,
    increment

};

/*======================
    END OF firebase.js
=======================*/

