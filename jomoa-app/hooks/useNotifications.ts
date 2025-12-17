import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/context/AuthContext";

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
  metadata: Record<string, unknown>;
  link?: string | null;
}

export function useNotifications(role: "coach" | "client") {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = useCallback(async () => {
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
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;

      // Normalize notifications and extract link from metadata if available
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
      const errorMessage = err instanceof Error ? err.message : "Kunde inte hämta notiser.";
      console.error("Error fetching notifications:", err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const markAsRead = useCallback(async (id: string) => {
    try {
      const { error: updateError } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("id", id);

      if (updateError) throw updateError;
      fetchNotifications();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Kunde inte markera notis som läst.";
      console.error("Error marking notification as read:", err);
      setError(errorMessage);
    }
  }, [fetchNotifications]);

  const markAllAsRead = useCallback(async () => {
    if (!user?.id) return;
    try {
      const { error: updateError } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("profile_id", user.id)
        .eq("is_read", false);

      if (updateError) throw updateError;
      fetchNotifications();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Kunde inte markera alla notiser som lästa.";
      console.error("Error marking all notifications as read:", err);
      setError(errorMessage);
    }
  }, [user, fetchNotifications]);

  useEffect(() => {
    if (user) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 30000); // Poll every 30 seconds
      return () => clearInterval(interval);
    }
  }, [user, fetchNotifications]);

  return { notifications, unreadCount, loading, error, markAsRead, markAllAsRead, refreshNotifications: fetchNotifications };
}

