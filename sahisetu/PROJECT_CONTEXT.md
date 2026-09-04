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
   - `/dashboard?profile=aarohi` includes reversible contact-readiness confirmation and simulated reminders.

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
- Global English/Hindi language preference lives in `app/components/language-toggle.tsx` using local storage.
- Address Vision route: `app/api/pre-scrutiny/route.ts`. It must fail closed for unclear, wrong, duplicate, swapped, or unsafe documents.
- Address result and audit trail: `app/apply/page.tsx`.
- Shared explainable timeline: `app/components/explainable-audit-timeline.tsx`. It is used by the dashboard, address-result audit, and Application Rescue. Its fixed order is source record → extracted fields → citizen confirmation → readiness result → safe next action.
- Shared synthetic journey state: `app/lib/demo-journey-state.ts`. It stores only browser-local demo flags—Aarohi contact readiness and readiness packet, Rohan readiness packet, and Neha support summary—so `/triage` reflects completed citizen steps. It must never be described as a real citizen/RTO record.
- `resetDemoJourneyState()` clears only that synthetic progress. It is exposed as **Reset demo progress** on `/demo` and `/triage` for clean rehearsals.
- Prototype staff handoff: `/triage`, implemented in `app/triage/page.tsx`. A visible synthetic judge-credential gate precedes it (`rto.demo@sahisetu.example` / `SahiSetuRTO2026`); this is a session-only demo affordance, not actual authentication or access control. Once opened it shows Aarohi, Rohan, and Neha with the same evidence/timeline citizens see. It is explicitly view/triage only and must never receive approve/reject, payment, official-status, or live-RTO controls.
- Rohan’s two correct fixtures:
  - `public/demo-documents/rohan-mehta-synthetic-driving-licence-old-address.png`
  - `public/demo-documents/rohan-mehta-synthetic-address-proof.png`
- Every journey must visibly say it is a fictional/synthetic demo, not an official service.

## Next priorities

1. Add an explicit, non-fake `Continue through official service` handoff card to each completed journey.
2. Standardise Green / Amber / Red meaning across pages.
3. Add timestamped synthetic reports for Aarohi and Neha; the address journey already has an audit/report.
4. Thoroughly rehearse desktop/mobile, safety fixtures, and the two-minute video.

Keep a RAG chatbot as a stretch only after these core proof points. If built, it must use a small, cited official-source knowledge pack, declare uncertainty, avoid legal/official claims, and never action real services.
