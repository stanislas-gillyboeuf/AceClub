import { Hono } from "hono";
import type { HonoContext } from "../../types/hono";
import { zValidator } from "@hono/zod-validator";
import { requireAuth } from "../../middleware/auth";
import { uploadKeysValidator, uploadKeyBackupValidator } from "./validators";
import { getPublicKey, getKeyBackup } from "./queries";
import { uploadKeys, uploadKeyBackup } from "./mutations";

export const e2eeRouter = new Hono<HonoContext>();

e2eeRouter.use("/*", requireAuth);

// Get another user's public key
e2eeRouter.get("/public-key/:userId", getPublicKey);

// Get own key backup
e2eeRouter.get("/key-backup", getKeyBackup);

// Upload public key (upsert)
e2eeRouter.post("/keys", zValidator("json", uploadKeysValidator), uploadKeys);

// Upload encrypted private key backup
e2eeRouter.post("/key-backup", zValidator("json", uploadKeyBackupValidator), uploadKeyBackup);
