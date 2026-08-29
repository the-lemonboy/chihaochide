// Intentionally empty by default.
// Add Drizzle tables here when the site actually needs a database.
// See examples/d1/db/schema.ts for an opt-in example.
export {};
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const places = sqliteTable("places", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  tag: text("tag").notNull().default("未分类"),
  emoji: text("emoji").notNull().default("✨"),
  color: text("color").notNull().default("blue"),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
});

export const picks = sqliteTable("picks", {
  placeId: integer("place_id").primaryKey(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
});
