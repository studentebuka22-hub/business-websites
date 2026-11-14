// main.js
// Part 1

import {
    auth,
    db,
    onAuthStateChanged,
    ref,
    onValue,
    get,
    set,
    update,
    push,
    remove,
    increment,
    TRADE_ASSETS
} from "./firebase.js";

import {
    loadUser,
    saveProfile,
    changePassword,
    changeEmail,
    logout
} from "./auth.js";

import {
    startTrade,
    listenTrade,
    calculateTrade,
    getRemainingTime,
    money,
    percent
} from "./trade-engine.js";

import {
    MARKET,
    startMarketTicker
} from "./charts.js";

/*==========================================================
    UTILITIES
==========================================================*/

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

function currentPage() {
    return location.pathname.split("/").pop() || "index.html";
}

function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
}

function setHTML(id, value) {
    const el = document.getElementById(id);
    if (el) el.innerHTML = value;
}

function safeNumber(value, fallback = 0) {
    const n = Number(value);
    return Number.isFinite(n) ? n : fallback;
}

function formatDate(value) {
    if (!value) return "-";
    const date = new Date(value);
    return date.toLocaleString();
}

function flattenTree(root) {
    const out = [];
    if (!root || typeof root !== "object") return out;

    for (const [uid, branch] of Object.entries(root)) {
        if (!branch || typeof branch !== "object") continue;
        for (const [id, row] of Object.entries(branch)) {
            out.push({ uid, id, ...(row || {}) });
        }
    }

    return out;
}

function shortName(profile, fallback = "Trader") {
    if (!profile) return fallback;
    const name = `${profile.firstName || ""} ${profile.lastName || ""}`.trim();
    return name || fallback;
}

function currentUserId() {
    return auth.currentUser ? auth.currentUser.uid : null;
}

/*==========================================================
    PARTICLES
==========================================================*/

function initParticles() {
    const canvas = document.getElementById("particleCanvas");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const particles = [];
    const count = 48;

    const resize = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    };

    class Particle {
        constructor() {
            this.reset(true);
        }

        reset(initial = false) {
            this.x = Math.random() * canvas.width;
            this.y = initial ? Math.random() * canvas.height : canvas.height + Math.random() * 40;
            this.size = 1 + Math.random() * 2.5;
            this.speedY = 0.4 + Math.random() * 1.6;
            this.speedX = -0.35 + Math.random() * 0.7;
            this.alpha = 0.15 + Math.random() * 0.35;
        }

        update() {
            this.y -= this.speedY;
            this.x += this.speedX;

            if (this.y < -20) this.reset();
            if (this.x < -20) this.x = canvas.width + 20;
            if (this.x > canvas.width + 20) this.x = -20;
        }

        draw() {
            ctx.beginPath();
            ctx.fillStyle = `rgba(255,255,255,${this.alpha})`;
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    const create = () => {
        particles.length = 0;
        for (let i = 0; i < count; i++) particles.push(new Particle());
    };

    const animate = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => {
            p.update();
            p.draw();
        });
        requestAnimationFrame(animate);
    };

    resize();
    create();
    animate();

    window.addEventListener("resize", () => {
        resize();
        create();
    });
}

/*==========================================================
    MARKET FOOTER / GLOBAL PRICES
==========================================================*/

function syncFooterPrices() {
    const footerMap = {
        BTC: "footer-btc",
        ETH: "footer-eth",
        TON: "footer-ton",
        SOL: "footer-sol",
        BNB: "footer-bnb",
        XRP: "footer-xrp",
        ADA: "footer-ada",
        DOGE: "footer-doge",
        TRX: "footer-trx",
        LTC: "footer-ltc"
    };

    for (const [symbol, id] of Object.entries(footerMap)) {
        const el = document.getElementById(id);
        if (el && MARKET[symbol] !== undefined) {
            el.textContent = `$${Number(MARKET[symbol]).toLocaleString()}`;
        }
    }
}

function startFooterSync() {
    syncFooterPrices();
    setInterval(syncFooterPrices, 1500);
}

function startTickerIfNeeded() {
    const chartExists = !!document.getElementById("tradingChart");
    if (!chartExists) {
        startMarketTicker();
    }
    startFooterSync();
}

/*==========================================================
    DASHBOARD / TRADE UI
==========================================================*/

