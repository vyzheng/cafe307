/**
 * Helpers for menu data. Used by ArchiveTab to build one-line summaries.
 */

/**
 * Returns a single line of all dish names in Chinese for a menu, joined by " · ".
 * @param {{ courses: Array<{ items: Array<{ cn: string }> }> }} menu - Menu object with courses and items
 * @returns {string}
 */
export function getMenuSummary(menu) {
  return menu.courses.flatMap((c) => c.items).map((item) => item.cn).join(" · ");
}
