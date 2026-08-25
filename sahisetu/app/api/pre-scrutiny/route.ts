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

const demoAssessment = (address: string) => ({
  overallStatus: "needs_clarification" as const,
  confidence: 0.94,
  documentAddress: "12 M.G. Road, Indiranagar, Bengaluru, Karnataka 560038",
  summary: "Your address proof appears to match the application. One locality formatting difference should be clarified before submission.",
  mismatches: [{
    field: "Locality spelling", formValue: address, documentValue: "Indiranagar", severity: "minor" as const,
    explanation: "“Indira Nagar” and “Indiranagar” commonly refer to the same Bengaluru locality, but a reviewer may flag the spelling variation.",
    recommendedAction: "clarification_note" as const,
  }],
});

export async function POST(request: Request) {
  const body = await request.json() as { address?: string; documents?: DocumentInput[] };
  const address = body.address?.trim();
  if (!address) return NextResponse.json({ error: "An application address is required." }, { status: 400 });

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ assessment: demoAssessment(address), source: "synthetic_demo" });
  }

  try {
    const documentContent = (body.documents ?? []).flatMap((document) => {
      if (!document.dataUrl) return [];
      return [{ type: "input_image" as const, image_url: document.dataUrl, detail: "high" as const }];
    });
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const response = await client.responses.create({
      model: "gpt-5.6-luna",
      store: false,
      instructions: "You are SahiSetu's document pre-scrutiny assistant. Compare a citizen's stated address with synthetic supporting documents. Do not make legal or identity decisions. Identify only visible, material text differences. If uncertain, say so and return low confidence. Return JSON matching the schema.",
      input: [{ role: "user", content: [{ type: "input_text", text: `Application address: ${address}\nUploaded synthetic documents: ${(body.documents ?? []).map((d) => d.name).join(", ")}.` }, ...documentContent] }],
      text: { format: { type: "json_schema", name: "pre_scrutiny_assessment", strict: true, schema } },
    });
    return NextResponse.json({ assessment: JSON.parse(response.output_text), source: "openai" });
  } catch {
    return NextResponse.json({ assessment: demoAssessment(address), source: "synthetic_demo", fallback: true });
  }
}
