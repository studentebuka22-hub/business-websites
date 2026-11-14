# Directory Website (HTML + CSS + JS + Bootstrap 5 + Firebase)

A fully dynamic directory site. Only `index.html`, `login.html`, and `admin.html`
are hardcoded — every other "page" is created, edited, and ordered from the
Admin Dashboard and stored in Firebase.

**No local server, no build step, no Node needed.** This uses Firebase's
"compat" SDK with plain `<script>` tags (not ES modules), so you can open the
HTML files straight from your folder by double-clicking them.

## 1. Set up Firebase

1. Create a project at https://console.firebase.google.com
2. Enable **Authentication → Sign-in method → Email/Password**, then add
   your admin account under **Authentication → Users**.
3. Create a **Realtime Database** (start in locked mode).
4. (Optional) Enable **Storage** if you want to upload logos/icons/images
   instead of pasting URLs.
5. In **Project Settings → General → Your apps**, add a Web app and copy the
   config object.
6. Open `js/firebase.js` and paste your config into the `firebaseConfig`
   object at the top, replacing the placeholders.
7. Publish the rules in `database.rules.json` under
   **Realtime Database → Rules** (public read, authenticated write).

## 2. Run it

Just double-click `index.html` (or `login.html` / `admin.html`) to open it
in your browser directly from the folder — no `http://localhost`, no
`npx serve`, nothing to install. Because everything uses Firebase's compat
SDK and classic `<script>` tags instead of ES modules, the browser won't
block anything with a CORS error, even over `file://`.

You can, of course, also deploy it anywhere that serves static files
(Firebase Hosting, Netlify, a plain web host, etc.) if you'd rather people
reach it at a real URL.

## 3. First-time use

1. Open `login.html` and sign in with the admin account you created.
2. In **Pages**, click **New Page** to create your first pages
   (e.g. "Businesses", "Schools", "Hospitals").
3. Click the grid icon on a page row to open **Buttons** and add tappable
   tiles — each one can open another page, an external link, WhatsApp,
   a phone number, an email, Google Maps, or a file download.
4. In **Settings**, set your site title, choose which page is the homepage,
   and optionally upload a logo/favicon.
5. Open `index.html` — your directory is now fully live from Firebase.

## File structure

```
index.html          Public directory (renders whichever page is requested)
login.html           Admin sign-in
admin.html            Admin dashboard (pages, buttons, settings, stats)
css/style.css         All styling (no inline CSS anywhere)
js/firebase.js        Firebase compat SDK init (auth/db/storage) — put your config here
js/helpers.js         Slugs, dates, debounce, escaping — global `Helpers`
js/ui.js              Theme, loader, toasts, breadcrumb, tile rendering — global `UI`
js/auth.js            Login, logout, route guard — global `Auth`
js/pages.js           Firebase CRUD for pages — global `Pages`
js/buttons.js         Firebase CRUD for buttons — global `Buttons`
js/search.js          Instant search across pages + buttons — global `Search`
js/directory.js       Public-facing page router/renderer — global `DirectoryApp`
js/admin.js           Full admin dashboard logic (plain script)
```

Each `js/*.js` file exposes one global object (e.g. `window.Pages`) instead
of using `import`/`export`, and the `<script>` tags in each HTML file are
loaded in dependency order — that's the only structural difference from a
module-based build.

