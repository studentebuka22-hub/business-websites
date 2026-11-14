import { auth, db } from "./firebase-config.js";
import {
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import {
  ref, onValue, update, off
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-database.js";

const loginBox = document.getElementById("login-box");
const dashboard = document.getElementById("dashboard");
const loginForm = document.getElementById("login-form");
const loginMsg = document.getElementById("login-msg");
const logoutBtn = document.getElementById("logout-btn");
const adminEmailLabel = document.getElementById("admin-email");

const inquiriesBody = document.getElementById("inquiries-body");
const messagesBody = document.getElementById("messages-body");
const inquiriesCount = document.getElementById("inquiries-count");
const messagesCount = document.getElementById("messages-count");

const tabs = document.querySelectorAll(".tab-btn");
const panels = document.querySelectorAll(".tab-panel");

tabs.forEach(tab => {
  tab.addEventListener("click", () => {
    tabs.forEach(t => t.classList.remove("active"));
    panels.forEach(p => p.style.display = "none");
    tab.classList.add("active");
    document.getElementById(tab.dataset.target).style.display = "block";
  });
});

loginForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  loginMsg.className = "form-msg";
  try {
    await signInWithEmailAndPassword(auth, loginForm.email.value.trim(), loginForm.password.value);
  } catch (err) {
    loginMsg.textContent = "Login failed. Check the email and password and try again.";
    loginMsg.className = "form-msg err";
  }
});

logoutBtn?.addEventListener("click", () => signOut(auth));

function fmtDate(ts) {
  if (!ts) return "—";
  const d = new Date(ts);
  return d.toLocaleString("en-NG", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function statusOptions(current) {
  const opts = ["new", "contacted", "enrolled", "closed"];
  return opts.map(o => `<option value="${o}" ${o === current ? "selected" : ""}>${o}</option>`).join("");
}

function renderInquiries(snapshot) {
  const rows = [];
  let count = 0;
  snapshot.forEach(child => {
    count++;
    const d = child.val();
    rows.push(`
      <tr>
        <td>${fmtDate(d.createdAt)}</td>
        <td><strong>${escapeHtml(d.parentName)}</strong><br><span class="tag">${escapeHtml(d.phone)}</span></td>
        <td>${escapeHtml(d.childName)} (${escapeHtml(d.childAge || "—")})</td>
        <td>${escapeHtml(d.classApplying)}</td>
        <td>${escapeHtml(d.email || "—")}</td>
        <td>${escapeHtml(d.message || "—")}</td>
        <td>
          <select data-id="${child.key}" data-type="inquiries" class="status-select">
            ${statusOptions(d.status)}
          </select>
        </td>
      </tr>
    `);
  });
  inquiriesBody.innerHTML = rows.reverse().join("") || `<tr><td colspan="7">No inquiries yet.</td></tr>`;
  inquiriesCount.textContent = count;
  attachStatusListeners();
}

function renderMessages(snapshot) {
  const rows = [];
  let count = 0;
  snapshot.forEach(child => {
    count++;
    const d = child.val();
    rows.push(`
      <tr>
        <td>${fmtDate(d.createdAt)}</td>
        <td>${escapeHtml(d.name)}</td>
        <td>${escapeHtml(d.phone || "—")}</td>
        <td>${escapeHtml(d.email || "—")}</td>
        <td>${escapeHtml(d.message)}</td>
      </tr>
    `);
  });
  messagesBody.innerHTML = rows.reverse().join("") || `<tr><td colspan="5">No messages yet.</td></tr>`;
  messagesCount.textContent = count;
}

function attachStatusListeners() {
  document.querySelectorAll(".status-select").forEach(sel => {
    sel.addEventListener("change", async () => {
      await update(ref(db, `${sel.dataset.type}/${sel.dataset.id}`), { status: sel.value });
    });
  });
}

function escapeHtml(str) {
  if (!str) return "";
  return String(str).replace(/[&<>"']/g, s => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[s]));
}

let inquiriesRef, messagesRef;

onAuthStateChanged(auth, (user) => {
  if (user) {
    loginBox.style.display = "none";
    dashboard.style.display = "block";
    adminEmailLabel.textContent = user.email;

    inquiriesRef = ref(db, "inquiries");
    messagesRef = ref(db, "messages");
    onValue(inquiriesRef, renderInquiries);
    onValue(messagesRef, renderMessages);
  } else {
    loginBox.style.display = "block";
    dashboard.style.display = "none";
    if (inquiriesRef) off(inquiriesRef);
    if (messagesRef) off(messagesRef);
  }
});
