// =============================================================================
// pages.js
// All Firebase Realtime Database reads/writes for "pages" live here, using
// the compat SDK (window.db). Exposed on the global `Pages` object.
//
// Database shape:
// pages/{pageId} = {
//   title, slug, description, icon, status, sortOrder, createdDate, updatedDate
// }
// pages/{pageId}/buttons/{buttonId} = { ...see buttons.js }
// =============================================================================

var Pages = (function () {

  /** Fetches every page once as an array, sorted by sortOrder. */
  function fetchAllPages() {
    return db.ref("pages").once("value").then(function (snap) {
      if (!snap.exists()) return [];
      var val = snap.val();
      return Object.keys(val)
        .map(function (id) { return Object.assign({ id: id }, val[id]); })
        .sort(function (a, b) { return (a.sortOrder || 0) - (b.sortOrder || 0); });
    });
  }

  /** Fetches a single page by its Firebase key (pageId). */
  function fetchPageById(pageId) {
    return db.ref("pages/" + pageId).once("value").then(function (snap) {
      return snap.exists() ? Object.assign({ id: pageId }, snap.val()) : null;
    });
  }

  /** Fetches a single page by its slug (used for index.html?page=slug routing). */
  function fetchPageBySlug(slug) {
    return fetchAllPages().then(function (all) {
      return all.filter(function (p) { return p.slug === slug; })[0] || null;
    });
  }

  /**
   * Creates a new page. Auto-generates a unique slug (appending -2, -3, ...
   * if taken) and assigns the next sortOrder.
   */
  function createPage(fields) {
    var title = fields.title;
    var description = fields.description || "";
    var icon = fields.icon || "bi-folder2-open";
    var status = fields.status || "published";

    return fetchAllPages().then(function (existing) {
      var baseSlug = Helpers.slugify(title) || "page";
      var slug = baseSlug;
      var n = 2;
      while (existing.some(function (p) { return p.slug === slug; })) {
        slug = baseSlug + "-" + (n++);
      }
      var nextSortOrder = existing.length ? Math.max.apply(null, existing.map(function (p) { return p.sortOrder || 0; })) + 1 : 0;
      var timestamp = Helpers.nowISO();
      var newRef = db.ref("pages").push();
      var record = {
        title: title,
        slug: slug,
        description: description,
        icon: icon,
        status: status,
        sortOrder: nextSortOrder,
        createdDate: timestamp,
        updatedDate: timestamp
      };
      return newRef.set(record).then(function () {
        return Object.assign({ id: newRef.key }, record);
      });
    });
  }

  /** Updates fields on an existing page and bumps updatedDate. */
  function updatePage(pageId, fields) {
    var patch = Object.assign({}, fields, { updatedDate: Helpers.nowISO() });
    return db.ref("pages/" + pageId).update(patch);
  }

  /** Deletes a page and all of its buttons. */
  function deletePage(pageId) {
    return db.ref("pages/" + pageId).remove();
  }

  /** Duplicates a page (and all of its buttons) as a new "Copy of ..." page. */
  function duplicatePage(pageId) {
    return fetchPageById(pageId).then(function (original) {
      if (!original) throw new Error("Page not found");
      return db.ref("pages/" + pageId + "/buttons").once("value").then(function (buttonsSnap) {
        var buttons = buttonsSnap.exists() ? buttonsSnap.val() : {};
        return createPage({
          title: "Copy of " + original.title,
          description: original.description,
          icon: original.icon,
          status: "draft"
        }).then(function (copy) {
          var keys = Object.keys(buttons);
          if (!keys.length) return copy;
          var buttonsToWrite = {};
          keys.forEach(function (k) {
            var newKey = db.ref("pages/" + copy.id + "/buttons").push().key;
            buttonsToWrite[newKey] = buttons[k];
          });
          return db.ref("pages/" + copy.id + "/buttons").update(buttonsToWrite).then(function () { return copy; });
        });
      });
    });
  }

  /** Persists a full re-ordered list of page IDs to their new sortOrder values. */
  function reorderPages(orderedIds) {
    var updates = {};
    orderedIds.forEach(function (id, index) { updates["pages/" + id + "/sortOrder"] = index; });
    return db.ref().update(updates);
  }

  /** Toggles a page between "published" and "draft". */
  function togglePageStatus(pageId, currentStatus) {
    var next = currentStatus === "published" ? "draft" : "published";
    return updatePage(pageId, { status: next }).then(function () { return next; });
  }

  return {
    fetchAllPages: fetchAllPages,
    fetchPageById: fetchPageById,
    fetchPageBySlug: fetchPageBySlug,
    createPage: createPage,
    updatePage: updatePage,
    deletePage: deletePage,
    duplicatePage: duplicatePage,
    reorderPages: reorderPages,
    togglePageStatus: togglePageStatus
  };
})();
