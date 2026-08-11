export class BookingConflictError extends Error {
  constructor() {
    super("Ce créneau vient d'être réservé");
    this.name = "BookingConflictError";
  }
}
