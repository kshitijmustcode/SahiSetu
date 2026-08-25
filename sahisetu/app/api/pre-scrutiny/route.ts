import OpenAI from "openai";
import { NextResponse } from "next/server";

type DocumentInput = { name: string; dataUrl?: string };

const schema = {
  type: "object",
  additionalProperties: false,
  properties: {
    overallStatus: { type: "string", enum: ["clear", "needs_clarification", "needs_correction"] },
    confidence: { type: "number" },
    summary: { type: "string" },
    extraction: {
      type: "object", additionalProperties: false,
      properties: { address: { type: "string" }, applicantName: { type: "string" }, complete: { type: "boolean" } },
      required: ["address", "applicantName", "complete"],
    },
    quality: {
      type: "object", additionalProperties: false,
      properties: { status: { type: "string", enum: ["clear", "needs_reupload"] }, issues: { type: "array", items: { type: "string" } }, guidance: { type: "string" } },
      required: ["status", "issues", "guidance"],
    },
    identity: {
      type: "object", additionalProperties: false,
      properties: { status: { type: "string", enum: ["match", "needs_review", "uncertain"] }, summary: { type: "string" } },
      required: ["status", "summary"],
    },
    mismatches: {
      type: "array",
      items: {
        type: "object", additionalProperties: false,
        properties: {
          field: { type: "string" }, formValue: { type: "string" }, documentValue: { type: "string" },
          severity: { type: "string", enum: ["minor", "major"] }, explanation: { type: "string" },
          recommendedAction: { type: "string", enum: ["clarification_note", "correct_form"] },
        },
        required: ["field", "formValue", "documentValue", "severity", "explanation", "recommendedAction"],
      },
    },
  },
  required: ["overallStatus", "confidence", "summary", "extraction", "quality", "identity", "mismatches"],
} as const;

const demoAssessment = () => ({
  overallStatus: "clear" as const,
  confidence: 0.94,
  summary: "We extracted a complete new address from the synthetic address proof. The current licence is used to identify the record to update.",
  extraction: { address: "12 M.G. Road, Indiranagar, Bengaluru, Karnataka 560038", applicantName: "Kshitij Kumar", complete: true },
  quality: { status: "clear" as const, issues: [], guidance: "Both synthetic documents are clear enough for this demo." },
  identity: { status: "match" as const, summary: "The visible applicant details appear consistent across the synthetic documents." },
  mismatches: [],
});

export async function POST(request: Request) {
  const body = await request.json() as { documents?: DocumentInput[] };
  const documents = body.documents ?? [];
  const licence = documents.find((document) => /licen[cs]e|dl/i.test(document.name)) ?? documents[0];
  const addressProof = documents.find((document) => /aadhaar|aadhar|address|proof/i.test(document.name)) ?? documents[1];

  if (!licence?.dataUrl || !addressProof?.dataUrl) {
    return NextResponse.json({ error: "Please add both the current driving licence and new-address proof." }, { status: 400 });
  }

  if (!process.env.OPENAI_API_KEY) return NextResponse.json({ assessment: demoAssessment(), source: "synthetic_demo" });

  try {
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const response = await client.responses.create({
      model: "gpt-5.6-luna",
      store: false,
      reasoning: { effort: "none" },
      max_output_tokens: 800,
      instructions: "You are SahiSetu's conservative document pre-scrutiny assistant. The first image is the CURRENT driving licence; its old address is expected and must never be treated as a mismatch. The second image is a NEW-ADDRESS proof. Extract a single clean, Parivahan-ready address only from the new-address proof. Assess whether both images are readable, complete, upright, and free from glare/cropping. Compare only applicant identity details that are visibly available in both documents. Do not make legal, identity, or approval decisions. Ignore synthetic-demo, demo-only, and not-valid watermarks: they are deliberate prototype safety labels. Use needs_reupload when text cannot be read reliably, key fields are cropped, or image quality is inadequate. Use clarification_note only for harmless text variations; substantive name, DOB, document, or address conflicts require correct_form. Confidence is text-reading certainty, never approval likelihood. Return the required JSON only.",
      input: [{ role: "user", content: [
        { type: "input_text", text: `Current driving-licence file: ${licence.name}\nNew-address-proof file: ${addressProof.name}` },
        { type: "input_image", image_url: licence.dataUrl, detail: "low" },
        { type: "input_image", image_url: addressProof.dataUrl, detail: "low" },
      ] }],
      text: { format: { type: "json_schema", name: "sahisetu_document_assessment", strict: true, schema } },
    }, { signal: AbortSignal.timeout(20_000) });
    return NextResponse.json({ assessment: JSON.parse(response.output_text), source: "openai" });
  } catch {
    return NextResponse.json({ assessment: demoAssessment(), source: "synthetic_demo", fallback: true });
  }
}
