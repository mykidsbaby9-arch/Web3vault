import { Router } from "express";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();
const DEFAULT_USER_ID = 1;

router.get("/", async (req, res) => {
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, DEFAULT_USER_ID));
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json({
    address: user.address, username: user.username, avatarUrl: user.avatarUrl, bio: user.bio, email: user.email,
    joinedAt: user.createdAt?.toISOString(), notificationsEnabled: user.notificationsEnabled,
    twoFactorEnabled: user.twoFactorEnabled, preferredNetwork: user.preferredNetwork,
    securityScore: user.securityScore || 75, rewardPoints: user.rewardPoints || 0, tier: user.tier || "bronze",
  });
});

router.patch("/", async (req, res) => {
  const { username, bio, email, notificationsEnabled, preferredNetwork } = req.body;
  const updates: Record<string, unknown> = {};
  if (username !== undefined) updates.username = username;
  if (bio !== undefined) updates.bio = bio;
  if (email !== undefined) updates.email = email;
  if (notificationsEnabled !== undefined) updates.notificationsEnabled = notificationsEnabled;
  if (preferredNetwork !== undefined) updates.preferredNetwork = preferredNetwork;
  const [user] = await db.update(usersTable).set(updates).where(eq(usersTable.id, DEFAULT_USER_ID)).returning();
  res.json({
    address: user.address, username: user.username, avatarUrl: user.avatarUrl, bio: user.bio, email: user.email,
    joinedAt: user.createdAt?.toISOString(), notificationsEnabled: user.notificationsEnabled,
    twoFactorEnabled: user.twoFactorEnabled, preferredNetwork: user.preferredNetwork,
    securityScore: user.securityScore || 75, rewardPoints: user.rewardPoints || 0, tier: user.tier || "bronze",
  });
});

export default router;
