import { Hono } from "hono";
import type { HonoContext } from "../../types/hono";
import { requireAuth } from "../../middleware/auth";
import { uploadUserImage, uploadOrgLogo } from "./mutations";

export const uploadRouter = new Hono<HonoContext>();

uploadRouter.use("/*", requireAuth);

uploadRouter.post("/user-image", uploadUserImage);

uploadRouter.post("/organization-logo", uploadOrgLogo);
