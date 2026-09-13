import {
  useState,
  type FormEvent,
} from "react";

import { Image, Send } from "lucide-react";

import Button from "../../ui/Button/Button";
import { createPost } from "../../../services/api/postApi";

import "./CreatePost.css";

interface CreatePostProps {
  onPostCreated: () => void;
}

export default function CreatePost({
  onPostCreated,
}: CreatePostProps) {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    const trimmedContent = content.trim();

    if (!trimmedContent) {
      setError("Write something before posting.");
      return;
    }

    if (trimmedContent.length > 500) {
      setError("Your post cannot exceed 500 characters.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      await createPost({
        content: trimmedContent,
      });

      setContent("");
      onPostCreated();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to create post.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="create-post">
      <form
        className="create-post__form"
        onSubmit={handleSubmit}
      >
        <textarea
          className="create-post__textarea"
          value={content}
          onChange={(event) =>
            setContent(event.target.value)
          }
          placeholder="What's happening?"
          maxLength={500}
          rows={4}
          disabled={loading}
        />

        {error && (
          <p className="create-post__error">
            {error}
          </p>
        )}

        <div className="create-post__footer">
          <button
            type="button"
            className="create-post__image-button"
            disabled
            title="Image uploads coming soon"
          >
            <Image size={19} />
            <span>Image</span>
          </button>

          <div className="create-post__actions">
            <span className="create-post__counter">
              {content.length}/500
            </span>

            <Button
              type="submit"
              disabled={
                loading || !content.trim()
              }
            >
              <Send size={17} />
              {loading ? "Posting..." : "Post"}
            </Button>
          </div>
        </div>
      </form>
    </section>
  );
}