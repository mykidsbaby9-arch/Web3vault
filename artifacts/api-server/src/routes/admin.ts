import { Router } from "express";
import { db } from "@workspace/db";
import { usersTable, transactionsTable, announcementsTable } from "@workspace/db";
import { desc, eq, count, sum } from "drizzle-orm";
import { demoMinutesAgo } from "../lib/demo-time";

const router = Router();

router.get("/stats", async (req, res) => {
  const now = Date.now();
  const growthStats = Array.from({ length: 30 }, (_, i) => {
    const date = new Date(now - (29 - i) * 86400000).toISOString().split("T")[0];
    return { date, users: Math.floor(50 + Math.random() * 200), volume: Math.floor(1_000_000 + Math.random() * 5_000_000) };
  });

  res.json({
    totalUsers: 12483, activeWallets: 8921, dailyActiveUsers: 3241,
    tradingVolume24h: 48_200_000, totalTransactions: 2_841_093,
    networkUsage: [
      { network: "Ethereum", users: 5821, transactions: 1_200_000, percentage: 42.3 },
      { network: "BSC", users: 3421, transactions: 820_000, percentage: 28.9 },
      { network: "Polygon", users: 2100, transactions: 450_000, percentage: 15.8 },
      { network: "Arbitrum", users: 890, transactions: 280_000, percentage: 9.9 },
      { network: "Avalanche", users: 251, transactions: 91_000, percentage: 3.1 },
    ],
    revenueStats: {
      totalRevenue: 842_000, swapFees: 410_000, bridgeFees: 230_000, tradingFees: 202_000, monthlyRevenue: 94_500,
    },
    growthStats,
  });
});

router.get("/users", async (req, res) => {
  const { search, page = "1", limit = "20" } = req.query as Record<string, string>;
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  let users = await db.select().from(usersTable).orderBy(desc(usersTable.createdAt));
  if (search) users = users.filter(u => u.address.includes(search) || (u.username && u.username.includes(search)));
  const total = users.length;
  const items = users.slice((pageNum - 1) * limitNum, pageNum * limitNum).map(u => ({
    id: u.id, address: u.address, username: u.username, joinedAt: u.createdAt?.toISOString(),
    lastActive: u.lastActive?.toISOString(), totalTrades: Math.floor(Math.random() * 100),
    rewardPoints: u.rewardPoints || 0, tier: u.tier || "bronze", isActive: true,
  }));
  res.json({ items, total, page: pageNum, limit: limitNum });
});

router.get("/activity", async (req, res) => {
  const activity = [
    { id: 1, type: "swap", description: "Swapped 2 ETH for 7043 USDC", address: "0x1234...5678", network: "ethereum", timestamp: demoMinutesAgo(), amount: 7043 },
    { id: 2, type: "bridge", description: "Bridged 1000 USDC from Ethereum to Polygon", address: "0xabcd...ef01", network: "polygon", timestamp: demoMinutesAgo(), amount: 1000 },
    { id: 3, type: "trade", description: "Bought 0.5 BTC at $67,842", address: "0x9876...5432", network: "ethereum", timestamp: demoMinutesAgo(), amount: 33921 },
    { id: 4, type: "airdrop", description: "Claimed ARB airdrop — 1250 tokens", address: "0xdead...beef", network: "arbitrum", timestamp: demoMinutesAgo(), amount: 1250 },
    { id: 5, type: "reward", description: "Daily streak reward claimed — 150 points", address: "0xcafe...babe", network: "ethereum", timestamp: demoMinutesAgo(), amount: 150 },
    { id: 6, type: "security", description: "Suspicious approval detected and revoked", address: "0x0000...1111", network: "bsc", timestamp: demoMinutesAgo(), amount: null },
  ];
  res.json(activity);
});

router.get("/announcements", async (req, res) => {
  const items = await db.select().from(announcementsTable).orderBy(desc(announcementsTable.createdAt));
  res.json(items.map(a => ({ id: a.id, title: a.title, content: a.content, type: a.type, isActive: a.isActive, createdAt: a.createdAt?.toISOString(), expiresAt: a.expiresAt?.toISOString() ?? null })));
});

router.post("/announcements", async (req, res) => {
  const { title, content, type, expiresAt } = req.body;
  const [a] = await db.insert(announcementsTable).values({ title, content, type, expiresAt: expiresAt ? new Date(expiresAt) : null }).returning();
  res.status(201).json({ id: a.id, title: a.title, content: a.content, type: a.type, isActive: a.isActive, createdAt: a.createdAt?.toISOString(), expiresAt: a.expiresAt?.toISOString() ?? null });
});

export default router;
