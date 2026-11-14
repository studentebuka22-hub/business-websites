// auth.js
// Part 1

import {
    auth,
    db,
    saveUser,
    createWallet,
    DEFAULT_PROFILE
} from "./firebase.js";

import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    sendPasswordResetEmail,
    updateProfile,
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";
import {
    ref,
    get,
    set,
    update,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-database.js";

/*==========================================================
DOM
==========================================================*/

const registerForm = document.getElementById("registerForm");
const loginForm = document.getElementById("loginForm");
const forgotForm = document.getElementById("forgotForm");

/*==========================================================
REGISTER
==========================================================*/

if (registerForm) {

    registerForm.addEventListener("submit", async (e) => {

        e.preventDefault();

        const btn = registerForm.querySelector('button[type="submit"]');

        btn.disabled = true;
        btn.textContent = "Creating Account...";

        try {

            const firstName = registerForm.firstName.value.trim();
            const lastName = registerForm.lastName.value.trim();
            const email = registerForm.email.value.trim().toLowerCase();
            const password = registerForm.password.value;
            const phone = registerForm.phone ? registerForm.phone.value.trim() : "";
            const country = registerForm.country ? registerForm.country.value.trim() : "";

            if (!firstName || !lastName || !email || !password) {
                throw new Error("Please complete all required fields.");
            }

            const credential = await createUserWithEmailAndPassword(
                auth,
                email,
                password
            );

            const user = credential.user;

            await updateProfile(user, {
                displayName: firstName + " " + lastName
            });

            await saveUser(user.uid, {
                ...DEFAULT_PROFILE,
                firstName,
                lastName,
                email,
                phone,
                country,
                role: "user",
                status: "active",
                online: true,
                verified: false,
                createdAt: Date.now(),
                lastLogin: Date.now(),
                lastActivity: Date.now()
            });

            await createWallet(user.uid);

            alert(
                "Your account has been created successfully.\n\nYou are now being redirected to your dashboard."
            );

            location.replace("dashboard.html");

        } catch (error) {

            let message = "";

            switch (error.code) {

                case "auth/email-already-in-use":
                    message = "An account with this email address already exists.";
                    break;

                case "auth/invalid-email":
                    message = "Please enter a valid email address.";
                    break;

                case "auth/weak-password":
                    message = "Your password is too weak. Use at least 6 characters.";
                    break;

                default:
                    message = error.message;
            }

            alert(message);

            btn.disabled = false;
            btn.textContent = "CREATE ACCOUNT";

        }

    });

}

/*==========================================================
LOGIN
==========================================================*/

if (loginForm) {

    loginForm.addEventListener("submit", async (e) => {

        e.preventDefault();

        const submitButton = loginForm.querySelector('button[type="submit"]');

        submitButton.disabled = true;
        submitButton.textContent = "Signing In...";

        const email = loginForm.email.value.trim().toLowerCase();
        const password = loginForm.password.value;

        try {

            const credential = await signInWithEmailAndPassword(
                auth,
                email,
                password
            );

            const user = credential.user;

            const snap = await get(
                ref(db, "users/" + user.uid)
            );

            if (!snap.exists()) {

                alert(
                    "Your account was found but your profile is missing.\n\nPlease contact the administrator."
                );

                submitButton.disabled = false;
                submitButton.textContent = "LOGIN";

                return;
            }

            const profile = snap.val();

            if (profile.status === "disabled") {

                alert(
                    "Your account has been disabled.\n\nPlease contact the administrator."
                );

                submitButton.disabled = false;
                submitButton.textContent = "LOGIN";

                return;
            }

            await update(
                ref(db, "users/" + user.uid),
                {
                    online: true,
                    lastLogin: Date.now(),
                    lastActivity: Date.now()
                }
            );

            alert(
                "Login successful.\n\nWelcome back " +
                (profile.firstName || "Trader") +
                "!"
            );

            if (profile.role === "admin") {

                location.replace("admin.html");

            } else {

                location.replace("dashboard.html");

            }

        } catch (error) {

            console.error(error);

            let message = "";

            switch (error.code) {

                case "auth/invalid-credential":
                    message = "The email address or password you entered is incorrect.";
                    break;

                case "auth/user-not-found":
                    message = "No account was found with this email address.";
                    break;

                case "auth/wrong-password":
                    message = "The password you entered is incorrect.";
                    break;

                case "auth/invalid-email":
                    message = "Please enter a valid email address.";
                    break;

                case "auth/network-request-failed":
                    message = "Unable to connect to the server. Please check your internet connection.";
                    break;

                case "auth/too-many-requests":
                    message = "Too many unsuccessful login attempts. Please try again later.";
                    break;

                case "auth/user-disabled":
                    message = "Your account has been disabled.";
                    break;

                default:
                    message = error.message || "Unable to sign in.";
            }

            alert(message);

            submitButton.disabled = false;
            submitButton.textContent = "LOGIN";

        }

    });

}

/*==========================================================
PASSWORD RESET
==========================================================*/

if (forgotForm) {

    forgotForm.addEventListener("submit", async (e) => {

        e.preventDefault();

        try {

            await sendPasswordResetEmail(
                auth,
                forgotForm.email.value.trim()
            );

            alert(
                "A password reset link has been sent to your email address."
            );

        } catch (error) {

            alert(error.message);

        }

    });

}
/*==========================================================
    AUTH STATE
==========================================================*/

let authReady = false;

onAuthStateChanged(auth, async (user) => {

    // Ignore the very first callback until Firebase finishes restoring auth
    if (!authReady) {
        authReady = true;
    }

    const protectedPages = [
        "dashboard.html",
        "trade.html",
        "trade2.html",
        "wallet.html",
        "deposit.html",
        "history.html",
        "profile.html",
        "settings.html",
        "admin.html",
        "admin-users.html",
        "admin-trades.html",
        "admin-deposits.html",
        "admin-withdrawals.html",
        "admin-settings.html"
    ];

    const currentPage = location.pathname.split("/").pop();

    if (!user) {

        if (protectedPages.includes(currentPage)) {
            setTimeout(() => {
                if (!auth.currentUser) {
                    location.replace("login.html");
                }
            }, 1000);
        }

        return;
    }

    try {

        const userRef = ref(db, "users/" + user.uid);
        const walletRef = ref(db, "wallets/" + user.uid);

        const userSnap = await get(userRef);

        if (!userSnap.exists()) {

            const profile = {
                ...DEFAULT_PROFILE,
                email: user.email,
                firstName: user.displayName
                    ? user.displayName.split(" ")[0]
                    : "",
                lastName: user.displayName
                    ? user.displayName.split(" ").slice(1).join(" ")
                    : "",
                role: "user",
                status: "active",
                online: true,
                verified: user.emailVerified,
                createdAt: Date.now(),
                lastLogin: Date.now(),
                lastSeen: Date.now(),
                heartbeat: Date.now()
            };

            await saveUser(user.uid, profile);
            await createWallet(user.uid);

        } else {

            await update(userRef, {
                online: true,
                verified: user.emailVerified,
                lastLogin: Date.now(),
                lastSeen: Date.now(),
                heartbeat: Date.now()
            });

            const walletSnap = await get(walletRef);

            if (!walletSnap.exists()) {
                await createWallet(user.uid);
            }

        }

    } catch (err) {
        console.error(err);
    }

});

/*==========================================================
    LOAD USER PROFILE
==========================================================*/

export async function loadUser(uid) {

    const snap =
        await get(
            ref(db, "users/" + uid)
        );

    if (!snap.exists())
        return null;

    return snap.val();

}

/*==========================================================
    REALTIME USER
==========================================================*/

export function listenUser(uid, callback) {

    return onValue(

        ref(db, "users/" + uid),

        snapshot => {

            if (snapshot.exists()) {

                callback(snapshot.val());

            }

        }

    );

}

/*==========================================================
    UPDATE PROFILE
==========================================================*/

export async function saveProfile(data) {

    const user = auth.currentUser;

    if (!user) return;

    await updateProfile(user, {

        displayName:
            `${data.firstName} ${data.lastName}`.trim()

    });

    await update(

        ref(db, "users/" + user.uid),

        {

            firstName: data.firstName,

            lastName: data.lastName,

            phone: data.phone,

            country: data.country,

            updatedAt: Date.now()

        }

    );

}

/*==========================================================
    LOGOUT
==========================================================*/

export async function logout() {

    const user = auth.currentUser;

    if (user) {

        try {

            await update(

                ref(db, "users/" + user.uid),

                {

                    online: false,

                    lastSeen: Date.now(),

                    heartbeat: Date.now()

                }

            );

        } catch (e) {}

    }

    await signOut(auth);

    location.replace("login.html");

}

/*==========================================================
    LOGOUT BUTTON
==========================================================*/

const logoutButton =
    document.getElementById("logoutBtn");

if (logoutButton) {

    logoutButton.addEventListener(

        "click",

        logout

    );

}

/*==========================================================
    CURRENT USER
==========================================================*/

export function currentUser() {

    return auth.currentUser;

}
/*==========================================================
    CHANGE PASSWORD
==========================================================*/

import {
    EmailAuthProvider,
    reauthenticateWithCredential,
    updatePassword,
    verifyBeforeUpdateEmail
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

export async function changePassword(
    currentPassword,
    newPassword
) {

    const user = auth.currentUser;

    if (!user) {
        throw new Error("No user is signed in.");
    }

    const credential =
        EmailAuthProvider.credential(
            user.email,
            currentPassword
        );

    await reauthenticateWithCredential(
        user,
        credential
    );

    await updatePassword(
        user,
        newPassword
    );

    await update(
        ref(db, "users/" + user.uid),
        {
            passwordUpdatedAt: Date.now()
        }
    );

}

/*==========================================================
    CHANGE EMAIL
==========================================================*/

export async function changeEmail(
    currentPassword,
    newEmail
) {

    const user = auth.currentUser;

    if (!user) {
        throw new Error("No user is signed in.");
    }

    const credential =
        EmailAuthProvider.credential(
            user.email,
            currentPassword
        );

    await reauthenticateWithCredential(
        user,
        credential
    );

    await verifyBeforeUpdateEmail(
        user,
        newEmail
    );

    await update(
        ref(db, "users/" + user.uid),
        {
            pendingEmail: newEmail,
            emailVerificationSent: true,
            updatedAt: Date.now()
        }
    );

}

/*==========================================================
    USER STATUS
==========================================================*/

export async function setUserStatus(status) {

    const user = auth.currentUser;

    if (!user) return;

    await update(
        ref(db, "users/" + user.uid),
        {
            status,
            updatedAt: Date.now()
        }
    );

}

/*==========================================================
    HEARTBEAT
==========================================================*/

let heartbeatTimer = null;

function stopHeartbeat() {

    if (heartbeatTimer) {

        clearInterval(heartbeatTimer);
        heartbeatTimer = null;

    }

}

function startHeartbeat() {

    stopHeartbeat();

    heartbeatTimer = setInterval(async () => {

        const user = auth.currentUser;

        if (!user) {

            stopHeartbeat();
            return;

        }

        try {

            await update(
                ref(db, "users/" + user.uid),
                {
                    online: true,
                    heartbeat: Date.now(),
                    lastActivity: Date.now()
                }
            );

        } catch (error) {

            console.error("Heartbeat Error:", error);

        }

    }, 30000);

}

function watchHeartbeat() {

    onAuthStateChanged(auth, (user) => {

        if (user) {

            startHeartbeat();

        } else {

            stopHeartbeat();

        }

    });

}

watchHeartbeat();

/*==========================================================
    PAGE GUARD
==========================================================*/

export function requireAuthentication(callback) {

    onAuthStateChanged(

        auth,

        user => {

            if (!user) {

                location.replace("login.html");

                return;

            }

            callback(user);

        }

    );

}

/*==========================================================
    ADMIN CHECK
==========================================================*/

export async function isAdmin(uid = null) {

    const id = uid || auth.currentUser?.uid;

    if (!id) return false;

    const snap = await get(
        ref(db, "users/" + id)
    );

    if (!snap.exists()) {

        return false;

    }

    const profile = snap.val();

    return profile.role === "admin";

}

/*==========================================================
    END OF auth.js
==========================================================*/