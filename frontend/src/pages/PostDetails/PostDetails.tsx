import { FormEvent, useEffect, useState } from "react";
import {
  ArrowLeft,
  Heart,
  MessageCircle,
  Send,
  Trash2,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

import { getPost } from "../../services/api/postApi";
import {
  createComment,
  deleteComment,
  getComments,
} from "../../services/api/commentApi";
import {
  likePost,
  unlikePost,
} from "../../services/api/likeApi";

import type { Post } from "../../types/post";
import type { Comment } from "../../services/api/commentApi";

import { useAuth } from "../../context/authContext/authContext";

import { getImageUrl } from "../../utils/imageUrl";

import "./PostDetails.css";

function PostDetails() {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [post, setPost] = useState<Post | null>(null);

  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState("");

  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  const [loading, setLoading] = useState(true);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [liking, setLiking] = useState(false);
  const [commentSubmitting, setCommentSubmitting] =
    useState(false);
  const [deletingCommentId, setDeletingCommentId] =
    useState<string | null>(null);

  const [error, setError] = useState("");
  const [commentError, setCommentError] = useState("");

  useEffect(() => {
    if (!postId) {
      setError("Post not found.");
      setLoading(false);
      return;
    }

    const loadPost = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getPost(postId);

        setPost(data);
        // Safe access
        setLikeCount((data.likes ?? []).length);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Failed to load post."
        );
      } finally {
        setLoading(false);
      }
    };

    loadPost();
  }, [postId]);

  useEffect(() => {
    if (!post || !user) {
      return;
    }

    // Safe access – this was the crashing line
    const likes = post.likes ?? [];
    setLiked(likes.some((like) => like.userId === user.id));
  }, [post, user]);

  useEffect(() => {
    if (!postId) {
      return;
    }

    const loadComments = async () => {
      try {
        setCommentsLoading(true);
        setCommentError("");

        const data = await getComments(postId);

        setComments(data);
      } catch (error) {
        setCommentError(
          error instanceof Error
            ? error.message
            : "Failed to load comments."
        );
      } finally {
        setCommentsLoading(false);
      }
    };

    loadComments();
  }, [postId]);

  const handleLike = async () => {
    if (!postId || liking) {
      return;
    }

    try {
      setLiking(true);

      const response = liked
        ? await unlikePost(postId)
        : await likePost(postId);

      setLiked(response.liked);
      setLikeCount(response.likeCount);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to update like."
      );
    } finally {
      setLiking(false);
    }
  };

  const handleSubmitComment = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!postId || !commentText.trim() || commentSubmitting) {
      return;
    }

    try {
      setCommentSubmitting(true);
      setCommentError("");

      const newComment = await createComment(
        postId,
        commentText.trim()
      );

      setComments((current) => [...current, newComment]);
      setCommentText("");
    } catch (error) {
      setCommentError(
        error instanceof Error
          ? error.message
          : "Failed to add comment."
      );
    } finally {
      setCommentSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (deletingCommentId) {
      return;
    }

    try {
      setDeletingCommentId(commentId);
      setCommentError("");

      await deleteComment(commentId);

      setComments((current) =>
        current.filter((comment) => comment.id !== commentId)
      );
    } catch (error) {
      setCommentError(
        error instanceof Error
          ? error.message
          : "Failed to delete comment."
      );
    } finally {
      setDeletingCommentId(null);
    }
  };

  if (loading) {
    return (
      <div className="post-details">
        <div className="post-details__status">
          Loading post...
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="post-details">
        <button
          type="button"
          className="post-details__back"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={18} />
          Back
        </button>

        <div className="post-details__status">
          {error || "Post not found."}
        </div>
      </div>
    );
  }

  // Safe derived values
  const images = post.images ?? [];
  const authorName = post.author?.name ?? "Unknown";
  const authorUsername = post.author?.username ?? "unknown";

  return (
    <div className="post-details">
      <button
        type="button"
        className="post-details__back"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft size={18} />
        Back
      </button>

      <article className="post-details__card">
        <header className="post-details__author">
          <div className="post-details__avatar">
            {authorName.charAt(0).toUpperCase()}
          </div>

          <div>
            <h2>{authorName}</h2>
            <p>@{authorUsername}</p>
          </div>
        </header>

        <div className="post-details__content">
          <h1>{post.title}</h1>

          <p className="post-details__text">{post.content}</p>

          {post.thumbnail && (
            <div className="post-details__thumbnail">
              <img
                src={getImageUrl(post.thumbnail)}
                alt={post.title}
              />
            </div>
          )}

          {images.length > 0 && (
            <div className="post-details__gallery">
              {images.map((image) => (
                <img
                  key={image.id}
                  src={getImageUrl(image.url)}
                  alt=""
                />
              ))}
            </div>
          )}

          {post.code && (
            <div className="post-details__code">
              <div className="post-details__code-header">
                <span>{post.codeLanguage || "Code"}</span>
              </div>

              <pre>
                <code>{post.code}</code>
              </pre>
            </div>
          )}
        </div>

        <footer className="post-details__actions">
          <button
            type="button"
            className={`post-details__action ${
              liked ? "post-details__action--liked" : ""
            }`}
            onClick={handleLike}
            disabled={liking}
            aria-label={liked ? "Unlike post" : "Like post"}
          >
            <Heart
              size={20}
              fill={liked ? "currentColor" : "none"}
            />
            <span>{likeCount}</span>
          </button>

          <span className="post-details__action">
            <MessageCircle size={20} />
            <span>{comments.length}</span>
          </span>
        </footer>

        <section className="post-details__comments">
          <h2>Comments</h2>

          <form
            className="post-details__comment-form"
            onSubmit={handleSubmitComment}
          >
            <textarea
              value={commentText}
              onChange={(event) =>
                setCommentText(event.target.value)
              }
              placeholder="Write a comment..."
              rows={3}
              maxLength={1000}
            />

            <button
              type="submit"
              disabled={
                commentSubmitting || !commentText.trim()
              }
            >
              <Send size={18} />
              {commentSubmitting ? "Posting..." : "Comment"}
            </button>
          </form>

          {commentError && (
            <p className="post-details__comment-error">
              {commentError}
            </p>
          )}

          {commentsLoading ? (
            <div className="post-details__comments-status">
              Loading comments...
            </div>
          ) : comments.length === 0 ? (
            <div className="post-details__comments-status">
              No comments yet. Be the first to comment.
            </div>
          ) : (
            <div className="post-details__comment-list">
              {comments.map((comment) => (
                <article
                  key={comment.id}
                  className="post-details__comment"
                >
                  <div className="post-details__comment-avatar">
                    {(comment.author?.displayName ?? "?")
                      .charAt(0)
                      .toUpperCase()}
                  </div>

                  <div className="post-details__comment-body">
                    <div className="post-details__comment-header">
                      <div>
                        <strong>
                          {comment.author?.displayName ??
                            "Unknown"}
                        </strong>
                        <span>
                          @{comment.author?.username ?? "unknown"}
                        </span>
                      </div>

                      {user?.id === comment.author?.id && (
                        <button
                          type="button"
                          onClick={() =>
                            handleDeleteComment(comment.id)
                          }
                          disabled={
                            deletingCommentId === comment.id
                          }
                          aria-label="Delete comment"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>

                    <p>{comment.content}</p>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </article>
    </div>
  );
}

export default PostDetails;
