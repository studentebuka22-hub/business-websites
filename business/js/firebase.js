// ==========================================
// FIREBASE CONFIGURATION
// Replace with your Firebase project details
// ==========================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";

import {
getAuth
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";

import {
getDatabase,
ref,
push,
set,
get,
update,
remove,
onValue
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-database.js";

import {
getStorage,
ref as storageRef,
uploadBytes,
getDownloadURL,
deleteObject
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-storage.js";

const firebaseConfig = {

apiKey: "YOUR_API_KEY",

authDomain: "YOUR_PROJECT.firebaseapp.com",

databaseURL: "https://YOUR_PROJECT-default-rtdb.firebaseio.com",

projectId: "YOUR_PROJECT",

storageBucket: "YOUR_PROJECT.appspot.com",

messagingSenderId: "YOUR_SENDER_ID",

appId: "YOUR_APP_ID"

};

// Initialize Firebase

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const db = getDatabase(app);

const storage = getStorage(app);

// ==========================================
// EXPORTS
// ==========================================

export {

app,

auth,

db,

storage,

ref,

push,

set,

get,

update,

remove,

onValue,

storageRef,

uploadBytes,

getDownloadURL,

deleteObject

};

