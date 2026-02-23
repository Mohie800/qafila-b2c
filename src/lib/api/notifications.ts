import apiClient from "./client";

export interface PushNotification {
  id: string;
  notificationId: string;
  title: string;
  titleAr: string | null;
  message: string;
  messageAr: string | null;
  type: string;
  data: Record<string, string> | null;
  orderId: string | null;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
}

export interface NotificationsListResponse {
  data: PushNotification[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export async function getMyNotifications(params?: {
  page?: number;
  limit?: number;
  isRead?: boolean;
}): Promise<NotificationsListResponse> {
  return apiClient.get("/push-notifications/me", { params });
}

export async function getUnreadCount(): Promise<{ count: number }> {
  return apiClient.get("/push-notifications/me/unread-count");
}

export async function markAsRead(
  notificationIds?: string[],
): Promise<{ updated: number }> {
  return apiClient.patch("/push-notifications/me/read", { notificationIds });
}
