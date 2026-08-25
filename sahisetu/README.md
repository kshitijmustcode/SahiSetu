# SahiSetu

**Pre-scrutiny for clearer, more accountable licence-service applications.**

SahiSetu is a hackathon prototype for citizens applying for an address change or renewal through licence-service portals. It checks a form address against uploaded **synthetic** supporting documents before payment, then explains small mismatches in plain language and prepares a mock clarification packet.

## The problem

Small text differences—such as `Rd.` versus `Road`, `Indira Nagar` versus `Indiranagar`, or `Bangalore` versus `Bengaluru`—can lead to avoidable manual scrutiny. Applicants often have little visibility into what needs fixing.

## What the prototype does

- Uses OpenAI Vision to compare the application address with a synthetic address proof.
- Detects and classifies minor versus substantive differences.
- Gives exact, field-level fixes before the applicant pays.
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

Without an API key, SahiSetu uses a clearly labelled synthetic demo assessment. With a key, the API route uses `gpt-5.6-luna` through the OpenAI Responses API. It sends the compressed address proof only, uses low-detail vision, and falls back after 20 seconds so users are not left waiting indefinitely.

## Verification

```bash
npm run lint
npx next build --webpack
```

GitHub Actions runs these checks on pushes and pull requests.

## Stack

Next.js, TypeScript, Tailwind CSS, and the OpenAI Node SDK.
