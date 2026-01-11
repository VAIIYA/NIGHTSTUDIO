"use client";

import { CheckCircle, Circle } from "lucide-react";
import { Profile } from "@/types";

interface OnboardingChecklistProps {
  profile: Profile | null;
}

export function OnboardingChecklist({ profile }: OnboardingChecklistProps) {
  const checklistItems = [
    {
      id: "displayName",
      label: "Set display name",
      completed: !!profile?.displayName?.trim(),
    },
    {
      id: "username",
      label: "Set username",
      completed: !!profile?.username?.trim(),
    },
    {
      id: "bio",
      label: "Add bio description",
      completed: !!profile?.bio?.trim(),
    },
    {
      id: "avatar",
      label: "Upload profile avatar",
      completed: !!profile?.avatar,
    },
    {
      id: "banner",
      label: "Upload profile banner",
      completed: !!profile?.banner,
    },
  ];

  const completedCount = checklistItems.filter(item => item.completed).length;
  const totalCount = checklistItems.length;
  const progress = (completedCount / totalCount) * 100;

  if (completedCount === totalCount) {
    return null; // Hide when complete
  }

  return (
    <div className="bg-primary/5 border border-primary/20 rounded-lg p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Complete Your Profile</h2>
        <span className="text-sm text-muted-foreground">
          {completedCount}/{totalCount} complete
        </span>
      </div>

      <div className="w-full bg-background rounded-full h-2 mb-4">
        <div
          className="bg-primary h-2 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="space-y-3">
        {checklistItems.map((item) => (
          <div key={item.id} className="flex items-center gap-3">
            {item.completed ? (
              <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
            ) : (
              <Circle className="h-5 w-5 text-muted-foreground flex-shrink-0" />
            )}
            <span className={`text-sm ${item.completed ? "text-muted-foreground line-through" : ""}`}>
              {item.label}
            </span>
          </div>
        ))}
      </div>

      <p className="text-xs text-muted-foreground mt-4">
        Complete these steps to make your profile more attractive to potential subscribers.
      </p>
    </div>
  );
}