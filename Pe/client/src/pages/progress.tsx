import { Navigation } from "@/components/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Flame, 
  Trophy, 
  Clock, 
  CheckCircle2,
  TrendingUp,
  Award,
  Target,
  Calendar
} from "lucide-react";

export default function Progress() {
  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const completedDays = [true, true, true, false, false, false, false];

  return (
    <div className="min-h-screen bg-background pb-20 sm:pb-4">
      <Navigation />

      <main className="container mx-auto px-4 py-6 max-w-6xl space-y-8">
        <div className="space-y-2">
          <h1 className="font-display text-3xl md:text-4xl font-bold">Your Progress</h1>
          <p className="text-muted-foreground">Track your learning journey and achievements</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="hover-elevate transition-all">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-chart-4/10">
                  <Flame className="h-6 w-6 text-chart-4" />
                </div>
                <div className="flex-1">
                  <p className="text-3xl font-bold" data-testid="text-streak">3</p>
                  <p className="text-sm text-muted-foreground">Day Streak</p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t">
                <p className="text-xs text-muted-foreground">Longest: 7 days</p>
              </div>
            </CardContent>
          </Card>

          <Card className="hover-elevate transition-all">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-chart-3/10">
                  <CheckCircle2 className="h-6 w-6 text-chart-3" />
                </div>
                <div className="flex-1">
                  <p className="text-3xl font-bold" data-testid="text-total-lessons">12</p>
                  <p className="text-sm text-muted-foreground">Lessons Done</p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t">
                <p className="text-xs text-muted-foreground">This week: 3 lessons</p>
              </div>
            </CardContent>
          </Card>

          <Card className="hover-elevate transition-all">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-chart-1/10">
                  <Clock className="h-6 w-6 text-chart-1" />
                </div>
                <div className="flex-1">
                  <p className="text-3xl font-bold" data-testid="text-total-time">1.0</p>
                  <p className="text-sm text-muted-foreground">Hours Learned</p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t">
                <p className="text-xs text-muted-foreground">Average: 5 min/day</p>
              </div>
            </CardContent>
          </Card>

          <Card className="hover-elevate transition-all">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-chart-2/10">
                  <Trophy className="h-6 w-6 text-chart-2" />
                </div>
                <div className="flex-1">
                  <p className="text-3xl font-bold" data-testid="text-achievements">2</p>
                  <p className="text-sm text-muted-foreground">Achievements</p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t">
                <p className="text-xs text-muted-foreground">Next at 5 lessons</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="font-display flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                This Week's Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-7 gap-2">
                {weekDays.map((day, index) => (
                  <div key={day} className="text-center space-y-2">
                    <p className="text-xs text-muted-foreground font-medium">{day}</p>
                    <div
                      className={`h-12 rounded-lg flex items-center justify-center transition-all ${
                        completedDays[index]
                          ? 'bg-chart-3 text-white'
                          : 'bg-muted'
                      }`}
                    >
                      {completedDays[index] && <CheckCircle2 className="h-5 w-5" />}
                    </div>
                  </div>
                ))}
              </div>
              <div className="pt-4 border-t space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Weekly Goal</span>
                  <span className="font-semibold">3/7 days</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary transition-all"
                    style={{ width: `${(3 / 7) * 100}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-display flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-chart-2" />
                Learning Streak
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
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
                      className="text-chart-4 transition-all"
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <Flame className="h-8 w-8 text-chart-4 mb-1" />
                    <p className="text-2xl font-bold">3</p>
                    <p className="text-xs text-muted-foreground">days</p>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Current Streak</span>
                  <span className="font-semibold">3 days</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Longest Streak</span>
                  <span className="font-semibold">7 days</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="font-display flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Skills Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {[
                { name: "Training", completed: 3, total: 20, color: "chart-1", percentage: 15 },
                { name: "Nutrition", completed: 4, total: 15, color: "chart-2", percentage: 27 },
                { name: "Health", completed: 2, total: 18, color: "chart-3", percentage: 11 },
                { name: "Grooming", completed: 2, total: 12, color: "chart-4", percentage: 17 },
                { name: "Behavior", completed: 1, total: 16, color: "primary", percentage: 6 },
              ].map((skill) => (
                <div key={skill.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`h-2 w-2 rounded-full bg-${skill.color}`} />
                      <span className="font-semibold">{skill.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        {skill.completed}/{skill.total} lessons
                      </span>
                      <Badge variant="secondary" className="text-xs">
                        {skill.percentage}%
                      </Badge>
                    </div>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className={`h-full bg-${skill.color} transition-all`}
                      style={{ width: `${skill.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-display flex items-center gap-2">
              <Award className="h-5 w-5 text-chart-4" />
              Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[
                { 
                  name: "First Lesson", 
                  description: "Complete your first lesson",
                  unlocked: true,
                  icon: CheckCircle2,
                  color: "chart-3"
                },
                { 
                  name: "3-Day Streak", 
                  description: "Maintain a 3-day learning streak",
                  unlocked: true,
                  icon: Flame,
                  color: "chart-4"
                },
                { 
                  name: "Quick Learner", 
                  description: "Complete 5 lessons",
                  unlocked: false,
                  icon: TrendingUp,
                  color: "muted-foreground"
                },
                { 
                  name: "Dedicated", 
                  description: "7-day learning streak",
                  unlocked: false,
                  icon: Trophy,
                  color: "muted-foreground"
                },
                { 
                  name: "Category Master", 
                  description: "Complete all lessons in one category",
                  unlocked: false,
                  icon: Target,
                  color: "muted-foreground"
                },
                { 
                  name: "Pet Expert", 
                  description: "Complete 50 lessons",
                  unlocked: false,
                  icon: Award,
                  color: "muted-foreground"
                },
              ].map((achievement) => (
                <Card 
                  key={achievement.name} 
                  className={`${achievement.unlocked ? 'hover-elevate' : 'opacity-60'} transition-all`}
                >
                  <CardContent className="p-6 space-y-3">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${
                      achievement.unlocked 
                        ? `bg-${achievement.color}/10` 
                        : 'bg-muted'
                    }`}>
                      <achievement.icon className={`h-6 w-6 ${
                        achievement.unlocked 
                          ? `text-${achievement.color}` 
                          : 'text-muted-foreground'
                      }`} />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-semibold">{achievement.name}</h4>
                      <p className="text-sm text-muted-foreground">{achievement.description}</p>
                    </div>
                    {achievement.unlocked && (
                      <Badge className="bg-chart-3/10 text-chart-3 border-chart-3/20">
                        Unlocked
                      </Badge>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
