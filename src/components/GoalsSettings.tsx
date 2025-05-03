
'use client';

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
import { useLanguage } from '@/contexts/LanguageContext';
import { Target } from 'lucide-react';
import toast from 'react-hot-toast';

export interface CustomTargets {
    dailyVideos: number;
    dailyHours: number;
    weeklyVideos: number;
    weeklyHours: number;
    monthlyVideos: number; // Note: Monthly might still be calculated based on working days
    monthlyHours: number;  // Or allow direct setting
}

interface GoalsSettingsProps {
    initialTargets: CustomTargets;
    onTargetsSave: (newTargets: CustomTargets) => void;
}

const GoalsSettings: React.FC<GoalsSettingsProps> = ({ initialTargets, onTargetsSave }) => {
    const { translations } = useLanguage();
    const [targets, setTargets] = useState<CustomTargets>(initialTargets);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Update local state if initialTargets prop changes (e.g., loaded from storage later)
    useEffect(() => {
        setTargets(initialTargets);
    }, [initialTargets]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setTargets(prev => ({
            ...prev,
            [name]: value === '' ? 0 : parseFloat(value) || 0 // Ensure number, default to 0 if invalid
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        // Basic validation (ensure non-negative)
        const validatedTargets: CustomTargets = {
            dailyVideos: Math.max(0, targets.dailyVideos),
            dailyHours: Math.max(0, targets.dailyHours),
            weeklyVideos: Math.max(0, targets.weeklyVideos),
            weeklyHours: Math.max(0, targets.weeklyHours),
            monthlyVideos: Math.max(0, targets.monthlyVideos),
            monthlyHours: Math.max(0, targets.monthlyHours),
        };
        setTargets(validatedTargets); // Update state with validated values
        onTargetsSave(validatedTargets);
        toast.success(translations.goalsSettings.successMessage);
        setIsSubmitting(false);
        // Parent component should handle saving to localStorage
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center">
                    <Target className="w-5 h-5 mr-2 rtl:ml-2" />
                    {translations.goalsSettings.title}
                </CardTitle>
                <CardDescription>{translations.goalsSettings.description}</CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
                <CardContent className="space-y-6">
                    {/* Daily Targets */}
                    <div>
                        <h4 className="text-md font-medium mb-2">{translations.goalsSettings.dailyTitle}</h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="dailyVideos">{translations.goalsSettings.videosLabel}</Label>
                                <Input
                                    id="dailyVideos"
                                    name="dailyVideos"
                                    type="number"
                                    value={targets.dailyVideos || ''}
                                    onChange={handleChange}
                                    placeholder="e.g., 3000"
                                    min="0"
                                    step="1"
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <Label htmlFor="dailyHours">{translations.goalsSettings.hoursLabel}</Label>
                                <Input
                                    id="dailyHours"
                                    name="dailyHours"
                                    type="number"
                                    value={targets.dailyHours || ''}
                                    onChange={handleChange}
                                    placeholder="e.g., 8"
                                    min="0"
                                    step="0.1"
                                    className="mt-1"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Weekly Targets */}
                    <div>
                        <h4 className="text-md font-medium mb-2">{translations.goalsSettings.weeklyTitle}</h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="weeklyVideos">{translations.goalsSettings.videosLabel}</Label>
                                <Input
                                    id="weeklyVideos"
                                    name="weeklyVideos"
                                    type="number"
                                    value={targets.weeklyVideos || ''}
                                    onChange={handleChange}
                                    placeholder="e.g., 18000"
                                    min="0"
                                    step="1"
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <Label htmlFor="weeklyHours">{translations.goalsSettings.hoursLabel}</Label>
                                <Input
                                    id="weeklyHours"
                                    name="weeklyHours"
                                    type="number"
                                    value={targets.weeklyHours || ''}
                                    onChange={handleChange}
                                    placeholder="e.g., 48"
                                    min="0"
                                    step="0.1"
                                    className="mt-1"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Monthly Targets */}
                    <div>
                        <h4 className="text-md font-medium mb-2">{translations.goalsSettings.monthlyTitle}</h4>
                         <p className="text-xs text-muted-foreground mb-2">{translations.goalsSettings.monthlyNote}</p>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="monthlyVideos">{translations.goalsSettings.videosLabel}</Label>
                                <Input
                                    id="monthlyVideos"
                                    name="monthlyVideos"
                                    type="number"
                                    value={targets.monthlyVideos || ''}
                                    onChange={handleChange}
                                    placeholder={translations.goalsSettings.calculatedPlaceholder}
                                    min="0"
                                    step="1"
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <Label htmlFor="monthlyHours">{translations.goalsSettings.hoursLabel}</Label>
                                <Input
                                    id="monthlyHours"
                                    name="monthlyHours"
                                    type="number"
                                    value={targets.monthlyHours || ''}
                                    onChange={handleChange}
                                    placeholder={translations.goalsSettings.calculatedPlaceholder}
                                    min="0"
                                    step="0.1"
                                    className="mt-1"
                                />
                            </div>
                        </div>
                    </div>

                </CardContent>
                <CardFooter>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? translations.saving : translations.goalsSettings.saveButton}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    );
};

export default GoalsSettings;

