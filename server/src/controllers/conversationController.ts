import { Response } from "express";
import prisma from "../config/prisma";
import type { AuthRequest } from "../middlewares/authMiddleware";

const userSelect = {
  id: true,
  username: true,
  displayName: true,
  avatar: true,
} as const;

const messageSelect = {
  id: true,
  content: true,
  createdAt: true,
  senderId: true,
  receiverId: true,
  read: true,
} as const;

const MAX_MESSAGE_LENGTH = 2000;
const DEFAULT_MESSAGE_LIMIT = 50;
const MAX_MESSAGE_LIMIT = 100;

function getOrderedUserIds(firstUserId: string, secondUserId: string) {
  return firstUserId < secondUserId
    ? {
        userOneId: firstUserId,
        userTwoId: secondUserId,
      }
    : {
        userOneId: secondUserId,
        userTwoId: firstUserId,
      };
}

function isConversationParticipant(
  conversation: {
    userOneId: string;
    userTwoId: string;
  },
  userId: string,
) {
  return (
    conversation.userOneId === userId ||
    conversation.userTwoId === userId
  );
}

function getOtherUser<T extends { id: string }>(
  conversation: {
    userOneId: string;
    userTwoId: string;
    userOne: T;
    userTwo: T;
  },
  userId: string,
) {
  return conversation.userOneId === userId
    ? conversation.userTwo
    : conversation.userOne;
}

/**
 * GET /api/conversations
 */
export async function getConversations(
  req: AuthRequest,
  res: Response,
) {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const conversations = await prisma.conversation.findMany({
      where: {
        OR: [
          { userOneId: userId },
          { userTwoId: userId },
        ],
      },

      orderBy: {
        updatedAt: "desc",
      },

      select: {
        id: true,
        createdAt: true,
        updatedAt: true,

        userOneId: true,
        userTwoId: true,

        userOne: {
          select: userSelect,
        },

        userTwo: {
          select: userSelect,
        },

        messages: {
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
          select: messageSelect,
        },

        _count: {
          select: {
            messages: true,
          },
        },
      },
    });

    if (conversations.length === 0) {
      return res.status(200).json({
        success: true,
        conversations: [],
      });
    }

    /*
     * Fetch all unread counts in ONE query instead of
     * running one count query for every conversation.
     */
    const unreadCounts = await prisma.message.groupBy({
      by: ["conversationId"],
      where: {
        conversationId: {
          in: conversations.map(
            (conversation) => conversation.id,
          ),
        },
        receiverId: userId,
        read: false,
      },
      _count: {
        _all: true,
      },
    });

    const unreadCountMap = new Map(
      unreadCounts.map((item) => [
        item.conversationId,
        item._count._all,
      ]),
    );

    const formattedConversations = conversations.map(
      (conversation) => {
        const otherUser = getOtherUser(
          conversation,
          userId,
        );

        return {
          id: conversation.id,
          createdAt: conversation.createdAt,
          updatedAt: conversation.updatedAt,
          otherUser,
          lastMessage:
            conversation.messages[0] ?? null,
          messageCount: conversation._count.messages,
          unreadCount:
            unreadCountMap.get(conversation.id) ?? 0,
        };
      },
    );

    return res.status(200).json({
      success: true,
      conversations: formattedConversations,
    });
  } catch (error) {
    console.error("Get conversations error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve conversations",
    });
  }
}

/**
 * POST /api/conversations
 *
 * Creates a conversation if it doesn't already exist.
 * Returns the existing conversation when one is already present.
 */
export async function createConversation(
  req: AuthRequest,
  res: Response,
) {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const { userId: targetUserId } = req.body;

    if (
      typeof targetUserId !== "string" ||
      !targetUserId.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "A user ID is required",
      });
    }

    const normalizedTargetUserId = targetUserId.trim();

    if (normalizedTargetUserId === userId) {
      return res.status(400).json({
        success: false,
        message: "You cannot start a conversation with yourself",
      });
    }

    const targetUser = await prisma.user.findUnique({
      where: {
        id: normalizedTargetUserId,
      },
      select: userSelect,
    });

    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const {
      userOneId,
      userTwoId,
    } = getOrderedUserIds(
      userId,
      normalizedTargetUserId,
    );

    const conversation =
      await prisma.conversation.upsert({
        where: {
          userOneId_userTwoId: {
            userOneId,
            userTwoId,
          },
        },

        update: {},

        create: {
          userOneId,
          userTwoId,
        },

        select: {
          id: true,
          createdAt: true,
          updatedAt: true,

          userOneId: true,
          userTwoId: true,

          userOne: {
            select: userSelect,
          },

          userTwo: {
            select: userSelect,
          },
        },
      });

    const otherUser = getOtherUser(
      conversation,
      userId,
    );

    return res.status(200).json({
      success: true,
      conversation: {
        id: conversation.id,
        createdAt: conversation.createdAt,
        updatedAt: conversation.updatedAt,
        otherUser,
      },
    });
  } catch (error) {
    console.error("Create conversation error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create conversation",
    });
  }
}

