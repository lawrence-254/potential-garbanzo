import { useEffect, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

import {
  searchUsers,
  type UserSearchResult,
} from "../../../services/api/userApi";

import "./UserSearch.css";

export default function UserSearch() {
  const navigate = useNavigate();

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<UserSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const searchRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
      setResults([]);
      setError("");
      setLoading(false);
      return;
    }

    const timeout = window.setTimeout(async () => {
      try {
        setLoading(true);
        setError("");

        const users = await searchUsers(trimmedQuery);

        setResults(users);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Failed to search users",
        );
      } finally {
        setLoading(false);
      }
    }, 350);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [query]);

  const clearSearch = () => {
    setQuery("");
    setResults([]);
    setError("");
  };

  const handleUserClick = (username: string) => {
    navigate(`/profile/${encodeURIComponent(username)}`);
    clearSearch();
  };

  return (
    <div
      ref={searchRef}
      className="user-search"
    >
      <div className="user-search-input-wrapper">
        <Search
          size={18}
          className="user-search-icon"
        />

        <input
          type="search"
          value={query}
          onChange={(event) =>
            setQuery(event.target.value)
          }
          placeholder="Search users..."
          aria-label="Search users"
        />

        {query && (
          <button
            type="button"
            className="user-search-clear"
            onClick={clearSearch}
            aria-label="Clear search"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {query.trim() && (
        <div className="user-search-results">
          {loading && (
            <div className="user-search-status">
              Searching...
            </div>
          )}

          {!loading && error && (
            <div className="user-search-status user-search-error">
              {error}
            </div>
          )}

          {!loading &&
            !error &&
            results.length === 0 && (
              <div className="user-search-status">
                No users found.
              </div>
            )}

          {!loading &&
            !error &&
            results.length > 0 && (
              <div className="user-search-list">
                {results.map((user) => (
                  <button
                    key={user.id}
                    type="button"
                    className="user-search-result"
                    onClick={() =>
                      handleUserClick(user.username)
                    }
                  >
                    <div className="user-search-avatar">
                      {user.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user.displayName}
                        />
                      ) : (
                        <span>
                          {user.displayName
                            .charAt(0)
                            .toUpperCase()}
                        </span>
                      )}
                    </div>

                    <div className="user-search-info">
                      <strong>
                        {user.displayName}
                      </strong>

                      <span>
                        @{user.username}
                      </span>

                      {user.bio && (
                        <p>{user.bio}</p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
        </div>
      )}
    </div>
  );
}
