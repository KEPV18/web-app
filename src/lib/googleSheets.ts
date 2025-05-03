const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_SHEETS_API_KEY;
const SPREADSHEET_ID = process.env.NEXT_PUBLIC_GOOGLE_SHEETS_SPREADSHEET_ID;
const SHEET_NAME = process.env.NEXT_PUBLIC_GOOGLE_SHEETS_SHEET_NAME;

if (!API_KEY || !SPREADSHEET_ID || !SHEET_NAME) {
  console.warn(
    "Google Sheets API Key, Spreadsheet ID, or Sheet Name is not configured in environment variables. Please set NEXT_PUBLIC_GOOGLE_SHEETS_API_KEY, NEXT_PUBLIC_GOOGLE_SHEETS_SPREADSHEET_ID, and NEXT_PUBLIC_GOOGLE_SHEETS_SHEET_NAME."
  );
  // Provide default values from user prompt for development/testing if needed, but env vars are preferred
}

const DEFAULT_API_KEY = "AIzaSyBIAZIlEL2OqSP4SGvUjcjZwL9p7aPVWuA"; // User provided
const DEFAULT_SPREADSHEET_ID = "1hFMpezojgAQWdlLdD88nesrxaKWeQ6az9YafKiZuqd4"; // User provided
const DEFAULT_SHEET_NAME = "5"; // User provided

const effectiveApiKey = API_KEY || DEFAULT_API_KEY;
const effectiveSpreadsheetId = SPREADSHEET_ID || DEFAULT_SPREADSHEET_ID;
const effectiveSheetName = SHEET_NAME || DEFAULT_SHEET_NAME;

/**
 * Loads data from the specified Google Sheet.
 * Assumes the sheet is public or accessible via the API key.
 * @param range - The A1 notation of the range to retrieve (e.g., 'A1:L31').
 * @returns Promise<any[][] | null> - A promise that resolves with the sheet data or null on error.
 */
export const loadSheetData = async (range: string): Promise<any[][] | null> => {
  if (!effectiveApiKey || !effectiveSpreadsheetId || !effectiveSheetName) {
    console.error("Google Sheets configuration is missing.");
    // TODO: Notify user via UI
    return null;
  }

  const url = `https://sheets.googleapis.com/v4/spreadsheets/${effectiveSpreadsheetId}/values/${effectiveSheetName}!${range}?key=${effectiveApiKey}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      const errorData = await response.json();
      console.error("Error fetching Google Sheet data:", response.status, errorData);
      // TODO: Notify user via UI
      return null;
    }
    const data = await response.json();
    return data.values || []; // Return values array or empty array if no data
  } catch (error) {
    console.error("Network error fetching Google Sheet data:", error);
    // TODO: Notify user via UI (Network error)
    return null;
  }
};

/**
 * Saves data to the specified Google Sheet.
 * NOTE: Writing data typically requires OAuth 2.0, not just an API key.
 * This function is a placeholder and likely needs modification for authentication.
 * @param range - The A1 notation of the range to write (e.g., 'A5').
 * @param values - The data to write (e.g., [['2024-05-03', 100, 1]]).
 * @returns Promise<boolean> - A promise that resolves with true on success, false otherwise.
 */
export const saveSheetData = async (range: string, values: any[][]): Promise<boolean> => {
   if (!effectiveApiKey || !effectiveSpreadsheetId || !effectiveSheetName) {
    console.error("Google Sheets configuration is missing.");
    // TODO: Notify user via UI
    return false;
  }

  // !!! IMPORTANT !!!
  // Google Sheets API v4 generally requires OAuth 2.0 for write operations (update/append).
  // Using only an API key is typically insufficient for modifying sheet data.
  // This implementation attempt might fail.
  // We may need to switch to OAuth or use a backend proxy.
  console.warn("Attempting to write to Google Sheets using only an API key. This might not be supported and may fail.");

  const url = `https://sheets.googleapis.com/v4/spreadsheets/${effectiveSpreadsheetId}/values/${effectiveSheetName}!${range}?valueInputOption=USER_ENTERED&key=${effectiveApiKey}`;

  try {
    const response = await fetch(url, {
      method: 'PUT', // Or 'POST' for append
      headers: {
        'Content-Type': 'application/json',
        // Authorization header with OAuth token would typically go here
      },
      body: JSON.stringify({ values }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Error writing to Google Sheet:", response.status, errorData);
      // TODO: Notify user via UI - Likely an authentication error
      // Suggest checking sheet permissions or using OAuth
      return false;
    }
    console.log("Data successfully written to Google Sheet (or request sent).");
    return true;
  } catch (error) {
    console.error("Network error writing to Google Sheet:", error);
    // TODO: Notify user via UI (Network error)
    return false;
  }
};

// Example usage (can be called from page.tsx)
/*
useEffect(() => {
  const fetchData = async () => {
    // Assuming we need data for May (31 days) + header row
    const data = await loadSheetData('A1:L32');
    if (data) {
      console.log('Loaded data:', data);
      // Process data and update state
    }
  };
  fetchData();

  // Example save (will likely fail without OAuth)
  // saveSheetData('B3', [['ManualSaveTest', 5]])

}, []);
*/