function updateTradePanels(trade) {
    if (!trade) return;

    const calc = calculateTrade(trade);
    const profitPct = trade.deposit > 0 ? (calc.profit / trade.deposit) * 100 : 0;
    const remaining = getRemainingTime(trade.finishAt);

    const progressEl = document.getElementById("tradeProgress");
    if (progressEl) {
        progressEl.style.width = `${calc.progress}%`;
        progressEl.textContent = `${calc.progress.toFixed(1)}%`;
    }

    setText("portfolioValue", money(calc.balance));
    setText("currentBalance", money(calc.balance));
    setText("currentProfit", money(calc.profit));
    setText("roiPercent", percent(profitPct));
    setText("currentAsset", trade.asset || "BTC");
    setText("tradeStatus", trade.completed ? "COMPLETED" : "ACTIVE");
    setText("initialDeposit", money(trade.deposit || 0));
    setText("targetBalance", money(trade.targetBalance || 0));
    setText("expectedProfit", money((trade.targetBalance || 0) - (trade.deposit || 0)));
    setText("marketStatus", trade.message || "AI Engine Active");
    setText("countdown", `${remaining.days}d ${remaining.hours}h ${remaining.minutes}m ${remaining.seconds}s`);

    const walletStatus = document.getElementById("walletStatus");
    if (walletStatus) {
        walletStatus.textContent = trade.completed
            ? "Trading completed successfully."
            : "Trading active and updating in real time.";
    }

    const statusBadge = document.getElementById("tradeStatus");
    if (statusBadge) {
        statusBadge.textContent = trade.completed ? "COMPLETED" : "ACTIVE";
    }
}

function bindTradeListener() {
    listenTrade(trade => {
        updateTradePanels(trade);
    });
}

/*==========================================================
    PROFILE
==========================================================*/

async function bindProfilePage(user, profile) {
    const form = document.getElementById("profileForm");
    if (!form) return;

    const firstName = document.getElementById("firstName");
    const lastName = document.getElementById("lastName");
    const phone = document.getElementById("phone");
    const country = document.getElementById("country");

    if (firstName) firstName.value = profile?.firstName || "";
    if (lastName) lastName.value = profile?.lastName || "";
    if (phone) phone.value = profile?.phone || "";
    if (country) country.value = profile?.country || "";

    const profileName = document.getElementById("profileName");
    if (profileName) profileName.textContent = shortName(profile, "Trader");

    const profileEmail = document.getElementById("profileEmail");
    if (profileEmail) profileEmail.textContent = profile?.email || user.email || "";

    const profilePhoto = document.getElementById("profilePhoto");
    if (profilePhoto && profile?.photo) profilePhoto.src = profile.photo;

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        await saveProfile({
            firstName: firstName?.value.trim() || "",
            lastName: lastName?.value.trim() || "",
            phone: phone?.value.trim() || "",
            country: country?.value.trim() || ""
        });
        alert("Profile saved.");
    });
}

/*==========================================================
    SETTINGS
==========================================================*/

function bindSettingsPage() {
    const passwordForm = document.getElementById("passwordForm");
    if (passwordForm) {
        passwordForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const currentPassword = document.getElementById("currentPassword")?.value || "";
            const newPassword = document.getElementById("newPassword")?.value || "";
            const confirmPassword = document.getElementById("confirmPassword")?.value || "";

            if (newPassword !== confirmPassword) {
                alert("Passwords do not match.");
                return;
            }

            try {
                await changePassword(currentPassword, newPassword);
                passwordForm.reset();
                alert("Password changed.");
            } catch (error) {
                alert(error.message);
            }
        });
    }

    const emailForm = document.getElementById("emailForm");
    if (emailForm) {
        emailForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const newEmail = document.getElementById("newEmail")?.value.trim() || "";
            if (!newEmail) return;

            const currentPassword = prompt("Enter your current password to update email:");
            if (!currentPassword) return;

            try {
                await changeEmail(currentPassword, newEmail);
                emailForm.reset();
                alert("Email update requested.");
            } catch (error) {
                alert(error.message);
            }
        });
    }
}

/*==========================================================
    DEPOSIT PAGE
==========================================================*/

