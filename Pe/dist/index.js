var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  categories: () => categories,
  categoryRelations: () => categoryRelations,
  insertCategorySchema: () => insertCategorySchema,
  insertLessonSchema: () => insertLessonSchema,
  insertUserProgressSchema: () => insertUserProgressSchema,
  insertUserSchema: () => insertUserSchema,
  lessonRelations: () => lessonRelations,
  lessons: () => lessons,
  userProgress: () => userProgress,
  userProgressRelations: () => userProgressRelations,
  userRelations: () => userRelations,
  users: () => users
});
import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp, serial } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
var users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  petName: text("pet_name"),
  currentStreak: integer("current_streak").notNull().default(0),
  longestStreak: integer("longest_streak").notNull().default(0),
  lastCompletedDate: text("last_completed_date"),
  totalLessonsCompleted: integer("total_lessons_completed").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow()
});
var categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description").notNull(),
  icon: text("icon").notNull(),
  color: text("color").notNull(),
  orderIndex: integer("order_index").notNull().default(0)
});
var lessons = pgTable("lessons", {
  id: serial("id").primaryKey(),
  categoryId: integer("category_id").notNull().references(() => categories.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  content: text("content").notNull(),
  duration: integer("duration").notNull().default(5),
  difficulty: text("difficulty").notNull(),
  orderIndex: integer("order_index").notNull().default(0),
  imageUrl: text("image_url")
});
var userProgress = pgTable("user_progress", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  lessonId: integer("lesson_id").notNull().references(() => lessons.id, { onDelete: "cascade" }),
  completed: boolean("completed").notNull().default(false),
  completedAt: timestamp("completed_at")
});
var userRelations = relations(users, ({ many }) => ({
  progress: many(userProgress)
}));
var categoryRelations = relations(categories, ({ many }) => ({
  lessons: many(lessons)
}));
var lessonRelations = relations(lessons, ({ one, many }) => ({
  category: one(categories, {
    fields: [lessons.categoryId],
    references: [categories.id]
  }),
  userProgress: many(userProgress)
}));
var userProgressRelations = relations(userProgress, ({ one }) => ({
  user: one(users, {
    fields: [userProgress.userId],
    references: [users.id]
  }),
  lesson: one(lessons, {
    fields: [userProgress.lessonId],
    references: [lessons.id]
  })
}));
var insertUserSchema = createInsertSchema(users).pick({
  username: true,
  petName: true
});
var insertCategorySchema = createInsertSchema(categories).omit({
  id: true
});
var insertLessonSchema = createInsertSchema(lessons).omit({
  id: true
});
var insertUserProgressSchema = createInsertSchema(userProgress).omit({
  id: true
});

// server/db.ts
import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
neonConfig.webSocketConstructor = ws;
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?"
  );
}
var pool = new Pool({ connectionString: process.env.DATABASE_URL });
var db = drizzle({ client: pool, schema: schema_exports });

