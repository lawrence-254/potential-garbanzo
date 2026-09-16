import { useEffect, useState } from "react";
import { Send, Trash2 } from "lucide-react";

import { useAuth } from "../../../context/authContext/authContext";

import {
  createComment,
  deleteComment,
  getComments,
  type Comment,
} from "../../../services/api/commentApi";

import "./CommentSection.css";

interface CommentSectionProps {
  postId: string;
}

export default function CommentSection({
  postId,
}: CommentSectionProps) {
  const { user } = useAuth();

  const [comments, setComments] = useState<Comment[]>([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadComments = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getComments(postId);
        setComments(data);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Failed to load comments",
        );
      } finally {
        setLoading(false);
      }
    };

    loadComments();
  }, [postId]);

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (!content.trim() || submitting) {
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const newComment = await createComment(
        postId,
        content,
      );

      setComments((currentComments) => [
        ...currentComments,
        newComment,
      ]);

      setContent("");
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to create comment",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    try {
      setError("");

      await deleteComment(commentId);

      setComments((currentComments) =>
        currentComments.filter(
          (comment) => comment.id !== commentId,
        ),
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to delete comment",
      );
    }
  };

  return (
    <section className="comment-section">
      <form
        className="comment-section__form"
        onSubmit={handleSubmit}
      >
        <input
          type="text"
          value={content}
          onChange={(event) =>
            setContent(event.target.value)
          }
          placeholder="Write a comment..."
          maxLength={500}
          disabled={submitting}
        />

        <button
          type="submit"
          disabled={!content.trim() || submitting}
          aria-label="Post comment"
        >
          <Send size={17} />
        </button>
      </form>

      {error && (
        <p className="comment-section__error">
          {error}
        </p>
      )}

      {loading ? (
        <p className="comment-section__status">
          Loading comments...
        </p>
      ) : comments.length === 0 ? (
        <p className="comment-section__status">
          No comments yet. Be the first to comment.
        </p>
      ) : (
        <div className="comment-section__list">
          {comments.map((comment) => (
            <article
              className="comment"
              key={comment.id}
            >
              <div className="comment__avatar">
                {comment.author.avatar ? (
                  <img
                    src={comment.author.avatar}
                    alt={comment.author.displayName}
                  />
                ) : (
                  comment.author.displayName
                    .charAt(0)
                    .toUpperCase()
                )}
              </div>

              <div className="comment__body">
                <div className="comment__header">
                  <div>
                    <strong>
                      {comment.author.displayName}
                    </strong>

                    <span>
                      @{comment.author.username}
                    </span>
                  </div>

                  {user?.id === comment.authorId && (
                    <button
                      type="button"
                      className="comment__delete"
                      onClick={() =>
                        handleDelete(comment.id)
                      }
                      aria-label="Delete comment"
                    >
                      <Trash2 size={15} />
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
  );
}