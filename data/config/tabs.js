/**
 * Tab configuration for the main dashboard (Menu, Archive, Notes).
 * MainView and TabBar use this so tab ids and labels live in one place.
 */

export const TAB_IDS = {
  MENU: "menu",
  ARCHIVE: "archive",
  NOTES: "notes",
  ADD_MENU: "add_menu",
};

export const mainViewTabs = [
  { id: TAB_IDS.MENU, label: "Menu", cn: "菜單" },
  { id: TAB_IDS.ARCHIVE, label: "Archive", cn: "往期" },
  { id: TAB_IDS.NOTES, label: "Notes", cn: "筆記" },
];
