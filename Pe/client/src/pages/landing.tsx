import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Clock, Award, Sparkles, BookOpen, Heart, Brain } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <BookOpen className="h-5 w-5" />
              </div>
              <span className="font-display text-xl font-bold">PetSkills</span>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Link href="/dashboard">
                <Button size="default" data-testid="link-get-started">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <section className="container mx-auto px-4 py-12 md:py-20">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
          <div className="space-y-6">
            <Badge className="w-fit" variant="secondary">
              <Sparkles className="h-3 w-3 mr-1" />
              Join 50,000+ pet parents
            </Badge>
            <h1 className="font-display text-5xl md:text-6xl font-bold leading-tight">
              Master Pet Care in{" "}
              <span className="text-primary">5 Minutes</span> Daily
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Build better habits with bite-sized lessons on training, nutrition, health, and care. 
              Your pets deserve the best, and learning has never been this easy.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/dashboard">
                <Button size="lg" className="gap-2" data-testid="button-start-learning">
                  <Heart className="h-4 w-4" />
                  Start Learning Today
                </Button>
              </Link>
              <Button size="lg" variant="outline">
                See How It Works
              </Button>
            </div>
            <div className="flex items-center gap-6 pt-4">
              <div className="flex items-center gap-2">
                <Check className="h-5 w-5 text-chart-3" />
                <span className="text-sm text-muted-foreground">Free forever</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-5 w-5 text-chart-3" />
                <span className="text-sm text-muted-foreground">No credit card</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-5 w-5 text-chart-3" />
                <span className="text-sm text-muted-foreground">Sync across devices</span>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="aspect-square rounded-2xl bg-gradient-to-br from-primary/20 to-chart-2/20 p-8 flex items-center justify-center">
              <div className="text-center space-y-4">
                <div className="inline-flex h-24 w-24 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <BookOpen className="h-12 w-12" />
                </div>
                <h3 className="font-display text-2xl font-bold">Daily Lessons</h3>
                <p className="text-muted-foreground">Learn something new every day</p>
              </div>
            </div>
            <div className="absolute -top-4 -right-4 bg-card border border-card-border rounded-xl p-4 shadow-lg">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold">5 min lessons</span>
              </div>
            </div>
            <div className="absolute -bottom-4 -left-4 bg-card border border-card-border rounded-xl p-4 shadow-lg">
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4 text-chart-4" />
                <span className="text-sm font-semibold">Daily streaks</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t bg-muted/30 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold">How It Works</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Three simple steps to becoming a better pet parent
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3 max-w-5xl mx-auto">
            <Card className="hover-elevate transition-all">
              <CardContent className="p-6 space-y-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <span className="text-2xl font-bold">1</span>
                </div>
                <h3 className="font-display text-xl font-semibold">Pick Your Topic</h3>
                <p className="text-muted-foreground">
                  Choose from training, nutrition, health, grooming, and behavior lessons tailored to your pets.
                </p>
              </CardContent>
            </Card>

            <Card className="hover-elevate transition-all">
              <CardContent className="p-6 space-y-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-chart-2/10 text-chart-2">
                  <span className="text-2xl font-bold">2</span>
                </div>
                <h3 className="font-display text-xl font-semibold">Learn Daily</h3>
                <p className="text-muted-foreground">
                  Spend just 5 minutes each day with bite-sized lessons designed to fit your busy schedule.
                </p>
              </CardContent>
            </Card>

            <Card className="hover-elevate transition-all">
              <CardContent className="p-6 space-y-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-chart-3/10 text-chart-3">
                  <span className="text-2xl font-bold">3</span>
                </div>
                <h3 className="font-display text-xl font-semibold">Track Progress</h3>
                <p className="text-muted-foreground">
                  Build streaks, earn achievements, and watch your pet care knowledge grow day by day.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-16">
        <div className="text-center space-y-4 mb-12">
          <h2 className="font-display text-3xl md:text-4xl font-bold">What You'll Learn</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Comprehensive pet care skills across five essential categories
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
          {[
            {
              name: "Training",
              icon: Brain,
              color: "text-chart-1",
              description: "Teach commands, build good habits, and strengthen your bond",
            },
            {
              name: "Nutrition",
              icon: Heart,
              color: "text-chart-2",
              description: "Learn about healthy diets, portion control, and special needs",
            },
            {
              name: "Health",
              icon: Award,
              color: "text-chart-3",
              description: "Recognize symptoms, preventive care, and wellness tips",
            },
            {
              name: "Grooming",
              icon: Sparkles,
              color: "text-chart-4",
              description: "Master brushing, bathing, nail care, and hygiene basics",
            },
            {
              name: "Behavior",
              icon: BookOpen,
              color: "text-primary",
              description: "Understand body language, solve problems, and reduce stress",
            },
          ].map((category) => (
            <Card key={category.name} className="hover-elevate transition-all">
              <CardContent className="p-6 space-y-3">
                <div className={`flex h-12 w-12 items-center justify-center rounded-lg bg-muted ${category.color}`}>
                  <category.icon className="h-6 w-6" />
                </div>
                <h3 className="font-display text-xl font-semibold">{category.name}</h3>
                <p className="text-sm text-muted-foreground">{category.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="border-t bg-muted/30 py-16">
        <div className="container mx-auto px-4 text-center space-y-6">
          <h2 className="font-display text-3xl md:text-4xl font-bold">
            Ready to Become a Better Pet Parent?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Start your learning journey today. No commitment required.
          </p>
          <Link href="/dashboard">
            <Button size="lg" className="gap-2" data-testid="button-cta-bottom">
              <Heart className="h-4 w-4" />
              Start Your First Lesson
            </Button>
          </Link>
        </div>
      </section>

      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>&copy; 2025 PetSkills. Learn with love, every day.</p>
        </div>
      </footer>
    </div>
  );
}
