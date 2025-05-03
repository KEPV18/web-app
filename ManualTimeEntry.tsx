
'use client';

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar"; // Assuming shadcn calendar
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarIcon, Save } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from "@/lib/utils";
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface ManualTimeEntryProps {
  onSave: (entry: { date: Date; hours: number; videos?: number }) => Promise<boolean>; // Returns true on success
}

const ManualTimeEntry: React.FC<ManualTimeEntryProps> = ({ onSave }) => {
  const { translations } = useLanguage();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [hoursInput, setHoursInput] = useState<string>("");
  const [minutesInput, setMinutesInput] = useState<string>("");
  const [videosInput, setVideosInput] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    setError(null);
    if (!date) {
      setError(translations.manualTimeEntry.errorDateRequired);
      return;
    }

    const hours = parseFloat(hoursInput) || 0;
    const minutes = parseFloat(minutesInput) || 0;
    const totalHours = hours + minutes / 60;

    if (totalHours <= 0) {
      setError(translations.manualTimeEntry.errorDurationRequired);
      return;
    }

    const videos = videosInput ? parseInt(videosInput) : undefined;
    if (videos !== undefined && (isNaN(videos) || videos < 0)) {
      setError(translations.manualTimeEntry.errorInvalidVideos);
      return;
    }

    setIsSaving(true);
    const success = await onSave({ date, hours: totalHours, videos });
    setIsSaving(false);

    if (success) {
      // Optionally clear fields on success
      // setDate(new Date());
      // setHoursInput("");
      // setMinutesInput("");
      // setVideosInput("");
    } else {
        // Error handling/messaging is likely done within the onSave prop function (e.g., via toasts)
        // setError(translations.manualTimeEntry.errorSaving); // Or get specific error from onSave
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{translations.manualTimeEntry.title}</CardTitle>
        <CardDescription>{translations.manualTimeEntry.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
          {/* Date Picker */}
          <div className="space-y-2">
            <Label htmlFor="manual-date">{translations.manualTimeEntry.dateLabel}</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : <span>{translations.manualTimeEntry.pickDate}</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Duration Inputs */}
          <div className="space-y-2">
            <Label>{translations.manualTimeEntry.durationLabel}</Label>
            <div className="flex gap-2">
              <Input
                id="manual-hours"
                type="number"
                value={hoursInput}
                onChange={(e) => setHoursInput(e.target.value)}
                placeholder={translations.manualTimeEntry.hoursPlaceholder}
                min="0"
                className="w-full"
              />
              <Input
                id="manual-minutes"
                type="number"
                value={minutesInput}
                onChange={(e) => setMinutesInput(e.target.value)}
                placeholder={translations.manualTimeEntry.minutesPlaceholder}
                min="0"
                max="59"
                className="w-full"
              />
            </div>
          </div>

          {/* Videos Input (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="manual-videos">{translations.manualTimeEntry.videosLabel}</Label>
            <Input
              id="manual-videos"
              type="number"
              value={videosInput}
              onChange={(e) => setVideosInput(e.target.value)}
              placeholder={translations.manualTimeEntry.videosPlaceholder}
              min="0"
            />
          </div>
        </div>

        {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

        <Button onClick={handleSave} disabled={isSaving} className="w-full sm:w-auto">
          <Save className="mr-2 h-4 w-4" />
          {isSaving ? translations.manualTimeEntry.saving : translations.manualTimeEntry.saveButton}
        </Button>
      </CardContent>
    </Card>
  );
};

export default ManualTimeEntry;

