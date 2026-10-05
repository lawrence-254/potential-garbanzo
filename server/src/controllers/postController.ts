import { Response } from "express";
import prisma from "../config/prisma";
import type { AuthRequest } from "../middlewares/authMiddleware";
import {
  getTrimmedString,
  getOptionalTrimmedString,
  getBoundedNumber,
} from "../utils/validation";

function getPostId(req: AuthRequest): string | null {
  return getTrimmedString(req.params.id);
}

const authorSelect = {
  id: true,
  username: true,
  displayName: true,
  avatar: true,
};

const postInclude = (userId: string) => ({
  author: {
    select: authorSelect,
  },

  images: {
    orderBy: {
      createdAt: "asc" as const,
    },
  },

  _count: {
    select: {
      likes: true,
      comments: true,
    },
  },

  likes: {
    where: {
      userId,
    },
    select: {
      id: true,
    },
  },

  // Previous post in the chain.
  previousPost: {
    select: {
      id: true,
    },
  },

  // Next post is the inverse side of previousPostId.
  nextPost: {
    select: {
      id: true,
    },
  },
});

// GET /api/posts
// Supports: ?feed=following | ?feed=everyone
export async function getPosts(
  req: AuthRequest,
  res: Response,
): Promise<Response> {
  try {
    const userId = getTrimmedString(req.userId);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const feedQuery = getTrimmedString(req.query.feed);

    const feedType =
      feedQuery?.toLowerCase() === "everyone"
        ? "everyone"
        : "following";

    const limit = getBoundedNumber(
      req.query.limit,
      50,
      1,
      50,
    );

    const include = postInclude(userId);

    let posts;

    if (feedType === "everyone") {
      posts = await prisma.post.findMany({
        orderBy: {
          createdAt: "desc",
        },
        take: limit,
        include,
      });
    } else {
      posts = await prisma.post.findMany({
        where: {
          OR: [
            {
              authorId: userId,
            },
            {
              author: {
                followers: {
                  some: {
                    followerId: userId,
                  },
                },
              },
            },
          ],
        },

        orderBy: {
          createdAt: "desc",
        },

        take: limit,
        include,
      });
    }

    const formattedPosts = posts.map((post) => ({
      id: post.id,
      title: post.title,
      content: post.content,
      thumbnail: post.thumbnail,
      code: post.code,
      codeLanguage: post.codeLanguage,
      images: post.images,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      authorId: post.authorId,
      author: post.author,

      likeCount: post._count.likes,
      commentCount: post._count.comments,
      likedByCurrentUser: post.likes.length > 0,

      // Chain information.
      previousPostId: post.previousPost?.id ?? null,
      nextPostId: post.nextPost?.id ?? null,

      isChained: Boolean(
        post.previousPost?.id ||
          post.nextPost?.id,
      ),
    }));

    return res.status(200).json({
      success: true,
      posts: formattedPosts,
    });
  } catch (error) {
    console.error("Get posts error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve posts",
    });
  }
}

