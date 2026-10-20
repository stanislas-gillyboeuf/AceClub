import {
  demoBookingSettings,
  demoAvailabilityRule,
  demoManualBlock,
  demoBooking,
  googleCalendarConnection,
} from "./schema";

export type DemoBookingSettings = typeof demoBookingSettings.$inferSelect;
export type NewDemoBookingSettings = typeof demoBookingSettings.$inferInsert;
export type DemoAvailabilityRule = typeof demoAvailabilityRule.$inferSelect;
export type NewDemoAvailabilityRule = typeof demoAvailabilityRule.$inferInsert;
export type DemoManualBlock = typeof demoManualBlock.$inferSelect;
export type NewDemoManualBlock = typeof demoManualBlock.$inferInsert;
export type DemoBooking = typeof demoBooking.$inferSelect;
export type NewDemoBooking = typeof demoBooking.$inferInsert;
export type GoogleCalendarConnection = typeof googleCalendarConnection.$inferSelect;
export type NewGoogleCalendarConnection = typeof googleCalendarConnection.$inferInsert;
