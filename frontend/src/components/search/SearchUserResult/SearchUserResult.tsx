import { Link } from "react-router-dom";

import FollowButton from "../../users/FollowButton/FollowButton";
import MessageButton from "../../messages/MessageButton/MessageButton";

import type { SearchUser } from "../../../services/api/searchApii";

import "./SearchUserResult.css";

interface SearchUserResultProps {
  user: SearchUser;
}

export default function SearchUserResult({
  user,
}: SearchUserResultProps) {
  return (
    <article className="search-user-result">
      <Link
        to={`/profile/${user.username}`}
        className="search-user-result__profile"
      >
        <div className="search-user-result__avatar">
          {user.avatar ? (
            <img
              src={user.avatar}
              alt={user.displayName}
            />
          ) : (
            user.displayName.charAt(0).toUpperCase()
          )}
        </div>

        <div className="search-user-result__info">
          <strong>{user.displayName}</strong>

          <span>@{user.username}</span>
{user.mutualCount && user.mutualCount > 0 && (
  <small>
    {user.mutualCount} mutual{" "}
    {user.mutualCount === 1
      ? "connection"
      : "connections"}
  </small>
)}
          {user.bio && <p>{user.bio}</p>}
        </div>
      </Link>

      <div className="search-user-result__actions">
        <FollowButton userId={user.id} />
        <MessageButton
          userId={user.id}
          compact
        />
      </div>
    </article>
  );
}