import { useEffect, useRef } from "react";
import { authClient } from "@/lib/auth-client";
import { setAuthToken } from "@/lib/api";

interface SessionWithToken {
  session?: { token?: string };
}

export function AuthTokenSync() {
  const { data: session } = authClient.useSession();
  const prevTokenRef = useRef<string | null>(null);

  useEffect(() => {
    const token =
      (session as SessionWithToken | null | undefined)?.session?.token ?? null;

    if (token !== prevTokenRef.current) {
      prevTokenRef.current = token;
      setAuthToken(token);
    }
  }, [session]);

  return null;
}
