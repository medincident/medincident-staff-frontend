export type RequestStatus =
  | "created"
  | "in_work"
  | "purchase"
  | "completed"
  | "refused"
  | "cancelled";

export type Priority = "normal" | "high" | "critical";

export type EventStatus =
  | "created"
  | "in_work"
  | "investigation"
  | "measures"
  | "completed"
  | "closed"
  | "cancelled";

export type NotificationType = "info" | "success" | "warning" | "error";

export interface Notification {
  id: number;
  title: string;
  desc: string;
  time: string;
  type: NotificationType;
  date: string;
  read: boolean;
  userId?: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface UserSettings {
  emailNotification: boolean;
  quietMode: {
    enabled: boolean;
    from: string;
    to: string;
    days: number[];
  };
}
