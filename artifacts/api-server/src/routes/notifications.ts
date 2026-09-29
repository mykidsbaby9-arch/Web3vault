import { Router } from "express";
import { db } from "@workspace/db";
import { notificationsTable } from "@workspace/db";
import { eq, desc, and } from "drizzle-orm";

const router = Router();
const DEFAULT_USER_ID = 1;

router.get("/", async (req, res) => {
  const unread = req.query.unread;
  const conditions = [eq(notificationsTable.userId, DEFAULT_USER_ID)];
  if (unread === "true") conditions.push(eq(notificationsTable.isRead, false));
  const items = await db.select().from(notificationsTable).where(and(...conditions)).orderBy(desc(notificationsTable.createdAt)).limit(50);
  res.json(items.map(n => ({ id: n.id, type: n.type, title: n.title, message: n.message, isRead: n.isRead, createdAt: n.createdAt?.toISOString(), link: n.link })));
});

router.patch("/:id/read", async (req, res) => {
  await db.update(notificationsTable).set({ isRead: true }).where(and(eq(notificationsTable.id, Number(req.params.id)), eq(notificationsTable.userId, DEFAULT_USER_ID)));
  res.json({ success: true });
});

router.post("/read-all", async (req, res) => {
  await db.update(notificationsTable).set({ isRead: true }).where(eq(notificationsTable.userId, DEFAULT_USER_ID));
  res.json({ success: true });
});

export default router;
