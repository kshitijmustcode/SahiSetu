# SahiSetu

SahiSetu is a **synthetic-data-only hackathon prototype** that helps someone prepare an address-change application before paying or submitting it on Parivahan. It does not connect to Parivahan, an RTO, Aadhaar, or any government system.

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