// server/storage.ts
import { eq, and, sql as sql2 } from "drizzle-orm";
var DatabaseStorage = class {
  async getUser(id) {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || void 0;
  }
  async getUserByUsername(username) {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || void 0;
  }
  async createUser(insertUser) {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }
  async updateUserStreak(userId, currentStreak, longestStreak, lastCompletedDate) {
    await db.update(users).set({ currentStreak, longestStreak, lastCompletedDate }).where(eq(users.id, userId));
  }
  async updateUserStats(userId, totalLessons) {
    await db.update(users).set({ totalLessonsCompleted: totalLessons }).where(eq(users.id, userId));
  }
  async getAllCategories() {
    return await db.select().from(categories).orderBy(categories.orderIndex);
  }
  async getCategoryById(id) {
    const [category] = await db.select().from(categories).where(eq(categories.id, id));
    return category || void 0;
  }
  async createCategory(insertCategory) {
    const [category] = await db.insert(categories).values(insertCategory).returning();
    return category;
  }
  async getAllLessons() {
    const result = await db.select().from(lessons).leftJoin(categories, eq(lessons.categoryId, categories.id)).orderBy(lessons.orderIndex);
    return result.map((row) => ({
      ...row.lessons,
      category: row.categories
    }));
  }
  async getLessonsByCategory(categoryId) {
    const result = await db.select().from(lessons).leftJoin(categories, eq(lessons.categoryId, categories.id)).where(eq(lessons.categoryId, categoryId)).orderBy(lessons.orderIndex);
    return result.map((row) => ({
      ...row.lessons,
      category: row.categories
    }));
  }
  async getLessonById(id) {
    const result = await db.select().from(lessons).leftJoin(categories, eq(lessons.categoryId, categories.id)).where(eq(lessons.id, id));
    if (result.length === 0) return void 0;
    return {
      ...result[0].lessons,
      category: result[0].categories
    };
  }
  async createLesson(insertLesson) {
    const [lesson] = await db.insert(lessons).values(insertLesson).returning();
    return lesson;
  }
  async getUserProgress(userId) {
    return await db.select().from(userProgress).where(eq(userProgress.userId, userId));
  }
  async getUserProgressForLesson(userId, lessonId) {
    const [progress] = await db.select().from(userProgress).where(
      and(
        eq(userProgress.userId, userId),
        eq(userProgress.lessonId, lessonId)
      )
    );
    return progress || void 0;
  }
  async getLessonsWithProgress(userId) {
    const result = await db.select({
      lesson: lessons,
      category: categories,
      progress: userProgress
    }).from(lessons).leftJoin(categories, eq(lessons.categoryId, categories.id)).leftJoin(
      userProgress,
      and(
        eq(lessons.id, userProgress.lessonId),
        eq(userProgress.userId, userId)
      )
    ).orderBy(lessons.orderIndex);
    return result.map((row) => ({
      ...row.lesson,
      category: row.category,
      completed: row.progress?.completed || false,
      completedAt: row.progress?.completedAt || null
    }));
  }
  async markLessonComplete(userId, lessonId) {
    const existing = await this.getUserProgressForLesson(userId, lessonId);
    if (existing) {
      const [updated] = await db.update(userProgress).set({ completed: true, completedAt: /* @__PURE__ */ new Date() }).where(eq(userProgress.id, existing.id)).returning();
      return updated;
    } else {
      const [created] = await db.insert(userProgress).values({
        userId,
        lessonId,
        completed: true,
        completedAt: /* @__PURE__ */ new Date()
      }).returning();
      return created;
    }
  }
  async getUserStats(userId) {
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    if (!user) {
      return {
        currentStreak: 0,
        longestStreak: 0,
        totalLessons: 0,
        totalMinutes: 0
      };
    }
    const completedCount = await db.select({ count: sql2`count(*)` }).from(userProgress).where(
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
      totalMinutes: total * 5
    };
  }
};
var storage = new DatabaseStorage();

