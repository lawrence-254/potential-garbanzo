import { FormEvent, useCallback, useEffect, useState } from "react";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Heart,
  MessageCircle,
  Send,
  Trash2,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

import { useAuth } from "../../context/authContext/authContext";
import {
  createComment,
  deleteComment,
  getComments,
} from "../../services/api/commentApi";
import { getPost } from "../../services/api/postApi";
import { likePost, unlikePost } from "../../services/api/likeApi";
import type { Comment } from "../../services/api/commentApi";
import type { Post } from "../../types/post";
import { getImageUrl } from "../../utils/imageUrl";
import PostModal from "../../components/post/PostModal/PostModal";

import "./PostDetails.css";

export default function PostDetails() {
  const navigate = useNavigate();
  const { postId } = useParams<{ postId: string }>();
  const { user } = useAuth();

  const [post, setPost] = useState<Post | null>(null);
  const [chainedPosts, setChainedPosts] = useState<Post[]>([]);
  const [chainLoading, setChainLoading] = useState(false);
  const [postModalOpen, setPostModalOpen] = useState(false);

  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [error, setError] = useState("");

  const [commentText, setCommentText] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [deletingCommentId, setDeletingCommentId] = useState<string | null>(null);

  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [liking, setLiking] = useState(false);

  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const loadPostAndChain = useCallback(async () => {
    if (!postId) {
      setError("Post ID is missing.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");
      setChainLoading(true);

      const data = await getPost(postId);

      setPost(data);
      setLiked(Boolean(data.likedByCurrentUser));
      setLikeCount(data.likeCount ?? 0);
      setCurrentImageIndex(0);

      // Load chained posts
      const chain: Post[] = [];
      const visited = new Set<string>([data.id]);
      let nextPostId = data.nextPostId;

      while (nextPostId && !visited.has(nextPostId)) {
        visited.add(nextPostId);
        const nextPost = await getPost(nextPostId);
        chain.push(nextPost);
        nextPostId = nextPost.nextPostId;
      }

      setChainedPosts(chain);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load post.");
      setPost(null);
      setChainedPosts([]);
    } finally {
      setLoading(false);
      setChainLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    loadPostAndChain();
  }, [loadPostAndChain]);

  useEffect(() => {
    if (!postId) return;

    const loadComments = async () => {
      try {
        setCommentsLoading(true);
        const data = await getComments(postId);
        setComments(data);
      } catch (err) {
        console.error("Failed to load comments:", err);
      } finally {
        setCommentsLoading(false);
      }
    };

    loadComments();
  }, [postId]);

  const handleOpenProfile = (
    event: React.MouseEvent<HTMLElement> | React.KeyboardEvent<HTMLElement>,
    username?: string,
  ) => {
    event.stopPropagation();
    if (!username) return;
    navigate(`/profile/${username}`);
  };

  const handleLike = async () => {
    if (!post || liking) return;

    try {
      setLiking(true);
      const response = liked
        ? await unlikePost(post.id)
        : await likePost(post.id);

      setLiked(response.liked);
      setLikeCount(response.likeCount);

      setPost((current) =>
        current
          ? {
              ...current,
              likedByCurrentUser: response.liked,
              likeCount: response.likeCount,
            }
          : current,
      );
    } catch (err) {
      console.error("Failed to update like:", err);
    } finally {
      setLiking(false);
    }
  };

  const handleSubmitComment = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!postId || !commentText.trim()) return;

    try {
      setSubmittingComment(true);
      const comment = await createComment(postId, commentText.trim());
      setComments((current) => [...current, comment]);
      setCommentText("");
    } catch (err) {
      window.alert(
        err instanceof Error ? err.message : "Failed to add comment.",
      );
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this comment?",
    );
    if (!confirmed) return;

    try {
      setDeletingCommentId(commentId);
      await deleteComment(commentId);
      setComments((current) =>
        current.filter((comment) => comment.id !== commentId),
      );
    } catch (err) {
      window.alert(
        err instanceof Error ? err.message : "Failed to delete comment.",
      );
    } finally {
      setDeletingCommentId(null);
    }
  };

  const goToPreviousImage = () => {
    if (!post || post.images.length <= 1) return;
    setCurrentImageIndex((current) =>
      current === 0 ? post.images.length - 1 : current - 1,
    );
  };

  const goToNextImage = () => {
    if (!post || post.images.length <= 1) return;
    setCurrentImageIndex((current) =>
      current === post.images.length - 1 ? 0 : current + 1,
    );
  };

  const goToImage = (index: number) => {
    setCurrentImageIndex(index);
  };

  if (loading) {
    return (
      <div className="post-details">
        <div className="post-details__status">Loading post...</div>
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
        <div className="post-details__status post-details__status--error">
          {error || "Post not found."}
        </div>
      </div>
    );
  }

  const authorName = post.author?.displayName?.trim() || "Unknown";
  const isAuthor =
    Boolean(user?.id) &&
    (user!.id === post.authorId || user!.id === post.author?.id);

  const hasImages = post.images.length > 0;
  const paragraphs = post.content
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
  const insertAfter = Math.min(2, paragraphs.length);

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

      <article className="post-details__post">
        <header className="post-details__author">
          <div
            className="post-details__author-link"
            onClick={(event) =>
              handleOpenProfile(event, post.author?.username)
            }
            role="link"
            tabIndex={0}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                handleOpenProfile(event, post.author?.username);
              }
            }}
            aria-label={`View ${authorName}'s profile`}
          >
            <div className="post-details__avatar">
              {authorName.charAt(0).toUpperCase()}
            </div>
            <div>
              <strong>{authorName}</strong>
              <span>@{post.author?.username ?? "unknown"}</span>
            </div>
          </div>
        </header>

        <div className="post-details__content">
          <h1>{post.title}</h1>

          {post.thumbnail && (
            <div className="post-details__thumbnail">
              <img src={getImageUrl(post.thumbnail)} alt={post.title} />
            </div>
          )}

          <div className="post-details__text">
            {paragraphs.map((paragraph, index) => (
              <div key={index}>
                <p>{paragraph}</p>

                {hasImages && index + 1 === insertAfter && (
                  <div
                    className="post-details__inline-carousel"
                    aria-label="Post image gallery"
                  >
                    <div className="post-details__carousel-stage">
                      <img
                        key={post.images[currentImageIndex].id}
                        className="post-details__carousel-image"
                        src={getImageUrl(post.images[currentImageIndex].url)}
                        alt={`Post image ${currentImageIndex + 1} of ${post.images.length}`}
                      />

                      {post.images.length > 1 && (
                        <>
                          <button
                            type="button"
                            className="post-details__carousel-button post-details__carousel-button--previous"
                            onClick={goToPreviousImage}
                            aria-label="Previous image"
                          >
                            <ChevronLeft size={22} />
                          </button>
                          <button
                            type="button"
                            className="post-details__carousel-button post-details__carousel-button--next"
                            onClick={goToNextImage}
                            aria-label="Next image"
                          >
                            <ChevronRight size={22} />
                          </button>
                          <div className="post-details__carousel-counter">
                            {currentImageIndex + 1} / {post.images.length}
                          </div>
                        </>
                      )}
                    </div>

                    {post.images.length > 1 && (
                      <div className="post-details__carousel-footer">
                        <div
                          className="post-details__carousel-dots"
                          aria-label="Choose image"
                        >
                          {post.images.map((image, imageIndex) => (
                            <button
                              key={image.id}
                              type="button"
                              className={`post-details__carousel-dot ${
                                imageIndex === currentImageIndex
                                  ? "post-details__carousel-dot--active"
                                  : ""
                              }`}
                              onClick={() => goToImage(imageIndex)}
                              aria-label={`Go to image ${imageIndex + 1}`}
                              aria-current={
                                imageIndex === currentImageIndex
                              }
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

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
          >
            <Heart size={20} fill={liked ? "currentColor" : "none"} />
            <span>{likeCount}</span>
          </button>

          <div className="post-details__action">
            <MessageCircle size={20} />
            <span>{comments.length}</span>
          </div>

          {/* Show "Add to post" only for the author */}
          {isAuthor && (
            <button type="button" onClick={() => setPostModalOpen(true)}>
              Add to post
            </button>
          )}
        </footer>
      </article>

      {/* Show chain section only when there are chained posts */}
      {(chainLoading || chainedPosts.length > 0) && (
        <section className="post-details__chain">
          <h2>Post chain</h2>

          {chainLoading ? (
            <p>Loading chained posts...</p>
          ) : (
            <div className="post-details__chain-list">
              {chainedPosts.map((chainedPost, index) => (
                <article
                  key={chainedPost.id}
                  className="post-details__chain-item"
                >
                  <p className="post-details__chain-number">
                    Part {index + 2}
                  </p>

                  <div className="post-details__chain-author">
                    <strong>{chainedPost.author?.displayName}</strong>
                    <span>@{chainedPost.author?.username}</span>
                  </div>

                  <h3>{chainedPost.title}</h3>
                  <p>{chainedPost.content}</p>

                  {chainedPost.thumbnail && (
                    <img
                      className="post-details__chain-image"
                      src={getImageUrl(chainedPost.thumbnail)}
                      alt={chainedPost.title}
                    />
                  )}

                  <button
                    type="button"
                    onClick={() => navigate(`/posts/${chainedPost.id}`)}
                  >
                    View post
                  </button>
                </article>
              ))}
            </div>
          )}
        </section>
      )}

      <section className="post-details__comments">
        <div className="post-details__comments-header">
          <h2>Comments</h2>
          <span>{comments.length}</span>
        </div>

        <form
          className="post-details__comment-form"
          onSubmit={handleSubmitComment}
        >
          <textarea
            value={commentText}
            onChange={(event) => setCommentText(event.target.value)}
            placeholder="Write a comment..."
            maxLength={500}
            rows={3}
            disabled={submittingComment}
          />
          <button
            type="submit"
            disabled={submittingComment || !commentText.trim()}
          >
            <Send size={17} />
            {submittingComment ? "Posting..." : "Comment"}
          </button>
        </form>

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
            {comments.map((comment) => {
              const commentAuthor =
                comment.author?.displayName?.trim() || "Unknown";
              const isCommentOwner = comment.author?.id === user?.id;

              return (
                <article key={comment.id} className="post-details__comment">
                  <div
                    className="post-details__comment-avatar"
                    onClick={(event) =>
                      handleOpenProfile(event, comment.author?.username)
                    }
                    role="link"
                    tabIndex={0}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        handleOpenProfile(event, comment.author?.username);
                      }
                    }}
                    aria-label={`View ${commentAuthor}'s profile`}
                  >
                    {commentAuthor.charAt(0).toUpperCase()}
                  </div>

                  <div className="post-details__comment-body">
                    <div className="post-details__comment-top">
                      <div>
                        <strong>{commentAuthor}</strong>
                        <span>
                          @{comment.author?.username ?? "unknown"}
                        </span>
                      </div>

                      {isCommentOwner && (
                        <button
                          type="button"
                          className="post-details__comment-delete"
                          onClick={() => handleDeleteComment(comment.id)}
                          disabled={deletingCommentId === comment.id}
                          aria-label="Delete comment"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                    <p>{comment.content}</p>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <PostModal
        isOpen={postModalOpen}
        onClose={() => setPostModalOpen(false)}
        onPostCreated={async () => {
          setPostModalOpen(false);
          await loadPostAndChain();
        }}
        previousPostId={post.id}
      />
    </div>
  );
}
// import { FormEvent, useEffect, useState } from "react";
// import {
//   ArrowLeft,
//   ChevronLeft,
//   ChevronRight,
//   Heart,
//   MessageCircle,
//   Send,
//   Trash2,
// } from "lucide-react";
// import { useNavigate, useParams } from "react-router-dom";

// import { useAuth } from "../../context/authContext/authContext";

// import {
//   createComment,
//   deleteComment,
//   getComments,
// } from "../../services/api/commentApi";

// import { getPost } from "../../services/api/postApi";

// import {
//   likePost,
//   unlikePost,
// } from "../../services/api/likeApi";

// import type { Comment } from "../../services/api/commentApi";
// import type { Post } from "../../types/post";

// import { getImageUrl } from "../../utils/imageUrl";
// import PostModal from "../../components/post/PostModal/PostModal";

// import "./PostDetails.css";

// export default function PostDetails() {
//   const navigate = useNavigate();
//   const { postId } = useParams<{ postId: string }>();
//   const { user } = useAuth();

//   const [post, setPost] = useState<Post | null>(null);
//   const [chainedPosts, setChainedPosts] = useState<Post[]>([]);
//   const [chainLoading, setChainLoading] = useState(false);
//   const [postModalOpen, setPostModalOpen] = useState(false);

//   const [comments, setComments] = useState<Comment[]>([]);

//   const [loading, setLoading] = useState(true);
//   const [commentsLoading, setCommentsLoading] = useState(true);

//   const [error, setError] = useState("");

//   const [commentText, setCommentText] = useState("");

//   const [submittingComment, setSubmittingComment] = useState(false);

//   const [deletingCommentId, setDeletingCommentId] =
//     useState<string | null>(null);

//   const [liked, setLiked] = useState(false);
//   const [likeCount, setLikeCount] = useState(0);
//   const [liking, setLiking] = useState(false);

//   const [currentImageIndex, setCurrentImageIndex] = useState(0);

//   useEffect(() => {
//     if (!postId) {
//       setError("Post ID is missing.");
//       setLoading(false);
//       return;
//     }

//     const loadPost = async () => {
//       try {
//         setLoading(true);
//         setError("");

//         const data = await getPost(postId);

//         setPost(data);
//         setLiked(data.likedByCurrentUser);
//         setLikeCount(data.likeCount);
//         setCurrentImageIndex(0);
//         setChainedPosts([]);
//         setChainLoading(true);

//         try {
//           const chain: Post[] = [];
//           const visited = new Set<string>([data.id]);
//           let nextPostId = data.nextPostId;

//           while (nextPostId && !visited.has(nextPostId)) {
//             visited.add(nextPostId);

//             const nextPost = await getPost(nextPostId);

//             chain.push(nextPost);
//             nextPostId = nextPost.nextPostId;
//           }

//           setChainedPosts(chain);
//         } catch (chainError) {
//           console.error("Failed to load chained posts:", chainError);
//         } finally {
//           setChainLoading(false);
//         }
//       } catch (error) {
//         setError(
//           error instanceof Error
//             ? error.message
//             : "Failed to load post.",
//         );
//       } finally {
//         setLoading(false);
//       }
//     };

//     loadPost();
//   }, [postId]);
// useEffect(()=>{
//   const loadPostChain = async () => {
//   if (!postId) return;

//   setLoading(true);
//   setError("");

//   try {
//     const data = await getPost(postId);

//     setPost(data);
//     setLiked(Boolean(data.likedByCurrentUser));
//     setLikeCount(data.likeCount ?? 0);
//     setCurrentImageIndex(0);

//     const chain: Post[] = [];
//     const visited = new Set<string>([data.id]);
//     let nextPostId = data.nextPostId;

//     while (nextPostId && !visited.has(nextPostId)) {
//       visited.add(nextPostId);

//       const chainedPost = await getPost(nextPostId);
//       chain.push(chainedPost);
//       nextPostId = chainedPost.nextPostId;
//     }

//     setChainedPosts(chain);
//   } catch (err) {
//     setError(
//       err instanceof Error ? err.message : "Failed to load post."
//     );
//   } finally {
//     setLoading(false);
//   }
// };
// loadPostChain();
// }, [postId])
//   useEffect(() => {
//     if (!postId) return;

//     const loadComments = async () => {
//       try {
//         setCommentsLoading(true);

//         const data = await getComments(postId);

//         setComments(data);
//       } catch (error) {
//         console.error("Failed to load comments:", error);
//       } finally {
//         setCommentsLoading(false);
//       }
//     };

//     loadComments();
//   }, [postId]);
//   const handleOpenProfile = (
//     event: React.MouseEvent<HTMLElement>,
//     username?: string,
//   ) => {
//     event.stopPropagation();

//     if (!username) return;

//     navigate(`/profile/${username}`);
//   };
//   const handleLike = async () => {
//     if (!post || liking) return;

//     try {
//       setLiking(true);

//       const response = liked
//         ? await unlikePost(post.id)
//         : await likePost(post.id);

//       setLiked(response.liked);
//       setLikeCount(response.likeCount);

//       setPost((current) =>
//         current
//           ? {
//               ...current,
//               likedByCurrentUser: response.liked,
//               likeCount: response.likeCount,
//             }
//           : current,
//       );
//     } catch (error) {
//       console.error("Failed to update like:", error);
//     } finally {
//       setLiking(false);
//     }
//   };

//   const handleSubmitComment = async (
//     event: FormEvent<HTMLFormElement>,
//   ) => {
//     event.preventDefault();

//     if (!postId || !commentText.trim()) {
//       return;
//     }

//     try {
//       setSubmittingComment(true);

//       const comment = await createComment(
//         postId,
//         commentText.trim(),
//       );

//       setComments((current) => [
//         ...current,
//         comment,
//       ]);

//       setCommentText("");
//     } catch (error) {
//       window.alert(
//         error instanceof Error
//           ? error.message
//           : "Failed to add comment.",
//       );
//     } finally {
//       setSubmittingComment(false);
//     }
//   };

//   const handleDeleteComment = async (
//     commentId: string,
//   ) => {
//     const confirmed = window.confirm(
//       "Are you sure you want to delete this comment?",
//     );

//     if (!confirmed) return;

//     try {
//       setDeletingCommentId(commentId);

//       await deleteComment(commentId);

//       setComments((current) =>
//         current.filter(
//           (comment) => comment.id !== commentId,
//         ),
//       );
//     } catch (error) {
//       window.alert(
//         error instanceof Error
//           ? error.message
//           : "Failed to delete comment.",
//       );
//     } finally {
//       setDeletingCommentId(null);
//     }
//   };

//   const goToPreviousImage = () => {
//     if (!post || post.images.length <= 1) return;

//     setCurrentImageIndex((current) =>
//       current === 0
//         ? post.images.length - 1
//         : current - 1,
//     );
//   };

//   const goToNextImage = () => {
//     if (!post || post.images.length <= 1) return;

//     setCurrentImageIndex((current) =>
//       current === post.images.length - 1
//         ? 0
//         : current + 1,
//     );
//   };

//   const goToImage = (index: number) => {
//     setCurrentImageIndex(index);
//   };

//   if (loading) {
//     return (
//       <div className="post-details">
//         <div className="post-details__status">
//           Loading post...
//         </div>
//       </div>
//     );
//   }

//   if (error || !post) {
//     return (
//       <div className="post-details">
//         <button
//           type="button"
//           className="post-details__back"
//           onClick={() => navigate(-1)}
//         >
//           <ArrowLeft size={18} />
//           Back
//         </button>

//         <div className="post-details__status post-details__status--error">
//           {error || "Post not found."}
//         </div>
//       </div>
//     );
//   }

//   const authorName =
//     post.author?.displayName?.trim() ||
//     "Unknown";

//   return (
//     <div className="post-details">
//       <button
//         type="button"
//         className="post-details__back"
//         onClick={() => navigate(-1)}
//       >
//         <ArrowLeft size={18} />
//         Back
//       </button>

//       <article className="post-details__post">
//         <header className="post-details__author">
//           <div
//             className="post-details__author-link"
//             onClick={(event) =>
//               handleOpenProfile(event, post.author?.username)
//             }
//             role="link"
//             tabIndex={0}
//             onKeyDown={(event) => {
//               if (
//                 event.key === "Enter" ||
//                 event.key === " "
//               ) {
//                 event.preventDefault();
//                 event.stopPropagation();

//                 if (post.authorId) {
//                   navigate(`/profile/${post.author.username}`);
//                 }
//               }
//             }}
//             aria-label={`View ${authorName}'s profile`}
//           >
//             <div className="post-details__avatar">
//               {authorName.charAt(0).toUpperCase()}
//             </div>

//             <div>
//               <strong>{authorName}</strong>

//               <span>
//                 @{post.author?.username ?? "unknown"}
//               </span>
//             </div>
//           </div>
//         </header>

//         <div className="post-details__content">
//           <h1>{post.title}</h1>
//           {post.thumbnail && (
//             <div className="post-details__thumbnail">
//               <img
//                 src={getImageUrl(post.thumbnail)}
//                 alt={post.title}
//               />
//             </div>
//           )}

//           <div className="post-details__text">
//             {(() => {
//               const paragraphs = post.content
//                 .split(/\n\s*\n/)
//                 .map((paragraph) => paragraph.trim())
//                 .filter(Boolean);

//               const hasImages = post.images.length > 0;

//               const insertAfter = Math.min(2, paragraphs.length);

//               return (
//                 <>
//                   {paragraphs.map((paragraph, index) => (
//                     <div key={index}>
//                       <p>{paragraph}</p>

//                       {hasImages && index + 1 === insertAfter && (
//                         <div
//                           className="post-details__inline-carousel"
//                           aria-label="Post image gallery"
//                         >
//                           <div className="post-details__carousel-stage">
//                             <img
//                               key={post.images[currentImageIndex].id}
//                               className="post-details__carousel-image"
//                               src={getImageUrl(
//                                 post.images[currentImageIndex].url,
//                               )}
//                               alt={`Post image ${
//                                 currentImageIndex + 1
//                               } of ${post.images.length}`}
//                             />

//                             {post.images.length > 1 && (
//                               <>
//                                 <button
//                                   type="button"
//                                   className="post-details__carousel-button post-details__carousel-button--previous"
//                                   onClick={goToPreviousImage}
//                                   aria-label="Previous image"
//                                 >
//                                   <ChevronLeft size={22} />
//                                 </button>

//                                 <button
//                                   type="button"
//                                   className="post-details__carousel-button post-details__carousel-button--next"
//                                   onClick={goToNextImage}
//                                   aria-label="Next image"
//                                 >
//                                   <ChevronRight size={22} />
//                                 </button>

//                                 <div className="post-details__carousel-counter">
//                                   {currentImageIndex + 1} /{" "}
//                                   {post.images.length}
//                                 </div>
//                               </>
//                             )}
//                           </div>

//                           {post.images.length > 1 && (
//                             <div className="post-details__carousel-footer">
//                               <div
//                                 className="post-details__carousel-dots"
//                                 aria-label="Choose image"
//                               >
//                                 {post.images.map((image, imageIndex) => (
//                                   <button
//                                     key={image.id}
//                                     type="button"
//                                     className={`post-details__carousel-dot ${
//                                       imageIndex === currentImageIndex
//                                         ? "post-details__carousel-dot--active"
//                                         : ""
//                                     }`}
//                                     onClick={() =>
//                                       goToImage(imageIndex)
//                                     }
//                                     aria-label={`Go to image ${
//                                       imageIndex + 1
//                                     }`}
//                                     aria-current={
//                                       imageIndex === currentImageIndex
//                                     }
//                                   />
//                                 ))}
//                               </div>
//                             </div>
//                           )}
//                         </div>
//                       )}
//                     </div>
//                   ))}
//                 </>
//               );
//             })()}
//           </div>



//           {post.code && (
//             <div className="post-details__code">
//               <div className="post-details__code-header">
//                 <span>
//                   {post.codeLanguage || "Code"}
//                 </span>
//               </div>

//               <pre>
//                 <code>{post.code}</code>
//               </pre>
//             </div>
//           )}
//         </div>

//         <footer className="post-details__actions">
//           <button
//             type="button"
//             className={`post-details__action ${
//               liked
//                 ? "post-details__action--liked"
//                 : ""
//             }`}
//             onClick={handleLike}
//             disabled={liking}
//           >
//             <Heart
//               size={20}
//               fill={
//                 liked ? "currentColor" : "none"
//               }
//             />
//             <span>{likeCount}</span>
//           </button>

//           <div className="post-details__action">
//             <MessageCircle size={20} />
//             <span>{comments.length}</span>
//           </div>
//           <button
//   type="button"
//   onClick={() => setPostModalOpen(true)}
// >
//   Add to post
// </button>
//         </footer>
//       </article>
//       <section className="post-details__chain">
//   <h2>Post chain</h2>

//   {chainLoading ? (
//     <p>Loading chained posts...</p>
//   ) : chainedPosts.length === 0 ? (
//     <p>No follow-up posts yet.</p>
//   ) : (
//     <div className="post-details__chain-list">
//       {chainedPosts.map((chainedPost, index) => (
//         <article
//           key={chainedPost.id}
//           className="post-details__chain-item"
//         >
//           <p className="post-details__chain-number">
//             Part {index + 2}
//           </p>

//           <div className="post-details__chain-author">
//             <strong>
//               {chainedPost.author.displayName}
//             </strong>
//             <span>@{chainedPost.author.username}</span>
//           </div>

//           <h3>{chainedPost.title}</h3>

//           <p>{chainedPost.content}</p>

//           {chainedPost.thumbnail && (
//             <img
//               className="post-details__chain-image"
//               src={getImageUrl(chainedPost.thumbnail)}
//               alt={chainedPost.title}
//             />
//           )}

//           <button
//             type="button"
//             onClick={() =>
//               navigate(`/posts/${chainedPost.id}`)
//             }
//           >
//             View post
//           </button>
//         </article>
//       ))}
//     </div>
//   )}
//       </section>
//       <section className="post-details__comments">
//         <div className="post-details__comments-header">
//           <h2>Comments</h2>
//           <span>{comments.length}</span>
//         </div>

//         <form
//           className="post-details__comment-form"
//           onSubmit={handleSubmitComment}
//         >
//           <textarea
//             value={commentText}
//             onChange={(event) =>
//               setCommentText(event.target.value)
//             }
//             placeholder="Write a comment..."
//             maxLength={500}
//             rows={3}
//             disabled={submittingComment}
//           />

//           <button
//             type="submit"
//             disabled={
//               submittingComment ||
//               !commentText.trim()
//             }
//           >
//             <Send size={17} />

//             {submittingComment
//               ? "Posting..."
//               : "Comment"}
//           </button>
//         </form>

//         {commentsLoading ? (
//           <div className="post-details__comments-status">
//             Loading comments...
//           </div>
//         ) : comments.length === 0 ? (
//           <div className="post-details__comments-status">
//             No comments yet. Be the first to comment.
//           </div>
//         ) : (
//           <div className="post-details__comment-list">
//             {comments.map((comment) => {
//               const commentAuthor =
//                 comment.author?.displayName?.trim() ||
//                 "Unknown";

//               const isCommentOwner =
//                 comment.author?.id === user?.id;

//               return (
//                 <article
//                   key={comment.id}
//                   className="post-details__comment"
//                 >
//                   <div
//                     className="post-details__comment-avatar"
//                     onClick={(event) =>
//                       handleOpenProfile(event, comment.author?.username)
//                     }
//                     role="link"
//                     tabIndex={0}
//                     onKeyDown={(event) => {
//                       if (
//                         event.key === "Enter" ||
//                         event.key === " "
//                       ) {
//                         event.preventDefault();
//                         event.stopPropagation();

//                         if (comment.author?.id) {
//                           navigate(`/profile/${comment.author.username}`);
//                         }
//                       }
//                     }}
//                     aria-label={`View ${commentAuthor}'s profile`}
//                   >
//                     {commentAuthor.charAt(0).toUpperCase()}
//                   </div>

//                   <div className="post-details__comment-body">
//                     <div className="post-details__comment-top">
//                       <div>
//                         <strong>
//                           {commentAuthor}
//                         </strong>

//                         <span>
//                           @
//                           {comment.author?.username ??
//                             "unknown"}
//                         </span>
//                       </div>

//                       {isCommentOwner && (
//                         <button
//                           type="button"
//                           className="post-details__comment-delete"
//                           onClick={() =>
//                             handleDeleteComment(
//                               comment.id,
//                             )
//                           }
//                           disabled={
//                             deletingCommentId ===
//                             comment.id
//                           }
//                           aria-label="Delete comment"
//                         >
//                           <Trash2 size={16} />
//                         </button>
//                       )}
//                     </div>

//                     <p>{comment.content}</p>
//                   </div>
//                 </article>
//               );
//             })}
//           </div>
//         )}
//       </section>

//       <PostModal
//   isOpen={postModalOpen}
//   onClose={() => setPostModalOpen(false)}
//   onPostCreated={async () => {
//     setPostModalOpen(false);
//     await loadPostAndChain();
//   }}
//   previousPostId={post.id}
// />
//     </div>
//   );
// }
