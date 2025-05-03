
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
import { useLanguage } from '@/contexts/LanguageContext'; // Import useLanguage

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
  const { language, translations } = useLanguage(); // Use language context
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
             setChartKey(prevKey => prevKey + 1);
          }
        }
      });
    });
    observer.observe(document.documentElement, { attributes: true });
    setIsDarkMode(document.documentElement.classList.contains('dark'));
    return () => observer.disconnect();
  }, [isDarkMode]);

  // Update chart key on language change
  useEffect(() => {
    setChartKey(prevKey => prevKey + 1);
  }, [language]);

  // Process data for the current week (Sun-Sat)
  const processWeeklyData = () => {
    const labels: string[] = [];
    const videosLoggedData: (number | null)[] = [];
    const videosOfficialData: (number | null)[] = [];
    const speedLoggedData: (number | null)[] = [];
    const speedOfficialData: (number | null)[] = [];

    const today = new Date();
    const currentYear = today.getFullYear();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    const weeklyMap = new Map<string, DailyData>();
    for (let i = 0; i < 7; i++) {
        const day = new Date(startOfWeek);
        day.setDate(startOfWeek.getDate() + i);
        const dayKey = `${day.getMonth() + 1}/${day.getDate()}`;
        weeklyMap.set(dayKey, { date: dayKey });
    }

    sheetData.forEach(d => {
        const [month, day] = (d.date || '').split('/').map(Number);
        if (!month || !day) return;
        const entryDate = new Date(currentYear, month - 1, day);
        entryDate.setHours(0,0,0,0);
        if (entryDate >= startOfWeek && entryDate <= endOfWeek) {
            const dayKey = `${month}/${day}`;
            weeklyMap.set(dayKey, d);
        }
    });

    for (let i = 0; i < 7; i++) {
        const day = new Date(startOfWeek);
        day.setDate(startOfWeek.getDate() + i);
        const dayKey = `${day.getMonth() + 1}/${day.getDate()}`;
        const dayName = getDayName(day, language); // Use language for day name
        const data = weeklyMap.get(dayKey);

        labels.push(dayName);
        
        const loggedVideos = data?.videosLogged;
        const loggedHours = data?.hoursLogged;
        const officialVideos = data?.videosOfficial;
        const officialHours = data?.hoursOfficial;

        videosLoggedData.push(loggedVideos !== undefined ? loggedVideos : null);
        videosOfficialData.push(officialVideos !== undefined ? officialVideos : null);

        const loggedMinutes = loggedHours ? loggedHours * 60 : 0;
        const loggedSpeed = (loggedMinutes > 0 && loggedVideos !== undefined) ? parseFloat((loggedVideos / loggedMinutes).toFixed(2)) : null;
        speedLoggedData.push(loggedSpeed);

        const officialMinutes = officialHours ? officialHours * 60 : 0;
        const officialSpeed = (officialMinutes > 0 && officialVideos !== undefined) ? parseFloat((officialVideos / officialMinutes).toFixed(2)) : null;
        speedOfficialData.push(officialSpeed);
    }

    return { labels, videosLoggedData, videosOfficialData, speedLoggedData, speedOfficialData };
  };

  const { labels, videosLoggedData, videosOfficialData, speedLoggedData, speedOfficialData } = processWeeklyData();

  const getChartColors = () => {
      const isDark = document.documentElement.classList.contains('dark');
      return {
          textColor: isDark ? '#ccc' : '#666',
          gridColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
          legendColor: isDark ? '#fff' : '#333',
          titleColor: isDark ? '#fff' : '#333',
          loggedColor: 'rgb(74, 107, 255)',
          officialColor: 'rgb(40, 167, 69)',
          loggedBgColor: 'rgba(74, 107, 255, 0.2)',
          officialBgColor: 'rgba(40, 167, 69, 0.2)',
      };
  };

  const colors = getChartColors();

  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
           color: colors.legendColor,
        }
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
      },
    },
    scales: {
      x: {
        grid: {
          color: colors.gridColor,
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
        }
      },
    },
    elements: {
        line: {
            tension: 0.4
        }
    }
  };

  const videoChartData = {
    labels,
    datasets: [
      {
        label: translations.charts.videosLoggedLabel,
        data: videosLoggedData,
        borderColor: colors.loggedColor,
        backgroundColor: colors.loggedBgColor,
        fill: true,
        pointBackgroundColor: colors.loggedColor,
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: colors.loggedColor,
      },
      {
        label: translations.charts.videosOfficialLabel,
        data: videosOfficialData,
        borderColor: colors.officialColor,
        backgroundColor: colors.officialBgColor,
        fill: true,
        pointBackgroundColor: colors.officialColor,
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: colors.officialColor,
      },
    ],
  };

  const speedChartData = {
    labels,
    datasets: [
      {
        label: translations.charts.speedLoggedLabel,
        data: speedLoggedData,
        borderColor: colors.loggedColor,
        backgroundColor: colors.loggedBgColor,
        fill: true,
        pointBackgroundColor: colors.loggedColor,
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: colors.loggedColor,
      },
       {
        label: translations.charts.speedOfficialLabel,
        data: speedOfficialData,
        borderColor: colors.officialColor,
        backgroundColor: colors.officialBgColor,
        fill: true,
        pointBackgroundColor: colors.officialColor,
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: colors.officialColor,
      },
    ],
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md md:col-span-2">
      <h3 className="text-lg font-medium mb-4 flex items-center">
        <i className="fas fa-chart-area mr-2 rtl:ml-2 text-primary"></i>{translations.charts.title}
      </h3>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[300px]">
        <div className="relative">
            <Line 
              key={`video-${chartKey}`} 
              options={{
                ...commonOptions, 
                plugins: {
                  ...commonOptions.plugins, 
                  title: { 
                    display: true, 
                    text: translations.charts.videoChartTitle, 
                    color: colors.titleColor 
                  }
                }
              }} 
              data={videoChartData} 
            />
        </div>
         <div className="relative">
            <Line 
              key={`speed-${chartKey}`} 
              options={{
                ...commonOptions, 
                plugins: {
                  ...commonOptions.plugins, 
                  title: { 
                    display: true, 
                    text: translations.charts.speedChartTitle, 
                    color: colors.titleColor 
                  }
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
    </div>
  );
};

export default Charts;

