# Feature Opportunity Backlog

This document captures feature ideas that expand Lukely from a quiz calendar tool into a broader landing + lead capture platform. Each item is purposefully high level so we can break it down into tickets later.

## 1. Unified Campaign Lifecycle
- **Goal:** Run a single campaign across pre-launch landing, daily quiz, and wrap-up without manual handoff.
- **Why it matters:** Landing-only customers should still enjoy the same automation that quiz campaigns have.
- **Scope hints:** Add a lifecycle tab per calendar, status scheduling (pre-launch → live → post), automatic lead migration, and scheduled notifications when doors open or landings go live.

## 2. Block-Based Landing & Calendar Builder
- **Goal:** Replace the fixed `landingHero*` fields with a reusable block model used by both `/l/[slug]` and `/c/[slug]`.
- **Why it matters:** Marketing teams want to compose layouts (hero, countdown, testimonial, FAQ, gallery, highlight) without engineering effort.
- **Scope hints:** Visual editor with drag-and-drop, live preview, responsive variants, and the ability to save/share templates.

## 3. Funnel Analytics & Attribution
- **Goal:** Tie landing traffic to downstream quiz engagement and winners.
- **Why it matters:** The same campaign can now act as a pure lead magnet or an advent calendar; we need to show which channels work for each format.
- **Scope hints:** Persist UTM/referrer data from `CalendarView`, show multi-step funnel charts (views → leads → entries → wins), and expose per-channel ROI + device breakdowns in `app/dashboard/analytics`.

## 4. Automated Prize Fulfillment & CRM Handoff
- **Goal:** Close the loop after someone wins or signs up.
- **Why it matters:** Ops teams currently export CSVs from `LeadsManagement` and do everything manually.
- **Scope hints:** Winner auto-selection workflows, branded notification emails/SMS, fulfillment checklist, and connectors/webhooks to CRMs (HubSpot, Mailchimp, Zapier).

## 5. Advanced Lead Capture Toolkit
- **Goal:** Make landing-only customers successful without quizzes.
- **Why it matters:** They need richer forms and experiments to keep improving conversion.
- **Scope hints:** Multi-step or conditional forms, form A/B testing, dynamic rewards (e.g., show incentive tiers), and AI-generated copy suggestions using existing `BulkQuizGenerator` infrastructure as reference.
