import { useNavigate } from "react-router-dom";

import FollowButton from "../FollowButton/FollowButton";

import type { UserSearchResult } from "../../../services/api/userApi";

import "./UserResult.css";

interface UserResultProps {
  user: UserSearchResult;
}

export default function UserResult({
  user,
}: UserResultProps) {
  const navigate = useNavigate();

  return (
    <article className="user-result">
      <button
        type="button"
        className="user-result__profile"
        onClick={() =>
          navigate(`/profile/${user.username}`)
        }
      >
        <div className="user-result__avatar">
          {user.avatar ? (
            <img
              src={user.avatar}
              alt={user.displayName}
            />
          ) : (
            user.displayName
              .charAt(0)
              .toUpperCase()
          )}
        </div>

        <div className="user-result__info">
          <strong>{user.displayName}</strong>

          <span>@{user.username}</span>

          {user.bio && (
            <p>{user.bio}</p>
          )}
        </div>
      </button>

      <FollowButton userId={user.id} />
    </article>
  );
}