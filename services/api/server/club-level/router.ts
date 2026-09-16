import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import type { HonoContext } from "../../types/hono";
import { requireAuth } from "../../middleware/auth";
import { listCategories } from "./queries";
import { createCategory, deleteCategory, setMemberLevel } from "./mutations";
import {
  listCategoriesValidator,
  createCategoryValidator,
  deleteCategoryValidator,
  setMemberLevelValidator,
} from "./validators";

export const clubLevelRouter = new Hono<HonoContext>();

clubLevelRouter.use("/*", requireAuth);

clubLevelRouter.get("/list-categories", zValidator("query", listCategoriesValidator), listCategories);
clubLevelRouter.post(
  "/create-category",
  zValidator("json", createCategoryValidator),
  createCategory,
);
clubLevelRouter.post(
  "/delete-category",
  zValidator("json", deleteCategoryValidator),
  deleteCategory,
);
clubLevelRouter.post(
  "/set-member-level",
  zValidator("json", setMemberLevelValidator),
  setMemberLevel,
);
