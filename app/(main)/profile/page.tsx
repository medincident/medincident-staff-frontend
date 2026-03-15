import { Metadata } from "next";
import { ProfileView } from "@/app/(main)/profile/view";

export const metadata: Metadata = {
  title: "Профиль пользователя",
  description: "Управление аккаунтом и настройки",
};

export default function ProfilePage() {
  return <ProfileView />;
}