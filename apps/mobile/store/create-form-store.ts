import { create, type StoreApi, type UseBoundStore } from "zustand";

export type FormState<T extends object> = T & {
  patch: (partial: Partial<T>) => void;
  reset: () => void;
};

export function createFormStore<T extends object>(
  initial: T | (() => T)
): UseBoundStore<StoreApi<FormState<T>>> {
  const getInitial = (): T =>
    typeof initial === "function" ? (initial as () => T)() : { ...(initial as T) };

  return create<FormState<T>>((set) => ({
    ...getInitial(),
    patch: (partial) => set(partial as Partial<FormState<T>>),
    reset: () => set(getInitial() as Partial<FormState<T>>),
  }));
}
