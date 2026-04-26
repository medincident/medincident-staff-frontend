"use client";

import { useEffect, ReactNode } from "react";
import { useSession, signOut } from "next-auth/react";
import axios from "axios";
import { OpenAPI } from "@/lib/api";

export function ApiProvider({ children }: { children: ReactNode }) {
  const { data: session } = useSession();

  useEffect(() => {
    OpenAPI.BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

    if (session) {
      OpenAPI.TOKEN = (session as any).accessToken || "";
    } else {
      OpenAPI.TOKEN = undefined;
    }

    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          signOut({ callbackUrl: window.location.pathname });
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