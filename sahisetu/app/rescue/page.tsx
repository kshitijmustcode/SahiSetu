"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useSyncExternalStore } from "react";
import { ExplainableAuditTimeline, type AuditTimelineStep } from "../components/explainable-audit-timeline";
import { SiteFooter, SiteNavigation } from "../components/site-chrome";
import { useLanguage } from "../components/language-toggle";
import { setDemoJourneyState, useDemoJourneyState } from "../lib/demo-journey-state";
import { SarathiPaymentStatusHandoff } from "../components/sarathi-address-change-handoff";

type RescueCase = "payment-pending" | "under-scrutiny" | "upload-pending";

const cases: Record<
  RescueCase,
  {
    shortTitle: string;
    title: string;
    description: string;
    status: string;
    warning: string;
    evidence: string[];
    nextAction: string;
    supportSummary: string;
    documentReview?: { href: string; label: string };
  }
> = {
  "payment-pending": {
    shortTitle: "Payment pending",
    title: "Payment pending should lead to a plan—not another payment.",
    description:
      "Neha’s payment is marked as deducted but pending. Keep the payment record together, then check the official status before considering another payment.",
    status: "Amount deducted · status pending",
    warning: "Do not pay again blindly.",
    evidence: [
      "Payment reference: DEMO-TXN-7742",
      "Application reference: DEMO-APP-NV-9081",
      "Transaction date and amount: 03 September 2026 · ₹450",
      "Demo status record showing payment pending",
    ],
    nextAction:
      "Keep the existing transaction details together, then use Sarathi’s Verify Pay Status before considering any further payment.",
    supportSummary:
      "Case: payment deducted but pending · Applicant: Neha Verma · Evidence: DEMO-APP-NV-9081 and DEMO-TXN-7742 · Next action: use Sarathi’s Verify Pay Status before considering any further payment.",
  },
  "under-scrutiny": {
    shortTitle: "Under Scrutiny",
    title: "An unclear status should lead to evidence—not guesswork.",
    description:
      "This application is marked `Under Scrutiny` without a clear citizen-facing reason. Retain what was submitted, then review an actual document difference before seeking clarification.",
    status: "Application status · Under Scrutiny",
    warning: "Do not assume an approval or rejection.",
    evidence: [
      "Application reference: DEMO-APP-RM-6114",
      "Status screenshot showing Under Scrutiny",
      "List of documents uploaded with the application",
      "Exact document wording or mismatch observed before submission",
    ],
    nextAction:
      "Retain the application evidence first. Review a document only when an actual mismatch is identified; otherwise use the relevant official status or support route with the evidence summary.",
    supportSummary:
      "Case: Under Scrutiny · Applicant: Rohan Mehta · Evidence: DEMO-APP-RM-6114 and uploaded-document record · Next action: retain evidence, review any known mismatch, then use the relevant official route for status clarification.",
    documentReview: { href: "/apply?demo=rohan", label: "Review Rohan’s document difference" },
  },
  "upload-pending": {
    shortTitle: "Upload pending",
    title: "A repeated upload is not always the safe next step.",
    description:
      "This case shows `Document Upload Pending` after documents were uploaded. Retain the original upload record before replacing anything, then follow the official status guidance.",
    status: "Document upload · pending",
    warning: "Do not discard the original upload evidence.",
    evidence: [
      "Application reference: DEMO-APP-AS-5026",
      "Screenshot showing Document Upload Pending",
      "Upload acknowledgement or timestamp",
      "Copies of the exact demo files originally attached",
    ],
    nextAction:
      "Keep the original upload evidence. Re-upload only when the official status or support route directs a replacement, or when SahiSetu identifies a clear readability or completeness problem.",
    supportSummary:
      "Case: Document Upload Pending · Applicant: Aarohi Sharma · Evidence: DEMO-APP-AS-5026 and original upload record · Next action: retain the initial upload evidence and use the official route to determine whether re-upload is required.",
    documentReview: { href: "/apply?demo=blurryProof", label: "See a re-upload-required example" },
  },
};

const order: RescueCase[] = ["payment-pending", "under-scrutiny", "upload-pending"];

const hindiCases: Record<
  RescueCase,
  Pick<
    (typeof cases)[RescueCase],
    "shortTitle" | "title" | "description" | "status" | "warning" | "evidence" | "nextAction" | "supportSummary"
  > & {
    documentReview?: { href: string; label: string };
  }
