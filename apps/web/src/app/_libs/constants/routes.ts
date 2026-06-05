/**
 * This file contains all the routes that are used in the application.
 */

/**
 * @description Routes
 * @returns {Record<string, string>} Routes
 */
export const ROUTES = {
  AUTH: {
    LOGIN: "/login",
    RESET_PASSWORD: "/reset-password",
  },
  APP: {
    DASHBOARD: "/dashboard",
  },
} as const;
