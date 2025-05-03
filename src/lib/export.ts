import { DailyData } from "@/app/page"; // Assuming DailyData is exported from page.tsx or a types file

// Helper to get the week number for a given date
const getWeekNumber = (d: Date): number => {
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay()||7)); // Adjust to Thursday
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
    const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1)/7);
    return weekNo;
}

// Function to get prioritized data for a day
const getPrioritizedData = (dayData: DailyData | undefined) => {
    if (!dayData) return { videos: 0, hours: 0 };
    const videos = (dayData.videosOfficial !== undefined && !isNaN(dayData.videosOfficial)) ? dayData.videosOfficial : (dayData.videosLogged || 0);
    const hours = (dayData.hoursOfficial !== undefined && !isNaN(dayData.hoursOfficial)) ? dayData.hoursOfficial : (dayData.hoursLogged || 0);
    return { videos, hours };
};

// Function to trigger CSV download
const downloadCSV = (csvContent: string, filename: string) => {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    if (link.download !== undefined) { // Feature detection
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
};

// Generate Daily CSV
export const exportDailyCSV = (sheetData: DailyData[]) => {
    const headers = ["Date", "Videos_Logged", "Hours_Logged", "Videos_Official", "Hours_Official", "Videos_Used", "Hours_Used"];
    const rows = sheetData.map(day => {
        const { videos: videosUsed, hours: hoursUsed } = getPrioritizedData(day);
        return [
            day.date || '',
            day.videosLogged ?? '',
            day.hoursLogged ?? '',
            day.videosOfficial ?? '',
            day.hoursOfficial ?? '',
            videosUsed,
            hoursUsed.toFixed(2)
        ].join(',');
    });
    const csvContent = [headers.join(','), ...rows].join('\n');
    downloadCSV(csvContent, 'daily_report.csv');
};

// Generate Weekly CSV
export const exportWeeklyCSV = (sheetData: DailyData[]) => {
    const weeklyData: { [week: string]: { videos: number; hours: number; days: number } } = {};
    const currentYear = new Date().getFullYear();

    sheetData.forEach(day => {
        const [month, dayNum] = (day.date || '').split('/').map(Number);
        if (!month || !dayNum) return;
        const date = new Date(currentYear, month - 1, dayNum);
        if (isNaN(date.getTime())) return;

        const weekKey = `${currentYear}-W${getWeekNumber(date).toString().padStart(2, '0')}`;
        if (!weeklyData[weekKey]) {
            weeklyData[weekKey] = { videos: 0, hours: 0, days: 0 };
        }
        const { videos, hours } = getPrioritizedData(day);
        weeklyData[weekKey].videos += videos;
        weeklyData[weekKey].hours += hours;
        if (videos > 0 || hours > 0) { // Count day if there was activity
             weeklyData[weekKey].days += 1;
        }
    });

    const headers = ["Week", "Total_Videos", "Total_Hours", "Avg_Videos_Per_Day", "Avg_Hours_Per_Day"];
    const rows = Object.entries(weeklyData).map(([week, data]) => {
        const avgVideos = data.days > 0 ? (data.videos / data.days).toFixed(1) : '0.0';
        const avgHours = data.days > 0 ? (data.hours / data.days).toFixed(2) : '0.00';
        return [
            week,
            data.videos,
            data.hours.toFixed(2),
            avgVideos,
            avgHours
        ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    downloadCSV(csvContent, 'weekly_report.csv');
};

// Generate Monthly CSV
export const exportMonthlyCSV = (sheetData: DailyData[]) => {
    const monthlyData: { [month: string]: { videos: number; hours: number; days: number } } = {};
    const currentYear = new Date().getFullYear();

    sheetData.forEach(day => {
        const [monthNum, dayNum] = (day.date || '').split('/').map(Number);
        if (!monthNum || !dayNum) return;
        const date = new Date(currentYear, monthNum - 1, dayNum);
        if (isNaN(date.getTime())) return;

        const monthKey = `${currentYear}-${monthNum.toString().padStart(2, '0')}`;
        if (!monthlyData[monthKey]) {
            monthlyData[monthKey] = { videos: 0, hours: 0, days: 0 };
        }
        const { videos, hours } = getPrioritizedData(day);
        monthlyData[monthKey].videos += videos;
        monthlyData[monthKey].hours += hours;
         if (videos > 0 || hours > 0) { // Count day if there was activity
             monthlyData[monthKey].days += 1;
        }
    });

    const headers = ["Month", "Total_Videos", "Total_Hours", "Avg_Videos_Per_Day", "Avg_Hours_Per_Day"];
    const rows = Object.entries(monthlyData).map(([month, data]) => {
        const avgVideos = data.days > 0 ? (data.videos / data.days).toFixed(1) : '0.0';
        const avgHours = data.days > 0 ? (data.hours / data.days).toFixed(2) : '0.00';
        return [
            month,
            data.videos,
            data.hours.toFixed(2),
            avgVideos,
            avgHours
        ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    downloadCSV(csvContent, 'monthly_report.csv');
};
