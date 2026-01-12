import { cors } from "hono/cors";
import type { Context } from "hono";

const getCorsOrigin = (): string | string[] | ((origin: string) => boolean) => {
  const corsOrigin = process.env.CORS_ORIGIN;

  if (corsOrigin === "*") {
    return "*";
  }

  if (corsOrigin) {
    return corsOrigin;
  }

  return (origin: string) => {
    if (!origin) {
      return true;
    }

    // Allow iOS app custom scheme
    if (origin === "apply://" || origin.startsWith("apply://")) {
      return true;
    }

    if (
      origin.startsWith("http://localhost:") ||
      origin.startsWith("http://127.0.0.1:")
    ) {
      return true;
    }

    const localIPPattern =
      /^https?:\/\/(192\.168\.|10\.|172\.(1[6-9]|2[0-9]|3[01])\.)/;
    if (localIPPattern.test(origin)) {
      return true;
    }

    return false;
  };
};

export const corsMiddleware = cors({
  origin: (origin: string, c: Context) => {
    const corsConfig = getCorsOrigin();

    if (corsConfig === "*") {
      return "*";
    }

    if (typeof corsConfig === "string") {
      return corsConfig === origin ? origin : null;
    }

    if (Array.isArray(corsConfig)) {
      return corsConfig.includes(origin) ? origin : null;
    }

    if (typeof corsConfig === "function") {
      return corsConfig(origin) ? origin : null;
    }

    return null;
  },
  allowHeaders: ["Content-Type", "Authorization", "Cookie"],
  allowMethods: ["POST", "GET", "OPTIONS", "PUT", "DELETE"],
  exposeHeaders: ["Content-Length", "Set-Cookie"],
  maxAge: 600,
  credentials: true,
});
