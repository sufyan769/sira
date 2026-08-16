import { useState, useMemo } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Navigation } from "@/components/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Search, 
  Clock, 
  CheckCircle2,
  Brain,
  Heart,
  Sparkles,
  BookOpen,
  Award
} from "lucide-react";
import type { Category, LessonWithProgress } from "@shared/schema";

const iconMap: Record<string, any> = {
  Brain,
  Heart,
  Award,
  Sparkles,
  BookOpen,
};

export default function Library() {
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: categories, isLoading: categoriesLoading } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const { data: lessons, isLoading: lessonsLoading } = useQuery<LessonWithProgress[]>({
    queryKey: ["/api/lessons"],
  });

  const isLoading = categoriesLoading || lessonsLoading;

  const categoriesWithProgress = useMemo(() => {
    if (!categories || !lessons) return [];
    
    return categories.map(category => {
      const categoryLessons = lessons.filter(l => l.category.id === category.id);
      const completed = categoryLessons.filter(l => l.completed).length;
      
      return {
        ...category,
        totalLessons: categoryLessons.length,
        completedLessons: completed,
      };
    });
  }, [categories, lessons]);

  const filteredLessons = useMemo(() => {
    if (!lessons) return [];
    
    return lessons.filter(lesson => {
      const matchesCategory = selectedCategory === null || lesson.category.id === selectedCategory;
      const matchesSearch = lesson.title.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [lessons, selectedCategory, searchQuery]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pb-20 sm:pb-4">
        <Navigation />
        <main className="container mx-auto px-4 py-6 max-w-6xl space-y-8">
          <div className="space-y-4">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5].map(i => (
              <Skeleton key={i} className="h-40" />
            ))}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20 sm:pb-4">
      <Navigation />

      <main className="container mx-auto px-4 py-6 max-w-6xl space-y-8">
        <div className="space-y-4">
          <div className="space-y-2">
            <h1 className="font-display text-3xl md:text-4xl font-bold">Lesson Library</h1>
            <p className="text-muted-foreground">Explore all available lessons and skill categories</p>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search lessons..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
              data-testid="input-search"
            />
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="font-display text-xl font-semibold">Categories</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {categoriesWithProgress.map((category) => {
              const Icon = iconMap[category.icon] || BookOpen;
              const progress = category.totalLessons > 0 
                ? (category.completedLessons / category.totalLessons) * 100 
                : 0;
              
              return (
                <Card
                  key={category.id}
                  className={`hover-elevate transition-all cursor-pointer ${
                    selectedCategory === category.id ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => setSelectedCategory(selectedCategory === category.id ? null : category.id)}
                  data-testid={`category-${category.id}`}
                >
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className={`flex h-12 w-12 items-center justify-center rounded-lg bg-${category.color}/10`}>
                        <Icon className={`h-6 w-6 text-${category.color}`} />
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {category.completedLessons}/{category.totalLessons}
                      </Badge>
                    </div>
                    
                    <div className="space-y-1">
                      <h3 className="font-display text-lg font-semibold">{category.name}</h3>
                      <p className="text-sm text-muted-foreground">{category.description}</p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Progress</span>
                        <span>{Math.round(progress)}%</span>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div 
                          className={`h-full bg-${category.color} transition-all`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {selectedCategory !== null && (
            <Button
              variant="outline"
              onClick={() => setSelectedCategory(null)}
              data-testid="button-clear-filter"
            >
              Clear Filter
            </Button>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <h2 className="font-display text-xl font-semibold">
              {selectedCategory 
                ? `${categories.find(c => c.id === selectedCategory)?.name} Lessons`
                : 'All Lessons'
              }
            </h2>
            <p className="text-sm text-muted-foreground">
              {filteredLessons.length} lesson{filteredLessons.length !== 1 ? 's' : ''}
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredLessons.map((lesson) => (
              <Card
                key={lesson.id}
                className={`hover-elevate transition-all ${
                  lesson.locked ? 'opacity-60' : 'cursor-pointer'
                }`}
              >
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 space-y-1">
                      <h3 className="font-semibold leading-tight">
                        {lesson.title}
                      </h3>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge className={`bg-${lesson.categoryColor}/10 text-${lesson.categoryColor} border-${lesson.categoryColor}/20 text-xs`}>
                          {lesson.category}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {lesson.difficulty}
                        </Badge>
                      </div>
                    </div>
                    
                    {lesson.completed && (
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-chart-3/10">
                        <CheckCircle2 className="h-4 w-4 text-chart-3" />
                      </div>
                    )}
                    
                    {lesson.locked && (
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                        <Lock className="h-4 w-4 text-muted-foreground" />
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>{lesson.duration} min</span>
                  </div>

                  {!lesson.locked ? (
                    <Link href={`/lesson/${lesson.id}`}>
                      <a data-testid={`lesson-${lesson.id}`}>
                        <Button 
                          variant={lesson.completed ? "outline" : "default"}
                          className="w-full"
                        >
                          {lesson.completed ? "Review Lesson" : "Start Lesson"}
                        </Button>
                      </a>
                    </Link>
                  ) : (
                    <Button variant="secondary" className="w-full" disabled>
                      <Lock className="h-4 w-4 mr-2" />
                      Locked
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredLessons.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center space-y-3">
                <div className="flex justify-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                    <Search className="h-8 w-8 text-muted-foreground" />
                  </div>
                </div>
                <h3 className="font-display text-lg font-semibold">No lessons found</h3>
                <p className="text-sm text-muted-foreground">
                  Try adjusting your search or filter to find what you're looking for
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
