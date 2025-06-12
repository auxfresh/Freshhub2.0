import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  bio: text("bio").notNull().default(""),
  avatar: text("avatar").notNull().default("1"),
  score: integer("score").notNull().default(0),
  postsCount: integer("posts_count").notNull().default(0),
  followersCount: integer("followers_count").notNull().default(0),
  followingCount: integer("following_count").notNull().default(0),
});

export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  content: text("content").notNull(),
  imageUrl: text("image_url"),
  likes: integer("likes").notNull().default(0),
  comments: integer("comments").notNull().default(0),
  score: integer("score").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  bio: true,
  avatar: true,
});

export const insertPostSchema = createInsertSchema(posts).pick({
  content: true,
  imageUrl: true,
});

export const updateUserSchema = createInsertSchema(users).pick({
  username: true,
  bio: true,
  avatar: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertPost = z.infer<typeof insertPostSchema>;
export type Post = typeof posts.$inferSelect;
export type UpdateUser = z.infer<typeof updateUserSchema>;

export interface PostWithUser extends Post {
  user: User;
}
