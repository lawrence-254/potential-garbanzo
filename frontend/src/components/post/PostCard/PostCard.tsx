import { useEffect, useState } from "react";
import {
  Heart,
  MessageCircle,
  MoreVertical,
  Pencil,
  Trash2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../../context/authContext/authContext";

import {
  likePost,
  unlikePost,
} from "../../../services/api/likeApi";

import {
  deletePost,
} from "../../../services/api/postApi";

import type { Post } from "../../../types/post";

import { getImageUrl } from "../../../utils/imageUrl";

import "./PostCard.css";

interface PostCardProps {
  post: Post;
  onPostDeleted?: (postId: string) => void;
}

function PostCard({
  post,
  onPostDeleted,
}: PostCardProps) {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [liked, setLiked] = useState(
    post.likedByCurrentUser,
  );

  const [likeCount, setLikeCount] = useState(
    post.likeCount,
  );

  const [liking, setLiking] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const excerpt =
    post.content.length > 160
      ? `${post.content.slice(0, 160)}...`
      : post.content;

  const authorName =
    post.author?.displayName?.trim() || "Unknown";

  const isOwner =
    Boolean(user?.id) &&
    post.authorId === user?.id;

  useEffect(() => {
    setLiked(post.likedByCurrentUser);
    setLikeCount(post.likeCount);
  }, [
    post.likedByCurrentUser,
    post.likeCount,
  ]);

  const handleOpenPost = () => {
    navigate(`/post/${post.id}`);
  };
  const handleOpenProfile = (
    event: React.MouseEvent<HTMLDivElement>,
  ) => {
    event.stopPropagation();

    if (!post.authorId) return;

    navigate(`/profile/${post.author?.username}`);
  };
  const handleLike = async (
    event: React.MouseEvent<HTMLButtonElement>,
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
      console.error(
        "Failed to update like:",
        error,
      );
    } finally {
      setLiking(false);
    }
  };

  const handleComments = (
    event: React.MouseEvent<HTMLButtonElement>,
  ) => {
    event.stopPropagation();

    navigate(`/post/${post.id}`);
  };

  const handleMenuToggle = (
    event: React.MouseEvent<HTMLButtonElement>,
  ) => {
    event.stopPropagation();

    setMenuOpen((current) => !current);
  };

  const handleDelete = async (
    event: React.MouseEvent<HTMLButtonElement>,
  ) => {
    event.stopPropagation();

    if (deleting) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete this post?",
    );

    if (!confirmed) return;

    try {
      setDeleting(true);

      await deletePost(post.id);

      setMenuOpen(false);

      onPostDeleted?.(post.id);
    } catch (error) {
      console.error(
        "Failed to delete post:",
        error,
      );

      window.alert(
        error instanceof Error
          ? error.message
          : "Failed to delete post.",
      );
    } finally {
      setDeleting(false);
    }
  };

  const handleEdit = (
    event: React.MouseEvent<HTMLButtonElement>,
  ) => {
    event.stopPropagation();

    setMenuOpen(false);

    // Edit functionality will be added in the next step.
    console.log("Edit post:", post.id);
  };

  return (
    <article
      className="post-card"
      onClick={handleOpenPost}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (
          event.key === "Enter" ||
          event.key === " "
        ) {
          event.preventDefault();
          handleOpenPost();
        }
      }}
    >
      <header className="post-card__author">
        <div
          className="post-card__author-link"
          onClick={handleOpenProfile}
          role="link"
          tabIndex={0}
          onKeyDown={(event) => {
            if (
              event.key === "Enter" ||
              event.key === " "
            ) {
              event.preventDefault();
              event.stopPropagation();

              if (post.author.username) {
                navigate(`/profile/${post.author?.username}`);
              }
            }
          }}
          aria-label={`View ${authorName}'s profile`}
        >
          <div className="post-card__avatar">
            {authorName.charAt(0).toUpperCase()}
          </div>

          <div className="post-card__author-info">
            <strong>{authorName}</strong>

            <span>
              @{post.author?.username ?? "unknown"}
            </span>
          </div>
        </div>

        {isOwner && (
          <div className="post-card__menu">
            <button
              type="button"
              className="post-card__menu-button"
              onClick={handleMenuToggle}
              aria-label="Post options"
              aria-expanded={menuOpen}
            >
              <MoreVertical size={18} />
            </button>

            {menuOpen && (
              <div
                className="post-card__menu-dropdown"
                onClick={(event) =>
                  event.stopPropagation()
                }
              >
                <button
                  type="button"
                  className="post-card__menu-item"
                  onClick={handleEdit}
                >
                  <Pencil size={16} />
                  Edit
                </button>

                <button
                  type="button"
                  className="post-card__menu-item post-card__menu-item--danger"
                  onClick={handleDelete}
                  disabled={deleting}
                >
                  <Trash2 size={16} />

                  {deleting
                    ? "Deleting..."
                    : "Delete"}
                </button>
              </div>
            )}
          </div>
        )}
      </header>

      <div className="post-card__body">
        <h2 className="post-card__title">
          {post.title}
        </h2>

        {post.thumbnail && (
          <div className="post-card__thumbnail">
            <img
              src={getImageUrl(post.thumbnail)}
              alt={post.title}
              loading="lazy"
            />
          </div>
        )}

        <p className="post-card__excerpt">
          {excerpt}
        </p>

        {post.code && (
          <div className="post-card__code-indicator">
            <span>
              {post.codeLanguage || "Code"}
            </span>

            <span>Code included</span>
          </div>
        )}
      </div>

      <footer className="post-card__footer">
        <button
          type="button"
          className={`post-card__action ${
            liked
              ? "post-card__action--liked"
              : ""
          }`}
          onClick={handleLike}
          disabled={liking}
          aria-label={
            liked
              ? "Unlike post"
              : "Like post"
          }
        >
          <Heart
            size={18}
            fill={
              liked
                ? "currentColor"
                : "none"
            }
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

          <span>{post.commentCount}</span>
        </button>
      </footer>
    </article>
  );
}

export default PostCard;
