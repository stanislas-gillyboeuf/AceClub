import { Hono } from "hono";
import type { HonoContext } from "../../types/hono";
import { requireAuth } from "../../middleware/auth";
import { zValidator } from "@hono/zod-validator";
import { uploadUserImageValidator, uploadOrgLogoValidator } from "./validators";
import { getUserImageUploadUrl, getOrgLogoUploadUrl } from "./mutations";

export const uploadRouter = new Hono<HonoContext>();

uploadRouter.use("/*", requireAuth);

uploadRouter.post(
  "/user-image",
  zValidator("json", uploadUserImageValidator),
  getUserImageUploadUrl,
);

uploadRouter.post(
  "/organization-logo",
  zValidator("json", uploadOrgLogoValidator),
  getOrgLogoUploadUrl,
);
