import { pgTable, text, integer, boolean, timestamp, serial } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const usersTable = pgTable("users", {
  id: serial("id").primaryKey(),
  address: text("address").notNull().unique(),
  username: text("username"),
  avatarUrl: text("avatar_url"),
  bio: text("bio"),
  email: text("email"),
  preferredNetwork: text("preferred_network").default("ethereum"),
  notificationsEnabled: boolean("notifications_enabled").default(true),
  twoFactorEnabled: boolean("two_factor_enabled").default(false),
  rewardPoints: integer("reward_points").default(0),
  tier: text("tier").default("bronze"),
  securityScore: integer("security_score").default(75),
  dailyStreakDays: integer("daily_streak_days").default(0),
  dailyClaimedAt: timestamp("daily_claimed_at"),
  referralCode: text("referral_code"),
  createdAt: timestamp("created_at").defaultNow(),
  lastActive: timestamp("last_active").defaultNow(),
});

export const insertUserSchema = createInsertSchema(usersTable).omit({ id: true, createdAt: true });
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof usersTable.$inferSelect;
