import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";

import {
  ImagePlus,
  X,
  Code2,
  Trash2,
  Plus,
} from "lucide-react";

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

interface PostDraft {
  id: string;
  title: string;
  content: string;
  thumbnail: PreviewImage | null;
  images: PreviewImage[];
  code: string;
  codeLanguage: string;
  showCode: boolean;
}

interface CreatedPostResponse {
  success?: boolean;
  post?: {
    id?: string;
  };
}

const MAX_CONTENT_LENGTH = 5000;
const MAX_IMAGES = 8;
const MAX_THREAD_POSTS = 10;

const createDraft = (): PostDraft => ({
  id: crypto.randomUUID(),
  title: "",
  content: "",
  thumbnail: null,
  images: [],
  code: "",
  codeLanguage: "javascript",
  showCode: false,
});

export default function PostModal({
  isOpen,
  onClose,
  onPostCreated,
}: PostModalProps) {
  const [drafts, setDrafts] = useState<PostDraft[]>([
    createDraft(),
  ]);

  const [posting, setPosting] = useState(false);
  const [error, setError] = useState("");

  const thumbnailInputRefs = useRef<
    Record<string, HTMLInputElement | null>
  >({});

  const imagesInputRefs = useRef<
    Record<string, HTMLInputElement | null>
  >({});

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
      drafts.forEach((draft) => {
        if (draft.thumbnail) {
          URL.revokeObjectURL(draft.thumbnail.url);
        }

        draft.images.forEach((image) => {
          URL.revokeObjectURL(image.url);
        });
      });
    };
  }, [drafts]);

  if (!isOpen) {
    return null;
  }

  const updateDraft = (
    draftId: string,
    updates: Partial<PostDraft>,
  ) => {
    setDrafts((current) =>
      current.map((draft) =>
        draft.id === draftId
          ? {
              ...draft,
              ...updates,
            }
          : draft,
      ),
    );
  };

  const getDraft = (draftId: string) =>
    drafts.find((draft) => draft.id === draftId);

  const handleThumbnailChange = (
    draftId: string,
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("Thumbnail must be an image.");
      event.target.value = "";
      return;
    }

    const draft = getDraft(draftId);

    if (!draft) {
      return;
    }

    if (draft.thumbnail) {
      URL.revokeObjectURL(draft.thumbnail.url);
    }

    updateDraft(draftId, {
      thumbnail: {
        file,
        url: URL.createObjectURL(file),
      },
    });

    setError("");
    event.target.value = "";
  };

  const handleImagesChange = (
    draftId: string,
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const selectedFiles = Array.from(
      event.target.files ?? [],
    );

    const imageFiles = selectedFiles.filter((file) =>
      file.type.startsWith("image/"),
    );

    const draft = getDraft(draftId);

    if (!draft) {
      return;
    }

    const remainingSlots =
      MAX_IMAGES - draft.images.length;

    const filesToAdd = imageFiles.slice(
      0,
      remainingSlots,
    );

    const newImages = filesToAdd.map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));

    updateDraft(draftId, {
      images: [
        ...draft.images,
        ...newImages,
      ],
    });

    if (imageFiles.length > remainingSlots) {
      setError(
        `You can add a maximum of ${MAX_IMAGES} additional pictures per post.`,
      );
    } else {
      setError("");
    }

    event.target.value = "";
  };

  const removeThumbnail = (draftId: string) => {
    const draft = getDraft(draftId);

    if (!draft?.thumbnail) {
      return;
    }

    URL.revokeObjectURL(draft.thumbnail.url);

    updateDraft(draftId, {
      thumbnail: null,
    });
  };

  const removeImage = (
    draftId: string,
    index: number,
  ) => {
    const draft = getDraft(draftId);

    if (!draft) {
      return;
    }

    const image = draft.images[index];

    if (image) {
      URL.revokeObjectURL(image.url);
    }

    updateDraft(draftId, {
      images: draft.images.filter(
        (_, imageIndex) => imageIndex !== index,
      ),
    });
  };

  const addPostToThread = () => {
    if (drafts.length >= MAX_THREAD_POSTS) {
      setError(
        `A thread can contain a maximum of ${MAX_THREAD_POSTS} posts.`,
      );
      return;
    }

    setDrafts((current) => [
      ...current,
      createDraft(),
    ]);

    setError("");
  };

  const removePostFromThread = (
    draftId: string,
  ) => {
    if (drafts.length === 1) {
      return;
    }

    const draft = getDraft(draftId);

    if (draft) {
      if (draft.thumbnail) {
        URL.revokeObjectURL(draft.thumbnail.url);
      }

      draft.images.forEach((image) => {
        URL.revokeObjectURL(image.url);
      });
    }

    setDrafts((current) =>
      current.filter(
        (item) => item.id !== draftId,
      ),
    );

    setError("");
  };

  const validateDrafts = (): boolean => {
    for (let index = 0; index < drafts.length; index += 1) {
      const draft = drafts[index];

      if (!draft.title.trim()) {
        setError(
          `Please add a title to post ${index + 1}.`,
        );
        return false;
      }

      if (draft.title.trim().length > 200) {
        setError(
          `The title for post ${index + 1} cannot exceed 200 characters.`,
        );
        return false;
      }

      if (!draft.content.trim()) {
        setError(
          `Please add content to post ${index + 1}.`,
        );
        return false;
      }

      if (
        draft.content.trim().length >
        MAX_CONTENT_LENGTH
      ) {
        setError(
          `The content for post ${index + 1} cannot exceed ${MAX_CONTENT_LENGTH} characters.`,
        );
        return false;
      }

      if (draft.code.trim().length > 20000) {
        setError(
          `The code for post ${index + 1} cannot exceed 20000 characters.`,
        );
        return false;
      }
    }

    return true;
  };

  const createSinglePost = async (
    draft: PostDraft,
    previousPostId?: string,
  ): Promise<string> => {
    const formData = new FormData();

    formData.append(
      "title",
      draft.title.trim(),
    );

    formData.append(
      "content",
      draft.content.trim(),
    );

    if (draft.code.trim()) {
      formData.append(
        "code",
        draft.code.trim(),
      );
    }

    if (draft.codeLanguage) {
      formData.append(
        "codeLanguage",
        draft.codeLanguage,
      );
    }

    const allImages: File[] = [];

    if (draft.thumbnail?.file) {
      allImages.push(draft.thumbnail.file);
    }

    draft.images.forEach((image) => {
      allImages.push(image.file);
    });

    allImages.forEach((file) => {
      formData.append("images", file);
    });

    if (draft.thumbnail) {
      formData.append(
        "thumbnailIndex",
        "0",
      );
    }

    if (previousPostId) {
      formData.append(
        "previousPostId",
        previousPostId,
      );
    }

    const response =
      (await apiRequest("/posts", {
        method: "POST",
        body: formData,
      })) as CreatedPostResponse;

    const createdPostId = response.post?.id;

    if (!createdPostId) {
      throw new Error(
        "The server did not return the created post.",
      );
    }

    return createdPostId;
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (posting) {
      return;
    }

    if (!validateDrafts()) {
      return;
    }

    try {
      setPosting(true);
      setError("");

      let previousPostId: string | undefined;

      for (const draft of drafts) {
        previousPostId = await createSinglePost(
          draft,
          previousPostId,
        );
      }

      resetForm();
      onClose();
      onPostCreated?.();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to create thread.",
      );
    } finally {
      setPosting(false);
    }
  };

  const resetForm = () => {
    drafts.forEach((draft) => {
      if (draft.thumbnail) {
        URL.revokeObjectURL(draft.thumbnail.url);
      }

      draft.images.forEach((image) => {
        URL.revokeObjectURL(image.url);
      });
    });

    setDrafts([createDraft()]);
    setError("");

    thumbnailInputRefs.current = {};
    imagesInputRefs.current = {};
  };

  const handleClose = () => {
    if (posting) {
      return;
    }

    resetForm();
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
              {drafts.length > 1
                ? "Create a thread"
                : "Create a post"}
            </h2>

            <p>
              {drafts.length > 1
                ? `${drafts.length} posts will be published as one thread.`
                : "Share something with your community."}
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
          {drafts.map((draft, index) => (
            <section
              className="post-modal__thread-card"
              key={draft.id}
            >
              <div className="post-modal__thread-header">
                <div>
                  <span className="post-modal__thread-number">
                    Post {index + 1}
                  </span>

                  {index > 0 && (
                    <span className="post-modal__thread-connection">
                      Chained to post {index}
                    </span>
                  )}
                </div>

                {drafts.length > 1 && (
                  <button
                    type="button"
                    className="post-modal__remove-post"
                    onClick={() =>
                      removePostFromThread(
                        draft.id,
                      )
                    }
                    disabled={posting}
                  >
                    <Trash2 size={15} />
                    Remove
                  </button>
                )}
              </div>

              <div className="post-modal__field">
                <label
                  htmlFor={`post-title-${draft.id}`}
                >
                  Title
                </label>

                <input
                  id={`post-title-${draft.id}`}
                  type="text"
                  value={draft.title}
                  onChange={(event) =>
                    updateDraft(draft.id, {
                      title: event.target.value,
                    })
                  }
                  placeholder="Give your post a title"
                  maxLength={200}
                  disabled={posting}
                  required
                />
              </div>

              <div className="post-modal__content-input">
                <textarea
                  value={draft.content}
                  onChange={(event) =>
                    updateDraft(draft.id, {
                      content: event.target.value,
                    })
                  }
                  placeholder="What's on your mind?"
                  maxLength={MAX_CONTENT_LENGTH}
                  disabled={posting}
                />

                <span>
                  {draft.content.length}/
                  {MAX_CONTENT_LENGTH}
                </span>
              </div>

              <section className="post-modal__media">
                <div className="post-modal__section-header">
                  <div>
                    <strong>
                      Post thumbnail
                    </strong>

                    <p>
                      Choose the main image for
                      this post.
                    </p>
                  </div>

                  {!draft.thumbnail && (
                    <button
                      type="button"
                      className="post-modal__secondary-button"
                      onClick={() =>
                        thumbnailInputRefs.current[
                          draft.id
                        ]?.click()
                      }
                      disabled={posting}
                    >
                      <ImagePlus size={17} />
                      Add thumbnail
                    </button>
                  )}
                </div>

                <input
                  ref={(element) => {
                    thumbnailInputRefs.current[
                      draft.id
                    ] = element;
                  }}
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={(event) =>
                    handleThumbnailChange(
                      draft.id,
                      event,
                    )
                  }
                />

                {draft.thumbnail && (
                  <div className="post-modal__thumbnail">
                    <img
                      src={draft.thumbnail.url}
                      alt="Post thumbnail preview"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        removeThumbnail(
                          draft.id,
                        )
                      }
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
                      Add up to {MAX_IMAGES} more
                      pictures.
                    </p>
                  </div>

                  <button
                    type="button"
                    className="post-modal__secondary-button"
                    onClick={() =>
                      imagesInputRefs.current[
                        draft.id
                      ]?.click()
                    }
                    disabled={
                      posting ||
                      draft.images.length >=
                        MAX_IMAGES
                    }
                  >
                    <ImagePlus size={17} />
                    Add pictures
                  </button>
                </div>

                <input
                  ref={(element) => {
                    imagesInputRefs.current[
                      draft.id
                    ] = element;
                  }}
                  type="file"
                  accept="image/*"
                  multiple
                  hidden
                  onChange={(event) =>
                    handleImagesChange(
                      draft.id,
                      event,
                    )
                  }
                />

                {draft.images.length > 0 && (
                  <div className="post-modal__image-grid">
                    {draft.images.map(
                      (image, imageIndex) => (
                        <div
                          className="post-modal__image"
                          key={image.url}
                        >
                          <img
                            src={image.url}
                            alt={`Additional preview ${
                              imageIndex + 1
                            }`}
                          />

                          <button
                            type="button"
                            onClick={() =>
                              removeImage(
                                draft.id,
                                imageIndex,
                              )
                            }
                            disabled={posting}
                            aria-label={`Remove image ${
                              imageIndex + 1
                            }`}
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ),
                    )}
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
                      Add code when your post is
                      technical or
                      programming-related.
                    </p>
                  </div>

                  <button
                    type="button"
                    className="post-modal__secondary-button"
                    onClick={() =>
                      updateDraft(draft.id, {
                        showCode:
                          !draft.showCode,
                      })
                    }
                    disabled={posting}
                  >
                    {draft.showCode
                      ? "Remove code"
                      : "Add code"}
                  </button>
                </div>

                {draft.showCode && (
                  <div className="post-modal__code-editor">
                    <select
                      value={draft.codeLanguage}
                      onChange={(event) =>
                        updateDraft(draft.id, {
                          codeLanguage:
                            event.target.value,
                        })
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
                      value={draft.code}
                      onChange={(event) =>
                        updateDraft(draft.id, {
                          code: event.target.value,
                        })
                      }
                      placeholder="// Write your code here..."
                      disabled={posting}
                      spellCheck={false}
                    />
                  </div>
                )}
              </section>

              {index < drafts.length - 1 && (
                <div className="post-modal__thread-line">
                  <span />
                  <small>
                    Next post in thread
                  </small>
                  <span />
                </div>
              )}
            </section>
          ))}

          {drafts.length < MAX_THREAD_POSTS && (
            <button
              type="button"
              className="post-modal__add-post"
              onClick={addPostToThread}
              disabled={posting}
            >
              <Plus size={18} />
              Add another post
            </button>
          )}

          {error && (
            <div
              className="post-modal__error"
              role="alert"
            >
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
              {posting
                ? "Publishing..."
                : drafts.length > 1
                  ? `Publish thread (${drafts.length})`
                  : "Post"}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
}