// server/routes.ts
import { z } from "zod";
var DEMO_USER_ID = "demo-user-123";
async function registerRoutes(app2) {
  app2.get("/api/categories", async (_req, res) => {
    try {
      const categories2 = await storage.getAllCategories();
      res.json(categories2);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ error: "Failed to fetch categories" });
    }
  });
  app2.get("/api/lessons", async (_req, res) => {
    try {
      const lessons2 = await storage.getLessonsWithProgress(DEMO_USER_ID);
      res.json(lessons2);
    } catch (error) {
      console.error("Error fetching lessons:", error);
      res.status(500).json({ error: "Failed to fetch lessons" });
    }
  });
  app2.get("/api/lessons/:id", async (req, res) => {
    try {
      const lessonId = parseInt(req.params.id);
      if (isNaN(lessonId)) {
        return res.status(400).json({ error: "Invalid lesson ID" });
      }
      const lesson = await storage.getLessonById(lessonId);
      if (!lesson) {
        return res.status(404).json({ error: "Lesson not found" });
      }
      const progress = await storage.getUserProgressForLesson(DEMO_USER_ID, lessonId);
      res.json({
        ...lesson,
        completed: progress?.completed || false,
        completedAt: progress?.completedAt || null
      });
    } catch (error) {
      console.error("Error fetching lesson:", error);
      res.status(500).json({ error: "Failed to fetch lesson" });
    }
  });
  app2.get("/api/user/stats", async (_req, res) => {
    try {
      const stats = await storage.getUserStats(DEMO_USER_ID);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching user stats:", error);
      res.status(500).json({ error: "Failed to fetch user stats" });
    }
  });
  app2.get("/api/user/profile", async (_req, res) => {
    try {
      let user = await storage.getUser(DEMO_USER_ID);
      if (!user) {
        const [createdUser] = await db.insert(users).values({
          id: DEMO_USER_ID,
          username: "demo_user",
          petName: "Buddy"
        }).returning();
        user = createdUser;
      }
      res.json(user);
    } catch (error) {
      console.error("Error fetching user profile:", error);
      res.status(500).json({ error: "Failed to fetch user profile" });
    }
  });
  app2.post("/api/progress/complete", async (req, res) => {
    try {
      const schema = z.object({
        lessonId: z.number()
      });
      const { lessonId } = schema.parse(req.body);
      const progress = await storage.markLessonComplete(DEMO_USER_ID, lessonId);
      const user = await storage.getUser(DEMO_USER_ID);
      if (user) {
        const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
        const lastDate = user.lastCompletedDate;
        let newStreak = user.currentStreak;
        if (lastDate !== today) {
          const yesterday = /* @__PURE__ */ new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayStr = yesterday.toISOString().split("T")[0];
          if (lastDate === yesterdayStr) {
            newStreak += 1;
          } else {
            newStreak = 1;
          }
          const newLongest = Math.max(newStreak, user.longestStreak);
          await storage.updateUserStreak(DEMO_USER_ID, newStreak, newLongest, today);
        }
        const stats = await storage.getUserStats(DEMO_USER_ID);
        await storage.updateUserStats(DEMO_USER_ID, stats.totalLessons);
      }
      res.json(progress);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid request data" });
      }
      console.error("Error marking lesson complete:", error);
      res.status(500).json({ error: "Failed to mark lesson complete" });
    }
  });
  app2.post("/api/seed", async (_req, res) => {
    try {
      const existingCategories = await storage.getAllCategories();
      if (existingCategories.length > 0) {
        return res.json({ message: "Database already seeded" });
      }
      const categoriesData = [
        {
          name: "Training",
          description: "Teach commands and build good habits",
          icon: "Brain",
          color: "chart-1",
          orderIndex: 0
        },
        {
          name: "Nutrition",
          description: "Learn about healthy diets and feeding",
          icon: "Heart",
          color: "chart-2",
          orderIndex: 1
        },
        {
          name: "Health",
          description: "Recognize symptoms and preventive care",
          icon: "Award",
          color: "chart-3",
          orderIndex: 2
        },
        {
          name: "Grooming",
          description: "Master brushing, bathing, and hygiene",
          icon: "Sparkles",
          color: "chart-4",
          orderIndex: 3
        },
        {
          name: "Behavior",
          description: "Understand body language and solve problems",
          icon: "BookOpen",
          color: "primary",
          orderIndex: 4
        }
      ];
      const createdCategories = [];
      for (const cat of categoriesData) {
        const category = await storage.createCategory(cat);
        createdCategories.push(category);
      }
      const lessonsData = [
        {
          categoryId: createdCategories[0].id,
          title: "Teaching Your Dog to Sit",
          description: "Learn the foundational command that builds trust and communication",
          content: "The 'sit' command is one of the most fundamental and useful commands you can teach your dog...",
          duration: 5,
          difficulty: "Beginner",
          orderIndex: 0
        },
        {
          categoryId: createdCategories[0].id,
          title: "Basic Recall Training",
          description: "Get your dog to come when called every time",
          content: "A reliable recall is essential for your dog's safety and freedom...",
          duration: 5,
          difficulty: "Beginner",
          orderIndex: 1
        },
        {
          categoryId: createdCategories[0].id,
          title: "Leash Walking Basics",
          description: "Enjoy peaceful walks without pulling",
          content: "Walking on a loose leash is a skill that requires patience and consistency...",
          duration: 5,
          difficulty: "Intermediate",
          orderIndex: 2
        },
        {
          categoryId: createdCategories[1].id,
          title: "Understanding Portion Sizes",
          description: "Feed your pet the right amount for their size and activity level",
          content: "Proper portion control is crucial for maintaining a healthy weight...",
          duration: 5,
          difficulty: "Beginner",
          orderIndex: 0
        },
        {
          categoryId: createdCategories[1].id,
          title: "Reading Food Labels",
          description: "Decode pet food ingredients and nutritional information",
          content: "Understanding what's in your pet's food helps you make better choices...",
          duration: 5,
          difficulty: "Intermediate",
          orderIndex: 1
        },
        {
          categoryId: createdCategories[2].id,
          title: "Recognizing Common Allergies",
          description: "Identify signs of allergies and sensitivities",
          content: "Allergies in pets can manifest in various ways...",
          duration: 5,
          difficulty: "Intermediate",
          orderIndex: 0
        },
        {
          categoryId: createdCategories[2].id,
          title: "Dental Care Basics",
          description: "Keep your pet's teeth healthy and clean",
          content: "Dental health is often overlooked but crucial for overall wellbeing...",
          duration: 5,
          difficulty: "Beginner",
          orderIndex: 1
        },
        {
          categoryId: createdCategories[3].id,
          title: "Basic Brushing Techniques",
          description: "Learn proper brushing for different coat types",
          content: "Regular brushing keeps your pet's coat healthy and reduces shedding...",
          duration: 5,
          difficulty: "Beginner",
          orderIndex: 0
        },
        {
          categoryId: createdCategories[3].id,
          title: "Nail Trimming Basics",
          description: "Safely trim your pet's nails at home",
          content: "Keeping nails trimmed prevents discomfort and health issues...",
          duration: 5,
          difficulty: "Intermediate",
          orderIndex: 1
        },
        {
          categoryId: createdCategories[4].id,
          title: "Reading Your Dog's Tail",
          description: "Understand what tail position and movement mean",
          content: "A dog's tail is a powerful communication tool...",
          duration: 5,
          difficulty: "Beginner",
          orderIndex: 0
        },
        {
          categoryId: createdCategories[4].id,
          title: "Understanding Stress Signals",
          description: "Recognize when your pet is anxious or uncomfortable",
          content: "Pets show stress in subtle ways that are easy to miss...",
          duration: 5,
          difficulty: "Intermediate",
          orderIndex: 1
        }
      ];
      for (const lesson of lessonsData) {
        await storage.createLesson(lesson);
      }
      let user = await storage.getUser(DEMO_USER_ID);
      if (!user) {
        const [createdUser] = await db.insert(users).values({
          id: DEMO_USER_ID,
          username: "demo_user",
          petName: "Buddy"
        }).returning();
        user = createdUser;
      }
      res.json({
        message: "Database seeded successfully",
        categories: createdCategories.length,
        lessons: lessonsData.length
      });
    } catch (error) {
      console.error("Error seeding database:", error);
      res.status(500).json({ error: "Failed to seed database" });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      ),
      await import("@replit/vite-plugin-dev-banner").then(
        (m) => m.devBanner()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
app.use(express2.json({
  verify: (req, _res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();
