import { db } from "./firebase-config.js";
import { ref, push, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-database.js";

const WHATSAPP_NUMBER = "2348000000000"; // TODO: replace with the school's real WhatsApp number, country code first, no +, no spaces

const form = document.getElementById("admission-form");
const msgBox = document.getElementById("admission-form-msg");
const submitBtn = document.getElementById("admission-submit");

form?.addEventListener("submit", async (e) => {
  e.preventDefault();
  msgBox.className = "form-msg";
  submitBtn.disabled = true;
  submitBtn.textContent = "Sending...";

  const data = {
    parentName: form.parentName.value.trim(),
    childName: form.childName.value.trim(),
    classApplying: form.classApplying.value,
    childAge: form.childAge.value.trim(),
    phone: form.phone.value.trim(),
    email: form.email.value.trim(),
    message: form.message.value.trim(),
    status: "new",
    createdAt: serverTimestamp()
  };

  try {
    await push(ref(db, "inquiries"), data);

    msgBox.textContent = "Thank you! Your inquiry has been received. Our admissions team will contact you within 24 hours.";
    msgBox.className = "form-msg ok";
    form.reset();

    // Optional: hand off to WhatsApp so the school also sees it instantly
    const waText = encodeURIComponent(
      `New Admission Inquiry\nParent: ${data.parentName}\nChild: ${data.childName}\nClass: ${data.classApplying}\nAge: ${data.childAge}\nPhone: ${data.phone}\nEmail: ${data.email}\nMessage: ${data.message}`
    );
    const waLink = document.getElementById("admission-whatsapp-followup");
    if (waLink) {
      waLink.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${waText}`;
      waLink.style.display = "inline-flex";
    }
  } catch (err) {
    console.error(err);
    msgBox.textContent = "Something went wrong sending your inquiry. Please try again, or WhatsApp us directly using the button below.";
    msgBox.className = "form-msg err";
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Submit Inquiry";
  }
});
