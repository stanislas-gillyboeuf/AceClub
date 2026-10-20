export class DemoBookingConflictError extends Error {
  constructor() {
    super("Ce créneau vient d'être réservé");
    this.name = "DemoBookingConflictError";
  }
}
