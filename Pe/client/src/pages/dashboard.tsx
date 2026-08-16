import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Navigation } from "@/components/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  BookOpen, 
  Flame, 
  Trophy, 
  Clock, 
  CheckCircle2, 
  ArrowRight,
  TrendingUp,
  Target
} from "lucide-react";
import type { LessonWithProgress } from "@shared/schema";

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/user/stats"],
  });

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ["/api/user/profile"],
  });

  const { data: lessons, isLoading: lessonsLoading } = useQuery<LessonWithProgress[]>({
    queryKey: ["/api/lessons"],
  });

  const isLoading = statsLoading || profileLoading || lessonsLoading;

  const todayLesson = lessons?.find(l => !l.completed);
  const completedLessons = lessons?.filter(l => l.completed).slice(0, 3) || [];
  const upcomingLessons = lessons?.filter(l => !l.completed).slice(1, 4) || [];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pb-20 sm:pb-4">
        <Navigation />
        <main className="container mx-auto px-4 py-6 max-w-6xl space-y-8">
          <div className="space-y-2">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-5 w-48" />
          </div>
          <div className="grid gap-4 md:grid-cols-4">
            {[1, 2, 3, 4].map(i => (
              <Skeleton key={i} className="h-24" />
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
        <div className="space-y-2">
          <h1 className="font-display text-3xl md:text-4xl font-bold">
            Welcome back{profile?.petName ? `, ${profile.username}` : ''}! 🐾
          </h1>
          <p className="text-muted-foreground">
            {profile?.petName ? `Ready for today's lesson with ${profile.petName}?` : 'Ready for today\'s lesson?'}
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card className="hover-elevate transition-all">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-chart-4/10">
                  <Flame className="h-5 w-5 text-chart-4" />
                </div>
                <div>
                  <p className="text-2xl font-bold" data-testid="text-current-streak">{stats?.currentStreak || 0}</p>
                  <p className="text-xs text-muted-foreground">Day Streak</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover-elevate transition-all">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-chart-3/10">
                  <CheckCircle2 className="h-5 w-5 text-chart-3" />
                </div>
                <div>
                  <p className="text-2xl font-bold" data-testid="text-lessons-completed">{stats?.totalLessons || 0}</p>
                  <p className="text-xs text-muted-foreground">Completed</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover-elevate transition-all">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-chart-1/10">
                  <Clock className="h-5 w-5 text-chart-1" />
                </div>
                <div>
                  <p className="text-2xl font-bold" data-testid="text-hours-learned">{((stats?.totalMinutes || 0) / 60).toFixed(1)}</p>
                  <p className="text-xs text-muted-foreground">Hours</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover-elevate transition-all">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-chart-2/10">
                  <Trophy className="h-5 w-5 text-chart-2" />
                </div>
                <div>
                  <p className="text-2xl font-bold" data-testid="text-skills-mastered">{stats?.currentStreak >= 3 ? '1' : '0'}</p>
                  <p className="text-xs text-muted-foreground">Skills</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {todayLesson ? (
          <Card className="border-primary/20 shadow-lg">
            <CardHeader className="space-y-1 pb-4">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="space-y-1">
                  <CardTitle className="text-2xl font-display">Today's Lesson</CardTitle>
                  <p className="text-sm text-muted-foreground">Continue your learning journey</p>
                </div>
                <Badge variant="secondary" className="gap-1">
                  <Clock className="h-3 w-3" />
                  {todayLesson.duration} min
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1 flex-1">
                    <h3 className="font-display text-xl font-semibold" data-testid="text-lesson-title">
                      {todayLesson.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {todayLesson.description}
                    </p>
                  </div>
                  <Badge className={`bg-${todayLesson.category.color}/10 text-${todayLesson.category.color} hover:bg-${todayLesson.category.color}/20 border-${todayLesson.category.color}/20`}>
                    {todayLesson.category.name}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Badge variant="outline" className="text-xs">{todayLesson.difficulty}</Badge>
                </div>
              </div>

              <Link href={`/lesson/${todayLesson.id}`}>
                <a data-testid="button-start-lesson">
                  <Button size="lg" className="w-full gap-2">
                    Start Lesson
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </a>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-12 text-center space-y-4">
              <div className="flex justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-chart-3/10">
                  <CheckCircle2 className="h-8 w-8 text-chart-3" />
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="font-display text-xl font-semibold">All caught up!</h3>
                <p className="text-sm text-muted-foreground">
                  You've completed all available lessons. Great work!
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="font-display flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Weekly Goal
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-center">
                <div className="relative">
                  <svg className="h-32 w-32 -rotate-90">
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="none"
                      className="text-muted"
                    />
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 56}`}
                      strokeDashoffset={`${2 * Math.PI * 56 * (1 - 3/7)}`}
                      className="text-primary transition-all"
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <p className="text-3xl font-bold">3/7</p>
                    <p className="text-xs text-muted-foreground">days</p>
                  </div>
                </div>
              </div>
              <div className="text-center space-y-1">
                <p className="text-sm font-medium">Keep your streak going!</p>
                <p className="text-xs text-muted-foreground">Complete 7 lessons this week</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-display flex items-center gap-2">
                <Target className="h-5 w-5 text-chart-2" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {completedLessons.length > 0 ? (
                  completedLessons.map((lesson) => (
                    <div key={lesson.id} className="flex items-start gap-3 p-3 rounded-lg hover-elevate transition-all">
                      <div className="flex h-8 w-8 items-center justify-center rounded-md bg-chart-3/10">
                        <CheckCircle2 className="h-4 w-4 text-chart-3" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{lesson.title}</p>
                        <p className="text-xs text-muted-foreground">{lesson.category.name}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No lessons completed yet. Start learning today!
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="font-display">Continue Learning</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {upcomingLessons.length > 0 ? (
                upcomingLessons.map((lesson) => (
                  <Link key={lesson.id} href={`/lesson/${lesson.id}`}>
                    <a>
                      <Card className="hover-elevate transition-all group cursor-pointer">
                        <CardContent className="p-5 space-y-3">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 space-y-1">
                              <h4 className="font-semibold text-sm leading-tight group-hover:text-primary transition-colors">
                                {lesson.title}
                              </h4>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Badge variant="outline" className="text-xs px-1.5 py-0">
                                  {lesson.difficulty}
                                </Badge>
                              </div>
                            </div>
                            <Badge className={`bg-${lesson.category.color}/10 text-${lesson.category.color} hover:bg-${lesson.category.color}/20 border-${lesson.category.color}/20 text-xs`}>
                              {lesson.category.name}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span>{lesson.duration} min</span>
                          </div>
                        </CardContent>
                      </Card>
                    </a>
                  </Link>
                ))
              ) : (
                <div className="col-span-full">
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No more lessons to complete. Great job!
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
