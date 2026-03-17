import axios from "axios";
import { getSession, signOut } from "next-auth/react";
import { OpenAPI } from "./api";

OpenAPI.BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

OpenAPI.TOKEN = async () => {
  const session = await getSession();
  return (session as any)?.accessToken || "";
};

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      signOut({ callbackUrl: window.location.pathname });
    }
    return Promise.reject(error);
  },
);

export const apiClient = axios;
