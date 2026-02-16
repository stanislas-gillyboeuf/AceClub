import { createAuthClient } from "better-auth/react";
import { expoClient } from "@better-auth/expo/client";
import {
    inferAdditionalFields,
    organizationClient,
} from "better-auth/client/plugins";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const LOCAL_URL = Platform.OS === "android"
    ? "http://10.0.2.2:3000"
    : "http://localhost:3000";
const API_URL = process.env.EXPO_PUBLIC_API_URL || LOCAL_URL;

const BEARER_TOKEN_KEY = "aceclub_bearer_token";

export const authClient = createAuthClient({
    baseURL: API_URL,
    fetchOptions: {
        onSuccess: (ctx) => {
            const authToken = ctx.response.headers.get("set-auth-token");
            if (authToken) {
                SecureStore.setItemAsync(BEARER_TOKEN_KEY, authToken);
            }
        },
    },
    plugins: [
        expoClient({
            scheme: "aceclub",
            storagePrefix: "aceclub",
            storage: SecureStore,
        }),
        organizationClient(),
        inferAdditionalFields({
            user: {
                onboardingCompleted: {
                    type: "boolean",
                    required: false,
                },
                isGhost: {
                    type: "boolean",
                    required: false,
                },
            },
        }),
    ],
});
