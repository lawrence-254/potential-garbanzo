import {
  Heart,
  MessageCircle,
  MoreHorizontal,
  Share2,
} from "lucide-react";

import type { Post } from "../../../services/api/postApi";

import "./PostCard.css";

interface PostCardProps {
  post: Post;
}

export default function PostCard({
  post,
}: PostCardProps) {
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

        <button
          className="post-card__more"
          type="button"
          aria-label="Post options"
        >
          <MoreHorizontal size={20} />
        </button>
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
        <button type="button">
          <Heart size={19} />
          <span>0</span>
        </button>

        <button type="button">
          <MessageCircle size={19} />
          <span>0</span>
        </button>

        <button type="button">
          <Share2 size={19} />
        </button>
      </div>
    </article>
  );
}