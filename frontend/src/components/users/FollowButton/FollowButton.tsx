import { useEffect, useRef, useState } from "react";

import {
  followUser,
  unfollowUser,
  getFollowStatus,
} from "../../../services/api/followApi";

import "./FollowButton.css";

interface FollowButtonProps {
  username: string;
  onFollowerCountChange?: (count: number) => void;
}

export default function FollowButton({
  username,
  onFollowerCountChange,
}: FollowButtonProps) {
  const [following, setFollowing] = useState(false);
  const [self, setSelf] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");

  // Keep the latest callback without making the effect
  // re-run every time the parent creates a new function.
  const onFollowerCountChangeRef = useRef(onFollowerCountChange);

  useEffect(() => {
    onFollowerCountChangeRef.current = onFollowerCountChange;
  }, [onFollowerCountChange]);

  useEffect(() => {
    let mounted = true;

    async function loadFollowStatus() {
      setLoading(true);
      setError("");

      try {
        const response = await getFollowStatus(username);

        if (!mounted) return;

        setFollowing(response.following);
        setSelf(response.self);

        onFollowerCountChangeRef.current?.(response.followerCount);
      } catch (error) {
        if (!mounted) return;

        setError(
          error instanceof Error
            ? error.message
            : "Failed to load follow status",
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadFollowStatus();

    return () => {
      mounted = false;
    };
  }, [username]);

  async function handleFollowToggle() {
    if (actionLoading || self) return;

    try {
      setActionLoading(true);
      setError("");

      if (following) {
        const response = await unfollowUser(username);

        setFollowing(false);

        onFollowerCountChangeRef.current?.(
          response.followerCount,
        );
      } else {
        const response = await followUser(username);

        setFollowing(true);

        onFollowerCountChangeRef.current?.(
          response.followerCount,
        );
      }
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to update follow status",
      );
    } finally {
      setActionLoading(false);
    }
  }

  // Don't show a follow button on your own profile.
  if (self) {
    return null;
  }

  // Initial status check.
  if (loading) {
    return (
      <button
        type="button"
        className="follow-button follow-button-loading"
        disabled
      >
        Loading...
      </button>
    );
  }

  return (
    <div className="follow-button-wrapper">
      <button
        type="button"
        className={`follow-button ${
          following ? "following" : ""
        }`}
        onClick={handleFollowToggle}
        disabled={actionLoading}
      >
        {actionLoading
          ? "..."
          : following
            ? "Following"
            : "Follow"}
      </button>

      {error && (
        <p className="follow-button-error">
          {error}
        </p>
      )}
    </div>
  );
}
