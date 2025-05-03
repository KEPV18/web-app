
'use client';

import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { saveSheetData } from '@/lib/googleSheets';
import { Loader2, FileSignature } from 'lucide-react'; // Use FileSignature icon
import { useLanguage } from '@/contexts/LanguageContext'; // Import useLanguage
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"; // Use Card component

interface OfficialDataEntryProps {
  todayDateFormatted: string;
  trackedVideos: number;
  trackedHours: number;
  officialVideosInitial?: number;
  officialHoursInitial?: number;
  sheetRowIndex: number;
  onDataSaved: (officialVideos: number, officialHours: number) => void;
}

const OfficialDataEntry: React.FC<OfficialDataEntryProps> = ({
  todayDateFormatted,
  trackedVideos,
  trackedHours,
  officialVideosInitial,
  officialHoursInitial,
  sheetRowIndex,
  onDataSaved
}) => {
  const { translations } = useLanguage(); // Use language context
  const [officialVideos, setOfficialVideos] = useState<string>(officialVideosInitial?.toString() || '');
  const [officialHours, setOfficialHours] = useState<string>(officialHoursInitial?.toString() || '');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setOfficialVideos(officialVideosInitial?.toString() || '');
    setOfficialHours(officialHoursInitial?.toString() || '');
  }, [officialVideosInitial, officialHoursInitial]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const videosNum = parseInt(officialVideos);
    const hoursNum = parseFloat(officialHours);

    // Use translated error messages
    if (isNaN(videosNum) || videosNum < 0 || isNaN(hoursNum) || hoursNum < 0) {
      toast.error(translations.officialData.saveError); // Generic error for now
      return;
    }

    if (sheetRowIndex < 2) {
        toast.error(translations.saveErrorRow);
        return;
    }

    setIsSaving(true);
    toast.loading(translations.officialData.saving, { id: 'saving-official' });

    const range = `K${sheetRowIndex}`;
    const valuesToSave = [[videosNum, hoursNum]];

    const success = await saveSheetData(range, valuesToSave);

    if (success) {
      toast.success(translations.officialData.saveSuccess, { id: 'saving-official' });
      onDataSaved(videosNum, hoursNum);
    } else {
      toast.error(translations.saveErrorSheet, { id: 'saving-official' });
    }
    setIsSaving(false);
  };

  const videosDiff = officialVideosInitial !== undefined ? trackedVideos - officialVideosInitial : undefined;
  const hoursDiff = officialHoursInitial !== undefined ? trackedHours - officialHoursInitial : undefined;

  const getDiffColor = (diff: number | undefined): string => {
    if (diff === undefined) return 'text-muted-foreground';
    return diff >= 0 ? 'text-green-500 dark:text-green-400' : 'text-red-500 dark:text-red-400';
  };

  return (
    <Card className="flex flex-col h-full"> {/* Use Card */} 
      <CardHeader>
        <CardTitle className="flex items-center text-lg">
          <FileSignature className="w-5 h-5 mr-2 rtl:ml-2 text-primary" />
          {translations.officialData.title} ({translations.officialData.date.replace('{date}', todayDateFormatted)})
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-grow">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="officialVideos">{translations.officialData.official} {translations.officialData.videos}</Label>
              <Input
                id="officialVideos"
                type="number"
                value={officialVideos}
                onChange={(e) => setOfficialVideos(e.target.value)}
                placeholder="e.g., 1950"
                min="0"
                required
                className="mt-1 font-mono"
              />
            </div>
            <div>
              <Label htmlFor="officialHours">{translations.officialData.official} {translations.officialData.hours}</Label>
              <Input
                id="officialHours"
                type="number"
                value={officialHours}
                onChange={(e) => setOfficialHours(e.target.value)}
                placeholder="e.g., 4.8"
                min="0"
                step="0.1"
                required
                className="mt-1 font-mono"
              />
            </div>
          </div>
          <Button type="submit" disabled={isSaving} className="w-full transition-transform active:scale-95">
            {isSaving ? <><Loader2 className="mr-2 rtl:ml-2 h-4 w-4 animate-spin" /> {translations.officialData.saving}</> : translations.officialData.saveButton}
          </Button>
        </form>

        {/* Comparison Section */} 
        {(officialVideosInitial !== undefined || officialHoursInitial !== undefined) && (
          <div className="mt-6 pt-4 border-t">
            <h4 className="text-md font-medium mb-2 text-center text-muted-foreground">{translations.officialData.tracked} vs. {translations.officialData.official}</h4>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-sm text-muted-foreground">{translations.officialData.videos}</p>
                <p className={`text-xl font-semibold font-mono ${getDiffColor(videosDiff)}`}>
                  {videosDiff !== undefined ? `${videosDiff >= 0 ? '+' : ''}${videosDiff}` : '--'}
                </p>
                <p className="text-xs text-muted-foreground/80">
                  ({trackedVideos} / {officialVideosInitial ?? '--'})
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{translations.officialData.hours}</p>
                <p className={`text-xl font-semibold font-mono ${getDiffColor(hoursDiff)}`}>
                  {hoursDiff !== undefined ? `${hoursDiff >= 0 ? '+' : ''}${hoursDiff.toFixed(1)}` : '--'}
                </p>
                 <p className="text-xs text-muted-foreground/80">
                  ({trackedHours.toFixed(1)} / {officialHoursInitial?.toFixed(1) ?? '--'})
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
      {/* Footer can be removed if not needed or used for other actions */}
      {/* <CardFooter className="border-t pt-4">
          <p className="text-xs text-muted-foreground text-center w-full">Ensure official data is accurate before saving.</p>
      </CardFooter> */}
    </Card>
  );
};

export default OfficialDataEntry;

