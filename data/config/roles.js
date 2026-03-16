/**
 * Role-based permission checks. Centralizes all "who can do what" logic
 * so role strings aren't scattered across components.
 */

export const canEditChef = (code) => code === "vivian";
export const canEditReview = (code) => code === "vlad";
export const canAddMenu = (code) => code === "vivian";
export const canEditMenu = (code) => code === "vivian";