/**
 * GET /api/conversations/:id/messages
 */
export async function getConversationMessages(
  req: AuthRequest,
  res: Response,
) {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const conversationId = req.params.id;

    if (
      typeof conversationId !== "string" ||
      !conversationId.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Conversation ID is required",
      });
    }

    const conversation =
      await prisma.conversation.findUnique({
        where: {
          id: conversationId,
        },
        select: {
          id: true,
          userOneId: true,
          userTwoId: true,
        },
      });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found",
      });
    }

    if (
      !isConversationParticipant(
        conversation,
        userId,
      )
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You are not a participant in this conversation",
      });
    }

    const page = Math.max(
      Number(req.query.page) || 1,
      1,
    );

    const limit = Math.min(
      Math.max(
        Number(req.query.limit) ||
          DEFAULT_MESSAGE_LIMIT,
        1,
      ),
      MAX_MESSAGE_LIMIT,
    );

    const skip = (page - 1) * limit;

    /*
     * Fetch newest messages first for efficient pagination.
     * Reverse them before returning so the UI receives
     * chronological order.
     */
    const [messages, totalMessages] =
      await Promise.all([
        prisma.message.findMany({
          where: {
            conversationId,
          },
          orderBy: {
            createdAt: "desc",
          },
          skip,
          take: limit,

          select: {
            ...messageSelect,

            sender: {
              select: userSelect,
            },
          },
        }),

        prisma.message.count({
          where: {
            conversationId,
          },
        }),
      ]);

    const chronologicalMessages =
      messages.reverse();

    const hasMore = skip + messages.length < totalMessages;

    return res.status(200).json({
      success: true,
      messages: chronologicalMessages,
      page,
      limit,
      totalMessages,
      hasMore,
    });
  } catch (error) {
    console.error(
      "Get conversation messages error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve messages",
    });
  }
}

/**
 * POST /api/conversations/:id/messages
 */
export async function sendMessage(
  req: AuthRequest,
  res: Response,
) {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const conversationId = req.params.id;

    if (
      typeof conversationId !== "string" ||
      !conversationId.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Conversation ID is required",
      });
    }

    const { content } = req.body;

    if (typeof content !== "string") {
      return res.status(400).json({
        success: false,
        message: "Message content is required",
      });
    }

    const trimmedContent = content.trim();

    if (!trimmedContent) {
      return res.status(400).json({
        success: false,
        message: "Message cannot be empty",
      });
    }

    if (trimmedContent.length > MAX_MESSAGE_LENGTH) {
      return res.status(400).json({
        success: false,
        message: `Message cannot exceed ${MAX_MESSAGE_LENGTH} characters`,
      });
    }

    const conversation =
      await prisma.conversation.findUnique({
        where: {
          id: conversationId,
        },
        select: {
          id: true,
          userOneId: true,
          userTwoId: true,
        },
      });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found",
      });
    }

    if (
      !isConversationParticipant(
        conversation,
        userId,
      )
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You are not a participant in this conversation",
      });
    }

    const receiverId =
      conversation.userOneId === userId
        ? conversation.userTwoId
        : conversation.userOneId;

    /*
     * Message creation and conversation activity
     * update happen in the same transaction.
     */
    const message = await prisma.$transaction(
      async (tx) => {
        const createdMessage =
          await tx.message.create({
            data: {
              content: trimmedContent,
              conversationId,
              senderId: userId,
              receiverId,
            },

            select: {
              ...messageSelect,

              sender: {
                select: userSelect,
              },
            },
          });

        await tx.conversation.update({
          where: {
            id: conversationId,
          },
          data: {
            updatedAt: new Date(),
          },
        });

        return createdMessage;
      },
    );

    return res.status(201).json({
      success: true,
      message,
    });
  } catch (error) {
    console.error("Send message error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to send message",
    });
  }
}

/**
 * PATCH /api/conversations/:id/read
 */
export async function markMessagesAsRead(
  req: AuthRequest,
  res: Response,
) {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const conversationId = req.params.id;

    if (
      typeof conversationId !== "string" ||
      !conversationId.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Conversation ID is required",
      });
    }

    const conversation =
      await prisma.conversation.findUnique({
        where: {
          id: conversationId,
        },
        select: {
          id: true,
          userOneId: true,
          userTwoId: true,
        },
      });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found",
      });
    }

    if (
      !isConversationParticipant(
        conversation,
        userId,
      )
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You are not a participant in this conversation",
      });
    }

    const result =
      await prisma.message.updateMany({
        where: {
          conversationId,
          receiverId: userId,
          read: false,
        },
        data: {
          read: true,
        },
      });

    return res.status(200).json({
      success: true,
      message: "Messages marked as read",
      updatedCount: result.count,
    });
  } catch (error) {
    console.error(
      "Mark messages as read error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message: "Failed to mark messages as read",
    });
  }
}
