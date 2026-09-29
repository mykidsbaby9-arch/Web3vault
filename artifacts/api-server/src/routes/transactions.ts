import { Router } from "express";
import { db } from "@workspace/db";
import { transactionsTable } from "@workspace/db";
import { eq, desc, and, like } from "drizzle-orm";

const router = Router();
const DEFAULT_USER_ID = 1;

router.get("/", async (req, res) => {
  const { network, type, search, page = "1", limit = "20" } = req.query as Record<string, string>;
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const offset = (pageNum - 1) * limitNum;

  let allTx = await db.select().from(transactionsTable).where(eq(transactionsTable.userId, DEFAULT_USER_ID)).orderBy(desc(transactionsTable.timestamp));

  if (network) allTx = allTx.filter(t => t.network === network);
  if (type) allTx = allTx.filter(t => t.type === type);
  if (search) allTx = allTx.filter(t => t.hash.includes(search) || t.token.toLowerCase().includes(search.toLowerCase()));

  const total = allTx.length;
  const items = allTx.slice(offset, offset + limitNum).map(t => ({
    id: t.id, hash: t.hash, type: t.type, from: t.from, to: t.to,
    amount: Number(t.amount), amountUsd: t.amountUsd ? Number(t.amountUsd) : null,
    token: t.token, status: t.status, network: t.network,
    gasUsed: Number(t.gasUsed), gasFee: Number(t.gasFee), gasFeeUsd: t.gasFeeUsd ? Number(t.gasFeeUsd) : null,
    timestamp: t.timestamp?.toISOString(),
  }));

  res.json({ items, total, page: pageNum, limit: limitNum });
});

export default router;
