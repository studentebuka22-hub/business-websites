// =============================================================================
// admin.js
// Drives admin.html. Guards the route behind Firebase Auth, then wires up
// every dashboard section: Pages, Buttons (per page), Settings, and Stats.
// Uses SortableJS for drag-and-drop ordering and SweetAlert2 for destructive
// confirmations. Plain script (no import/export) so it runs from file://.
// =============================================================================

var allPagesCache = [];
var activePageId = null; // page whose buttons are currently being managed

/* ============================== BOOTSTRAP ================================ */

document.addEventListener("DOMContentLoaded", function () {
  Auth.requireAdmin().then(function (user) {
    document.querySelector("#adminEmail").textContent = user.email;

    UI.initThemeToggle();
    UI.applyTheme(UI.getInitialTheme("light"));
    wireSidebarNav();
    wireLogout();
    wireSidebarToggleForMobile();
    wirePagesSection();
    wireButtonsSection();
    wireSettingsSection();

    refreshEverything().then(function () { UI.hideLoader(); });
  });
});

/** Reloads pages from Firebase and re-renders whichever sections need it. */
function refreshEverything() {
  return Pages.fetchAllPages().then(function (pages) {
    allPagesCache = pages;
    renderStats(allPagesCache);
    renderPagesList(allPagesCache);
    renderHomepageOptions(allPagesCache);
    return renderSettings();
  });
}

/* ============================== SIDEBAR NAV =============================== */

function wireSidebarNav() {
  document.querySelectorAll(".admin-nav-link[data-section]").forEach(function (link) {
    link.addEventListener("click", function () {
      document.querySelectorAll(".admin-nav-link[data-section]").forEach(function (l) { l.classList.remove("active"); });
      link.classList.add("active");
      document.querySelectorAll(".admin-section").forEach(function (s) { s.classList.add("d-none"); });
      document.querySelector("#section-" + link.dataset.section).classList.remove("d-none");
      if (link.dataset.section !== "buttons") activePageId = null;
      document.querySelector("#adminSidebar").classList.remove("open");
    });
  });
}

function wireSidebarToggleForMobile() {
  var btn = document.querySelector("#sidebarToggleBtn");
  if (btn) btn.addEventListener("click", function () { document.querySelector("#adminSidebar").classList.toggle("open"); });
}

function wireLogout() {
  document.querySelector("#logoutBtn").addEventListener("click", function () {
    Swal.fire({
      title: "Log out?",
      text: "You'll need to sign in again to access the dashboard.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Log out",
      confirmButtonColor: "#5B5FEF"
    }).then(function (result) {
      if (result.isConfirmed) Auth.logout();
    });
  });
}

/* ============================== STATS ===================================== */

function renderStats(pages) {
  var totalPages = pages.length;
  var mostRecent = null;
  pages.forEach(function (p) {
    if (!mostRecent || new Date(p.updatedDate) > new Date(mostRecent.updatedDate)) mostRecent = p;
  });

  var statButtons = document.querySelector("#statTotalButtons");
  Promise.all(pages.map(function (p) { return Buttons.fetchButtonsForPage(p.id); })).then(function (lists) {
    var totalButtons = lists.reduce(function (sum, l) { return sum + l.length; }, 0);
    if (statButtons) statButtons.textContent = totalButtons;
  });

  document.querySelector("#statTotalPages").textContent = totalPages;
  document.querySelector("#statLastEdited").textContent = mostRecent ? Helpers.formatDate(mostRecent.updatedDate) : "—";
  document.querySelector("#statRecentActivity").innerHTML = pages
    .slice()
    .sort(function (a, b) { return new Date(b.updatedDate) - new Date(a.updatedDate); })
    .slice(0, 5)
    .map(function (p) {
      return '<div class="data-row"><span class="row-title">' + Helpers.escapeHTML(p.title) +
        '</span><span class="row-meta ms-auto">' + Helpers.formatDate(p.updatedDate) + "</span></div>";
    })
    .join("") || '<p class="text-body-secondary small">No activity yet.</p>';
}

/* ============================== PAGES SECTION ============================= */

