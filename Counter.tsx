
'use client';

import React, { useState, useEffect } from 'react';
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input"; // Import Input
import { Button } from "@/components/ui/button";
import { Plus, Video, Hourglass } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";

interface CounterProps {
  totalSeconds: number;
  onVideoAdded: (newCount: number) => void;
  initialVideosLogged?: number;
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
  const [autoInterval, setAutoInterval] = useState<number>(15); // Actual interval used
  const [selectedIntervalOption, setSelectedIntervalOption] = useState<string>("15"); // For Select component
  const [customIntervalInput, setCustomIntervalInput] = useState<string>(""); // For custom input
  const [countdownSeconds, setCountdownSeconds] = useState<number>(autoInterval);

  // Effect to initialize or reset videosLogged
  useEffect(() => {
    if (totalSeconds === 0) {
      setVideosLogged(0);
      setCountdownSeconds(autoInterval);
    } else if (!isAutoMode) {
      setVideosLogged(initialVideosLogged);
    }
  }, [initialVideosLogged, totalSeconds, isAutoMode, autoInterval]);

  // Effect to calculate speed (manual mode only)
  useEffect(() => {
    if (totalSeconds > 0 && !isAutoMode) {
      const minutes = totalSeconds / 60;
      const calculatedSpeed = videosLogged / minutes;
      setSpeed(parseFloat(calculatedSpeed.toFixed(2)));
    } else {
      setSpeed(0);
    }
  }, [videosLogged, totalSeconds, isAutoMode]);

  // Effect for Automatic Mode Logic & Countdown
  useEffect(() => {
    if (isAutoMode && autoInterval > 0) {
      if (isTimerActive && totalSeconds > 0) {
        const expectedVideos = Math.floor(totalSeconds / autoInterval);
        if (expectedVideos !== videosLogged) {
          setVideosLogged(expectedVideos);
          onVideoAdded(expectedVideos);
        }
        const secondsIntoCurrentInterval = totalSeconds % autoInterval;
        let remainingSeconds = autoInterval - secondsIntoCurrentInterval;
        if (secondsIntoCurrentInterval === 0 && totalSeconds > 0) {
          remainingSeconds = autoInterval;
        }
        setCountdownSeconds(remainingSeconds);
      } else {
        setCountdownSeconds(autoInterval);
      }
    } else {
      setCountdownSeconds(autoInterval);
    }
  }, [totalSeconds, isAutoMode, isTimerActive, autoInterval, onVideoAdded, videosLogged]);

  const handleManualAdd = () => {
    if (isAutoMode) return;
    const newCount = videosLogged + 1;
    setVideosLogged(newCount);
    onVideoAdded(newCount);
  };

  const handleAutoModeToggle = (checked: boolean) => {
    setIsAutoMode(checked);
    setCountdownSeconds(autoInterval);
    if (checked) {
      setSpeed(0);
      if (isTimerActive && totalSeconds > 0 && autoInterval > 0) {
        const expectedVideos = Math.floor(totalSeconds / autoInterval);
        if (expectedVideos !== videosLogged) {
          setVideosLogged(expectedVideos);
          onVideoAdded(expectedVideos);
        }
        const secondsIntoCurrentInterval = totalSeconds % autoInterval;
        let remainingSeconds = autoInterval - secondsIntoCurrentInterval;
        if (secondsIntoCurrentInterval === 0 && totalSeconds > 0) {
          remainingSeconds = autoInterval;
        }
        setCountdownSeconds(remainingSeconds);
      }
    } else {
      if (totalSeconds > 0) {
        const minutes = totalSeconds / 60;
        const calculatedSpeed = videosLogged / minutes;
        setSpeed(parseFloat(calculatedSpeed.toFixed(2)));
      } else {
        setSpeed(0);
      }
    }
  };

  // Handles changes from Select dropdown OR custom input
  const updateAutoInterval = (newIntervalValue: number) => {
    if (newIntervalValue > 0) {
        setAutoInterval(newIntervalValue);
        setCountdownSeconds(newIntervalValue);
        if (isAutoMode && isTimerActive && totalSeconds > 0) {
            const expectedVideos = Math.floor(totalSeconds / newIntervalValue);
            if (expectedVideos !== videosLogged) {
                setVideosLogged(expectedVideos);
                onVideoAdded(expectedVideos);
            }
            const secondsIntoCurrentInterval = totalSeconds % newIntervalValue;
            let remainingSeconds = newIntervalValue - secondsIntoCurrentInterval;
            if (secondsIntoCurrentInterval === 0 && totalSeconds > 0) {
                remainingSeconds = newIntervalValue;
            }
            setCountdownSeconds(remainingSeconds);
        }
    }
  };

  const handleIntervalOptionChange = (value: string) => {
    setSelectedIntervalOption(value);
    if (value !== "custom") {
      const newInterval = parseInt(value);
      setCustomIntervalInput(""); // Clear custom input if selecting a preset
      updateAutoInterval(newInterval);
    }
    // If value is "custom", we wait for the input field change
  };

  const handleCustomIntervalInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setCustomIntervalInput(inputValue);
    const newInterval = parseInt(inputValue);
    if (!isNaN(newInterval) && newInterval > 0) {
        updateAutoInterval(newInterval);
    } else if (inputValue === "") {
        // Handle empty input if needed, maybe default to a base interval?
        // For now, let's keep the last valid interval
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
              size="sm"
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
                      <SelectItem value="25">25s</SelectItem>
                      <SelectItem value="custom">{translations.counter.customInterval}</SelectItem>
                    </SelectGroup>
                  </SelectContent>
              </Select>
              {selectedIntervalOption === "custom" && (
                <Input
                  type="number"
                  value={customIntervalInput}
                  onChange={handleCustomIntervalInputChange}
                  placeholder={translations.counter.secondsPlaceholder} // Add translation
                  min="1"
                  className="w-[80px]"
                />
              )}
            </div>
          )}
        </div>
        {!isAutoMode && (
            <p className="text-center text-sm text-muted-foreground mt-2">
              {translations.counter.speed.replace('{speed}', String(speed))}
            </p>
        )}
        {isAutoMode && (
            <p className="text-center text-xs text-green-600 dark:text-green-400 mt-1 flex items-center justify-center">
                <Hourglass className={`w-3 h-3 mr-1 ${isTimerActive ? 'animate-spin' : ''}`} />
                {isTimerActive
                    ? translations.counter.autoModeActive
                        .replace('{interval}', String(autoInterval))
                        .replace('{countdown}', String(Math.ceil(countdownSeconds)))
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

