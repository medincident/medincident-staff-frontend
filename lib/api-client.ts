import axios from "axios";
import { getSession, signOut } from "next-auth/react";

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1",
});

apiClient.interceptors.request.use(async (config) => {
  const session = await getSession();

  if (session && (session as any).accessToken) {
    config.headers.Authorization = `Bearer ${(session as any).accessToken}`;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      signOut({ callbackUrl: window.location.pathname });
    }

    if (error.response?.status === 403) {
      console.error("Нет прав для выполнения операции");
    }

    return Promise.reject(error);
  },
);
