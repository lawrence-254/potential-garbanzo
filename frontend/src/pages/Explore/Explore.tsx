// import { Search, X } from "lucide-react";
// import { useEffect, useState } from "react";
// import {
//   useSearchParams,
// } from "react-router-dom";

// import UserResult from "../../components/users/userResult/UserResult";

// import {
//   searchUsers,
//   type UserSearchResult,
// } from "../../services/api/userApi";

// import "./Explore.css";

// export default function Explore() {
//   const [users, setUsers] = useState<UserSearchResult[]>(
//     [],
//   );

//   const [searchParams] = useSearchParams();

// const initialQuery =
//   searchParams.get("q") || "";

// const [query, setQuery] = useState(
//   initialQuery,
// );
//   const [loading, setLoading] = useState(false);
//   const [searched, setSearched] = useState(false);
//   const [error, setError] = useState("");

//   useEffect(() => {
//     const trimmedQuery = query.trim();

//     if (!trimmedQuery) {
//       setUsers([]);
//       setSearched(false);
//       setError("");
//       return;
//     }

//     const timeout = window.setTimeout(
//       async () => {
//         try {
//           setLoading(true);
//           setSearched(true);
//           setError("");

//           const results =
//             await searchUsers(trimmedQuery);

//           setUsers(results);
//         } catch (error) {
//           setError(
//             error instanceof Error
//               ? error.message
//               : "Failed to search users",
//           );

//           setUsers([]);
//         } finally {
//           setLoading(false);
//         }
//       },
//       300,
//     );

//     return () => {
//       window.clearTimeout(timeout);
//     };
//   }, [query]);

//   const clearSearch = () => {
//     setQuery("");
//   };

//   return (
//     <div className="explore">
//       <div className="explore__header">
//         <h1>Explore</h1>

//         <p>
//           Discover people and communities on Royal.
//         </p>
//       </div>

//       <div className="explore__search">
//         <Search
//           className="explore__search-icon"
//           size={19}
//         />

//         <input
//           type="search"
//           value={query}
//           onChange={(event) =>
//             setQuery(event.target.value)
//           }
//           placeholder="Search people..."
//           aria-label="Search people"
//         />

//         {query && (
//           <button
//             type="button"
//             className="explore__clear"
//             onClick={clearSearch}
//             aria-label="Clear search"
//           >
//             <X size={17} />
//           </button>
//         )}
//       </div>

//       <section className="explore__results">
//         {loading && (
//           <div className="explore__status">
//             Searching...
//           </div>
//         )}

//         {!loading && error && (
//           <div className="explore__status explore__status--error">
//             {error}
//           </div>
//         )}

//         {!loading &&
//           !error &&
//           searched &&
//           users.length === 0 && (
//             <div className="explore__empty">
//               <h2>No users found</h2>

//               <p>
//                 Try searching with another name or
//                 username.
//               </p>
//             </div>
//           )}

//         {!loading &&
//           !error &&
//           users.length > 0 && (
//             <div className="explore__user-list">
//               {users.map((user) => (
//                 <UserResult
//                   key={user.id}
//                   user={user}
//                 />
//               ))}
//             </div>
//           )}

//         {!searched && (
//           <div className="explore__welcome">
//             <Search size={36} />

//             <h2>Find people</h2>

//             <p>
//               Search for people by their name or
//               username.
//             </p>
//           </div>
//         )}
//       </section>
//     </div>
//   );
// }

import { useEffect, useState } from "react";
import { Search, X } from "lucide-react";

import {
  getExplorePosts,
  getSuggestedUsers,
  searchContent,
} from "../../services/api/searchApii";
import type {
  SearchPost,
  SearchUser,
} from "../../services/api/searchApii";
import { useDebounce } from "../../hooks/useDebounce";

import SearchUserResult from "../../components/search/SearchUserResult/SearchUserResult";
import SearchPostResult from "../../components/search/SearchPostResult/SearchPostResult";

import "./Explore.css";

