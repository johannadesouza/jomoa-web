"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabaseClient";
import { getErrorMessage } from "@/lib/utils/normalizeSupabase";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { Bell, Check, CheckCheck } from "lucide-react";

interface Notification {
  id: string;
  profile_id: string;
  type: string;
  title: string;
  message: string;
  related_entity_type: string | null;
  related_entity_id: string | null;
  is_read: boolean;
  created_at: string;
  metadata: any;
}

export default function ClientNotifications() {
  const { user, loading: authLoading } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [markingAsRead, setMarkingAsRead] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && user) {
      fetchNotifications();
    }
  }, [user, authLoading]);

  const fetchNotifications = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from("notifications")
        .select("*")
        .eq("profile_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50);

      if (fetchError) throw fetchError;

      const normalizedNotifications: Notification[] = (data || []).map((n) => ({
        id: n.id,
        profile_id: n.profile_id,
        type: n.type,
        title: n.title,
        message: n.message,
        related_entity_type: n.related_entity_type,
        related_entity_id: n.related_entity_id,
        is_read: n.is_read,
        created_at: n.created_at,
        metadata: n.metadata || {},
        link: n.metadata?.link || null,
      }));
      setNotifications(normalizedNotifications);
      setUnreadCount(normalizedNotifications.filter((n) => !n.is_read).length);
    } catch (err) {
      console.error("Error fetching notifications:", err);
      setError(getErrorMessage(err) || "Kunde inte hämta notifikationer. Försök igen senare.");
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    if (!user?.id) return;

    setMarkingAsRead(notificationId);
    try {
      const { error: updateError } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("id", notificationId)
        .eq("profile_id", user.id);

      if (updateError) throw updateError;

      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Error marking notification as read:", err);
      // Tyst fel - det är okej om detta misslyckas
    } finally {
      setMarkingAsRead(null);
    }
  };

  const markAllAsRead = async () => {
    if (!user?.id || unreadCount === 0) return;

    try {
      const { error: updateError } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("profile_id", user.id)
        .eq("is_read", false);

      if (updateError) throw updateError;

      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error("Error marking all as read:", err);
      // Tyst fel - det är okej om detta misslyckas
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "coach_comment":
        return "💬";
      case "program_updated":
        return "📝";
      case "readiness_reminder":
        return "⏰";
      default:
        return "🔔";
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "coach_comment":
        return "bg-blue-50 border-blue-200";
      case "program_updated":
        return "bg-green-50 border-green-200";
      case "readiness_reminder":
        return "bg-amber-50 border-amber-200";
      default:
        return "bg-[#FEFCF8]/50";
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-[#5A6B5D] pb-20 md:pb-0">
        <div className="max-w-[480px] mx-auto px-5 py-8">
          <SectionHeader title="Notiscenter" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#5A6B5D] pb-20 md:pb-0">
        <div className="max-w-[480px] mx-auto px-5 py-8">
          <SectionHeader title="Notiscenter" />
          <Card className="border-red-200 bg-red-50/50">
            <CardContent>
              <p className="text-sm text-red-600">{error}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const unreadNotifications = notifications.filter((n) => !n.is_read);
  const readNotifications = notifications.filter((n) => n.is_read);

  return (
    <div className="min-h-screen bg-[#5A6B5D] pb-20 md:pb-0">
      <div className="max-w-[480px] mx-auto px-5 py-8 space-y-6">
        <SectionHeader
          title="Notiscenter"
          subtitle="Dina notifikationer och uppdateringar"
          actions={
            unreadCount > 0 ? (
              <Button variant="outline" onClick={markAllAsRead} size="sm">
                <CheckCheck className="h-4 w-4 mr-2" />
                Markera alla som lästa
              </Button>
            ) : undefined
          }
        />

        {notifications.length === 0 ? (
          <EmptyState
            title="Inga notifikationer ännu"
            description="När din coach kommenterar eller uppdaterar något kommer du att få notifikationer här."
          />
        ) : (
          <div className="space-y-4">
            {/* Unread Notifications */}
            {unreadNotifications.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-sm font-medium text-[#FEFCF8] flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  Olästa ({unreadNotifications.length})
                </h2>
                {unreadNotifications.map((notification) => (
                  <Card
                    key={notification.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${getNotificationColor(
                      notification.type
                    )}`}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <CardContent className="pt-4">
                      <div className="flex items-start gap-3">
                        <div className="text-2xl flex-shrink-0">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <h3 className="text-sm font-semibold text-[#5A6B5D] mb-1">
                                {notification.title}
                              </h3>
                              <p className="text-sm text-[#5A6B5D]/70 leading-relaxed">
                                {notification.message}
                              </p>
                              <p className="text-xs text-[#5A6B5D]/60 mt-2">
                                {new Date(notification.created_at).toLocaleString("sv-SE", {
                                  day: "numeric",
                                  month: "short",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </p>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                markAsRead(notification.id);
                              }}
                              disabled={markingAsRead === notification.id}
                              className="flex-shrink-0"
                            >
                              <Check className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Read Notifications */}
            {readNotifications.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-sm font-medium text-[#FEFCF8]/70 flex items-center gap-2">
                  <CheckCheck className="h-4 w-4" />
                  Lästa ({readNotifications.length})
                </h2>
                {readNotifications.map((notification) => (
                  <Card
                    key={notification.id}
                    className="opacity-70 hover:opacity-100 transition-opacity"
                  >
                    <CardContent className="pt-4">
                      <div className="flex items-start gap-3">
                        <div className="text-2xl flex-shrink-0 opacity-60">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-semibold text-[#5A6B5D]/70 mb-1">
                            {notification.title}
                          </h3>
                          <p className="text-sm text-[#5A6B5D]/60 leading-relaxed">
                            {notification.message}
                          </p>
                          <p className="text-xs text-[#5A6B5D]/50 mt-2">
                            {new Date(notification.created_at).toLocaleString("sv-SE", {
                              day: "numeric",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

