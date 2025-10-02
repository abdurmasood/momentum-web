/**
 * Application route constants
 * 
 * Centralized route definitions for the marketing site.
 * Dashboard routes are handled by the separate momentum-app.
 */

/**
 * Public routes - accessible without authentication
 */
export const PUBLIC_ROUTES = {
  HOME: "/",
  LANDING: "/",
} as const;

/**
 * Authentication routes
 */
export const AUTH_ROUTES = {
  LOGIN: "/login",
  SIGNUP: "/signup",
} as const;

/**
 * API routes - for internal API calls
 */
export const API_ROUTES = {
  BASE: "/api",
  AUTH: "/api/auth",
} as const;

/**
 * All routes combined for easy access
 */
export const ROUTES = {
  ...PUBLIC_ROUTES,
  AUTH: AUTH_ROUTES,
  API: API_ROUTES,
} as const;

/**
 * Route validation helpers
 */
export const isAuthRoute = (path: string): boolean => {
  return Object.values(AUTH_ROUTES).includes(path as AuthRoute);
};

export const isPublicRoute = (path: string): boolean => {
  return Object.values(PUBLIC_ROUTES).includes(path as PublicRoute);
};

/**
 * Default redirect routes
 */
export const REDIRECT_ROUTES = {
  AFTER_SIGN_OUT: PUBLIC_ROUTES.HOME,
  UNAUTHORIZED: PUBLIC_ROUTES.HOME,
} as const;

/**
 * Type definitions for type-safe routing
 */
export type PublicRoute = typeof PUBLIC_ROUTES[keyof typeof PUBLIC_ROUTES];
export type AuthRoute = typeof AUTH_ROUTES[keyof typeof AUTH_ROUTES];
export type ApiRoute = typeof API_ROUTES[keyof typeof API_ROUTES];
export type AnyRoute = PublicRoute | AuthRoute | ApiRoute;
