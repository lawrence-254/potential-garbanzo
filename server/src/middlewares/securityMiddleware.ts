import helmet from "helmet";
import rateLimit from "express-rate-limit";
import type { RequestHandler } from "express";

/**
 * Security-related HTTP headers.
 */
export const securityHeaders: RequestHandler = helmet({
  crossOriginResourcePolicy: {
    policy: "cross-origin",
  },
});

/**
 * General API rate limiter.
 *
 * This protects the API from accidental or malicious
 * request floods while still allowing normal application use.
 */
export const apiRateLimiter: RequestHandler = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,

  standardHeaders: "draft-8",
  legacyHeaders: false,

  message: {
    success: false,
    message: "Too many requests. Please try again later.",
  },
});

/**
 * Stricter limiter for authentication endpoints.
 *
 * Login/register/password-related endpoints should have
 * a lower limit than normal API requests.
 */
export const authRateLimiter: RequestHandler = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,

  standardHeaders: "draft-8",
  legacyHeaders: false,

  message: {
    success: false,
    message: "Too many authentication attempts. Please try again later.",
  },
});
