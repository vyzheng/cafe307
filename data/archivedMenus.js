/**
 * Past menus displayed in the Archive tab.
 * MainView builds the archive list as [currentMenu, ...archivedMenus], so
 * the first row is always the featured menu and the rest come from this
 * array; add new menu objects here as they become past.
 */

/*
  archivedMenus — An array of menu objects. Right now it's empty.
  Each object should have the same shape as currentMenu (date, lunarDate, label, courses).
  MainView does allMenusForArchive = [currentMenu, ...archivedMenus], so the Archive tab shows the featured menu first, then every item in this array.
  When you have a past dinner, add an object here.
  The list of past menus; the Archive tab shows the featured menu plus everything in this array.
*/
const archivedMenus = [
  // Example when you have past menus:
  // {
  //   date: "March 5, 2026",
  //   lunarDate: "正月十七",
  //   label: "Previous Dinner",
  //   courses: [...],
  // },
];

/*
  export default archivedMenus — We export the array so MainView can import it and spread it into the archive list.
  This file's only export is the array of past menus.
*/
export default archivedMenus;
