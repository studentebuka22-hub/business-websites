import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";

import { getDatabase } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyCNQbqTQvKwrtpbGXHgu56hbAVaKgIQ7nc",
    authDomain: "mathcloud-72a42.firebaseapp.com",
    projectId: "mathcloud-72a42",
    storageBucket: "mathcloud-72a42.firebasestorage.app",
    messagingSenderId: "123322117435",
    appId: "1:123322117435:web:ff3d2ac5c9dedc1a439b1e"
  };

const app=initializeApp(firebaseConfig);

export const db=getDatabase(app);