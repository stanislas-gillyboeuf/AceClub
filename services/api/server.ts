import { serve } from "@hono/node-server";
import app from "./index";
import { initializeWebSocketServer } from "./server/ws/chat-handler";

const port = Number(process.env.PORT) || 3000;

const server = serve({
  fetch: app.fetch,
  port,
});

initializeWebSocketServer(server);