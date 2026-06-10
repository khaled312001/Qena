// Re-exports the editorial-policy data as plain JSON. Both backend (this) and
// frontend (frontend/src/data/editorial-policy.json) share the same content,
// kept in sync via the deploy step. Updating content requires editing
// BOTH files until we set up a shared workspace.
module.exports = require('./editorial-policy.json');
