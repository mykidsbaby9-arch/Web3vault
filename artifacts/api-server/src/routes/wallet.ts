import { Router } from "express";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

router.post("/connect", async (req, res) => {
  const { address, chainId, signature, message } = req.body;
  let [user] = await db.select().from(usersTable).where(eq(usersTable.address, address.toLowerCase()));
  const isNewUser = !user;
  if (!user) {
    const referralCode = `WV-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    [user] = await db.insert(usersTable).values({ address: address.toLowerCase(), rewardPoints: 100, tier: "bronze", securityScore: 75, dailyStreakDays: 0, referralCode }).returning();
  } else {
    await db.update(usersTable).set({ lastActive: new Date() }).where(eq(usersTable.id, user.id));
  }
  const sessionToken = `tok_${Math.random().toString(36).substring(2)}${Math.random().toString(36).substring(2)}`;
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  res.json({ address: user.address, chainId, sessionToken, expiresAt, isNewUser });
});

router.post("/disconnect", (req, res) => {
  res.json({ success: true });
});

export default router;