// POST /api/posts
//
// Optional body field:
// previousPostId
//
// If supplied, the new post is appended after the specified post.
export async function createPost(
  req: AuthRequest,
  res: Response,
): Promise<Response> {
  try {
    const userId = getTrimmedString(req.userId);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const {
      title,
      content,
      code,
      codeLanguage,
      thumbnailIndex,
      previousPostId,
    } = req.body;

    const files =
      req.files as Express.Multer.File[] | undefined;

    const cleanTitle = getTrimmedString(title);
    const cleanContent = getTrimmedString(content);
    const cleanCode = getOptionalTrimmedString(code);
    const cleanLanguage =
      getOptionalTrimmedString(codeLanguage);

    const cleanPreviousPostId =
      getOptionalTrimmedString(previousPostId);

    // -----------------------------
    // Basic validation
    // -----------------------------

    if (!cleanTitle) {
      return res.status(400).json({
        success: false,
        message: "Post title is required.",
      });
    }

    if (cleanTitle.length > 200) {
      return res.status(400).json({
        success: false,
        message: "Post title cannot exceed 200 characters.",
      });
    }

    if (!cleanContent) {
      return res.status(400).json({
        success: false,
        message: "Post content is required.",
      });
    }

    if (cleanContent.length > 5000) {
      return res.status(400).json({
        success: false,
        message:
          "Post content cannot exceed 5000 characters.",
      });
    }

    if (cleanCode && cleanCode.length > 20000) {
      return res.status(400).json({
        success: false,
        message: "Code cannot exceed 20000 characters.",
      });
    }

    if (cleanLanguage && cleanLanguage.length > 50) {
      return res.status(400).json({
        success: false,
        message:
          "Code language cannot exceed 50 characters.",
      });
    }

    // -----------------------------
    // Validate uploaded images
    // -----------------------------

    const uploadedFiles = files ?? [];

    if (uploadedFiles.length > 9) {
      return res.status(400).json({
        success: false,
        message: "A maximum of 9 images is allowed.",
      });
    }

    let selectedThumbnailIndex = 0;

    if (
      thumbnailIndex !== undefined &&
      thumbnailIndex !== null &&
      thumbnailIndex !== ""
    ) {
      const parsedIndex = Number(thumbnailIndex);

      if (
        !Number.isInteger(parsedIndex) ||
        parsedIndex < 0 ||
        parsedIndex >= uploadedFiles.length
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid thumbnail selection.",
        });
      }

      selectedThumbnailIndex = parsedIndex;
    }

    const thumbnailFile =
      uploadedFiles.length > 0
        ? uploadedFiles[selectedThumbnailIndex]
        : null;

    const additionalImages = uploadedFiles.filter(
      (_, index) => index !== selectedThumbnailIndex,
    );

    const thumbnailUrl = thumbnailFile
      ? `/uploads/posts/${thumbnailFile.filename}`
      : null;

    // -----------------------------
    // Validate chain
    // -----------------------------

    let previousPost: {
      id: string;
      authorId: string;
      nextPost: {
        id: string;
      } | null;
    } | null = null;

    if (cleanPreviousPostId) {
      previousPost = await prisma.post.findUnique({
        where: {
          id: cleanPreviousPostId,
        },

        select: {
          id: true,
          authorId: true,

          nextPost: {
            select: {
              id: true,
            },
          },
        },
      });

      if (!previousPost) {
        return res.status(404).json({
          success: false,
          message:
            "The post you are trying to chain from was not found.",
        });
      }

      // Only the owner can extend their own chain.
      if (previousPost.authorId !== userId) {
        return res.status(403).json({
          success: false,
          message:
            "You can only chain posts to your own posts.",
        });
      }

      // A post can only have one direct successor.
      if (previousPost.nextPost) {
        return res.status(409).json({
          success: false,
          message:
            "This post already has a chained post.",
        });
      }
    }

    // -----------------------------
    // Create post
    // -----------------------------

    const post = await prisma.post.create({
      data: {
        title: cleanTitle,
        content: cleanContent,
        thumbnail: thumbnailUrl,
        code: cleanCode,
        codeLanguage: cleanLanguage,
        authorId: userId,

        // If this is a chained post, point it to
        // the previous post.
        ...(previousPost
          ? {
              previousPostId: previousPost.id,
            }
          : {}),

        images: {
          create: additionalImages.map((file) => ({
            url: `/uploads/posts/${file.filename}`,
          })),
        },
      },

      include: postInclude(userId),
    });

    return res.status(201).json({
      success: true,

      message: previousPost
        ? "Post added to chain successfully"
        : "Post created successfully",

      post: {
        ...post,

        likeCount: post._count.likes,
        commentCount: post._count.comments,
        likedByCurrentUser: false,

        previousPostId:
          post.previousPost?.id ?? null,

        nextPostId:
          post.nextPost?.id ?? null,

        isChained: Boolean(
          post.previousPost?.id ||
            post.nextPost?.id,
        ),
      },
    });
  } catch (error) {
    console.error("Create post error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create post",
    });
  }
}