function renderPagesList(pages) {
  var container = document.querySelector("#pagesList");
  if (!pages.length) {
    container.innerHTML = '<div class="empty-state"><i class="bi bi-folder2-open"></i><h4>No pages yet</h4><p>Click "New Page" to create your first one.</p></div>';
    return;
  }
  container.innerHTML = pages.map(function (p) {
    return (
      '<div class="data-row" data-id="' + p.id + '">' +
      '<i class="bi bi-grip-vertical drag-handle"></i>' +
      '<span class="row-icon" style="background:#5B5FEF;"><i class="bi ' + Helpers.escapeHTML(p.icon || "bi-folder2-open") + '"></i></span>' +
      "<div>" +
      '<div class="row-title">' + Helpers.escapeHTML(p.title) + ' <span class="status-pill ' + p.status + '">' + p.status + "</span></div>" +
      '<div class="row-meta">/' + Helpers.escapeHTML(p.slug) + " · updated " + Helpers.formatDate(p.updatedDate) + "</div>" +
      "</div>" +
      '<div class="row-actions">' +
      '<button data-action="manage-buttons" title="Manage buttons"><i class="bi bi-grid-3x3-gap"></i></button>' +
      '<button data-action="preview" title="Preview"><i class="bi bi-eye"></i></button>' +
      '<button data-action="edit" title="Edit"><i class="bi bi-pencil"></i></button>' +
      '<button data-action="duplicate" title="Duplicate"><i class="bi bi-files"></i></button>' +
      '<button data-action="toggle" title="Publish/Hide"><i class="bi bi-toggle2-' + (p.status === "published" ? "on" : "off") + '"></i></button>' +
      '<button data-action="delete" title="Delete"><i class="bi bi-trash text-danger"></i></button>' +
      "</div></div>"
    );
  }).join("");

  container.querySelectorAll(".data-row").forEach(function (row) {
    var id = row.dataset.id;
    row.querySelector("[data-action='manage-buttons']").addEventListener("click", function () { openButtonsForPage(id); });
    row.querySelector("[data-action='preview']").addEventListener("click", function () {
      var p = allPagesCache.filter(function (pg) { return pg.id === id; })[0];
      window.open("index.html?page=" + p.slug, "_blank");
    });
    row.querySelector("[data-action='edit']").addEventListener("click", function () { openPageModal(id); });
    row.querySelector("[data-action='duplicate']").addEventListener("click", function () { handleDuplicatePage(id); });
    row.querySelector("[data-action='toggle']").addEventListener("click", function () { handleTogglePage(id); });
    row.querySelector("[data-action='delete']").addEventListener("click", function () { handleDeletePage(id); });
  });

  if (window.Sortable) {
    Sortable.create(container, {
      handle: ".drag-handle",
      animation: 180,
      ghostClass: "sortable-ghost",
      onEnd: function () {
        var orderedIds = Array.from(container.querySelectorAll(".data-row")).map(function (r) { return r.dataset.id; });
        Pages.reorderPages(orderedIds).then(function () {
          UI.showToast("Page order updated", "success");
          return Pages.fetchAllPages();
        }).then(function (pages) { allPagesCache = pages; });
      }
    });
  }
}

function wirePagesSection() {
  var input = document.querySelector("#pagesSearchInput");
  if (input) {
    input.addEventListener("input", Helpers.debounce(function (e) {
      var q = e.target.value.trim().toLowerCase();
      var filtered = allPagesCache.filter(function (p) {
        return p.title.toLowerCase().indexOf(q) !== -1 || p.slug.toLowerCase().indexOf(q) !== -1;
      });
      renderPagesList(filtered);
    }, 150));
  }

  var newBtn = document.querySelector("#newPageBtn");
  if (newBtn) newBtn.addEventListener("click", function () { openPageModal(null); });

  var form = document.querySelector("#pageForm");
  if (form) form.addEventListener("submit", handlePageFormSubmit);
}

function openPageModal(pageId) {
  var modalEl = document.querySelector("#pageModal");
  var form = document.querySelector("#pageForm");
  form.reset();
  form.dataset.pageId = pageId || "";
  document.querySelector("#pageModalTitle").textContent = pageId ? "Edit Page" : "Create Page";

  if (pageId) {
    var p = allPagesCache.filter(function (pg) { return pg.id === pageId; })[0];
    form.title.value = p.title;
    form.description.value = p.description || "";
    form.icon.value = p.icon || "bi-folder2-open";
    form.status.value = p.status;
  } else {
    form.status.value = "published";
    form.icon.value = "bi-folder2-open";
  }
  new bootstrap.Modal(modalEl).show();
}

