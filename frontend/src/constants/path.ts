export const PATH = {
  HOME: "/",
  LOGIN: "/login",
  SIGNUP: "/signup",
  DASHBOARD: "/dashboard",
} as const;

export type AppPath = typeof PATH[keyof typeof PATH];
