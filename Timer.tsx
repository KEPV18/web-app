
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw, TimerIcon } from 'lucide-react'; // Use TimerIcon
import { useLanguage } from '@/contexts/LanguageContext';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"; // Use Card component

interface TimerProps {
  onTimeUpdate: (seconds: number, isActive: boolean) => void;
  onTimerStop: (finalSeconds: number) => void;
  initialSeconds: number;
  onTimerStart: () => void;
  onTimerPause: () => void;
  onTimerReset: () => void;
}

const Timer: React.FC<TimerProps> = ({ 
  onTimeUpdate, 
  onTimerStop, 
  initialSeconds,
  onTimerStart,
  onTimerPause,
  onTimerReset
}) => {
  const { translations } = useLanguage();
  const [totalSeconds, setTotalSeconds] = useState(initialSeconds);
  const [isActive, setIsActive] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setTotalSeconds(initialSeconds);
  }, [initialSeconds]);

  const formatTime = (timeInSeconds: number): string => {
    const hours = Math.floor(timeInSeconds / 3600);
    const minutes = Math.floor((timeInSeconds % 3600) / 60);
    const seconds = timeInSeconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  useEffect(() => {
    if (isActive) {
      intervalRef.current = setInterval(() => {
        setTotalSeconds((prevSeconds) => {
          const newSeconds = prevSeconds + 1;
          onTimeUpdate(newSeconds, true);
          return newSeconds;
        });
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, onTimeUpdate]);

  const handleStart = () => {
    setIsActive(true);
    onTimeUpdate(totalSeconds, true);
    onTimerStart();
  };

  const handlePause = () => {
    setIsActive(false);
    onTimeUpdate(totalSeconds, false);
    onTimerPause();
  };

  const confirmReset = () => {
    const finalSeconds = totalSeconds;
    setIsActive(false);
    setTotalSeconds(0);
    onTimeUpdate(0, false);
    onTimerStop(finalSeconds);
    onTimerReset();
  };

  return (
    <Card className="flex flex-col h-full"> {/* Use Card and ensure full height */} 
      <CardHeader>
        <CardTitle className="flex items-center text-lg">
          <TimerIcon className="w-5 h-5 mr-2 rtl:ml-2 text-primary" />
          {translations.timer.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col flex-grow justify-center items-center"> {/* Center content */} 
        <p className="text-center text-5xl font-mono font-bold my-6 text-primary">
          {formatTime(totalSeconds)}
        </p>
        <div className="flex justify-center space-x-3 rtl:space-x-reverse mt-4">
          {!isActive ? (
            <Button
              onClick={handleStart}
              disabled={isActive}
              variant="default" // Use default variant for primary action
              size="lg" // Make buttons larger
              className="transition-transform active:scale-95"
            >
              <Play className="mr-2 rtl:ml-2 h-5 w-5" /> {totalSeconds > 0 ? translations.timer.resume : translations.timer.start}
            </Button>
          ) : (
            <Button
              onClick={handlePause}
              disabled={!isActive}
              variant="secondary" // Use secondary for pause
              size="lg"
              className="transition-transform active:scale-95"
            >
              <Pause className="mr-2 rtl:ml-2 h-5 w-5" /> {translations.timer.pause}
            </Button>
          )}

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="destructive"
                size="lg"
                disabled={totalSeconds === 0 && !isActive}
                className="transition-transform active:scale-95"
              >
                <RotateCcw className="mr-2 rtl:ml-2 h-5 w-5" /> {translations.timer.reset}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{translations.timer.confirmResetTitle}</AlertDialogTitle>
                <AlertDialogDescription>
                  {translations.timer.confirmResetBody}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>{translations.timer.cancel}</AlertDialogCancel>
                <AlertDialogAction onClick={confirmReset}>{translations.timer.confirm}</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  );
};

export default Timer;

