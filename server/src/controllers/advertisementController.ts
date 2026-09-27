import { Response } from "express";

import prisma from "../config/prisma";
import type { AuthRequest } from "../middlewares/authMiddleware";

function isAdvertisementCurrentlyActive(ad: {
  isActive: boolean;
  startAt: Date | null;
  endAt: Date | null;
}) {
  const now = new Date();

  if (!ad.isActive) {
    return false;
  }

  if (ad.startAt && ad.startAt > now) {
    return false;
  }

  if (ad.endAt && ad.endAt < now) {
    return false;
  }

  return true;
}

// GET /api/advertisements
export async function getAdvertisements(
  req: AuthRequest,
  res: Response,
): Promise<Response> {
  try {
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const now = new Date();

    const advertisements = await prisma.advertisement.findMany({
      where: {
        isActive: true,

        AND: [
          {
            OR: [
              { startAt: null },
              { startAt: { lte: now } },
            ],
          },
          {
            OR: [
              { endAt: null },
              { endAt: { gte: now } },
            ],
          },
        ],
      },

      orderBy: {
        createdAt: "desc",
      },

      take: 3,

      select: {
        id: true,
        advertiser: true,
        title: true,
        description: true,
        imageUrl: true,
        targetUrl: true,
        ctaText: true,
      },
    });

    // Record an impression for each advert displayed.
    if (advertisements.length > 0) {
      await Promise.all(
        advertisements.map((advertisement) =>
          prisma.advertisement.update({
            where: {
              id: advertisement.id,
            },
            data: {
              impressions: {
                increment: 1,
              },
            },
          }),
        ),
      );
    }

    return res.status(200).json({
      success: true,
      advertisements,
    });
  } catch (error) {
    console.error("Get advertisements error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve advertisements",
    });
  }
}

// POST /api/advertisements/:id/click
export async function recordAdvertisementClick(
  req: AuthRequest,
  res: Response,
): Promise<Response> {
  try {
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Advertisement ID is required",
      });
    }

    const advertisement = await prisma.advertisement.findUnique({
      where: {
        id,
      },

      select: {
        id: true,
        targetUrl: true,
        isActive: true,
        startAt: true,
        endAt: true,
      },
    });

    if (!advertisement) {
      return res.status(404).json({
        success: false,
        message: "Advertisement not found",
      });
    }

    if (!isAdvertisementCurrentlyActive(advertisement)) {
      return res.status(410).json({
        success: false,
        message: "Advertisement is no longer active",
      });
    }

    await prisma.advertisement.update({
      where: {
        id: advertisement.id,
      },

      data: {
        clicks: {
          increment: 1,
        },
      },
    });

    return res.status(200).json({
      success: true,
      targetUrl: advertisement.targetUrl,
    });
  } catch (error) {
    console.error("Record advertisement click error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to record advertisement click",
    });
  }
}