// GET /api/posts/:id
export async function getPost(
  req: AuthRequest,
  res: Response,
): Promise<Response> {
  try {
    const userId = getTrimmedString(req.userId);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const id = getPostId(req);

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Post ID is required.",
      });
    }

    const post = await prisma.post.findUnique({
      where: {
        id,
      },

      include: postInclude(userId),
    });

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    return res.status(200).json({
      success: true,

      post: {
        id: post.id,
        title: post.title,
        content: post.content,
        thumbnail: post.thumbnail,
        code: post.code,
        codeLanguage: post.codeLanguage,
        images: post.images,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
        authorId: post.authorId,
        author: post.author,

        likeCount: post._count.likes,
        commentCount: post._count.comments,
        likedByCurrentUser: post.likes.length > 0,

        previousPostId:
          post.previousPost?.id ?? null,

        nextPostId:
          post.nextPost?.id ?? null,

        isChained: Boolean(
          post.previousPost?.id ||
            post.nextPost?.id,
        ),
      },
    });
  } catch (error) {
    console.error("Get post error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load post",
    });
  }
}

// DELETE /api/posts/:id
export async function deletePost(
  req: AuthRequest,
  res: Response,
): Promise<Response> {
  try {
    const userId = getTrimmedString(req.userId);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const id = getPostId(req);

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Post ID is required",
      });
    }

    const post = await prisma.post.findUnique({
      where: {
        id,
      },

      select: {
        id: true,
        authorId: true,
      },
    });

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    if (post.authorId !== userId) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own posts",
      });
    }

    await prisma.post.delete({
      where: {
        id,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Post deleted successfully",
    });
  } catch (error) {
    console.error("Delete post error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete post",
    });
  }
}

// GET /api/posts/me
export async function getMyPosts(
  req: AuthRequest,
  res: Response,
): Promise<Response> {
  try {
    const userId = getTrimmedString(req.userId);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const limit = getBoundedNumber(
      req.query.limit,
      50,
      1,
      50,
    );

    const posts = await prisma.post.findMany({
      where: {
        authorId: userId,
      },

      orderBy: {
        createdAt: "desc",
      },

      take: limit,

      include: postInclude(userId),
    });

    const formattedPosts = posts.map((post) => ({
      id: post.id,
      title: post.title,
      content: post.content,
      thumbnail: post.thumbnail,
      code: post.code,
      codeLanguage: post.codeLanguage,
      images: post.images,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      authorId: post.authorId,
      author: post.author,

      likeCount: post._count.likes,
      commentCount: post._count.comments,
      likedByCurrentUser: post.likes.length > 0,

      previousPostId:
        post.previousPost?.id ?? null,

      nextPostId:
        post.nextPost?.id ?? null,

      isChained: Boolean(
        post.previousPost?.id ||
          post.nextPost?.id,
      ),
    }));

    return res.status(200).json({
      success: true,
      posts: formattedPosts,
    });
  } catch (error) {
    console.error("Get my posts error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve your posts",
    });
  }
}


// import { Response } from "express";
// import prisma from "../config/prisma";
// import type { AuthRequest } from "../middlewares/authMiddleware";
// import {
//   getTrimmedString,
//   getOptionalTrimmedString,
//   getBoundedNumber,
// } from "../utils/validation";

// function getPostId(req: AuthRequest): string | null {
//   return getTrimmedString(req.params.id);
// }

// const authorSelect = {
//   id: true,
//   username: true,
//   displayName: true,
//   avatar: true,
// };

// const postInclude = (userId: string) => ({
//   author: {
//     select: authorSelect,
//   },
//   images: {
//     orderBy: {
//       createdAt: "asc" as const,
//     },
//   },
//   _count: {
//     select: {
//       likes: true,
//       comments: true,
//     },
//   },
//   likes: {
//     where: {
//       userId,
//     },
//     select: {
//       id: true,
//     },
//   },
//   previousPost: {
//     select: {
//       id: true,
//     },
//   },
//   nextPost: {
//     select: {
//       id: true,
//     },
//   },
// });

// // GET /api/posts
// // Supports: ?feed=following | ?feed=everyone
// export async function getPosts(
//   req: AuthRequest,
//   res: Response,
// ): Promise<Response> {
//   try {
//     const userId = getTrimmedString(req.userId);

//     if (!userId) {
//       return res.status(401).json({
//         success: false,
//         message: "Authentication required",
//       });
//     }

//     const feedQuery = getTrimmedString(req.query.feed);
//     const feedType =
//       feedQuery?.toLowerCase() === "everyone"
//         ? "everyone"
//         : "following";

