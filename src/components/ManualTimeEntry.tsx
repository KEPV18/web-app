
'use client';

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
import { useLanguage } from '@/contexts/LanguageContext';
import { Clock, PlusCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface ManualTimeEntryProps {
  onManualEntrySubmit: (date: string, hours: number, videos: number) => Promise<boolean>; // Returns success status
}

const ManualTimeEntry: React.FC<ManualTimeEntryProps> = ({ onManualEntrySubmit }) => {
  const { translations } = useLanguage();
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]); // Default to today YYYY-MM-DD
  const [hoursInput, setHoursInput] = useState('');
  const [minutesInput, setMinutesInput] = useState('');
  const [videosInput, setVideosInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const hours = parseFloat(hoursInput) || 0;
    const minutes = parseFloat(minutesInput) || 0;
    const totalHours = hours + minutes / 60;
    const videos = parseInt(videosInput) || 0;

    if (totalHours <= 0 && videos <= 0) {
      toast.error(translations.manualTimeEntry.errorZeroInput);
      setIsSubmitting(false);
      return;
    }
    if (!date) {
        toast.error(translations.manualTimeEntry.errorInvalidDate);
        setIsSubmitting(false);
        return;
    }

    // Convert YYYY-MM-DD to MM/DD
    const [year, month, day] = date.split('-').map(Number);
    const formattedDate = `${month}/${day}`;

    const success = await onManualEntrySubmit(formattedDate, totalHours, videos);

    if (success) {
      toast.success(translations.manualTimeEntry.successMessage);
      // Reset form
      setDate(new Date().toISOString().split('T')[0]);
      setHoursInput('');
      setMinutesInput('');
      setVideosInput('');
    } else {
      // Error toast is handled by the parent function
    }

    setIsSubmitting(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Clock className="w-5 h-5 mr-2 rtl:ml-2" />
          {translations.manualTimeEntry.title}
        </CardTitle>
        <CardDescription>{translations.manualTimeEntry.description}</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="manual-date">{translations.manualTimeEntry.dateLabel}</Label>
              <Input
                id="manual-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="mt-1"
              />
            </div>
            <div className="grid grid-cols-2 gap-2 col-span-1 sm:col-span-2">
                 <div>
                    <Label htmlFor="manual-hours">{translations.manualTimeEntry.hoursLabel}</Label>
                    <Input
                        id="manual-hours"
                        type="number"
                        value={hoursInput}
                        onChange={(e) => setHoursInput(e.target.value)}
                        placeholder="e.g., 2"
                        min="0"
                        step="any"
                        className="mt-1"
                    />
                 </div>
                 <div>
                    <Label htmlFor="manual-minutes">{translations.manualTimeEntry.minutesLabel}</Label>
                    <Input
                        id="manual-minutes"
                        type="number"
                        value={minutesInput}
                        onChange={(e) => setMinutesInput(e.target.value)}
                        placeholder="e.g., 30"
                        min="0"
                        max="59"
                        step="1"
                        className="mt-1"
                    />
                 </div>
            </div>
          </div>
           <div>
              <Label htmlFor="manual-videos">{translations.manualTimeEntry.videosLabel}</Label>
              <Input
                id="manual-videos"
                type="number"
                value={videosInput}
                onChange={(e) => setVideosInput(e.target.value)}
                placeholder="e.g., 500"
                min="0"
                step="1"
                className="mt-1"
              />
            </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
            {isSubmitting ? (
              <>{translations.submitting}...</>
            ) : (
              <><PlusCircle className="w-4 h-4 mr-2 rtl:ml-2" /> {translations.manualTimeEntry.submitButton}</>
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default ManualTimeEntry;

