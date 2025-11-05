export const ENDPOINT = {
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    REFRESH: "/auth/refresh",
    LOGOUT: "/auth/logout",
  },
  USER: {
    ME: "/user/me",
  },
} as const;

export type AuthEndpoint = typeof ENDPOINT.AUTH[keyof typeof ENDPOINT.AUTH];
export type UserEndpoint = typeof ENDPOINT.USER[keyof typeof ENDPOINT.USER];
