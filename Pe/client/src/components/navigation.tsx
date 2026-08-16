import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Flame, BookOpen, BarChart3, Library, User } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function Navigation() {
  const [location] = useLocation();
  const { data: stats } = useQuery({
    queryKey: ["/api/user/stats"],
  });

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <Link href="/dashboard">
            <a className="flex items-center gap-2 hover-elevate active-elevate-2 rounded-md px-2 py-1 -ml-2" data-testid="link-home">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <BookOpen className="h-5 w-5" />
              </div>
              <span className="font-display text-xl font-bold">PetSkills</span>
            </a>
          </Link>

          <div className="flex items-center gap-2">
            {stats?.currentStreak > 0 && (
              <div className="hidden sm:flex items-center gap-1 rounded-lg bg-muted px-3 py-1.5">
                <Flame className="h-4 w-4 text-chart-4" />
                <span className="text-sm font-semibold" data-testid="text-streak">
                  {stats.currentStreak} day{stats.currentStreak !== 1 ? ' streak' : ' streak'}
                </span>
              </div>
            )}
            <ThemeToggle />
          </div>
        </div>
      </header>

      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sm:hidden">
        <div className="grid grid-cols-4 gap-1 p-2">
          <Link href="/dashboard">
            <a data-testid="link-dashboard">
              <Button
                variant={location === "/dashboard" ? "secondary" : "ghost"}
                size="sm"
                className="w-full flex-col h-auto py-2 gap-1"
              >
                <BookOpen className="h-5 w-5" />
                <span className="text-xs">Today</span>
              </Button>
            </a>
          </Link>
          <Link href="/progress">
            <a data-testid="link-progress">
              <Button
                variant={location === "/progress" ? "secondary" : "ghost"}
                size="sm"
                className="w-full flex-col h-auto py-2 gap-1"
              >
                <BarChart3 className="h-5 w-5" />
                <span className="text-xs">Progress</span>
              </Button>
            </a>
          </Link>
          <Link href="/library">
            <a data-testid="link-library">
              <Button
                variant={location === "/library" ? "secondary" : "ghost"}
                size="sm"
                className="w-full flex-col h-auto py-2 gap-1"
              >
                <Library className="h-5 w-5" />
                <span className="text-xs">Library</span>
              </Button>
            </a>
          </Link>
          <Link href="/profile">
            <a data-testid="link-profile">
              <Button
                variant={location === "/profile" ? "secondary" : "ghost"}
                size="sm"
                className="w-full flex-col h-auto py-2 gap-1"
              >
                <User className="h-5 w-5" />
                <span className="text-xs">Profile</span>
              </Button>
            </a>
          </Link>
        </div>
      </nav>
    </>
  );
}