export default function Explore() {
  const [query, setQuery] = useState("");
  const [suggestedUsers, setSuggestedUsers] =
  useState<SearchUser[]>([]);

  const [users, setUsers] = useState<
    Awaited<ReturnType<typeof searchContent>>["users"]
  >([]);

  const [posts, setPosts] = useState<
    Awaited<ReturnType<typeof searchContent>>["posts"]
  >([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const debouncedQuery = useDebounce(query.trim(), 400);
  const [explorePosts, setExplorePosts] =
  useState<SearchPost[]>([]);

const [explorePostsLoading, setExplorePostsLoading] =
  useState(true);
useEffect(() => {
  const loadExplorePosts = async () => {
    try {
      setExplorePostsLoading(true);

      const posts = await getExplorePosts();

      setExplorePosts(posts);
    } catch (error) {
      console.error(
        "Failed to load explore posts:",
        error,
      );
    } finally {
      setExplorePostsLoading(false);
    }
  };

  loadExplorePosts();
}, []);

  useEffect(() => {
  const loadSuggestions = async () => {
    try {
      const users = await getSuggestedUsers();

      setSuggestedUsers(users);
    } catch (error) {
      console.error(
        "Failed to load suggested users:",
        error,
      );
    }
  };

  loadSuggestions();
}, []);

  useEffect(() => {
    const runSearch = async () => {
      if (!debouncedQuery) {
        setUsers([]);
        setPosts([]);
        setError("");
        return;
      }

      try {
        setLoading(true);
        setError("");

        const results =
          await searchContent(debouncedQuery);

        setUsers(results.users);
        setPosts(results.posts);
      } catch (error) {
        console.error(error);

        setError(
          error instanceof Error
            ? error.message
            : "Search failed",
        );
      } finally {
        setLoading(false);
      }
    };

    runSearch();
  }, [debouncedQuery]);

  const clearSearch = () => {
    setQuery("");
  };

  const hasResults =
    users.length > 0 || posts.length > 0;

  return (
    <main className="explore">
      <header className="explore__header">
        <div>
          <h1>Explore</h1>
          <p>
            Discover people and posts on Royal Social.
          </p>
        </div>
      </header>

      <div className="explore__search">
        <Search size={20} />

        <input
          type="search"
          value={query}
          onChange={(event) =>
            setQuery(event.target.value)
          }
          placeholder="Search people or posts..."
          aria-label="Search people or posts"
        />

        {query && (
          <button
            type="button"
            onClick={clearSearch}
            aria-label="Clear search"
          >
            <X size={18} />
          </button>
        )}
      </div>

{!debouncedQuery &&
  suggestedUsers.length > 0 && (
    <section className="explore__section">
      <div className="explore__section-header">
        <h2>People you may know</h2>
        <span>{suggestedUsers.length}</span>
      </div>

      <div className="explore__users">
        {suggestedUsers.map((user) => (
          <SearchUserResult
            key={user.id}
            user={user}
          />
        ))}
      </div>
    </section>
  )}
      {loading && (
        <div className="explore__status">
          Searching...
        </div>
      )}

      {error && (
        <div className="explore__status explore__status--error">
          {error}
        </div>
      )}

      {!debouncedQuery &&
  suggestedUsers.length === 0 && (
    <div className="explore__empty">
      <Search size={42} />

      <h2>Search Royal Social</h2>

      <p>
        Search for people or posts to discover
        something new.
      </p>
    </div>
  )}
{!debouncedQuery && (
  <section className="explore__section">
    <div className="explore__section-header">
      <h2>Discover posts</h2>

      {explorePosts.length > 0 && (
        <span>{explorePosts.length}</span>
      )}
    </div>

    {explorePostsLoading ? (
      <div className="explore__status">
        Loading posts...
      </div>
    ) : explorePosts.length > 0 ? (
      <div className="explore__posts">
        {explorePosts.map((post) => (
          <SearchPostResult
            key={post.id}
            post={post}
          />
        ))}
      </div>
    ) : (
      <div className="explore__empty">
        <h2>No posts yet</h2>

        <p>
          Posts from the community will appear here.
        </p>
      </div>
    )}
  </section>
)}
      {!debouncedQuery && (
        <div className="explore__empty">
          <Search size={42} />

          <h2>Search Royal Social</h2>

          <p>
            Search for people or posts to discover
            something new.
          </p>
        </div>
      )}

      {users.length > 0 && (
        <section className="explore__section">
          <div className="explore__section-header">
            <h2>People</h2>
            <span>{users.length}</span>
          </div>

          <div className="explore__users">
            {users.map((user) => (
              <SearchUserResult
                key={user.id}
                user={user}
              />
            ))}
          </div>
        </section>
      )}

      {posts.length > 0 && (
        <section className="explore__section">
          <div className="explore__section-header">
            <h2>Posts</h2>
            <span>{posts.length}</span>
          </div>

          <div className="explore__posts">
            {posts.map((post) => (
              <SearchPostResult
                key={post.id}
                post={post}
              />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}