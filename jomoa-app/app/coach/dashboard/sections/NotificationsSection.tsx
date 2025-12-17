/**
 * Notifications section for Coach Dashboard
 */

import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent, Chip } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Bell, CheckCircle2, AlertTriangle, MessageSquare } from "lucide-react";
import { DASHBOARD_COPY } from "../copy";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  link?: string | null;
}

interface NotificationsSectionProps {
  notifications: Notification[];
  unreadCount: number;
}

export function NotificationsSection({
  notifications,
  unreadCount,
}: NotificationsSectionProps) {
  const router = useRouter();

  if (!notifications || notifications.length === 0) {
    return null;
  }

  const getIcon = (type: string) => {
    switch (type) {
      case "client_workout_logged":
      case "session_logged":
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case "readiness_missing":
        return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      case "coach_comment":
        return <MessageSquare className="h-4 w-4 text-blue-600" />;
      default:
        return <Bell className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-[#5A6B5D]/70" />
            <CardTitle>{DASHBOARD_COPY.notifications.title}</CardTitle>
            {unreadCount > 0 && (
              <Chip variant="default" className="text-xs px-2 py-0.5">
                {DASHBOARD_COPY.notifications.unread(unreadCount)}
              </Chip>
            )}
          </div>
          <Button
            variant="link"
            onClick={() => router.push("/coach/notifications")}
            className="text-xs text-[#8B6F47] hover:text-[#7A5F3D]"
          >
            {DASHBOARD_COPY.notifications.viewAll}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {notifications.slice(0, 5).map((notification) => (
            <div
              key={notification.id}
              onClick={() => {
                if (notification.link) {
                  router.push(notification.link);
                }
              }}
              className={`flex items-start gap-3 p-3 rounded-card border border-[rgba(232,229,224,0.4)] ${
                notification.link ? "cursor-pointer hover:bg-[#FEFCF8]/80" : ""
              } ${!notification.is_read ? "bg-[#FEFCF8]" : "bg-[#FEFCF8]/50"}`}
            >
              <div className="flex-shrink-0 mt-1">{getIcon(notification.type)}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[#5A6B5D] truncate">
                  {notification.title}
                </p>
                <p className="text-xs text-[#5A6B5D]/70 mt-1 line-clamp-2">
                  {notification.message}
                </p>
                <p className="text-xs text-[#5A6B5D]/60 mt-2">
                  {new Date(notification.created_at).toLocaleDateString("sv-SE", {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
              {!notification.is_read && (
                <div className="flex-shrink-0 w-2 h-2 rounded-full bg-[#8B6F47] mt-2" />
              )}
            </div>
          ))}
        </div>
        {notifications.length > 5 && (
          <div className="mt-4 pt-4 border-t border-[rgba(232,229,224,0.4)]">
            <Button
              variant="link"
              onClick={() => router.push("/coach/notifications")}
              className="w-full text-sm text-[#8B6F47] hover:text-[#7A5F3D]"
            >
              {DASHBOARD_COPY.notifications.viewAllCount(notifications.length)}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

