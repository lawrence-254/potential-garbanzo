import { Link } from "react-router-dom";
import { Heart, MessageCircle } from "lucide-react";

import type { SearchPost } from "../../../services/api/searchApii";

import "./SearchPostResult.css";

interface SearchPostResultProps {
  post: SearchPost;
}

export default function SearchPostResult({
  post,
}: SearchPostResultProps) {
  return (
    <article className="search-post-result">
      <div className="search-post-result__header">
        <Link
          to={`/profile/${post.author.username}`}
          className="search-post-result__author"
        >
          <div className="search-post-result__avatar">
            {post.author.avatar ? (
              <img
                src={post.author.avatar}
                alt={post.author.displayName}
              />
            ) : (
              post.author.displayName
                .charAt(0)
                .toUpperCase()
            )}
          </div>

          <div>
            <strong>{post.author.displayName}</strong>
            <span>@{post.author.username}</span>
          </div>
        </Link>

        <time>
          {new Date(post.createdAt).toLocaleDateString()}
        </time>
      </div>

      <p className="search-post-result__content">
        {post.content}
      </p>

      {post.image && (
        <img
          className="search-post-result__image"
          src={post.image}
          alt=""
        />
      )}

      <div className="search-post-result__stats">
        <span>
          <Heart size={16} />
          {post._count.likes}
        </span>

        <span>
          <MessageCircle size={16} />
          {post._count.comments}
        </span>
      </div>
    </article>
  );
}