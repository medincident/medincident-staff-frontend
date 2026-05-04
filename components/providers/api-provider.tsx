"use client";

import { useEffect, ReactNode } from "react";
import { useSession, signOut, getSession } from "next-auth/react";
import axios from "axios";
import type { AxiosRequestConfig } from "axios";
import { OpenAPI } from "@/lib/api-generated";

export function ApiProvider({ children }: { children: ReactNode }) {
  const { data: session } = useSession();

  useEffect(() => {
    OpenAPI.BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";
    OpenAPI.WITH_CREDENTIALS = true;

    // Always resolve token from the latest NextAuth session so refreshed
    // access tokens are picked up even after the app is already mounted.
    OpenAPI.TOKEN = async () => {
      const latestSession = await getSession();
      return ((latestSession as any)?.accessToken as string | undefined) || "";
    };

    const interceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config as
          | (AxiosRequestConfig & { _retry?: boolean })
          | undefined;

        if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
          originalRequest._retry = true;

          const refreshedSession = await getSession();
          const refreshedToken = (refreshedSession as any)?.accessToken as string | undefined;

          if (refreshedToken) {
            originalRequest.headers = {
              ...(originalRequest.headers || {}),
              Authorization: `Bearer ${refreshedToken}`,
            };
            return axios.request(originalRequest);
          }

          await signOut({ callbackUrl: window.location.pathname });
        } else if (error.response?.status === 401) {
          await signOut({ callbackUrl: window.location.pathname });
        }

        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, [session]);

  return <>{children}</>;
}