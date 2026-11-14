import { db } from "./firebase-config.js";
import { ref, push, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-database.js";

const form = document.getElementById("contact-form");
const msgBox = document.getElementById("contact-form-msg");
const submitBtn = document.getElementById("contact-submit");

form?.addEventListener("submit", async (e) => {
  e.preventDefault();
  msgBox.className = "form-msg";
  submitBtn.disabled = true;
  submitBtn.textContent = "Sending...";

  const data = {
    name: form.name.value.trim(),
    phone: form.phone.value.trim(),
    email: form.email.value.trim(),
    message: form.message.value.trim(),
    status: "new",
    createdAt: serverTimestamp()
  };

  try {
    await push(ref(db, "messages"), data);
    msgBox.textContent = "Message sent. We'll get back to you shortly.";
    msgBox.className = "form-msg ok";
    form.reset();
  } catch (err) {
    console.error(err);
    msgBox.textContent = "Something went wrong. Please try again or reach us on WhatsApp.";
    msgBox.className = "form-msg err";
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Send Message";
  }
});
