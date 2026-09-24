import { useEffect, useState } from "react";
import { Plus } from "lucide-react";

import PostModal from "../../components/post/PostModal/PostModal";
import PostCard from "../../components/post/PostCard/PostCard";

import { getPosts, type Post } from "../../services/api/postApi";

import "./Home.css";

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [postModalOpen, setPostModalOpen] = useState(false);

  const loadPosts = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getPosts();
      setPosts(data);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to load posts.",
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

  useEffect(() => {
    loadPosts();
  }, []);

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
        <div className="home__feed-header">
          <h2>Your Feed</h2>
          <p>Posts from you and people you follow.</p>
        </div>

        {loading && (
          <div className="home__status">
            Loading posts...
          </div>
        )}

        {error && (
          <div className="home__status home__status--error">
            {error}
          </div>
        )}

        {!loading && !error && posts.length === 0 && (
          <div className="home__empty">
            <h2>Your feed is empty</h2>
            <p>
              Create your first post or follow people to
              see their posts here.
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
