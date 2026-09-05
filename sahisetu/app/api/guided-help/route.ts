import OpenAI from "openai";
import { NextResponse } from "next/server";
import { retrieveHelpSources } from "../../lib/guided-help-knowledge";

const requestBuckets = new Map<string, number[]>();
const MAX_QUESTION_LENGTH = 500;
const WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 6;

function requestKey(request: Request) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local-demo";
}

function isRateLimited(key: string) {
  const now = Date.now();
  const recent = (requestBuckets.get(key) ?? []).filter((time) => now - time < WINDOW_MS);
  if (recent.length >= MAX_REQUESTS_PER_WINDOW) {
    requestBuckets.set(key, recent);
    return true;
  }
  requestBuckets.set(key, [...recent, now]);
  return false;
}

function containsPersonalData(question: string) {
  return /\b\d{8,}\b/.test(question) || /\b[\w.+-]+@[\w.-]+\.[a-z]{2,}\b/i.test(question);
}

export async function POST(request: Request) {
  let body: { question?: unknown; language?: unknown };
  try {
    body = (await request.json()) as { question?: unknown; language?: unknown };
  } catch {
    return NextResponse.json({ error: "Please enter a question in plain text." }, { status: 400 });
  }

  const question = typeof body.question === "string" ? body.question.trim() : "";
  const language = body.language === "hi" ? "Hindi" : "English";
  if (question.length < 5 || question.length > MAX_QUESTION_LENGTH) {
    return NextResponse.json({ error: "Enter a question between 5 and 500 characters." }, { status: 400 });
  }
  if (containsPersonalData(question)) {
    return NextResponse.json(
      {
        error:
          "For privacy, remove application numbers, licence numbers, phone numbers, email addresses, or payment references.",
      },
      { status: 400 },
    );
  }
  if (isRateLimited(requestKey(request))) {
    return NextResponse.json({ error: "Please wait a few minutes before asking another question." }, { status: 429 });
  }

  const sources = retrieveHelpSources(question);
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { error: "Live guided answers are unavailable in this demo. Use one of the issue cards below." },
      { status: 503 },
    );
  }

  const sourceContext = sources
    .map((source, index) => `[${index + 1}] ${source.title}\n${source.summary}\n${source.url}`)
    .join("\n\n");
  try {
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const response = await client.responses.create(
      {
        model: "gpt-5.6-luna",
        store: false,
        reasoning: { effort: "none" },
        max_output_tokens: 420,
        instructions: `You are SahiSetu's Guided Help Centre for a synthetic-data-only prototype. Reply in ${language}. Answer only from the supplied official-source pack. Give a concise practical explanation, then one safe next action. Use plain text only: do not use Markdown, asterisks, headings, bullets, or URLs. Do not invent laws, fees, timelines, eligibility, documents, application status, payment status, or state requirements. Do not tell the user to pay again. Do not ask for or process personal data. Never claim to be Parivahan, an RTO, or an official service, and never imply that SahiSetu can submit, verify, approve, reject, or update anything. If the pack does not answer the question, say so plainly and suggest checking the relevant official source or state service. Mention that state-specific steps may vary. Do not cite URLs in the prose; the interface shows the sources.`,
        input: `Citizen question: ${question}\n\nOfficial-source pack:\n${sourceContext}`,
      },
      { signal: AbortSignal.timeout(15_000) },
    );
    return NextResponse.json({ answer: response.output_text, sources, mode: "source-grounded" });
  } catch {
    return NextResponse.json(
      {
        error:
          "The guided answer is unavailable right now. Use the issue cards or check the official source links below.",
      },
      { status: 503 },
    );
  }
}
