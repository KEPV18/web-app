
'use client';

import React from 'react';
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { exportDailyCSV, exportWeeklyCSV, exportMonthlyCSV } from '@/lib/export';
import { DailyData } from "@/app/page";
import { Download, Languages, Bell, BellOff, AlertTriangle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext'; // Import useLanguage

interface SettingsProps {
  sheetData: DailyData[];
  notificationsEnabled: boolean;
  browserNotificationPermission: NotificationPermission;
  onToggleNotifications: () => void;
  onRequestNotificationPermission: () => Promise<boolean>;
  // Language props are now handled by context
}

const Settings: React.FC<SettingsProps> = ({
  sheetData,
  notificationsEnabled,
  browserNotificationPermission,
  onToggleNotifications,
  onRequestNotificationPermission,
}) => {
  const { language, setLanguage, translations } = useLanguage(); // Use language context

  const handleExportDaily = () => {
    exportDailyCSV(sheetData, language); // Pass language for potential date formatting
  };

  const handleExportWeekly = () => {
    exportWeeklyCSV(sheetData, language);
  };

  const handleExportMonthly = () => {
    exportMonthlyCSV(sheetData, language);
  };

  const handleNotificationClick = () => {
    if (browserNotificationPermission === 'default') {
      onRequestNotificationPermission();
    } else {
      onToggleNotifications();
    }
  };

  const getNotificationStatusText = () => {
    if (browserNotificationPermission === 'denied') {
      return translations.settings.notificationStatusBlocked;
    }
    if (browserNotificationPermission === 'default') {
      return translations.settings.notificationStatusClickToEnable;
    }
    return notificationsEnabled ? translations.settings.notificationStatusEnabled : translations.settings.notificationStatusDisabled;
  };

  const handleLanguageChange = (value: string) => {
    if (value === 'en' || value === 'ar') {
      setLanguage(value);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-medium mb-4 flex items-center">
        <i className="fas fa-cog mr-2 rtl:ml-2 text-primary"></i>{translations.settings.title}
      </h3>

      {/* Export Section */}
      <div className="mb-6">
        <h4 className="text-md font-semibold mb-3 flex items-center">
          <Download className="w-4 h-4 mr-2 rtl:ml-2" /> {translations.settings.exportTitle}
        </h4>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={handleExportDaily} disabled={sheetData.length === 0}>
            {translations.settings.exportDaily}
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportWeekly} disabled={sheetData.length === 0}>
            {translations.settings.exportWeekly}
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportMonthly} disabled={sheetData.length === 0}>
            {translations.settings.exportMonthly}
          </Button>
        </div>
      </div>

      {/* Language Section */}
      <div className="mb-6">
        <h4 className="text-md font-semibold mb-3 flex items-center">
          <Languages className="w-4 h-4 mr-2 rtl:ml-2" /> {translations.settings.languageTitle}
        </h4>
        <Select onValueChange={handleLanguageChange} value={language}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={translations.settings.selectLanguage} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="en">{translations.settings.english}</SelectItem>
            <SelectItem value="ar">{translations.settings.arabic}</SelectItem>
          </SelectContent>
        </Select>
        {/* <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{translations.settings.languageSoon}</p> */}
      </div>

      {/* Notifications Section */}
      <div>
        <h4 className="text-md font-semibold mb-3 flex items-center">
          {browserNotificationPermission === 'denied' ? <AlertTriangle className="w-4 h-4 mr-2 rtl:ml-2 text-red-500" /> : (notificationsEnabled && browserNotificationPermission === 'granted' ? <Bell className="w-4 h-4 mr-2 rtl:ml-2" /> : <BellOff className="w-4 h-4 mr-2 rtl:ml-2 text-gray-500" />)}
          {translations.settings.notificationsTitle}
        </h4>
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          <Switch
            id="notification-switch"
            checked={notificationsEnabled && browserNotificationPermission === 'granted'}
            onCheckedChange={handleNotificationClick}
            disabled={browserNotificationPermission === 'denied'}
          />
          <Label htmlFor="notification-switch" className={`text-sm ${browserNotificationPermission === 'denied' ? 'text-red-500' : ''}`}>
            {getNotificationStatusText()}
          </Label>
        </div>
         {browserNotificationPermission === 'denied' && (
             <p className="text-xs text-red-500 mt-1">{translations.settings.notificationEnableInBrowser}</p>
         )}
      </div>

    </div>
  );
};

export default Settings;

