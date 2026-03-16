/**
 * VIP / guest reviews — independent of menus.
 * Reviews are linked to menus by menuDate (e.g. "March 12, 2026"); use
 * getVipReview(menuDate) to fetch the review for a given menu date. If
 * you add a new menu, add a matching entry here if you want a guest
 * review on the Notes tab.
 */

/*
  vipReviews — An array of objects. Each has menuDate (a string that matches a menu's date) and review (the guest's text).
  Same idea as chefsNotes: we look up by date so the Notes tab can show the review for the current menu.
  A list of date-plus-review pairs; we find the review by matching the menu's date.
*/
const vipReviews = [
  {
    menuDate: "March 12, 2026",
    review: "top performer. definitely exceeded my expectations.",
  },
];

/**
 * getVipReview(menuDate) — We find the entry in vipReviews whose menuDate equals the argument.
 * If we find one we return entry.review; otherwise null.
 * MainView calls getVipReview(currentMenu.date) and displays the result in quotes (or "—" if null).
 * Give me the guest review for this menu date, or null if there isn't one.
 * @param {string} menuDate - Menu date string (e.g. "March 12, 2026")
 * @returns {string|null} The review, or null if none found
 */
export function getVipReview(menuDate) {
  const entry = vipReviews.find((r) => r.menuDate === menuDate);
  return entry ? entry.review : null;
}

export default vipReviews;
