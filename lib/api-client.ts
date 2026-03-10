import axios from "axios";

export const apiClient = axios.create({
  // baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Если прилетел 401 (токен протух окончательно и не обновился)
    if (error.response?.status === 401) {
      // Отправляем пользователя на стандартный роут NextAuth
      window.location.href =
        "/api/auth/signin?callbackUrl=" +
        encodeURIComponent(window.location.pathname);
    }

    return Promise.reject(error);
  }
);