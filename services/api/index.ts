import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { logger } from "hono/logger";
import { cors } from "hono/cors";
import { auth } from "./auth";
import { serverRouter } from "./server/router";
import { initializeWebSocketServer } from "./server/ws/chat-handler";
import type { HonoContext } from "./types/hono";

const app = new Hono<HonoContext>();

app.use("*", logger());

app.use(
  "*",
  cors({
    origin: (origin) => {
      if (!origin) return "*";

      if (origin.includes("localhost") || origin.includes("127.0.0.1")) {
        return origin;
      }

      if (origin.startsWith("apply://")) {
        return origin;
      }

      if (/^https?:\/\/(192\.168\.|10\.|172\.(1[6-9]|2[0-9]|3[01])\.)/.test(origin)) {
        return origin;
      }


      return null;
    },
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length", "Authorization"],
    maxAge: 600,
    credentials: true,
  }),
);

app.on(["POST", "GET"], "/api/auth/*", (c) => {
  return auth.handler(c.req.raw);
});

app.get("/api/session", async (c) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });

  if (!session) {
    return c.json({ session: null, user: null }, 200);
  }

  return c.json({
    session: session.session,
    user: session.user,
  });
});

app.route("/api", serverRouter);

app.get("/", (c) => c.json({ message: "AceClub API", status: "ok" }));

app.get("/health", (c) => c.json({ status: "ok" }));

const port = Number(process.env.PORT) || 3000;

const server = serve({
  fetch: app.fetch,
  port,
});

initializeWebSocketServer(server);

export default app;
