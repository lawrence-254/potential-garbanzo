import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

import FollowButton from "../../components/users/FollowButton/FollowButton";
import PostCard from "../../components/post/PostCard/PostCard";
import MessageButton from "../../components/messages/MessageButton/MessageButton";

import {
  getUserProfile,
  type PublicUserProfile,
} from "../../services/api/userApi";

import "./PublicProfile.css";

export default function PublicProfile() {
  const { username } = useParams<{
    username: string;
  }>();

  const navigate = useNavigate();

  const [profile, setProfile] =
    useState<PublicUserProfile | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!username) {
      return;
    }

    const loadProfile = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getUserProfile(username);

        setProfile(data);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Failed to load profile",
        );
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [username]);

  if (loading) {
    return (
      <div className="public-profile__status">
        Loading profile...
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="public-profile__status public-profile__status--error">
        {error || "Profile not found"}
      </div>
    );
  }

  return (
    <div className="public-profile">
      <button
        type="button"
        className="public-profile__back"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft size={18} />
        Back
      </button>

      <section className="public-profile__header">
        <div className="public-profile__avatar">
          {profile.avatar ? (
            <img
              src={profile.avatar}
              alt={profile.displayName}
            />
          ) : (
            profile.displayName
              .charAt(0)
              .toUpperCase()
          )}
        </div>

        <div className="public-profile__info">
          <h1>{profile.displayName}</h1>

          <p className="public-profile__username">
            @{profile.username}
          </p>

          {profile.bio && (
            <p className="public-profile__bio">
              {profile.bio}
            </p>
          )}

          <div className="public-profile__stats">
            <span>
              <strong>
                {profile.followersCount}
              </strong>
              Followers
            </span>

            <span>
              <strong>
                {profile.followingCount}
              </strong>
              Following
            </span>
          </div>
        </div>

        <FollowButton
  username={profile.username}
  onFollowerCountChange={(count) =>
    setProfile((current) =>
      current
        ? {
            ...current,
            followersCount: count,
          }
        : current,
    )
  }/>
  <MessageButton userId={profile.id} />
      </section>

      <section className="public-profile__posts">
        <h2>Posts</h2>

        {profile.posts.length === 0 ? (
          <div className="public-profile__empty">
            <h3>No posts yet</h3>
            <p>
              {profile.displayName} hasn't posted
              anything yet.
            </p>
          </div>
        ) : (
          <div className="public-profile__feed">
            {profile.posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onPostDeleted={(postId) => {
                  setProfile((current) =>
                    current
                      ? {
                          ...current,
                          posts: current.posts.filter(
                            (item) =>
                              item.id !== postId,
                          ),
                        }
                      : current,
                  );
                }}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
