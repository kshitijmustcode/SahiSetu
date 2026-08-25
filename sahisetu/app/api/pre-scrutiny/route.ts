import OpenAI from "openai";
import { NextResponse } from "next/server";

type DocumentInput = { name: string; dataUrl?: string };

const schema = {
  type: "object",
  additionalProperties: false,
  properties: {
    overallStatus: { type: "string", enum: ["clear", "needs_clarification", "needs_correction"] },
    confidence: { type: "number" },
    documentAddress: { type: "string" },
    summary: { type: "string" },
    mismatches: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          field: { type: "string" },
          formValue: { type: "string" },
          documentValue: { type: "string" },
          severity: { type: "string", enum: ["minor", "major"] },
          explanation: { type: "string" },
          recommendedAction: { type: "string", enum: ["clarification_note", "correct_form"] },
        },
        required: ["field", "formValue", "documentValue", "severity", "explanation", "recommendedAction"],
      },
    },
  },
  required: ["overallStatus", "confidence", "documentAddress", "summary", "mismatches"],
} as const;

const documentAddress = "12 M.G. Road, Indiranagar, Bengaluru, Karnataka 560038";

const demoAssessment = (address: string) => {
  const value = address.toLowerCase();
  const mismatches = [] as {
    field: string; formValue: string; documentValue: string; severity: "minor"; explanation: string; recommendedAction: "clarification_note";
  }[];

  if (value.includes("indira nagar")) mismatches.push({
    field: "Locality spelling", formValue: "Indira Nagar", documentValue: "Indiranagar", severity: "minor",
    explanation: "“Indira Nagar” and “Indiranagar” commonly refer to the same Bengaluru locality, but a reviewer may flag the spelling variation.", recommendedAction: "clarification_note",
  });
  if (value.includes("bangalore")) mismatches.push({
    field: "City naming", formValue: "Bangalore", documentValue: "Bengaluru", severity: "minor",
    explanation: "“Bangalore” and “Bengaluru” commonly refer to the same city, but matching the address proof avoids an avoidable review query.", recommendedAction: "clarification_note",
  });

  return {
    overallStatus: mismatches.length ? "needs_clarification" as const : "clear" as const,
    confidence: 0.94,
    documentAddress,
    summary: mismatches.length ? "Your address proof appears to match the application, but a small naming or formatting difference should be clarified before submission." : "Your application address appears consistent with the synthetic address proof.",
    mismatches,
  };
};

export async function POST(request: Request) {
  const body = await request.json() as { address?: string; documents?: DocumentInput[] };
  const address = body.address?.trim();
  if (!address) return NextResponse.json({ error: "An application address is required." }, { status: 400 });

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ assessment: demoAssessment(address), source: "synthetic_demo" });
  }

  try {
    // The address proof is the only document needed for this specific address check.
    // Keeping the licence in the packet but out of the vision request cuts upload and model time.
    const addressProof = (body.documents ?? []).find((document) => /address|proof/i.test(document.name)) ?? body.documents?.[1];
    const documentContent = addressProof?.dataUrl
      ? [{ type: "input_image" as const, image_url: addressProof.dataUrl, detail: "low" as const }]
      : [];
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const response = await client.responses.create({
      model: "gpt-5.6-luna",
      store: false,
      reasoning: { effort: "none" },
      max_output_tokens: 600,
      instructions: "Compare the application address to the visible address proof. Do not make legal or identity decisions. Report only visible material text differences. Ignore deliberate synthetic-demo, demo-only, and not-valid watermarks because they are safety labels on this prototype's test documents, not application discrepancies. The confidence field means confidence that the visible document text was read and compared correctly; it is not the likelihood that an application will be approved. Use clarification_note only for minor wording, spacing, abbreviation, or known same-place naming variations; use correct_form for any substantive difference. Return the required JSON only.",
      input: [{ role: "user", content: [{ type: "input_text", text: `Application address: ${address}\nAddress-proof file: ${addressProof?.name ?? "not supplied"}.` }, ...documentContent] }],
      text: { format: { type: "json_schema", name: "pre_scrutiny_assessment", strict: true, schema } },
    }, { signal: AbortSignal.timeout(20_000) });
    return NextResponse.json({ assessment: JSON.parse(response.output_text), source: "openai" });
  } catch {
    return NextResponse.json({ assessment: demoAssessment(address), source: "synthetic_demo", fallback: true });
  }
}
