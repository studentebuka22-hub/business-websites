// ============================================================
// FIREBASE SETUP — Peace Mentorary International Academy
// ------------------------------------------------------------
// 1. Go to https://console.firebase.google.com → Create a project
// 2. Add a Web App (</> icon) → copy the config it gives you
// 3. Paste those values into firebaseConfig below
// 4. In the Firebase Console enable:
//      Build → Realtime Database → Create Database (start in "locked mode")
//      Build → Authentication → Sign-in method → enable "Email/Password"
// 5. Create ONE admin user: Authentication → Users → Add user
//      (this is the login the school will use at /admin.html)
// 6. Deploy the security rules in database.rules.json (see README.md)
// ============================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-database.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyB4DMYZJHWgbRUZV-uamOy7TpxLM1sGYPY",
  authDomain: "chats-afcff.firebaseapp.com",
  databaseURL: "https://chats-afcff-default-rtdb.firebaseio.com",
  projectId: "chats-afcff",
  storageBucket: "chats-afcff.firebasestorage.app",
  messagingSenderId: "764250889947",
  appId: "1:764250889947:web:2c843497ce389edf5876fe"
};

export const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
export const auth = getAuth(app);
