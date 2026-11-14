// =============================================================================
// buttons.js
// All Firebase Realtime Database reads/writes for "buttons" (nested under a
// page) live here, using the compat SDK. Exposed on the global `Buttons` object.
//
// Database shape: pages/{pageId}/buttons/{buttonId} = {
//   title, subtitle, type, target, icon, image,
//   backgroundColor, textColor, sortOrder, status
// }
// =============================================================================

var Buttons = (function () {

  /** Fetches all buttons for a given page, sorted by sortOrder. */
  function fetchButtonsForPage(pageId) {
    return db.ref("pages/" + pageId + "/buttons").once("value").then(function (snap) {
      if (!snap.exists()) return [];
      var val = snap.val();
      return Object.keys(val)
        .map(function (id) { return Object.assign({ id: id }, val[id]); })
        .sort(function (a, b) { return (a.sortOrder || 0) - (b.sortOrder || 0); });
    });
  }

  /** Fetches a single button by id. */
  function fetchButtonById(pageId, buttonId) {
    return db.ref("pages/" + pageId + "/buttons/" + buttonId).once("value").then(function (snap) {
      return snap.exists() ? Object.assign({ id: buttonId }, snap.val()) : null;
    });
  }

  /** Internal: bumps the parent page's updatedDate whenever its buttons change. */
  function touchPageUpdatedDate(pageId) {
    return db.ref("pages/" + pageId).update({ updatedDate: Helpers.nowISO() });
  }

  /** Creates a new button on a page, with sensible defaults. */
  function createButton(pageId, fields) {
    return fetchButtonsForPage(pageId).then(function (existing) {
      var nextSortOrder = existing.length ? Math.max.apply(null, existing.map(function (b) { return b.sortOrder || 0; })) + 1 : 0;
      var newRef = db.ref("pages/" + pageId + "/buttons").push();
      var record = {
        title: fields.title,
        subtitle: fields.subtitle || "",
        type: fields.type || "external",
        target: fields.target || "",
        icon: fields.icon || "bi-link-45deg",
        image: fields.image || "",
        backgroundColor: fields.backgroundColor || "#5B5FEF",
        textColor: fields.textColor || "#FFFFFF",
        sortOrder: nextSortOrder,
        status: fields.status || "enabled"
      };
      return newRef.set(record).then(function () {
        return touchPageUpdatedDate(pageId);
      }).then(function () {
        return Object.assign({ id: newRef.key }, record);
      });
    });
  }

  /** Updates fields on an existing button. */
  function updateButton(pageId, buttonId, fields) {
    return db.ref("pages/" + pageId + "/buttons/" + buttonId).update(fields).then(function () {
      return touchPageUpdatedDate(pageId);
    });
  }

  /** Deletes a button from a page. */
  function deleteButton(pageId, buttonId) {
    return db.ref("pages/" + pageId + "/buttons/" + buttonId).remove().then(function () {
      return touchPageUpdatedDate(pageId);
    });
  }

  /** Duplicates a button within the same page. */
  function duplicateButton(pageId, buttonId) {
    return fetchButtonById(pageId, buttonId).then(function (original) {
      if (!original) throw new Error("Button not found");
      var fields = Object.assign({}, original);
      delete fields.id;
      fields.title = fields.title + " (copy)";
      return createButton(pageId, fields);
    });
  }

  /** Persists a full re-ordered list of button IDs to their new sortOrder values. */
  function reorderButtons(pageId, orderedIds) {
    var updates = {};
    orderedIds.forEach(function (id, index) { updates["pages/" + pageId + "/buttons/" + id + "/sortOrder"] = index; });
    return db.ref().update(updates);
  }

  /** Toggles a button between "enabled" and "disabled". */
  function toggleButtonStatus(pageId, buttonId, currentStatus) {
    var next = currentStatus === "enabled" ? "disabled" : "enabled";
    return updateButton(pageId, buttonId, { status: next }).then(function () { return next; });
  }

  return {
    fetchButtonsForPage: fetchButtonsForPage,
    fetchButtonById: fetchButtonById,
    createButton: createButton,
    updateButton: updateButton,
    deleteButton: deleteButton,
    duplicateButton: duplicateButton,
    reorderButtons: reorderButtons,
    toggleButtonStatus: toggleButtonStatus
  };
})();
