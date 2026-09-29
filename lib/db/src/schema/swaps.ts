import { pgTable, text, integer, numeric, timestamp, serial } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const swapsTable = pgTable("swaps", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  fromToken: text("from_token").notNull(),
  toToken: text("to_token").notNull(),
  fromAmount: numeric("from_amount", { precision: 20, scale: 8 }).notNull(),
  toAmount: numeric("to_amount", { precision: 20, scale: 8 }).notNull(),
  txHash: text("tx_hash").notNull(),
  status: text("status").notNull().default("pending"), // pending | confirmed | failed
  network: text("network").notNull(),
  gasFee: numeric("gas_fee", { precision: 20, scale: 8 }),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertSwapSchema = createInsertSchema(swapsTable).omit({ id: true, createdAt: true });
export type InsertSwap = z.infer<typeof insertSwapSchema>;
export type Swap = typeof swapsTable.$inferSelect;
