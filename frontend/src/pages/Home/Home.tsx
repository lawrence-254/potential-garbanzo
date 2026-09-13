import { useEffect, useState } from "react";

import CreatePost from "../../components/post/CreatePost/CreatePost";
import PostCard from "../../components/post/PostCard/PostCard";

import {
  getPosts,
  type Post,
} from "../../services/api/postApi";

import "./Home.css";

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadPosts = async () => {
    try {
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

  useEffect(() => {
    loadPosts();
  }, []);

  return (
    <div className="home">
      <div className="home__header">
        <div>
          <h1>Home</h1>
          <p>What's happening on Royal?</p>
        </div>
      </div>

      <CreatePost onPostCreated={loadPosts} />

      <section className="home__feed">
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
            <h2>No posts yet</h2>
            <p>
              Be the first person to share
              something on Royal.
            </p>
          </div>
        )}

        {!loading &&
          posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
            />
          ))}
      </section>
    </div>
  );
}