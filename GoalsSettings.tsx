
'use client';

import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Save } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast"; // Import useToast

export interface TargetSettings {
  dailyVideos: number;
  dailyHours: number;
  weeklyVideos: number;
  weeklyHours: number;
  monthlyVideos: number;
  monthlyHours: number;
}

// Default targets (can be moved to a config file)
export const DEFAULT_TARGETS: TargetSettings = {
  dailyVideos: 5,
  dailyHours: 1,
  weeklyVideos: 30, // Assuming 6 working days
  weeklyHours: 6,
  monthlyVideos: 120, // Assuming ~20 working days
  monthlyHours: 24,
};

const GOALS_STORAGE_KEY = 'videoAnalyticsPro_goals';

const GoalsSettings: React.FC = () => {
  const { translations } = useLanguage();
  const { toast } = useToast();
  const [targets, setTargets] = useState<TargetSettings>(DEFAULT_TARGETS);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load saved targets from localStorage
    const savedGoals = localStorage.getItem(GOALS_STORAGE_KEY);
    if (savedGoals) {
      try {
        setTargets(JSON.parse(savedGoals));
      } catch (error) {
        console.error("Error parsing saved goals:", error);
        // Use defaults if parsing fails
        setTargets(DEFAULT_TARGETS);
      }
    }
    setIsLoading(false);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numValue = parseFloat(value);
    setTargets(prev => ({
      ...prev,
      [name]: isNaN(numValue) || numValue < 0 ? 0 : numValue, // Ensure non-negative numbers
    }));
  };

  const handleSave = () => {
    try {
      localStorage.setItem(GOALS_STORAGE_KEY, JSON.stringify(targets));
      toast({ // Use toast for feedback
        title: translations.settings.goals.saveSuccessTitle,
        description: translations.settings.goals.saveSuccessDescription,
      });
      // Optionally trigger a global state update or event if needed immediately elsewhere
      window.dispatchEvent(new Event('goalsUpdated')); // Simple event dispatch
    } catch (error) {
      console.error("Error saving goals:", error);
      toast({ // Use toast for error feedback
        variant: "destructive",
        title: translations.settings.goals.saveErrorTitle,
        description: translations.settings.goals.saveErrorDescription,
      });
    }
  };

  if (isLoading) {
    return <p>{translations.settings.loading}</p>; // Add loading state translation
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{translations.settings.goals.title}</CardTitle>
        <CardDescription>{translations.settings.goals.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Daily Targets */}
        <div className="space-y-2">
          <h4 className="font-medium text-sm">{translations.settings.goals.dailyTitle}</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="dailyVideos">{translations.settings.goals.videosLabel}</Label>
              <Input
                id="dailyVideos"
                name="dailyVideos"
                type="number"
                value={targets.dailyVideos}
                onChange={handleInputChange}
                min="0"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="dailyHours">{translations.settings.goals.hoursLabel}</Label>
              <Input
                id="dailyHours"
                name="dailyHours"
                type="number"
                step="0.1"
                value={targets.dailyHours}
                onChange={handleInputChange}
                min="0"
              />
            </div>
          </div>
        </div>

        {/* Weekly Targets */}
        <div className="space-y-2">
          <h4 className="font-medium text-sm">{translations.settings.goals.weeklyTitle}</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="weeklyVideos">{translations.settings.goals.videosLabel}</Label>
              <Input
                id="weeklyVideos"
                name="weeklyVideos"
                type="number"
                value={targets.weeklyVideos}
                onChange={handleInputChange}
                min="0"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="weeklyHours">{translations.settings.goals.hoursLabel}</Label>
              <Input
                id="weeklyHours"
                name="weeklyHours"
                type="number"
                step="0.1"
                value={targets.weeklyHours}
                onChange={handleInputChange}
                min="0"
              />
            </div>
          </div>
        </div>

        {/* Monthly Targets */}
        <div className="space-y-2">
          <h4 className="font-medium text-sm">{translations.settings.goals.monthlyTitle}</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="monthlyVideos">{translations.settings.goals.videosLabel}</Label>
              <Input
                id="monthlyVideos"
                name="monthlyVideos"
                type="number"
                value={targets.monthlyVideos}
                onChange={handleInputChange}
                min="0"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="monthlyHours">{translations.settings.goals.hoursLabel}</Label>
              <Input
                id="monthlyHours"
                name="monthlyHours"
                type="number"
                step="0.1"
                value={targets.monthlyHours}
                onChange={handleInputChange}
                min="0"
              />
            </div>
          </div>
        </div>

        <Button onClick={handleSave}>
          <Save className="mr-2 h-4 w-4" />
          {translations.settings.goals.saveButton}
        </Button>
      </CardContent>
    </Card>
  );
};

// Function to get current targets (can be used by other components)
export const getCurrentTargets = (): TargetSettings => {
    if (typeof window !== 'undefined') { // Ensure runs only on client
        const savedGoals = localStorage.getItem(GOALS_STORAGE_KEY);
        if (savedGoals) {
            try {
                return JSON.parse(savedGoals);
            } catch (error) {
                console.error("Error parsing saved goals, using defaults:", error);
                return DEFAULT_TARGETS;
            }
        }
    }
    return DEFAULT_TARGETS;
};

export default GoalsSettings;

