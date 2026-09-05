"use client";

import Image from "next/image";
import Link from "next/link";
import { ChangeEvent, FormEvent, useEffect, useRef, useState } from "react";
import { ExplainableAuditTimeline } from "../components/explainable-audit-timeline";
import { LanguageToggle, useLanguage, type Language } from "../components/language-toggle";
import { SarathiAddressChangeHandoff } from "../components/sarathi-address-change-handoff";
import { setDemoJourneyState } from "../lib/demo-journey-state";

type UploadedFile = { name: string; size: string; dataUrl: string; warning?: string } | null;
type Mismatch = {
  field: string;
  formValue: string;
  documentValue: string;
  severity: "minor" | "major";
  explanation: string;
  recommendedAction: "clarification_note" | "correct_form";
};
type Assessment = {
  overallStatus: "clear" | "needs_clarification" | "needs_correction";
  confidence: number;
  summary: string;
  extraction: { address: string; applicantName: string; complete: boolean };
  quality: { status: "clear" | "needs_reupload"; issues: string[]; guidance: string };
  identity: { status: "match" | "needs_review" | "uncertain"; summary: string };
  documentTypes: {
    licenceSlot: "driving_licence" | "address_proof" | "unclear";
    proofSlot: "driving_licence" | "address_proof" | "unclear";
  };
  documentValidation: {
    licence: { status: "clear" | "needs_reupload" | "unrelated"; missingFields: string[]; guidance: string };
    proof: {
      status: "clear" | "needs_reupload" | "unrelated";
      countryScope: "india" | "non_india" | "unclear";
      missingFields: string[];
      guidance: string;
    };
  };
  mismatches: Mismatch[];
};
type DemoCase = "normal" | "rohan" | "hiddenLicence" | "blurryProof" | "glareProof" | "croppedProof";
type SafetyCase = "hiddenLicence" | "blurryProof" | "glareProof" | "croppedProof";

