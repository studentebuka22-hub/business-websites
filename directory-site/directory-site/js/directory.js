// =============================================================================
// directory.js
// Drives index.html: loads site settings, resolves which page to show
// (either the configured homepage, or ?page=slug from the URL), renders the
// breadcrumb trail, the page header, and the grid of button tiles, and wires
// up the Back/Home nav row. Exposed as `DirectoryApp.init()`.
// =============================================================================

var DirectoryApp = (function () {

  var SESSION_TRAIL_KEY = "directory_session_trail";
  var publishedPagesCache = [];

  /** Entry point, called once by index.html after DOMContentLoaded. */
  function init() {
    return loadSettings()
      .then(function (settings) {
        applySiteChrome(settings);
        return Pages.fetchAllPages().then(function (allPages) {
          var publishedPages = allPages.filter(function (p) { return p.status === "published"; });
          publishedPagesCache = publishedPages;

          var requestedSlug = Helpers.getQueryParam("page");
          var isHomepage = false;

          var pagePromise;
          if (requestedSlug) {
            pagePromise = Pages.fetchPageBySlug(requestedSlug).then(function (page) {
              if (!page || page.status !== "published") {
                UI.showToast("That page couldn't be found.", "error");
                isHomepage = true;
                return resolveHomepage(allPages, settings);
              }
              return page;
            });
          } else {
            isHomepage = true;
            pagePromise = Promise.resolve(resolveHomepage(allPages, settings));
          }

          return pagePromise.then(function (currentPage) {
            if (isHomepage) sessionStorage.removeItem(SESSION_TRAIL_KEY);
            return renderPage(currentPage, isHomepage);
          });
        });
      })
      .catch(function (err) {
        console.error(err);
        UI.showToast("Something went wrong loading the directory.", "error");
      })
      .then(function () {
        UI.hideLoader();
      });
  }

  /** Loads the single /settings node from Firebase. */
  function loadSettings() {
    return db.ref("settings").once("value").then(function (snap) { return snap.exists() ? snap.val() : {}; });
  }

  /** Applies site-wide chrome: title, logo, favicon, footer text, theme. */
  function applySiteChrome(settings) {
    document.title = settings.siteTitle || "Directory";
    var brandText = document.querySelector("#brandText");
    if (brandText) brandText.textContent = settings.siteTitle || "Directory";

    var brandMark = document.querySelector("#brandMark");
    if (brandMark && settings.logo) {
      brandMark.outerHTML = '<img src="' + Helpers.escapeHTML(settings.logo) + '" class="brand-logo" id="brandMark" alt="Logo">';
    }

    if (settings.favicon) {
      var link = document.querySelector("link[rel='icon']");
      if (!link) {
        link = document.createElement("link");
        link.rel = "icon";
        document.head.appendChild(link);
      }
      link.href = settings.favicon;
    }

    var footer = document.querySelector("#footerText");
    if (footer) footer.textContent = settings.footerText || settings.footer || ("© " + new Date().getFullYear() + " Directory");

    var heroSiteTitle = document.querySelector("#heroSiteTitle");
    if (heroSiteTitle) heroSiteTitle.textContent = settings.siteTitle || "the directory";

    UI.applyTheme(UI.getInitialTheme(settings.darkMode ? "dark" : "light"));
    UI.initThemeToggle();
  }

  /** Figures out which page object to treat as the homepage ("Home"/"Index"). */
  function resolveHomepage(allPages, settings) {
    if (settings.homepage) {
      var bySlug = allPages.filter(function (p) { return p.slug === settings.homepage || p.id === settings.homepage; })[0];
      if (bySlug) return bySlug;
    }
    var byTitle = allPages.filter(function (p) { return /^(home|index)$/i.test(p.title) && p.status === "published"; })[0];
    if (byTitle) return byTitle;
    return allPages.filter(function (p) { return p.status === "published"; })[0] || null;
  }

  /** Renders a resolved page: breadcrumb, title block, and its card grid.
   *  Homepage shows every published page as a navigation card (no manual
   *  buttons needed). Any other page shows ONLY its own buttons - each of
   *  which points either to another page (continuing the navigation) or to
   *  a final external/WhatsApp/phone/email/maps/file link. The two are
   *  never mixed on the same screen. */
  function renderPage(page, isHomepage) {
    var root = document.querySelector("#pageRoot");
    var navRow = document.querySelector("#pageNavRow");

    if (!page) {
      root.innerHTML =
        '<div class="empty-state"><i class="bi bi-signpost-split"></i><h4>No pages yet</h4><p>Create your first page from the Admin Dashboard.</p></div>';
      if (navRow) navRow.classList.add("d-none");
      UI.renderBreadcrumb([{ label: "Home" }]);
      return;
    }

    document.title = page.title + " · " + document.title.split("·").pop().trim();
    setMetaDescription(page.description || page.title);

    var trail = isHomepage ? [{ label: "Home" }] : buildTrail(page);
    UI.renderBreadcrumb(trail);

    if (navRow) {
      if (isHomepage) {
        navRow.classList.add("d-none");
      } else {
        navRow.classList.remove("d-none");
        navRow.innerHTML =
          '<button class="nav-pill" id="backBtn"><i class="bi bi-arrow-left"></i> Back</button>' +
          '<a class="nav-pill home" href="index.html"><i class="bi bi-house"></i> Home</a>';
        var backBtn = document.querySelector("#backBtn");
        if (backBtn) backBtn.addEventListener("click", function () { history.back(); });
      }
    }

    var titleBlock = document.querySelector("#pageTitleBlock");
    if (titleBlock) {
      if (isHomepage) {
        titleBlock.innerHTML = "";
      } else {
        titleBlock.innerHTML =
          '<div class="page-icon-badge"><i class="bi ' + Helpers.escapeHTML(page.icon || "bi-folder2-open") + '"></i></div>' +
          "<h2>" + Helpers.escapeHTML(page.title) + "</h2>" +
          (page.description ? "<p>" + Helpers.escapeHTML(page.description) + "</p>" : "");
      }
    }

    if (isHomepage) {
      // Homepage: every published page becomes a navigation card. Nothing
      // needs to be manually linked just to appear here.
      var pageTiles = publishedPagesCache.map(function (p) {
        return UI.renderTile({
          id: p.id,
          title: p.title,
          subtitle: p.description,
          icon: p.icon,
          type: "internal",
          target: p.slug,
          backgroundColor: "#5B5FEF",
          textColor: "#FFFFFF",
          status: "enabled"
        });
      });
      root.className = "tiles-grid";
      root.innerHTML = pageTiles.length
        ? pageTiles.join("")
        : '<div class="empty-state"><i class="bi bi-folder2-open"></i><h4>No pages yet</h4><p>Create your first page from the Admin Dashboard.</p></div>';
      return;
    }

    // Any other page: only ITS OWN buttons show, never the pages list.
    // Disabled buttons still render (greyed out) so visitors can see the
    // option exists without being able to tap it.
    return Buttons.fetchButtonsForPage(page.id).then(function (buttons) {
      UI.renderTileGrid(root, buttons);
    });
  }

  /** Writes/updates the <meta name="description"> tag for basic SEO. */
  function setMetaDescription(text) {
    var meta = document.querySelector("meta[name='description']");
    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "description";
      document.head.appendChild(meta);
    }
    meta.content = text.slice(0, 160);
  }

  /** Builds a breadcrumb trail using a session-stored click path. */
  function buildTrail(page) {
    var trail = [];
    try {
      trail = JSON.parse(sessionStorage.getItem(SESSION_TRAIL_KEY) || "[]");
    } catch (e) {
      trail = [];
    }

    var existingIndex = -1;
    trail.forEach(function (t, i) { if (t.slug === page.slug) existingIndex = i; });

    if (existingIndex !== -1) {
      trail = trail.slice(0, existingIndex + 1);
    } else {
      trail.push({ label: page.title, slug: page.slug });
    }

    sessionStorage.setItem(SESSION_TRAIL_KEY, JSON.stringify(trail));
    return [{ label: "Home" }].concat(trail);
  }

  return { init: init };
})();
