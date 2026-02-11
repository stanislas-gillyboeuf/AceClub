import ky from "ky";
import { storage } from "@/lib/storage";

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000/api";

export const apiClient = ky.create({
  prefixUrl: API_URL,
  timeout: 30000,
  hooks: {
    beforeRequest: [
      async (request) => {
        const token = await storage.getToken();
        if (token) {
          request.headers.set("Authorization", `Bearer ${token}`);
        }
      },
    ],
    afterResponse: [
      async (_request, _options, response) => {
        if (response.status === 401) {
          await storage.clear();
        }
      },
    ],
  },
});
