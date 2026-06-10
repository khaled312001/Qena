// Re-exports the authors data as plain JSON. Both backend (this) and
// frontend (frontend/src/data/authors.json) share the same content,
// kept in sync via the deploy step. Updating content requires editing
// BOTH files until we set up a shared workspace.
module.exports = require('./authors.json');
