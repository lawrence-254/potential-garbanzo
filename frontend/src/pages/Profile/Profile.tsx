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
import FollowButton from "../../components/users/FollowButton/FollowButton";

import "./Profile.css";

export default function Profile() {
  const { refreshUser } = useAuth();

  const [profile, setProfile] = useState<ProfileUser | null>(
    null,
  );

  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      try {
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

  const handleSave = async () => {
    try {
      setSaving(true);
      setError("");

      const updatedUser = await updateMyProfile({
        displayName,
        bio,
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
      <div className="profile__header">
  <div className="profile__avatar">
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

  <div className="profile__info">
    <h1>{profile.displayName}</h1>

    <p>@{profile.username}</p>

    <p>{profile.bio}</p>

    <div className="profile__stats">
      <span>
        <strong>{profile.followersCount}</strong>{" "}
        Followers
      </span>

      <span>
        <strong>{profile.followingCount}</strong>{" "}
        Following
      </span>
    </div>
  </div>

  <FollowButton userId={profile.id} />
</div>

      <div className="profile__content">
        <h2>Posts</h2>

        <div className="profile__empty">
          <p>No posts yet.</p>
          <span>
            Your posts will appear here.
          </span>
        </div>
      </div>
    </section>
  );
}