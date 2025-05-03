
'use client';

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart, Activity, Zap } from 'lucide-react'; // Icons for analytics
import { useLanguage } from '@/contexts/LanguageContext';
import type { DailyData } from '@/app/page'; // Import the shared interface

interface AdvancedAnalyticsProps {
    sheetData: DailyData[];
    // Add custom targets if needed for streak calculation
}

const AdvancedAnalytics: React.FC<AdvancedAnalyticsProps> = ({ sheetData }) => {
    const { translations } = useLanguage();

    const analytics = useMemo(() => {
        let totalVideos = 0;
        let totalHours = 0;
        let productiveDays = 0;
        const videosByDayOfWeek: number[] = Array(7).fill(0);
        const hoursByDayOfWeek: number[] = Array(7).fill(0);
        const videosByMonth: { [key: string]: number } = {};
        const hoursByMonth: { [key: string]: number } = {};

        const today = new Date();
        const currentYear = today.getFullYear();

        sheetData.forEach(dayData => {
            const [month, day] = (dayData.date || '').split('/').map(Number);
            if (!month || !day) return;
            const entryDate = new Date(currentYear, month - 1, day);
            if (isNaN(entryDate.getTime()) || entryDate.getFullYear() !== currentYear) return;

            const videos = (dayData.videosOfficial !== undefined && !isNaN(dayData.videosOfficial)) ? dayData.videosOfficial : (dayData.videosLogged || 0);
            const hours = (dayData.hoursOfficial !== undefined && !isNaN(dayData.hoursOfficial)) ? dayData.hoursOfficial : (dayData.hoursLogged || 0);

            if (videos > 0 || hours > 0) {
                productiveDays++;
                totalVideos += videos;
                totalHours += hours;

                const dayOfWeek = entryDate.getDay(); // 0 = Sunday, 6 = Saturday
                videosByDayOfWeek[dayOfWeek] += videos;
                hoursByDayOfWeek[dayOfWeek] += hours;

                const monthKey = `${currentYear}-${String(month).padStart(2, '0')}`;
                videosByMonth[monthKey] = (videosByMonth[monthKey] || 0) + videos;
                hoursByMonth[monthKey] = (hoursByMonth[monthKey] || 0) + hours;
            }
        });

        const overallAvgSpeed = totalHours > 0 ? parseFloat((totalVideos / (totalHours * 60)).toFixed(2)) : 0; // Videos per minute

        const peakDayIndex = videosByDayOfWeek.indexOf(Math.max(...videosByDayOfWeek));
        const peakDay = peakDayIndex !== -1 ? new Date(currentYear, 0, peakDayIndex + 1).toLocaleDateString(translations.locale, { weekday: 'long' }) : translations.na;

        // Simple streak calculation (consecutive days with > 0 videos)
        let currentStreak = 0;
        let longestStreak = 0;
        const sortedDates = sheetData
            .map(d => {
                const [month, day] = (d.date || '').split('/').map(Number);
                if (!month || !day) return null;
                const date = new Date(currentYear, month - 1, day);
                if (isNaN(date.getTime()) || date.getFullYear() !== currentYear) return null;
                const videos = (d.videosOfficial !== undefined && !isNaN(d.videosOfficial)) ? d.videosOfficial : (d.videosLogged || 0);
                return { date, videos };
            })
            .filter(d => d !== null)
            .sort((a, b) => a!.date.getTime() - b!.date.getTime()) as { date: Date; videos: number }[];

        for (let i = 0; i < sortedDates.length; i++) {
            if (sortedDates[i].videos > 0) {
                if (i > 0 && sortedDates[i].date.getTime() - sortedDates[i - 1].date.getTime() === 86400000) { // Check if consecutive days
                    currentStreak++;
                } else {
                    currentStreak = 1; // Start new streak
                }
            } else {
                currentStreak = 0; // Reset streak
            }
            longestStreak = Math.max(longestStreak, currentStreak);
        }

        return {
            overallAvgSpeed,
            peakDay,
            longestStreak,
            totalProductiveDays: productiveDays,
        };
    }, [sheetData, translations.locale, translations.na]);

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center">
                    <BarChart className="w-5 h-5 mr-2 rtl:ml-2" />
                    {translations.advancedAnalytics.title}
                </CardTitle>
                <CardDescription>{translations.advancedAnalytics.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-md">
                    <div className="flex items-center">
                        <Activity className="w-4 h-4 mr-2 rtl:ml-2 text-primary" />
                        <span className="text-sm font-medium">{translations.advancedAnalytics.avgSpeedLabel}</span>
                    </div>
                    <span className="text-sm font-mono font-semibold">
                        {analytics.overallAvgSpeed} {translations.advancedAnalytics.videosPerMinute}
                    </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-md">
                    <div className="flex items-center">
                        <Zap className="w-4 h-4 mr-2 rtl:ml-2 text-yellow-500" />
                        <span className="text-sm font-medium">{translations.advancedAnalytics.peakDayLabel}</span>
                    </div>
                    <span className="text-sm font-semibold">
                        {analytics.peakDay}
                    </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-md">
                    <div className="flex items-center">
                        <TrendingUp className="w-4 h-4 mr-2 rtl:ml-2 text-green-500" />
                        <span className="text-sm font-medium">{translations.advancedAnalytics.longestStreakLabel}</span>
                    </div>
                    <span className="text-sm font-mono font-semibold">
                        {analytics.longestStreak} {analytics.longestStreak === 1 ? translations.advancedAnalytics.daySingular : translations.advancedAnalytics.dayPlural}
                    </span>
                </div>
                 <div className="flex items-center justify-between p-3 bg-muted/50 rounded-md">
                    <div className="flex items-center">
                        <BarChart className="w-4 h-4 mr-2 rtl:ml-2 text-muted-foreground" />
                        <span className="text-sm font-medium">{translations.advancedAnalytics.totalProductiveDaysLabel}</span>
                    </div>
                    <span className="text-sm font-mono font-semibold">
                        {analytics.totalProductiveDays} {analytics.totalProductiveDays === 1 ? translations.advancedAnalytics.daySingular : translations.advancedAnalytics.dayPlural}
                    </span>
                </div>
            </CardContent>
        </Card>
    );
};

export default AdvancedAnalytics;

