import { useEffect, useState } from "react";
import { Edit3, Users } from "lucide-react";

import Button from "../../components/ui/Button/Button";

import {
  useAuth,
} from "../../context/authContext/authContext";

import {
  getMyProfile,
  updateMyProfile,
  type ProfileUser,
} from "../../services/api/authApi";

import {
  getMyOwnPosts,
} from "../../services/api/postApi";

import PostCard from "../../components/post/PostCard/PostCard";

import type { Post } from "../../types/post";

import "./Profile.css";

export default function Profile() {
  const { refreshUser } = useAuth();

  const [profile, setProfile] =
    useState<ProfileUser | null>(null);

  const [posts, setPosts] = useState<Post[]>([]);

  const [loading, setLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(true);

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [postsError, setPostsError] = useState("");

  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getMyProfile();

        setProfile(data);

        setDisplayName(data.displayName);
        setBio(data.bio || "");
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load profile.",
        );
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  useEffect(() => {
    const loadPosts = async () => {
      try {
        setPostsLoading(true);
        setPostsError("");

        const data = await getMyOwnPosts();

        setPosts(data);
      } catch (err) {
        setPostsError(
          err instanceof Error
            ? err.message
            : "Unable to load your posts.",
        );
      } finally {
        setPostsLoading(false);
      }
    };

    loadPosts();
  }, []);

  const handleSave = async () => {
    const cleanDisplayName = displayName.trim();
    const cleanBio = bio.trim();

    if (!cleanDisplayName) {
      setError("Display name cannot be empty.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const updatedUser = await updateMyProfile({
        displayName: cleanDisplayName,
        bio: cleanBio,
      });

      setProfile(updatedUser);

      setDisplayName(updatedUser.displayName);
      setBio(updatedUser.bio || "");

      await refreshUser();

      setEditing(false);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to update profile.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (!profile) return;

    setDisplayName(profile.displayName);
    setBio(profile.bio || "");

    setEditing(false);
    setError("");
  };

  const handlePostDeleted = (postId: string) => {
    setPosts((currentPosts) =>
      currentPosts.filter(
        (post) => post.id !== postId,
      ),
    );
  };

  if (loading) {
    return (
      <section className="profile">
        <div className="profile__loading">
          Loading profile...
        </div>
      </section>
    );
  }

  if (!profile) {
    return (
      <section className="profile">
        <div className="profile__error">
          {error || "Profile could not be loaded."}
        </div>
      </section>
    );
  }

  const avatarLetter =
    profile.displayName?.charAt(0).toUpperCase() || "U";

  return (
    <section className="profile">
      {error && (
        <div className="profile__error">
          {error}
        </div>
      )}

      <div className="profile__header">
        <div className="profile__avatar">
          {profile.avatar ? (
            <img
              src={profile.avatar}
              alt={profile.displayName}
            />
          ) : (
            avatarLetter
          )}
        </div>

        <div className="profile__info">
          {editing ? (
            <div className="profile__edit-fields">
              <div className="profile__field">
                <label htmlFor="profile-display-name">
                  Display name
                </label>

                <input
                  id="profile-display-name"
                  type="text"
                  value={displayName}
                  onChange={(event) =>
                    setDisplayName(event.target.value)
                  }
                  maxLength={100}
                  disabled={saving}
                />
              </div>

              <div className="profile__field">
                <label htmlFor="profile-bio">
                  Bio
                </label>

                <textarea
                  id="profile-bio"
                  value={bio}
                  onChange={(event) =>
                    setBio(event.target.value)
                  }
                  maxLength={500}
                  rows={4}
                  disabled={saving}
                />
              </div>
            </div>
          ) : (
            <>
              <h1>{profile.displayName}</h1>

              <p className="profile__username">
                @{profile.username}
              </p>

              {profile.bio && (
                <p className="profile__bio">
                  {profile.bio}
                </p>
              )}
            </>
          )}

          <div className="profile__stats">
            <span>
              <strong>
                {profile.followersCount}
              </strong>{" "}
              Followers
            </span>

            <span>
              <strong>
                {profile.followingCount}
              </strong>{" "}
              Following
            </span>
          </div>
        </div>

        <div className="profile__actions">
          {editing ? (
            <>
              <Button
                type="button"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? "Saving..." : "Save"}
              </Button>

              <Button
                type="button"
                variant="secondary"
                onClick={handleCancel}
                disabled={saving}
              >
                Cancel
              </Button>
            </>
          ) : (
            <Button
              type="button"
              onClick={() => {
                setEditing(true);
                setError("");
              }}
            >
              <Edit3 size={16} />
              Edit profile
            </Button>
          )}
        </div>
      </div>

      <div className="profile__content">
        <div className="profile__content-header">
          <h2>Posts</h2>

          <span>
            {posts.length}{" "}
            {posts.length === 1 ? "post" : "posts"}
          </span>
        </div>

        {postsLoading ? (
          <div className="profile__empty">
            <p>Loading your posts...</p>
          </div>
        ) : postsError ? (
          <div className="profile__error">
            {postsError}
          </div>
        ) : posts.length === 0 ? (
          <div className="profile__empty">
            <Users size={28} />

            <p>No posts yet.</p>

            <span>
              Your posts will appear here.
            </span>
          </div>
        ) : (
          <div className="profile__posts">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onPostDeleted={handlePostDeleted}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
