import { http, tokenStore } from "./http";
import type {
  LoginInput,
  RegisterInput,
  Tokens,
  User,
  RegisterResponse,
  LoginResponse,
  UserResponse,
} from "@/types";

export const authApi = {
  /**
   * Login with email and password
   * Stores access token in memory and refresh token in localStorage
   */
  async login(input: LoginInput): Promise<Tokens> {
    const { data } = await http.post<LoginResponse>("/auth/login", input);
    const tokens: Tokens = data.data;
    // Store tokens
    tokenStore.setAccess(tokens.accessToken);
    tokenStore.setRefresh(tokens.refreshToken);
    return tokens;
  },

  /**
   * Register a new user
   */
  async register(input: RegisterInput): Promise<RegisterResponse> {
    const { data } = await http.post<RegisterResponse>("/auth/register", input);
    return data;
  },

  /**
   * Logout - clears tokens and calls backend to invalidate refresh token
   */
  async logout(): Promise<void> {
    try {
      await http.post("/auth/logout");
    } catch (error) {
      // Even if logout fails on backend, clear tokens on client
      console.error("Logout error:", error);
    } finally {
      // Always clear tokens on client side
      tokenStore.clearAll();
    }
  },

  /**
   * Get current user information
   * Requires valid access token
   */
  async me(): Promise<User> {
    const { data } = await http.get<UserResponse>("/user/me");
    return data.data;
  },
};
