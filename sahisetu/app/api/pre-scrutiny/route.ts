import OpenAI from "openai";
import { NextResponse } from "next/server";
import { createHash } from "crypto";

type DocumentInput = { name: string; dataUrl?: string };
type ModelAssessment = {
  overallStatus: "clear" | "needs_clarification" | "needs_correction";
  extraction: { address: string; applicantName: string; complete: boolean };
  quality: { status: "clear" | "needs_reupload"; issues: string[]; guidance: string };
  identity: { status: "match" | "needs_review" | "uncertain"; summary: string };
  mismatches: Array<{ field: string; severity: "minor" | "major"; [key: string]: unknown }>;
  documentValidation?: {
    licence: { status: "clear" | "needs_reupload" | "unrelated"; missingFields: string[]; guidance: string };
    proof: { status: "clear" | "needs_reupload" | "unrelated"; countryScope: "india" | "non_india" | "unclear"; missingFields: string[]; guidance: string };
  };
  [key: string]: unknown;
};

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
    documentTypes: {
      type: "object", additionalProperties: false,
      properties: { licenceSlot: { type: "string", enum: ["driving_licence", "address_proof", "unclear"] }, proofSlot: { type: "string", enum: ["driving_licence", "address_proof", "unclear"] } },
      required: ["licenceSlot", "proofSlot"],
    },
    documentValidation: {
      type: "object", additionalProperties: false,
      properties: {
        licence: {
          type: "object", additionalProperties: false,
          properties: { status: { type: "string", enum: ["clear", "needs_reupload", "unrelated"] }, missingFields: { type: "array", items: { type: "string" } }, guidance: { type: "string" } },
          required: ["status", "missingFields", "guidance"],
        },
        proof: {
          type: "object", additionalProperties: false,
          properties: { status: { type: "string", enum: ["clear", "needs_reupload", "unrelated"] }, countryScope: { type: "string", enum: ["india", "non_india", "unclear"] }, missingFields: { type: "array", items: { type: "string" } }, guidance: { type: "string" } },
          required: ["status", "countryScope", "missingFields", "guidance"],
        },
      },
      required: ["licence", "proof"],
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
  required: ["overallStatus", "confidence", "summary", "extraction", "quality", "identity", "documentTypes", "documentValidation", "mismatches"],
} as const;

const documentAddress = "12 M.G. Road, Indiranagar, Bengaluru, Karnataka 560038";
const assessmentCache = new Map<string, { assessment: unknown; source: "openai" | "synthetic_demo" }>();
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

const demoAssessment = (candidateAddress?: string, licenceName = "", proofName = "") => {
  const mismatches = candidateDifferences(candidateAddress, documentAddress);
  const licenceSlot = /aadhaar|aadhar|address|proof/i.test(licenceName) ? "address_proof" as const : "driving_licence" as const;
  const proofSlot = /licen[cs]e|dl/i.test(proofName) ? "driving_licence" as const : "address_proof" as const;
  return {
  overallStatus: mismatches.some((item) => item.severity === "major") ? "needs_correction" as const : mismatches.length ? "needs_clarification" as const : "clear" as const,
  confidence: 0.94,
  summary: "We extracted a complete new address from the synthetic address proof. The current licence is used to identify the record to update.",
  extraction: { address: documentAddress, applicantName: "Aarohi Sharma", complete: true },
  quality: { status: "clear" as const, issues: [], guidance: "Both synthetic documents are clear enough for this demo." },
  identity: { status: "match" as const, summary: "The visible applicant details appear consistent across the synthetic documents." },
  documentTypes: { licenceSlot, proofSlot },
  documentValidation: {
    licence: { status: "clear" as const, missingFields: [], guidance: "The synthetic driving licence shows the details needed for this demo." },
    proof: { status: "clear" as const, countryScope: "india" as const, missingFields: [], guidance: "The synthetic address proof contains an Indian address and six-digit PIN code." },
  },
  mismatches,
};
};

function blockInvalidDocuments(assessment: ModelAssessment) {
  const validation = assessment.documentValidation;
  if (!validation) return assessment;
  const licenceBlocked = validation.licence.status !== "clear";
  const proofBlocked = validation.proof.status !== "clear" || validation.proof.countryScope !== "india";
  if (!licenceBlocked && !proofBlocked) return assessment;

  const guidance = licenceBlocked
    ? validation.licence.guidance
    : validation.proof.countryScope === "non_india"
      ? "SahiSetu currently supports Indian address-change applications only. Upload a proof showing an Indian address and a six-digit PIN code."
      : validation.proof.guidance;
  assessment.quality = {
    status: "needs_reupload",
    issues: [...validation.licence.missingFields, ...validation.proof.missingFields],
    guidance,
  };
  assessment.extraction = { address: "", applicantName: "", complete: false };
  assessment.mismatches = [];
  assessment.overallStatus = "needs_correction";
  return assessment;
}

