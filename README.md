# SahiSetu

SahiSetu is a **demo-data-only hackathon prototype** that helps citizens become ready before a driving-licence renewal, address change, or application-status issue becomes a delay or repeat visit. It does not connect to Parivahan, an RTO, Aadhaar, a bank, or any government system.

## The problem

Small differences between an application and its supporting documents can lead to an opaque **Under Scrutiny** status. SahiSetu catches issues early: it reads a current driving licence and proof of a new address, prepares an address for review, and highlights differences before the user proceeds.

## What the prototype does

1. Uploads a current driving licence and new-address proof.
2. Uses OpenAI Vision to classify the documents and assess readability.
3. Rejects unclear, cropped, blurred, redacted, unrelated, swapped, or duplicate uploads.
4. Requires key fields to be readable:
   - Licence: name, licence number, full address, and PIN.
   - Address proof: name, full Indian address, and a six-digit PIN.
5. Extracts the new address only after the proof passes validation.
6. Lets the applicant review/edit the extracted text and compares the final wording against the proof.
7. Produces a timestamped pre-submission report; minor wording differences may receive a mock explanation note, while substantive differences must be corrected.
8. Pre-checks a demo Form 1A certificate for four visible fields and produces a doctor-facing confirmation note when Form 1A is relevant to the journey.

The Rohan Mehta demo makes the distinction explicit: his licence contains an expected **old** Koramangala address because he has moved; his new-address proof reads **Lakeview Road** in Indiranagar with PIN `560038`. The flagship demo changes only the application draft to the wrong PIN `560036`, blocks progression, shows the exact proof value, and restores it with **Use proof wording**. A `Lakeview` / `Lake View` spacing difference remains as a secondary minor-difference example.

The prototype supports the **Indian address-change flow** only. A foreign address, an unrecognised document, or conflicting visible identity details blocks the flow rather than making a decision.

## Safety and boundaries

- **Demo data only.** Do not upload real IDs, Aadhaar numbers, or personal information.
- A SahiSetu report is not an RTO decision, legal advice, identity verification, or approval prediction.
- “Document clarity” means text-reading confidence, not likelihood of government approval.
- The app fails closed: it asks for a re-upload rather than guessing from an incomplete image.

## Tech stack

- Next.js 16 + React + TypeScript
- Tailwind CSS
- OpenAI Responses API with image input and structured JSON output
- In-memory exact-input cache for repeated checks during a server session

## How AI is used safely

AI is a core part of the document-readiness engine, not a decorative chatbot. OpenAI Vision classifies the synthetic documents, checks whether the required fields are visibly readable, and extracts the new-address text only after the proof passes fail-closed validation. The citizen can then review or edit the text; SahiSetu records that final human-confirmed wording separately from the extracted wording.

The **Guided Help Centre** is a bounded retrieval-assisted feature, not an unconstrained chatbot. It selects a small, server-held pack of official Parivahan guidance relevant to common licence, status, upload, and payment questions, then asks OpenAI to answer only from that pack. It shows the source links used, declines unsupported questions, blocks obvious personal identifiers, limits requests, uses `store: false`, and never claims an official status, eligibility outcome, approval, payment result, or government decision.

## Run locally

```bash
cd sahisetu
npm install
cp .env.example .env.local
# Add OPENAI_API_KEY to .env.local
npm run dev -- --port 3001
```

