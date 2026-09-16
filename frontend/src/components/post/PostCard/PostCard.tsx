import {
  Heart,
  MessageCircle,
  MoreHorizontal,
  Share2,
  Trash2,
} from "lucide-react";
import { useState } from "react";

import { useAuth } from "../../../context/authContext/authContext";
import {deletePost, type Post } from "../../../services/api/postApi";
import {
  likePost,
  unlikePost,
} from "../../../services/api/likeApi";
import CommentSection from "../../comments/CommentSection/CommentSection";

import "./PostCard.css";

interface PostCardProps {
  post: Post;
  onPostDeleted: (postId: string)=>void;
}

export default function PostCard({
  post,
  onPostDeleted,
}: PostCardProps) {
  const { user } = useAuth();

  const [showMenu, setShowMenu] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [liked, setLiked] = useState(
  post.likedByCurrentUser,
);

const [likeCount, setLikeCount] = useState(
  post.likeCount,
);

const [likeLoading, setLikeLoading] =
  useState(false);
const [showComments, setShowComments] = useState(false);

  const isOwner = user?.id === post.authorId;
  const formattedDate = new Date(
    post.createdAt,
  ).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const avatarLetter =
    post.author.displayName
      ?.charAt(0)
      .toUpperCase() || "U";

      const handleDelete = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this post?",
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeleting(true);

      await deletePost(post.id);

      onPostDeleted(post.id);
    } catch (error) {
      window.alert(
        error instanceof Error
          ? error.message
          : "Failed to delete post.",
      );
    } finally {
      setDeleting(false);
      setShowMenu(false);
    }
  };

  const handleLike = async () => {
  if (likeLoading) {
    return;
  }

  try {
    setLikeLoading(true);

    if (liked) {
      const response = await unlikePost(post.id);

      setLiked(response.liked);
      setLikeCount(response.likeCount);
    } else {
      const response = await likePost(post.id);

      setLiked(response.liked);
      setLikeCount(response.likeCount);
    }
  } catch (error) {
    console.error("Like action failed:", error);
  } finally {
    setLikeLoading(false);
  }
};

  return (
    <article className="post-card">
      <div className="post-card__header">
        <div className="post-card__author">
          <div className="post-card__avatar">
            {post.author.avatar ? (
              <img
                src={post.author.avatar}
                alt={post.author.displayName}
              />
            ) : (
              avatarLetter
            )}
          </div>

          <div className="post-card__author-info">
            <strong>
              {post.author.displayName}
            </strong>

            <span>
              @{post.author.username} · {formattedDate}
            </span>
          </div>
        </div>
{isOwner && (
          <div className="post-card__menu">
            <button
              className="post-card__more"
              type="button"
              aria-label="Post options"
              onClick={() =>
                setShowMenu((current) => !current)
              }
            >
              <MoreHorizontal size={20} />
            </button>

            {showMenu && (
              <div className="post-card__dropdown">
                <button
                  type="button"
                  className="post-card__delete"
                  onClick={handleDelete}
                  disabled={deleting}
                >
                  <Trash2 size={16} />
                  {deleting
                    ? "Deleting..."
                    : "Delete post"}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="post-card__content">
        <p>{post.content}</p>

        {post.image && (
          <img
            className="post-card__image"
            src={post.image}
            alt="Post attachment"
          />
        )}
      </div>

      <div className="post-card__actions">
        <button
  type="button"
  className={
    liked
      ? "post-card__action post-card__action--liked"
      : "post-card__action"
  }
  onClick={handleLike}
  disabled={likeLoading}
  aria-label={
    liked
      ? "Unlike post"
      : "Like post"
  }
>
  <Heart
    size={19}
    fill={liked ? "currentColor" : "none"}
  />

  <span>{likeCount}</span>
</button>

        <button type="button"
        onClick={()=>setShowComments((current)=>!current)}
        >
          <MessageCircle size={19} />
          <span>{post.commentCount}</span>
        </button>

        <button type="button">
          <Share2 size={19} />
        </button>

      </div>
      {showComments && (<CommentSection postId={post.id}/>)}
    </article>
  );
}