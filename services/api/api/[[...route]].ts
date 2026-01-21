import { handle } from "@hono/node-server/vercel";
import app from "../index";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default handle(app);
