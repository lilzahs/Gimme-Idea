"use client";

import { useState, useEffect, useCallback } from "react";
import { apiClient } from "../lib/api-client";
import { FollowUser, FollowStats } from "../lib/types";
import toast from "react-hot-toast";

interface UseFollowOptions {
  targetUserId: string;
  onFollowChange?: (isFollowing: boolean) => void;
}

export function useFollow({ targetUserId, onFollowChange }: UseFollowOptions) {
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState<FollowStats | null>(null);

  // Fetch follow stats on mount
  useEffect(() => {
    if (targetUserId) {
      fetchStats();
    }
  }, [targetUserId]);

  const fetchStats = async () => {
    try {
      const response = await apiClient.getFollowStats(targetUserId);
      if (response.success && response.data) {
        setStats(response.data);
        setIsFollowing(response.data.isFollowing);
      }
    } catch (error) {
      console.error("Failed to fetch follow stats:", error);
    }
  };

  const follow = useCallback(async () => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      const response = await apiClient.followUser(targetUserId);
      if (response.success) {
        setIsFollowing(true);
        setStats((prev) =>
          prev
            ? {
                ...prev,
                followersCount: prev.followersCount + 1,
                isFollowing: true,
              }
            : null
        );
        toast.success(response.message || "Followed!");
        onFollowChange?.(true);
      } else {
        toast.error(response.error || "Failed to follow");
      }
    } catch (error) {
      toast.error("Failed to follow");
    } finally {
      setIsLoading(false);
    }
  }, [targetUserId, isLoading, onFollowChange]);

  const unfollow = useCallback(async () => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      const response = await apiClient.unfollowUser(targetUserId);
      if (response.success) {
        setIsFollowing(false);
        setStats((prev) =>
          prev
            ? {
                ...prev,
                followersCount: Math.max(0, prev.followersCount - 1),
                isFollowing: false,
              }
            : null
        );
        toast.success("Unfollowed");
        onFollowChange?.(false);
      } else {
        toast.error(response.error || "Failed to unfollow");
      }
    } catch (error) {
      toast.error("Failed to unfollow");
    } finally {
      setIsLoading(false);
    }
  }, [targetUserId, isLoading, onFollowChange]);

  const toggleFollow = useCallback(() => {
    if (isFollowing) {
      unfollow();
    } else {
      follow();
    }
  }, [isFollowing, follow, unfollow]);

  return {
    isFollowing,
    isLoading,
    stats,
    follow,
    unfollow,
    toggleFollow,
    refetch: fetchStats,
  };
}

interface UseFollowListOptions {
  userId: string;
  type: "followers" | "following";
  limit?: number;
}

export function useFollowList({
  userId,
  type,
  limit = 20,
}: UseFollowListOptions) {
  const [users, setUsers] = useState<FollowUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);

  const fetchUsers = useCallback(
    async (reset = false) => {
      if (isLoading) return;

      setIsLoading(true);
      try {
        const currentOffset = reset ? 0 : offset;
        const fetcher =
          type === "followers"
            ? apiClient.getFollowers
            : apiClient.getFollowing;

        const response = await fetcher(userId, {
          limit,
          offset: currentOffset,
        });

        if (response.success && response.data) {
          if (reset) {
            setUsers(response.data);
          } else {
            setUsers((prev) => [...prev, ...response.data!]);
          }
          setHasMore(response.data.length === limit);
          setOffset(currentOffset + response.data.length);
        }
      } catch (error) {
        console.error(`Failed to fetch ${type}:`, error);
      } finally {
        setIsLoading(false);
      }
    },
    [userId, type, limit, offset, isLoading]
  );

  // Fetch on mount
  useEffect(() => {
    fetchUsers(true);
  }, [userId, type]);

  const loadMore = () => {
    if (!isLoading && hasMore) {
      fetchUsers();
    }
  };

  const refresh = () => {
    setOffset(0);
    fetchUsers(true);
  };

  return {
    users,
    isLoading,
    hasMore,
    loadMore,
    refresh,
  };
}
