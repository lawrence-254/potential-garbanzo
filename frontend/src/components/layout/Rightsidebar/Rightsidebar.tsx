import {
  useEffect,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";

import {
  followUser,
  unfollowUser,
} from "../../../services/api/followApi";
import {
  getAdvertisements,
  recordAdvertisementClick,
  type Advertisement,
} from "../../../services/api/advertisementApi";

import {
  getSidebarSuggestions,
  getTrendingHashtags,
  type SidebarSuggestedUser,
  type TrendingHashtag,
} from "../../../services/api/rightSidebarApi";

import "./RightSidebar.css";

interface SuggestedUserState
  extends SidebarSuggestedUser {
  isFollowing: boolean;
  loading: boolean;
}

export default function RightSidebar() {
  const navigate = useNavigate();
  const [advertisements, setAdvertisements] = useState<Advertisement[]>([]);
  const [advertisementsLoading, setAdvertisementsLoading] = useState(true);

  const [users, setUsers] = useState<
    SuggestedUserState[]
  >([]);

  const [trending, setTrending] = useState<
    TrendingHashtag[]
  >([]);

  const [loadingUsers, setLoadingUsers] =
    useState(true);

  const [loadingTrending, setLoadingTrending] =
    useState(true);

  const [usersError, setUsersError] =
    useState("");

  const [trendingError, setTrendingError] =
    useState("");

  useEffect(() => {
    const loadSidebarData = async () => {
      try {
        setLoadingUsers(true);
        setLoadingTrending(true);

        setUsersError("");
        setTrendingError("");

        const [
          suggestedUsers,
          trendingHashtags,
        ] = await Promise.all([
          getSidebarSuggestions(),
          getTrendingHashtags(),
        ]);

        setUsers(
          suggestedUsers.map((user) => ({
            ...user,
            isFollowing: false,
            loading: false,
          })),
        );

        setTrending(trendingHashtags);
      } catch (error) {
        console.error(
          "Failed to load sidebar:",
          error,
        );

        setUsersError(
          "Failed to load suggestions.",
        );

        setTrendingError(
          "Failed to load trends.",
        );
      } finally {
        setLoadingUsers(false);
        setLoadingTrending(false);
      }
    };

    loadSidebarData();
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadAdvertisements() {
      try {
        setAdvertisementsLoading(true);

        const data = await getAdvertisements();

        if (!cancelled) {
          setAdvertisements(data);
        }
      } catch (error) {
        console.error("Failed to load advertisements:", error);

        if (!cancelled) {
          setAdvertisements([]);
        }
      } finally {
        if (!cancelled) {
          setAdvertisementsLoading(false);
        }
      }
    }

    loadAdvertisements();

    return () => {
      cancelled = true;
    };
  }, []);
  const handleFollowToggle = async (
    userId: string,
  ) => {
    const currentUser = users.find(
      (user) => user.id === userId,
    );

    if (!currentUser || currentUser.loading) {
      return;
    }

    setUsers((current) =>
      current.map((user) =>
        user.id === userId
          ? {
              ...user,
              loading: true,
            }
          : user,
      ),
    );

    try {
      if (currentUser.isFollowing) {
        await unfollowUser(userId);
      } else {
        await followUser(userId);
      }

      setUsers((current) =>
        current.map((user) =>
          user.id === userId
            ? {
                ...user,
                isFollowing:
                  !currentUser.isFollowing,
                loading: false,
              }
            : user,
        ),
      );
    } catch (error) {
      console.error(
        "Failed to update follow status:",
        error,
      );

      setUsers((current) =>
        current.map((user) =>
          user.id === userId
            ? {
                ...user,
                loading: false,
              }
            : user,
        ),
      );
    }
  };

  const handleUserClick = (
    username: string,
  ) => {
    navigate(`/profile/${username}`);
  };

  const handleTrendingClick = (
    hashtag: string,
  ) => {
    const searchTerm = hashtag.replace(
      /^#/,
      "",
    );

    navigate(
      `/search?q=${encodeURIComponent(searchTerm)}`,
    );
  };

  return (
    <aside className="right-sidebar">
      <section className="right-sidebar__section">
        <h2 className="right-sidebar__title">
          Who to follow
        </h2>

        {loadingUsers && (
          <div className="right-sidebar__status">
            Loading suggestions...
          </div>
        )}

        {!loadingUsers && usersError && (
          <div className="right-sidebar__status right-sidebar__status--error">
            {usersError}
          </div>
        )}

        {!loadingUsers &&
          !usersError &&
          users.length === 0 && (
            <div className="right-sidebar__status">
              No suggestions available.
            </div>
          )}

        {!loadingUsers &&
          !usersError &&
          users.length > 0 && (
            <div className="right-sidebar__users">
              {users.map((user) => (
                <div
                  className="suggested-user"
                  key={user.id}
                >
                  <button
                    type="button"
                    className="suggested-user__avatar"
                    onClick={() =>
                      handleUserClick(
                        user.username,
                      )
                    }
                    aria-label={`View ${user.displayName}'s profile`}
                  >
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
                  </button>

                  <button
                    type="button"
                    className="suggested-user__info"
                    onClick={() =>
                      handleUserClick(
                        user.username,
                      )
                    }
                  >
                    <strong>
                      {user.displayName}
                    </strong>

                    <span>
                      @{user.username}
                    </span>
                  </button>

                  <button
                    type="button"
                    className={`suggested-user__follow ${
                      user.isFollowing
                        ? "suggested-user__follow--following"
                        : ""
                    }`}
                    onClick={() =>
                      handleFollowToggle(
                        user.id,
                      )
                    }
                    disabled={user.loading}
                  >
                    {user.loading
                      ? "..."
                      : user.isFollowing
                        ? "Following"
                        : "Follow"}
                  </button>
                </div>
              ))}
            </div>
          )}

      </section>

      <section className="right-sidebar__section">
        <h2 className="right-sidebar__title">
          Trending
        </h2>

        {loadingTrending && (
          <div className="right-sidebar__status">
            Loading trends...
          </div>
        )}

        {!loadingTrending &&
          trendingError && (
            <div className="right-sidebar__status right-sidebar__status--error">
              {trendingError}
            </div>
          )}

        {!loadingTrending &&
          !trendingError &&
          trending.length === 0 && (
            <div className="right-sidebar__status">
              No trending topics yet.
            </div>
          )}

        {!loadingTrending &&
          !trendingError &&
          trending.map((item) => (
            <button
              type="button"
              className="trending-item"
              key={item.hashtag}
              onClick={() =>
                handleTrendingClick(
                  item.hashtag,
                )
              }
            >
              <span>Trending</span>

              <strong>
                {item.hashtag}
              </strong>
            </button>
          ))}
      </section>
      <section className="right-sidebar__section right-sidebar__advertisements">
        <h2 className="right-sidebar__title">Sponsored</h2>

        {advertisementsLoading ? (
          <div className="right-sidebar__status">
            Loading advertisements...
          </div>
        ) : advertisements.length === 0 ? (
          <div className="right-sidebar__status">
            No advertisements available.
          </div>
        ) : (
          <div className="advertisements">
            {advertisements.map((advertisement) => (
              <article
                className="advertisement"
                key={advertisement.id}
              >
                {advertisement.imageUrl && (
                  <img
                    className="advertisement__image"
                    src={advertisement.imageUrl}
                    alt={advertisement.title}
                  />
                )}

                <div className="advertisement__content">
                  <span className="advertisement__label">
                    Sponsored · {advertisement.advertiser}
                  </span>

                  <h3 className="advertisement__title">
                    {advertisement.title}
                  </h3>

                  {advertisement.description && (
                    <p className="advertisement__description">
                      {advertisement.description}
                    </p>
                  )}

                  <button
                    className="advertisement__button"
                    type="button"
                    onClick={async () => {
                      try {
                        const targetUrl =
                          await recordAdvertisementClick(
                            advertisement.id,
                          );

                        window.open(
                          targetUrl,
                          "_blank",
                          "noopener,noreferrer",
                        );
                      } catch (error) {
                        console.error(
                          "Failed to open advertisement:",
                          error,
                        );
                      }
                    }}
                  >
                    {advertisement.ctaText}
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </aside>
  );
}
