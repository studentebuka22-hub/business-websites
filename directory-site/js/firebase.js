// =============================================================================
// firebase.js
// Initializes Firebase using the "compat" SDK, which works with plain
// <script> tags (no `type="module"`), so this site can be opened directly
// from disk (file://) with no local server required.
//
// This file must be loaded AFTER the firebase-*-compat.js <script> tags in
// the HTML, and BEFORE every other js/*.js file. It exposes:
//   window.auth     - Firebase Auth instance
//   window.db       - Firebase Realtime Database instance
//   window.storage  - Firebase Storage instance
// =============================================================================

// -----------------------------------------------------------------------------
// TODO: Replace the placeholders below with your own Firebase project config.
// Firebase console > Project Settings > General > Your apps > SDK setup.
// -----------------------------------------------------------------------------
const firebaseConfig = {
  apiKey: "AIzaSyB9lCqAnkZiY7t7Hgb4BkXnOwDCtF1YAfs",
  authDomain: "crypto-f2e62.firebaseapp.com",
  databaseURL: "https://crypto-f2e62-default-rtdb.firebaseio.com",
  projectId: "crypto-f2e62",
  storageBucket: "crypto-f2e62.firebasestorage.app",
  messagingSenderId: "441702224279",
  appId: "1:441702224279:web:d535bc894e04c7907db4d2",
  measurementId: "G-349YY35SNY"
};

firebase.initializeApp(firebaseConfig);

window.auth = firebase.auth();
window.db = firebase.database();
window.storage = firebase.storage();
