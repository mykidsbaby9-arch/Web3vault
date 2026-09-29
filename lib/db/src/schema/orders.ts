import { pgTable, text, integer, numeric, timestamp, serial } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const ordersTable = pgTable("orders", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  side: text("side").notNull(), // buy | sell
  symbol: text("symbol").notNull(),
  amount: numeric("amount", { precision: 20, scale: 8 }).notNull(),
  price: numeric("price", { precision: 20, scale: 8 }).notNull(),
  total: numeric("total", { precision: 20, scale: 8 }).notNull(),
  status: text("status").notNull().default("open"), // open | filled | cancelled | pending
  network: text("network").notNull(),
  orderType: text("order_type").default("market"), // market | limit
  fee: numeric("fee", { precision: 20, scale: 8 }),
  createdAt: timestamp("created_at").defaultNow(),
  filledAt: timestamp("filled_at"),
});

export const insertOrderSchema = createInsertSchema(ordersTable).omit({ id: true, createdAt: true });
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof ordersTable.$inferSelect;
