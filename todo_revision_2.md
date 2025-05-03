# Video Analytics Pro - ToDo List (Revision 2)

## Phase 1: Core Fixes & Language (Steps 002-004)
- [x] 002.1: Modify `src/app/page.tsx` text content to English.
- [x] 002.2: Modify `src/components/Header.tsx` text content to English.
- [x] 002.3: Modify `src/components/Timer.tsx` text content to English.
- [x] 002.4: Modify `src/components/Counter.tsx` text content to English.
- [x] 002.5: Modify `src/components/ProgressBars.tsx` text content to English.
- [x] 002.6: Modify `src/components/Charts.tsx` text content to English.
- [x] 002.7: Modify `src/components/OfficialDataEntry.tsx` text content to English.
- [x] 002.8: Modify notification text (toast, desktop) to English in `page.tsx`.
- [ ] 002.9: Update `src/app/layout.tsx` lang attribute to "en" and dir to "ltr".
- [x] 003.1: Refactor dark mode toggle logic in `Header.tsx` and `page.tsx` to ensure it works correctly.
- [x] 003.2: Verify notification permission request logic and potentially add a manual trigger/status indicator.
- [x] 004.1: Debug and fix the automatic video counting logic in `Counter.tsx` based on timer progress and selected interval.
- [x] 004.2: Ensure automatic counter updates UI correctly.

## Phase 2: Data Logic & Visualization (Steps 005-007)- [x] 005.1: Modify `currentProgress` calculation in `page.tsx` to prioritize official data (K/L) and fallback to logged data (B/C).
- [x] 005.2: Update `ProgressBars.tsx` to correctly display data based on the new logic.
- [x] 006.1: Ensure weekly calculation uses the fallback logic correctly.
- [x] 006.2: Ensure monthly calculation uses the fallback logic correctly.allback.
- [ ] 006.3: Review vacation mode logic impact on target display vs. actual progress aggregation (confirm understanding or implement based on user intent).
- [x] 007.1: Update speed chart in `Charts.tsx` to calculate and display videos/minute.
- [x] 007.2: Add new comparison charts (logged vs. official for videos, hours, speed) to `Charts.tsx` or a new component.

## Phase 3: Features & UI (Steps 008-010)
- [x] 008.1: Implement CSV export functionality (daily, weekly, monthly) using `sheetData`.
- [x] 008.2: Create `src/components/Settings.tsx` panel.
- [x] 008.3: Integrate Settings panel into `page.tsx` and ensure persistence.other potential settings (e.g., API key input, target customization - consider complexity/budget).
- [ ] 009.1: Integrate language state with all text elements using a context or prop drilling.
- [ ] 009.2: Add toast notifications for Timer actions (start, pause, reset) in `Timer.tsx` or `page.tsx`.
- [ ] 010.1: Redesign UI elements (buttons, cards, layout) for a modern look (e.g., using Tailwind/shadcn more effectively).
- [ ] 010.2: Add subtle animations or transitions.
- [ ] 010.3: Review color palettes for light/dark modes.

## Phase 4: Finalization (Steps 011-012)
- [ ] 011.1: Test all features thoroughly in English.
- [ ] 011.2: Test all features thoroughly in Arabic after implementing language switching.
- [ ] 011.3: Test responsiveness on different screen sizes.
- [ ] 011.4: Update `README.md` and `DEVELOPER_NOTES.md` with changes.
- [ ] 012.1: Deploy the updated application.
- [ ] 012.2: Notify user with the new link and summary of changes.