function handlePageFormSubmit(e) {
  e.preventDefault();
  var form = e.target;
  var pageId = form.dataset.pageId;
  var fields = {
    title: form.title.value.trim(),
    description: form.description.value.trim(),
    icon: form.icon.value.trim() || "bi-folder2-open",
    status: form.status.value
  };
  if (!fields.title) { UI.showToast("Give the page a title first.", "error"); return; }

  var action = pageId ? Pages.updatePage(pageId, fields) : Pages.createPage(fields);
  action.then(function () {
    UI.showToast(pageId ? "Page updated" : "Page created", "success");
    bootstrap.Modal.getInstance(document.querySelector("#pageModal")).hide();
    return refreshEverything();
  }).catch(function (err) {
    UI.showToast(err.message || "Couldn't save the page.", "error");
  });
}

function handleDuplicatePage(pageId) {
  Pages.duplicatePage(pageId).then(function () {
    UI.showToast("Page duplicated", "success");
    return refreshEverything();
  });
}

function handleTogglePage(pageId) {
  var p = allPagesCache.filter(function (pg) { return pg.id === pageId; })[0];
  Pages.togglePageStatus(pageId, p.status).then(function (next) {
    UI.showToast("Page " + (next === "published" ? "published" : "hidden"), "success");
    return refreshEverything();
  });
}

function handleDeletePage(pageId) {
  var p = allPagesCache.filter(function (pg) { return pg.id === pageId; })[0];
  Swal.fire({
    title: 'Delete "' + p.title + '"?',
    text: "This also deletes every button on this page. This can't be undone.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Delete",
    confirmButtonColor: "#FF6B5C"
  }).then(function (result) {
    if (!result.isConfirmed) return;
    return Pages.deletePage(pageId).then(function () {
      UI.showToast("Page deleted", "success");
      return refreshEverything();
    });
  });
}

/* ============================== BUTTONS SECTION ============================ */

function openButtonsForPage(pageId) {
  activePageId = pageId;
  var page = allPagesCache.filter(function (p) { return p.id === pageId; })[0];
  document.querySelectorAll(".admin-nav-link[data-section]").forEach(function (l) { l.classList.remove("active"); });
  document.querySelectorAll(".admin-section").forEach(function (s) { s.classList.add("d-none"); });
  document.querySelector("#section-buttons").classList.remove("d-none");
  document.querySelector("#buttonsPageTitle").textContent = "Buttons — " + page.title;
  renderButtonsList(pageId);
}