async function bindDepositPage(user, profile) {
    const form = document.getElementById("depositForm");
    if (!form) return;

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const asset = document.getElementById("asset")?.value || "BTC";
        const amount = safeNumber(document.getElementById("deposit")?.value, 0);

        if (amount < 100) {
            alert("Minimum demo deposit is $100.");
            return;
        }

        const assetInfo = TRADE_ASSETS.find(a => a.symbol === asset) || TRADE_ASSETS[0];
        const expectedProfit = Number((amount * assetInfo.targetROI).toFixed(2));

        const depositId = push(ref(db, `deposits/${user.uid}`));
        await set(depositId, {
            uid: user.uid,
            name: shortName(profile, user.displayName || "Trader"),
            email: profile?.email || user.email || "",
            asset,
            amount,
            expectedProfit,
            durationDays: 14,
            type: "demo-deposit",
            status: "completed",
            createdAt: Date.now()
        });

        const status = document.getElementById("marketStatus");
        if (status) status.textContent = "Starting demo trading...";

        await startTrade(asset, amount);

        location.href = "trade.html";
    });
}

/*==========================================================
    WALLET PAGE
==========================================================*/

function renderWalletTransactions(uid) {
    const tbody = document.getElementById("walletTransactions");
    if (!tbody) return;

    const depositsRef = ref(db, `deposits/${uid}`);
    const withdrawalsRef = ref(db, `withdrawals/${uid}`);

    const render = async () => {
        const [depositsSnap, withdrawalsSnap] = await Promise.all([get(depositsRef), get(withdrawalsRef)]);
        const rows = [];

        const deposits = depositsSnap.exists() ? depositsSnap.val() : {};
        const withdrawals = withdrawalsSnap.exists() ? withdrawalsSnap.val() : {};

        for (const [id, row] of Object.entries(deposits)) {
            rows.push({
                id,
                type: "Deposit",
                asset: row.asset || "BTC",
                amount: row.amount || 0,
                status: row.status || "completed",
                createdAt: row.createdAt || 0
            });
        }

        for (const [id, row] of Object.entries(withdrawals)) {
            rows.push({
                id,
                type: "Withdrawal",
                asset: row.asset || "BTC",
                amount: row.amount || 0,
                status: row.status || "pending",
                createdAt: row.createdAt || 0
            });
        }

        rows.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

        if (!rows.length) {
            tbody.innerHTML = `<tr><td colspan="5">No transactions available.</td></tr>`;
            return;
        }

        tbody.innerHTML = rows.slice(0, 20).map(row => `
            <tr>
                <td>${formatDate(row.createdAt)}</td>
                <td>${row.type}</td>
                <td>${row.asset}</td>
                <td>${money(row.amount)}</td>
                <td>${row.status}</td>
            </tr>
        `).join("");
    };

    render();
}

