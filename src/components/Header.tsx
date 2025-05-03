
import React from 'react';
import { Moon, Sun, Bell, BellOff } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useLanguage } from '@/contexts/LanguageContext';

interface HeaderProps {
  darkMode: boolean;
  notificationsEnabled: boolean;
  browserNotificationPermission: NotificationPermission;
  onToggleDarkMode: () => void;
  onToggleNotifications: () => void;
  onRequestNotificationPermission: () => Promise<boolean>;
}

const Header: React.FC<HeaderProps> = ({
  darkMode,
  notificationsEnabled,
  browserNotificationPermission,
  onToggleDarkMode,
  onToggleNotifications,
  onRequestNotificationPermission
}) => {
  const { translations } = useLanguage();

  const handleNotificationClick = () => {
    if (browserNotificationPermission === 'default') {
      onRequestNotificationPermission();
    } else {
      onToggleNotifications();
    }
  };

  const getNotificationIcon = () => {
    if (browserNotificationPermission === 'denied') {
      return <BellOff className="w-5 h-5 text-destructive" />;
    }
    if (browserNotificationPermission === 'default') {
      return <Bell className="w-5 h-5 text-yellow-500" />;
    }
    return notificationsEnabled ? <Bell className="w-5 h-5 text-primary" /> : <BellOff className="w-5 h-5 text-muted-foreground" />;
  };

  const getNotificationTooltip = () => {
    if (browserNotificationPermission === 'denied') {
      return translations.settings.notificationStatusBlocked;
    }
    if (browserNotificationPermission === 'default') {
      return translations.settings.notificationStatusClickToEnable;
    }
    return notificationsEnabled ? translations.settings.notificationStatusDisabled : translations.settings.notificationStatusEnabled;
  };

  return (
    <header className="bg-card text-card-foreground p-4 shadow-md flex justify-between items-center border-b">
      <div className="flex items-center space-x-3 rtl:space-x-reverse">
        {/* Replace Font Awesome with Lucide icon or SVG for consistency */} 
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7 text-primary">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
        <h1 className="text-xl font-bold tracking-tight">{translations.header.title}</h1>
      </div>
      <div className="flex items-center space-x-2 rtl:space-x-reverse">
        <TooltipProvider delayDuration={100}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label={darkMode ? translations.header.lightMode : translations.header.darkMode}
                onClick={onToggleDarkMode}
                className="rounded-full"
              >
                {darkMode ? <Sun className="w-5 h-5 transition-transform duration-300 rotate-0 scale-100 dark:-rotate-90 dark:scale-0" /> : <Moon className="w-5 h-5 transition-transform duration-300 rotate-90 scale-0 dark:rotate-0 dark:scale-100" />}
                 <span className="sr-only">{darkMode ? translations.header.lightMode : translations.header.darkMode}</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{darkMode ? translations.header.lightMode : translations.header.darkMode}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider delayDuration={100}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label={translations.header.notifications}
                onClick={handleNotificationClick}
                className="rounded-full"
              >
                {getNotificationIcon()}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{getNotificationTooltip()}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </header>
  );
};

export default Header;

