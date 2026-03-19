/**
 * Role-based permission checks. Centralizes all "who can do what" logic
 * so role strings aren't scattered across components.
 *
 * Each function takes the user's reservation code and returns true if they
 * have the corresponding permission. Components import these instead of
 * hard-coding role strings, so changing who can do what only requires
 * editing this file.
 */

/* Can edit the chef's notes section (only the chef herself) */
export const canEditChef = (code) => code === "vivian";

/* Can write / edit the tasting review (only the reviewer) */
export const canEditReview = (code) => code === "vlad";

/* Can create a new menu via the Add Menu tab */
export const canAddMenu = (code) => code === "vivian";

/* Can edit an existing menu (change dishes, dates, labels) */
export const canEditMenu = (code) => code === "vivian";
