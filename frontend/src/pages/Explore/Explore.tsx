import { Search, X } from "lucide-react";
import { useEffect, useState } from "react";
import {
  useSearchParams,
} from "react-router-dom";

import UserResult from "../../components/users/userResult/UserResult";

import {
  searchUsers,
  type UserSearchResult,
} from "../../services/api/userApi";

import "./Explore.css";

export default function Explore() {
  const [users, setUsers] = useState<UserSearchResult[]>(
    [],
  );

  const [searchParams] = useSearchParams();

const initialQuery =
  searchParams.get("q") || "";

const [query, setQuery] = useState(
  initialQuery,
);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
      setUsers([]);
      setSearched(false);
      setError("");
      return;
    }

    const timeout = window.setTimeout(
      async () => {
        try {
          setLoading(true);
          setSearched(true);
          setError("");

          const results =
            await searchUsers(trimmedQuery);

          setUsers(results);
        } catch (error) {
          setError(
            error instanceof Error
              ? error.message
              : "Failed to search users",
          );

          setUsers([]);
        } finally {
          setLoading(false);
        }
      },
      300,
    );

    return () => {
      window.clearTimeout(timeout);
    };
  }, [query]);

  const clearSearch = () => {
    setQuery("");
  };

  return (
    <div className="explore">
      <div className="explore__header">
        <h1>Explore</h1>

        <p>
          Discover people and communities on Royal.
        </p>
      </div>

      <div className="explore__search">
        <Search
          className="explore__search-icon"
          size={19}
        />

        <input
          type="search"
          value={query}
          onChange={(event) =>
            setQuery(event.target.value)
          }
          placeholder="Search people..."
          aria-label="Search people"
        />

        {query && (
          <button
            type="button"
            className="explore__clear"
            onClick={clearSearch}
            aria-label="Clear search"
          >
            <X size={17} />
          </button>
        )}
      </div>

      <section className="explore__results">
        {loading && (
          <div className="explore__status">
            Searching...
          </div>
        )}

        {!loading && error && (
          <div className="explore__status explore__status--error">
            {error}
          </div>
        )}

        {!loading &&
          !error &&
          searched &&
          users.length === 0 && (
            <div className="explore__empty">
              <h2>No users found</h2>

              <p>
                Try searching with another name or
                username.
              </p>
            </div>
          )}

        {!loading &&
          !error &&
          users.length > 0 && (
            <div className="explore__user-list">
              {users.map((user) => (
                <UserResult
                  key={user.id}
                  user={user}
                />
              ))}
            </div>
          )}

        {!searched && (
          <div className="explore__welcome">
            <Search size={36} />

            <h2>Find people</h2>

            <p>
              Search for people by their name or
              username.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}