> = {
  "payment-pending": {
    shortTitle: "भुगतान लंबित",
    title: "भुगतान लंबित होने पर योजना चाहिए—एक और भुगतान नहीं।",
    description:
      "नेहा का भुगतान कटा हुआ लेकिन लंबित दिख रहा है। भुगतान रिकॉर्ड साथ रखें, फिर दूसरा भुगतान सोचने से पहले आधिकारिक स्थिति जाँचें।",
    status: "राशि कटी · स्थिति लंबित",
    warning: "बिना जाँचे दोबारा भुगतान न करें।",
    evidence: [
      "भुगतान संदर्भ: DEMO-TXN-7742",
      "आवेदन संदर्भ: DEMO-APP-NV-9081",
      "लेन-देन तिथि और राशि: 03 सितंबर 2026 · ₹450",
      "भुगतान लंबित दिखाता सिंथेटिक स्थिति रिकॉर्ड",
    ],
    nextAction:
      "मौजूदा लेन-देन विवरण साथ रखें, फिर किसी और भुगतान पर विचार करने से पहले Sarathi का Verify Pay Status उपयोग करें।",
    supportSummary:
      "मामला: भुगतान कटा लेकिन लंबित · आवेदक: नेहा वर्मा (सिंथेटिक) · प्रमाण: DEMO-APP-NV-9081 और DEMO-TXN-7742 · अगला कदम: किसी और भुगतान से पहले Sarathi का Verify Pay Status उपयोग करें।",
  },
  "under-scrutiny": {
    shortTitle: "जाँच में",
    title: "अस्पष्ट स्थिति पर अनुमान नहीं, प्रमाण चाहिए।",
    description:
      "इस आवेदन पर स्पष्ट नागरिक-उन्मुख कारण के बिना `Under Scrutiny` लिखा है। जमा किए गए रिकॉर्ड रखें, फिर स्पष्टीकरण लेने से पहले वास्तविक दस्तावेज़ अंतर की समीक्षा करें।",
    status: "आवेदन स्थिति · जाँच में",
    warning: "मंजूरी या अस्वीकृति मानकर न चलें।",
    evidence: [
      "आवेदन संदर्भ: DEMO-APP-RM-6114",
      "Under Scrutiny दिखाता स्थिति स्क्रीनशॉट",
      "आवेदन के साथ अपलोड दस्तावेज़ों की सूची",
      "सबमिशन से पहले दिखाई दिया सटीक दस्तावेज़ अंतर",
    ],
    nextAction:
      "पहले आवेदन का प्रमाण सुरक्षित रखें। दस्तावेज़ की समीक्षा केवल वास्तविक अंतर होने पर करें; अन्यथा प्रमाण-सार के साथ संबंधित आधिकारिक स्थिति या सहायता मार्ग उपयोग करें।",
    supportSummary:
      "मामला: जाँच में · आवेदक: रोहन मेहता (सिंथेटिक) · प्रमाण: DEMO-APP-RM-6114 और अपलोड-दस्तावेज़ रिकॉर्ड · अगला कदम: प्रमाण रखें, ज्ञात अंतर की समीक्षा करें, फिर आधिकारिक मार्ग से स्थिति स्पष्ट करें।",
    documentReview: { href: "/apply?demo=rohan", label: "रोहन के दस्तावेज़ अंतर की समीक्षा करें" },
  },
  "upload-pending": {
    shortTitle: "अपलोड लंबित",
    title: "हर बार दोबारा अपलोड करना सुरक्षित अगला कदम नहीं है।",
    description:
      "दस्तावेज़ अपलोड करने के बाद भी इस मामले में `Document Upload Pending` दिखता है। कुछ बदलने से पहले मूल अपलोड रिकॉर्ड रखें, फिर आधिकारिक स्थिति निर्देश देखें।",
    status: "दस्तावेज़ अपलोड · लंबित",
    warning: "मूल अपलोड का प्रमाण न हटाएँ।",
    evidence: [
      "आवेदन संदर्भ: DEMO-APP-AS-5026",
      "Document Upload Pending दिखाता स्क्रीनशॉट",
      "अपलोड रसीद या समय",
      "पहले संलग्न की गई सटीक सिंथेटिक फ़ाइलों की प्रतियाँ",
    ],
    nextAction:
      "मूल अपलोड प्रमाण रखें। दोबारा अपलोड केवल आधिकारिक स्थिति या सहायता मार्ग से निर्देश मिलने पर, या SahiSetu को स्पष्ट पठनीयता/पूर्णता की समस्या मिलने पर करें।",
    supportSummary:
      "मामला: दस्तावेज़ अपलोड लंबित · आवेदक: आराही शर्मा (सिंथेटिक) · प्रमाण: DEMO-APP-AS-5026 और मूल अपलोड रिकॉर्ड · अगला कदम: शुरुआती प्रमाण रखें और आधिकारिक मार्ग से जाँचें कि दोबारा अपलोड आवश्यक है या नहीं।",
    documentReview: { href: "/apply?demo=blurryProof", label: "दोबारा अपलोड आवश्यक उदाहरण देखें" },
  },
};

