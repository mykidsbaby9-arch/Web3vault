import { pgTable, text, integer, numeric, timestamp, serial } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const transactionsTable = pgTable("transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  hash: text("hash").notNull(),
  type: text("type").notNull(), // send | receive | swap | bridge | approve | mint | burn | stake | unstake
  from: text("from").notNull(),
  to: text("to").notNull(),
  amount: numeric("amount", { precision: 20, scale: 8 }).notNull(),
  amountUsd: numeric("amount_usd", { precision: 20, scale: 2 }),
  token: text("token").notNull(),
  status: text("status").notNull().default("confirmed"), // confirmed | pending | failed
  network: text("network").notNull(),
  gasUsed: numeric("gas_used", { precision: 20, scale: 8 }).notNull(),
  gasFee: numeric("gas_fee", { precision: 20, scale: 8 }).notNull(),
  gasFeeUsd: numeric("gas_fee_usd", { precision: 20, scale: 2 }),
  timestamp: timestamp("timestamp").defaultNow(),
});

export const insertTransactionSchema = createInsertSchema(transactionsTable).omit({ id: true, timestamp: true });
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Transaction = typeof transactionsTable.$inferSelect;
