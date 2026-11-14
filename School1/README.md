# Peace Mentorary International Academy — Website

A mobile-first school website with an online admission inquiry form and a
general contact form. Both forms save straight into **Firebase Realtime
Database**, and a password-protected **admin dashboard** (`admin.html`) lets
staff view and manage submissions in real time — built with **Firebase
Authentication**.

No backend server, no CBT, no student portal. Just the site + Firebase.

## What's inside

```
index.html          Homepage
about.html           About Us
academics.html        Academics
admissions.html        Admissions + inquiry form  →  writes to /inquiries
gallery.html          Photo gallery
news.html             News & Events noticeboard
contact.html           Contact + general message form  →  writes to /messages
admin.html            Staff login + dashboard (reads /inquiries and /messages)
css/style.css          All styling
js/firebase-config.js    Your Firebase project keys go here
js/main.js             Shared nav behavior
js/admissions.js        Admission form logic
js/contact.js           Contact form logic
js/admin.js            Admin login + dashboard logic
database.rules.json      Realtime Database security rules
```

## 1. Create your Firebase project (10 minutes)

1. Go to https://console.firebase.google.com → **Add project** → name it
   (e.g. `peace-mentorary-academy`) → finish the wizard.
2. In the project, click the **web icon (`</>`)** to register a web app.
   Copy the `firebaseConfig` object it shows you.
3. Open `js/firebase-config.js` in this project and paste your values in,
   replacing the placeholders (`YOUR_API_KEY`, etc).
4. In the left sidebar: **Build → Realtime Database → Create Database**.
   - Choose a location close to Nigeria (e.g. `europe-west1`).
   - Start in **locked mode** — you'll deploy the rules file below instead.
5. Still in the sidebar: **Build → Authentication → Get Started → Sign-in
   method → Email/Password → Enable**.
6. **Authentication → Users → Add user.** Create one login for the school
   admin (e.g. `admin@peacementoraryacademy.com.ng` + a strong password).
   This is what you'll use to sign in at `/admin.html`.

## 2. Deploy the security rules

The rules in `database.rules.json` do exactly this:
- Anyone can **submit** an inquiry or a message (so parents don't need an
  account to apply).
- Only a **signed-in admin** can **read** the list of inquiries/messages —
  so submissions stay private, visible only inside the admin dashboard.

To deploy them:
- Easiest: open **Realtime Database → Rules** tab in the Firebase Console,
  paste the contents of `database.rules.json`, click **Publish**.
- Or, with the Firebase CLI: `firebase deploy --only database`.

## 3. Preview locally

Because the site uses Firebase's module SDK, open it through a local
server rather than double-clicking the file (some browsers block ES
modules on `file://`). Easiest options:

- VS Code → "Live Server" extension → Right click `index.html` → Open with
  Live Server, **or**
- `npx serve .` in this folder, **or**
- Skip straight to hosting it live (next step) and preview there.

## 4. Put the site online

Two good options:

**A. Firebase Hosting (free, fastest, pairs naturally with the database)**
```
npm install -g firebase-tools
firebase login
firebase init hosting     # choose this folder as the public directory
firebase deploy
```
Firebase gives you a `https://your-project.web.app` URL immediately. You
can then point the school's own domain (from the proposal —
`peacementoraryacademy.com.ng`) at it as a custom domain inside
**Hosting → Add custom domain**.

**B. Any regular Nigerian web host**
Upload every file/folder here (`index.html`, `css/`, `js/`, etc.) via
FTP/cPanel File Manager exactly as they are. The site still talks to
Firebase directly from the browser, so it works on any host with SSL.

## 5. Content the school still needs to add

- Replace every grey placeholder photo block with a real `<img>` tag
  (see the note at the bottom of `gallery.html`).
- Replace the proprietor's welcome text on `index.html` and `about.html`.
- Upload the real fees PDF to `assets/fees-structure.pdf` (create the
  `assets` folder) and confirm the download link on `admissions.html`.
- Update every phone number / WhatsApp number (currently
  `2348000000000` placeholders in `index.html`, `admissions.html`,
  `contact.html`, and `js/admissions.js`).
- Update the school address and the Google Maps embed query in
  `contact.html`.

## 6. Using the admin dashboard

Go to `yourdomain.com/admin.html`, sign in with the admin account you
created in step 1. You'll see two tabs:

- **Admission Inquiries** — every submission from the Admissions page,
  newest first, with a status dropdown (`new` → `contacted` → `enrolled` /
  `closed`) so staff can track follow-up.
- **Contact Messages** — general messages from the Contact page.

Both update live — if a parent submits while the dashboard is open, the
new row appears without refreshing.

## Optional next step: SMS/WhatsApp alerts on new submissions

Right now, submitting the Admissions form also auto-fills a WhatsApp
message the parent can send to the school directly — but if you'd like
the school to be *pushed* an SMS or WhatsApp notification automatically
the moment a form is submitted (no waiting for the dashboard), that
needs a small **Firebase Cloud Function** wired to a provider like Termii
or Twilio. That's a natural add-on — just say the word and it can be
built on top of this.
