
'use client';

import React from 'react';
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useLanguage } from '@/contexts/LanguageContext'; // Import useLanguage

interface ProgressData {
  videos: number;
  hours: number;
}

interface Targets {
  daily: ProgressData;
  weekly: ProgressData;
  monthly: ProgressData & { workingDays: number };
}

interface ProgressBarsProps {
  currentProgress: {
    today: ProgressData;
    thisWeek: ProgressData;
    thisMonth: ProgressData;
  };
  targets: Targets;
  isVacationMode: boolean;
  onVacationModeToggle: (isVacation: boolean) => void;
}

const ProgressBarItem: React.FC<{ label: string; value: number; target: number; unit: string }> = 
  ({ label, value, target, unit }) => {
  const { translations } = useLanguage(); // Use language context
  const percentage = target > 0 ? Math.min(Math.round((value / target) * 100), 100) : 0;
  const remaining = Math.max(0, target - value);
  let colorClass = 'bg-red-500';
  if (percentage >= 100) {
    colorClass = 'bg-green-500';
  } else if (percentage >= 75) {
    colorClass = 'bg-yellow-500';
  }

  // Translate unit
  const translatedUnit = unit === 'Videos' ? translations.progressBars.videos : translations.progressBars.hours;

  return (
    <div className="mb-3">
      <div className="flex justify-between items-center mb-1 text-sm">
        <span>{label}</span>
        <span className="font-semibold">
          {value.toFixed(unit === 'Hours' ? 1 : 0)} / {target.toFixed(unit === 'Hours' ? 1 : 0)} {translatedUnit}
        </span>
      </div>
      <Progress value={percentage} className={`h-2 [&>*]:${colorClass}`} />
      {/* Add translation for Complete and Remaining later if needed */}
      {/* <div className="flex justify-between items-center mt-1 text-xs text-gray-500 dark:text-gray-400">
         <span>{percentage}% Complete</span>
         <span>Remaining: {remaining.toFixed(unit === 'Hours' ? 1 : 0)} {translatedUnit}</span>
      </div> */}
    </div>
  );
};

const ProgressBars: React.FC<ProgressBarsProps> = ({
  currentProgress,
  targets,
  isVacationMode,
  onVacationModeToggle,
}) => {
  const { translations } = useLanguage(); // Use language context

  const weeklyProgress = currentProgress.thisWeek;
  const monthlyProgress = currentProgress.thisMonth;

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
         <h3 className="text-lg font-medium flex items-center">
            <i className="fas fa-tachometer-alt mr-2 rtl:ml-2 text-primary"></i>{translations.progressBars.title}
         </h3>
         <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <Label htmlFor="vacation-mode-switch" className="text-sm">
                {translations.progressBars.workSchedule}: {isVacationMode ? translations.progressBars.days7 : translations.progressBars.days6}
            </Label>
            <Switch
              id="vacation-mode-switch"
              checked={isVacationMode}
              onCheckedChange={onVacationModeToggle}
              aria-label={translations.progressBars.workSchedule}
            />
          </div>
      </div>

      <div>
        <h4 className="font-semibold mb-2 text-base">{translations.progressBars.today}</h4>
        <ProgressBarItem label={translations.progressBars.videos} value={currentProgress.today.videos} target={targets.daily.videos} unit="Videos" />
        <ProgressBarItem label={translations.progressBars.hours} value={currentProgress.today.hours} target={targets.daily.hours} unit="Hours" />
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <h4 className="font-semibold mb-2 text-base">{translations.progressBars.thisWeek}</h4>
        <ProgressBarItem label={translations.progressBars.videos} value={weeklyProgress.videos} target={targets.weekly.videos} unit="Videos" />
        <ProgressBarItem label={translations.progressBars.hours} value={weeklyProgress.hours} target={targets.weekly.hours} unit="Hours" />
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <h4 className="font-semibold mb-2 text-base">{translations.progressBars.thisMonth}</h4>
        <ProgressBarItem label={translations.progressBars.videos} value={monthlyProgress.videos} target={targets.monthly.videos} unit="Videos" />
        <ProgressBarItem label={translations.progressBars.hours} value={monthlyProgress.hours} target={targets.monthly.hours} unit="Hours" />
      </div>
    </div>
  );
};

export default ProgressBars;

