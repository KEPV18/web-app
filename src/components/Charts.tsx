
'use client';

import React, { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"; // Use Card for consistency
import { TrendingUp } from 'lucide-react'; // Use a relevant icon

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface DailyData {
  date: string; // MM/DD
  videosLogged?: number;
  hoursLogged?: number;
  videosOfficial?: number;
  hoursOfficial?: number;
}

interface ChartsProps {
  sheetData: DailyData[];
}

// Helper to get day name based on language
const getDayName = (date: Date, lang: 'en' | 'ar'): string => {
  return date.toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US', { weekday: 'short' });
};

const Charts: React.FC<ChartsProps> = ({ sheetData }) => {
  const { language, translations } = useLanguage();
  const [chartKey, setChartKey] = useState(0);
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Update chart colors and key on dark mode toggle
  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          const newIsDarkMode = document.documentElement.classList.contains('dark');
          if (newIsDarkMode !== isDarkMode) {
             setIsDarkMode(newIsDarkMode);
             setChartKey(prevKey => prevKey + 1); // Re-render charts with new colors
          }
        }
      });
    });
    // Check initial dark mode state
    setIsDarkMode(document.documentElement.classList.contains('dark'));
    observer.observe(document.documentElement, { attributes: true });
    return () => observer.disconnect();
  }, [isDarkMode]); // Dependency ensures effect runs when isDarkMode state changes internally

  // Update chart key on language change to redraw labels
  useEffect(() => {
    setChartKey(prevKey => prevKey + 1);
  }, [language]);

  // Process data for the current week (Sun-Sat)
  const processWeeklyData = () => {
    const labels: string[] = [];
    const videosLoggedData: (number | null)[] = [];
    const videosOfficialData: (number | null)[] = [];
    const hoursLoggedData: (number | null)[] = [];
    const hoursOfficialData: (number | null)[] = [];
    const speedLoggedData: (number | null)[] = [];
    const speedOfficialData: (number | null)[] = [];

    const today = new Date();
    const currentYear = today.getFullYear();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay()); // Sunday as start
    startOfWeek.setHours(0, 0, 0, 0);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6); // Saturday as end
    endOfWeek.setHours(23, 59, 59, 999);

    // Create a map for the 7 days of the week, initialized with null/undefined data
    const weeklyMap = new Map<string, DailyData>();
    for (let i = 0; i < 7; i++) {
        const day = new Date(startOfWeek);
        day.setDate(startOfWeek.getDate() + i);
        const dayKey = `${day.getMonth() + 1}/${day.getDate()}`;
        weeklyMap.set(dayKey, { date: dayKey }); // Initialize with date only
    }

    // Populate the map with actual data from sheetData
    sheetData.forEach(d => {
        const [month, day] = (d.date || '').split('/').map(Number);
        if (!month || !day) return; // Skip if date is invalid
        const entryDate = new Date(currentYear, month - 1, day);
        entryDate.setHours(0,0,0,0);
        // Check if the date falls within the current week
        if (entryDate >= startOfWeek && entryDate <= endOfWeek) {
            const dayKey = `${month}/${day}`;
            // Merge existing data (just date) with new data from sheet
            weeklyMap.set(dayKey, { ...weeklyMap.get(dayKey), ...d });
        }
    });

    // Iterate through the 7 days of the week to build chart data arrays
    for (let i = 0; i < 7; i++) {
        const day = new Date(startOfWeek);
        day.setDate(startOfWeek.getDate() + i);
        const dayKey = `${day.getMonth() + 1}/${day.getDate()}`;
        const dayName = getDayName(day, language); // Get localized day name
        const data = weeklyMap.get(dayKey);

        labels.push(dayName);

        // Get data points, using null if undefined
        const loggedVideos = data?.videosLogged;
        const loggedHours = data?.hoursLogged;
        const officialVideos = data?.videosOfficial;
        const officialHours = data?.hoursOfficial;

        // Push data (or null) to respective arrays
        videosLoggedData.push(loggedVideos !== undefined ? loggedVideos : null);
        videosOfficialData.push(officialVideos !== undefined ? officialVideos : null);
        hoursLoggedData.push(loggedHours !== undefined ? loggedHours : null);
        hoursOfficialData.push(officialHours !== undefined ? officialHours : null);

        // Calculate speed (videos per minute)
        const loggedMinutes = loggedHours ? loggedHours * 60 : 0;
        const loggedSpeed = (loggedMinutes > 0 && loggedVideos !== undefined) ? parseFloat((loggedVideos / loggedMinutes).toFixed(2)) : null;
        speedLoggedData.push(loggedSpeed);

        const officialMinutes = officialHours ? officialHours * 60 : 0;
        const officialSpeed = (officialMinutes > 0 && officialVideos !== undefined) ? parseFloat((officialVideos / officialMinutes).toFixed(2)) : null;
        speedOfficialData.push(officialSpeed);
    }

    return { labels, videosLoggedData, videosOfficialData, hoursLoggedData, hoursOfficialData, speedLoggedData, speedOfficialData };
  };

  const { labels, videosLoggedData, videosOfficialData, hoursLoggedData, hoursOfficialData, speedLoggedData, speedOfficialData } = processWeeklyData();

  // Define colors (inspired by Google Sheets theme)
  const getChartColors = () => {
      const isDark = document.documentElement.classList.contains('dark');
      return {
          textColor: isDark ? 'hsl(var(--muted-foreground))' : 'hsl(var(--foreground))',
          gridColor: isDark ? 'hsl(var(--border) / 0.5)' : 'hsl(var(--border))',
          legendColor: isDark ? 'hsl(var(--foreground))' : 'hsl(var(--foreground))',
          titleColor: isDark ? 'hsl(var(--foreground))' : 'hsl(var(--foreground))',
          // Using Google Sheets like colors (adjust as needed)
          loggedColor: 'hsl(210, 80%, 60%)', // Blue
          officialColor: 'hsl(140, 60%, 50%)', // Green
          loggedBgColor: 'hsla(210, 80%, 60%, 0.1)',
          officialBgColor: 'hsla(140, 60%, 50%, 0.1)',
      };
  };

  const colors = getChartColors();

  // Common chart options
  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false, // Allow chart to fill container height
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
           color: colors.legendColor,
           boxWidth: 12, // Smaller legend boxes
           padding: 15,
        }
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        backgroundColor: isDarkMode ? 'hsl(var(--popover))' : 'hsl(var(--popover))', // Use popover background
        titleColor: colors.titleColor,
        bodyColor: colors.textColor,
        borderColor: colors.gridColor,
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        grid: {
          color: colors.gridColor,
          drawOnChartArea: false, // Hide vertical grid lines
        },
        ticks: {
            color: colors.textColor,
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: colors.gridColor,
        },
         ticks: {
            color: colors.textColor,
            padding: 10,
        }
      },
    },
    elements: {
        line: {
            tension: 0.3 // Slightly less curve
        },
        point: {
            radius: 3,
            hoverRadius: 5,
        }
    }
  };

  // Data for Video Chart
  const videoChartData = {
    labels,
    datasets: [
      {
        label: translations.charts.videosLoggedLabel, // From B
        data: videosLoggedData,
        borderColor: colors.loggedColor,
        backgroundColor: colors.loggedBgColor,
        fill: 'origin',
        pointBackgroundColor: colors.loggedColor,
        pointBorderColor: isDarkMode ? 'hsl(var(--card))' : 'hsl(var(--card))',
        pointHoverBackgroundColor: isDarkMode ? 'hsl(var(--card))' : 'hsl(var(--card))',
        pointHoverBorderColor: colors.loggedColor,
      },
      {
        label: translations.charts.videosOfficialLabel, // From K
        data: videosOfficialData,
        borderColor: colors.officialColor,
        backgroundColor: colors.officialBgColor,
        fill: 'origin',
        pointBackgroundColor: colors.officialColor,
        pointBorderColor: isDarkMode ? 'hsl(var(--card))' : 'hsl(var(--card))',
        pointHoverBackgroundColor: isDarkMode ? 'hsl(var(--card))' : 'hsl(var(--card))',
        pointHoverBorderColor: colors.officialColor,
      },
    ],
  };

  // Data for Hours Chart (NEW)
  const hoursChartData = {
    labels,
    datasets: [
      {
        label: translations.charts.hoursLoggedLabel, // From C (Need translation)
        data: hoursLoggedData,
        borderColor: colors.loggedColor,
        backgroundColor: colors.loggedBgColor,
        fill: 'origin',
        pointBackgroundColor: colors.loggedColor,
        pointBorderColor: isDarkMode ? 'hsl(var(--card))' : 'hsl(var(--card))',
        pointHoverBackgroundColor: isDarkMode ? 'hsl(var(--card))' : 'hsl(var(--card))',
        pointHoverBorderColor: colors.loggedColor,
      },
      {
        label: translations.charts.hoursOfficialLabel, // From L (Need translation)
        data: hoursOfficialData,
        borderColor: colors.officialColor,
        backgroundColor: colors.officialBgColor,
        fill: 'origin',
        pointBackgroundColor: colors.officialColor,
        pointBorderColor: isDarkMode ? 'hsl(var(--card))' : 'hsl(var(--card))',
        pointHoverBackgroundColor: isDarkMode ? 'hsl(var(--card))' : 'hsl(var(--card))',
        pointHoverBorderColor: colors.officialColor,
      },
    ],
  };

  // Data for Speed Chart
  const speedChartData = {
    labels,
    datasets: [
      {
        label: translations.charts.speedLoggedLabel, // Derived from B & C
        data: speedLoggedData,
        borderColor: colors.loggedColor,
        backgroundColor: colors.loggedBgColor,
        fill: 'origin',
        pointBackgroundColor: colors.loggedColor,
        pointBorderColor: isDarkMode ? 'hsl(var(--card))' : 'hsl(var(--card))',
        pointHoverBackgroundColor: isDarkMode ? 'hsl(var(--card))' : 'hsl(var(--card))',
        pointHoverBorderColor: colors.loggedColor,
      },
       {
        label: translations.charts.speedOfficialLabel, // Derived from K & L
        data: speedOfficialData,
        borderColor: colors.officialColor,
        backgroundColor: colors.officialBgColor,
        fill: 'origin',
        pointBackgroundColor: colors.officialColor,
        pointBorderColor: isDarkMode ? 'hsl(var(--card))' : 'hsl(var(--card))',
        pointHoverBackgroundColor: isDarkMode ? 'hsl(var(--card))' : 'hsl(var(--card))',
        pointHoverBorderColor: colors.officialColor,
      },
    ],
  };

  return (
    // Use Card component for consistency with the rest of the UI
    <Card className="w-full mt-6"> {/* Added mt-6 for spacing when moved down */} 
      <CardHeader>
        <CardTitle className="flex items-center text-lg">
          <TrendingUp className="w-5 h-5 mr-2 rtl:ml-2 text-primary" />
          {translations.charts.title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Grid for charts - adjust columns as needed */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Video Chart */}
          <div className="relative h-[350px]"> {/* Increased height */} 
              <Line
                key={`video-${chartKey}`}
                options={{
                  ...commonOptions,
                  plugins: {
                    ...commonOptions.plugins,
                    title: { display: true, text: translations.charts.videoChartTitle, color: colors.titleColor }
                  }
                }}
                data={videoChartData}
              />
          </div>
          {/* Hours Chart (NEW) */}
          <div className="relative h-[350px]"> {/* Increased height */} 
              <Line
                key={`hours-${chartKey}`}
                options={{
                  ...commonOptions,
                  plugins: {
                    ...commonOptions.plugins,
                    title: { display: true, text: translations.charts.hoursChartTitle, color: colors.titleColor } // Need translation
                  },
                  scales: {
                    ...commonOptions.scales,
                    y: {
                      ...commonOptions.scales.y,
                      title: {
                        display: true,
                        text: translations.charts.yAxisHoursLabel, // Need translation
                        color: colors.textColor
                      }
                    }
                  }
                }}
                data={hoursChartData}
              />
          </div>
          {/* Speed Chart */}
          <div className="relative h-[350px]"> {/* Increased height */} 
              <Line
                key={`speed-${chartKey}`}
                options={{
                  ...commonOptions,
                  plugins: {
                    ...commonOptions.plugins,
                    title: { display: true, text: translations.charts.speedChartTitle, color: colors.titleColor }
                  },
                  scales: {
                    ...commonOptions.scales,
                    y: {
                      ...commonOptions.scales.y,
                      title: {
                        display: true,
                        text: translations.charts.yAxisSpeedLabel,
                        color: colors.textColor
                      }
                    }
                  }
                }}
                data={speedChartData}
              />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default Charts;

