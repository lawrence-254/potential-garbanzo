import { Response } from "express";

import prisma from "../config/prisma";
import type { AuthRequest } from "../middlewares/authMiddleware";

function getOrderedUserIds(firstUserId: string, secondUserId: string) {
  return firstUserId < secondUserId
    ? { userOneId: firstUserId, userTwoId: secondUserId }
    : { userOneId: secondUserId, userTwoId: firstUserId };
}

export async function getConversations(req: AuthRequest, res: Response) {
  try {
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const conversations = await prisma.conversation.findMany({
      where: {
        OR: [{ userOneId: req.userId }, { userTwoId: req.userId }],
      },
      orderBy: {
        updatedAt: "desc",
      },
      include: {
        userOne: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true,
          },
        },
        userTwo: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true,
          },
        },
        messages: {
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
          select: {
            id: true,
            content: true,
            createdAt: true,
            senderId: true,
            receiverId: true,
            read: true,
          },
        },
        _count: {
          select: {
            messages: true,
          },
        },
      },
    });

    const conversationsWithUnreadCounts = await Promise.all(
      conversations.map(async (conversation) => {
        const unreadCount = await prisma.message.count({
          where: {
            conversationId: conversation.id,
            receiverId: req.userId, // Fixed: was incorrectly using undefined `userId`
            read: false,
          },
        });

        return {
          ...conversation,
          unreadCount,
        };
      }),
    );

    const formattedConversations = conversationsWithUnreadCounts.map(
      (conversation) => {
        const otherUser =
          conversation.userOneId === req.userId
            ? conversation.userTwo
            : conversation.userOne;

        return {
          id: conversation.id,
          createdAt: conversation.createdAt,
          updatedAt: conversation.updatedAt,
          otherUser,
          lastMessage: conversation.messages[0] ?? null,
          messageCount: conversation._count.messages,
          unreadCount: conversation.unreadCount,
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

export async function createConversation(req: AuthRequest, res: Response) {
  try {
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const { userId } = req.body;

    if (typeof userId !== "string" || !userId.trim()) {
      return res.status(400).json({
        success: false,
        message: "A user ID is required",
      });
    }

    if (userId === req.userId) {
      return res.status(400).json({
        success: false,
        message: "You cannot start a conversation with yourself",
      });
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        displayName: true,
        avatar: true,
      },
    });

    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const { userOneId, userTwoId } = getOrderedUserIds(req.userId, userId);

    const conversation = await prisma.conversation.upsert({
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
      include: {
        userOne: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true,
          },
        },
        userTwo: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true,
          },
        },
      },
    });

    const otherUser =
      conversation.userOneId === req.userId
        ? conversation.userTwo
        : conversation.userOne;

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

export async function getConversationMessages(
  req: AuthRequest,
  res: Response,
) {
  try {
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const { id } = req.params;

    if (typeof id !== "string" || !id.trim()) {
      return res.status(400).json({
        success: false,
        message: "Conversation ID is required",
      });
    }

    const conversation = await prisma.conversation.findUnique({
      where: { id },
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found",
      });
    }

    const isParticipant =
      conversation.userOneId === req.userId ||
      conversation.userTwoId === req.userId;

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: "You are not a participant in this conversation",
      });
    }

    const messages = await prisma.message.findMany({
      where: {
        conversationId: id,
      },
      orderBy: {
        createdAt: "asc",
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true,
          },
        },
      },
    });

    return res.status(200).json({
      success: true,
      messages,
    });
  } catch (error) {
    console.error("Get conversation messages error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve messages",
    });
  }
}

export async function sendMessage(req: AuthRequest, res: Response) {
  try {
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const { id } = req.params;

    if (typeof id !== "string" || !id.trim()) {
      return res.status(400).json({
        success: false,
        message: "Conversation ID is required",
      });
    }
    const { content } = req.body;

    if (typeof content !== "string" || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: "Message cannot be empty",
      });
    }

    const trimmedContent = content.trim();

    if (trimmedContent.length > 2000) {
      return res.status(400).json({
        success: false,
        message: "Message cannot exceed 2000 characters",
      });
    }

    const conversation = await prisma.conversation.findUnique({
      where: { id },
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found",
      });
    }

    const isParticipant =
      conversation.userOneId === req.userId ||
      conversation.userTwoId === req.userId;

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: "You are not a participant in this conversation",
      });
    }

    const receiverId =
      conversation.userOneId === req.userId
        ? conversation.userTwoId
        : conversation.userOneId;

    const message = await prisma.message.create({
      data: {
        content: trimmedContent,
        conversationId: id,
        senderId: req.userId,
        receiverId,
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true,
          },
        },
      },
    });

    // Keep conversation sorted by latest activity
    await prisma.conversation.update({
      where: { id: conversation.id },
      data: { updatedAt: new Date() },
    });

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

export async function markMessagesAsRead(req: AuthRequest, res: Response) {
  try {
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const { id } = req.params;

    if (typeof id !== "string" || !id.trim()) {
      return res.status(400).json({
        success: false,
        message: "Conversation ID is required",
      });
    };

    const conversation = await prisma.conversation.findUnique({
      where: { id },
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found",
      });
    }

    const isParticipant =
      conversation.userOneId === req.userId ||
      conversation.userTwoId === req.userId;

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: "You are not a participant in this conversation",
      });
    }

    await prisma.message.updateMany({
      where: {
        conversationId: id,
        receiverId: req.userId,
        read: false,
      },
      data: {
        read: true,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Messages marked as read",
    });
  } catch (error) {
    console.error("Mark messages as read error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to mark messages as read",
    });
  }
}
