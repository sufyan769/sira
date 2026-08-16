import { useState } from "react";
import { useRoute, useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { Navigation } from "@/components/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles,
  Clock,
  Target
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { queryClient, apiRequest } from "@/lib/queryClient";

const lessonSteps = [
  {
    title: "Introduction to Sit Command",
    content: "The 'sit' command is one of the most fundamental and useful commands you can teach your dog. It helps establish communication, builds trust, and serves as the foundation for more advanced training.",
    type: "content",
  },
  {
    title: "What You'll Need",
    content: "Before you begin, gather these simple items:\n\n• Small, soft training treats\n• A quiet space with minimal distractions\n• Your dog's favorite toy (optional)\n• About 5 minutes of focused time\n\nRemember: Patience and consistency are your best tools!",
    type: "content",
  },
  {
    title: "Step-by-Step Method",
    content: "1. Hold a treat close to your dog's nose\n2. Slowly move your hand up, allowing their head to follow the treat\n3. As their head goes up, their bottom will naturally go down\n4. The moment their bottom touches the ground, say 'Sit!'\n5. Immediately give them the treat and praise\n\nRepeat this 5-10 times per session, keeping sessions short and positive.",
    type: "content",
  },
  {
    title: "Quick Check",
    content: "When should you give the treat?",
    type: "quiz",
    options: [
      "Before they sit down",
      "The moment their bottom touches the ground",
      "After they stand back up",
    ],
    correctAnswer: 1,
  },
  {
    title: "Common Mistakes to Avoid",
    content: "• Don't push your dog into a sitting position - let them figure it out\n• Avoid using the treat as a lure for too long\n• Don't repeat the command multiple times if they don't respond\n• Keep training sessions short (5-10 minutes)\n• Always end on a positive note\n\nIf your dog isn't responding, take a break and try again later!",
    type: "content",
  },
  {
    title: "Practice Tips",
    content: "To reinforce this skill:\n\n✓ Practice in different locations\n✓ Gradually increase distractions\n✓ Phase out treats slowly over time\n✓ Use the command in daily situations\n✓ Stay consistent with your hand signal\n\nConsistency is key - practice a little bit every day!",
    type: "content",
  },
];

export default function Lesson() {
  const [, params] = useRoute("/lesson/:id");
  const [, setLocation] = useLocation();
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showCompletion, setShowCompletion] = useState(false);

  const lessonId = parseInt(params?.id || "1");

  const completeMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", "/api/progress/complete", {
        lessonId,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/lessons"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/stats"] });
    },
  });

  const progress = ((currentStep + 1) / lessonSteps.length) * 100;
  const step = lessonSteps[currentStep];
  const isLastStep = currentStep === lessonSteps.length - 1;

  const handleNext = () => {
    if (step.type === "quiz" && selectedAnswer === null) {
      return;
    }

    if (isLastStep) {
      completeMutation.mutate();
      setShowCompletion(true);
    } else {
      setCurrentStep(currentStep + 1);
      setSelectedAnswer(null);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setSelectedAnswer(null);
    }
  };

  const handleComplete = () => {
    setShowCompletion(false);
    setLocation("/dashboard");
  };

  return (
    <div className="min-h-screen bg-background pb-20 sm:pb-4">
      <Navigation />

      <div className="sticky top-16 z-40 bg-background border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-3 max-w-3xl mx-auto">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBack}
              disabled={currentStep === 0}
              data-testid="button-back"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex-1 space-y-1">
              <Progress value={progress} className="h-2" />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Step {currentStep + 1} of {lessonSteps.length}</span>
                <span>{Math.round(progress)}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge className="bg-chart-1/10 text-chart-1 border-chart-1/20">Training</Badge>
              <Badge variant="outline" className="gap-1">
                <Clock className="h-3 w-3" />
                5 min
              </Badge>
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-bold">
              Teaching Your Dog to Sit
            </h1>
          </div>

          <Card>
            <CardContent className="p-8 space-y-6">
              <div className="space-y-3">
                <h2 className="font-display text-xl md:text-2xl font-semibold">
                  {step.title}
                </h2>
                
                {step.type === "content" && (
                  <div className="prose prose-sm max-w-none">
                    <p className="text-base leading-relaxed whitespace-pre-line text-foreground">
                      {step.content}
                    </p>
                  </div>
                )}

                {step.type === "quiz" && (
                  <div className="space-y-4">
                    <p className="text-base text-muted-foreground">{step.content}</p>
                    <div className="space-y-2">
                      {step.options?.map((option, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedAnswer(index)}
                          className={`w-full p-4 text-left rounded-lg border-2 transition-all hover-elevate ${
                            selectedAnswer === index
                              ? index === step.correctAnswer
                                ? "border-chart-3 bg-chart-3/10"
                                : "border-destructive bg-destructive/10"
                              : "border-border hover:border-primary/50"
                          }`}
                          data-testid={`option-${index}`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`flex h-6 w-6 items-center justify-center rounded-full border-2 ${
                              selectedAnswer === index
                                ? index === step.correctAnswer
                                  ? "border-chart-3 bg-chart-3 text-white"
                                  : "border-destructive bg-destructive text-white"
                                : "border-muted-foreground"
                            }`}>
                              {selectedAnswer === index && (
                                <CheckCircle2 className="h-4 w-4" />
                              )}
                            </div>
                            <span className="font-medium">{option}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                    {selectedAnswer !== null && (
                      <div className={`p-4 rounded-lg ${
                        selectedAnswer === step.correctAnswer
                          ? "bg-chart-3/10 border border-chart-3/20"
                          : "bg-destructive/10 border border-destructive/20"
                      }`}>
                        <p className="text-sm font-medium">
                          {selectedAnswer === step.correctAnswer
                            ? "✓ Correct! Great job!"
                            : "Not quite. The correct answer is highlighted above."}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between gap-4 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={handleBack}
                  disabled={currentStep === 0}
                  data-testid="button-previous"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Previous
                </Button>
                <Button
                  onClick={handleNext}
                  disabled={step.type === "quiz" && selectedAnswer === null}
                  data-testid="button-continue"
                >
                  {isLastStep ? "Complete Lesson" : "Continue"}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Dialog open={showCompletion} onOpenChange={setShowCompletion}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-chart-3/10">
                <Sparkles className="h-8 w-8 text-chart-3" />
              </div>
            </div>
            <DialogTitle className="font-display text-2xl">Lesson Complete! 🎉</DialogTitle>
            <DialogDescription className="text-base">
              Great job! You've completed "Teaching Your Dog to Sit". Keep up your streak!
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <Card>
              <CardContent className="p-4">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-chart-4">4</p>
                    <p className="text-xs text-muted-foreground">Day Streak</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-chart-1">+5</p>
                    <p className="text-xs text-muted-foreground">Minutes</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Button 
              onClick={handleComplete} 
              className="w-full gap-2"
              data-testid="button-complete"
            >
              <Target className="h-4 w-4" />
              Back to Dashboard
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
