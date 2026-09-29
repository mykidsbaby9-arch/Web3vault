import { Router } from "express";
import { db } from "@workspace/db";
import { bridgesTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";

const router = Router();
const DEFAULT_USER_ID = 1;

const BRIDGE_FEES: Record<string, number> = {
  "ethereum-polygon": 0.1, "ethereum-arbitrum": 0.05, "ethereum-optimism": 0.05,
  "ethereum-base": 0.05, "ethereum-avalanche": 0.15, "ethereum-bsc": 0.12,
  "polygon-ethereum": 0.1, "arbitrum-ethereum": 0.08, "optimism-ethereum": 0.08,
};

const EST_TIME: Record<string, string> = {
  "ethereum-polygon": "5-10 min", "ethereum-arbitrum": "1-2 min", "ethereum-optimism": "1-2 min",
  "ethereum-base": "1-2 min", "ethereum-avalanche": "10-20 min",
};

router.post("/quote", (req, res) => {
  const { fromNetwork, toNetwork, token, amount } = req.body;
  const key = `${fromNetwork}-${toNetwork}`;
  const bridgeFee = BRIDGE_FEES[key] || 0.1;
  const receiveAmount = amount * (1 - bridgeFee / 100);
  const bridgeFeeUsd = amount * 0.5 * (bridgeFee / 100);
  const estimatedTime = EST_TIME[key] || "5-15 min";
  const gasFeeUsd = fromNetwork === "ethereum" ? 3.5 : 0.1;
  res.json({ fromNetwork, toNetwork, token, amount, receiveAmount: +receiveAmount.toFixed(8), bridgeFee, bridgeFeeUsd: +bridgeFeeUsd.toFixed(4), estimatedTime, gasFeeUsd });
});

router.post("/execute", async (req, res) => {
  const { fromNetwork, toNetwork, token, amount, walletAddress } = req.body;
  const key = `${fromNetwork}-${toNetwork}`;
  const bridgeFee = BRIDGE_FEES[key] || 0.1;
  const receiveAmount = amount * (1 - bridgeFee / 100);
  const txHash = `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`;
  const [bridge] = await db.insert(bridgesTable).values({ userId: DEFAULT_USER_ID, fromNetwork, toNetwork, token, amount: String(amount), receiveAmount: String(+receiveAmount.toFixed(8)), txHash, status: "in_progress", destinationTxHash: null }).returning();
  // Simulate completion after a short time
  setTimeout(async () => {
    const destTxHash = `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`;
    await db.update(bridgesTable).set({ status: "completed", destinationTxHash: destTxHash, completedAt: new Date() }).where(eq(bridgesTable.id, bridge.id));
  }, 5000);
  res.json({ id: bridge.id, fromNetwork: bridge.fromNetwork, toNetwork: bridge.toNetwork, token: bridge.token, amount: Number(bridge.amount), receiveAmount: Number(bridge.receiveAmount), txHash: bridge.txHash, destinationTxHash: null, status: bridge.status, createdAt: bridge.createdAt?.toISOString(), completedAt: null });
});

router.get("/history", async (req, res) => {
  const bridges = await db.select().from(bridgesTable).where(eq(bridgesTable.userId, DEFAULT_USER_ID)).orderBy(desc(bridgesTable.createdAt)).limit(50);
  res.json(bridges.map(b => ({ id: b.id, fromNetwork: b.fromNetwork, toNetwork: b.toNetwork, token: b.token, amount: Number(b.amount), receiveAmount: Number(b.receiveAmount), txHash: b.txHash, destinationTxHash: b.destinationTxHash, status: b.status, createdAt: b.createdAt?.toISOString(), completedAt: b.completedAt?.toISOString() ?? null })));
});

export default router;
