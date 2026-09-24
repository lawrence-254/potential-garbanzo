import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";

import { ImagePlus, X, Code2, Trash2 } from "lucide-react";
import { apiRequest } from "../../../services/api/api";

import "./PostModal.css";

interface PostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPostCreated?: () => void;
}

interface PreviewImage {
  file: File;
  url: string;
}

const MAX_CONTENT_LENGTH = 5000;
const MAX_IMAGES = 8;

export default function PostModal({
  isOpen,
  onClose,
  onPostCreated,
}: PostModalProps) {
  const [content, setContent] = useState("");

  const [thumbnail, setThumbnail] =
    useState<PreviewImage | null>(null);

  const [images, setImages] = useState<
    PreviewImage[]
  >([]);
const [title, setTitle] = useState("");
  const [code, setCode] = useState("");
  const [codeLanguage, setCodeLanguage] =
    useState("javascript");

  const [showCode, setShowCode] = useState(false);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState("");

  const thumbnailInputRef =
    useRef<HTMLInputElement | null>(null);

  const imagesInputRef =
    useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    document.body.classList.add("post-modal-open");

    return () => {
      document.body.classList.remove(
        "post-modal-open",
      );
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !posting) {
        onClose();
      }
    };

    document.addEventListener(
      "keydown",
      handleEscape,
    );

    return () => {
      document.removeEventListener(
        "keydown",
        handleEscape,
      );
    };
  }, [isOpen, onClose, posting]);

  useEffect(() => {
    return () => {
      if (thumbnail) {
        URL.revokeObjectURL(thumbnail.url);
      }

      images.forEach((image) => {
        URL.revokeObjectURL(image.url);
      });
    };
  }, [thumbnail, images]);

  if (!isOpen) {
    return null;
  }

  const handleThumbnailChange = (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("Thumbnail must be an image.");
      return;
    }

    if (thumbnail) {
      URL.revokeObjectURL(thumbnail.url);
    }

    setThumbnail({
      file,
      url: URL.createObjectURL(file),
    });

    setError("");
  };

  const handleImagesChange = (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const selectedFiles = Array.from(
      event.target.files ?? [],
    );

    const imageFiles = selectedFiles.filter((file) =>
      file.type.startsWith("image/"),
    );

    const remainingSlots =
      MAX_IMAGES - images.length;

    const filesToAdd = imageFiles.slice(
      0,
      remainingSlots,
    );

    const newImages = filesToAdd.map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));

    setImages((current) => [
      ...current,
      ...newImages,
    ]);

    if (imageFiles.length > remainingSlots) {
      setError(
        `You can add a maximum of ${MAX_IMAGES} additional pictures.`,
      );
    } else {
      setError("");
    }

    event.target.value = "";
  };

  const removeThumbnail = () => {
    if (thumbnail) {
      URL.revokeObjectURL(thumbnail.url);
    }

    setThumbnail(null);
  };

  const removeImage = (index: number) => {
    setImages((current) => {
      const image = current[index];

      if (image) {
        URL.revokeObjectURL(image.url);
      }

      return current.filter(
        (_, imageIndex) => imageIndex !== index,
      );
    });
  };

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (posting) {
      return;
    }
    if (!title.trim()) {
      setError("Please add a title.");
      return;
    }

    if (!content.trim()) {
      setError("Please add some content.");
      return;
    }

    try {
      setPosting(true);
      setError("");

      const formData = new FormData();
      formData.append(
        "title",
        title.trim()
      );
      formData.append(
        "content",
        content.trim()
      );

      if (code.trim()) {
        formData.append(
          "code",
          code.trim()
        );
      }

      if (codeLanguage) {
        formData.append(
          "codeLanguage",
          codeLanguage
        );
      }

      const allImages: File[] = [];

      if (thumbnail?.file) {
        allImages.push(thumbnail.file);
      }

      images.forEach((image) => {
        allImages.push(image.file);
      });

      allImages.forEach((file) => {
        formData.append("images", file);
      });

      if (thumbnail) {
        formData.append(
          "thumbnailIndex",
          "0"
        );
      }

      await apiRequest("/posts", {
        method: "POST",
        body: formData,
      });

      resetForm();
      onClose();
      onPostCreated?.();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to create post."
      );
    } finally {
      setPosting(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setContent("");

    if (thumbnail) {
      URL.revokeObjectURL(thumbnail.url);
    }

    images.forEach((image) => {
      URL.revokeObjectURL(image.url);
    });

    setThumbnail(null);
    setImages([]);

    setCode("");
    setCodeLanguage("javascript");
    setShowCode(false);
    setError("");
  };

  const handleClose = () => {
    if (posting) {
      return;
    }

    onClose();
  };

  return (
    <div
      className="post-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="post-modal-title"
    >
      <button
        type="button"
        className="post-modal__backdrop"
        onClick={handleClose}
        aria-label="Close post composer"
      />

      <div className="post-modal__content">
        <header className="post-modal__header">
          <div>
            <h2 id="post-modal-title">
              Create a post
            </h2>

            <p>
              Share something with your community.
            </p>
          </div>

          <button
            type="button"
            className="post-modal__close"
            onClick={handleClose}
            disabled={posting}
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </header>

        <form
          className="post-modal__form"
          onSubmit={handleSubmit}
        >
          <div className="post-modal__field">
            <label htmlFor="post-title">
              Title
            </label>

            <input
              id="post-title"
              type="text"
              value={title}
              onChange={(event) =>
                setTitle(event.target.value)
              }
              placeholder="Give your post a title"
              maxLength={200}
              required
            />
          </div>
          <div className="post-modal__content-input">
            <textarea
              value={content}
              onChange={(event) =>
                setContent(event.target.value)
              }
              placeholder="What's on your mind?"
              maxLength={MAX_CONTENT_LENGTH}
              disabled={posting}
            />

            <span>
              {content.length}/{MAX_CONTENT_LENGTH}
            </span>
          </div>

          <section className="post-modal__media">
            <div className="post-modal__section-header">
              <div>
                <strong>Post thumbnail</strong>
                <p>
                  Choose the main image for your post.
                </p>
              </div>

              {!thumbnail && (
                <button
                  type="button"
                  className="post-modal__secondary-button"
                  onClick={() =>
                    thumbnailInputRef.current?.click()
                  }
                  disabled={posting}
                >
                  <ImagePlus size={17} />
                  Add thumbnail
                </button>
              )}
            </div>

            <input
              ref={thumbnailInputRef}
              type="file"
              accept="image/*"
              hidden
              onChange={handleThumbnailChange}
            />

            {thumbnail && (
              <div className="post-modal__thumbnail">
                <img
                  src={thumbnail.url}
                  alt="Post thumbnail preview"
                />

                <button
                  type="button"
                  onClick={removeThumbnail}
                  disabled={posting}
                  aria-label="Remove thumbnail"
                >
                  <Trash2 size={17} />
                </button>
              </div>
            )}
          </section>

          <section className="post-modal__media">
            <div className="post-modal__section-header">
              <div>
                <strong>
                  Additional pictures
                </strong>

                <p>
                  Add up to {MAX_IMAGES} more pictures.
                </p>
              </div>

              <button
                type="button"
                className="post-modal__secondary-button"
                onClick={() =>
                  imagesInputRef.current?.click()
                }
                disabled={
                  posting ||
                  images.length >= MAX_IMAGES
                }
              >
                <ImagePlus size={17} />
                Add pictures
              </button>
            </div>

            <input
              ref={imagesInputRef}
              type="file"
              accept="image/*"
              multiple
              hidden
              onChange={handleImagesChange}
            />

            {images.length > 0 && (
              <div className="post-modal__image-grid">
                {images.map((image, index) => (
                  <div
                    className="post-modal__image"
                    key={image.url}
                  >
                    <img
                      src={image.url}
                      alt={`Additional preview ${index + 1}`}
                    />

                    <button
                      type="button"
                      onClick={() =>
                        removeImage(index)
                      }
                      disabled={posting}
                      aria-label={`Remove image ${
                        index + 1
                      }`}
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="post-modal__code">
            <div className="post-modal__section-header">
              <div>
                <strong>
                  <Code2 size={17} />
                  Code
                </strong>

                <p>
                  Add code when your post is technical
                  or programming-related.
                </p>
              </div>

              <button
                type="button"
                className="post-modal__secondary-button"
                onClick={() =>
                  setShowCode((current) => !current)
                }
                disabled={posting}
              >
                {showCode
                  ? "Remove code"
                  : "Add code"}
              </button>
            </div>

            {showCode && (
              <div className="post-modal__code-editor">
                <select
                  value={codeLanguage}
                  onChange={(event) =>
                    setCodeLanguage(
                      event.target.value,
                    )
                  }
                  disabled={posting}
                >
                  <option value="javascript">
                    JavaScript
                  </option>

                  <option value="typescript">
                    TypeScript
                  </option>

                  <option value="python">
                    Python
                  </option>

                  <option value="java">
                    Java
                  </option>

                  <option value="csharp">
                    C#
                  </option>

                  <option value="cpp">
                    C++
                  </option>

                  <option value="php">
                    PHP
                  </option>

                  <option value="html">
                    HTML
                  </option>

                  <option value="css">
                    CSS
                  </option>

                  <option value="sql">
                    SQL
                  </option>

                  <option value="bash">
                    Bash
                  </option>

                  <option value="json">
                    JSON
                  </option>

                  <option value="other">
                    Other
                  </option>
                </select>

                <textarea
                  value={code}
                  onChange={(event) =>
                    setCode(event.target.value)
                  }
                  placeholder="// Write your code here..."
                  disabled={posting}
                  spellCheck={false}
                />
              </div>
            )}
          </section>

          {error && (
            <div className="post-modal__error">
              {error}
            </div>
          )}

          <footer className="post-modal__footer">
            <button
              type="button"
              className="post-modal__cancel"
              onClick={handleClose}
              disabled={posting}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="post-modal__submit"
              disabled={posting}
            >
              {posting ? "Posting..." : "Post"}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
}
