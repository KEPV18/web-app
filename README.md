# Video Analytics Pro - User Guide (v2.0)

Welcome to Video Analytics Pro, your personal dashboard for tracking video production progress!

**Live Application URL:** [https://wyrhtojz.manus.space](https://wyrhtojz.manus.space)

## 🌟 Key Features

*   **Dual Tracking Modes:** Choose between Manual (add videos with a click) or Automatic (videos counted based on a set interval while the timer runs).
*   **Google Sheets Integration:** Reads historical data from your Google Sheet. *Note: Saving requires user-side OAuth 2.0 setup.*
*   **Progress Tracking:** Monitor daily, weekly, and monthly progress against customizable targets.
*   **Data Comparison:** Compare your manually logged data against official figures entered for the day.
*   **Interactive Charts:** Visualize weekly video production and speed (videos/minute) trends.
*   **Official Data Entry:** Input official video counts and hours worked for accurate comparison.
*   **Settings Panel:**
    *   **Data Export:** Export daily, weekly, or monthly data in CSV format.
    *   **Language Selection:** Switch between English (Default) and Arabic.
    *   **Desktop Notifications:** Enable/disable timer-related desktop notifications.
*   **Light/Dark Mode:** Toggle between light and dark themes.
*   **Responsive Design:** Works seamlessly on desktop and mobile browsers.
*   **Local Persistence:** Timer state and basic settings are saved locally for session continuity.
*   **Pending Sync:** Attempts to save data to Google Sheets are queued if the initial attempt fails (requires OAuth setup for success).

## 📊 Google Sheets Setup

1.  **Spreadsheet:** The app is configured to read from:
    *   Spreadsheet ID: `1hFMpezojgAQWdlLdD88nesrxaKWeQ6az9YafKiZuqd4`
    *   Sheet Name: `5`
2.  **API Key (Read-Only):** The app uses the provided API Key (`AIzaSyBIAZIlEL2OqSP4SGvUjcjZwL9p7aPVWuA`) for *reading* data. This key is embedded in the code for read access.
3.  **OAuth 2.0 (Required for Saving):**
    *   To enable *saving* data (timer progress, official data) to Google Sheets, you **must** set up OAuth 2.0 credentials (Client ID and Client Secret) via the Google Cloud Console.
    *   Follow Google's official documentation to create OAuth 2.0 credentials for a web application.
    *   **Crucially:** You will need to modify the `src/lib/googleSheets.ts` file to implement the Google Sign-In flow and use the obtained OAuth tokens to authorize write requests. The current `saveSheetData` function is a placeholder and will likely fail without proper OAuth implementation.
4.  **Data Structure:** Ensure your sheet follows this structure:
    *   Column A: Date (MM/DD format, e.g., 5/1, 5/2)
    *   Column B: Videos Logged (Number - Tracked by timer/manual add)
    *   Column C: Hours Logged (Number - Tracked by timer)
    *   ... (Other columns)
    *   Column K: Videos Official (Number - Manually entered official count)
    *   Column L: Hours Official (Number - Manually entered official hours)

## 🚀 Getting Started

1.  **Open the App:** Visit [https://wyrhtojz.manus.space](https://wyrhtojz.manus.space).
2.  **Language:** Select your preferred language (English/Arabic) from the Settings panel.
3.  **Timer:**
    *   Click "Start" to begin tracking time.
    *   Click "Pause" to pause.
    *   Click "Resume" to continue.
    *   Click "Reset" to stop the timer, save the tracked data (attempting Google Sheets sync), and reset the timer/logged videos for the session.
4.  **Video Counter:**
    *   **Manual Mode (Default):** Click the "+ Add Video" button each time you complete a video.
    *   **Automatic Mode:** Toggle the "Auto Mode" switch on. Select the interval (10s, 15s, 20s). Videos will be automatically added based on the interval while the timer is running.
5.  **Official Data:** Enter the official video count and hours worked for the current day in the "Official Data Entry" section and click "Save Official Data". This attempts to save to columns K and L in your Google Sheet (requires OAuth setup).
6.  **Progress Bars:** Monitor your progress towards daily, weekly, and monthly targets. Toggle "Vacation Mode" to adjust weekly targets (5 vs 6 working days).
7.  **Charts:** View charts comparing logged vs. official videos and speed for the current week (Sunday-Saturday).
8.  **Settings:**
    *   Export data as CSV.
    *   Switch language.
    *   Manage desktop notification preferences.

## 💡 Tips

*   **OAuth is Key:** Remember that saving data to Google Sheets *requires* you to implement the OAuth 2.0 flow.
*   **Data Priority:** Progress calculations prioritize official data (Columns K/L) if available for a given day. If official data is missing, it falls back to logged data (Columns B/C).
*   **Notifications:** Ensure you grant browser permission for desktop notifications if you want timer reminders.
*   **Local Storage:** Your current timer session (seconds, videos logged) and basic settings (dark mode, vacation mode, language) are saved in your browser's local storage.

Enjoy tracking your video production!