//     const limit = getBoundedNumber(
//       req.query.limit,
//       50,
//       1,
//       50,
//     );

//     const include = postInclude(userId);

//     let posts;

//     if (feedType === "everyone") {
//       posts = await prisma.post.findMany({
//         orderBy: {
//           createdAt: "desc",
//         },
//         take: limit,
//         include,
//       });
//     } else {
//       posts = await prisma.post.findMany({
//         where: {
//           OR: [
//             {
//               authorId: userId,
//             },
//             {
//               author: {
//                 followers: {
//                   some: {
//                     followerId: userId,
//                   },
//                 },
//               },
//             },
//           ],
//         },
//         orderBy: {
//           createdAt: "desc",
//         },
//         take: limit,
//         include,
//       });
//     }

//     const formattedPosts = posts.map((post) => ({
//       id: post.id,
//       title: post.title,
//       content: post.content,
//       thumbnail: post.thumbnail,
//       code: post.code,
//       codeLanguage: post.codeLanguage,
//       images: post.images,
//       createdAt: post.createdAt,
//       updatedAt: post.updatedAt,
//       authorId: post.authorId,
//       author: post.author,
//       likeCount: post._count.likes,
//       commentCount: post._count.comments,
//       likedByCurrentUser: post.likes.length > 0,

//       // Chain information
//       previousPostId: post.previousPost?.id ?? null,
//       nextPostId: post.nextPost?.id ?? null,
//       isChained: Boolean(
//         post.previousPost?.id || post.nextPost?.id,
//       ),
//     }));

//     return res.status(200).json({
//       success: true,
//       posts: formattedPosts,
//     });
//   } catch (error) {
//     console.error("Get posts error:", error);

//     return res.status(500).json({
//       success: false,
//       message: "Failed to retrieve posts",
//     });
//   }
// }

// // POST /api/posts
// //
// // Optional body field:
// // previousPostId
// //
// // If supplied, the new post is appended after the specified post.
// export async function createPost(
//   req: AuthRequest,
//   res: Response,
// ): Promise<Response> {
//   try {
//     const userId = getTrimmedString(req.userId);

//     if (!userId) {
//       return res.status(401).json({
//         success: false,
//         message: "Authentication required",
//       });
//     }

//     const {
//       title,
//       content,
//       code,
//       codeLanguage,
//       thumbnailIndex,
//       previousPostId,
//     } = req.body;

//     const files =
//       req.files as Express.Multer.File[] | undefined;

//     const cleanTitle = getTrimmedString(title);
//     const cleanContent = getTrimmedString(content);
//     const cleanCode = getOptionalTrimmedString(code);
//     const cleanLanguage =
//       getOptionalTrimmedString(codeLanguage);
//     const cleanPreviousPostId =
//       getOptionalTrimmedString(previousPostId);

//     // -----------------------------
//     // Basic validation
//     // -----------------------------

//     if (!cleanTitle) {
//       return res.status(400).json({
//         success: false,
//         message: "Post title is required.",
//       });
//     }

//     if (cleanTitle.length > 200) {
//       return res.status(400).json({
//         success: false,
//         message: "Post title cannot exceed 200 characters.",
//       });
//     }

//     if (!cleanContent) {
//       return res.status(400).json({
//         success: false,
//         message: "Post content is required.",
//       });
//     }

//     if (cleanContent.length > 5000) {
//       return res.status(400).json({
//         success: false,
//         message:
//           "Post content cannot exceed 5000 characters.",
//       });
//     }

//     if (cleanCode && cleanCode.length > 20000) {
//       return res.status(400).json({
//         success: false,
//         message: "Code cannot exceed 20000 characters.",
//       });
//     }

//     if (cleanLanguage && cleanLanguage.length > 50) {
//       return res.status(400).json({
//         success: false,
//         message:
//           "Code language cannot exceed 50 characters.",
//       });
//     }

//     // -----------------------------
//     // Validate uploaded images
//     // -----------------------------

//     const uploadedFiles = files ?? [];

//     if (uploadedFiles.length > 9) {
//       return res.status(400).json({
//         success: false,
//         message: "A maximum of 9 images is allowed.",
//       });
//     }

