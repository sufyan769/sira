import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { db } from "./db";
import { users } from "@shared/schema";
import { z } from "zod";

const DEMO_USER_ID = "demo-user-123";

export async function registerRoutes(app: Express): Promise<Server> {
  
  app.get("/api/categories", async (_req, res) => {
    try {
      const categories = await storage.getAllCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ error: "Failed to fetch categories" });
    }
  });

  app.get("/api/lessons", async (_req, res) => {
    try {
      const lessons = await storage.getLessonsWithProgress(DEMO_USER_ID);
      res.json(lessons);
    } catch (error) {
      console.error("Error fetching lessons:", error);
      res.status(500).json({ error: "Failed to fetch lessons" });
    }
  });

  app.get("/api/lessons/:id", async (req, res) => {
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
        completedAt: progress?.completedAt || null,
      });
    } catch (error) {
      console.error("Error fetching lesson:", error);
      res.status(500).json({ error: "Failed to fetch lesson" });
    }
  });

  app.get("/api/user/stats", async (_req, res) => {
    try {
      const stats = await storage.getUserStats(DEMO_USER_ID);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching user stats:", error);
      res.status(500).json({ error: "Failed to fetch user stats" });
    }
  });

  app.get("/api/user/profile", async (_req, res) => {
    try {
      let user = await storage.getUser(DEMO_USER_ID);
      
      if (!user) {
        const [createdUser] = await db
          .insert(users)
          .values({
            id: DEMO_USER_ID,
            username: "demo_user",
            petName: "Buddy",
          })
          .returning();
        user = createdUser;
      }

      res.json(user);
    } catch (error) {
      console.error("Error fetching user profile:", error);
      res.status(500).json({ error: "Failed to fetch user profile" });
    }
  });

  app.post("/api/progress/complete", async (req, res) => {
    try {
      const schema = z.object({
        lessonId: z.number(),
      });

      const { lessonId } = schema.parse(req.body);

      const progress = await storage.markLessonComplete(DEMO_USER_ID, lessonId);

      const user = await storage.getUser(DEMO_USER_ID);
      if (user) {
        const today = new Date().toISOString().split('T')[0];
        const lastDate = user.lastCompletedDate;
        
        let newStreak = user.currentStreak;
        
        if (lastDate !== today) {
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayStr = yesterday.toISOString().split('T')[0];
          
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

  app.post("/api/seed", async (_req, res) => {
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
          orderIndex: 0,
        },
        {
          name: "Nutrition",
          description: "Learn about healthy diets and feeding",
          icon: "Heart",
          color: "chart-2",
          orderIndex: 1,
        },
        {
          name: "Health",
          description: "Recognize symptoms and preventive care",
          icon: "Award",
          color: "chart-3",
          orderIndex: 2,
        },
        {
          name: "Grooming",
          description: "Master brushing, bathing, and hygiene",
          icon: "Sparkles",
          color: "chart-4",
          orderIndex: 3,
        },
        {
          name: "Behavior",
          description: "Understand body language and solve problems",
          icon: "BookOpen",
          color: "primary",
          orderIndex: 4,
        },
      ];

      const createdCategories: any[] = [];
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
          orderIndex: 0,
        },
        {
          categoryId: createdCategories[0].id,
          title: "Basic Recall Training",
          description: "Get your dog to come when called every time",
          content: "A reliable recall is essential for your dog's safety and freedom...",
          duration: 5,
          difficulty: "Beginner",
          orderIndex: 1,
        },
        {
          categoryId: createdCategories[0].id,
          title: "Leash Walking Basics",
          description: "Enjoy peaceful walks without pulling",
          content: "Walking on a loose leash is a skill that requires patience and consistency...",
          duration: 5,
          difficulty: "Intermediate",
          orderIndex: 2,
        },
        {
          categoryId: createdCategories[1].id,
          title: "Understanding Portion Sizes",
          description: "Feed your pet the right amount for their size and activity level",
          content: "Proper portion control is crucial for maintaining a healthy weight...",
          duration: 5,
          difficulty: "Beginner",
          orderIndex: 0,
        },
        {
          categoryId: createdCategories[1].id,
          title: "Reading Food Labels",
          description: "Decode pet food ingredients and nutritional information",
          content: "Understanding what's in your pet's food helps you make better choices...",
          duration: 5,
          difficulty: "Intermediate",
          orderIndex: 1,
        },
        {
          categoryId: createdCategories[2].id,
          title: "Recognizing Common Allergies",
          description: "Identify signs of allergies and sensitivities",
          content: "Allergies in pets can manifest in various ways...",
          duration: 5,
          difficulty: "Intermediate",
          orderIndex: 0,
        },
        {
          categoryId: createdCategories[2].id,
          title: "Dental Care Basics",
          description: "Keep your pet's teeth healthy and clean",
          content: "Dental health is often overlooked but crucial for overall wellbeing...",
          duration: 5,
          difficulty: "Beginner",
          orderIndex: 1,
        },
        {
          categoryId: createdCategories[3].id,
          title: "Basic Brushing Techniques",
          description: "Learn proper brushing for different coat types",
          content: "Regular brushing keeps your pet's coat healthy and reduces shedding...",
          duration: 5,
          difficulty: "Beginner",
          orderIndex: 0,
        },
        {
          categoryId: createdCategories[3].id,
          title: "Nail Trimming Basics",
          description: "Safely trim your pet's nails at home",
          content: "Keeping nails trimmed prevents discomfort and health issues...",
          duration: 5,
          difficulty: "Intermediate",
          orderIndex: 1,
        },
        {
          categoryId: createdCategories[4].id,
          title: "Reading Your Dog's Tail",
          description: "Understand what tail position and movement mean",
          content: "A dog's tail is a powerful communication tool...",
          duration: 5,
          difficulty: "Beginner",
          orderIndex: 0,
        },
        {
          categoryId: createdCategories[4].id,
          title: "Understanding Stress Signals",
          description: "Recognize when your pet is anxious or uncomfortable",
          content: "Pets show stress in subtle ways that are easy to miss...",
          duration: 5,
          difficulty: "Intermediate",
          orderIndex: 1,
        },
      ];

      for (const lesson of lessonsData) {
        await storage.createLesson(lesson);
      }

      let user = await storage.getUser(DEMO_USER_ID);
      if (!user) {
        const [createdUser] = await db
          .insert(users)
          .values({
            id: DEMO_USER_ID,
            username: "demo_user",
            petName: "Buddy",
          })
          .returning();
        user = createdUser;
      }

      res.json({ 
        message: "Database seeded successfully",
        categories: createdCategories.length,
        lessons: lessonsData.length,
      });
    } catch (error) {
      console.error("Error seeding database:", error);
      res.status(500).json({ error: "Failed to seed database" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
