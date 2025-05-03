
'use client';

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import toast from 'react-hot-toast';
import Header from '@/components/Header';
import Timer from '@/components/Timer';
import Counter from '@/components/Counter';
import ProgressBars from '@/components/ProgressBars';
import Charts from '@/components/Charts';
import OfficialDataEntry from '@/components/OfficialDataEntry';
import Settings from '@/components/Settings';
import { loadSheetData, saveSheetData } from '@/lib/googleSheets';
import { calculateTargets } from '@/lib/targets';
import { useLanguage } from '@/contexts/LanguageContext'; // Import useLanguage
import { Loader2 } from 'lucide-react';

// Define structure for daily data from sheet
export interface DailyData { // Export the interface
  date: string; // MM/DD
  videosLogged?: number;
  hoursLogged?: number;
  videosOfficial?: number;
  hoursOfficial?: number;
}

interface ProgressValues {
  videos: number;
  hours: number;
}

// Function to request desktop notification permission
const requestNotificationPermission = async (translations: any): Promise<boolean> => {
  if (!('Notification' in window)) {
    return false;
  }
  if (Notification.permission === 'granted') {
    return true;
  }
  if (Notification.permission !== 'denied') {
    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        toast.success(translations.notificationPermissionGranted);
        new Notification(translations.header.title, { body: translations.notificationPermissionGrantedBody });
        return true;
      } else {
        toast.error(translations.notificationPermissionDenied);
        return false;
      }
    } catch (error) {
      console.error("Error requesting notification permission:", error);
      toast.error("Error requesting notification permission.");
      return false;
    }
  } else {
      return false;
  }
};


