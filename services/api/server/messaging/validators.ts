import { z } from "zod";

const segmentEnum = z.enum(["all", "unpaid_dues", "inactive_30d"]);
const channelEnum = z.enum(["email", "push", "both"]);

export const previewSegmentValidator = z.object({
  organizationId: z.string().min(1, "Organization ID is required"),
  segment: segmentEnum,
});

export const listBroadcastsValidator = z.object({
  organizationId: z.string().min(1, "Organization ID is required"),
  limit: z.coerce.number().min(1).max(100).optional().default(20),
  offset: z.coerce.number().min(0).optional().default(0),
});

export const sendBroadcastValidator = z.object({
  organizationId: z.string().min(1, "Organization ID is required"),
  subject: z.string().min(1, "Subject is required").max(200),
  body: z.string().min(1, "Body is required").max(5000),
  channel: channelEnum,
  segment: segmentEnum,
});
