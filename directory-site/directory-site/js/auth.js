// =============================================================================
// auth.js
// Wraps Firebase Authentication (compat SDK) for login, logout, and guarding
// admin.html. Exposed on the global `Auth` object.
// =============================================================================

var Auth = (function () {

  /** Attempts to sign in with email/password. Returns a Promise<User>. */
  function login(email, password) {
    return auth.signInWithEmailAndPassword(email, password)
      .then(function (cred) { return cred.user; })
      .catch(function (err) { throw new Error(friendlyAuthError(err.code)); });
  }

  /** Signs the current admin out and sends them back to the login screen. */
  function logout() {
    return auth.signOut().then(function () {
      window.location.href = "login.html";
    });
  }

  /**
   * Guards admin.html: resolves with the signed-in user once Firebase
   * confirms auth state, or redirects to login.html if not authenticated.
   */
  function requireAdmin() {
    return new Promise(function (resolve) {
      auth.onAuthStateChanged(function (user) {
        if (user) {
          resolve(user);
        } else {
          window.location.href = "login.html";
        }
      });
    });
  }

  /** On login.html: if already signed in, skip straight to admin.html. */
  function redirectIfAlreadyAuthed() {
    auth.onAuthStateChanged(function (user) {
      if (user) window.location.href = "admin.html";
    });
  }

  function friendlyAuthError(code) {
    var map = {
      "auth/invalid-email": "That email address doesn't look right.",
      "auth/user-disabled": "This account has been disabled.",
      "auth/user-not-found": "No admin account matches that email.",
      "auth/wrong-password": "Incorrect password. Please try again.",
      "auth/invalid-credential": "Incorrect email or password.",
      "auth/too-many-requests": "Too many attempts. Please wait a moment and try again."
    };
    return map[code] || "Sign in failed. Please check your details and try again.";
  }

  return {
    login: login,
    logout: logout,
    requireAdmin: requireAdmin,
    redirectIfAlreadyAuthed: redirectIfAlreadyAuthed
  };
})();
