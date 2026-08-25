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

const documentAddress = "12 M.G. Road, Indiranagar, Bengaluru, Karnataka 560038";
const normaliseAddress = (value: string) => value.toLowerCase().replaceAll(".", "").replace(/\brd\b/g, "road").replace(/indira\s+nagar/g, "indiranagar").replace(/bangalore/g, "bengaluru").replace(/[^a-z0-9]/g, "");
const presentationText = (value: string) => value.toLowerCase().replace(/[.]/g, "").replace(/\s+/g, " ").trim();

function candidateDifferences(candidateAddress: string | undefined, proofAddress: string) {
  if (!candidateAddress) return [];
  const differences: Array<{ field: string; formValue: string; documentValue: string; severity: "minor" | "major"; explanation: string; recommendedAction: "clarification_note" | "correct_form" }> = [];
  const candidatePin = candidateAddress.match(/\b\d{6,}\b/)?.[0];
  const proofPin = proofAddress.match(/\b\d{6}\b/)?.[0];
  if (candidatePin && proofPin && candidatePin !== proofPin) {
    differences.push({ field: "PIN code", formValue: candidatePin, documentValue: proofPin, severity: "major", explanation: `The PIN code entered is ${candidatePin}, but the new-address proof shows ${proofPin}.`, recommendedAction: "correct_form" });
  }
  const candidateParts = candidateAddress.split(",").map((part) => part.trim()).filter(Boolean);
  const proofParts = proofAddress.split(",").map((part) => part.trim()).filter(Boolean);
  const candidateStreet = candidateParts[0];
  const proofStreet = proofParts[0];
  if (candidateStreet && proofStreet && normaliseAddress(candidateStreet) !== normaliseAddress(proofStreet)) {
    differences.push({ field: "House / street address", formValue: candidateStreet, documentValue: proofStreet, severity: "major", explanation: `The house or street entered is ${candidateStreet}, but the new-address proof shows ${proofStreet}.`, recommendedAction: "correct_form" });
  }
  const candidateLocality = candidateParts[1];
  const proofLocality = proofParts[1];
  if (candidateLocality && proofLocality && normaliseAddress(candidateLocality) !== normaliseAddress(proofLocality)) {
    differences.push({ field: "Locality", formValue: candidateLocality, documentValue: proofLocality, severity: "major", explanation: `The locality entered is ${candidateLocality}, but the new-address proof shows ${proofLocality}.`, recommendedAction: "correct_form" });
  } else if (candidateLocality && proofLocality && presentationText(candidateLocality) !== presentationText(proofLocality)) {
    differences.push({ field: "Locality formatting", formValue: candidateLocality, documentValue: proofLocality, severity: "minor", explanation: "The locality refers to the same place, but its wording differs from the new-address proof.", recommendedAction: "clarification_note" });
  }
  const candidateCity = candidateParts.at(-2);
  const proofCity = proofParts.at(-2);
  if (candidateCity && proofCity && normaliseAddress(candidateCity) !== normaliseAddress(proofCity)) {
    differences.push({ field: "City", formValue: candidateCity, documentValue: proofCity, severity: "major", explanation: `The city entered is ${candidateCity}, but the new-address proof shows ${proofCity}.`, recommendedAction: "correct_form" });
  } else if (candidateCity && proofCity && presentationText(candidateCity) !== presentationText(proofCity)) {
    differences.push({ field: "City formatting", formValue: candidateCity, documentValue: proofCity, severity: "minor", explanation: "The city name is a safe naming variation, but its wording differs from the new-address proof.", recommendedAction: "clarification_note" });
  }
  const candidateState = candidateParts.at(-1)?.replace(/\b\d+\b/g, "").trim();
  const proofState = proofParts.at(-1)?.replace(/\b\d+\b/g, "").trim();
  if (candidateState && proofState && normaliseAddress(candidateState) !== normaliseAddress(proofState)) {
    differences.push({ field: "State", formValue: candidateState, documentValue: proofState, severity: "major", explanation: `The state entered is ${candidateState}, but the new-address proof shows ${proofState}.`, recommendedAction: "correct_form" });
  }
  if (differences.length) return differences;
  return [{ field: "New address", formValue: candidateAddress, documentValue: proofAddress, severity: "major" as const, explanation: "The edited address does not match the new-address proof.", recommendedAction: "correct_form" as const }];
}

