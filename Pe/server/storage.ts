import { 
  users, 
  categories,
  lessons,
  userProgress,
  type User, 
  type InsertUser,
  type Category,
  type InsertCategory,
  type Lesson,
  type InsertLesson,
  type UserProgress,
  type InsertUserProgress,
  type LessonWithCategory,
  type LessonWithProgress,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, sql } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserStreak(userId: string, currentStreak: number, longestStreak: number, lastCompletedDate: string): Promise<void>;
  updateUserStats(userId: string, totalLessons: number): Promise<void>;

  getAllCategories(): Promise<Category[]>;
  getCategoryById(id: number): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;

  getAllLessons(): Promise<LessonWithCategory[]>;
  getLessonsByCategory(categoryId: number): Promise<LessonWithCategory[]>;
  getLessonById(id: number): Promise<LessonWithCategory | undefined>;
  createLesson(lesson: InsertLesson): Promise<Lesson>;

  getUserProgress(userId: string): Promise<UserProgress[]>;
  getUserProgressForLesson(userId: string, lessonId: number): Promise<UserProgress | undefined>;
  getLessonsWithProgress(userId: string): Promise<LessonWithProgress[]>;
  markLessonComplete(userId: string, lessonId: number): Promise<UserProgress>;
  getUserStats(userId: string): Promise<{
    currentStreak: number;
    longestStreak: number;
    totalLessons: number;
    totalMinutes: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUserStreak(userId: string, currentStreak: number, longestStreak: number, lastCompletedDate: string): Promise<void> {
    await db
      .update(users)
      .set({ currentStreak, longestStreak, lastCompletedDate })
      .where(eq(users.id, userId));
  }

  async updateUserStats(userId: string, totalLessons: number): Promise<void> {
    await db
      .update(users)
      .set({ totalLessonsCompleted: totalLessons })
      .where(eq(users.id, userId));
  }

  async getAllCategories(): Promise<Category[]> {
    return await db.select().from(categories).orderBy(categories.orderIndex);
  }

  async getCategoryById(id: number): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.id, id));
    return category || undefined;
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const [category] = await db
      .insert(categories)
      .values(insertCategory)
      .returning();
    return category;
  }

  async getAllLessons(): Promise<LessonWithCategory[]> {
    const result = await db
      .select()
      .from(lessons)
      .leftJoin(categories, eq(lessons.categoryId, categories.id))
      .orderBy(lessons.orderIndex);
    
    return result.map(row => ({
      ...row.lessons,
      category: row.categories!,
    }));
  }

  async getLessonsByCategory(categoryId: number): Promise<LessonWithCategory[]> {
    const result = await db
      .select()
      .from(lessons)
      .leftJoin(categories, eq(lessons.categoryId, categories.id))
      .where(eq(lessons.categoryId, categoryId))
      .orderBy(lessons.orderIndex);
    
    return result.map(row => ({
      ...row.lessons,
      category: row.categories!,
    }));
  }

  async getLessonById(id: number): Promise<LessonWithCategory | undefined> {
    const result = await db
      .select()
      .from(lessons)
      .leftJoin(categories, eq(lessons.categoryId, categories.id))
      .where(eq(lessons.id, id));
    
    if (result.length === 0) return undefined;
    
    return {
      ...result[0].lessons,
      category: result[0].categories!,
    };
  }

  async createLesson(insertLesson: InsertLesson): Promise<Lesson> {
    const [lesson] = await db
      .insert(lessons)
      .values(insertLesson)
      .returning();
    return lesson;
  }

  async getUserProgress(userId: string): Promise<UserProgress[]> {
    return await db
      .select()
      .from(userProgress)
      .where(eq(userProgress.userId, userId));
  }

  async getUserProgressForLesson(userId: string, lessonId: number): Promise<UserProgress | undefined> {
    const [progress] = await db
      .select()
      .from(userProgress)
      .where(
        and(
          eq(userProgress.userId, userId),
          eq(userProgress.lessonId, lessonId)
        )
      );
    return progress || undefined;
  }

  async getLessonsWithProgress(userId: string): Promise<LessonWithProgress[]> {
    const result = await db
      .select({
        lesson: lessons,
        category: categories,
        progress: userProgress,
      })
      .from(lessons)
      .leftJoin(categories, eq(lessons.categoryId, categories.id))
      .leftJoin(
        userProgress,
        and(
          eq(lessons.id, userProgress.lessonId),
          eq(userProgress.userId, userId)
        )
      )
      .orderBy(lessons.orderIndex);
    
    return result.map(row => ({
      ...row.lesson,
      category: row.category!,
      completed: row.progress?.completed || false,
      completedAt: row.progress?.completedAt || null,
    }));
  }

  async markLessonComplete(userId: string, lessonId: number): Promise<UserProgress> {
    const existing = await this.getUserProgressForLesson(userId, lessonId);
    
    if (existing) {
      const [updated] = await db
        .update(userProgress)
        .set({ completed: true, completedAt: new Date() })
        .where(eq(userProgress.id, existing.id))
        .returning();
      return updated;
    } else {
      const [created] = await db
        .insert(userProgress)
        .values({
          userId,
          lessonId,
          completed: true,
          completedAt: new Date(),
        })
        .returning();
      return created;
    }
  }

  async getUserStats(userId: string): Promise<{
    currentStreak: number;
    longestStreak: number;
    totalLessons: number;
    totalMinutes: number;
  }> {
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    
    if (!user) {
      return {
        currentStreak: 0,
        longestStreak: 0,
        totalLessons: 0,
        totalMinutes: 0,
      };
    }

    const completedCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(userProgress)
      .where(
        and(
          eq(userProgress.userId, userId),
          eq(userProgress.completed, true)
        )
      );

    const total = Number(completedCount[0]?.count || 0);

    return {
      currentStreak: user.currentStreak,
      longestStreak: user.longestStreak,
      totalLessons: total,
      totalMinutes: total * 5,
    };
  }
}

export const storage = new DatabaseStorage();
