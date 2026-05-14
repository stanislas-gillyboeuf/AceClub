import { schedules } from "@trigger.dev/sdk";

const TASK_ID = "send-scheduled-notification";

export async function createTriggerSchedule(params: {
  scheduleId: string;
  cron: string;
  timezone: string;
  isActive: boolean;
}): Promise<string> {
  const created = await schedules.create({
    task: TASK_ID,
    cron: params.cron,
    timezone: params.timezone,
    externalId: params.scheduleId,
    deduplicationKey: params.scheduleId,
  });
  if (!params.isActive) {
    await schedules.deactivate(created.id);
  }
  return created.id;
}

export async function updateTriggerSchedule(params: {
  triggerScheduleId: string;
  scheduleId: string;
  cron: string;
  timezone: string;
  isActive: boolean;
}): Promise<void> {
  await schedules.update(params.triggerScheduleId, {
    task: TASK_ID,
    cron: params.cron,
    timezone: params.timezone,
    externalId: params.scheduleId,
  });
  if (params.isActive) {
    await schedules.activate(params.triggerScheduleId);
  } else {
    await schedules.deactivate(params.triggerScheduleId);
  }
}

export async function deleteTriggerSchedule(triggerScheduleId: string): Promise<void> {
  await schedules.del(triggerScheduleId);
}
