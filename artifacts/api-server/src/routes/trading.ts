import { Router } from "express";
import { db } from "@workspace/db";
import { watchlistTable, ordersTable } from "@workspace/db";
import { eq, desc, and } from "drizzle-orm";

const router = Router();

const DEFAULT_USER_ID = 1;

// Watchlist
router.get("/watchlist", async (req, res) => {
  const items = await db.select().from(watchlistTable).where(eq(watchlistTable.userId, DEFAULT_USER_ID)).orderBy(desc(watchlistTable.addedAt));
  res.json(items.map(w => ({ id: w.id, symbol: w.symbol, name: w.name, price: Math.random() * 50000 + 100, changePercent24h: (Math.random() - 0.5) * 10, logoUrl: w.logoUrl, addedAt: w.addedAt?.toISOString() })));
});

router.post("/watchlist", async (req, res) => {
  const { symbol, name, logoUrl } = req.body;
  const [item] = await db.insert(watchlistTable).values({ userId: DEFAULT_USER_ID, symbol, name, logoUrl }).returning();
  res.status(201).json({ id: item.id, symbol: item.symbol, name: item.name, price: 0, changePercent24h: 0, logoUrl: item.logoUrl, addedAt: item.addedAt?.toISOString() });
});

router.delete("/watchlist/:id", async (req, res) => {
  await db.delete(watchlistTable).where(and(eq(watchlistTable.id, Number(req.params.id)), eq(watchlistTable.userId, DEFAULT_USER_ID)));
  res.json({ success: true });
});

// Orders
router.get("/orders", async (req, res) => {
  const status = req.query.status as string;
  let query = db.select().from(ordersTable).where(eq(ordersTable.userId, DEFAULT_USER_ID)).$dynamic();
  if (status && status !== "all") {
    query = db.select().from(ordersTable).where(and(eq(ordersTable.userId, DEFAULT_USER_ID), eq(ordersTable.status, status))).$dynamic();
  }
  const orders = await query.orderBy(desc(ordersTable.createdAt)).limit(50);
  res.json(orders.map(o => ({ id: o.id, side: o.side, symbol: o.symbol, amount: Number(o.amount), price: Number(o.price), total: Number(o.total), status: o.status, network: o.network, fee: o.fee ? Number(o.fee) : null, createdAt: o.createdAt?.toISOString(), filledAt: o.filledAt?.toISOString() ?? null })));
});

router.post("/orders", async (req, res) => {
  const { side, symbol, amount, price, network, orderType = "market" } = req.body;
  const total = amount * price;
  const fee = total * 0.001;
  const status = orderType === "market" ? "filled" : "open";
  const [order] = await db.insert(ordersTable).values({ userId: DEFAULT_USER_ID, side, symbol, amount: String(amount), price: String(price), total: String(total), status, network, orderType, fee: String(fee), filledAt: orderType === "market" ? new Date() : null }).returning();
  res.status(201).json({ id: order.id, side: order.side, symbol: order.symbol, amount: Number(order.amount), price: Number(order.price), total: Number(order.total), status: order.status, network: order.network, fee: order.fee ? Number(order.fee) : null, createdAt: order.createdAt?.toISOString(), filledAt: order.filledAt?.toISOString() ?? null });
});

router.get("/history", async (req, res) => {
  const orders = await db.select().from(ordersTable).where(and(eq(ordersTable.userId, DEFAULT_USER_ID), eq(ordersTable.status, "filled"))).orderBy(desc(ordersTable.filledAt)).limit(50);
  res.json(orders.map(o => ({ id: o.id, side: o.side, symbol: o.symbol, amount: Number(o.amount), price: Number(o.price), total: Number(o.total), status: o.status, network: o.network, fee: o.fee ? Number(o.fee) : null, createdAt: o.createdAt?.toISOString(), filledAt: o.filledAt?.toISOString() ?? null })));
});

export default router;
