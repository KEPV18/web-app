# Video Analytics Pro - ToDo List (Revision 4)

## Phase 1: Core Bug Fixes (Steps 001-002)
- [x] 001: Fix automatic mode counter logic in `Counter.tsx` to accurately count videos based on elapsed time and interval.
- [ ] 002: Fix dark mode toggle consistency in `Header.tsx` and ensure theme applies correctly.

## Phase 2: Feature Implementation (Steps 003-007)
- [x] 003: Hide speed display in `Counter.tsx` when automatic mode is active.
- [x] 004: Add 25s interval option and a custom interval input to automatic mode in `Counter.tsx`.
- [x] 005: Implement manual time entry feature (likely needs a new component and integration in `page.tsx`).
- [x] 006: Implement goals customization panel (new component `GoalsSettings.tsx`?) and integrate with `ProgressBars.tsx`.
- [x] 007: Implement advanced analytics (average video time, peak times) - display in a new component?
- [ ] 008: Implement optional audio notifications for timer events and auto-video add (integrate with `Timer.tsx`, `Counter.tsx`, and `Settings.tsx`).

## Phase 3: UI/UX Refinements (Steps 009-012)
- [ ] 009: Refactor charts (`Charts.tsx`) to separate sections (Videos, Hours, Speed) and expand visual space.
- [ ] 010: Ensure weekly charts for videos, hours, and speed are implemented correctly in `Charts.tsx`.
- [ ] 011: Clarify and highlight the data comparison section in `OfficialDataEntry.tsx`.
- [ ] 012: Redesign interface colors (`globals.css`, components) to align with a Google Sheets-inspired theme.

## Phase 4: Final Validation & Deployment (Steps 013-014)
- [ ] 013: Validate and test all new features and fixes thoroughly in both English and Arabic.
- [ ] 014: Deploy the final application and report the permanent URL and updated files to the user.
