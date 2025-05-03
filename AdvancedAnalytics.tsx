
'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Clock, Zap } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { DailyData } from '@/app/page'; // Assuming DailyData type is exported from page.tsx
import { format } from 'date-fns';

interface AdvancedAnalyticsProps {
  data: DailyData[];
}

const AdvancedAnalytics: React.FC<AdvancedAnalyticsProps> = ({ data }) => {
  const { translations } = useLanguage();

  const calculateAnalytics = () => {
    let totalMinutesLogged = 0;
    let totalVideosLogged = 0;
    let daysWithData = 0;
    let peakVideos = { value: 0, date: '' };
    let peakHours = { value: 0, date: '' };
    let peakSpeed = { value: 0, date: '' };

    data.forEach(day => {
      const videos = day.videosLogged ?? 0;
      const hours = day.hoursLogged ?? 0;

      if (videos > 0 && hours > 0) {
        totalMinutesLogged += hours * 60;
        totalVideosLogged += videos;
        daysWithData++;

        const speed = videos / hours; // Videos per hour

        if (videos > peakVideos.value) {
          peakVideos = { value: videos, date: day.date };
        }
        if (hours > peakHours.value) {
          peakHours = { value: hours, date: day.date };
        }
        if (speed > peakSpeed.value) {
          peakSpeed = { value: speed, date: day.date };
        }
      }
    });

    const avgMinutesPerVideo = daysWithData > 0 && totalVideosLogged > 0
      ? (totalMinutesLogged / totalVideosLogged)
      : 0;

    return {
      avgMinutesPerVideo: parseFloat(avgMinutesPerVideo.toFixed(1)),
      peakVideos,
      peakHours,
      peakSpeed: {
          value: parseFloat(peakSpeed.value.toFixed(1)), // Format speed
          date: peakSpeed.date
      }
    };
  };

  const analytics = calculateAnalytics();

  const formatDate = (dateString: string) => {
      if (!dateString) return '--';
      try {
          // Assuming dateString is 'YYYY-MM-DD' or similar parseable format
          return format(new Date(dateString + 'T00:00:00'), 'PPP'); // Add time to avoid timezone issues
      } catch {
          return dateString; // Fallback to original string if format fails
      }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <TrendingUp className="w-5 h-5 mr-2 rtl:ml-2 text-primary" />
          {translations.advancedAnalytics.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Average Time per Video */}
        <div className="p-4 border rounded-lg bg-card/50">
          <h3 className="text-sm font-medium text-muted-foreground flex items-center">
            <Clock className="w-4 h-4 mr-1" />
            {translations.advancedAnalytics.avgTimePerVideo}
          </h3>
          <p className="text-2xl font-semibold">
            {analytics.avgMinutesPerVideo > 0 ? `${analytics.avgMinutesPerVideo} ${translations.advancedAnalytics.minutes}` : '--'}
          </p>
        </div>

        {/* Peak Videos Day */}
        <div className="p-4 border rounded-lg bg-card/50">
          <h3 className="text-sm font-medium text-muted-foreground">{translations.advancedAnalytics.peakVideosDay}</h3>
          <p className="text-2xl font-semibold">
            {analytics.peakVideos.value > 0 ? analytics.peakVideos.value : '--'}
          </p>
          <p className="text-xs text-muted-foreground">
            {analytics.peakVideos.date ? formatDate(analytics.peakVideos.date) : ''}
          </p>
        </div>

        {/* Peak Hours Day */}
        <div className="p-4 border rounded-lg bg-card/50">
          <h3 className="text-sm font-medium text-muted-foreground">{translations.advancedAnalytics.peakHoursDay}</h3>
          <p className="text-2xl font-semibold">
            {analytics.peakHours.value > 0 ? analytics.peakHours.value.toFixed(1) : '--'}
          </p>
          <p className="text-xs text-muted-foreground">
            {analytics.peakHours.date ? formatDate(analytics.peakHours.date) : ''}
          </p>
        </div>

        {/* Peak Speed Day */}
        <div className="p-4 border rounded-lg bg-card/50">
          <h3 className="text-sm font-medium text-muted-foreground flex items-center">
             <Zap className="w-4 h-4 mr-1" />
            {translations.advancedAnalytics.peakSpeedDay}
          </h3>
          <p className="text-2xl font-semibold">
            {analytics.peakSpeed.value > 0 ? `${analytics.peakSpeed.value} ${translations.advancedAnalytics.videosPerHour}` : '--'}
          </p>
          <p className="text-xs text-muted-foreground">
            {analytics.peakSpeed.date ? formatDate(analytics.peakSpeed.date) : ''}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdvancedAnalytics;

