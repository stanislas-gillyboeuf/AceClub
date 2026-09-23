import { db } from "../../../db";
import { tarifGridAuditLog } from "../../../db/schema";
import type { TarifAuditActionType } from "../../../db/schema/pricing";

export async function logGridAudit(params: {
  tarifGridId: string;
  organizationId: string;
  actorUserId: string;
  action: TarifAuditActionType;
  summary?: string;
}): Promise<void> {
  await db.insert(tarifGridAuditLog).values({
    tarifGridId: params.tarifGridId,
    organizationId: params.organizationId,
    actorUserId: params.actorUserId,
    action: params.action,
    summary: params.summary ?? null,
  });
}
