/**
 * Chef's notes — independent of menus.
 * Notes are linked to menus by menuDate (e.g. "March 12, 2026"); use
 * getChefNote(menuDate) to fetch the note for a given menu date. If you
 * add a new menu, add a matching entry here if you want a chef note on
 * the Notes tab.
 */

/*
  chefsNotes — An array of objects. Each has menuDate (a string that matches a menu's date, e.g. "March 12, 2026") and note (the chef's text).
  We don't store the note inside the menu object; we look it up by date so notes and menus can be edited separately.
  A list of date-plus-note pairs; we find the note by matching the menu's date.
*/
const chefsNotes = [
  {
    menuDate: "March 12, 2026",
    note: "七小时的鸡汤。fall off the bone。",
  },
];

/**
 * getChefNote(menuDate) — We find the entry in chefsNotes whose menuDate equals the argument.
 * If we find one we return entry.note; otherwise null.
 * MainView calls getChefNote(currentMenu.date) and displays the result (or "—" if null).
 * Give me the chef's note for this menu date, or null if there isn't one.
 * @param {string} menuDate - Menu date string (e.g. "March 12, 2026")
 * @returns {string|null} The note, or null if none found
 */
export function getChefNote(menuDate) {
  const entry = chefsNotes.find((n) => n.menuDate === menuDate);
  return entry ? entry.note : null;
}

export default chefsNotes;
