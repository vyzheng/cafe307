/**
 * Login page configuration.
 * Valid codes are checked case-insensitively and trimmed;
 * ERROR_DISPLAY_MS controls how long the error message stays visible.
 */

/* The list of reservation codes we accept; the input is lowercased and trimmed before we check. */
export const VALID_LOGIN_CODES = ["vlad", "mushu","caramel", "vivian", "gelato", "tangyuan"];

/* How long the error message stays on screen before it disappears. */
export const ERROR_DISPLAY_MS = 3000;

/* Title, subtitle, label, placeholder, button, error, footer, and icon for the login card. */
export const LOGIN_COPY = {
  icon: "⛩️",
  title: "Cafe 307",
  subtitle: "木曜日の晩ごはん",
  inputLabel: "Alohomora🪄✨",
  placeholder: "···",
  buttonLabel: "Enter",
  errorMessage: "No reservation found.",
  footer: "Private dining · Sawtelle",
};
