import { pgTable, text, integer, timestamp, serial } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const rewardEventsTable = pgTable("reward_events", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  type: text("type").notNull(), // daily | referral | trade | staking | achievement | bonus
  points: integer("points").notNull(),
  description: text("description").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const referralsTable = pgTable("referrals", {
  id: serial("id").primaryKey(),
  referrerId: integer("referrer_id").notNull(),
  referredAddress: text("referred_address").notNull(),
  status: text("status").notNull().default("pending"), // pending | active | rewarded
  pointsEarned: integer("points_earned").default(0),
  joinedAt: timestamp("joined_at").defaultNow(),
});

export const insertRewardEventSchema = createInsertSchema(rewardEventsTable).omit({ id: true, createdAt: true });
export type InsertRewardEvent = z.infer<typeof insertRewardEventSchema>;
export type RewardEvent = typeof rewardEventsTable.$inferSelect;
