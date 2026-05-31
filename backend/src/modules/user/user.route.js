import { Router } from "express";
import { requireAuth } from "../../lib/require-auth.js";
import { prisma } from "../../lib/db.js";

export const userRouter = Router();

userRouter.use(requireAuth);

// Get notification counts — must be BEFORE /:userId to avoid route shadowing
userRouter.get("/notifications/counts", async (req, res) => {
  try {
    const userId = req.user.id;

    const unreadMessagesCount = await prisma.message.count({
      where: {
        receiverId: userId,
        isRead: false,
      },
    });

    const pendingFriendRequestsCount = await prisma.friendRequest.count({
      where: {
        receiverId: userId,
        status: "PENDING",
      },
    });

    return res.json({
      unreadMessages: unreadMessagesCount,
      pendingFriendRequests: pendingFriendRequestsCount,
    });
  } catch (err) {
    return res
      .status(400)
      .json({ message: err.message || "Failed to fetch notification counts" });
  }
});

// Save push token — must be BEFORE /:userId to avoid route shadowing
userRouter.post("/push-token", async (req, res) => {
  try {
    const userId = req.user.id;
    const { pushToken } = req.body;
    
    console.log("Push token request:", { userId, pushToken: pushToken ? "present" : "missing" });
    
    if (!pushToken) {
      return res.status(400).json({ message: "Push token is required" });
    }

    await prisma.pushToken.upsert({
      where: {
        token: pushToken,
      },
      update: {
        userId: userId,
      },
      create: {
        token: pushToken,
        userId: userId,
      },
    });

    return res.json({ message: "Push token saved successfully" });
  } catch (error) {
    console.log("Error saving push token:", error);
    
    return res
      .status(400)
      .json({ message: error.message || "Failed to save push token" });
  }
});

// Get user info by ID — wildcard route must be LAST
userRouter.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json(user);
  } catch (err) {
    return res
      .status(400)
      .json({ message: err.message || "Failed to fetch user" });
  }
});