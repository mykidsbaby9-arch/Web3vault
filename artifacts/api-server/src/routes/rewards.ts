import { Router } from "express";
import { db } from "@workspace/db";
import { rewardEventsTable, referralsTable, usersTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { demoMinutesAgo } from "../lib/demo-time";

const router = Router();
const DEFAULT_USER_ID = 1;

const BADGES = [
  { id: "first_trade", name: "First Trade", description: "Completed your first trade", icon: "TrendingUp", isEarned: true },
  { id: "swap_master", name: "Swap Master", description: "Completed 10 token swaps", icon: "ArrowLeftRight", isEarned: true },
  { id: "bridge_explorer", name: "Bridge Explorer", description: "Bridged tokens across 3 networks", icon: "Link", isEarned: true },
  { id: "diamond_hands", name: "Diamond Hands", description: "Held BTC for 90 days", icon: "Gem", isEarned: false, earnedAt: null },
  { id: "nft_collector", name: "NFT Collector", description: "Own 10 NFTs", icon: "Image", isEarned: false, earnedAt: null },
  { id: "defi_guru", name: "DeFi Guru", description: "Used 5 different DeFi protocols", icon: "Zap", isEarned: false, earnedAt: null },
  { id: "referral_king", name: "Referral King", description: "Referred 10 friends", icon: "Users", isEarned: false, earnedAt: null },
  { id: "streak_30", name: "30-Day Streak", description: "Logged in 30 days in a row", icon: "Flame", isEarned: false, earnedAt: null },
];

router.get("/summary", async (req, res) => {
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, DEFAULT_USER_ID));
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dailyClaimedToday = user?.dailyClaimedAt ? user.dailyClaimedAt >= today : false;

  res.json({
    totalPoints: user?.rewardPoints || 0, tier: user?.tier || "bronze",
    tierProgress: 65, nextTierPoints: 5000, dailyStreakDays: user?.dailyStreakDays || 0,
    dailyClaimedToday, referralCount: 3, tradingRewards: 120.5, stakingRewards: 89.3,
    badges: BADGES.map(badge => badge.isEarned ? { ...badge, earnedAt: demoMinutesAgo() } : badge),
  });
});

router.get("/history", async (req, res) => {
  const events = await db.select().from(rewardEventsTable).where(eq(rewardEventsTable.userId, DEFAULT_USER_ID)).orderBy(desc(rewardEventsTable.createdAt)).limit(50);
  res.json(events.map(e => ({ id: e.id, type: e.type, points: e.points, description: e.description, createdAt: e.createdAt?.toISOString() })));
});

router.get("/leaderboard", async (req, res) => {
  const leaders = [
    { rank: 1, address: "0x1234...5678", points: 42150, tier: "diamond", badge: "Diamond Hands", isCurrentUser: false },
    { rank: 2, address: "0xabcd...ef01", points: 38920, tier: "platinum", badge: "DeFi Guru", isCurrentUser: false },
    { rank: 3, address: "0x9876...5432", points: 35410, tier: "platinum", badge: "Swap Master", isCurrentUser: false },
    { rank: 4, address: "0xdead...beef", points: 31200, tier: "gold", badge: "Bridge Explorer", isCurrentUser: false },
    { rank: 5, address: "0xcafe...babe", points: 28750, tier: "gold", badge: "Referral King", isCurrentUser: false },
    { rank: 6, address: "0x0000...1111", points: 2350, tier: "bronze", badge: "First Trade", isCurrentUser: true },
  ];
  res.json(leaders);
});

router.post("/daily/claim", async (req, res) => {
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, DEFAULT_USER_ID));
  const streakDays = (user?.dailyStreakDays || 0) + 1;
  const bonusMultiplier = streakDays >= 7 ? 2.0 : streakDays >= 3 ? 1.5 : 1.0;
  const points = Math.floor(100 * bonusMultiplier);

  await db.update(usersTable).set({ dailyStreakDays: streakDays, dailyClaimedAt: new Date(), rewardPoints: (user?.rewardPoints || 0) + points }).where(eq(usersTable.id, DEFAULT_USER_ID));
  await db.insert(rewardEventsTable).values({ userId: DEFAULT_USER_ID, type: "daily", points, description: `Daily login reward (${streakDays}-day streak)` });

  res.json({ success: true, points, streakDays, bonusMultiplier });
});

router.get("/referral", async (req, res) => {
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, DEFAULT_USER_ID));
  const referrals = await db.select().from(referralsTable).where(eq(referralsTable.referrerId, DEFAULT_USER_ID));
  const referralCode = user?.referralCode || "WV-DEMO123";
  const referralLink = `https://web3vault.app/ref/${referralCode}`;
  res.json({
    referralCode, referralLink, totalReferrals: referrals.length, pendingReferrals: referrals.filter(r => r.status === "pending").length,
    totalEarned: referrals.reduce((s, r) => s + (r.pointsEarned || 0), 0),
    recentReferrals: referrals.slice(0, 5).map(r => ({ address: r.referredAddress, status: r.status, pointsEarned: r.pointsEarned || 0, joinedAt: r.joinedAt?.toISOString() })),
  });
});

export default router;
