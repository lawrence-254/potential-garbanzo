import { useEffect, useState } from "react";
import { Plus } from "lucide-react";

import PostModal from "../../components/post/PostModal/PostModal";
import PostCard from "../../components/post/PostCard/PostCard";

import { getPosts } from "../../services/api/postApi";
import type { Post } from "../../types/post";

import "./Home.css";

type FeedType = "following" | "everyone";

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [postModalOpen, setPostModalOpen] = useState(false);
  const [feedType, setFeedType] = useState<FeedType>("following");

  const loadPosts = async (type: FeedType = feedType) => {
    try {
      setLoading(true);
      setError("");

      // Pass the selected feed type to the API
      const data = await getPosts({ feed: type });
      setPosts(data);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to load posts.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handlePostDeleted = (postId: string) => {
    setPosts((currentPosts) =>
      currentPosts.filter((post) => post.id !== postId),
    );
  };

  const handlePostCreated = () => {
    setPostModalOpen(false);
    loadPosts();
  };

  // Reload posts whenever the user switches tabs
  useEffect(() => {
    loadPosts(feedType);
  }, [feedType]);

  return (
    <div className="home">
      <div className="home__header">
        <div>
          <h1>Home</h1>
          <p>What's up</p>
        </div>
      </div>

      <button
        type="button"
        className="home__create-post"
        onClick={() => setPostModalOpen(true)}
      >
        <Plus size={20} />
        Create a post
      </button>

      <section className="home__feed">
        {/* ===== Feed type selector ===== */}
        <div className="home__feed-tabs">
          <button
            type="button"
            className={`home__feed-tab ${
              feedType === "following" ? "home__feed-tab--active" : ""
            }`}
            onClick={() => setFeedType("following")}
          >
            Following
          </button>
          <button
            type="button"
            className={`home__feed-tab ${
              feedType === "everyone" ? "home__feed-tab--active" : ""
            }`}
            onClick={() => setFeedType("everyone")}
          >
            Everyone
          </button>
        </div>

        <div className="home__feed-header">
          <h2>
            {feedType === "following" ? "Your Feed" : "All Posts"}
          </h2>
          <p>
            {feedType === "following"
              ? "Posts from you and people you follow."
              : "Posts from everyone on the platform."}
          </p>
        </div>

        {loading && (
          <div className="home__status">Loading posts...</div>
        )}

        {error && (
          <div className="home__status home__status--error">{error}</div>
        )}

        {!loading && !error && posts.length === 0 && (
          <div className="home__empty">
            <h2>
              {feedType === "following"
                ? "Your feed is empty"
                : "No posts yet"}
            </h2>
            <p>
              {feedType === "following"
                ? "Create your first post or follow people to see their posts here."
                : "Be the first to create a post!"}
            </p>
          </div>
        )}

        {!loading &&
          !error &&
          posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onPostDeleted={handlePostDeleted}
            />
          ))}
      </section>

      <PostModal
        isOpen={postModalOpen}
        onClose={() => setPostModalOpen(false)}
        onPostCreated={handlePostCreated}
      />
    </div>
  );
}
