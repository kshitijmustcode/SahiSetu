# SahiSetu — Continuation Context

Use this file to resume implementation if the original conversation is unavailable.

## Product position

SahiSetu is a **synthetic-data-only Build What Moves India Phase 2 prototype**. It is an independent readiness and recovery layer: Parivahan helps citizens transact; SahiSetu helps them become ready before the transaction and recover when something goes wrong. It must never present itself as Parivahan, an RTO, an official decision-maker, or a real application/payment service.

The target story is a move from a narrow P2/P3 address checker to P0 readiness and recovery: address change, imminent DL renewal, communication readiness, and opaque application/payment states.

## Repository and commands

- App: `sahisetu/` (Next.js 16, React, TypeScript, Tailwind)
- Product README: `../README.md`
- Video script and sourced statistics: `../VIDEO_README.md`
- Roadmap: `TODOS.md`
- Before changing Next.js code, read `AGENTS.md` and the relevant guide under `node_modules/next/dist/docs/`.
- Verify with:

  ```bash
  npm run format:check
  npm run lint
  npx next build --webpack
  ```

`OPENAI_API_KEY` in `.env.local` enables Vision. Never expose its value. Without it, only the built-in synthetic demo fallback is allowed.

## Implemented demo journeys

1. **Aarohi Sharma — renewal readiness**
   - Synthetic licence expires 12 September 2026.
   - `app/lib/dl-readiness.ts` calculates the current India-date countdown and readiness state.
   - `/dashboard` includes reversible contact-readiness confirmation, simulated reminders, and `app/components/form-1a-medical-shield.tsx`.
   - The Form 1A Shield uses an age-42 demo certificate. It checks only visible practitioner registration number, seal/stamp, signature, and medical-fitness declaration; the complete path sets `aarohiMedicalReady` in browser-local state and prints a doctor confirmation note. It never makes a medical, eligibility, or licence decision. The verified official source is `https://parivahan.gov.in/sites/default/files/DownloadForm/cmvr/FORM-1A.pdf`.
   - It is deliberately Aarohi-only; Rohan and Neha enter their dedicated journeys directly.

2. **Rohan Mehta — moved-address readiness**
   - Entry: `/apply?demo=rohan`.
   - Current licence: old Koramangala address (expected).
   - New-address proof: `44 Lakeview Road, Indiranagar, Bengaluru, Karnataka 560038`.
   - Vision extraction must prefill **exactly** `Lakeview Road`.
   - The citizen may manually edit it to `Lake View Road`; only then should the comparison show a minor mismatch and clarification-note path. Do not claim Vision caused this difference.
   - The old licence must never be treated as a mismatch against the new-address proof; the proof is the source for the address-change application.

3. **Neha Verma — Application Rescue**
   - `/rescue?case=payment-pending` explains evidence retention and safe next actions. It must never direct the citizen to pay again.
   - `/rescue?case=under-scrutiny` is Rohan’s rescue route; `upload-pending` is Aarohi’s.

## Important UI and implementation choices

- Demo profile selector: `/demo`.
- Navigation is intentionally separated: `/demo` contains only Aarohi, Rohan, and Neha; `/help` is a neutral explainer that never opens a citizen case; `/triage` is a separate, judge-facing staff demo reachable from a small homepage link.
- Global English/Hindi language preference lives in `app/components/language-toggle.tsx` using local storage.
- Address Vision route: `app/api/pre-scrutiny/route.ts`. It must fail closed for unclear, wrong, duplicate, swapped, or unsafe documents.
- Address result and audit trail: `app/apply/page.tsx`.
- Shared explainable timeline: `app/components/explainable-audit-timeline.tsx`. It is used by the dashboard, address-result audit, and Application Rescue. Its fixed order is source record → extracted fields → citizen confirmation → readiness result → safe next action.
- Shared synthetic journey state: `app/lib/demo-journey-state.ts`. It stores only browser-local demo flags—Aarohi contact readiness, medical pre-check, and readiness packet; Rohan readiness packet; and Neha support summary—plus the synthetic address-review snapshot (proof wording, final citizen text, minor-difference flag, mock clarification signature). This lets `/triage` and `/handoff` reflect completed citizen steps. It must never be described as a real citizen/RTO record.
- `resetDemoJourneyState()` clears only that synthetic progress. It is exposed as **Reset demo progress** on `/demo` and `/triage` for clean rehearsals.
- Prototype staff handoff: `/triage`, implemented in `app/triage/page.tsx`. A visible synthetic judge-credential gate precedes it (`rto.demo@sahisetu.example` / `SahiSetuRTO2026`); this is a session-only demo affordance, not actual authentication or access control. Once opened it shows Aarohi, Rohan, and Neha with the same evidence/timeline citizens see. It is explicitly view/triage only and must never receive approve/reject, payment, official-status, or live-RTO controls.
- Rohan’s two correct fixtures:
  - `public/demo-documents/rohan-mehta-synthetic-driving-licence-old-address.png`
  - `public/demo-documents/rohan-mehta-synthetic-address-proof.png`
