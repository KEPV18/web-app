
'use client';

import React, { useState, useEffect } from 'react';
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Video, Hourglass } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";

interface CounterProps {
  totalSeconds: number;
  onVideoAdded: (newCount: number) => void; // Keep for manual add notification
  initialVideosLogged?: number; // Used only for initial manual state
  videosOfficial?: number;
  hoursOfficial?: number;
  isTimerActive: boolean;
}

const Counter: React.FC<CounterProps> = ({
  totalSeconds,
  onVideoAdded,
  initialVideosLogged = 0,
  videosOfficial,
  hoursOfficial,
  isTimerActive,
}) => {
  const { translations } = useLanguage();
  const [videosLogged, setVideosLogged] = useState(initialVideosLogged);
  const [speed, setSpeed] = useState(0);
  const [isAutoMode, setIsAutoMode] = useState(false);
  const [autoInterval, setAutoInterval] = useState<number>(15); // Default interval
  const [selectedIntervalOption, setSelectedIntervalOption] = useState<string>("15");
  const [customIntervalInput, setCustomIntervalInput] = useState<string>("");
  const [countdownSeconds, setCountdownSeconds] = useState<number>(autoInterval);

  // Effect to calculate videosLogged in Auto Mode based on totalSeconds
  useEffect(() => {
    if (isAutoMode && autoInterval > 0) {
      // Calculate expected videos based *only* on totalSeconds and interval
      const expectedVideos = Math.floor(totalSeconds / autoInterval);
      // Update state only if it differs to avoid unnecessary re-renders
      if (expectedVideos !== videosLogged) {
        setVideosLogged(expectedVideos);
        // NOTE: We don't call onVideoAdded here for auto mode.
        // The parent component (page.tsx) should read the final videosLogged
        // when the timer stops or periodically if needed for saving.
      }
    } else if (!isAutoMode) {
      // When switching back to manual, ensure videosLogged reflects the initial prop if timer is 0
      // Otherwise, keep the count from auto mode until manually changed or reset.
      if (totalSeconds === 0) {
          setVideosLogged(initialVideosLogged);
      }
    }

    // Always reset videos if timer resets (totalSeconds becomes 0)
    if (totalSeconds === 0) {
        setVideosLogged(0);
    }
  }, [totalSeconds, isAutoMode, autoInterval, initialVideosLogged]); // Added initialVideosLogged dependency

  // Effect for the LIVE COUNTDOWN display timer
  useEffect(() => {
    let countdownIntervalId: NodeJS.Timeout | null = null;

    if (isAutoMode && isTimerActive && autoInterval > 0) {
      // Calculate initial countdown when timer starts or resumes
      const secondsIntoCurrentInterval = totalSeconds % autoInterval;
      let initialCountdown = autoInterval - secondsIntoCurrentInterval;
      // If exactly on the interval boundary (and not at 0 seconds), start a full countdown
      if (secondsIntoCurrentInterval === 0 && totalSeconds > 0) {
        initialCountdown = autoInterval;
      }
      // Ensure countdown doesn't start at 0 visually
      if (initialCountdown === 0) initialCountdown = autoInterval;

      // Set the initial countdown value for the display
      setCountdownSeconds(initialCountdown);

      // Start the 1-second interval to tick down the display
      countdownIntervalId = setInterval(() => {
        setCountdownSeconds(prevCountdown => {
          const nextCountdown = prevCountdown - 1;
          // When countdown reaches zero visually, reset it for the next interval's display.
          // The actual video count is handled by the other useEffect based on totalSeconds.
          return nextCountdown <= 0 ? autoInterval : nextCountdown;
        });
      }, 1000);

    } else {
      // Timer stopped, reset, or not in auto mode
      if (countdownIntervalId) {
        clearInterval(countdownIntervalId); // Stop the countdown timer
      }
      // Reset visual countdown to the full interval when timer is not active or mode is off
      setCountdownSeconds(autoInterval);
    }

    // Cleanup function: Clear interval when effect dependencies change or component unmounts
    return () => {
      if (countdownIntervalId) {
        clearInterval(countdownIntervalId);
      }
    };
    // Dependencies: Re-run effect if mode, timer activity, interval, or totalSeconds change.
  }, [isAutoMode, isTimerActive, autoInterval, totalSeconds]);

  // Effect to calculate speed (manual mode only)
  useEffect(() => {
    if (totalSeconds > 0 && !isAutoMode) {
      const minutes = totalSeconds / 60;
      // Use the current videosLogged state
      const calculatedSpeed = videosLogged / minutes;
      // Handle division by zero or NaN cases
      setSpeed(isFinite(calculatedSpeed) ? parseFloat(calculatedSpeed.toFixed(2)) : 0);
    } else {
      setSpeed(0); // No speed in auto mode or when timer is 0
    }
  }, [videosLogged, totalSeconds, isAutoMode]);

  // Effect to handle switching modes (mainly for speed display)
   useEffect(() => {
      if (isAutoMode) {
          setSpeed(0); // Hide speed in auto mode
      } else {
           // Switching FROM auto mode - recalculate speed if timer running
           if (totalSeconds > 0) {
                const minutes = totalSeconds / 60;
                const calculatedSpeed = videosLogged / minutes;
                setSpeed(isFinite(calculatedSpeed) ? parseFloat(calculatedSpeed.toFixed(2)) : 0);
           } else {
                setSpeed(0);
           }
      }
  }, [isAutoMode, totalSeconds, videosLogged]);


  // Manual Add Button Handler
  const handleManualAdd = () => {
    if (isAutoMode) return; // Do nothing if in auto mode
    const newCount = videosLogged + 1;
    setVideosLogged(newCount);
    onVideoAdded(newCount); // Notify parent immediately for manual add
  };

  // Auto Mode Toggle Handler
  const handleAutoModeToggle = (checked: boolean) => {
    setIsAutoMode(checked);
    // Effects will handle resetting countdown/speed/videosLogged based on the new isAutoMode state
    // When switching TO auto mode, the video count effect will calculate the initial count.
    // When switching FROM auto mode, the speed effect will recalculate speed.
  };

  // Update Auto Interval State (used by Select and Input handlers)
  const updateAutoInterval = (newIntervalValue: number) => {
    if (newIntervalValue > 0) {
        setAutoInterval(newIntervalValue);
        // Effects will handle recalculating videos/countdown based on the new autoInterval
    }
  };

  // Interval Select Dropdown Handler
  const handleIntervalOptionChange = (value: string) => {
    setSelectedIntervalOption(value);
    if (value !== "custom") {
      const newInterval = parseInt(value);
      setCustomIntervalInput(""); // Clear custom input if selecting a preset
      if (!isNaN(newInterval)) {
        updateAutoInterval(newInterval);
      }
    } else {
        // If switching to custom, and input is empty, maybe keep old interval?
        // For now, we wait for input change.
        // If custom input already has a valid value, update interval
        const currentCustom = parseInt(customIntervalInput);
        if (!isNaN(currentCustom) && currentCustom > 0) {
            updateAutoInterval(currentCustom);
        }
    }
  };

  // Custom Interval Input Handler
  const handleCustomIntervalInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setCustomIntervalInput(inputValue);
    // Only update if the selected option is 'custom'
    if (selectedIntervalOption === "custom") {
        const newInterval = parseInt(inputValue);
        if (!isNaN(newInterval) && newInterval > 0) {
            updateAutoInterval(newInterval);
        } else if (inputValue === "") {
            // Handle empty input - maybe revert to a default or do nothing?
            // Let's do nothing for now, interval remains the last valid one.
        }
    }
  };


  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-lg">
          <span className="flex items-center">
            <Video className="w-5 h-5 mr-2 rtl:ml-2 text-primary" />
            {translations.counter.title}
          </span>
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <Label htmlFor="auto-mode-switch" className="text-sm font-normal">{translations.counter.autoMode}</Label>
            <Switch
              id="auto-mode-switch"
              checked={isAutoMode}
              onCheckedChange={handleAutoModeToggle}
              // Removed size="sm" as it might not be a valid prop for shadcn Switch
            />
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col flex-grow justify-center items-center">
        <p className="text-center text-6xl font-mono font-bold my-4 text-primary">
          {videosLogged}
        </p>
        <div className="flex flex-wrap justify-center items-center gap-2 mb-2"> {/* Use gap and wrap */} 
          <Button
            onClick={handleManualAdd}
            disabled={isAutoMode}
            variant={isAutoMode ? "outline" : "default"}
            size="md"
            className="transition-transform active:scale-95"
          >
            <Plus className="mr-1 rtl:ml-1 h-4 w-4" /> {translations.counter.addVideoManual}
          </Button>
          {isAutoMode && (
            <div className="flex items-center gap-2"> {/* Group Select and Input */} 
              <Select onValueChange={handleIntervalOptionChange} value={selectedIntervalOption}>
                  <SelectTrigger className="w-[100px]">
                      <SelectValue placeholder={translations.counter.interval} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="10">10s</SelectItem>
                      <SelectItem value="15">15s</SelectItem>
                      <SelectItem value="20">20s</SelectItem>
                      <SelectItem value="25">25s</SelectItem> {/* Added 25s option */}
                      <SelectItem value="custom">{translations.counter.customInterval}</SelectItem>
                    </SelectGroup>
                  </SelectContent>
              </Select>
              {selectedIntervalOption === "custom" && (
                <Input
                  type="number"
                  value={customIntervalInput}
                  onChange={handleCustomIntervalInputChange}
                  placeholder={translations.counter.secondsPlaceholder} // Ensure this translation exists
                  min="1"
                  className="w-[80px]"
                />
              )}
            </div>
          )}
        </div>
        {/* Speed Display: Only shown when NOT in Auto Mode */}
        {!isAutoMode && (
            <p className="text-center text-sm text-muted-foreground mt-2">
              {translations.counter.speed.replace('{speed}', String(speed))}
            </p>
        )}
        {/* Auto Mode Status/Countdown Display */}
        {isAutoMode && (
            <p className="text-center text-xs text-green-600 dark:text-green-400 mt-1 flex items-center justify-center">
                <Hourglass className={`w-3 h-3 mr-1 rtl:ml-1 ${isTimerActive ? 'animate-spin' : ''}`} />
                {isTimerActive
                    ? translations.counter.autoModeActive
                        .replace('{interval}', String(autoInterval))
                        .replace('{countdown}', String(Math.ceil(countdownSeconds))) // Use Math.ceil for display
                    : translations.counter.autoModeReady.replace('{interval}', String(autoInterval))}
            </p>
        )}
      </CardContent>
      <CardFooter className="border-t pt-4">
         <div className="w-full text-center">
             <h4 className="text-sm font-medium mb-1 text-muted-foreground">{translations.counter.officialDataTitle}</h4>
             <p className="text-sm text-muted-foreground">
                {translations.counter.videos}: <span className="font-mono font-semibold text-foreground">{videosOfficial ?? '--'}</span> | {translations.counter.hours}: <span className="font-mono font-semibold text-foreground">{hoursOfficial ?? '--'}</span>
             </p>
         </div>
      </CardFooter>
    </Card>
  );
};

export default Counter;