function subscribeToLocation(callback: () => void) {
  window.addEventListener("popstate", callback);
  return () => window.removeEventListener("popstate", callback);
}

function caseFromLocation(): RescueCase {
  const queryCase = new URLSearchParams(window.location.search).get("case");
  return queryCase && order.includes(queryCase as RescueCase) ? (queryCase as RescueCase) : "payment-pending";
}

export default function RescuePage() {
  const hindi = useLanguage() === "hi";
  const selectedCase = useSyncExternalStore<RescueCase>(subscribeToLocation, caseFromLocation, () => "payment-pending");
  const [retained, setRetained] = useState<string[]>([]);
  const demoJourney = useDemoJourneyState();
  const summaryCreated = selectedCase === "payment-pending" && demoJourney.nehaSummaryReady;

  const activeCase = hindi ? hindiCases[selectedCase] : cases[selectedCase];
  const retainedEvidence = selectedCase === "payment-pending" ? demoJourney.nehaEvidenceRetained : retained;
  const allRetained = retainedEvidence.length === activeCase.evidence.length;
  const auditSteps: AuditTimelineStep[] = [
    {
      label: hindi ? "स्थिति रिकॉर्ड" : "Status record",
      detail: activeCase.status,
      state: "complete",
    },
    {
      label: hindi ? "फ़ील्ड निकाले गए" : "Fields extracted",
      detail: selectedCase === "payment-pending" ? activeCase.evidence[0] : activeCase.evidence[1],
      state: "complete",
    },
    {
      label: hindi ? "नागरिक पुष्टि" : "Citizen confirmation",
      detail: allRetained
        ? hindi
          ? "सभी प्रमाण सूची आइटम सुरक्षित किए गए।"
          : "Every evidence-list item has been retained."
        : hindi
          ? "प्रमाण सूची पूरी करें।"
          : "Complete the evidence checklist.",
      state: allRetained ? "complete" : "current",
    },
    {
      label: hindi ? "तैयारी परिणाम" : "Readiness result",
      detail: summaryCreated
        ? hindi
          ? "सहायता-सार तैयार है; आधिकारिक निर्णय नहीं।"
          : "Support summary prepared; this is not an official decision."
        : hindi
          ? "एम्बर: स्थिति को आधिकारिक मार्ग से स्पष्ट करना है।"
          : "Amber: the status still needs official clarification.",
      state: summaryCreated ? "complete" : "attention",
    },
    {
      label: hindi ? "सुरक्षित अगली कार्रवाई" : "Safe next action",
      detail: activeCase.nextAction,
      state: summaryCreated ? "current" : "pending",
    },
  ];

  function selectCase(nextCase: RescueCase) {
    setRetained([]);
    window.history.replaceState({}, "", `/rescue?case=${nextCase}`);
    window.dispatchEvent(new PopStateEvent("popstate"));
  }

  function toggleEvidence(item: string) {
    if (selectedCase === "payment-pending") {
      const nextEvidence = retainedEvidence.includes(item)
        ? retainedEvidence.filter((value) => value !== item)
        : [...retainedEvidence, item];
      setDemoJourneyState({ nehaEvidenceRetained: nextEvidence, nehaSummaryReady: false });
      return;
    }
    setRetained((current) => (current.includes(item) ? current.filter((value) => value !== item) : [...current, item]));
  }

  return (
    <main className="min-h-screen bg-[#fffdf8] text-[#17281f]">
      <div className="mx-auto max-w-6xl px-5 py-5 sm:px-8">
        <SiteNavigation>
          <Link
            href="/demo"
            className="rounded-lg border border-[#c7dcc9] bg-[#f4faf3] px-3 py-2 text-sm font-semibold text-[#285536] hover:bg-[#eaf6ec]"
          >
            {hindi ? "डेमो बदलें" : "Change demo"}
          </Link>
        </SiteNavigation>
        <header className="border-b border-[#e1eade] py-10 sm:py-14">
          <p className="inline-flex rounded-full bg-[#fff1d7] px-3 py-1.5 text-sm font-semibold text-[#8a5410]">
            {hindi ? "आवेदन सहायता" : "Application Rescue"}
          </p>
          <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-[-0.05em] sm:text-5xl">{activeCase.title}</h1>
          <p className="mt-4 max-w-3xl text-lg leading-8 text-[#526558]">{activeCase.description}</p>
        </header>
        <section className="py-8">
          <p className="text-sm font-bold uppercase tracking-[0.14em] text-[#31804a]">
            {hindi ? "आपको क्या दिख रहा है?" : "What do you see?"}
          </p>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {order.map((caseKey) => (
              <button
                key={caseKey}
                onClick={() => selectCase(caseKey)}
                className={`rounded-2xl border p-4 text-left transition ${selectedCase === caseKey ? "border-[#166534] bg-[#edf8ef] shadow-sm" : "border-[#d9e5da] bg-white hover:border-[#9bcba4]"}`}
              >
                <p className="font-semibold">{hindi ? hindiCases[caseKey].shortTitle : cases[caseKey].shortTitle}</p>
                <p className="mt-1 text-sm leading-6 text-[#5b6e5f]">
                  {hindi ? hindiCases[caseKey].status : cases[caseKey].status}
                </p>
              </button>
            ))}
          </div>
        </section>
        <section className="grid gap-7 pb-10 lg:grid-cols-[.92fr_1.08fr]">
          <div className="self-start rounded-3xl border border-[#dce7dd] bg-white p-5 sm:p-7">
            {selectedCase === "payment-pending" ? (
              <>
                <p className="text-sm font-bold uppercase tracking-[0.14em] text-[#31804a]">
                  {hindi ? "डेमो स्थिति रिकॉर्ड" : "Demo status record"}
                </p>
                <div className="mt-4 overflow-hidden rounded-2xl border border-[#d8e4ed] bg-white">
                  <Image
                    src="/demo-documents/neha-verma-synthetic-payment-pending.png"
                    alt="Demo payment-pending record for Neha Verma"
                    width={1024}
                    height={1536}
                    className="h-auto w-full"
                    priority
                  />
                </div>
              </>
            ) : (
              <StatusRecord caseKey={selectedCase} />
            )}
            <p className="mt-3 text-xs leading-5 text-[#66796a]">
              {hindi
                ? "केवल काल्पनिक रिकॉर्ड। यह किसी वास्तविक भुगतान, सरकारी सेवा या आवेदक को नहीं दर्शाता।"
                : "Demo record only. It represents no real payment, government service, or applicant."}
            </p>
          </div>
          <div className="space-y-6">
            <section className="rounded-3xl border border-[#efd9a2] bg-[#fffaf0] p-6 sm:p-8">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-bold uppercase tracking-[0.14em] text-[#8a5a12]">
                    {hindi ? "सुरक्षित अगली कार्रवाई" : "Safe next action"}
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold">{activeCase.warning}</h2>
                </div>
                <span className="rounded-full bg-white px-3 py-1.5 text-sm font-bold text-[#8a5a12] ring-1 ring-[#efd9a2]">
                  {activeCase.shortTitle}
                </span>
              </div>
              <p className="mt-4 text-sm leading-6 text-[#6c5832]">{activeCase.nextAction}</p>
              {selectedCase === "payment-pending" ? <SarathiPaymentStatusHandoff hindi={hindi} /> : null}
            </section>
            <ExplainableAuditTimeline language={hindi ? "hi" : "en"} steps={auditSteps} />
            <section className="rounded-3xl border border-[#dce7dd] bg-white p-6 sm:p-8">
              <p className="text-sm font-bold uppercase tracking-[0.14em] text-[#31804a]">
                {hindi ? "प्रमाण सूची" : "Evidence checklist"}
              </p>
              <h2 className="mt-2 text-2xl font-semibold">
                {hindi ? "इन विवरणों को साथ रखें।" : "Keep these details together."}
              </h2>
              <p className="mt-3 text-sm leading-6 text-[#536b59]">
                {hindi
                  ? "सहायता-सार तैयार करने के लिए इस सूची में हर विवरण की पुष्टि करें।"
                  : "Confirm each item to prepare a clear support summary."}
              </p>
              <div className="mt-5 space-y-3">
                {activeCase.evidence.map((item) => (
                  <label
                    key={item}
                    className="flex cursor-pointer items-center gap-3 rounded-xl border border-[#d8e5d9] bg-[#fbfefb] p-4 text-sm font-semibold text-[#38563e]"
                  >
                    <input
                      type="checkbox"
                      checked={retainedEvidence.includes(item)}
                      onChange={() => toggleEvidence(item)}
                      className="h-4 w-4 accent-[#166534]"
                    />
                    <span>{item}</span>
                  </label>
                ))}
              </div>
              <button
                disabled={!allRetained || summaryCreated}
                onClick={() => {
                  if (selectedCase === "payment-pending") setDemoJourneyState({ nehaSummaryReady: true });
                }}
                className="mt-6 w-full rounded-xl bg-[#193b63] px-5 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-45"
              >
                {summaryCreated
                  ? hindi
                    ? "सहायता-सार तैयार है"
                    : "Support summary prepared"
                  : hindi
                    ? "सहायता-सार तैयार करें"
                    : "Prepare support summary"}
              </button>
              {summaryCreated && (
                <>
                  <div className="mt-4 rounded-2xl border border-[#bfe0c5] bg-[#eef9f0] p-4 text-sm leading-6 text-[#246238]">
                    <strong>✓ {hindi ? "सहायता-सार तैयार है।" : "Support summary prepared."}</strong>
                    <br />
                    {activeCase.supportSummary}
                  </div>
                  {selectedCase === "payment-pending" && (
                    <Link
                      href="/handoff?case=neha"
                      className="mt-4 block rounded-xl bg-[#166534] px-4 py-3 text-center font-semibold text-white hover:bg-[#10572b]"
                    >
                      {hindi ? "हैंडऑफ पैक खोलें →" : "Open handoff pack →"}
                    </Link>
                  )}
                </>
              )}
              {activeCase.documentReview && (
                <Link
                  href={activeCase.documentReview.href}
                  className="mt-4 block rounded-xl border border-[#bfd8c2] bg-white px-4 py-3 text-center font-semibold text-[#285536] hover:bg-[#f4faf3]"
                >
                  {activeCase.documentReview.label} →
                </Link>
              )}
            </section>
          </div>
        </section>
        <SiteFooter>
          {hindi
            ? "SahiSetu एक स्वतंत्र, केवल-सिंथेटिक-डेटा प्रोटोटाइप है—आधिकारिक सरकारी सेवा नहीं।"
            : "Independent demo · not an official government service."}
        </SiteFooter>
      </div>
    </main>
  );
}

function StatusRecord({ caseKey }: { caseKey: Exclude<RescueCase, "payment-pending"> }) {
  const record =
    caseKey === "under-scrutiny"
      ? {
          title: "Application status",
          status: "Under Scrutiny",
          application: "DEMO-APP-RM-6114",
          detail: "A document or detail may need human review. The status alone does not state approval or rejection.",
          accent: "text-[#8a5a12]",
        }
      : {
          title: "Document upload status",
          status: "Document Upload Pending",
          application: "DEMO-APP-AS-5026",
          detail:
            "The original upload record should be retained while the citizen checks whether a replacement is actually required.",
          accent: "text-[#234f7d]",
        };
  return (
    <div>
      <p className="text-sm font-bold uppercase tracking-[0.14em] text-[#31804a]">Demo status record</p>
      <div className="mt-4 rounded-2xl border border-[#d8e4ed] bg-[#fbfefb] p-6">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#607666]">{record.title}</p>
        <p className={`mt-3 text-2xl font-semibold ${record.accent}`}>{record.status}</p>
        <div className="mt-6 rounded-xl bg-white p-4 text-sm leading-6 text-[#526958]">
          <p>
            <strong>Application reference:</strong> {record.application}
          </p>
          <p className="mt-2">
            <strong>Demo note:</strong> {record.detail}
          </p>
        </div>
        <p className="mt-5 text-xs font-bold uppercase tracking-[0.12em] text-[#9a4b31]">
          Demo record · not an official status record
        </p>
      </div>
    </div>
  );
}
