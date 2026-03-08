import { create } from "zustand";
import type { Organization } from "@/types/organization";
import type { EventVisibility, EventStatus } from "@/types/event";

interface CreateEventFormState {
  name: string;
  description: string;
  coverImageUri: string | null;
  startDate: Date;
  endDate: Date;
  organization: Organization | null;
  organizationId: string | null;
  address: string;
  locationLatitude: number | null;
  locationLongitude: number | null;
  maxParticipants: number | null;
  visibility: EventVisibility;
  status: EventStatus;
  isFree: boolean;
  price: string;
  paymentLink: string;

  setStatus: (status: EventStatus) => void;
  setName: (name: string) => void;
  setDescription: (description: string) => void;
  setCoverImageUri: (uri: string | null) => void;
  setStartDate: (date: Date) => void;
  setEndDate: (date: Date) => void;
  setOrganization: (org: Organization | null) => void;
  setLocation: (location: { address: string; latitude: number | null; longitude: number | null }) => void;
  setMaxParticipants: (max: number | null) => void;
  setVisibility: (visibility: EventVisibility) => void;
  setIsFree: (isFree: boolean) => void;
  setPrice: (price: string) => void;
  setPaymentLink: (link: string) => void;
  reset: () => void;
}

const defaultStartDate = () => {
  const d = new Date();
  d.setHours(d.getHours() + 2, 0, 0, 0);
  return d;
};

const defaultEndDate = () => {
  const d = new Date();
  d.setHours(d.getHours() + 4, 0, 0, 0);
  return d;
};

export const useCreateEventFormStore = create<CreateEventFormState>((set) => ({
  name: "",
  description: "",
  coverImageUri: null,
  startDate: defaultStartDate(),
  endDate: defaultEndDate(),
  organization: null,
  organizationId: null,
  address: "",
  locationLatitude: null,
  locationLongitude: null,
  maxParticipants: null,
  visibility: "public",
  status: "draft",
  isFree: true,
  price: "",
  paymentLink: "",

  setStatus: (status) => set({ status }),
  setName: (name) => set({ name }),
  setDescription: (description) => set({ description }),
  setCoverImageUri: (coverImageUri) => set({ coverImageUri }),
  setStartDate: (startDate) => set({ startDate }),
  setEndDate: (endDate) => set({ endDate }),
  setOrganization: (org) =>
    set({
      organization: org,
      organizationId: org?.id ?? null,
      address: org?.address ?? "",
      locationLatitude: org?.latitude ?? null,
      locationLongitude: org?.longitude ?? null,
    }),
  setLocation: ({ address, latitude, longitude }) =>
    set({
      address,
      locationLatitude: latitude,
      locationLongitude: longitude,
    }),
  setMaxParticipants: (maxParticipants) => set({ maxParticipants }),
  setVisibility: (visibility) => set({ visibility }),
  setIsFree: (isFree) =>
    set(isFree ? { isFree, price: "", paymentLink: "" } : { isFree }),
  setPrice: (price) => set({ price }),
  setPaymentLink: (paymentLink) => set({ paymentLink }),
  reset: () =>
    set({
      name: "",
      description: "",
      coverImageUri: null,
      startDate: defaultStartDate(),
      endDate: defaultEndDate(),
      organization: null,
      organizationId: null,
      address: "",
      locationLatitude: null,
      locationLongitude: null,
      maxParticipants: null,
      visibility: "public",
      status: "draft",
      isFree: true,
      price: "",
      paymentLink: "",
    }),
}));