//     let selectedThumbnailIndex = 0;

//     if (
//       thumbnailIndex !== undefined &&
//       thumbnailIndex !== null &&
//       thumbnailIndex !== ""
//     ) {
//       const parsedIndex = Number(thumbnailIndex);

//       if (
//         !Number.isInteger(parsedIndex) ||
//         parsedIndex < 0 ||
//         parsedIndex >= uploadedFiles.length
//       ) {
//         return res.status(400).json({
//           success: false,
//           message: "Invalid thumbnail selection.",
//         });
//       }

//       selectedThumbnailIndex = parsedIndex;
//     }

//     const thumbnailFile =
//       uploadedFiles.length > 0
//         ? uploadedFiles[selectedThumbnailIndex]
//         : null;

//     const additionalImages = uploadedFiles.filter(
//       (_, index) => index !== selectedThumbnailIndex,
//     );

//     const thumbnailUrl = thumbnailFile
//       ? `/uploads/posts/${thumbnailFile.filename}`
//       : null;

//     // -----------------------------
//     // Validate chain
//     // -----------------------------

//     let previousPost: {
//       id: string;
//       authorId: string;
//       nextPostId: string | null;
//     } | null = null;

//     if (cleanPreviousPostId) {
//       previousPost = await prisma.post.findUnique({
//         where: {
//           id: cleanPreviousPostId,
//         },
//         select: {
//           id: true,
//           authorId: true,
//           nextPostId: true,
//         },
//       });

//       if (!previousPost) {
//         return res.status(404).json({
//           success: false,
//           message: "The post you are trying to chain from was not found.",
//         });
//       }

//       // Only the owner can extend their own chain.
//       if (previousPost.authorId !== userId) {
//         return res.status(403).json({
//           success: false,
//           message: "You can only chain posts to your own posts.",
//         });
//       }

//       // A post can only have one direct successor.
//       if (previousPost.nextPostId) {
//         return res.status(409).json({
//           success: false,
//           message:
//             "This post already has a chained post.",
//         });
//       }
//     }

//     // -----------------------------
//     // Create post + connect chain
//     // -----------------------------

//     const post = await prisma.$transaction(async (tx) => {
//       const createdPost = await tx.post.create({
//         data: {
//           title: cleanTitle,
//           content: cleanContent,
//           thumbnail: thumbnailUrl,
//           code: cleanCode,
//           codeLanguage: cleanLanguage,
//           authorId: userId,

//           ...(previousPost
//             ? {
//                 previousPostId: previousPost.id,
//               }
//             : {}),

//           images: {
//             create: additionalImages.map((file) => ({
//               url: `/uploads/posts/${file.filename}`,
//             })),
//           },
//         },

//         include: {
//           ...postInclude(userId),
//         },
//       });

//       if (previousPost) {
//         await tx.post.update({
//           where: {
//             id: previousPost.id,
//           },
//           data: {
//             nextPostId: createdPost.id,
//           },
//         });
//       }

//       return createdPost;
//     });

//     return res.status(201).json({
//       success: true,
//       message: previousPost
//         ? "Post added to chain successfully"
//         : "Post created successfully",

//       post: {
//         ...post,
//         likeCount: post._count.likes,
//         commentCount: post._count.comments,
//         likedByCurrentUser: false,
//         previousPostId:
//           post.previousPost?.id ?? null,
//         nextPostId:
//           post.nextPost?.id ?? null,
//         isChained: Boolean(
//           post.previousPost?.id ||
//             post.nextPost?.id,
//         ),
//       },
//     });
//   } catch (error) {
//     console.error("Create post error:", error);

//     return res.status(500).json({
//       success: false,
//       message: "Failed to create post",
//     });
//   }
// }

// // GET /api/posts/:id
// export async function getPost(
//   req: AuthRequest,
//   res: Response,
// ): Promise<Response> {
//   try {
//     const userId = getTrimmedString(req.userId);

//     if (!userId) {
//       return res.status(401).json({
//         success: false,
//         message: "Authentication required",
//       });
//     }

//     const id = getPostId(req);

//     if (!id) {
//       return res.status(400).json({
//         success: false,
//         message: "Post ID is required.",
//       });
//     }