function renderButtonsList(pageId) {
  var container = document.querySelector("#buttonsList");
  return Buttons.fetchButtonsForPage(pageId).then(function (buttons) {
    if (!buttons.length) {
      container.innerHTML = '<div class="empty-state"><i class="bi bi-grid-3x3-gap"></i><h4>No buttons yet</h4><p>Click "New Button" to add the first one.</p></div>';
      return;
    }

    container.innerHTML = buttons.map(function (b) {
      var typeInfo = Helpers.TARGET_TYPES[b.type] || {};
      return (
        '<div class="data-row" data-id="' + b.id + '">' +
        '<i class="bi bi-grip-vertical drag-handle"></i>' +
        '<span class="row-icon" style="background:' + (b.backgroundColor || "#5B5FEF") + ";color:" + (b.textColor || "#fff") + ';"><i class="bi ' + Helpers.escapeHTML(b.icon || "bi-link-45deg") + '"></i></span>' +
        "<div>" +
        '<div class="row-title">' + Helpers.escapeHTML(b.title) + ' <span class="status-pill ' + (b.status === "enabled" ? "published" : "draft") + '">' + b.status + "</span></div>" +
        '<div class="row-meta">' + Helpers.escapeHTML(typeInfo.label || b.type) + " → " + Helpers.escapeHTML(b.target) + "</div>" +
        "</div>" +
        '<div class="row-actions">' +
        '<button data-action="preview" title="Preview"><i class="bi bi-eye"></i></button>' +
        '<button data-action="edit" title="Edit"><i class="bi bi-pencil"></i></button>' +
        '<button data-action="duplicate" title="Duplicate"><i class="bi bi-files"></i></button>' +
        '<button data-action="toggle" title="Enable/Disable"><i class="bi bi-toggle2-' + (b.status === "enabled" ? "on" : "off") + '"></i></button>' +
        '<button data-action="delete" title="Delete"><i class="bi bi-trash text-danger"></i></button>' +
        "</div></div>"
      );
    }).join("");

    container.querySelectorAll(".data-row").forEach(function (row) {
      var id = row.dataset.id;
      row.querySelector("[data-action='preview']").addEventListener("click", function () {
        var page = allPagesCache.filter(function (p) { return p.id === activePageId; })[0];
        window.open("index.html?page=" + page.slug, "_blank");
      });
      row.querySelector("[data-action='edit']").addEventListener("click", function () { openButtonModal(id); });
      row.querySelector("[data-action='duplicate']").addEventListener("click", function () { handleDuplicateButton(id); });
      row.querySelector("[data-action='toggle']").addEventListener("click", function () { handleToggleButton(id); });
      row.querySelector("[data-action='delete']").addEventListener("click", function () { handleDeleteButton(id); });
    });

    if (window.Sortable) {
      Sortable.create(container, {
        handle: ".drag-handle",
        animation: 180,
        ghostClass: "sortable-ghost",
        onEnd: function () {
          var orderedIds = Array.from(container.querySelectorAll(".data-row")).map(function (r) { return r.dataset.id; });
          Buttons.reorderButtons(activePageId, orderedIds).then(function () {
            UI.showToast("Button order updated", "success");
          });
        }
      });
    }
  });
}

function wireButtonsSection() {
  var newBtn = document.querySelector("#newButtonBtn");
  if (newBtn) newBtn.addEventListener("click", function () { openButtonModal(null); });

  var form = document.querySelector("#buttonForm");
  if (form) form.addEventListener("submit", handleButtonFormSubmit);

  var typeSelect = document.querySelector("#buttonTypeSelect");
  if (typeSelect) typeSelect.addEventListener("change", updateButtonTargetField);

  var uploadInput = document.querySelector("#buttonIconUpload");
  if (uploadInput) uploadInput.addEventListener("change", handleButtonImageUpload);
}

function updateButtonTargetField() {
  var type = document.querySelector("#buttonTypeSelect").value;
  var internalWrap = document.querySelector("#targetInternalWrap");
  var genericWrap = document.querySelector("#targetGenericWrap");
  var genericLabel = document.querySelector("#targetGenericLabel");
  var genericInput = document.querySelector("#buttonTargetGeneric");

  var placeholders = {
    external: ["External URL", "https://example.com"],
    whatsapp: ["WhatsApp Number", "+15551234567"],
    telephone: ["Phone Number", "+15551234567"],
    email: ["Email Address", "hello@example.com"],
    maps: ["Address or Place", "1600 Amphitheatre Pkwy"],
    file: ["File URL", "https://example.com/file.pdf"]
  };

  if (type === "internal") {
    internalWrap.classList.remove("d-none");
    genericWrap.classList.add("d-none");
    var select = document.querySelector("#buttonTargetPage");
    select.innerHTML = allPagesCache.map(function (p) {
      return '<option value="' + p.slug + '">' + Helpers.escapeHTML(p.title) + "</option>";
    }).join("");
  } else {
    internalWrap.classList.add("d-none");
    genericWrap.classList.remove("d-none");
    var pair = placeholders[type] || ["Target", ""];
    genericLabel.textContent = pair[0];
    genericInput.placeholder = pair[1];
  }
}

