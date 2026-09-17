import { useEffect, useState } from "react";

import { useAuth } from "../../../context/authContext/authContext";

import {
  followUser,
  getFollowStatus,
  unfollowUser,
} from "../../../services/api/followApi";

import "./FollowButton.css";

interface FollowButtonProps {
  userId: string;
  onFollowerCountChange?: (count: number) => void;
}

export default function FollowButton({
  userId,
  onFollowerCountChange,
}: FollowButtonProps) {
  const { user } = useAuth();

  const [following, setFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  const isOwnProfile = user?.id === userId;

  useEffect(() => {
    if (isOwnProfile) {
      setLoading(false);
      return;
    }

    const loadStatus = async () => {
      try {
        const response = await getFollowStatus(userId);
        setFollowing(response.following);

      } catch (error) {
        console.error(
          "Failed to load follow status:",
          error,
        );
      } finally {
        setLoading(false);
      }
    };

    loadStatus();
  }, [userId, isOwnProfile]);

  const handleFollow = async (response: any) => {
    if (processing) {
      return;
    }

    try {
      setProcessing(true);

      if (following) {
        await unfollowUser(userId);
        setFollowing(false);
        onFollowerCountChange?.(response.followerCount);
      } else {
        await followUser(userId);
        setFollowing(true);
        onFollowerCountChange?.(response.followerCount);
      }
    } catch (error) {
      console.error(
        "Follow action failed:",
        error,
      );
    } finally {
      setProcessing(false);
    }
  };

  if (isOwnProfile) {
    return null;
  }

  if (loading) {
    return (
      <button
        className="follow-button"
        type="button"
        disabled
      >
        Loading...
      </button>
    );
  }

  return (
    <button
      className={`follow-button ${
        following
          ? "follow-button--following"
          : ""
      }`}
      type="button"
      onClick={handleFollow}
      disabled={processing}
    >
      {processing
        ? "..."
        : following
          ? "Following"
          : "Follow"}
    </button>
  );
}