
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
import ManualTimeEntry from '@/components/ManualTimeEntry'; // Import ManualTimeEntry
import AdvancedAnalytics from '@/components/AdvancedAnalytics'; // Import AdvancedAnalytics
import { loadSheetData, saveSheetData } from '@/lib/googleSheets';
import { calculateTargets, defaultTargets } from '@/lib/targets'; // Import defaultTargets
import { useLanguage } from '@/contexts/LanguageContext';
import { Loader2 } from 'lucide-react';
import type { CustomTargets } from '@/components/GoalsSettings'; // Import CustomTargets type

// Define structure for daily data from sheet
export interface DailyData {
  date: string; // MM/DD
  videosLogged?: number;
  hoursLogged?: number;
  videosOfficial?: number;
  hoursOfficial?: number;
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
  const { language, translations } = useLanguage();

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
  const [darkMode, setDarkMode] = useState(true); // Default to true
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [browserNotificationPermission, setBrowserNotificationPermission] = useState<NotificationPermission>('default');
  const [customTargets, setCustomTargets] = useState<CustomTargets>(defaultTargets); // Add state for custom targets
  const [soundEnabled, setSoundEnabled] = useState(false); // Add state for sound

  // --- Effects --- 
  useEffect(() => {
    // Load settings
    const savedVacationMode = localStorage.getItem('vacationMode');
    const savedDarkMode = localStorage.getItem('darkMode');
    const savedNotificationsEnabled = localStorage.getItem('notificationsEnabled');
    const savedCustomTargets = localStorage.getItem('customTargets');
    const savedSoundEnabled = localStorage.getItem('soundEnabled');

    if (savedVacationMode) setIsVacationMode(JSON.parse(savedVacationMode));
    // Set dark mode based on saved preference or system preference
    const initialDarkMode = savedDarkMode ? JSON.parse(savedDarkMode) : window.matchMedia('(prefers-color-scheme: dark)').matches;
    setDarkMode(initialDarkMode);
    document.documentElement.classList.toggle('dark', initialDarkMode);

    if (savedNotificationsEnabled) setNotificationsEnabled(JSON.parse(savedNotificationsEnabled));
    if (savedCustomTargets) setCustomTargets(JSON.parse(savedCustomTargets));
    if (savedSoundEnabled) setSoundEnabled(JSON.parse(savedSoundEnabled));

    // Check notification permission
    if ('Notification' in window) setBrowserNotificationPermission(Notification.permission);

    // Fetch data
    const fetchData = async () => {
      setIsLoading(true);
      const data = await loadSheetData('A1:L32'); // Fetch up to row 32
      if (data) {
        const processedData: DailyData[] = data.slice(1).map(row => ({
          date: row[0],
          videosLogged: parseInt(row[1]) || undefined, // Use undefined if 0 or invalid
          hoursLogged: parseFloat(row[2]) || undefined,
          videosOfficial: parseInt(row[10]) || undefined,
          hoursOfficial: parseFloat(row[11]) || undefined,
        }));
        setSheetData(processedData);

        const today = new Date();
        const formattedToday = `${today.getMonth() + 1}/${today.getDate()}`;
        const foundToday = processedData.find(d => d.date === formattedToday);
        setTodayData(foundToday || { date: formattedToday });

        // Restore session (only if not found in sheet for today)
        const storedSeconds = parseInt(localStorage.getItem('totalSeconds') || '0');
        const storedVideos = parseInt(localStorage.getItem('videosLogged') || '0');
        if (!foundToday?.videosLogged && !foundToday?.hoursLogged && (storedSeconds > 0 || storedVideos > 0)) {
          setTotalSeconds(storedSeconds);
          setVideosLogged(storedVideos);
          toast(translations.sessionRestored);
        } else if (foundToday?.videosLogged) {
            // If data exists for today, don't restore session, use sheet data
            // setVideosLogged(foundToday.videosLogged || 0); // Counter will use initialVideosLogged
        }

      } else {
        toast.error(translations.failedToLoadSheet);
        // Restore session even if sheet fails to load
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
            // Optionally re-fetch data after successful sync
            fetchData();
          } else {
            toast.error(translations.pendingSyncError, { id: 'syncing' });
          }
        });
      }
    };
    checkPendingSync(); // Check immediately on load
    const syncInterval = setInterval(checkPendingSync, 5 * 60 * 1000); // Check every 5 mins

    return () => clearInterval(syncInterval);

  }, [translations]); // Add translations dependency

  // Audio Context for sound effects
  const audioContext = useMemo(() => typeof window !== 'undefined' ? new (window.AudioContext || (window as any).webkitAudioContext)() : null, []);

  // Function to play a simple beep sound
  const playSound = useCallback((type: 'start' | 'pause' | 'reset' | 'add' | 'auto') => {
    if (!soundEnabled || !audioContext) return;

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.01); // Quick fade in

    let freq = 440; // A4
    switch (type) {
        case 'start': freq = 523.25; break; // C5
        case 'pause': freq = 392.00; break; // G4
        case 'reset': freq = 261.63; break; // C4
        case 'add': freq = 659.25; break; // E5
        case 'auto': freq = 783.99; break; // G5
    }
    oscillator.frequency.setValueAtTime(freq, audioContext.currentTime);

    oscillator.start(audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.00001, audioContext.currentTime + 0.1); // Quick fade out
    oscillator.stop(audioContext.currentTime + 0.1);
  }, [soundEnabled, audioContext]);

  // Show desktop notification
  const showDesktopNotification = useCallback((title: string, body: string) => {
    if (notificationsEnabled && browserNotificationPermission === 'granted') {
      new Notification(title, { body });
    }
  }, [notificationsEnabled, browserNotificationPermission]);

  // Use custom targets if set, otherwise calculate default based on vacation mode
  const activeTargets = useMemo(() => {
      // Check if custom targets are meaningfully set (e.g., daily videos > 0)
      if (customTargets.dailyVideos > 0 || customTargets.dailyHours > 0) {
          return customTargets;
      } else {
          // Fallback to calculated default targets
          return calculateTargets(isVacationMode);
      }
  }, [customTargets, isVacationMode]);

  // Current Progress Calculation (using activeTargets)
  const currentProgress = useMemo(() => {
    const today = new Date();
    const currentDayOfWeek = today.getDay(); // 0 = Sunday
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

      // Prioritize official data (K, L), fallback to logged (B, C)
      const videosToUse = (dayData.videosOfficial !== undefined && !isNaN(dayData.videosOfficial)) ? dayData.videosOfficial : (dayData.videosLogged || 0);
      const hoursToUse = (dayData.hoursOfficial !== undefined && !isNaN(dayData.hoursOfficial)) ? dayData.hoursOfficial : (dayData.hoursLogged || 0);

      // Aggregate past days of the week
      if (entryDate >= startOfWeek && entryDate < today) {
        weeklyVideos += videosToUse;
        weeklyHours += hoursToUse;
      }
      // Aggregate past days of the month
      if (entryDate >= startOfMonth && entryDate < today) {
        monthlyVideos += videosToUse;
        monthlyHours += hoursToUse;
      }
    });

    // Today's tracked progress (from timer/counter)
    const todayHoursTracked = parseFloat((totalSeconds / 3600).toFixed(2));
    const todayVideosTracked = videosLogged;

    // Today's official data (if entered)
    const todayOfficialVideos = todayData?.videosOfficial;
    const todayOfficialHours = todayData?.hoursOfficial;

    // Use official data for today if available, otherwise use tracked data
    const todayVideosToAdd = (todayOfficialVideos !== undefined && !isNaN(todayOfficialVideos)) ? todayOfficialVideos : todayVideosTracked;
    const todayHoursToAdd = (todayOfficialHours !== undefined && !isNaN(todayOfficialHours)) ? todayOfficialHours : todayHoursTracked;

    // Add today's contribution to weekly and monthly totals
    weeklyVideos += todayVideosToAdd;
    weeklyHours += todayHoursToAdd;
    monthlyVideos += todayVideosToAdd;
    monthlyHours += todayHoursToAdd;

    return {
      today: { videos: todayVideosTracked, hours: todayHoursTracked }, // Today always shows tracked
      thisWeek: { videos: weeklyVideos, hours: weeklyHours },
      thisMonth: { videos: monthlyVideos, hours: monthlyHours },
    };
  }, [sheetData, videosLogged, totalSeconds, todayData]);


  // --- Callbacks --- 
  const handleTimeUpdate = useCallback((seconds: number, isActive: boolean) => {
    setTotalSeconds(seconds);
    setIsTimerActive(isActive);
    localStorage.setItem('totalSeconds', String(seconds));
    // Hourly reminder
    if (isActive && seconds > 0 && seconds % 3600 === 0) {
      const hours = seconds / 3600;
      const hour_plural = hours > 1 ? (language === 'ar' ? 'ساعات' : 'hours') : (language === 'ar' ? 'ساعة' : 'hour');
      const message = translations.hourlyReminder.replace('{hours}', String(hours)).replace('{hour_plural}', hour_plural);
      toast(message, { icon: '⏰', duration: 5000 });
      showDesktopNotification(translations.header.title, message);
    }
  }, [showDesktopNotification, translations, language]);

  // Save logged data (B, C) when timer stops
  const handleTimerStop = useCallback(async (finalSeconds: number) => {
    setIsTimerActive(false);
    playSound('pause'); // Play sound on stop/pause
    const hoursLogged = parseFloat((finalSeconds / 3600).toFixed(2));
    // Get the final video count from the state (which reflects manual or auto mode)
    const currentVideosLogged = videosLogged;

    const today = new Date();
    const formattedToday = `${today.getMonth() + 1}/${today.getDate()}`;
    let rowIndex = sheetData.findIndex(d => d.date === formattedToday);
    let range = '';
    let valuesToSave: (string | number | undefined)[][] = [];

    if (rowIndex !== -1) {
        // Update existing row (Columns B and C)
        rowIndex = rowIndex + 2; // Adjust for header row and 0-based index
        range = `B${rowIndex}:C${rowIndex}`;
        // Get existing official data to avoid overwriting if only saving logged data
        const existingOfficialVideos = sheetData[rowIndex - 2]?.videosOfficial;
        const existingOfficialHours = sheetData[rowIndex - 2]?.hoursOfficial;
        // Prepare full row data if needed, but here we only update B and C
        valuesToSave = [[currentVideosLogged, hoursLogged]];
    } else {
        // Find the first empty row or append
        rowIndex = sheetData.length + 2; // Append after last data row + header
        range = `A${rowIndex}:L${rowIndex}`; // Save date, logged data, leave others blank
        valuesToSave = [[formattedToday, currentVideosLogged, hoursLogged, '', '', '', '', '', '', '', '', '']]; // Full row
    }

    if (rowIndex > 1) {
      toast.loading(translations.savingProgress, { id: 'saving' });
      const success = await saveSheetData(range, valuesToSave);
      if (success) {
        toast.success(translations.saveSuccess, { id: 'saving' });
        const notificationBody = translations.progressSavedNotificationBody
            .replace('{videos}', String(currentVideosLogged))
            .replace('{hours}', String(hoursLogged));
        showDesktopNotification(translations.progressSavedNotificationTitle, notificationBody);

        // Update local state optimistically
        setSheetData(prev => {
            const newData = [...prev];
            const updateIndex = rowIndex - 2;
            if (updateIndex < newData.length) {
                newData[updateIndex] = { ...newData[updateIndex], videosLogged: currentVideosLogged, hoursLogged };
            } else {
                newData.push({ date: formattedToday, videosLogged: currentVideosLogged, hoursLogged });
            }
            return newData;
        });
        setTodayData(prev => prev ? { ...prev, videosLogged: currentVideosLogged, hoursLogged } : { date: formattedToday, videosLogged: currentVideosLogged, hoursLogged });

        localStorage.removeItem('pendingSync');
      } else {
        toast.error(translations.saveErrorSheet, { id: 'saving' });
        localStorage.setItem('pendingSync', JSON.stringify({ range, values: valuesToSave }));
      }
    } else {
       toast.error(translations.saveErrorRow);
    }
    // Clear local session storage after attempting save
    localStorage.removeItem('totalSeconds');
    localStorage.removeItem('videosLogged');
    setTotalSeconds(0);
    // videosLogged state is reset via Counter component's effect when totalSeconds becomes 0

  }, [videosLogged, sheetData, showDesktopNotification, translations, playSound]); // Added playSound

  // Called by Counter on manual add or when auto-count updates internally
  const handleVideoAdded = useCallback((newCount: number, isAuto: boolean = false) => {
    setVideosLogged(newCount);
    localStorage.setItem('videosLogged', String(newCount));
    if (!isAuto) {
        playSound('add'); // Play sound only for manual add
    }
    // Consider playing a different sound for auto-add if desired
    // if (isAuto) playSound('auto');
  }, [playSound]);

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
          // Update permission state even if denied or dismissed
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

  // Save official data (K, L)
  const handleOfficialDataSaved = useCallback(async (officialVideos: number, officialHours: number) => {
    const today = new Date();
    const formattedToday = `${today.getMonth() + 1}/${today.getDate()}`;
    let rowIndex = sheetData.findIndex(d => d.date === formattedToday);
    let range = '';
    let valuesToSave: (string | number | undefined)[][] = [];

    if (rowIndex !== -1) {
        // Update existing row (Columns K and L)
        rowIndex = rowIndex + 2;
        range = `K${rowIndex}:L${rowIndex}`;
        valuesToSave = [[officialVideos, officialHours]];
    } else {
        // Find the first empty row or append
        rowIndex = sheetData.length + 2;
        range = `A${rowIndex}:L${rowIndex}`; // Save date and official data, leave others blank
        valuesToSave = [[formattedToday, '', '', '', '', '', '', '', '', '', officialVideos, officialHours]];
    }

    if (rowIndex > 1) {
        toast.loading(translations.savingOfficialData, { id: 'savingOfficial' });
        const success = await saveSheetData(range, valuesToSave);
        if (success) {
            toast.success(translations.saveOfficialSuccess, { id: 'savingOfficial' });
            // Update local state optimistically
            setSheetData(prev => {
                const newData = [...prev];
                const updateIndex = rowIndex - 2;
                if (updateIndex < newData.length) {
                    newData[updateIndex] = { ...newData[updateIndex], videosOfficial: officialVideos, hoursOfficial: officialHours };
                } else {
                    newData.push({ date: formattedToday, videosOfficial: officialVideos, hoursOfficial: officialHours });
                }
                return newData;
            });
            setTodayData(prev => prev ? { ...prev, videosOfficial: officialVideos, hoursOfficial: officialHours } : { date: formattedToday, videosOfficial: officialVideos, hoursOfficial: officialHours });
            localStorage.removeItem('pendingSync'); // Clear pending if official save succeeds
        } else {
            toast.error(translations.saveErrorSheet, { id: 'savingOfficial' });
            // Consider if official data should also be queued for sync
            // localStorage.setItem('pendingSyncOfficial', JSON.stringify({ range, values: valuesToSave }));
        }
    } else {
        toast.error(translations.saveErrorRow);
    }
  }, [sheetData, translations]);

  // Handle saving custom targets
  const handleTargetsSave = useCallback((newTargets: CustomTargets) => {
      setCustomTargets(newTargets);
      localStorage.setItem('customTargets', JSON.stringify(newTargets));
      // ProgressBars will automatically update via the activeTargets memo
  }, []);

  // Handle saving manually entered time/videos
  const handleManualEntrySubmit = useCallback(async (date: string, hours: number, videos: number): Promise<boolean> => {
      let rowIndex = sheetData.findIndex(d => d.date === date);
      let range = '';
      let valuesToSave: (string | number | undefined)[][] = [];
      let existingLoggedVideos = 0;
      let existingLoggedHours = 0;

      if (rowIndex !== -1) {
          // Add to existing row data (Columns B and C)
          rowIndex = rowIndex + 2;
          range = `B${rowIndex}:C${rowIndex}`;
          existingLoggedVideos = sheetData[rowIndex - 2]?.videosLogged || 0;
          existingLoggedHours = sheetData[rowIndex - 2]?.hoursLogged || 0;
          valuesToSave = [[existingLoggedVideos + videos, existingLoggedHours + hours]];
      } else {
          // Find the first empty row or append
          rowIndex = sheetData.length + 2;
          range = `A${rowIndex}:L${rowIndex}`; // Save date and logged data
          valuesToSave = [[date, videos, hours, '', '', '', '', '', '', '', '', '']];
      }

      if (rowIndex > 1) {
          toast.loading(translations.manualTimeEntry.savingMessage, { id: 'savingManual' });
          const success = await saveSheetData(range, valuesToSave);
          if (success) {
              toast.success(translations.manualTimeEntry.saveSuccess, { id: 'savingManual' });
              // Update local state optimistically
              setSheetData(prev => {
                  const newData = [...prev];
                  const updateIndex = rowIndex - 2;
                  const newLoggedVideos = existingLoggedVideos + videos;
                  const newLoggedHours = existingLoggedHours + hours;
                  if (updateIndex < newData.length) {
                      newData[updateIndex] = { ...newData[updateIndex], videosLogged: newLoggedVideos, hoursLogged: newLoggedHours };
                  } else {
                      newData.push({ date: date, videosLogged: newLoggedVideos, hoursLogged: newLoggedHours });
                  }
                  return newData;
              });
              // Update todayData if the manual entry was for today
              const todayFormatted = `${new Date().getMonth() + 1}/${new Date().getDate()}`;
              if (date === todayFormatted) {
                 setTodayData(prev => prev ? { ...prev, videosLogged: existingLoggedVideos + videos, hoursLogged: existingLoggedHours + hours } : { date: date, videosLogged: existingLoggedVideos + videos, hoursLogged: existingLoggedHours + hours });
              }
              localStorage.removeItem('pendingSync'); // Clear pending if manual save succeeds
              return true;
          } else {
              toast.error(translations.saveErrorSheet, { id: 'savingManual' });
              // Consider queuing manual entries too
              // localStorage.setItem('pendingSyncManual', JSON.stringify({ range, values: valuesToSave }));
              return false;
          }
      } else {
          toast.error(translations.saveErrorRow);
          return false;
      }
  }, [sheetData, translations]);

  // Handle Sound Toggle
  const handleSoundToggle = useCallback((enabled: boolean) => {
      setSoundEnabled(enabled);
      localStorage.setItem('soundEnabled', JSON.stringify(enabled));
      toast(enabled ? translations.settings.soundEnabled : translations.settings.soundDisabled);
  }, [translations]);

  // Timer Action Notifications & Sounds
  const handleTimerStart = useCallback(() => {
      toast.success(translations.timer.timerStarted);
      playSound('start');
  }, [translations, playSound]);
  const handleTimerPause = useCallback(() => {
      toast.success(translations.timer.timerPaused);
      playSound('pause');
  }, [translations, playSound]);
  const handleTimerReset = useCallback(() => {
      toast.success(translations.timer.timerReset);
      playSound('reset');
      // Also reset videos logged on explicit reset
      setVideosLogged(0);
      localStorage.removeItem('videosLogged');
      localStorage.removeItem('totalSeconds'); // Also clear stored seconds on reset
  }, [translations, playSound]);

  // --- Render --- 
  if (isLoading) {
    return (
        <div className="flex justify-center items-center min-h-screen bg-background text-foreground">
            <Loader2 className="w-8 h-8 mr-3 animate-spin text-primary" />
            {translations.loading}
        </div>
    );
  }

  return (
    // Removed hardcoded dark class, relies on useEffect setting it on <html>
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Column 1: Timer, Counter, Official Data */}
          <div className="flex flex-col gap-6 lg:col-span-1">
            <Timer 
               onTimeUpdate={handleTimeUpdate} 
               onTimerStop={handleTimerStop} 
               initialSeconds={totalSeconds}
               onStart={handleTimerStart}
               onPause={handleTimerPause}
               onReset={handleTimerReset}
            />
            <Counter 
              totalSeconds={totalSeconds}
              onVideoAdded={handleVideoAdded}
              initialVideosLogged={todayData?.videosLogged || videosLogged} // Pass initial videos for the day
              videosOfficial={todayData?.videosOfficial}
              hoursOfficial={todayData?.hoursOfficial}
              isTimerActive={isTimerActive}
            />
             <OfficialDataEntry 
                initialVideos={todayData?.videosOfficial}
                initialHours={todayData?.hoursOfficial}
                loggedVideos={videosLogged} // Pass current tracked videos for comparison
                loggedHours={parseFloat((totalSeconds / 3600).toFixed(2))} // Pass current tracked hours
                onSave={handleOfficialDataSaved}
             />
          </div>

          {/* Column 2: Progress Bars, Manual Entry, Advanced Analytics */}
          <div className="flex flex-col gap-6 lg:col-span-2">
             <ProgressBars 
                progress={currentProgress} 
                targets={activeTargets} // Pass active targets
             />
             <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <ManualTimeEntry onManualEntrySubmit={handleManualEntrySubmit} />
                <AdvancedAnalytics sheetData={sheetData} />
             </div>
          </div>
        </div>

        {/* Charts Section - Full Width Below */}
        <Charts sheetData={sheetData} />

      </main>
      <Settings 
        isVacationMode={isVacationMode}
        onVacationModeToggle={handleVacationModeToggle}
        initialTargets={customTargets} // Pass current custom targets
        onTargetsSave={handleTargetsSave} // Pass save handler
        soundEnabled={soundEnabled}
        onSoundToggle={handleSoundToggle}
        sheetData={sheetData} // Pass sheetData for export
      />
    </div>
  );
}

