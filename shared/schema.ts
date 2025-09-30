import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, boolean, integer, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const snippets = pgTable("snippets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  code: text("code").notNull(),
  language: text("language").notNull(),
  tags: text("tags").array().default(sql`ARRAY[]::text[]`),
  embedding: text("embedding"), // JSON string of float array for semantic search
  framework: text("framework"),
  complexity: text("complexity"), // simple, moderate, complex
  isPublic: boolean("is_public").default(false),
  isFavorite: boolean("is_favorite").default(false),
  usageCount: integer("usage_count").default(0),
  lastUsedAt: timestamp("last_used_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  // Composite index for efficient sorting of user's snippets by date
  userIdCreatedAtIdx: index("snippets_user_id_created_at_idx").on(table.userId, table.createdAt),
  // Composite index for filtering by user and language
  userIdLanguageIdx: index("snippets_user_id_language_idx").on(table.userId, table.language),
  // Composite index for filtering user's favorites
  userIdIsFavoriteIdx: index("snippets_user_id_is_favorite_idx").on(table.userId, table.isFavorite),
  // Composite index for sorting by last used (if needed)
  userIdLastUsedAtIdx: index("snippets_user_id_last_used_at_idx").on(table.userId, table.lastUsedAt),
}));

export const collections = pgTable("collections", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  color: text("color"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  // Index for filtering collections by user
  userIdIdx: index("collections_user_id_idx").on(table.userId),
  // Composite index for efficient sorting of user's collections by date
  userIdCreatedAtIdx: index("collections_user_id_created_at_idx").on(table.userId, table.createdAt),
}));

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const registerSchema = z.object({
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must not exceed 30 characters')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores, and hyphens'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must not exceed 128 characters'),
});

export const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

export const insertSnippetSchema = createInsertSchema(snippets).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  title: z.string().min(1, 'Title is required').max(200, 'Title must not exceed 200 characters'),
  description: z.string().max(1000, 'Description must not exceed 1000 characters').optional(),
  code: z.string().min(1, 'Code is required').max(50000, 'Code must not exceed 50000 characters'),
  language: z.string().min(1, 'Language is required').max(50, 'Language must not exceed 50 characters'),
  tags: z.array(
    z.string()
      .min(1, 'Tag cannot be empty')
      .max(32, 'Tag must not exceed 32 characters')
      .regex(/^[\w-]+$/, 'Tag can only contain letters, numbers, underscores, and hyphens')
  ).max(20, 'Maximum 20 tags allowed').optional(),
  complexity: z.enum(['simple', 'moderate', 'complex']).optional(),
});

export const updateSnippetSchema = insertSnippetSchema.partial();

export const insertCollectionSchema = createInsertSchema(collections).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  name: z.string().min(1, 'Name is required').max(100, 'Name must not exceed 100 characters'),
  description: z.string().max(500, 'Description must not exceed 500 characters').optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Color must be a valid hex color').optional(),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type InsertSnippet = z.infer<typeof insertSnippetSchema>;
export type Snippet = typeof snippets.$inferSelect;
export type InsertCollection = z.infer<typeof insertCollectionSchema>;
export type Collection = typeof collections.$inferSelect;
