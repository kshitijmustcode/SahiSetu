# SahiSetu — Phase 2 TODOs

## Product story

SahiSetu is a synthetic-data-only, proactive support layer for transport services. It helps a citizen become ready before a licence or application problem becomes urgent, then explains a safe next action. It does not replace Parivahan, an RTO, a payment provider, or an official decision-maker.

## Completed

- [x] Working address-change document-readiness journey with fail-closed checks.
- [x] Synthetic demo-profile selector.
- [x] **Aarohi:** fictional licence-expiry / renewal-readiness dashboard.
- [x] **Rohan:** fictional moved-address journey. Vision reads `Lakeview Road` from his new-address proof; the citizen can manually change it to `Lake View Road` to demonstrate a minor, reviewable application-entry difference.
- [x] **Application Rescue:** fictional payment-pending, `Under Scrutiny`, and `Document Upload Pending` recovery journeys.
- [x] Simulated reminder preferences for Aarohi.
- [x] Reversible contact-readiness confirmation, so a demo user can undo an accidental click.
- [x] Evidence checklist and simulated support summary for Neha.
- [x] Phase 2 homepage story and safe-prototype boundaries.
- [x] Simplified entry model: `/demo` contains only the three citizen cases; `/dashboard` is Aarohi's DL Guardian only; Guided Help Centre and the RTO demo are separate entry points.
- [x] Removed repeated explanatory panels where the audit trail, evidence checklist, or safe-next-action panel already carries the same information.
- [x] Persistent English / Hindi switch across the homepage, demo selector, dashboard, document check, and Application Rescue.
- [x] Reduced repetitive “synthetic” wording in the user interface. Strong demo/not-official boundaries remain at document upload, triage access, printable handoff notes, and page footers.
- [x] Prettier, ESLint, and production-build checks.

## P0 — Complete the core journeys

- [x] **Verify Rohan end to end with OpenAI Vision.** His licence correctly shows the old Koramangala address and the proof shows the new Indiranagar address. The extracted default matches the proof (`Lakeview Road`); only a citizen's manual application edit to `Lake View Road` triggers the clarification-note step.
- [x] **Derive Aarohi's renewal status from the visible expiry field on her synthetic licence.** The dashboard calculates `safe`, `renew soon`, `urgent`, or `expired` against the current India date.
- [x] **Make the renewal checklist responsive to that result.** The detected expiry date and renewal action update the synthetic checklist and readiness count.
- [x] **Form 1A Medical Readiness Shield.** Aarohi's age-42 demo lets a citizen run a visible-field pre-check for practitioner registration number, seal/stamp, signature, and medical-fitness declaration. It creates a print-only doctor confirmation note and says Form 1A applicability must be verified in the relevant official service; it never makes a medical, eligibility, or licence decision.
- [x] **Reuse an explainable audit timeline across Aarohi, Rohan, and Neha.** It shows the source record, extracted fields, citizen confirmation, readiness result, and safe next action for each synthetic case.
- [x] Give every completed journey an explicit, non-fake `Continue through official service` handoff card.
- [x] **Create a printable synthetic handoff pack for every completed journey.** `/handoff` gives Aarohi, Rohan, and Neha a timestamped, PDF-ready summary of evidence reviewed, citizen confirmation, unresolved risks, and the relevant official next action. It also includes a case-specific RTO Day Pack and a print-only physical-file cover sheet. It never implies that SahiSetu submitted or approved anything.

## P1 — Make explanations reviewable

- [x] Create timestamped synthetic reports for Aarohi and Neha, matching the existing address-change report quality. The shared handoff pack now covers Aarohi, Rohan, and Neha; it also retains the reviewed proof wording, final citizen edit, and mock clarification signature for the address journeys.
- [ ] Standardise Green / Amber / Red wording, meaning, and visual treatment across every page.
- [ ] Add a concise **What changed / why it matters** panel to each result. It should distinguish extracted facts, citizen edits, unresolved risks, and safe next action.
- [ ] Add an assisted-service preparation card for unresolved cases: evidence to carry, what to ask, and the relevant official support route. It must not claim an RTO appointment or decision.
- [x] **Guided Help Centre.** `/help` lets a citizen choose one of five common questions or type their own, then gives a bounded answer retrieved from a small, server-held official Parivahan source pack. It shows source links, declines unsupported questions, blocks obvious personal identifiers, uses non-persistent Responses calls, and never opens a fictional citizen journey.
- [x] **Status Decoder.** `/help` locally explains five familiar opaque status patterns in Hindi or English: scrutiny, upload pending, printing, objection, and deducted-payment wording. It keeps a strict payment-verification boundary, provides a safe next action, sends nothing, and does not persist typed text.
- [ ] Test the Guided Help Centre with the configured API key: a payment-pending question, an upload-pending question, an unsupported question, a Hindi question, and an identifier-containing question.
- [ ] Add a lightweight evaluation set for Guided Help Centre retrieval and refusals before the final demo. Keep answers bounded to the local source pack; do not add live web search to the citizen flow.
- [x] **Prototype RTO triage view.** One read-only screen reuses the citizen-facing evidence trail for Aarohi, Rohan, and Neha; it deliberately has no approve, reject, payment, or official-status controls.
- [x] **Reflect synthetic journey completion in triage.** Aarohi contact confirmation and readiness packet, Rohan’s readiness packet, and Neha’s support summary update the shared browser-only triage state and its safe next action.
- [x] **Reset demo progress.** The demo selector and triage view can return all browser-local synthetic journey states to their defaults for a clean rehearsal.
- [x] **Prototype staff-demo access gate.** `/triage` is preceded by visible synthetic judge credentials and a session-only demo sign-in; it is explicitly not real authentication or RTO access control.

