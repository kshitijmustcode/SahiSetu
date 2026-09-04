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
- [x] Persistent English / Hindi switch across the homepage, demo selector, dashboard, document check, and Application Rescue.
- [x] Prettier, ESLint, and production-build checks.

## P0 — Complete the core journeys

- [x] **Verify Rohan end to end with OpenAI Vision.** His licence correctly shows the old Koramangala address and the proof shows the new Indiranagar address. The extracted default matches the proof (`Lakeview Road`); only a citizen's manual application edit to `Lake View Road` triggers the clarification-note step.
- [x] **Derive Aarohi's renewal status from the visible expiry field on her synthetic licence.** The dashboard calculates `safe`, `renew soon`, `urgent`, or `expired` against the current India date.
- [x] **Make the renewal checklist responsive to that result.** The detected expiry date and renewal action update the synthetic checklist and readiness count.
- [x] **Reuse an explainable audit timeline across Aarohi, Rohan, and Neha.** It shows the source record, extracted fields, citizen confirmation, readiness result, and safe next action for each synthetic case.
- [ ] Give every completed journey an explicit, non-fake `Continue through official service` handoff card.

## P1 — Make explanations reviewable

- [ ] Create timestamped synthetic reports for Aarohi and Neha, matching the existing address-change report quality.
- [ ] Standardise Green / Amber / Red wording, meaning, and visual treatment across every page.
- [x] **Prototype RTO triage view.** One read-only screen reuses the citizen-facing evidence trail for Aarohi, Rohan, and Neha; it deliberately has no approve, reject, payment, or official-status controls.
- [x] **Reflect synthetic journey completion in triage.** Aarohi contact confirmation and readiness packet, Rohan’s readiness packet, and Neha’s support summary update the shared browser-only triage state and its safe next action.
- [x] **Reset demo progress.** The demo selector and triage view can return all browser-local synthetic journey states to their defaults for a clean rehearsal.
- [x] **Prototype staff-demo access gate.** `/triage` is preceded by visible synthetic judge credentials and a session-only demo sign-in; it is explicitly not real authentication or RTO access control.

## Quality and demo readiness

- [ ] Test the three profile routes with `OPENAI_API_KEY` configured.
- [ ] Test safety fixtures: hidden licence address, blurred proof, glare, and cropped proof.
- [ ] Test desktop and mobile layouts for the homepage, profile selector, dashboard, document check, and Application Rescue page.
- [ ] Ensure every synthetic document and screen has a visible `demo only` / `not an official service` boundary.
- [ ] Deploy the final build to Vercel and run a clean-incognito demo rehearsal.

## Two-minute submission video

- [ ] Record the opening problem statement and source-checked statistics from `../VIDEO_README.md`.
- [ ] Show Aarohi's short-window renewal risk and document-readiness check (the dashboard calculates the live synthetic countdown from the visible expiry date).
- [ ] Use the second minute to demonstrate the differentiator: proactive, explainable readiness and recovery.
- [ ] Include one fail-closed document result or Neha's `do not pay again blindly` rescue moment.
- [ ] End with: “Parivahan helps citizens transact. SahiSetu helps them become ready before the transaction—and recover when something goes wrong.”

## Explicitly out of scope for Phase 2

- [ ] Real login, Aadhaar, Parivahan, RTO, bank, SMS, WhatsApp, email, or calendar integration.
- [ ] Real payment verification, repeat payment, refunds, submissions, approvals, or status updates.
- [ ] Real identity documents or personal data.
- [ ] Broad extra services such as RC transfer, NOC, ownership transfer, learner licence, or a RAG chatbot.

## Useful commands

```bash
npm run format:check
npm run lint
npx next build --webpack
```
