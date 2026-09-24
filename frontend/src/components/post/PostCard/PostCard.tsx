import { useEffect, useState } from "react";
import { Heart, MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../../context/authContext/authContext";
import {
  likePost,
  unlikePost,
} from "../../../services/api/likeApi";
import type { Post } from "../../../types/post";
import { getImageUrl } from "../../../utils/imageUrl";

import "./PostCard.css";

interface PostCardProps {
  post: Post;
}

function PostCard({ post }: PostCardProps) {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Safe defaults – never access .length / .some on undefined
  const likes = post.likes ?? [];
  const comments = post.comments ?? [];

  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(likes.length);
  const [liking, setLiking] = useState(false);

  const excerpt =
    (post.content ?? "").length > 160
      ? `${(post.content ?? "").slice(0, 160)}...`
      : post.content ?? "";

  useEffect(() => {
    const currentLikes = post.likes ?? [];

    setLiked(
      currentLikes.some((like) => like.userId === user?.id)
    );
    setLikeCount(currentLikes.length);
  }, [post, user]);

  const handleOpenPost = () => {
    navigate(`/post/${post.id}`);
  };

  const handleLike = async (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.stopPropagation();

    if (liking) return;

    try {
      setLiking(true);

      const response = liked
        ? await unlikePost(post.id)
        : await likePost(post.id);

      setLiked(response.liked);
      setLikeCount(response.likeCount);
    } catch (error) {
      console.error("Failed to update like:", error);
    } finally {
      setLiking(false);
    }
  };

  const handleComments = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.stopPropagation();
    navigate(`/post/${post.id}`);
  };

  return (
    <article
      className="post-card"
      onClick={handleOpenPost}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          handleOpenPost();
        }
      }}
    >
      <header className="post-card__author">
        <div className="post-card__avatar">
          {post.author?.name?.charAt(0).toUpperCase() ?? "?"}
        </div>

        <div className="post-card__author-info">
          <strong>{post.author?.name ?? "Unknown"}</strong>
          <span>@{post.author?.username ?? "unknown"}</span>
        </div>
      </header>

      <div className="post-card__body">
        <h2 className="post-card__title">{post.title}</h2>

        {post.thumbnail && (
          <div className="post-card__thumbnail">
            <img
              src={getImageUrl(post.thumbnail)}
              alt={post.title}
              loading="lazy"
            />
          </div>
        )}

        <p className="post-card__excerpt">{excerpt}</p>

        {post.code && (
          <div className="post-card__code-indicator">
            <span>{post.codeLanguage || "Code"}</span>
            <span>Code included</span>
          </div>
        )}
      </div>

      <footer className="post-card__footer">
        <button
          type="button"
          className={`post-card__action ${
            liked ? "post-card__action--liked" : ""
          }`}
          onClick={handleLike}
          disabled={liking}
          aria-label={liked ? "Unlike post" : "Like post"}
        >
          <Heart
            size={18}
            fill={liked ? "currentColor" : "none"}
          />
          <span>{likeCount}</span>
        </button>

        <button
          type="button"
          className="post-card__action"
          onClick={handleComments}
          aria-label="View comments"
        >
          <MessageCircle size={18} />
          <span>{comments.length}</span>
        </button>
      </footer>
    </article>
  );
}

export default PostCard;
