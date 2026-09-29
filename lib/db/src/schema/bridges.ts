import { pgTable, text, integer, numeric, timestamp, serial } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const bridgesTable = pgTable("bridges", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  fromNetwork: text("from_network").notNull(),
  toNetwork: text("to_network").notNull(),
  token: text("token").notNull(),
  amount: numeric("amount", { precision: 20, scale: 8 }).notNull(),
  receiveAmount: numeric("receive_amount", { precision: 20, scale: 8 }).notNull(),
  txHash: text("tx_hash").notNull(),
  destinationTxHash: text("destination_tx_hash"),
  status: text("status").notNull().default("pending"), // pending | in_progress | completed | failed
  createdAt: timestamp("created_at").defaultNow(),
  completedAt: timestamp("completed_at"),
});

export const insertBridgeSchema = createInsertSchema(bridgesTable).omit({ id: true, createdAt: true });
export type InsertBridge = z.infer<typeof insertBridgeSchema>;
export type Bridge = typeof bridgesTable.$inferSelect;
