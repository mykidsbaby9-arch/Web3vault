import { Router } from "express";
import { db } from "@workspace/db";
import { airdropsTable, airdropClaimsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";

const router = Router();
const DEFAULT_USER_ID = 1;

router.get("/", async (req, res) => {
  const statusFilter = req.query.status as string;
  const airdrops = await db.select().from(airdropsTable).orderBy(desc(airdropsTable.createdAt));
  const claims = await db.select().from(airdropClaimsTable).where(eq(airdropClaimsTable.userId, DEFAULT_USER_ID));
  const claimedIds = new Set(claims.map(c => c.airdropId));

  let result = airdrops.map(a => ({
    id: a.id, name: a.name, token: a.token, logoUrl: a.logoUrl, amount: Number(a.amount),
    amountUsd: a.amountUsd ? Number(a.amountUsd) : null,
    status: claimedIds.has(a.id) ? "claimed" : a.status,
    endDate: a.endDate.toISOString(), startDate: a.startDate?.toISOString() ?? null,
    description: a.description, network: a.network, requirements: a.requirements || [],
  }));

  if (statusFilter && statusFilter !== "all") {
    result = result.filter(a => a.status === statusFilter);
  }

  res.json(result);
});

router.post("/:id/claim", async (req, res) => {
  const airdropId = Number(req.params.id);
  const [airdrop] = await db.select().from(airdropsTable).where(eq(airdropsTable.id, airdropId));
  if (!airdrop) return res.status(404).json({ error: "Airdrop not found" });
  const txHash = `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`;
  await db.insert(airdropClaimsTable).values({ userId: DEFAULT_USER_ID, airdropId, txHash });
  res.json({ success: true, txHash, amount: Number(airdrop.amount), token: airdrop.token });
});

router.post("/check", async (req, res) => {
  const airdrops = await db.select().from(airdropsTable).where(eq(airdropsTable.status, "active"));
  const results = airdrops.map(a => ({
    airdropId: a.id, airdropName: a.name, eligible: Math.random() > 0.5,
    amount: Math.random() > 0.5 ? Number(a.amount) : null,
    reason: Math.random() > 0.5 ? "Wallet meets requirements" : "Insufficient activity on this network",
  }));
  res.json(results);
});

export default router;
