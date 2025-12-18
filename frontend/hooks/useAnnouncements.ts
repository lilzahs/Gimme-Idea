"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { apiClient } from "../lib/api-client";
import { useAppStore } from "../lib/store";
import { supabase } from "../lib/supabase";

export interface Announcement {
    id: string;
    type: string;
    title: string;
    message: string;
    referenceType?: string;
    referenceId?: string;
    actionUrl?: string;
    actionLabel?: string;
    priority: 'low' | 'normal' | 'high' | 'urgent';
    isRead: boolean;
    createdAt: string;
    expiresAt?: string;
    metadata?: Record<string, any>;
}

export function useAnnouncements() {
    const user = useAppStore((state) => state.user);
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const subscriptionRef = useRef<any>(null);

    // Fetch announcements
    const fetchAnnouncements = useCallback(async () => {
        if (!user) return;

        setIsLoading(true);
        try {
            const response = await apiClient.getAnnouncements();
            if (response.success && response.data) {
                setAnnouncements(response.data);
            }
        } catch (error) {
            console.error("Failed to fetch announcements:", error);
        } finally {
            setIsLoading(false);
        }
    }, [user]);

    // Mark as read
    const markAsRead = useCallback(async (announcementId: string) => {
        try {
            await apiClient.markAnnouncementRead(announcementId);
            setAnnouncements((prev) =>
                prev.map((a) => (a.id === announcementId ? { ...a, isRead: true } : a))
            );
        } catch (error) {
            console.error("Failed to mark announcement as read:", error);
        }
    }, []);

    // Dismiss announcement
    const dismissAnnouncement = useCallback(async (announcementId: string) => {
        try {
            await apiClient.dismissAnnouncement(announcementId);
            setAnnouncements((prev) => prev.filter((a) => a.id !== announcementId));
        } catch (error) {
            console.error("Failed to dismiss announcement:", error);
        }
    }, []);

    // Get unread count
    const unreadCount = announcements.filter((a) => !a.isRead).length;

    // Get high priority announcements
    const urgentAnnouncements = announcements.filter(
        (a) => a.priority === "urgent" || a.priority === "high"
    );

    // Setup realtime subscription
    useEffect(() => {
        if (!user?.id) {
            setAnnouncements([]);
            return;
        }

        // Initial fetch
        fetchAnnouncements();

        // Subscribe to realtime updates
        const channel = supabase
            .channel(`announcements:${user.id}`)
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "user_announcements",
                    filter: `user_id=eq.${user.id}`,
                },
                () => {
                    // New announcement - refetch
                    fetchAnnouncements();
                }
            )
            .on(
                "postgres_changes",
                {
                    event: "UPDATE",
                    schema: "public",
                    table: "user_announcements",
                    filter: `user_id=eq.${user.id}`,
                },
                (payload) => {
                    const updated = payload.new as any;
                    if (updated.is_dismissed) {
                        setAnnouncements((prev) => prev.filter((a) => a.id !== updated.id));
                    } else {
                        setAnnouncements((prev) =>
                            prev.map((a) =>
                                a.id === updated.id
                                    ? { ...a, isRead: updated.is_read }
                                    : a
                            )
                        );
                    }
                }
            )
            .subscribe();

        subscriptionRef.current = channel;

        return () => {
            if (subscriptionRef.current) {
                supabase.removeChannel(subscriptionRef.current);
            }
        };
    }, [user?.id, fetchAnnouncements]);

    return {
        announcements,
        unreadCount,
        urgentAnnouncements,
        isLoading,
        fetchAnnouncements,
        markAsRead,
        dismissAnnouncement,
    };
}
