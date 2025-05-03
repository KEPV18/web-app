
// Constants for default targets
const DAILY_VIDEO_TARGET = 3000;
const DAILY_HOUR_TARGET = 8;
const WEEKLY_VIDEO_TARGET_6_DAYS = 18000; // 3000 * 6
const WEEKLY_HOUR_TARGET_6_DAYS = 48; // 8 * 6

/**
 * Calculates the number of working days in the current month.
 * @param year The current year.
 * @param month The current month (0-indexed, 0 = January).
 * @param isVacationMode If true, considers 7 days a week as working days.
 * @param workDays Indices of working days (0=Sunday, 1=Monday... 6=Saturday). Default [0, 1, 2, 3, 4, 5] (Sun-Fri).
 * @returns The number of working days in the month.
 */
export const calculateWorkingDaysInMonth = (
    year: number,
    month: number,
    isVacationMode: boolean = false,
    workDays: number[] = [0, 1, 2, 3, 4, 5] // Default: Sunday to Friday
): number => {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    let workingDaysCount = 0;

    for (let day = 1; day <= daysInMonth; day++) {
        const currentDate = new Date(year, month, day);
        const dayOfWeek = currentDate.getDay(); // 0 = Sunday, 6 = Saturday

        if (isVacationMode || workDays.includes(dayOfWeek)) {
            workingDaysCount++;
        }
    }
    return workingDaysCount;
};

/**
 * Calculates daily, weekly, and monthly targets.
 * @param isVacationMode If true, adjusts weekly/monthly targets for 7 working days.
 * @returns Object containing daily, weekly, and monthly targets for videos and hours.
 */
export const calculateTargets = (isVacationMode: boolean = false) => {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth(); // 0-indexed

    const weeklyWorkDays = isVacationMode ? 7 : 6;
    const monthlyWorkingDays = calculateWorkingDaysInMonth(currentYear, currentMonth, isVacationMode);

    const weeklyVideoTarget = DAILY_VIDEO_TARGET * weeklyWorkDays;
    const weeklyHourTarget = DAILY_HOUR_TARGET * weeklyWorkDays;
    const monthlyVideoTarget = DAILY_VIDEO_TARGET * monthlyWorkingDays;
    const monthlyHourTarget = DAILY_HOUR_TARGET * monthlyWorkingDays;

    return {
        daily: {
            videos: DAILY_VIDEO_TARGET,
            hours: DAILY_HOUR_TARGET,
        },
        weekly: {
            videos: weeklyVideoTarget,
            hours: weeklyHourTarget,
        },
        monthly: {
            videos: monthlyVideoTarget,
            hours: monthlyHourTarget,
            workingDays: monthlyWorkingDays, // Include for reference
        },
    };
};

// Example usage:
// const targets = calculateTargets(false); // Standard schedule
// console.log(targets);
// const vacationTargets = calculateTargets(true); // Vacation mode
// console.log(vacationTargets);