async function bindWalletPage(user) {
    const balanceEl = document.getElementById("walletBalance");
    const tradeStatusEl = document.getElementById("walletTradeStatus");
    const profitEl = document.getElementById("walletProfit");
    const completedEl = document.getElementById("completedTrades");

    onValue(ref(db, `wallets/${user.uid}`), (snap) => {
        const wallet = snap.exists() ? snap.val() : null;
        if (!wallet) return;

        if (balanceEl) balanceEl.textContent = money(wallet.demoBalance || 0);
        if (profitEl) profitEl.textContent = money(wallet.totalProfit || 0);
        if (tradeStatusEl) tradeStatusEl.textContent = wallet.activeTrade ? "ACTIVE" : "NONE";
    });

    onValue(ref(db, `tradeHistory/${user.uid}`), (snap) => {
        const history = snap.exists() ? snap.val() : {};
        const items = Object.values(history);
        if (completedEl) completedEl.textContent = String(items.length);
    });

    renderWalletTransactions(user.uid);

    const withdrawBtn = document.getElementById("withdrawDemoBtn");
    if (withdrawBtn) {
        withdrawBtn.onclick = async () => {
            const [walletSnap, tradeSnap] = await Promise.all([
                get(ref(db, `wallets/${user.uid}`)),
                get(ref(db, `trades/${user.uid}`))
            ]);

            const wallet = walletSnap.exists() ? walletSnap.val() : null;
            const trade = tradeSnap.exists() ? tradeSnap.val() : null;

            const balance = safeNumber(wallet?.demoBalance, 0);
            if (!trade || !trade.completed) {
                alert("Trading must complete before withdrawal.");
                return;
            }

            if (balance <= 0) {
                alert("No demo balance available.");
                return;
            }

            const withdrawalId = push(ref(db, `withdrawals/${user.uid}`));
            await set(withdrawalId, {
                uid: user.uid,
                name: user.displayName || "Trader",
                asset: trade.asset || "BTC",
                amount: balance,
                wallet: "Demo Wallet",
                status: "approved",
                createdAt: Date.now()
            });

            await update(ref(db, `wallets/${user.uid}`), {
                demoBalance: 0,
                totalWithdrawal: increment(balance)
            });

            alert("Demo balance withdrawn.");
        };
    }

    const reinvestBtn = document.getElementById("reinvestBtn");
    if (reinvestBtn) {
        reinvestBtn.onclick = async () => {
            const [walletSnap, tradeSnap] = await Promise.all([
                get(ref(db, `wallets/${user.uid}`)),
                get(ref(db, `trades/${user.uid}`))
            ]);

            const wallet = walletSnap.exists() ? walletSnap.val() : null;
            const trade = tradeSnap.exists() ? tradeSnap.val() : null;
            const amount = safeNumber(wallet?.demoBalance, 0);

            if (amount <= 0) {
                alert("No demo balance available.");
                return;
            }

            if (wallet?.activeTrade) {
                alert("A trade is already active.");
                return;
            }

            const asset = trade?.asset || "BTC";

            await update(ref(db, `wallets/${user.uid}`), {
                demoBalance: 0
            });

            const depositId = push(ref(db, `deposits/${user.uid}`));
            await set(depositId, {
                uid: user.uid,
                name: user.displayName || "Trader",
                email: user.email || "",
                asset,
                amount,
                expectedProfit: 0,
                durationDays: 14,
                type: "reinvest",
                status: "completed",
                createdAt: Date.now()
            });

            await startTrade(asset, amount);
            location.href = "trade.html";
        };
    }
}

/*==========================================================
    HISTORY PAGE
==========================================================*/

function bindHistoryPage(user) {
    const tbody = document.getElementById("historyTable");
    if (!tbody) return;

    onValue(ref(db, `tradeHistory/${user.uid}`), (snap) => {
        const history = snap.exists() ? snap.val() : {};
        const items = Object.values(history).sort((a, b) => (b.completedAt || 0) - (a.completedAt || 0));

        setText("historyTotalTrades", String(items.length));

        const depositsTotal = items.reduce((sum, row) => sum + safeNumber(row.deposit, 0), 0);
        const profitTotal = items.reduce((sum, row) => sum + safeNumber(row.profit, 0), 0);

        setText("historyDeposits", money(depositsTotal));
        setText("historyProfit", money(profitTotal));
        setText("historySuccess", items.length ? "100%" : "100%");

        if (!items.length) {
            tbody.innerHTML = `<tr><td colspan="6">No completed trades yet.</td></tr>`;
            return;
        }

        tbody.innerHTML = items.map(row => `
            <tr>
                <td>${formatDate(row.completedAt || row.startedAt)}</td>
                <td>${row.asset || "BTC"}</td>
                <td>${money(row.deposit || 0)}</td>
                <td>${money(row.profit || 0)}</td>
                <td>${money(row.finalBalance || 0)}</td>
                <td>${row.status || "COMPLETED"}</td>
            </tr>
        `).join("");
    });
}

/*==========================================================
    DASHBOARD PAGE
==========================================================*/

function bindDashboardPage(user, profile) {
    const userName = document.getElementById("userName");
    if (userName) userName.textContent = shortName(profile, user.displayName || "Trader");

    listenTrade(trade => {
        if (!trade) return;
        updateTradePanels(trade);
    });

    onValue(ref(db, `wallets/${user.uid}`), (snap) => {
        const wallet = snap.exists() ? snap.val() : null;
        if (!wallet) return;

        setText("portfolioValue", money(wallet.demoBalance || 0));
    });

    const activityFeed = document.getElementById("activityFeed");
    if (activityFeed) {
        let index = 0;
        const messages = [
            "Scanning cryptocurrency market...",
            "Analyzing volatility...",
            "Searching for opportunities...",
            "Optimizing demo portfolio...",
            "Executing AI trading strategy...",
            "Monitoring liquidity...",
      

