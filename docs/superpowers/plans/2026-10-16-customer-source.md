# Customer Source Preview Implementation Plan

> **For agentic workers:** Execute inline in this session. The user requests HTML review before release or cleanup.

**Goal:** Replace the appointment status control with customer source and provide an isolated HTML preview.

**Architecture:** Preserve historical status values internally, add customerSource to appointment form/serialization/export and map it to a nullable customer_source column. Generate a standalone local-only preview from the updated page using fictional data and a separate storage namespace.

**Tech Stack:** Static HTML, browser JavaScript, Supabase/Postgres migration, Node tests.

## Global Constraints

Source options: 美团 / 抖音 / 转介绍. Keep existing page design. Do not publish, run the migration, or delete production rows before preview review. Ask for the move date before preparing the final cleanup selection.

### Task 1: Capture source consistently

**Files:** Modify `index.html`; create `supabase-appointment-customer-source.sql`, `tests/customer-source.test.cjs`.

**Interfaces:** customerSource string in application records maps to customer_source string/null in Supabase. Existing status remains preserved via a hidden field. Blank source means unrecorded, never automatically attributed to a platform.

- [x] Write tests for form capture, status preservation, Supabase mapping in both directions, missing historical values, and export.
- [x] Replace only the status control; add source to existing card customer-type line and appointment export.
- [x] Prepare an additive SQL migration, without executing it.

### Task 2: Reviewable offline preview

**Files:** Generate standalone HTML inside the current chat's outputs folder; keep intermediate scripts in work/.

**Interfaces:** Preview uses local storage only, contains fictional customer data and no Supabase credentials or remote SDK. Open a sample appointment so the changed control is immediately reviewable.

- [x] Generate preview with current service list and fictional appointments.
- [x] Run regression and syntax checks.
- [x] Verify dropdown options and local save/reopen in browser, including mobile dimensions.
- [x] Open the deliverable in Codex and report that production cleanup and deployment are pending review.

## Verification

25 regression tests pass. Standalone preview syntax compiles, contains no production Supabase credentials or remote SDK, and saves customer source across reopen/reload at desktop and 390px mobile widths. User subsequently authorized clearing all appointments and members; cleanup is handled only after a verified local backup and keeps all configuration tables. No site release or schema migration performed.
