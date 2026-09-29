import { Router } from "express";
import { db } from "@workspace/db";
import { swapsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";

const router = Router();
const DEFAULT_USER_ID = 1;

const TOKEN_PRICES: Record<string, number> = {
  BTC: 67842.31, ETH: 3521.88, BNB: 621.45, SOL: 185.72, MATIC: 0.8823,
  AVAX: 41.23, USDC: 1.0, USDT: 1.0, DAI: 1.0, ARB: 1.24, OP: 2.87,
};

router.post("/quote", (req, res) => {
  const { fromToken, toToken, amount, network, slippage = 0.5 } = req.body;
  const fromPrice = TOKEN_PRICES[fromToken] || 1;
  const toPrice = TOKEN_PRICES[toToken] || 1;
  const exchangeRate = fromPrice / toPrice;
  const rawToAmount = amount * exchangeRate;
  const priceImpact = Math.min(amount * fromPrice / 1_000_000 * 0.1, 5);
  const toAmount = rawToAmount * (1 - priceImpact / 100);
  const estimatedGas = network === "ethereum" ? 0.003 : 0.0001;
  const gasFeeUsd = estimatedGas * (network === "ethereum" ? 3500 : 1);
  const route = [fromToken, "→", toToken];
  const expiresAt = new Date(Date.now() + 30_000).toISOString();
  res.json({ fromToken, toToken, fromAmount: amount, toAmount: +toAmount.toFixed(8), exchangeRate: +exchangeRate.toFixed(8), priceImpact: +priceImpact.toFixed(4), estimatedGas, gasFeeUsd: +gasFeeUsd.toFixed(4), slippage, route, expiresAt });
});

router.post("/execute", async (req, res) => {
  const { fromToken, toToken, fromAmount, network, walletAddress, slippage = 0.5 } = req.body;
  const fromPrice = TOKEN_PRICES[fromToken] || 1;
  const toPrice = TOKEN_PRICES[toToken] || 1;
  const toAmount = fromAmount * (fromPrice / toPrice) * 0.998;
  const txHash = `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`;
  const gasFee = network === "ethereum" ? 0.003 : 0.0001;
  const [swap] = await db.insert(swapsTable).values({ userId: DEFAULT_USER_ID, fromToken, toToken, fromAmount: String(fromAmount), toAmount: String(+toAmount.toFixed(8)), txHash, status: "confirmed", network, gasFee: String(gasFee) }).returning();
  res.json({ id: swap.id, fromToken: swap.fromToken, toToken: swap.toToken, fromAmount: Number(swap.fromAmount), toAmount: Number(swap.toAmount), txHash: swap.txHash, status: swap.status, network: swap.network, gasFee: Number(swap.gasFee), createdAt: swap.createdAt?.toISOString() });
});

router.get("/history", async (req, res) => {
  const swaps = await db.select().from(swapsTable).where(eq(swapsTable.userId, DEFAULT_USER_ID)).orderBy(desc(swapsTable.createdAt)).limit(50);
  res.json(swaps.map(s => ({ id: s.id, fromToken: s.fromToken, toToken: s.toToken, fromAmount: Number(s.fromAmount), toAmount: Number(s.toAmount), txHash: s.txHash, status: s.status, network: s.network, gasFee: s.gasFee ? Number(s.gasFee) : null, createdAt: s.createdAt?.toISOString() })));
});

export default router;