const demoAssessment = (candidateAddress?: string) => {
  const mismatches = candidateDifferences(candidateAddress, documentAddress);
  return {
  overallStatus: mismatches.some((item) => item.severity === "major") ? "needs_correction" as const : mismatches.length ? "needs_clarification" as const : "clear" as const,
  confidence: 0.94,
  summary: "We extracted a complete new address from the synthetic address proof. The current licence is used to identify the record to update.",
  extraction: { address: documentAddress, applicantName: "Aarohi Sharma", complete: true },
  quality: { status: "clear" as const, issues: [], guidance: "Both synthetic documents are clear enough for this demo." },
  identity: { status: "match" as const, summary: "The visible applicant details appear consistent across the synthetic documents." },
  mismatches,
};
};

export async function POST(request: Request) {
  const body = await request.json() as { documents?: DocumentInput[]; candidateAddress?: string };
  const documents = body.documents ?? [];
  const licence = documents.find((document) => /licen[cs]e|dl/i.test(document.name)) ?? documents[0];
  const addressProof = documents.find((document) => /aadhaar|aadhar|address|proof/i.test(document.name)) ?? documents[1];

  if (!licence?.dataUrl || !addressProof?.dataUrl) {
    return NextResponse.json({ error: "Please add both the current driving licence and new-address proof." }, { status: 400 });
  }
  if (licence.dataUrl === addressProof.dataUrl) {
    return NextResponse.json({ error: "The same image was added twice. Upload a separate proof of your new address." }, { status: 400 });
  }

  if (!process.env.OPENAI_API_KEY) return NextResponse.json({ assessment: demoAssessment(body.candidateAddress), source: "synthetic_demo" });

  try {
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const response = await client.responses.create({
      model: "gpt-5.6-luna",
      store: false,
      reasoning: { effort: "none" },
      max_output_tokens: 800,
      instructions: "You are SahiSetu's conservative document pre-scrutiny assistant. The first image is the CURRENT driving licence; its old address is expected and must never be treated as a mismatch. The second image is a NEW-ADDRESS proof. Extract a single clean, Parivahan-ready address only from the new-address proof. If the user supplies an edited address, compare that address to the proof and report any differences. Assess whether both images are readable, complete, upright, and free from glare/cropping. Compare only applicant identity details that are visibly available in both documents. Do not make legal, identity, or approval decisions. Ignore synthetic-demo, demo-only, and not-valid watermarks: they are deliberate prototype safety labels. Use needs_reupload when text cannot be read reliably, key fields are cropped, or image quality is inadequate. Use clarification_note only for harmless text variations; substantive name, DOB, document, or address conflicts require correct_form. Confidence is text-reading certainty, never approval likelihood. Return the required JSON only.",
      input: [{ role: "user", content: [
        { type: "input_text", text: `Current driving-licence file: ${licence.name}\nNew-address-proof file: ${addressProof.name}${body.candidateAddress ? `\nEdited address to verify: ${body.candidateAddress}` : ""}` },
        { type: "input_image", image_url: licence.dataUrl, detail: "low" },
        { type: "input_image", image_url: addressProof.dataUrl, detail: "low" },
      ] }],
      text: { format: { type: "json_schema", name: "sahisetu_document_assessment", strict: true, schema } },
    }, { signal: AbortSignal.timeout(20_000) });
    const assessment = JSON.parse(response.output_text);
    if (body.candidateAddress) {
      const nonAddressMismatches = assessment.mismatches.filter((item: { field: string }) => !/address|pin|postal|city|street|locality/i.test(item.field));
      assessment.mismatches = [...nonAddressMismatches, ...candidateDifferences(body.candidateAddress, assessment.extraction.address)];
      assessment.overallStatus = assessment.mismatches.some((item: { severity: string }) => item.severity === "major") ? "needs_correction" : assessment.mismatches.length ? "needs_clarification" : "clear";
    }
    return NextResponse.json({ assessment, source: "openai" });
  } catch {
    return NextResponse.json({ assessment: demoAssessment(body.candidateAddress), source: "synthetic_demo", fallback: true });
  }
}
