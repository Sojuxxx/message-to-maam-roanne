// storage.js
// Saves and loads the player's progress using localStorage.

const STORAGE_KEY = 'instructor-greeting-v1';

// Returns the saved object, or an empty object if nothing is saved
// (or if the browser does not allow localStorage).
function loadSaved() {
  try {
    const text = localStorage.getItem(STORAGE_KEY);
    return JSON.parse(text) || {};
  } catch (error) {
    return {};
  }
}

// Returns true if saved, false if the browser blocked it.
function saveData(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch (error) {
    return false;
  }
}
