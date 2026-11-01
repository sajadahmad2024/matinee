
export const ADMIN_ROUTES = {
  DASHBOARD: "/dashboard",
  CONTENT: "/content",
  GAMES: "/games",
  REWARDS: "/rewards",
  USERS: "/users",
  ADS: "/ads",
  SUBSCRIPTIONS: "/subscriptions",
  MODERATION: "/moderation",
  REPORTS: "/reports",
  SETTINGS: "/settings",
  PROFILE: "/profile",
} as const;

export const AUTH_ROUTES = {
  LOGIN: "/login",
  RESET_PASSWORD: "/reset-password",
} as const;

export type AdminRoute = (typeof ADMIN_ROUTES)[keyof typeof ADMIN_ROUTES];
export type AuthRoute = (typeof AUTH_ROUTES)[keyof typeof AUTH_ROUTES];
export type AppRoute = AdminRoute | AuthRoute;

export default ADMIN_ROUTES;
