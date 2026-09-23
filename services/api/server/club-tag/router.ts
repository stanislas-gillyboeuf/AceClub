import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import type { HonoContext } from "../../types/hono";
import { requireAuth } from "../../middleware/auth";
import { listTags } from "./queries";
import { createTag, deleteTag } from "./mutations";
import { listTagsValidator, createTagValidator, deleteTagValidator } from "./validators";

export const clubTagRouter = new Hono<HonoContext>();

clubTagRouter.use("/*", requireAuth);

clubTagRouter.get("/list-tags", zValidator("query", listTagsValidator), listTags);
clubTagRouter.post("/create-tag", zValidator("json", createTagValidator), createTag);
clubTagRouter.post("/delete-tag", zValidator("json", deleteTagValidator), deleteTag);
