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
        <div className="profile__cover" />

        <div className="profile__identity">
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

          <div className="profile__actions">
            {!editing && (
              <Button
                variant="outline"
                onClick={() => setEditing(true)}
              >
                <Edit3 size={17} />
                Edit profile
              </Button>
            )}
          </div>
        </div>

        <div className="profile__details">
          {editing ? (
            <>
              <div className="profile__field">
                <label htmlFor="displayName">
                  Display name
                </label>

                <input
                  id="displayName"
                  value={displayName}
                  maxLength={50}
                  onChange={(event) =>
                    setDisplayName(event.target.value)
                  }
                />

                <span>
                  {displayName.length}/50
                </span>
              </div>

              <div className="profile__field">
                <label htmlFor="bio">Bio</label>

                <textarea
                  id="bio"
                  value={bio}
                  maxLength={160}
                  rows={4}
                  onChange={(event) =>
                    setBio(event.target.value)
                  }
                />

                <span>
                  {bio.length}/160
                </span>
              </div>

              {error && (
                <div className="profile__error">
                  {error}
                </div>
              )}

              <div className="profile__edit-actions">
                <Button
                  variant="ghost"
                  onClick={handleCancel}
                  disabled={saving}
                >
                  Cancel
                </Button>

                <Button
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save changes"}
                </Button>
              </div>
            </>
          ) : (
            <>
              <h1>{profile.displayName}</h1>

              <p className="profile__username">
                @{profile.username}
              </p>

              <p className="profile__bio">
                {profile.bio || "No bio yet."}
              </p>
            </>
          )}
        </div>

        {!editing && (
          <div className="profile__stats">
            <div className="profile__stat">
              <strong>{profile.followersCount}</strong>
              <span>Followers</span>
            </div>

            <div className="profile__stat">
              <strong>{profile.followingCount}</strong>
              <span>Following</span>
            </div>

            <div className="profile__stat">
              <Users size={18} />
              <span>Member</span>
            </div>
          </div>
        )}
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