Open [http://localhost:3001](http://localhost:3001).

## Environment variables

```bash
OPENAI_API_KEY=your_api_key_here
```

With an API key, uploaded images are analysed by OpenAI Vision. Without one, only the built-in **Try with demo documents** pair can run in offline synthetic-demo mode. Other uploaded documents return an error instead of a misleading simulated result.

## Useful commands

```bash
npm run lint
npx next build --webpack
```

## Demo assets

The in-app demo uses fictional documents for **Aarohi Sharma**. Additional blurry, cropped, glare, and incomplete synthetic test files are available in the surrounding project’s `outputs/synthetic-edge-case-tests/` folder for local testing.

## Hackathon pitch

> SahiSetu turns document uploads into a reviewable, pre-submission address check—so citizens can catch avoidable scrutiny issues before they pay, submit, or visit an RTO.

## Phase 2 scope

Phase 2 expands the working address-change journey into a **proactive driving-licence readiness and recovery assistant**. SahiSetu remains an independent, synthetic-data-only prototype: it prepares and explains; it does not replace Parivahan, an RTO, or an official decision.

1. **Address Change Readiness** — retain the working address-change journey as the proof of the document-readiness engine: validate uploads, extract the address, highlight mismatches, and produce a reviewable report before the citizen proceeds to the official service.
2. **DL Guardian and Renewal Readiness** — read a fictional demo licence expiry date, surface urgency, validate a renewal document pack, and explain the next action before a citizen begins the official renewal process. Its Form 1A Medical Readiness Shield checks the visible practitioner registration number, seal/stamp, signature, and fitness declaration, then prepares a doctor-facing confirmation note when the relevant official service says Form 1A applies. The shield links to the [official Form 1A](https://parivahan.gov.in/sites/default/files/DownloadForm/cmvr/FORM-1A.pdf).
3. **Communication Readiness and Simulated Reminders** — prompt a citizen to confirm that their official-service mobile number is current, explain why current contact details matter, and let them choose local reminder preferences at 60, 30, and 7 days. The prototype does not send SMS, WhatsApp, email, or calendar notifications.
4. **Application Rescue Centre** — guide synthetic cases such as `Under Scrutiny`, `Document Upload Pending`, and `Payment Deducted but Pending` to a clear next action, with a checklist of evidence to retain and an RTO/help-desk escalation summary. It never retries payments, issues refunds, or updates official applications.
5. **Explainable Audit Trail** — show the source record, extracted fields, citizen confirmation, readiness result, and recommended safe next action. Address review retains the extracted value, citizen-reviewed value, and exact mismatch. Results are Green (ready for human review), Amber (clarification needed), or Red (re-upload/correction required)—never an approval prediction.
6. **Prototype RTO Triage View** — show the same synthetic cases in a reviewer-oriented Green/Amber/Red queue, demonstrating shared explanations for citizens and reviewers without offering approve/reject controls.
7. **Guided Help Centre** — provide bounded, source-grounded explanations for common paperwork questions. Suggested questions populate the Help Centre rather than opening a fictional citizen's case, preserving each demo journey as case-specific.
8. **Status Decoder** — explain a small, curated set of opaque application-status patterns in plain Hindi or English, distinguish what SahiSetu cannot verify (including payment state), and give one safe next action without opening an application or inferring an official decision.

### Supporting prototype capabilities

- **Illustrative policy packs** configure requirements by service and state. They are visibly labelled prototype guidance until verified against official policy.
- **Production guardrails** would require explicit consent, encryption, short-lived document storage, deletion and retention controls, official state-service integration, and human escalation for uncertain cases.

### Baseline web security

The prototype applies a self-only Content Security Policy, anti-framing protection, strict referrer policy, content-type sniffing protection, restrictive browser permissions, cross-origin protections, and HSTS. These reduce browser-level risk for the synthetic demo; they do not turn the visible RTO gate into real authentication or replace the production safeguards above.

The product direction is proactive: SahiSetu helps citizens identify expiry, document, communication, and application-status issues before they become costly delays or repeat RTO visits.

## Current demo journeys

- **Aarohi Sharma:** renewal readiness based on a visible, fictional licence expiry date, with reversible contact-readiness confirmation and simulated reminders.
- **Form 1A Medical Readiness Shield:** Aarohi's age-42 demo includes a bounded medical-certificate pre-check and a print-only doctor confirmation note. It is preparation for human review, never a medical-fitness, eligibility, or licence decision.
- **Rohan Mehta:** moved-address document check, explainable extraction, citizen review, and a minor wording-difference clarification path.
- **Neha Verma:** payment-pending Application Rescue checklist that advises retaining evidence rather than paying again blindly.
- **Prototype RTO Triage View:** a read-only staff-facing screen that mirrors the three synthetic cases and their evidence summaries. It has no approve/reject, payment, official-status, or live-RTO controls.
- **Demo Handoff Packs and RTO Day Packs:** printable, timestamped summaries for all three completed journeys. They carry evidence, citizen confirmation, remaining boundary, and the safe next action; each also generates a separate physical-folder cover sheet with case-specific items to verify before an RTO visit. The address packs also show the proof wording, final citizen edit, and mock clarification-signature state.
- **Guided Help Centre:** common-problem questions plus bounded typed questions grounded only in a small, visible official-source pack. It rejects obvious personal identifiers and explains the safe next step without opening or simulating any citizen case or official lookup.
- **Status Decoder:** a browser-local, no-storage explainer for familiar scrutiny, upload, printing, objection, and payment-pending wording. It never claims to know a payment outcome, official timeline, application result, or sub-code meaning.
- **Shared, focused interface:** common navigation and footers are consistent across the product, while the document check retains its dedicated progress toolbar. Copy names the citizen’s next action first and reserves demo/not-official wording for high-risk boundaries.

### Deliberate entry model

- **Citizen demo selector (`/demo`):** only Aarohi, Rohan, and Neha's case-specific journeys.
- **Guided Help Centre (`/help`):** neutral, source-grounded explanation without opening any fictional citizen record.
- **RTO triage (`/triage`):** a separately gated, read-only judge/staff demonstration linked quietly from the homepage.

This keeps each case coherent: a general question does not accidentally open Neha's payment record or Rohan's document workflow.

Each journey uses the same **Explainable Audit Timeline**: source record → extracted fields → citizen confirmation → readiness result → safe next action. It shows a transparent preparation/recovery path, never an approval decision.

See [`sahisetu/PROJECT_CONTEXT.md`](sahisetu/PROJECT_CONTEXT.md) for a concise continuation handoff.