function openButtonModal(buttonId) {
  var modalEl = document.querySelector("#buttonModal");
  var form = document.querySelector("#buttonForm");
  form.reset();
  form.dataset.buttonId = buttonId || "";
  document.querySelector("#buttonModalTitle").textContent = buttonId ? "Edit Button" : "Create Button";

  updateButtonTargetField();

  if (buttonId) {
    Buttons.fetchButtonsForPage(activePageId).then(function (buttons) {
      var b = buttons.filter(function (x) { return x.id === buttonId; })[0];
      form.title.value = b.title;
      form.subtitle.value = b.subtitle || "";
      form.icon.value = b.icon || "";
      form.image.value = b.image || "";
      form.backgroundColor.value = b.backgroundColor || "#5B5FEF";
      form.textColor.value = b.textColor || "#ffffff";
      form.status.value = b.status || "enabled";
      document.querySelector("#buttonTypeSelect").value = b.type;
      updateButtonTargetField();
      if (b.type === "internal") {
        document.querySelector("#buttonTargetPage").value = b.target;
      } else {
        document.querySelector("#buttonTargetGeneric").value = b.target;
      }
    });
  } else {
    form.backgroundColor.value = "#5B5FEF";
    form.textColor.value = "#ffffff";
    form.status.value = "enabled";
  }
  new bootstrap.Modal(modalEl).show();
}

function handleButtonFormSubmit(e) {
  e.preventDefault();
  var form = e.target;
  var buttonId = form.dataset.buttonId;
  var type = document.querySelector("#buttonTypeSelect").value;
  var target = type === "internal" ? document.querySelector("#buttonTargetPage").value : document.querySelector("#buttonTargetGeneric").value;

  var fields = {
    title: form.title.value.trim(),
    subtitle: form.subtitle.value.trim(),
    icon: form.icon.value.trim() || (Helpers.TARGET_TYPES[type] || {}).icon || "bi-link-45deg",
    image: form.image.value.trim(),
    backgroundColor: form.backgroundColor.value,
    textColor: form.textColor.value,
    status: form.status.value,
    type: type,
    target: target
  };

  if (!fields.title) { UI.showToast("Give the button a title first.", "error"); return; }
  if (!fields.target) { UI.showToast("Set a destination for this button.", "error"); return; }

  var action = buttonId ? Buttons.updateButton(activePageId, buttonId, fields) : Buttons.createButton(activePageId, fields);
  action.then(function () {
    UI.showToast(buttonId ? "Button updated" : "Button created", "success");
    bootstrap.Modal.getInstance(document.querySelector("#buttonModal")).hide();
    return renderButtonsList(activePageId);
  }).catch(function (err) {
    UI.showToast(err.message || "Couldn't save the button.", "error");
  });
}

function handleDuplicateButton(buttonId) {
  Buttons.duplicateButton(activePageId, buttonId).then(function () {
    UI.showToast("Button duplicated", "success");
    return renderButtonsList(activePageId);
  });
}

function handleToggleButton(buttonId) {
  Buttons.fetchButtonsForPage(activePageId).then(function (buttons) {
    var b = buttons.filter(function (x) { return x.id === buttonId; })[0];
    return Buttons.toggleButtonStatus(activePageId, buttonId, b.status);
  }).then(function (next) {
    UI.showToast("Button " + (next === "enabled" ? "enabled" : "disabled"), "success");
    return renderButtonsList(activePageId);
  });
}

function handleDeleteButton(buttonId) {
  Swal.fire({
    title: "Delete this button?",
    text: "This can't be undone.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Delete",
    confirmButtonColor: "#FF6B5C"
  }).then(function (result) {
    if (!result.isConfirmed) return;
    return Buttons.deleteButton(activePageId, buttonId).then(function () {
      UI.showToast("Button deleted", "success");
      return renderButtonsList(activePageId);
    });
  });
}

function handleButtonImageUpload(e) {
  var file = e.target.files[0];
  if (!file) return;
  UI.showToast("Uploading image…", "info");
  var path = "button-images/" + Date.now() + "-" + file.name;
  var fileRef = storage.ref(path);
  fileRef.put(file).then(function (snapshot) {
    return snapshot.ref.getDownloadURL();
  }).then(function (url) {
    document.querySelector("#buttonForm").image.value = url;
    UI.showToast("Image uploaded", "success");
  }).catch(function () {
    UI.showToast("Upload failed. Check your Firebase Storage rules.", "error");
  });
}

/* ============================== SETTINGS SECTION =========================== */

function renderHomepageOptions(pages) {
  var select = document.querySelector("#settingsHomepage");
  if (!select) return;
  select.innerHTML = pages.map(function (p) {
    return '<option value="' + p.slug + '">' + Helpers.escapeHTML(p.title) + "</option>";
  }).join("");
}