- Every journey must retain a clear demo/not-official boundary at the point where a viewer could mistake it for a real upload, record, decision, or handoff.
- Keep the UI copy natural: use “demo” where context needs it and reserve explicit “not official” wording for risky boundaries (upload, triage gate, printouts, and footer). Do not reintroduce “synthetic” as a repeated adjective in ordinary product copy.

## Next priorities

There are about **1.5 days** remaining. Do not add broad transport services. The goal is a polished, reviewable proof of readiness and recovery.

1. **Handoff pack completed.** `/handoff?case=aarohi|rohan|neha` is a dedicated, printable synthetic pack. It gates unfinished browser-local demo journeys and includes timestamp, evidence, finding, remaining boundary, and safe official next action. It adds a case-specific RTO Day Pack plus a separate print-only physical-file cover sheet: Aarohi's renewal folder, Rohan's DL address-change folder, and Neha's payment-support folder. Address packs include proof wording, final citizen text, and mock clarification-signature state. It never says SahiSetu submitted or approved anything.
2. **Form 1A Medical Readiness Shield is implemented.** Aarohi's renewal dashboard presents an age-42 demo certificate and checks four visible items: practitioner registration number, seal/stamp, signature, and medical-fitness declaration. A complete pre-check updates shared browser-only dashboard, handoff, and triage state; missing fields generate a printable doctor confirmation note. It must always say Form 1A may apply for age 40+/transport cases only as verified by the relevant official service, and it must never make a medical, eligibility, or licence decision.
3. **Guided Help Centre is implemented.** `/help` has common-problem question cards plus typed questions backed by `app/lib/guided-help-knowledge.ts` and `/api/guided-help`. A suggested card fills the question box; it never opens Aarohi, Rohan, or Neha's case-specific demo journey. Retrieval is deterministic over a small server-held Parivahan source pack; the OpenAI answer must use only that context, `store: false`, and show its sources. It blocks obvious long numeric identifiers and email addresses, has a small in-memory rate limit, and never does live web search. Its Status Decoder runs entirely in the browser for five curated patterns, keeps typed text out of storage/network requests, and refuses to infer a payment result, official timeline, application result, or unknown sub-code. Test both with the configured API key before filming.
4. The UI was simplified after the Help Centre: `/demo` is citizen-only, the homepage has two primary citizen actions, `/dashboard` is Aarohi-only, repeated generic explanations were removed, and the Rescue evidence card no longer stretches to match the right column. Keep this hierarchy; do not re-add cross-links into fictional cases.
5. Complete quality proof: Vision safety cases, Guided Help Centre negative cases, Form 1A complete/missing-field variants, desktop/mobile, clean-incognito rehearsal, production deployment, and the two-minute video.
6. Before deployment, standardise Green/Amber/Red/Blue wording and verify the already-added baseline security headers on the HTTPS deployment. An optional one-time consented synthetic email reminder is lower priority than testing, deployment, and the video.

## Security and privacy boundary

- The visible `/triage` password is a session-only UX gate, **not authentication**. Do not describe it as secure access control.
- Baseline headers are applied globally: a self-only Content Security Policy, anti-framing, `X-Content-Type-Options: nosniff`, strict referrer policy, restrictive browser permissions, cross-origin protections, and HSTS. The CSP permits `unsafe-eval` only in local Next/React development so its debugging overlay works; production omits it. Re-check the strict production headers on the deployed HTTPS URL.
- Keep provider/API keys server-only and out of source control, screenshots, browser code, and synthetic documents.
- Browser-local demo state is only a rehearsal aid. Keep **Reset demo progress** available and do not treat it as a citizen/RTO record.
- Guided Help Centre questions are not written to browser storage or a database. Its in-memory rate-limit bucket is ephemeral and must not be presented as a user record.
- Status Decoder text is never sent, stored, or used to access an official record. It is a curated wording explainer, not a real status lookup.
- If real data is ever introduced after the hackathon, require actual server-side authentication, role-based access control, audit logs, encryption, retention/deletion controls, and human escalation.

## Current commit baseline

The completed Phase 2 work was separated into seven commits:

1. `6320dd2` — Prettier formatting checks
2. `1a67b85` — Phase 2 landing experience
3. `ed0fae3` — citizen demo profiles and renewal readiness
4. `04f46aa` — address-change document readiness
5. `22ba90b` — Application Rescue
6. `19716e5` — prototype RTO triage demo
7. `19724aa` — Phase 2 documentation and roadmap

Additional completed commit:

8. `d690cda` — source-grounded Guided Help Centre

The current worktree is intentionally uncommitted after `d690cda`. It includes navigation/redundancy cleanup; Status Decoder; baseline deployment headers; RTO Day Packs; Form 1A Shield; revised user-facing demo wording; and synchronized documentation. The main changed files include `app/page.tsx`, `app/dashboard/page.tsx`, `app/rescue/page.tsx`, `app/handoff/page.tsx`, `app/help/page.tsx`, `app/triage/page.tsx`, `app/components/form-1a-medical-shield.tsx`, `app/globals.css`, `app/lib/demo-journey-state.ts`, and `next.config.ts`.
