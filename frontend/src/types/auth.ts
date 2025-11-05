/**
 * Authentication-related TypeScript types
 */

/**
 * Login input data
 */
export interface LoginInput {
  email: string;
  password: string;
}

/**
 * Register input data
 */
export interface RegisterInput {
  email: string;
  password: string;
}

/**
 * JWT tokens response
 */
export interface Tokens {
  accessToken: string;
  refreshToken: string;
}

/**
 * User data structure
 */
export interface User {
  _id: string;
  email: string;
  createdAt: string;
}

/**
 * Register response from API
 */
export interface RegisterResponse {
  statusCode: number;
  message: string;
  data: {
    _id: string;
    email: string;
    createdAt: string;
  };
}

/**
 * API response wrapper
 */
export interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
}

/**
 * Login response
 */
export type LoginResponse = ApiResponse<Tokens>;

/**
 * User response
 */
export type UserResponse = ApiResponse<User>;

