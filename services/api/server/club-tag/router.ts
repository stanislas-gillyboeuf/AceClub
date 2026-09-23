import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import type { HonoContext } from "../../types/hono";
import { requireAuth } from "../../middleware/auth";
import { listTags, listMemberTags } from "./queries";
import { createTag, deleteTag, setMemberTags } from "./mutations";
import {
  listTagsValidator,
  createTagValidator,
  deleteTagValidator,
  listMemberTagsValidator,
  setMemberTagsValidator,
} from "./validators";

export const clubTagRouter = new Hono<HonoContext>();

clubTagRouter.use("/*", requireAuth);

clubTagRouter.get("/list-tags", zValidator("query", listTagsValidator), listTags);
clubTagRouter.get("/list-member-tags", zValidator("query", listMemberTagsValidator), listMemberTags);
clubTagRouter.post("/create-tag", zValidator("json", createTagValidator), createTag);
clubTagRouter.post("/delete-tag", zValidator("json", deleteTagValidator), deleteTag);
clubTagRouter.post("/set-member-tags", zValidator("json", setMemberTagsValidator), setMemberTags);
