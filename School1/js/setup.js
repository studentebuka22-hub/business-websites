import { auth, db } from "./firebase-config.js";
import {
  createUserWithEmailAndPassword,
  updateProfile
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import {
  ref, set, get
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-database.js";

const form = document.getElementById("setup-form");
const msgBox = document.getElementById("setup-msg");
const submitBtn = document.getElementById("setup-submit");
const successBox = document.getElementById("setup-success");

form?.addEventListener("submit", async (e) => {
  e.preventDefault();
  msgBox.className = "form-msg";
  submitBtn.disabled = true;
  submitBtn.textContent = "Creating account...";

  const name = form.name.value.trim();
  const email = form.email.value.trim();
  const password = form.password.value;
  const confirm = form.confirmPassword.value;

  if (password !== confirm) {
    msgBox.textContent = "Passwords do not match.";
    msgBox.className = "form-msg err";
    submitBtn.disabled = false;
    submitBtn.textContent = "Create Admin Account";
    return;
  }
  if (password.length < 8) {
    msgBox.textContent = "Password should be at least 8 characters.";
    msgBox.className = "form-msg err";
    submitBtn.disabled = false;
    submitBtn.textContent = "Create Admin Account";
    return;
  }

  try {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(cred.user, { displayName: name });

    // Save a profile record under /admins/{uid} — readable only by signed-in admins per database.rules.json
    await set(ref(db, `admins/${cred.user.uid}`), {
      name,
      email,
      createdAt: Date.now()
    });

    form.style.display = "none";
    successBox.style.display = "block";
    successBox.querySelector("[data-name]").textContent = name;
    successBox.querySelector("[data-email]").textContent = email;
  } catch (err) {
    console.error(err);
    let text = "Something went wrong creating the account. Please try again.";
    if (err.code === "auth/email-already-in-use") text = "That email is already registered. Go to admin.html to sign in instead.";
    if (err.code === "auth/weak-password") text = "That password is too weak. Use at least 8 characters.";
    if (err.code === "auth/invalid-email") text = "That email address doesn't look valid.";
    msgBox.textContent = text;
    msgBox.className = "form-msg err";
    submitBtn.disabled = false;
    submitBtn.textContent = "Create Admin Account";
  }
});