export async function POST(request: Request) {
  const body = await request.json() as { documents?: DocumentInput[]; candidateAddress?: string };
  const documents = body.documents ?? [];
  const licence = documents[0];
  const addressProof = documents[1];

  if (!licence?.dataUrl || !addressProof?.dataUrl) {
    return NextResponse.json({ error: "Please add both the current driving licence and new-address proof." }, { status: 400 });
  }
  if (licence.dataUrl === addressProof.dataUrl) {
    return NextResponse.json({ error: "The same image was added twice. Upload a separate proof of your new address." }, { status: 400 });
  }
  const cacheKey = createHash("sha256").update(`${licence.dataUrl}:${addressProof.dataUrl}:${body.candidateAddress ?? ""}`).digest("hex");
  const cached = assessmentCache.get(cacheKey);
  if (cached) return NextResponse.json({ ...cached, cached: true });

  const bundledDemoPair = /^demolicen[cs]e\.png$/i.test(licence.name) && /^demoaddress\.png$/i.test(addressProof.name);
  if (!process.env.OPENAI_API_KEY) {
    if (!bundledDemoPair) return NextResponse.json({ error: "AI checking is unavailable. Add an OpenAI API key to assess uploaded documents; only the built-in demo pair can run offline." }, { status: 503 });
    const result = { assessment: demoAssessment(body.candidateAddress, licence.name, addressProof.name), source: "synthetic_demo" as const }; assessmentCache.set(cacheKey, result); return NextResponse.json(result);
  }

  try {
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const response = await client.responses.create({
      model: "gpt-5.6-luna",
      store: false,
      reasoning: { effort: "none" },
      max_output_tokens: 800,
      instructions: "You are SahiSetu's conservative document pre-scrutiny assistant. Fail closed: if a required detail is obscured, missing, cropped, redacted, blurred, affected by glare, or not confidently readable, require a re-upload; never guess. First classify each image independently as driving_licence, address_proof, or unclear in documentTypes. A handwritten note, unrelated photo, screenshot, blank page, or arbitrary card is unclear. The first slot must be a CURRENT driving licence. In documentValidation.licence, require a legible applicant name, licence number, complete address including PIN, and a complete readable image. The licence's old address is expected and is never an address mismatch. The second slot must be a NEW-ADDRESS proof. In documentValidation.proof, require a legible applicant name and complete address with a six-digit PIN. countryScope is india only when the proof visibly supports an Indian address (Indian state/UT and six-digit PIN); non_india for a foreign address; unclear if insufficient evidence. If slots are swapped or any document is unclear/unrelated, do not extract an address or make identity/approval decisions. Extract a single clean Parivahan-ready address only when the second image is a valid Indian address proof. If the user supplies an edited address, compare it to that proof. Compare only visible applicant identity details; different visible names require needs_review. Ignore synthetic-demo, demo-only, and not-valid watermarks: they are deliberate prototype labels. Use needs_reupload for every document-validation failure. Use clarification_note only for harmless text variations; substantive conflicts require correct_form. Confidence is text-reading certainty, never approval likelihood. Return required JSON only.",
      input: [{ role: "user", content: [
        { type: "input_text", text: `Current driving-licence file: ${licence.name}\nNew-address-proof file: ${addressProof.name}${body.candidateAddress ? `\nEdited address to verify: ${body.candidateAddress}` : ""}` },
        { type: "input_image", image_url: licence.dataUrl, detail: "low" },
        { type: "input_image", image_url: addressProof.dataUrl, detail: "low" },
      ] }],
      text: { format: { type: "json_schema", name: "sahisetu_document_assessment", strict: true, schema } },
    }, { signal: AbortSignal.timeout(20_000) });
    const assessment = blockInvalidDocuments(JSON.parse(response.output_text) as ModelAssessment);
    if (body.candidateAddress) {
      const nonAddressMismatches = assessment.mismatches.filter((item: { field: string }) => !/address|pin|postal|city|street|locality/i.test(item.field));
      assessment.mismatches = [...nonAddressMismatches, ...candidateDifferences(body.candidateAddress, assessment.extraction.address)];
      assessment.overallStatus = assessment.mismatches.some((item: { severity: string }) => item.severity === "major") ? "needs_correction" : assessment.mismatches.length ? "needs_clarification" : "clear";
    } else {
      assessment.mismatches = assessment.mismatches.filter((item: { field: string }) => !/address|pin|postal|city|street|locality/i.test(item.field));
      assessment.overallStatus = assessment.mismatches.some((item: { severity: string }) => item.severity === "major") || assessment.identity.status === "needs_review" ? "needs_correction" : assessment.mismatches.length ? "needs_clarification" : "clear";
    }
    const result = { assessment, source: "openai" as const }; assessmentCache.set(cacheKey, result); return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "We could not complete the AI check. Please try again; no document decision was made." }, { status: 503 });
  }
}
