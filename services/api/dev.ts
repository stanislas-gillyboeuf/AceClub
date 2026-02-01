import { serve } from "@hono/node-server";
import app from "./index";
import { initializeWebSocketServer } from "./server/ws/chat-handler";

const port = Number(process.env.PORT) || 3000;

console.log(`Starting development server on port ${port}...`);

const server = serve({
  fetch: app.fetch,
  port,
});

initializeWebSocketServer(server);

console.log(`Server running at http://localhost:${port}`);
console.log(`WebSocket available at ws://localhost:${port}/ws/chat`);
