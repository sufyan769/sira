import { Navigation } from "@/components/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  Mail, 
  Bell, 
  Cloud, 
  CheckCircle2,
  Settings,
  LogOut,
  Heart
} from "lucide-react";
import { useTheme } from "@/components/theme-provider";

export default function Profile() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="min-h-screen bg-background pb-20 sm:pb-4">
      <Navigation />

      <main className="container mx-auto px-4 py-6 max-w-4xl space-y-8">
        <div className="space-y-2">
          <h1 className="font-display text-3xl md:text-4xl font-bold">Profile & Settings</h1>
          <p className="text-muted-foreground">Manage your account and preferences</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="font-display flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Your Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-6">
              <Avatar className="h-20 w-20">
                <AvatarImage src="" />
                <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-bold">
                  AJ
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-1">
                <h3 className="font-display text-xl font-semibold" data-testid="text-username">Alex Johnson</h3>
                <p className="text-sm text-muted-foreground">Member since October 2025</p>
              </div>
              <Button variant="outline" data-testid="button-edit-profile">
                Edit Photo
              </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input 
                  id="username" 
                  defaultValue="alex_johnson" 
                  data-testid="input-username"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  defaultValue="alex@example.com"
                  data-testid="input-email"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="petName">Pet's Name</Label>
              <div className="flex gap-2">
                <Input 
                  id="petName" 
                  defaultValue="Buddy" 
                  placeholder="Your pet's name"
                  data-testid="input-pet-name"
                />
                <Heart className="h-9 w-9 text-primary p-2 rounded-lg bg-primary/10" />
              </div>
              <p className="text-xs text-muted-foreground">
                We'll personalize your experience with your pet's name
              </p>
            </div>

            <Button data-testid="button-save-profile">
              Save Changes
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-display flex items-center gap-2">
              <Settings className="h-5 w-5 text-primary" />
              Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <p className="font-medium">Theme</p>
                  <p className="text-sm text-muted-foreground">Choose your preferred color scheme</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant={theme === "light" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTheme("light")}
                    data-testid="button-theme-light"
                  >
                    Light
                  </Button>
                  <Button
                    variant={theme === "dark" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTheme("dark")}
                    data-testid="button-theme-dark"
                  >
                    Dark
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between gap-4 pt-4 border-t">
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <Bell className="h-4 w-4 text-muted-foreground" />
                    <p className="font-medium">Daily Reminders</p>
                  </div>
                  <p className="text-sm text-muted-foreground">Get notified to complete your daily lesson</p>
                </div>
                <Button variant="outline" size="sm" data-testid="button-notifications">
                  Configure
                </Button>
              </div>

              <div className="flex items-center justify-between gap-4 pt-4 border-t">
                <div className="space-y-1 flex-1">
                  <p className="font-medium">Reminder Time</p>
                  <p className="text-sm text-muted-foreground">When should we remind you?</p>
                </div>
                <Input 
                  type="time" 
                  defaultValue="09:00"
                  className="w-32"
                  data-testid="input-reminder-time"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-display flex items-center gap-2">
              <Cloud className="h-5 w-5 text-primary" />
              Sync Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3 p-4 rounded-lg bg-chart-3/10 border border-chart-3/20">
              <CheckCircle2 className="h-5 w-5 text-chart-3" />
              <div className="flex-1">
                <p className="font-medium text-sm">All synced</p>
                <p className="text-xs text-muted-foreground">Your progress is backed up and synced across all devices</p>
              </div>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Last synced</span>
                <span className="font-medium">Just now</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Devices</span>
                <Badge variant="secondary">2 devices</Badge>
              </div>
            </div>

            <Button variant="outline" className="w-full gap-2" data-testid="button-sync">
              <Cloud className="h-4 w-4" />
              Force Sync
            </Button>
          </CardContent>
        </Card>

        <Card className="border-destructive/20">
          <CardHeader>
            <CardTitle className="font-display text-destructive flex items-center gap-2">
              <LogOut className="h-5 w-5" />
              Account Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full" data-testid="button-logout">
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              Your progress is always saved and synced
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
