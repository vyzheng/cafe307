/**
 * Tab configuration for the main dashboard.
 * MainView and TabBar import these so tab ids and labels live in one place.
 *
 * mainViewTabs contains the base tabs visible to all users (Menu, Archive,
 * Notes, Requests). The "Add" tab is appended dynamically by MainView
 * when the user has chef permissions (see roles.js canAddMenu).
 */

export const TAB_IDS = {
  MENU: "menu",
  ARCHIVE: "archive",
  NOTES: "notes",
  REQUESTS: "requests",
  ADD_MENU: "add_menu",
};

export const mainViewTabs = [
  { id: TAB_IDS.MENU, label: "Menu", cn: "菜單" },
  { id: TAB_IDS.ARCHIVE, label: "Archive", cn: "往期" },
  { id: TAB_IDS.NOTES, label: "Notes", cn: "筆記" },
  { id: TAB_IDS.REQUESTS, label: "Requests", cn: "心願" },
];