function renderSettings() {
  return db.ref("settings").once("value").then(function (snap) {
    var s = snap.exists() ? snap.val() : {};
    var form = document.querySelector("#settingsForm");
    if (!form) return;
    form.siteTitle.value = s.siteTitle || "";
    form.footerText.value = s.footerText || s.footer || "";
    form.logo.value = s.logo || "";
    form.favicon.value = s.favicon || "";
    form.darkMode.checked = !!s.darkMode;
    if (s.homepage) form.homepage.value = s.homepage;
  });
}

function wireSettingsSection() {
  var form = document.querySelector("#settingsForm");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var fields = {
        siteTitle: form.siteTitle.value.trim() || "Directory",
        footerText: form.footerText.value.trim(),
        logo: form.logo.value.trim(),
        favicon: form.favicon.value.trim(),
        darkMode: form.darkMode.checked,
        homepage: form.homepage.value
      };
      db.ref("settings").update(fields).then(function () {
        UI.showToast("Settings saved", "success");
      });
    });
  }

  var logoInput = document.querySelector("#logoUploadInput");
  if (logoInput) {
    logoInput.addEventListener("change", function (e) {
      var file = e.target.files[0];
      if (!file) return;
      var fileRef = storage.ref("branding/logo-" + Date.now() + "-" + file.name);
      fileRef.put(file).then(function (snapshot) { return snapshot.ref.getDownloadURL(); }).then(function (url) {
        document.querySelector("#settingsForm").logo.value = url;
        UI.showToast("Logo uploaded", "success");
      });
    });
  }

  /* -------------------------- IMPORT / EXPORT / BACKUP -------------------- */

  var exportBtn = document.querySelector("#exportJsonBtn");
  if (exportBtn) {
    exportBtn.addEventListener("click", function () {
      db.ref().once("value").then(function (snap) {
        downloadJSON(snap.val() || {}, "directory-export-" + Date.now() + ".json");
        UI.showToast("Export ready — check your downloads", "success");
      });
    });
  }

  var backupBtn = document.querySelector("#backupBtn");
  if (backupBtn) {
    backupBtn.addEventListener("click", function () {
      db.ref().once("value").then(function (snap) {
        downloadJSON(snap.val() || {}, "directory-backup-" + Helpers.nowISO() + ".json");
        UI.showToast("Backup downloaded", "success");
      });
    });
  }

  var importInput = document.querySelector("#importJsonInput");
  if (importInput) {
    importInput.addEventListener("change", function (e) {
      var file = e.target.files[0];
      if (!file) return;
      Swal.fire({
        title: "Import data?",
        text: "This merges the JSON file's contents into your live database.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Import"
      }).then(function (result) {
        if (!result.isConfirmed) { e.target.value = ""; return; }
        file.text().then(function (text) {
          var data = JSON.parse(text);
          return db.ref().update(data);
        }).then(function () {
          UI.showToast("Import complete", "success");
          return refreshEverything();
        }).catch(function () {
          UI.showToast("That file couldn't be imported. Check it's valid JSON.", "error");
        }).then(function () { e.target.value = ""; });
      });
    });
  }

  var restoreInput = document.querySelector("#restoreJsonInput");
  if (restoreInput) {
    restoreInput.addEventListener("change", function (e) {
      var file = e.target.files[0];
      if (!file) return;
      Swal.fire({
        title: "Restore from backup?",
        text: "This will overwrite ALL current data with the backup file's contents.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Restore",
        confirmButtonColor: "#FF6B5C"
      }).then(function (result) {
        if (!result.isConfirmed) { e.target.value = ""; return; }
        file.text().then(function (text) {
          var data = JSON.parse(text);
          return db.ref().set(data);
        }).then(function () {
          UI.showToast("Database restored", "success");
          return refreshEverything();
        }).catch(function () {
          UI.showToast("Restore failed. Check the backup file is valid JSON.", "error");
        }).then(function () { e.target.value = ""; });
      });
    });
  }
}

function downloadJSON(data, filename) {
  var blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  var url = URL.createObjectURL(blob);
  var a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
