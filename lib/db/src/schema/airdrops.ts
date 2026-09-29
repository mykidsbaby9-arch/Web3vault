import { pgTable, text, integer, numeric, boolean, timestamp, serial } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const airdropsTable = pgTable("airdrops", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  token: text("token").notNull(),
  logoUrl: text("logo_url").notNull(),
  amount: numeric("amount", { precision: 20, scale: 8 }).notNull(),
  amountUsd: numeric("amount_usd", { precision: 20, scale: 2 }),
  status: text("status").notNull().default("active"), // active | upcoming | expired
  description: text("description").notNull(),
  network: text("network").notNull(),
  requirements: text("requirements").array().default([]),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const airdropClaimsTable = pgTable("airdrop_claims", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  airdropId: integer("airdrop_id").notNull(),
  txHash: text("tx_hash").notNull(),
  claimedAt: timestamp("claimed_at").defaultNow(),
});

export const insertAirdropSchema = createInsertSchema(airdropsTable).omit({ id: true, createdAt: true });
export type InsertAirdrop = z.infer<typeof insertAirdropSchema>;
export type Airdrop = typeof airdropsTable.$inferSelect;

export const insertAirdropClaimSchema = createInsertSchema(airdropClaimsTable).omit({ id: true, claimedAt: true });
export type InsertAirdropClaim = z.infer<typeof insertAirdropClaimSchema>;
export type AirdropClaim = typeof airdropClaimsTable.$inferSelect;
