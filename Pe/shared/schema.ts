import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp, serial } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  petName: text("pet_name"),
  currentStreak: integer("current_streak").notNull().default(0),
  longestStreak: integer("longest_streak").notNull().default(0),
  lastCompletedDate: text("last_completed_date"),
  totalLessonsCompleted: integer("total_lessons_completed").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description").notNull(),
  icon: text("icon").notNull(),
  color: text("color").notNull(),
  orderIndex: integer("order_index").notNull().default(0),
});

export const lessons = pgTable("lessons", {
  id: serial("id").primaryKey(),
  categoryId: integer("category_id").notNull().references(() => categories.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  content: text("content").notNull(),
  duration: integer("duration").notNull().default(5),
  difficulty: text("difficulty").notNull(),
  orderIndex: integer("order_index").notNull().default(0),
  imageUrl: text("image_url"),
});

export const userProgress = pgTable("user_progress", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  lessonId: integer("lesson_id").notNull().references(() => lessons.id, { onDelete: "cascade" }),
  completed: boolean("completed").notNull().default(false),
  completedAt: timestamp("completed_at"),
});

export const userRelations = relations(users, ({ many }) => ({
  progress: many(userProgress),
}));

export const categoryRelations = relations(categories, ({ many }) => ({
  lessons: many(lessons),
}));

export const lessonRelations = relations(lessons, ({ one, many }) => ({
  category: one(categories, {
    fields: [lessons.categoryId],
    references: [categories.id],
  }),
  userProgress: many(userProgress),
}));

export const userProgressRelations = relations(userProgress, ({ one }) => ({
  user: one(users, {
    fields: [userProgress.userId],
    references: [users.id],
  }),
  lesson: one(lessons, {
    fields: [userProgress.lessonId],
    references: [lessons.id],
  }),
}));

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  petName: true,
});

export const insertCategorySchema = createInsertSchema(categories).omit({
  id: true,
});

export const insertLessonSchema = createInsertSchema(lessons).omit({
  id: true,
});

export const insertUserProgressSchema = createInsertSchema(userProgress).omit({
  id: true,
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Lesson = typeof lessons.$inferSelect;
export type InsertLesson = z.infer<typeof insertLessonSchema>;
export type UserProgress = typeof userProgress.$inferSelect;
export type InsertUserProgress = z.infer<typeof insertUserProgressSchema>;

export type LessonWithCategory = Lesson & {
  category: Category;
};

export type LessonWithProgress = Lesson & {
  category: Category;
  completed: boolean;
  completedAt?: Date | null;
};
