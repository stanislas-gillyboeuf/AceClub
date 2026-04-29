export interface AppUserExtras {
  onboardingCompleted?: boolean;
  isGhost?: boolean;
}

export type AppUser<TBase extends object = object> = TBase & AppUserExtras;