export default function Home() {
  const { language, translations } = useLanguage(); // Use language context

  // Core State
  const [totalSeconds, setTotalSeconds] = useState(0);
  const [videosLogged, setVideosLogged] = useState(0);
  const [isTimerActive, setIsTimerActive] = useState(false);

  // Sheet Data State
  const [sheetData, setSheetData] = useState<DailyData[]>([]);
  const [todayData, setTodayData] = useState<DailyData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Settings State
  const [isVacationMode, setIsVacationMode] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [browserNotificationPermission, setBrowserNotificationPermission] = useState<NotificationPermission>('default');

  // --- Effects --- 
  useEffect(() => {
    // Load settings
    const savedVacationMode = localStorage.getItem('vacationMode');
    const savedDarkMode = localStorage.getItem('darkMode');
    const savedNotificationsEnabled = localStorage.getItem('notificationsEnabled');

    if (savedVacationMode) setIsVacationMode(JSON.parse(savedVacationMode));
    if (savedDarkMode) {
      const isDark = JSON.parse(savedDarkMode);
      setDarkMode(isDark);
      // Class is managed by LanguageProvider now, but keep state for components
    } else {
      // Default to dark if nothing saved
      setDarkMode(true);
    }
    if (savedNotificationsEnabled) setNotificationsEnabled(JSON.parse(savedNotificationsEnabled));

    // Check notification permission
    if ('Notification' in window) setBrowserNotificationPermission(Notification.permission);

    // Fetch data
    const fetchData = async () => {
      setIsLoading(true);
      const data = await loadSheetData('A1:L32');
      if (data) {
        const processedData: DailyData[] = data.slice(1).map(row => ({
          date: row[0],
          videosLogged: parseInt(row[1]) || 0,
          hoursLogged: parseFloat(row[2]) || 0,
          videosOfficial: parseInt(row[10]) || undefined,
          hoursOfficial: parseFloat(row[11]) || undefined,
        }));
        setSheetData(processedData);

        const today = new Date();
        const formattedToday = `${today.getMonth() + 1}/${today.getDate()}`;
        const foundToday = processedData.find(d => d.date === formattedToday);
        setTodayData(foundToday || { date: formattedToday });

        // Restore session
        const storedSeconds = parseInt(localStorage.getItem('totalSeconds') || '0');
        const storedVideos = parseInt(localStorage.getItem('videosLogged') || '0');
        if (storedSeconds > 0 || storedVideos > 0) {
          setTotalSeconds(storedSeconds);
          setVideosLogged(storedVideos);
          toast(translations.sessionRestored);
        } else if (foundToday) {
          setVideosLogged(foundToday.videosLogged || 0);
        }

      } else {
        toast.error(translations.failedToLoadSheet);
        const storedSeconds = parseInt(localStorage.getItem('totalSeconds') || '0');
        const storedVideos = parseInt(localStorage.getItem('videosLogged') || '0');
        setTotalSeconds(storedSeconds);
        setVideosLogged(storedVideos);
      }
      setIsLoading(false);
    };
    fetchData();

    // Check pending sync
    const checkPendingSync = () => {
      const pending = localStorage.getItem('pendingSync');
      if (pending) {
        toast.loading(translations.pendingSyncAttempt, { id: 'syncing' });
        const { range, values } = JSON.parse(pending);
        saveSheetData(range, values).then(success => {
          if (success) {
            toast.success(translations.pendingSyncSuccess, { id: 'syncing' });
            localStorage.removeItem('pendingSync');
          } else {
            toast.error(translations.pendingSyncError, { id: 'syncing' });
          }
        });
      }
    };
    checkPendingSync();
    const syncInterval = setInterval(checkPendingSync, 5 * 60 * 1000);

    return () => clearInterval(syncInterval);

  }, [translations]); // Add translations dependency

  // Show desktop notification
  const showDesktopNotification = useCallback((title: string, body: string) => {
    if (notificationsEnabled && browserNotificationPermission === 'granted') {
      new Notification(title, { body });
    }
  }, [notificationsEnabled, browserNotificationPermission]);

  // Targets
  const targets = useMemo(() => calculateTargets(isVacationMode), [isVacationMode]);

  // Current Progress Calculation
  const currentProgress = useMemo(() => {
    const today = new Date();
    const currentDayOfWeek = today.getDay();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - currentDayOfWeek);
    startOfWeek.setHours(0, 0, 0, 0);
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    let weeklyVideos = 0, weeklyHours = 0, monthlyVideos = 0, monthlyHours = 0;

    sheetData.forEach(dayData => {
      const [month, day] = (dayData.date || '').split('/').map(Number);
      if (!month || !day) return;
      const entryDate = new Date(today.getFullYear(), month - 1, day);
      if (isNaN(entryDate.getTime()) || entryDate.getFullYear() !== today.getFullYear()) return;
      entryDate.setHours(0, 0, 0, 0);

      const videosToUse = (dayData.videosOfficial !== undefined && !isNaN(dayData.videosOfficial)) ? dayData.videosOfficial : (dayData.videosLogged || 0);
      const hoursToUse = (dayData.hoursOfficial !== undefined && !isNaN(dayData.hoursOfficial)) ? dayData.hoursOfficial : (dayData.hoursLogged || 0);

      if (entryDate >= startOfWeek && entryDate < today) {
        weeklyVideos += videosToUse;
        weeklyHours += hoursToUse;
      }
      if (entryDate >= startOfMonth && entryDate < today) {
        monthlyVideos += videosToUse;
        monthlyHours += hoursToUse;
      }
    });

    const todayHoursTracked = parseFloat((totalSeconds / 3600).toFixed(2));
    const todayVideosTracked = videosLogged;

    const todayOfficialVideos = todayData?.videosOfficial;
    const todayOfficialHours = todayData?.hoursOfficial;

    const todayVideosToAdd = (todayOfficialVideos !== undefined && !isNaN(todayOfficialVideos)) ? todayOfficialVideos : todayVideosTracked;
    const todayHoursToAdd = (todayOfficialHours !== undefined && !isNaN(todayOfficialHours)) ? todayOfficialHours : todayHoursTracked;

    weeklyVideos += todayVideosToAdd;
    weeklyHours += todayHoursToAdd;
    monthlyVideos += todayVideosToAdd;
    monthlyHours += todayHoursToAdd;

    return {
      today: { videos: todayVideosTracked, hours: todayHoursTracked },
      thisWeek: { videos: weeklyVideos, hours: weeklyHours },
      thisMonth: { videos: monthlyVideos, hours: monthlyHours },
    };
  }, [sheetData, videosLogged, totalSeconds, todayData]);


  // --- Callbacks --- 
  const handleTimeUpdate = useCallback((seconds: number, isActive: boolean) => {
    setTotalSeconds(seconds);
    setIsTimerActive(isActive);
    localStorage.setItem('totalSeconds', String(seconds));
    if (isActive && seconds > 0 && seconds % 3600 === 0) {
      const hours = seconds / 3600;
      const hour_plural = hours > 1 ? (language === 'ar' ? 'ساعات' : 'hours') : (language === 'ar' ? 'ساعة' : 'hour');
      const message = translations.hourlyReminder.replace('{hours}', String(hours)).replace('{hour_plural}', hour_plural);
      toast(message, { icon: '⏰', duration: 5000 });
      showDesktopNotification(translations.header.title, message); // Use translated title
    }
  }, [showDesktopNotification, translations, language]);

  const handleTimerStop = useCallback(async (finalSeconds: number) => {
    setIsTimerActive(false);
    const hoursLogged = parseFloat((finalSeconds / 3600).toFixed(2));
    const currentVideosLogged = videosLogged;

    const today = new Date();
    const formattedToday = `${today.getMonth() + 1}/${today.getDate()}`;
    const rowIndex = sheetData.findIndex(d => d.date === formattedToday) + 2;

    if (rowIndex > 1) {
      const valuesToSave = [[currentVideosLogged, hoursLogged]];
      const range = `B${rowIndex}`;
      toast.loading(translations.savingProgress, { id: 'saving' });
      
      const success = await saveSheetData(range, valuesToSave);
      if (success) {
        toast.success(translations.saveSuccess, { id: 'saving' });
        const notificationBody = translations.progressSavedNotificationBody
            .replace('{videos}', String(currentVideosLogged))
            .replace('{hours}', String(hoursLogged));
        showDesktopNotification(translations.progressSavedNotificationTitle, notificationBody);
        const updatedSheetData = prev => prev.map((d, i) => i === rowIndex - 2 ? {...d, videosLogged: currentVideosLogged, hoursLogged} : d);
        setSheetData(updatedSheetData);
        setTodayData(prev => prev ? {...prev, videosLogged: currentVideosLogged, hoursLogged} : null);
        localStorage.removeItem('pendingSync');
      } else {
        toast.error(translations.saveErrorSheet, { id: 'saving' });
        localStorage.setItem('pendingSync', JSON.stringify({ range, values: valuesToSave }));
      }
    } else {
       toast.error(translations.saveErrorRow);
    }
    localStorage.removeItem('totalSeconds');
    localStorage.removeItem('videosLogged');
    setTotalSeconds(0);
    // Don't reset videosLogged here, let it persist until next session or manual reset

  }, [videosLogged, sheetData, showDesktopNotification, translations]);

  const handleVideoAdded = useCallback((newCount: number) => {
    setVideosLogged(newCount);
    localStorage.setItem('videosLogged', String(newCount));
  }, []);

  const handleVacationModeToggle = useCallback((isVacation: boolean) => {
    setIsVacationMode(isVacation);
    localStorage.setItem('vacationMode', JSON.stringify(isVacation));
    const days = isVacation ? 7 : 6;
    toast.success(translations.workScheduleChanged.replace('{days}', String(days)));
  }, [translations]);

  const handleDarkModeToggle = useCallback(() => {
    setDarkMode(prev => {
      const newMode = !prev;
      localStorage.setItem('darkMode', JSON.stringify(newMode));
      document.documentElement.classList.toggle('dark', newMode);
      toast(newMode ? translations.darkModeSwitched : translations.lightModeSwitched);
      return newMode;
    });
  }, [translations]);

  const handleRequestNotificationPermission = useCallback(async () => {
      const granted = await requestNotificationPermission(translations);
      if (granted) {
          setBrowserNotificationPermission('granted');
          if (!notificationsEnabled) {
              setNotificationsEnabled(true);
              localStorage.setItem('notificationsEnabled', JSON.stringify(true));
          }
      } else {
          setBrowserNotificationPermission(Notification.permission);
      }
      return granted;
  }, [notificationsEnabled, translations]);

  const handleToggleNotifications = useCallback(() => {
    setNotificationsEnabled(prev => {
      const newState = !prev;
      localStorage.setItem('notificationsEnabled', JSON.stringify(newState));
      toast(newState ? translations.notificationsEnabled : translations.notificationsDisabled);
      if (newState && browserNotificationPermission === 'denied') {
        toast.error(translations.notificationsBlocked);
      }
      return newState;
    });
  }, [browserNotificationPermission, translations]);

  const handleOfficialDataSaved = useCallback((officialVideos: number, officialHours: number) => {
    const today = new Date();
    const formattedToday = `${today.getMonth() + 1}/${today.getDate()}`;
    const rowIndex = sheetData.findIndex(d => d.date === formattedToday) + 2;

    if (rowIndex > 1) {
      const updatedSheetData = prev => prev.map((d, i) => i === rowIndex - 2 ? {...d, videosOfficial: officialVideos, hoursOfficial: officialHours} : d);
      setSheetData(updatedSheetData);
      setTodayData(prev => prev ? {...prev, videosOfficial: officialVideos, hoursOfficial: officialHours} : null);
    }
  }, [sheetData]);

  // Timer Action Notifications
  const handleTimerStart = useCallback(() => toast.success(translations.timer.timerStarted), [translations]);
  const handleTimerPause = useCallback(() => toast.success(translations.timer.timerPaused), [translations]);
  const handleTimerReset = useCallback(() => {
      toast.success(translations.timer.timerReset);
      // Also reset videos logged on explicit reset
      setVideosLogged(0);
      localStorage.removeItem('videosLogged');
  }, [translations]);

  // --- Render --- 
  if (isLoading) {
    return (
        <div className="flex justify-center items-center min-h-screen bg-background text-foreground">
            <Loader2 className="w-8 h-8 mr-3 animate-spin text-primary" />
            {translations.loading}
        </div>
    );
  }

  const today = new Date();
  const formattedToday = `${today.getMonth() + 1}/${today.getDate()}`;
  const todayRowIndex = sheetData.findIndex(d => d.date === formattedToday) + 2;

  return (
    <div className={`flex flex-col min-h-screen font-sans bg-background text-foreground transition-colors duration-300`}>
      <Header 
        darkMode={darkMode}
        notificationsEnabled={notificationsEnabled}
        browserNotificationPermission={browserNotificationPermission}
        onToggleDarkMode={handleDarkModeToggle} 
        onToggleNotifications={handleToggleNotifications}
        onRequestNotificationPermission={handleRequestNotificationPermission}
      /> 
      <main className="flex-grow p-4 md:p-6 lg:p-8">
        {/* <h2 className="text-3xl font-semibold mb-6 tracking-tight">{translations.dashboard}</h2> */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {/* Column 1: Timer & Counter */}
          <div className="flex flex-col gap-6">
            <Timer 
               onTimeUpdate={handleTimeUpdate} 
               onTimerStop={handleTimerStop} 
               initialSeconds={totalSecon
(Content truncated due to size limit. Use line ranges to read in chunks)