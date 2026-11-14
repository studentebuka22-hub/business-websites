# Aster & Stone Realty — Production-style starter

A polished responsive real-estate website for California and selected U.S. markets.

## Included
- Responsive public property website
- Property search, market filters and property details
- Saved/favorite homes
- Buyer application
- General enquiry
- Virtual-tour request
- Contact form
- Separate admin console at `admin.html`
- Listing CRUD: add, edit, publish/unpublish and delete
- Lead/activity management
- JSON export/import for backup
- Business/site settings
- Mobile navigation and responsive layouts
- Sample California, New York, Texas and Florida listings

## Important production note
The supplied admin page is intentionally **without login**, as requested. Its data layer uses browser `localStorage`, so it is a working front-end demonstration but is **not secure for a multi-user production deployment**.

For a real public launch, replace the local storage layer with a server/database and protect admin operations with authentication/authorization. Do not make an unauthenticated admin endpoint writable on the public internet.

## Launch
Open `index.html` in a browser, or deploy the folder to a static host.

## Replacing demo images
The starter uses remote Unsplash image URLs. For a commercial launch, replace these with properly licensed property photography hosted from your own CDN/storage.

## Suggested production backend
Firebase/Supabase/Node + PostgreSQL can be connected to the existing UI. The forms and admin data structures are already separated so the localStorage functions in `app.js` and `admin.js` can be replaced with API calls.
