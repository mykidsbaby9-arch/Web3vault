import { pgTable, text, integer, numeric, timestamp, serial, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const nftsTable = pgTable("nfts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(),
  collection: text("collection").notNull(),
  imageUrl: text("image_url").notNull(),
  network: text("network").notNull(),
  tokenId: text("token_id").notNull(),
  contractAddress: text("contract_address").notNull(),
  floorPrice: numeric("floor_price", { precision: 20, scale: 8 }).notNull(),
  lastSalePrice: numeric("last_sale_price", { precision: 20, scale: 8 }),
  rarity: text("rarity"),
  traits: jsonb("traits").default([]),
  acquiredAt: timestamp("acquired_at").defaultNow(),
});

export const insertNftSchema = createInsertSchema(nftsTable).omit({ id: true, acquiredAt: true });
export type InsertNft = z.infer<typeof insertNftSchema>;
export type Nft = typeof nftsTable.$inferSelect;
