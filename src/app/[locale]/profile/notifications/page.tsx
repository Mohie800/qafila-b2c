"use client";

import { useTranslations, useLocale } from "next-intl";
import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import {
  getMyNotifications,
  markAsRead,
  type PushNotification,
} from "@/lib/api/notifications";

export default function NotificationsPage() {
  const t = useTranslations("notifications");
  const locale = useLocale();

  const [notifications, setNotifications] = useState<PushNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [markingRead, setMarkingRead] = useState(false);

  const hasUnread = notifications.some((n) => !n.isRead);

  useEffect(() => {
    const fetchNotifications = async () => {
      setLoading(true);
      try {
        const res = await getMyNotifications({ page, limit: 10 });
        setNotifications(res.data);
        setTotalPages(res.meta.totalPages);
      } catch {
        setNotifications([]);
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, [page]);

  const handleMarkAllRead = async () => {
    setMarkingRead(true);
    try {
      await markAsRead();
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, isRead: true, readAt: new Date().toISOString() })),
      );
    } catch {
      // silent fail
    } finally {
      setMarkingRead(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(locale === "ar" ? "ar-SA" : "en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getTitle = (n: PushNotification) =>
    locale === "ar" && n.titleAr ? n.titleAr : n.title;

  const getMessage = (n: PushNotification) =>
    locale === "ar" && n.messageAr ? n.messageAr : n.message;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-dark">{t("title")}</h1>
          <p className="mt-1 text-sm text-gray-text">{t("subtitle")}</p>
        </div>
        {hasUnread && !loading && (
          <button
            onClick={handleMarkAllRead}
            disabled={markingRead}
            className="rounded-full border border-primary px-4 py-2 text-xs font-semibold text-primary transition-colors hover:bg-primary/5 disabled:opacity-50"
          >
            {markingRead ? "..." : t("markAllRead")}
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-3 border-gray-border border-t-primary" />
        </div>
      ) : notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Bell size={48} className="mb-4 text-gray-border" />
          <h2 className="mb-2 text-lg font-semibold text-dark">
            {t("empty")}
          </h2>
          <p className="max-w-sm text-sm text-gray-text">
            {t("emptyDescription")}
          </p>
        </div>
      ) : (
        <>
          <div className="overflow-hidden rounded-xl border border-gray-border bg-[#FFFBF5]">
            <div className="divide-y divide-gray-border">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className={`flex items-start gap-3 px-4 py-4 ${
                    !n.isRead ? "bg-primary/[0.03]" : ""
                  }`}
                >
                  {/* Unread dot */}
                  <div className="mt-1.5 shrink-0">
                    {!n.isRead ? (
                      <div className="h-2.5 w-2.5 rounded-full bg-primary" />
                    ) : (
                      <div className="h-2.5 w-2.5" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-dark">
                      {getTitle(n)}
                    </p>
                    <p className="mt-0.5 text-sm text-gray-text line-clamp-2">
                      {getMessage(n)}
                    </p>
                  </div>

                  {/* Date */}
                  <span className="shrink-0 text-xs text-gray-text whitespace-nowrap">
                    {formatDate(n.createdAt)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="rounded-lg border border-gray-border px-4 py-2 text-sm font-medium text-dark transition-colors hover:bg-gray-50 disabled:opacity-40"
              >
                &lsaquo;
              </button>
              <span className="text-sm text-gray-text">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="rounded-lg border border-gray-border px-4 py-2 text-sm font-medium text-dark transition-colors hover:bg-gray-50 disabled:opacity-40"
              >
                &rsaquo;
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