## Quality and demo readiness

- [ ] Test the three core journeys with `OPENAI_API_KEY` configured: Aarohi (`/dashboard`), Rohan (`/apply?demo=rohan`), and Neha (`/rescue?case=payment-pending`).
- [ ] Test safety fixtures: hidden licence address, blurred proof, glare, and cropped proof.
- [ ] Test desktop and mobile layouts at **100% browser zoom** for the homepage, profile selector, dashboard, document check, Application Rescue, Form 1A Shield, and printable notes.
- [ ] Test Form 1A's complete, missing-registration, missing-seal, and missing-declaration variants; confirm the complete variant updates handoff and triage, and the doctor-note print stylesheet isolates only the note.
- [ ] Ensure every synthetic document and screen has a visible `demo only` / `not an official service` boundary.
- [ ] Deploy the final build to Vercel and run a clean-incognito demo rehearsal.

## Remaining focus — do this before new features

1. [ ] Run the full quality pass: the Vision safety fixtures, three core journeys, Guided Help Centre positive/negative questions, desktop/mobile layouts, and a clean-incognito rehearsal.
2. [ ] Standardise the final status language: Green = evidence ready for human review, Amber = clarification/evidence still needed, Red = re-upload or correction needed. Keep Blue for an informational next action only.
3. [x] Add baseline deployment security headers and verify they do not break Vision, Help Centre, or external source links. Re-check them on the deployed HTTPS URL.
4. [ ] Deploy, rehearse the two-minute walkthrough, then record the final video. Do not add broad services or generic AI after this point.

## Consent, privacy, and security

- [ ] **Optional consented demo email reminder for Aarohi.** Let a judge enter their own address and actively consent to a one-time synthetic reminder. The email must state that it is a SahiSetu demo, not a Parivahan/RTO communication, and the address must not be stored.
- [ ] Keep any mail-provider key server-only in deployment environment variables; never expose it in browser code, the repository, screenshots, or demo documents.
- [ ] Validate and rate-limit the reminder endpoint to reduce abuse. Return generic errors and never reveal whether an address has previously received a reminder.
- [x] Apply self-only baseline security headers: Content Security Policy, `X-Content-Type-Options: nosniff`, strict referrer policy, anti-framing, restrictive browser permissions, cross-origin protections, and HSTS. Verify on the deployed HTTPS URL too.
- [ ] Keep `Reset demo progress` prominent and document that browser-local synthetic state is not a citizen or RTO record. Add a one-click clear-data action if any additional local storage is introduced.
- [ ] If real data is ever introduced after the hackathon: replace the prototype RTO gate with server-side authentication, role-based access control, audit logs, short retention, encryption, and explicit deletion controls.

## Two-minute submission video

- [ ] Record the opening problem statement and source-checked statistics from `../VIDEO_README.md`.
- [ ] Show Aarohi's short-window renewal risk and document-readiness check (the dashboard calculates the live synthetic countdown from the visible expiry date).
- [ ] Use the second minute to demonstrate the differentiator: proactive, explainable readiness and recovery.
- [ ] Include one fail-closed document result or Neha's `do not pay again blindly` rescue moment.
- [ ] End with: “Parivahan helps citizens transact. SahiSetu helps them become ready before the transaction—and recover when something goes wrong.”

## Explicitly out of scope for Phase 2

- [ ] Real login, Aadhaar, Parivahan, RTO, bank, SMS, WhatsApp, calendar, or ongoing email integration. A single opt-in, judge-addressed synthetic email is the only scoped exception above.
- [ ] Real payment verification, repeat payment, refunds, submissions, approvals, or status updates.
- [ ] Real identity documents or personal data.
- [ ] Broad extra services such as RC transfer, NOC, ownership transfer, learner licence, or an unconstrained generic chatbot. The shipped Help Centre is deliberately bounded to its small cited source pack.

## Useful commands

```bash
npm run format:check
npm run lint
npx next build --webpack
```
