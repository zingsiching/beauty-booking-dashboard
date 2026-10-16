# Booking Sync Implementation Plan

> **For agentic workers:** Execute inline in this session under the user's authorized repair request.

**Goal:** Read all cloud bookings and refresh idle clients without replacing open forms.

**Architecture:** Keep the existing single HTML application and Supabase SDK. Replace unbounded appointment/member selects with stable, counted pagination; apply cloud data only after every page succeeds. Refresh visible, logged-in clients while no modal or save is active.

**Tech Stack:** Static HTML, JavaScript, Supabase JS, Node built-in test runner.

## Global Constraints

Keep the current design and data model. Do not alter production rows, SQL policies, or service definitions. Do not upload recovery backups automatically.

### Task 1: Complete cloud reads

**Files:** Modify `index.html`; create `tests/cloud-sync.test.cjs`.

**Interfaces:** `fetchAllSupabaseRows(createQuery)` returns `{data, error: null}`; query factories select with exact counts and stable ID tie breakers.

- [x] Add regression cases for 1,062 records, exact page boundaries, server caps below page size, empty results, and later-page failures.
- [x] Implement range pagination with 500-row requests, advance by actual rows returned, stop at the exact count, and throw on incomplete reads.
- [x] Use the helper for appointments and members; keep assignment of records after successful reads.

### Task 2: Refresh idle devices

**Files:** Modify `index.html`; extend `tests/cloud-sync.test.cjs`.

**Interfaces:** `refreshCloudIfIdle()` guards login, visibility, online state, open forms, and active read/write; `readCloudData({silent})` returns success and suppresses alerts only for background reads.

- [x] Add guard and background-error regression cases.
- [x] Refresh every 60 seconds and on visibility/focus/network restoration. Retry initial reads after failure; never replace an open form.
- [x] Run Node tests and syntax checks; compare the live old 1,000-row query with complete read-only paginated results.
- [x] Inspect the repaired page locally in the browser; report deployment state explicitly.

## Validation result

18 Node regression checks pass. Live old query returns 1,000 of 1,062 rows; rows after the cap include Body Spa. Local repaired UI reads 1,044 deduplicated appointments and 163 members, displays six October bookings versus zero in the deployed UI. No production records or schemas changed. Git push dry run is blocked by missing GitHub credentials.
