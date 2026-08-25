# SahiSetu

**Pre-scrutiny for clearer, more accountable licence-service applications.**

SahiSetu is a hackathon prototype for citizens applying for an address change or renewal through licence-service portals. It reads a **synthetic** new-address proof, creates a reviewable Parivahan-ready address before payment, then explains document inconsistencies in plain language and prepares a mock clarification packet.

## The problem

Applicants often retype an address while applying, creating small differences—such as `Rd.` versus `Road`, `Indira Nagar` versus `Indiranagar`, or `Bangalore` versus `Bengaluru`—that can lead to avoidable manual scrutiny. They also have little visibility into unclear images or what needs fixing.

## What the prototype does

- Uses OpenAI Vision to read a current synthetic driving licence and synthetic new-address proof.
- Extracts a clean, user-confirmed Parivahan-ready address from the new-address proof, instead of asking the user to retype it.
- Detects unclear, cropped, or low-resolution images and refuses to guess.
- Checks visible identity details while treating the old address on the current licence as expected.
- Gives exact, field-level fixes before the applicant pays, including an optional rescue comparison for an address already filled on Parivahan.
- Generates one mock clarification note covering every eligible minor variation.
- Blocks the mock submission packet when a major correction remains.
- Creates a timestamped **SahiSetu Scrutiny Passport** with readiness score, evidence excerpt, checklist, and report ID.

## Important boundaries

- SahiSetu is **not affiliated with, integrated with, or endorsed by Parivahan, Sarathi, an RTO, or any government body**.
- The Scrutiny Passport is an unofficial applicant-held companion report, not a government status or approval prediction.
- The demo intentionally uses synthetic documents only. Never upload real government IDs, Aadhaar numbers, or sensitive personal data.
- The e-signature and submission packet are mock interactions and have no legal effect.

## Run locally

Prerequisites: Node.js 20+ and npm.

```bash
cd sahisetu
npm install
```

Create `.env.local`:

```env
OPENAI_API_KEY=your_api_key_here
```

Start development mode:

```bash
npm run dev -- --port 3001
```

Open [http://127.0.0.1:3001](http://127.0.0.1:3001).

Without an API key, SahiSetu uses a clearly labelled synthetic demo assessment. With a key, the API route uses `gpt-5.6-luna` through the OpenAI Responses API. It sends compressed document images at low detail and falls back after 20 seconds so users are not left waiting indefinitely.

## Verification

```bash
npm run lint
npx next build --webpack
```

GitHub Actions runs these checks on pushes and pull requests.

## Stack

Next.js, TypeScript, Tailwind CSS, and the OpenAI Node SDK.