//     const post = await prisma.post.findUnique({
//       where: {
//         id,
//       },

//       include: postInclude(userId),
//     });

//     if (!post) {
//       return res.status(404).json({
//         success: false,
//         message: "Post not found",
//       });
//     }

//     return res.status(200).json({
//       success: true,

//       post: {
//         id: post.id,
//         title: post.title,
//         content: post.content,
//         thumbnail: post.thumbnail,
//         code: post.code,
//         codeLanguage: post.codeLanguage,
//         images: post.images,
//         createdAt: post.createdAt,
//         updatedAt: post.updatedAt,
//         authorId: post.authorId,
//         author: post.author,
//         likeCount: post._count.likes,
//         commentCount: post._count.comments,
//         likedByCurrentUser: post.likes.length > 0,

//         previousPostId:
//           post.previousPost?.id ?? null,
//         nextPostId:
//           post.nextPost?.id ?? null,
//         isChained: Boolean(
//           post.previousPost?.id ||
//             post.nextPost?.id,
//         ),
//       },
//     });
//   } catch (error) {
//     console.error("Get post error:", error);

//     return res.status(500).json({
//       success: false,
//       message: "Failed to load post",
//     });
//   }
// }

// // DELETE /api/posts/:id
// export async function deletePost(
//   req: AuthRequest,
//   res: Response,
// ): Promise<Response> {
//   try {
//     const userId = getTrimmedString(req.userId);

//     if (!userId) {
//       return res.status(401).json({
//         success: false,
//         message: "Authentication required",
//       });
//     }

//     const id = getPostId(req);

//     if (!id) {
//       return res.status(400).json({
//         success: false,
//         message: "Post ID is required",
//       });
//     }

//     const post = await prisma.post.findUnique({
//       where: {
//         id,
//       },
//       select: {
//         id: true,
//         authorId: true,
//       },
//     });

//     if (!post) {
//       return res.status(404).json({
//         success: false,
//         message: "Post not found",
//       });
//     }

//     if (post.authorId !== userId) {
//       return res.status(403).json({
//         success: false,
//         message: "You can only delete your own posts",
//       });
//     }

//     await prisma.post.delete({
//       where: {
//         id,
//       },
//     });

//     return res.status(200).json({
//       success: true,
//       message: "Post deleted successfully",
//     });
//   } catch (error) {
//     console.error("Delete post error:", error);

//     return res.status(500).json({
//       success: false,
//       message: "Failed to delete post",
//     });
//   }
// }

// // GET /api/posts/me
// export async function getMyPosts(
//   req: AuthRequest,
//   res: Response,
// ): Promise<Response> {
//   try {
//     const userId = getTrimmedString(req.userId);

//     if (!userId) {
//       return res.status(401).json({
//         success: false,
//         message: "Authentication required",
//       });
//     }

//     const limit = getBoundedNumber(
//       req.query.limit,
//       50,
//       1,
//       50,
//     );

//     const posts = await prisma.post.findMany({
//       where: {
//         authorId: userId,
//       },

//       orderBy: {
//         createdAt: "desc",
//       },

//       take: limit,

//       include: postInclude(userId),
//     });

//     const formattedPosts = posts.map((post) => ({
//       id: post.id,
//       title: post.title,
//       content: post.content,
//       thumbnail: post.thumbnail,
//       code: post.code,
//       codeLanguage: post.codeLanguage,
//       images: post.images,
//       createdAt: post.createdAt,
//       updatedAt: post.updatedAt,
//       authorId: post.authorId,
//       author: post.author,
//       likeCount: post._count.likes,
//       commentCount: post._count.comments,
//       likedByCurrentUser: post.likes.length > 0,

//       previousPostId:
//         post.previousPost?.id ?? null,
//       nextPostId:
//         post.nextPost?.id ?? null,
//       isChained: Boolean(
//         post.previousPost?.id ||
//           post.nextPost?.id,
//       ),
//     }));

//     return res.status(200).json({
//       success: true,
//       posts: formattedPosts,
//     });
//   } catch (error) {
//     console.error("Get my posts error:", error);

//     return res.status(500).json({
//       success: false,
//       message: "Failed to retrieve your posts",
//     });
//   }
// }