export default function ApplyPage() {
  const [licence, setLicence] = useState<UploadedFile>(null);
  const [proof, setProof] = useState<UploadedFile>(null);
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [source, setSource] = useState<"openai" | "synthetic_demo" | null>(null);
  const [stage, setStage] = useState<1 | 2 | 3>(1);
  const language = useLanguage();
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [loadingDemo, setLoadingDemo] = useState(false);
  const [showDemoPreview, setShowDemoPreview] = useState(false);
  const [error, setError] = useState("");
  const stageHeadingRef = useRef<HTMLElement>(null);
  const previousStageRef = useRef(stage);
  const hindi = language === "hi";

  useEffect(() => {
    if (previousStageRef.current === stage) return;
    previousStageRef.current = stage;
    const behaviour = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
    window.scrollTo({ top: 0, left: 0, behavior: behaviour });
    window.requestAnimationFrame(() => stageHeadingRef.current?.focus({ preventScroll: true }));
  }, [stage]);

  const duplicateDocuments = Boolean(licence && proof && licence.dataUrl === proof.dataUrl);

  async function addFile(
    event: ChangeEvent<HTMLInputElement>,
    setFile: (file: UploadedFile) => void,
    otherFile: UploadedFile,
  ) {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const preparedFile = await optimisedFile(file);
      setFile(preparedFile);
      setError(
        otherFile?.dataUrl === preparedFile.dataUrl
          ? "These are the same image. Add a separate proof of your new address before continuing."
          : "",
      );
    } catch {
      setError("We could not read that file. Please choose a clear PNG or JPEG image.");
    }
  }

  async function loadDocumentPair(
    licenceAsset: { path: string; name: string },
    proofAsset: { path: string; name: string },
  ) {
    setError("");
    setLoadingDemo(true);
    try {
      const [licenceResponse, proofResponse] = await Promise.all([fetch(licenceAsset.path), fetch(proofAsset.path)]);
      if (!licenceResponse.ok || !proofResponse.ok) throw new Error("Demo documents are unavailable.");
      const [licenceBlob, proofBlob] = await Promise.all([licenceResponse.blob(), proofResponse.blob()]);
      const [demoLicence, demoProof] = await Promise.all([
        optimisedFile(new File([licenceBlob], licenceAsset.name, { type: "image/png" })),
        optimisedFile(new File([proofBlob], proofAsset.name, { type: "image/png" })),
      ]);
      setLicence(demoLicence);
      setProof(demoProof);
    } catch {
      setError("We could not load the demo documents. Please choose the demo files manually.");
    } finally {
      setLoadingDemo(false);
    }
  }

  function loadDemoDocuments() {
    return loadDocumentPair(
      {
        path: "/demo-documents/aarohi-sharma-synthetic-driving-licence-with-expiry.png",
        name: "AarohiDrivingLicence.png",
      },
      { path: "/demo-documents/synthetic-address-proof.png?v=aarohi-v4", name: "DemoAddress.png" },
    );
  }

  function loadRohanDocuments() {
    return loadDocumentPair(
      {
        path: "/demo-documents/rohan-mehta-synthetic-driving-licence-old-address.png",
        name: "rohan-mehta-driving-licence-old-address.png",
      },
      { path: "/demo-documents/rohan-mehta-synthetic-address-proof.png", name: "rohan-mehta-address-proof.png" },
    );
  }

  function loadSafetyCase(kind: SafetyCase) {
    const validLicence = {
      path: "/demo-documents/aarohi-sharma-synthetic-driving-licence-with-expiry.png",
      name: "AarohiDrivingLicence.png",
    };
    const validProof = { path: "/demo-documents/synthetic-address-proof.png?v=aarohi-v4", name: "DemoAddress.png" };
    const cases = {
      hiddenLicence: [
        { path: "/demo-documents/hidden-address-license.png", name: "hidden-address-license.png" },
        validProof,
      ],
      blurryProof: [validLicence, { path: "/demo-documents/blurry-aadhar.png", name: "blurry-aadhar.png" }],
      glareProof: [validLicence, { path: "/demo-documents/glare-address-proof.png", name: "glare-address-proof.png" }],
      croppedProof: [
        validLicence,
        { path: "/demo-documents/cropped-address-proof.png", name: "cropped-address-proof.png" },
      ],
    } as const;
    const [licenceAsset, proofAsset] = cases[kind];
    return loadDocumentPair(licenceAsset, proofAsset);
  }

  useEffect(() => {
    const queryDemo = new URLSearchParams(window.location.search).get("demo") as DemoCase | null;
    const demo = queryDemo ?? (window.sessionStorage.getItem("sahisetu-demo") as DemoCase | null);
    if (!demo || !["normal", "rohan", "hiddenLicence", "blurryProof", "glareProof", "croppedProof"].includes(demo))
      return;
    if (queryDemo) {
      window.sessionStorage.setItem("sahisetu-demo", demo);
      window.history.replaceState({}, "", "/apply");
    }
    const timer = window.setTimeout(() => {
      window.sessionStorage.removeItem("sahisetu-demo");
      if (demo === "normal") void loadDemoDocuments();
      else if (demo === "rohan") void loadRohanDocuments();
      else void loadSafetyCase(demo as SafetyCase);
    }, 0);
    return () => window.clearTimeout(timer);
    // Demo links are intentionally consumed once, when this page mounts.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function startCheck(event: FormEvent) {
    event.preventDefault();
    if (!licence || !proof) {
      setError("Add both the current driving licence and new-address proof first.");
      return;
    }
    if (licence.dataUrl === proof.dataUrl) {
      setError("These appear to be the same image. Add a separate proof of your new address.");
      return;
    }
    if (licence.warning || proof.warning) {
      setError("Replace the flagged image before continuing. We should not make a decision from an unclear document.");
      return;
    }
    setError("");
    setLoading(true);
    setLoadingMessage(hindi ? "दस्तावेज़ तैयार किए जा रहे हैं…" : "Preparing your documents…");
    const clarityTimer = window.setTimeout(
      () => setLoadingMessage(hindi ? "दस्तावेज़ की स्पष्टता जाँची जा रही है…" : "Checking document clarity…"),
      500,
    );
    const addressTimer = window.setTimeout(
      () => setLoadingMessage(hindi ? "नया पता पढ़ा जा रहा है…" : "Reading the new address…"),
      1700,
    );
    const retryTimer = window.setTimeout(
      () =>
        setLoadingMessage(
          hindi
            ? "जाँच जारी है—ज़रूरत होने पर सुरक्षित रूप से फिर प्रयास किया जाएगा…"
            : "Still checking—SahiSetu will safely retry once if needed…",
        ),
      4000,
    );
    try {
      const response = await fetch("/api/pre-scrutiny", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documents: [licence, proof] }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "We could not run the document check.");
      setAssessment(data.assessment);
      setSource(data.source);
      setStage(2);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "We could not run the document check.");
    } finally {
      window.clearTimeout(clarityTimer);
      window.clearTimeout(addressTimer);
      window.clearTimeout(retryTimer);
      setLoading(false);
      setLoadingMessage("");
    }
  }

  const stageName =
    stage === 1
      ? hindi
        ? "दस्तावेज़ अपलोड करें"
        : "Upload"
      : stage === 2
        ? hindi
          ? "पता जाँचें"
          : "Review address"
        : hindi
          ? "रिपोर्ट सहेजें"
          : "Save report";
  return (
    <main className="min-h-screen bg-[#fffdf8] text-[#17281f]">
      <div className="mx-auto max-w-3xl px-5 py-6 sm:px-8 sm:py-10">
        <div className="flex items-center justify-between gap-3 print:hidden">
          <Link href="/" className="inline-flex text-sm font-semibold text-[#356044] hover:text-[#166534]">
            ← {hindi ? "SahiSetu पर वापस" : "Back to SahiSetu"}
          </Link>
          <div className="flex items-center gap-2">
            <a
              href="https://github.com/kshitijmustcode/SahiSetu"
              target="_blank"
              rel="noreferrer"
              className="rounded-lg border border-[#d7e1d7] bg-white px-2.5 py-1.5 text-xs font-semibold text-[#285536] hover:bg-[#f4faf3]"
              aria-label="View the SahiSetu source code on GitHub"
            >
              GitHub ↗
            </a>
            <LanguageToggle />
          </div>
        </div>
        <header ref={stageHeadingRef} tabIndex={-1} className="mt-9 outline-none print:hidden">
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold uppercase tracking-[0.14em] text-[#31804a]">
              {hindi ? "पता परिवर्तन" : "Address change"}
            </p>
            <p className="text-sm font-medium text-[#617466]">
              {stageName} · {hindi ? `चरण ${stage}/3` : `Step ${stage} of 3`}
            </p>
          </div>
          <div className="mt-3 h-2 rounded-full bg-[#e4ede3]">
            <div
              className={`h-full rounded-full bg-[#218144] ${stage === 1 ? "w-1/3" : stage === 2 ? "w-2/3" : "w-full"}`}
            />
          </div>
        </header>
        {assessment ? (
          <Results
            assessment={assessment}
            source={source}
            proof={proof}
            licence={licence}
            language={language}
            onAssessment={(nextAssessment, nextSource) => {
              setAssessment(nextAssessment);
              setSource(nextSource);
            }}
            onSwap={() => {
              setLicence(proof);
              setProof(licence);
              setAssessment(null);
              setStage(1);
            }}
            onPacketReady={() => setStage(3)}
            onBackToReview={() => setStage(2)}
            onReset={() => {
              setAssessment(null);
              setStage(1);
            }}
          />
        ) : (
          <form onSubmit={startCheck} className="mt-8 space-y-8">
            <section>
              <p className="text-sm font-bold uppercase tracking-[0.14em] text-[#31804a]">
                {hindi ? "टाइप नहीं, प्रमाण से शुरू करें" : "Start with proof, not typing"}
              </p>
              <h1 className="mt-3 text-4xl font-semibold tracking-[-0.045em] sm:text-5xl">
                {hindi ? "हम आपके लिए जाँचने योग्य पता तैयार करते हैं।" : "We prepare a reviewable address for you."}
              </h1>
              <p className="mt-4 max-w-2xl text-lg leading-8 text-[#586b5d]">
                {hindi
                  ? "अपना मौजूदा ड्राइविंग लाइसेंस और नए पते का डेमो प्रमाण अपलोड करें। SahiSetu पता पढ़ता है, दस्तावेज़ की स्पष्टता जाँचता है और स्थानीय समीक्षा रिकॉर्ड सहेजने से पहले आपसे पुष्टि करवाता है।"
                  : "Upload your current driving licence and a demo proof of your new address. SahiSetu extracts a clean address, checks document clarity, and asks you to confirm it before saving a local review record."}
              </p>
            </section>
            <section className="rounded-3xl border border-[#dbe8dc] bg-white p-6 sm:p-8">
              <div className="flex items-start gap-3">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#e8f5e9] font-bold text-[#22733b]">
                  1
                </span>
                <div>
                  <h2 className="text-xl font-semibold">{hindi ? "दो दस्तावेज़ जोड़ें" : "Add your two documents"}</h2>
                  <p className="mt-1 text-sm leading-6 text-[#647466]">
                    {hindi
                      ? "इस प्रोटोटाइप में केवल सिंथेटिक PNG या JPEG छवियों का उपयोग करें। लाइसेंस में पुराना पता होना अपेक्षित है।"
                      : "Use the provided demo PNG or JPEG images only. The current licence may show the old address—that is expected."}
                  </p>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <span className="inline-flex rounded-full bg-[#fff1d7] px-3 py-1.5 text-xs font-semibold text-[#8a5410]">
                  {hindi ? "केवल डेमो डेटा · वास्तविक आईडी अपलोड न करें" : "DEMO DATA ONLY · Do not upload real IDs"}
                </span>
                <button
                  type="button"
                  onClick={loadDemoDocuments}
                  disabled={loadingDemo}
                  className="rounded-lg border border-[#b9d5bd] bg-white px-3 py-1.5 text-sm font-semibold text-[#246538] disabled:opacity-60"
                >
                  {loadingDemo
                    ? hindi
                      ? "डेमो लोड हो रहा है…"
                      : "Loading demo…"
                    : hindi
                      ? "डेमो दस्तावेज़ आज़माएँ"
                      : "Try with demo documents"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowDemoPreview(!showDemoPreview)}
                  className="text-sm font-semibold text-[#285536] underline"
                >
                  {showDemoPreview
                    ? hindi
                      ? "डेमो दस्तावेज़ छिपाएँ"
                      : "Hide demo documents"
                    : hindi
                      ? "डेमो दस्तावेज़ देखें"
                      : "View demo documents"}
                </button>
              </div>
              <div className="mt-5 rounded-2xl border border-[#d7e5d9] bg-[#fbfefb] p-4">
                <p className="text-sm font-semibold">{hindi ? "सुरक्षा जाँच आज़माएँ" : "Test safety checks"}</p>
                <p className="mt-1 text-xs leading-5 text-[#617466]">
                  {hindi
                    ? "एक सिंथेटिक टेस्ट जोड़ी लोड करें, फिर उसी OpenAI जाँच को चलाएँ।"
                    : "Load a demo test pair, then run the same OpenAI check."}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={loadingDemo}
                    onClick={() => loadSafetyCase("hiddenLicence")}
                    className="rounded-lg border border-[#b9d5bd] bg-white px-3 py-2 text-sm font-semibold text-[#246538] disabled:opacity-60"
                  >
                    {hindi ? "छिपा लाइसेंस पता" : "Hidden licence address"}
                  </button>
                  <button
                    type="button"
                    disabled={loadingDemo}
                    onClick={() => loadSafetyCase("blurryProof")}
                    className="rounded-lg border border-[#b9d5bd] bg-white px-3 py-2 text-sm font-semibold text-[#246538] disabled:opacity-60"
                  >
                    {hindi ? "धुंधला प्रमाण" : "Blurry proof"}
                  </button>
                  <button
                    type="button"
                    disabled={loadingDemo}
                    onClick={() => loadSafetyCase("glareProof")}
                    className="rounded-lg border border-[#b9d5bd] bg-white px-3 py-2 text-sm font-semibold text-[#246538] disabled:opacity-60"
                  >
                    {hindi ? "चमक वाला प्रमाण" : "Glare on proof"}
                  </button>
                  <button
                    type="button"
                    disabled={loadingDemo}
                    onClick={() => loadSafetyCase("croppedProof")}
                    className="rounded-lg border border-[#b9d5bd] bg-white px-3 py-2 text-sm font-semibold text-[#246538] disabled:opacity-60"
                  >
                    {hindi ? "कटा हुआ प्रमाण" : "Cropped proof"}
                  </button>
                </div>
              </div>
              {showDemoPreview && (
                <div className="mt-5 rounded-2xl border border-[#d7e5d9] bg-[#fbfefb] p-4">
                  <p className="text-sm font-semibold">
                    {hindi
                      ? "इनमें केवल Aarohi Sharma का काल्पनिक डेमो डेटा है।"
                      : "These contain demo data for Aarohi Sharma only."}
                  </p>
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <figure>
                      <div className="overflow-hidden rounded-xl border border-[#d8e5d9] bg-white">
                        <Image
                          src="/demo-documents/aarohi-sharma-synthetic-driving-licence-with-expiry.png"
                          alt="Demo driving licence"
                          width={540}
                          height={740}
                          className="h-48 w-full object-cover object-top"
                        />
                      </div>
                      <figcaption className="mt-2 text-xs text-[#617466]">
                        {hindi ? "मौजूदा लाइसेंस · पुराना पता अपेक्षित" : "Current licence · old address expected"}
                      </figcaption>
                    </figure>
                    <figure>
                      <div className="overflow-hidden rounded-xl border border-[#d8e5d9] bg-white">
                        <Image
                          src="/demo-documents/synthetic-address-proof.png?v=aarohi-v4"
                          alt="Demo address proof"
                          width={540}
                          height={740}
                          className="h-48 w-full object-cover object-top"
                        />
                      </div>
                      <figcaption className="mt-2 text-xs text-[#617466]">
                        {hindi ? "नए पते का प्रमाण · 560038" : "New-address proof · 560038"}
                      </figcaption>
                    </figure>
                  </div>
                </div>
              )}
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <UploadCard
                  title={hindi ? "मौजूदा ड्राइविंग लाइसेंस" : "Current driving licence"}
                  hint={
                    hindi
                      ? "अपडेट होने वाले लाइसेंस रिकॉर्ड की पहचान करता है।"
                      : "Identifies the licence record to update."
                  }
                  file={licence}
                  onChange={(event) => addFile(event, setLicence, proof)}
                />
                <UploadCard
                  title={hindi ? "नए पते का प्रमाण" : "New-address proof"}
                  hint={hindi ? "नए पते का डेमो आधार-जैसा प्रमाण।" : "Demo Aadhaar-style proof of the new address."}
                  file={proof}
                  onChange={(event) => addFile(event, setProof, licence)}
                />
              </div>
              <div className="mt-5 rounded-2xl bg-[#f7f8f4] p-4 text-sm leading-6 text-[#566b5a]">
                <strong>{hindi ? "स्पष्ट फोटो के सुझाव:" : "Clear image tips:"}</strong>
                <ul className="mt-2 list-disc space-y-1 pl-5">
                  <li>{hindi ? "PIN कोड और पता पूरा दिखना चाहिए" : "Keep the full address and PIN code in frame"}</li>
                  <li>{hindi ? "चमक, धुंधलापन या छाया से बचें" : "Avoid glare, blur, shadows, or cropped edges"}</li>
                  <li>{hindi ? "PNG या JPEG फ़ाइल अपलोड करें" : "Upload a PNG or JPEG image"}</li>
                </ul>
              </div>
              {duplicateDocuments && (
                <p className="mt-5 rounded-xl bg-[#fff0ee] px-4 py-3 text-sm leading-6 text-[#9d301e]">
                  <strong>Two different documents are needed.</strong> The same image is attached twice. Replace the
                  new-address proof with a separate image.
                </p>
              )}
            </section>
            {error && <p className="rounded-xl bg-[#fff0ee] px-4 py-3 text-sm leading-6 text-[#9d301e]">{error}</p>}
            <section className="rounded-2xl bg-[#f3f9f2] p-5 text-sm leading-6 text-[#44634b]">
              <strong>{hindi ? "गोपनीयता और सुरक्षा:" : "Privacy and safety:"}</strong>{" "}
              {hindi
                ? "यह एक डेमो है। केवल सिंथेटिक भारतीय दस्तावेज़ों का उपयोग करें। वास्तविक सरकारी आईडी या आधार नंबर अपलोड न करें। छवि बहुत छोटी या अस्पष्ट होने पर SahiSetu अनुमान लगाने के बजाय रुक जाता है।"
                : "Demo files only—do not upload real government IDs or Aadhaar numbers. SahiSetu stops if an image is too small or unclear rather than guessing."}
            </section>
            <button
              disabled={loading || duplicateDocuments}
              className="w-full rounded-xl bg-[#166534] px-6 py-4 text-base font-semibold text-white shadow-lg shadow-[#166534]/20 hover:bg-[#10572b] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? loadingMessage
                : error
                  ? hindi
                    ? "जाँच फिर से आज़माएँ →"
                    : "Try checking again →"
                  : hindi
                    ? "मेरा पता निकालें और दस्तावेज़ जाँचें →"
                    : "Extract my address and check documents →"}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}

function UploadCard({
  title,
  hint,
  file,
  onChange,
}: {
  title: string;
  hint: string;
  file: UploadedFile;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
}) {
  const id = title.toLowerCase().replaceAll(" ", "-");
  return (
    <div className="rounded-2xl border border-dashed border-[#abc9b0] bg-[#fbfefb] p-5">
      <p className="font-semibold">{title}</p>
      <p className="mt-2 text-sm leading-5 text-[#6a7a6d]">{hint}</p>
      {file ? (
        <div className={`mt-4 rounded-xl p-3 ${file.warning ? "bg-[#fff0dc]" : "bg-[#e9f6eb]"}`}>
          <p className={`truncate text-sm font-semibold ${file.warning ? "text-[#925810]" : "text-[#1c6836]"}`}>
            {file.warning ? "!" : "✓"} {file.name}
          </p>
          <p className="mt-1 text-xs text-[#59775e]">
            {file.size}
            {file.warning ? ` · ${file.warning}` : " · ready to check"}
          </p>
          <Image
            src={file.dataUrl}
            alt={`Preview of ${file.name}`}
            width={600}
            height={380}
            unoptimized
            className="mt-3 h-28 w-full rounded-lg border border-[#cde0cf] bg-white object-contain"
          />
          <label htmlFor={id} className="mt-3 inline-block cursor-pointer text-sm font-semibold text-[#287a43]">
            Replace image
          </label>
        </div>
      ) : (
        <label
          htmlFor={id}
          className="mt-4 inline-block cursor-pointer rounded-lg border border-[#b9d5bd] bg-white px-3 py-2 text-sm font-semibold text-[#2a713e]"
        >
          Choose image
        </label>
      )}
      <input id={id} className="sr-only" accept="image/png,image/jpeg" type="file" onChange={onChange} />
    </div>
  );
}

async function optimisedFile(file: File): Promise<NonNullable<UploadedFile>> {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
  const image = new window.Image();
  image.src = dataUrl;
  await new Promise<void>((resolve, reject) => {
    image.onload = () => resolve();
    image.onerror = () => reject(new Error("Unreadable image"));
  });
  const warning = Math.min(image.width, image.height) < 700 ? "image is too small—upload a sharper scan" : undefined;
  const scale = Math.min(1, 1280 / Math.max(image.width, image.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(image.width * scale);
  canvas.height = Math.round(image.height * scale);
  canvas.getContext("2d")?.drawImage(image, 0, 0, canvas.width, canvas.height);
  return {
    name: file.name,
    size: `${Math.max(1, Math.round(file.size / 1024))} KB`,
    dataUrl: canvas.toDataURL("image/jpeg", 0.78),
    warning,
  };
}

function Results({
  assessment,
  source,
  proof,
  licence,
  language,
  onAssessment,
  onSwap,
  onPacketReady,
  onBackToReview,
  onReset,
}: {
  assessment: Assessment;
  source: "openai" | "synthetic_demo" | null;
  proof: UploadedFile;
  licence: UploadedFile;
  language: Language;
  onAssessment: (assessment: Assessment, source: "openai" | "synthetic_demo") => void;
  onSwap: () => void;
  onPacketReady: () => void;
  onBackToReview: () => void;
  onReset: () => void;
}) {
  const hindi = language === "hi";
  const isRohanAddressChangeDemo = Boolean(
    licence && proof && /rohan/i.test(licence.name) && /rohan/i.test(proof.name),
  );
  const isAarohiRenewalDemo = Boolean(
    licence && proof && /aarohi/i.test(licence.name) && /demoaddress/i.test(proof.name),
  );
  const [accepted, setAccepted] = useState(false);
  const [addressDraft, setAddressDraft] = useState(assessment.extraction.address);
  const [confirmationError, setConfirmationError] = useState("");
  const [signed, setSigned] = useState(false);
  const [clarificationOpen, setClarificationOpen] = useState(false);
  const [packetReady, setPacketReady] = useState(false);
  const reportId = `SS-${new Date().getTime().toString().slice(-6)}`;
  const timestamp = new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" }).format(new Date());
  const qualityBlocked = assessment.quality.status === "needs_reupload";
  const documentsSwapped =
    assessment.documentTypes.licenceSlot === "address_proof" &&
    assessment.documentTypes.proofSlot === "driving_licence";
  const documentTypeBlocked =
    assessment.documentTypes.licenceSlot === "unclear" ||
    assessment.documentTypes.proofSlot === "unclear" ||
    assessment.documentTypes.licenceSlot === assessment.documentTypes.proofSlot;
  const blockedDocument =
    assessment.documentValidation.licence.status !== "clear"
      ? hindi
        ? "मौजूदा ड्राइविंग लाइसेंस"
        : "current driving licence"
      : hindi
        ? "नए पते का प्रमाण"
        : "new-address proof";
  const addressMajorMismatch = assessment.mismatches.some((item) => item.severity === "major");
  const identityNeedsReview = assessment.identity.status === "needs_review";
  const majorMismatch = addressMajorMismatch || identityNeedsReview;
  const minorMismatches = assessment.mismatches.filter(
    (item) => item.severity === "minor" && item.recommendedAction === "clarification_note",
  );
  const addressWasEdited = addressDraft.trim() !== assessment.extraction.address.trim();
  const ready = !qualityBlocked && !majorMismatch && accepted && (minorMismatches.length === 0 || signed);
  const documentsReadable = !qualityBlocked && !documentTypeBlocked && !documentsSwapped;
  const identityMatched = assessment.identity.status === "match";
  const addressConfirmed = accepted && !addressMajorMismatch && (minorMismatches.length === 0 || signed);
  function confirmAddress() {
    if (!addressDraft.trim()) {
      setConfirmationError("Enter the address you want to use before continuing.");
      return;
    }
    setConfirmationError("");
    onAssessment(compareEditedAddress(assessment, addressDraft), source ?? "synthetic_demo");
    setAccepted(true);
  }
  if (packetReady)
    return (
      <Packet
        reportId={reportId}
        timestamp={timestamp}
        language={language}
        assessment={assessment}
        licence={licence}
        proof={proof}
        finalAddress={addressDraft}
        minorNoteSigned={signed}
        handoffCase={isAarohiRenewalDemo ? "aarohi" : isRohanAddressChangeDemo ? "rohan" : undefined}
        onBack={() => {
          setPacketReady(false);
          onBackToReview();
        }}
        onReset={onReset}
      />
    );

  return (
    <section className="mt-8 space-y-6">
      <p className="text-sm font-bold uppercase tracking-[0.14em] text-[#31804a]">
        {hindi ? "पूर्व-जाँच परिणाम" : "Pre-scrutiny result"}
      </p>
      {documentsSwapped ? (
        <section className="rounded-3xl border border-[#f1c787] bg-[#fff8eb] p-7">
          <h1 className="text-3xl font-semibold">
            {hindi ? "दस्तावेज़ गलत जगह पर हैं।" : "Your documents are in the wrong slots."}
          </h1>
          <p className="mt-3 leading-7 text-[#615945]">
            {hindi
              ? "नए पते का प्रमाण लाइसेंस वाले स्थान पर और लाइसेंस प्रमाण वाले स्थान पर दिखता है।"
              : "The new-address proof appears in the licence slot, and the driving licence appears in the proof slot."}
          </p>
          <button onClick={onSwap} className="mt-6 rounded-xl bg-[#166534] px-5 py-3 font-semibold text-white">
            {hindi ? "दस्तावेज़ बदलें" : "Swap documents"}
          </button>
        </section>
      ) : documentTypeBlocked || qualityBlocked ? (
        <section className="rounded-3xl border border-[#f1c787] bg-[#fff8eb] p-7">
          <p className="text-sm font-bold uppercase tracking-[0.14em] text-[#9a5b13]">
            {hindi ? "ध्यान दें" : "Needs attention"}
          </p>
          <h1 className="mt-2 text-3xl font-semibold">
            {hindi ? "हमें सही दस्तावेज़ चाहिए।" : "We need the correct documents."}
          </h1>
          <p className="mt-3 leading-7 text-[#615945]">
            {documentTypeBlocked
              ? hindi
                ? "एक वर्तमान ड्राइविंग लाइसेंस और नए पते का एक अलग प्रमाण अपलोड करें।"
                : "Upload one current driving licence and one separate proof of new address."
              : assessment.quality.guidance}
          </p>
          <div className="mt-6 rounded-2xl border border-[#f0d6a8] bg-white/70 p-4">
            <p className="text-sm font-semibold text-[#694512]">
              {qualityBlocked
                ? hindi
                  ? `${blockedDocument} फिर से अपलोड करें`
                  : `Re-upload the ${blockedDocument}`
                : hindi
                  ? "दोनों दस्तावेज़ सही स्थान पर अपलोड करें"
                  : "Upload both documents in the correct slots"}
            </p>
            <p className="mt-1 text-sm leading-6 text-[#715d3f]">
              {qualityBlocked
                ? assessment.quality.guidance
                : hindi
                  ? "आपके चुने हुए दस्तावेज़ अपलोड स्क्रीन पर बने रहेंगे ताकि आप केवल गलत दस्तावेज़ बदल सकें।"
                  : "Your selected files stay on the upload screen so you can replace only the incorrect one."}
            </p>
          </div>
          <button onClick={onReset} className="mt-5 rounded-xl bg-[#166534] px-5 py-3 font-semibold text-white">
            {qualityBlocked
              ? hindi
                ? `${blockedDocument} बदलें`
                : `Replace ${blockedDocument}`
              : hindi
                ? "दस्तावेज़ बदलें"
                : "Replace documents"}
          </button>
        </section>
      ) : (
        <>
          <section className="rounded-3xl border border-[#b9dfc0] bg-[#f3fbf4] p-7 sm:p-9">
            <span className="grid h-12 w-12 place-items-center rounded-full bg-white text-2xl">✓</span>
            <h1 className="mt-5 text-3xl font-semibold tracking-[-0.04em]">
              {hindi ? "आपका नया पता जाँच के लिए तैयार है।" : "Your new address is ready to review."}
            </h1>
            <p className="mt-3 max-w-xl leading-7 text-[#536457]">{assessment.summary}</p>
            <div className="mt-6 flex flex-wrap gap-3 text-sm">
              <span className="rounded-full bg-white px-3 py-1.5 font-semibold text-[#2e6540]">
                ✓ {hindi ? "दस्तावेज़ पढ़ने योग्य" : "Documents readable"}
              </span>
              <span
                className={`rounded-full bg-white px-3 py-1.5 font-semibold ${identityMatched ? "text-[#2e6540]" : "text-[#80591b]"}`}
              >
                {identityMatched ? "✓" : "!"} {hindi ? "नाम जाँच" : "Identity check"}
              </span>
              <span className="rounded-full bg-white px-3 py-1.5 font-semibold text-[#526958]">
                {source === "openai"
                  ? hindi
                    ? "OpenAI से जाँचा गया"
                    : "Checked with OpenAI"
                  : hindi
                    ? "सिंथेटिक डेमो जाँच"
                    : "Demo document check"}
              </span>
            </div>
            <p className="mt-3 text-xs text-[#66776a]">
              {hindi
                ? "ये दृश्य दस्तावेज़-जाँच परिणाम हैं, स्वीकृति का अनुमान नहीं।"
                : "These are visible document-check outcomes, not an approval prediction."}
            </p>
          </section>
          <section className="rounded-3xl border border-[#d7e5d9] bg-white p-6 sm:p-8">
            <p className="text-sm font-bold uppercase tracking-[0.14em] text-[#31804a]">
              {hindi ? "अपना नया पता जाँचें या बदलें" : "Review or edit your new address"}
            </p>
            <label htmlFor="address-draft" className="mt-3 block text-sm text-[#607163]">
              {isRohanAddressChangeDemo
                ? hindi
                  ? "हमने यह नए पते के प्रमाण से पढ़ा है। फॉर्म भरने की छोटी गलती दिखाने के लिए “Lakeview Road” को “Lake View Road” में बदलें, फिर तुलना करें।"
                  : "We read this from the new-address proof. To simulate a small form-entry mistake, change “Lakeview Road” to “Lake View Road”, then compare it."
                : hindi
                  ? "हमने इसे आपके प्रमाण से पढ़ा है। पढ़ने की कोई गलती सुधारें, फिर अंतिम टेक्स्ट की प्रमाण से तुलना करें।"
                  : "We read this from your proof. Correct any reading mistake, then compare the final text with the proof."}
            </label>
            <textarea
              id="address-draft"
              value={addressDraft}
              onChange={(event) => {
                setAddressDraft(event.target.value);
                setAccepted(false);
              }}
              className="mt-3 min-h-24 w-full rounded-xl border border-[#bfd0c0] bg-[#fffefa] p-4 text-lg font-semibold leading-7 outline-none focus:ring-2 focus:ring-[#4a9660]"
            />
            <p className="mt-3 text-sm text-[#607163]">
              {hindi ? "नए पते का प्रमाण:" : "New-address proof:"}{" "}
              {assessment.extraction.applicantName || (hindi ? "आवेदक" : "applicant")}.
            </p>
            {isRohanAddressChangeDemo && (
              <p className="mt-3 rounded-xl bg-[#fff8e8] px-4 py-3 text-sm leading-6 text-[#76551f]">
                <strong>{hindi ? "डेमो अंतर:" : "Demo difference:"}</strong>{" "}
                {hindi
                  ? "रोहन कोरमंगला से इंदिरानगर स्थानांतरित हो गए हैं, इसलिए लाइसेंस पर पुराना पता सही है। यह जाँच केवल आवेदन में दर्ज नए पते और नए पते के प्रमाण की तुलना करती है। अभी यह फ़ील्ड प्रमाण के अनुसार “Lakeview Road” दिखाती है—छोटा अंतर देखने के लिए इसे स्वयं “Lake View Road” में बदलें।"
                  : "Rohan has moved from Koramangala to Indiranagar, so the old address on his licence is expected. This check compares only the new address typed in the application with the new-address proof. The field currently matches the proof: “Lakeview Road”. Change it yourself to “Lake View Road” to see the minor-difference path."}
              </p>
            )}
            {!accepted ? (
              <button
                onClick={confirmAddress}
                className="mt-5 rounded-xl bg-[#166534] px-5 py-3 font-semibold text-white"
              >
                {addressWasEdited
                  ? hindi
                    ? "बदले हुए पते की तुलना करें →"
                    : "Compare edited address →"
                  : hindi
                    ? "इस पते की पुष्टि करें →"
                    : "Confirm this address →"}
              </button>
            ) : (
              <p
                className={`mt-5 rounded-xl px-4 py-3 text-sm font-semibold ${majorMismatch ? "bg-[#fff0e7] text-[#8b4f1c]" : "bg-[#e9f7ea] text-[#236b39]"}`}
              >
                {addressMajorMismatch
                  ? hindi
                    ? "! पते का टेक्स्ट प्रमाण से अलग है। नीचे तुलना देखें।"
                    : "! The address text differs from the proof. See the comparison below."
                  : identityNeedsReview
                    ? hindi
                      ? "! नाम की जानकारी को मैन्युअल समीक्षा चाहिए। नीचे नाम जाँच देखें।"
                      : "! The name details need manual review. See the name check below."
                    : minorMismatches.length > 0
                      ? hindi
                        ? "! शब्दावली में छोटा अंतर मिला। नीचे प्रमाण की शब्दावली अपनाएँ या जरूरत हो तो नोट रखें।"
                        : "! A minor wording difference was found. Use the proof wording below, or keep a note only if needed."
                      : addressWasEdited
                        ? hindi
                          ? "✓ आपका बदला हुआ पता प्रमाण से मेल खाता है।"
                          : "✓ Your edited address matches the proof."
                        : hindi
                          ? "✓ आपने प्रमाण से पढ़े गए पते की पुष्टि की है।"
                          : "✓ You confirmed the address read from your proof."}
              </p>
            )}
            {confirmationError && <p className="mt-3 text-sm text-[#9d301e]">{confirmationError}</p>}
          </section>
          <AuditTrail
            extractedAddress={assessment.extraction.address}
            finalAddress={addressDraft}
            mismatches={assessment.mismatches}
            confirmed={accepted}
            hindi={hindi}
            onUseProofWording={() => {
              setAddressDraft(assessment.extraction.address);
              setAccepted(false);
              setSigned(false);
              setClarificationOpen(false);
            }}
            onCreateClarificationNote={() => setClarificationOpen(true)}
          />
          <Passport
            timestamp={timestamp}
            reportId={reportId}
            licence={licence}
            language={language}
            documentsReadable={documentsReadable}
            identityMatched={identityMatched}
            addressConfirmed={addressConfirmed}
          />
          {addressMajorMismatch && (
            <section className="rounded-2xl bg-[#fff0e6] p-5 text-sm leading-6 text-[#864d18]">
              <strong>{hindi ? "पते के टेक्स्ट में सुधार चाहिए:" : "Address text needs fixing:"}</strong>{" "}
              {hindi
                ? "प्रमाण में दिखाए शब्दों का उपयोग करें, फिर तुलना करें।"
                : "Use the wording shown on your proof, then compare again."}
            </section>
          )}
          {identityNeedsReview && (
            <section className="rounded-2xl bg-[#fff8e8] p-5 text-sm leading-6 text-[#76551f]">
              <strong>{hindi ? "नाम जाँच के लिए समीक्षा चाहिए:" : "Name check needs review:"}</strong>{" "}
              {hindi
                ? "पते की तुलना सही है, लेकिन उपलब्ध नाम टेक्स्ट पूरी तरह स्पष्ट नहीं है। आगे बढ़ने से पहले प्रमाण में नाम की स्पष्टता मैन्युअल रूप से जाँचें।"
                : "The address comparison is correct, but the available name text is not fully clear. Manually check the name on the proof before proceeding."}
              <p className="mt-2">{assessment.identity.summary}</p>
            </section>
          )}
          {minorMismatches.length > 0 && !majorMismatch && clarificationOpen ? (
            <Clarification
              mismatches={minorMismatches}
              applicantName={assessment.extraction.applicantName}
              signed={signed}
              onSigned={() => setSigned(true)}
            />
          ) : null}
          <div>
            <button
              disabled={!ready}
              onClick={() => {
                if (ready) {
                  const addressReview = {
                    proofAddress: assessment.extraction.address,
                    finalAddress: addressDraft.trim(),
                    hasMinorDifference: minorMismatches.length > 0,
                    clarificationSigned: signed,
                  };
                  if (isRohanAddressChangeDemo)
                    setDemoJourneyState({ rohanPacketReady: true, rohanAddressReview: addressReview });
                  if (isAarohiRenewalDemo)
                    setDemoJourneyState({ aarohiPacketReady: true, aarohiAddressReview: addressReview });
                  setPacketReady(true);
                  onPacketReady();
                }
              }}
              className="w-full rounded-xl bg-[#166534] px-5 py-4 font-semibold text-white shadow-lg shadow-[#166534]/20 disabled:cursor-not-allowed disabled:opacity-45"
            >
              {hindi ? "सबमिशन के लिए तैयार पैकेट बनाएँ →" : "Prepare submission-ready packet →"}
            </button>
            {!ready && (
              <p className="mt-3 rounded-xl bg-[#fff8e8] px-4 py-3 text-sm leading-6 text-[#76551f]">
                {!accepted
                  ? hindi
                    ? "सुझाया गया पता जाँचें या बदलें, फिर पैकेट बनाने से पहले प्रमाण से मिलाएँ।"
                    : "Review or edit the suggested address, then check it against the proof before preparing the packet."
                  : addressMajorMismatch
                    ? hindi
                      ? "बड़े अंतर को सुधारें और पैकेट बनाने से पहले फिर जाँचें।"
                      : "Correct the major difference and check again before preparing the packet."
                    : identityNeedsReview
                      ? hindi
                        ? "पैकेट बनाने से पहले प्रमाण पर नाम की मैन्युअल समीक्षा करें।"
                        : "Manually review the name on the proof before preparing the packet."
                      : minorMismatches.length && !signed
                        ? hindi
                          ? "प्रमाण की शब्दावली अपनाएँ, या केवल जरूरत होने पर स्पष्टीकरण नोट साइन करें।"
                          : "Use the proof wording, or sign a clarification note only if you need to retain the difference."
                        : hindi
                          ? "पैकेट बनाने से पहले बाकी दस्तावेज़ जाँच पूरी करें।"
                          : "Complete the remaining document checks before preparing the packet."}
              </p>
            )}
          </div>
        </>
      )}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={onReset}
          className="rounded-xl border border-[#bfd1c1] bg-white px-5 py-3 font-semibold text-[#285536]"
        >
          ← {hindi ? "दस्तावेज़ बदलें" : "Change documents"}
        </button>
        <button
          onClick={onReset}
          className="rounded-xl border border-[#bfd1c1] bg-white px-5 py-3 font-semibold text-[#285536]"
        >
          {hindi ? "एक और आवेदन जाँचें" : "Check another application"}
        </button>
      </div>
    </section>
  );
}

function Passport({
  timestamp,
  reportId,
  licence,
  language,
  documentsReadable,
  identityMatched,
  addressConfirmed,
}: {
  timestamp: string;
  reportId: string;
  licence: UploadedFile;
  language: Language;
  documentsReadable: boolean;
  identityMatched: boolean;
  addressConfirmed: boolean;
}) {
  const hindi = language === "hi";
  const label =
    addressConfirmed && identityMatched && documentsReadable
      ? hindi
        ? "अगले आधिकारिक कदम के लिए तैयार"
        : "Ready for the official next step"
      : addressConfirmed
        ? hindi
          ? "पहचान जाँच पूरी करें"
          : "Complete the identity check"
        : hindi
          ? "पते की समीक्षा पूरी करें"
          : "Complete the address review";
  return (
    <section className="rounded-3xl border border-[#d7e5d9] bg-white p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.14em] text-[#31804a]">
            SahiSetu {hindi ? "पूर्व-सबमिशन रिपोर्ट" : "pre-submission report"}
          </p>
          <h2 className="mt-2 text-2xl font-semibold">{label}</h2>
          <p className="mt-2 text-xs text-[#607163]">
            {hindi ? "आपकी व्यक्तिगत जाँच रिपोर्ट" : "Your personal check report"} · {timestamp} · {reportId}
          </p>
        </div>
      </div>
      <div className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
        <Checklist
          done={documentsReadable && Boolean(licence)}
          text={hindi ? "दस्तावेज़ पढ़ने योग्य हैं" : "Documents are readable"}
        />
        <Checklist done={identityMatched} text={hindi ? "नाम/पहचान मेल खाती है" : "Identity details match"} />
        <Checklist done={addressConfirmed} text={hindi ? "पता पुष्टि किया गया" : "Address confirmed"} />
        <Checklist
          done={false}
          text={hindi ? "राज्य की आधिकारिक आवश्यकताएँ जाँचें" : "Official requirements still to verify"}
        />
      </div>
      <p className="mt-4 text-xs leading-5 text-[#6b7c6d]">
        {hindi
          ? "यह Parivahan का निर्णय या स्वीकृति नहीं है। राज्य-विशिष्ट दस्तावेज़ नियम लागू रहेंगे।"
          : "This is not a Parivahan decision or approval. State-specific document rules still apply."}
      </p>
    </section>
  );
}

function Checklist({ done, text }: { done: boolean; text: string }) {
  return (
    <p className={`rounded-xl px-3 py-3 ${done ? "bg-[#edf8ef] text-[#2a653a]" : "bg-[#fff3e1] text-[#80591b]"}`}>
      {done ? "✓" : "!"} {text}
    </p>
  );
}

function AuditTrail({
  extractedAddress,
  finalAddress,
  mismatches,
  confirmed,
  hindi,
  onUseProofWording,
  onCreateClarificationNote,
}: {
  extractedAddress: string;
  finalAddress: string;
  mismatches: Mismatch[];
  confirmed: boolean;
  hindi: boolean;
  onUseProofWording: () => void;
  onCreateClarificationNote: () => void;
}) {
  const addressMismatches = mismatches.filter((item) =>
    /address|street|locality|city|state|pin|postal/i.test(item.field),
  );
  const hasMajorAddressMismatch = addressMismatches.some((item) => item.severity === "major");
  const readinessState = !confirmed ? "current" : addressMismatches.length ? "attention" : "complete";
  const safeNextState = !confirmed ? "pending" : addressMismatches.length ? "attention" : "current";
  return (
    <section className="rounded-3xl border border-[#cddfce] bg-[#fbfefb] p-6 sm:p-8">
      <details open={confirmed && addressMismatches.length > 0}>
        <summary className="cursor-pointer list-none">
          <p className="text-sm font-bold uppercase tracking-[0.14em] text-[#31804a]">
            {hindi ? "पता ऑडिट ट्रेल" : "Address audit trail"}
          </p>
          <div className="mt-2 flex items-center justify-between gap-4">
            <h2 className="text-2xl font-semibold">
              {hindi ? "यह परिणाम कैसे बना" : "See how this result was reached"}
            </h2>
            <span className="text-sm font-semibold text-[#287343]">{hindi ? "खोलें" : "Open"}</span>
          </div>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[#5b7060]">
            {hindi
              ? "प्रमाण से निकाला गया टेक्स्ट और आपके अंतिम टेक्स्ट की तुलना देखें।"
              : "See the proof wording, your final text, and the comparison behind this result."}
          </p>
        </summary>
        <div className="mt-6 border-t border-[#dbe8dc] pt-6">
          <ExplainableAuditTimeline
            language={hindi ? "hi" : "en"}
            title={hindi ? "पता-जाँच का स्पष्ट रिकॉर्ड" : "A clear record of the address check"}
            description={
              hindi
                ? "लाइसेंस पुराने पते की पहचान के लिए है। नए पते का प्रमाण आवेदन वाले पते का स्रोत है।"
                : "The licence identifies the citizen’s current record. The new-address proof is the source for the address used in the application."
            }
            steps={[
              {
                label: hindi ? "दस्तावेज़ अपलोड" : "Documents uploaded",
                detail: hindi ? "लाइसेंस और नए पते का प्रमाण जाँचा गया।" : "Licence and new-address proof checked.",
                state: "complete",
              },
              {
                label: hindi ? "फ़ील्ड निकाला गया" : "Field extracted",
                detail: extractedAddress,
                state: "complete",
              },
              {
                label: hindi ? "नागरिक पुष्टि" : "Citizen confirmation",
                detail: confirmed
                  ? hindi
                    ? "अंतिम पता तुलना के लिए भेजा गया।"
                    : "Final address submitted for comparison."
                  : hindi
                    ? "ऊपर दिए ड्राफ्ट की समीक्षा बाकी है।"
                    : "Review the draft above.",
                state: confirmed ? "complete" : "current",
              },
              {
                label: hindi ? "तैयारी परिणाम" : "Readiness result",
                detail: !confirmed
                  ? hindi
                    ? "तुलना लंबित है।"
                    : "Comparison pending."
                  : addressMismatches.length
                    ? hindi
                      ? "छोटा या बड़ा अंतर मिला।"
                      : "A wording or address difference was found."
                    : hindi
                      ? "पता प्रमाण से मेल खाता है।"
                      : "The reviewed address matches the proof.",
                state: readinessState,
              },
              {
                label: hindi ? "सुरक्षित अगली कार्रवाई" : "Safe next action",
                detail: !confirmed
                  ? hindi
                    ? "पहले पते की पुष्टि करें।"
                    : "Confirm the address first."
                  : addressMismatches.length
                    ? hasMajorAddressMismatch
                      ? hindi
                        ? "पते को प्रमाण से मिलाने के लिए ठीक करें।"
                        : "Correct the address to match the proof."
                      : hindi
                        ? "प्रमाण की शब्दावली अपनाएँ, या केवल जरूरत होने पर स्पष्टीकरण नोट रखें।"
                        : "Use the proof wording, or keep a clarification note only if needed."
                    : hindi
                      ? "सिंथेटिक तैयारी पैकेट देखें।"
                      : "Review the readiness packet.",
                state: safeNextState,
              },
            ]}
          />
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-[#dbe8dc] bg-white p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-[#718073]">
                {hindi ? "प्रमाण से निकाला गया" : "Extracted from proof"}
              </p>
              <p className="mt-2 text-sm font-semibold leading-6 text-[#254632]">{extractedAddress}</p>
            </div>
            <div className="rounded-xl border border-[#dbe8dc] bg-white p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-[#718073]">
                {confirmed
                  ? hindi
                    ? "आपका अंतिम समीक्षा किया पता"
                    : "Your final reviewed address"
                  : hindi
                    ? "आपका वर्तमान ड्राफ्ट"
                    : "Your current draft"}
              </p>
              <p className="mt-2 text-sm font-semibold leading-6 text-[#254632]">{finalAddress}</p>
            </div>
          </div>
          {!confirmed ? (
            <p className="mt-5 rounded-xl bg-[#fff8e8] p-4 text-sm leading-6 text-[#76551f]">
              {hindi
                ? "तुलना लंबित है। ऊपर दिए पते की पुष्टि करें ताकि SahiSetu सटीक अंतर और उसका वर्गीकरण दिखा सके।"
                : "Comparison pending. Confirm the address above to see any exact difference and its classification."}
            </p>
          ) : addressMismatches.length ? (
            <div className="mt-5 space-y-3">
              {addressMismatches.map((item) => (
                <article key={`audit-${item.field}`} className="rounded-xl border border-[#eaded0] bg-white p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-semibold">{item.field}</p>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${item.severity === "major" ? "bg-[#fff0e6] text-[#8b4f1c]" : "bg-[#fff5d9] text-[#87550d]"}`}
                    >
                      {hindi ? (item.severity === "major" ? "बड़ा अंतर" : "छोटा अंतर") : `${item.severity} difference`}
                    </span>
                  </div>
                  <div className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
                    <div className="rounded-lg bg-[#fff5f2] p-3">
                      <p className="text-xs font-bold uppercase text-[#8f6257]">
                        {hindi ? "अंतिम टेक्स्ट" : "Final text"}
                      </p>
                      <p className="mt-1 leading-6">{item.formValue}</p>
                    </div>
                    <div className="rounded-lg bg-[#eff8f0] p-3">
                      <p className="text-xs font-bold uppercase text-[#57775d]">
                        {hindi ? "प्रमाण में" : "Proof shows"}
                      </p>
                      <p className="mt-1 leading-6">{item.documentValue}</p>
                    </div>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-[#4f6755]">
                    <strong>{hindi ? "क्यों:" : "Why:"}</strong> {item.explanation}{" "}
                    {item.severity === "major"
                      ? hindi
                        ? " यह फॉर्म में उपयोग होने वाले वास्तविक पता विवरण को बदलता है, इसलिए इसे ठीक करना होगा।"
                        : " It changes a substantive address detail, so it must be corrected."
                      : hindi
                        ? " यह उसी स्थान की सुरक्षित शब्दावली/फॉर्मेटिंग भिन्नता लगती है, इसलिए स्पष्टीकरण नोट पर्याप्त हो सकता है।"
                        : " It appears to be a safe wording or formatting variation for the same place, so a clarification note may be enough."}
                  </p>
                  {item.severity === "minor" ? (
                    <div className="mt-4 rounded-xl bg-[#f4faf3] p-4">
                      <p className="text-sm leading-6 text-[#365c40]">
                        <strong>{hindi ? "सुझाया गया सुधार:" : "Recommended correction:"}</strong>{" "}
                        {hindi
                          ? "प्रमाण की शब्दावली अपनाएँ। इससे अतिरिक्त नोट की जरूरत के बिना अंतर समाप्त हो जाता है।"
                          : "Use the proof wording. This resolves the difference without creating extra paperwork."}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-3">
                        <button
                          type="button"
                          onClick={onUseProofWording}
                          className="rounded-lg bg-[#166534] px-4 py-2 text-sm font-semibold text-white hover:bg-[#10572b]"
                        >
                          {hindi ? "प्रमाण के शब्द अपनाएँ →" : "Use proof wording →"}
                        </button>
                        <button
                          type="button"
                          onClick={onCreateClarificationNote}
                          className="rounded-lg border border-[#b9d5bd] bg-white px-4 py-2 text-sm font-semibold text-[#246538] hover:bg-[#e8f5ea]"
                        >
                          {hindi ? "फिर भी नोट रखें" : "Keep a clarification note instead"}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={onUseProofWording}
                      className="mt-4 rounded-lg bg-[#166534] px-4 py-2 text-sm font-semibold text-white hover:bg-[#10572b]"
                    >
                      {hindi ? "प्रमाण के शब्द अपनाएँ →" : "Use proof wording →"}
                    </button>
                  )}
                </article>
              ))}
            </div>
          ) : (
            <div className="mt-5 rounded-xl bg-[#edf8ef] p-4 text-sm leading-6 text-[#236b39]">
              <strong>{hindi ? "कोई पता अंतर नहीं मिला।" : "No address difference found."}</strong>{" "}
              {hindi
                ? "अंतिम समीक्षा किया पता प्रमाण से निकाले गए पते से मेल खाता है।"
                : "The final reviewed address matches the address extracted from the proof."}
            </div>
          )}
        </div>
      </details>
    </section>
  );
}

function compareEditedAddress(assessment: Assessment, candidateAddress: string): Assessment {
  const normalise = (value: string) =>
    value
      .toLowerCase()
      .replaceAll(".", "")
      .replace(/\brd\b/g, "road")
      .replace(/indira\s+nagar/g, "indiranagar")
      .replace(/bangalore/g, "bengaluru")
      .replace(/[^a-z0-9]/g, "");
  const presentation = (value: string) => value.toLowerCase().replaceAll(".", "").replace(/\s+/g, " ").trim();
  const proofAddress = assessment.extraction.address;
  const unrelatedMismatches = assessment.mismatches.filter(
    (item) => !/address|street|locality|city|state|pin|postal/i.test(item.field),
  );
  const statusFor = (mismatches: Mismatch[]): Assessment["overallStatus"] =>
    mismatches.some((item) => item.severity === "major") || assessment.identity.status === "needs_review"
      ? "needs_correction"
      : mismatches.length
        ? "needs_clarification"
        : "clear";
  if (candidateAddress.trim() === proofAddress.trim())
    return { ...assessment, overallStatus: statusFor(unrelatedMismatches), mismatches: unrelatedMismatches };
  const minor = normalise(candidateAddress) === normalise(proofAddress);
  const mismatch: Mismatch = {
    field: minor ? "Address wording" : "Address text",
    formValue: candidateAddress,
    documentValue: proofAddress,
    severity: minor ? "minor" : "major",
    explanation: minor
      ? "The address appears to refer to the same place, but its wording differs from the proof."
      : "Some address details differ from the new-address proof.",
    recommendedAction: minor ? "clarification_note" : "correct_form",
  };
  const mismatches =
    presentation(candidateAddress) === presentation(proofAddress)
      ? unrelatedMismatches
      : [...unrelatedMismatches, mismatch];
  return { ...assessment, overallStatus: statusFor(mismatches), mismatches };
}

function Clarification({
  mismatches,
  applicantName,
  signed,
  onSigned,
}: {
  mismatches: Mismatch[];
  applicantName: string;
  signed: boolean;
  onSigned: () => void;
}) {
  const [name, setName] = useState("");
  const normaliseName = (value: string) => value.trim().toLocaleLowerCase().replace(/\s+/g, " ");
  const nameMatches = Boolean(applicantName) && normaliseName(name) === normaliseName(applicantName);
  return (
    <section className="rounded-3xl border border-[#c8dfcb] bg-white p-6">
      <p className="text-sm font-bold uppercase tracking-[0.14em] text-[#31804a]">Short explanation note</p>
      <h2 className="mt-2 text-2xl font-semibold">Explain only harmless variations.</h2>
      <p className="mt-3 text-sm leading-6 text-[#516753]">
        This note covers {mismatches.length} minor wording difference{mismatches.length === 1 ? "" : "s"}. It cannot
        override a major mismatch.
      </p>
      {!signed ? (
        <div className="mt-5">
          <p className="mb-3 text-sm text-[#516753]">
            Sign using the applicant name shown on the documents: <strong>{applicantName || "name unavailable"}</strong>
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Type the applicant name to mock e-sign"
              className="min-w-0 flex-1 rounded-xl border border-[#bcd0bf] px-4 py-3"
              aria-describedby="signer-name-help"
            />
            <button
              disabled={!nameMatches}
              onClick={onSigned}
              className="rounded-xl bg-[#166534] px-5 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              Mock e-sign note
            </button>
          </div>
          <p
            id="signer-name-help"
            className={`mt-2 text-sm ${name.trim() && !nameMatches ? "text-[#9d301e]" : "text-[#637467]"}`}
          >
            {name.trim() && !nameMatches
              ? "The typed name must match the applicant name shown above."
              : "Case and extra spaces do not affect this mock validation."}
          </p>
        </div>
      ) : (
        <p className="mt-5 rounded-xl bg-[#edf8ef] p-4 text-sm font-semibold text-[#236b39]">
          ✓ Short explanation note signed.
        </p>
      )}
    </section>
  );
}

function CopyAddressAction({ address, hindi }: { address: string; hindi: boolean }) {
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
  async function copyAddress() {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setCopyError(false);
    } catch {
      setCopyError(true);
    }
  }
  return (
    <section className="mt-6 rounded-2xl border border-[#b9dfc0] bg-[#f1fbf3] p-5 print:hidden">
      <p className="text-sm font-bold uppercase tracking-[0.14em] text-[#31804a]">{hindi ? "तैयार" : "Ready"}</p>
      <h2 className="mt-2 text-xl font-semibold">
        {hindi ? "Parivahan के लिए यही पता कॉपी करें।" : "Copy this exact address for Parivahan."}
      </h2>
      <p className="mt-2 text-sm leading-6 text-[#4b6551]">
        {hindi
          ? "SahiSetu कोई आवेदन सबमिट नहीं करता। आधिकारिक फॉर्म में पता भरते समय यही समीक्षा किया हुआ टेक्स्ट पेस्ट करें।"
          : "SahiSetu does not submit an application. Paste this reviewed text when you reach the address field on the official form."}
      </p>
      <div className="mt-4 rounded-xl border border-[#c9e2cd] bg-white p-3 text-sm font-semibold leading-6 text-[#215d34]">
        {address}
      </div>
      <button onClick={copyAddress} className="mt-4 rounded-xl bg-[#166534] px-5 py-3 font-semibold text-white">
        {copied
          ? hindi
            ? "पता कॉपी हो गया ✓"
            : "Address copied ✓"
          : hindi
            ? "पता कॉपी करें"
            : "Copy reviewed address"}
      </button>
      {copyError && (
        <p className="mt-2 text-sm text-[#8f3c2a]">
          {hindi
            ? "कॉपी नहीं हो सका। ऊपर दिया गया पता चुनकर कॉपी करें।"
            : "Copy was unavailable. Select the address above and copy it manually."}
        </p>
      )}
    </section>
  );
}

function Packet({
  reportId,
  timestamp,
  language,
  assessment,
  licence,
  proof,
  finalAddress,
  minorNoteSigned,
  handoffCase,
  onBack,
  onReset,
}: {
  reportId: string;
  timestamp: string;
  language: Language;
  assessment: Assessment;
  licence: UploadedFile;
  proof: UploadedFile;
  finalAddress: string;
  minorNoteSigned: boolean;
  handoffCase?: "aarohi" | "rohan";
  onBack: () => void;
  onReset: () => void;
}) {
  const hindi = language === "hi";
  return (
    <section className="mt-8">
      <button onClick={onBack} className="mb-5 text-sm font-semibold text-[#3a7149] underline print:hidden">
        ← {hindi ? "पते की जाँच पर वापस" : "Back to address review"}
      </button>
      <div className="rounded-3xl border border-[#b8dfc0] bg-[#f1fbf3] p-8">
        <span className="text-3xl">✓</span>
        <p className="mt-5 text-sm font-bold uppercase tracking-[0.14em] text-[#31804a]">
          {hindi ? "डेमो पैकेट तैयार" : "Demo packet prepared"}
        </p>
        <h1 className="mt-2 text-4xl font-semibold">{hindi ? "स्पष्टता के साथ तैयार।" : "Ready with clarity."}</h1>
        <p className="mt-4 leading-7 text-[#4b6551]">
          {hindi
            ? "आपके पैकेट में पुष्टि किया गया नया पता, दस्तावेज़ जाँच और SahiSetu पूर्व-सबमिशन रिपोर्ट शामिल है।"
            : "Your packet contains the confirmed new address, document check, and SahiSetu Pre-Submission Report."}
        </p>
      </div>
      <section className="mt-6 rounded-3xl border border-[#dce7dd] bg-white p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="font-semibold">SahiSetu {hindi ? "पूर्व-सबमिशन रिपोर्ट" : "Pre-Submission Report"}</p>
            <p className="mt-1 text-sm text-[#647466]">
              {reportId} · {timestamp}
            </p>
          </div>
        </div>
        <p className="mt-5 rounded-xl bg-[#fff8e8] p-4 text-sm leading-6 text-[#76551f]">
          {hindi
            ? "केवल व्यक्तिगत जाँच रिपोर्ट। SahiSetu Parivahan या किसी RTO को सबमिट नहीं करता और न ही उनका प्रतिनिधित्व करता है।"
            : "Personal check report only. SahiSetu does not submit to or represent Parivahan or any RTO."}
        </p>
        <CopyAddressAction address={finalAddress} hindi={hindi} />
        <div className="mt-6 grid gap-5 border-t border-[#e5eee6] pt-6 sm:grid-cols-2">
          <div>
            <h2 className="font-semibold">{hindi ? "जाँचे गए दस्तावेज़" : "Documents checked"}</h2>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-[#4d6251]">
              <li>
                <strong>{hindi ? "मौजूदा लाइसेंस:" : "Current licence:"}</strong> {licence?.name ?? "—"}
              </li>
              <li>
                <strong>{hindi ? "नए पते का प्रमाण:" : "New-address proof:"}</strong> {proof?.name ?? "—"}
              </li>
              <li>✓ {hindi ? "छवियाँ पढ़ने योग्य पाई गईं" : "Images passed the readability check"}</li>
            </ul>
          </div>
          <div>
            <h2 className="font-semibold">{hindi ? "पता समीक्षा" : "Address review"}</h2>
            <p className="mt-3 text-sm leading-6 text-[#4d6251]">
              <strong>{hindi ? "उपयोग के लिए पता:" : "Address to use:"}</strong>
              <br />
              {finalAddress}
            </p>
            <p className="mt-2 text-sm text-[#4d6251]">
              {hindi ? "नाम:" : "Applicant:"} {assessment.extraction.applicantName || "—"}
            </p>
          </div>
        </div>
        <div className="mt-6 border-t border-[#e5eee6] pt-6">
          <h2 className="font-semibold">
            {hindi ? "रिपोर्ट में शामिल दस्तावेज़" : "Document images included in this report"}
          </h2>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            {[
              { label: hindi ? "मौजूदा लाइसेंस" : "Current driving licence", file: licence },
              { label: hindi ? "नए पते का प्रमाण" : "New-address proof", file: proof },
            ].map(({ label, file }) => (
              <figure key={label} className="overflow-hidden rounded-xl border border-[#dbe7dd] bg-[#fbfefb]">
                <div className="aspect-[1.58] bg-white">
                  <Image
                    src={file?.dataUrl ?? ""}
                    alt={label}
                    width={720}
                    height={456}
                    unoptimized
                    className="h-full w-full object-contain"
                  />
                </div>
                <figcaption className="border-t border-[#e5eee6] px-3 py-2 text-xs text-[#526958]">
                  <strong>{label}</strong>
                  <br />
                  {file?.name ?? "—"}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
        <div className="mt-6 border-t border-[#e5eee6] pt-6">
          <h2 className="font-semibold">{hindi ? "अंतर और समाधान" : "Differences and resolution"}</h2>
          {assessment.mismatches.length ? (
            <ul className="mt-3 space-y-3">
              {assessment.mismatches.map((item) => (
                <li key={item.field} className="rounded-xl bg-[#f7f8f4] p-3 text-sm leading-6 text-[#405445]">
                  <strong>{item.field}</strong> · <span className="font-semibold">{item.severity}</span>
                  <br />
                  {item.explanation}
                  {item.severity === "minor" && minorNoteSigned ? (
                    <span className="block text-[#236b39]">
                      ✓ {hindi ? "मॉक स्पष्टीकरण नोट साइन किया गया" : "Mock explanation note signed"}
                    </span>
                  ) : null}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-[#4d6251]">
              ✓ {hindi ? "कोई सक्रिय अंतर नहीं मिला।" : "No active differences were found."}
            </p>
          )}
        </div>
        <div className="mt-6 border-t border-[#e5eee6] pt-6 print:hidden">
          <div className="mb-6">
            <SarathiAddressChangeHandoff hindi={hindi} />
          </div>
          {handoffCase ? (
            <Link
              href={`/handoff?case=${handoffCase}`}
              className="mr-3 inline-flex rounded-xl bg-[#166534] px-5 py-3 font-semibold text-white hover:bg-[#10572b]"
            >
              {hindi ? "हैंडऑफ पैक खोलें" : "Open handoff pack"}
            </Link>
          ) : null}
          <button
            onClick={() => window.print()}
            className="rounded-xl border border-[#bfd1c1] px-5 py-3 font-semibold text-[#285536]"
          >
            {hindi ? "पूर्व-सबमिशन रिपोर्ट PDF के रूप में सहेजें" : "Save pre-submission report as PDF"}
          </button>
          <p className="mt-2 text-xs leading-5 text-[#647466]">
            {hindi
              ? "यह आपके ब्राउज़र का प्रिंट डायलॉग खोलेगा। गंतव्य में ‘Save as PDF’ चुनें।"
              : "This opens your browser’s print dialog. Choose ‘Save as PDF’ as the destination."}
          </p>
        </div>
      </section>
      <button onClick={onReset} className="mt-6 text-sm font-semibold text-[#3a7149] underline print:hidden">
        {hindi ? "नई जाँच शुरू करें" : "Start another check"}
      </button>
    </section>
  );
}
