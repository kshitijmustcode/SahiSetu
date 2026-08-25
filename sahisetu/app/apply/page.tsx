"use client";

import Image from "next/image";
import Link from "next/link";
import { ChangeEvent, FormEvent, useState } from "react";

type UploadedFile = { name: string; size: string; dataUrl: string; warning?: string } | null;
type Mismatch = { field: string; formValue: string; documentValue: string; severity: "minor" | "major"; explanation: string; recommendedAction: "clarification_note" | "correct_form" };
type Assessment = {
  overallStatus: "clear" | "needs_clarification" | "needs_correction";
  confidence: number;
  summary: string;
  extraction: { address: string; applicantName: string; complete: boolean };
  quality: { status: "clear" | "needs_reupload"; issues: string[]; guidance: string };
  identity: { status: "match" | "needs_review" | "uncertain"; summary: string };
  mismatches: Mismatch[];
};

export default function ApplyPage() {
  const [licence, setLicence] = useState<UploadedFile>(null);
  const [proof, setProof] = useState<UploadedFile>(null);
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [source, setSource] = useState<"openai" | "synthetic_demo" | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function addFile(event: ChangeEvent<HTMLInputElement>, setFile: (file: UploadedFile) => void) {
    const file = event.target.files?.[0];
    if (!file) return;
    try { setFile(await optimisedFile(file)); } catch { setError("We could not read that file. Please choose a clear PNG or JPEG image."); }
  }

  async function startCheck(event: FormEvent) {
    event.preventDefault();
    if (!licence || !proof) { setError("Add both the current driving licence and new-address proof first."); return; }
    if (licence.warning || proof.warning) { setError("Replace the flagged image before continuing. We should not make a decision from an unclear document."); return; }
    setError(""); setLoading(true);
    try {
      const response = await fetch("/api/pre-scrutiny", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ documents: [licence, proof] }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "We could not run the document check.");
      setAssessment(data.assessment); setSource(data.source);
    } catch (requestError) { setError(requestError instanceof Error ? requestError.message : "We could not run the document check."); } finally { setLoading(false); }
  }

  return <main className="min-h-screen bg-[#fffdf8] text-[#17281f]"><div className="mx-auto max-w-3xl px-5 py-6 sm:px-8 sm:py-10">
    <Link href="/" className="inline-flex text-sm font-semibold text-[#356044] hover:text-[#166534]">← Back to SahiSetu</Link>
    <header className="mt-9"><div className="flex items-center justify-between"><p className="text-sm font-bold uppercase tracking-[0.14em] text-[#31804a]">Address change</p><p className="text-sm font-medium text-[#617466]">{assessment ? "Step 2 of 3" : "Step 1 of 3"}</p></div><div className="mt-3 h-2 rounded-full bg-[#e4ede3]"><div className={`h-full rounded-full bg-[#218144] ${assessment ? "w-2/3" : "w-1/3"}`} /></div></header>
    {assessment ? <Results assessment={assessment} source={source} proof={proof} licence={licence} onReset={() => setAssessment(null)} /> : <form onSubmit={startCheck} className="mt-8 space-y-8">
      <section><p className="text-sm font-bold uppercase tracking-[0.14em] text-[#31804a]">Start with proof, not typing</p><h1 className="mt-3 text-4xl font-semibold tracking-[-0.045em] sm:text-5xl">We prepare a reviewable address for you.</h1><p className="mt-4 max-w-2xl text-lg leading-8 text-[#586b5d]">Upload your current driving licence and a synthetic proof of your new address. SahiSetu extracts a clean address, checks document clarity, and asks you to confirm it before a mock submission.</p></section>
      <section className="rounded-3xl border border-[#dbe8dc] bg-white p-6 sm:p-8"><div className="flex items-start gap-3"><span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#e8f5e9] font-bold text-[#22733b]">1</span><div><h2 className="text-xl font-semibold">Add your two documents</h2><p className="mt-1 text-sm leading-6 text-[#647466]">Use synthetic PNG or JPEG images only for this prototype. The current licence may show the old address—that is expected.</p></div></div><div className="mt-6 grid gap-4 sm:grid-cols-2"><UploadCard title="Current driving licence" hint="Identifies the licence record to update." file={licence} onChange={(event) => addFile(event, setLicence)} /><UploadCard title="New-address proof" hint="Synthetic Aadhaar-style proof of the new address." file={proof} onChange={(event) => addFile(event, setProof)} /></div></section>
      {error && <p className="rounded-xl bg-[#fff0ee] px-4 py-3 text-sm leading-6 text-[#9d301e]">{error}</p>}
      <section className="rounded-2xl bg-[#f3f9f2] p-5 text-sm leading-6 text-[#44634b]"><strong>Privacy and safety:</strong> This is a demo. Do not upload real government IDs or Aadhaar numbers. SahiSetu stops if an image is too small or unclear rather than guessing.</section>
      <button disabled={loading} className="w-full rounded-xl bg-[#166534] px-6 py-4 text-base font-semibold text-white shadow-lg shadow-[#166534]/20 hover:bg-[#10572b] disabled:cursor-wait disabled:opacity-70">{loading ? "Reading your documents…" : "Extract my address and check documents →"}</button>
    </form>}
  </div></main>;
}

function UploadCard({ title, hint, file, onChange }: { title: string; hint: string; file: UploadedFile; onChange: (event: ChangeEvent<HTMLInputElement>) => void }) {
  const id = title.toLowerCase().replaceAll(" ", "-");
  return <div className="rounded-2xl border border-dashed border-[#abc9b0] bg-[#fbfefb] p-5"><p className="font-semibold">{title}</p><p className="mt-2 text-sm leading-5 text-[#6a7a6d]">{hint}</p>{file ? <div className={`mt-4 rounded-xl p-3 ${file.warning ? "bg-[#fff0dc]" : "bg-[#e9f6eb]"}`}><p className={`truncate text-sm font-semibold ${file.warning ? "text-[#925810]" : "text-[#1c6836]"}`}>{file.warning ? "!" : "✓"} {file.name}</p><p className="mt-1 text-xs text-[#59775e]">{file.size}{file.warning ? ` · ${file.warning}` : " · ready to check"}</p><label htmlFor={id} className="mt-3 inline-block cursor-pointer text-sm font-semibold text-[#287a43]">Replace image</label></div> : <label htmlFor={id} className="mt-4 inline-block cursor-pointer rounded-lg border border-[#b9d5bd] bg-white px-3 py-2 text-sm font-semibold text-[#2a713e]">Choose image</label>}<input id={id} className="sr-only" accept="image/png,image/jpeg" type="file" onChange={onChange} /></div>;
}

async function optimisedFile(file: File): Promise<NonNullable<UploadedFile>> {
  const dataUrl = await new Promise<string>((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result)); reader.onerror = reject; reader.readAsDataURL(file); });
  const image = new window.Image(); image.src = dataUrl;
  await new Promise<void>((resolve, reject) => { image.onload = () => resolve(); image.onerror = () => reject(new Error("Unreadable image")); });
  const warning = Math.min(image.width, image.height) < 700 ? "image is too small—upload a sharper scan" : undefined;
  const scale = Math.min(1, 1280 / Math.max(image.width, image.height));
  const canvas = document.createElement("canvas"); canvas.width = Math.round(image.width * scale); canvas.height = Math.round(image.height * scale);
  canvas.getContext("2d")?.drawImage(image, 0, 0, canvas.width, canvas.height);
  return { name: file.name, size: `${Math.max(1, Math.round(file.size / 1024))} KB`, dataUrl: canvas.toDataURL("image/jpeg", 0.78), warning };
}

function Results({ assessment, source, proof, licence, onReset }: { assessment: Assessment; source: "openai" | "synthetic_demo" | null; proof: UploadedFile; licence: UploadedFile; onReset: () => void }) {
  const [accepted, setAccepted] = useState(false);
  const [showRescue, setShowRescue] = useState(false);
  const [submittedAddress, setSubmittedAddress] = useState("");
  const [signed, setSigned] = useState(false);
  const [packetReady, setPacketReady] = useState(false);
  const reportId = `SS-${new Date().getTime().toString().slice(-6)}`;
  const timestamp = new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" }).format(new Date());
  const qualityBlocked = assessment.quality.status === "needs_reupload";
  const majorMismatch = assessment.mismatches.some((item) => item.severity === "major") || assessment.identity.status === "needs_review";
  const minorMismatches = assessment.mismatches.filter((item) => item.severity === "minor" && item.recommendedAction === "clarification_note");
  const comparison = submittedAddress ? compareAddresses(submittedAddress, assessment.extraction.address) : null;
  const ready = !qualityBlocked && !majorMismatch && accepted && (!comparison || comparison.match) && (minorMismatches.length === 0 || signed);
  const score = qualityBlocked ? 0 : majorMismatch ? 25 : accepted ? (minorMismatches.length ? 78 : 95) : 65;
  if (packetReady) return <Packet reportId={reportId} timestamp={timestamp} onReset={onReset} />;

  return <section className="mt-8 space-y-6"><p className="text-sm font-bold uppercase tracking-[0.14em] text-[#31804a]">Pre-scrutiny result</p>
    {qualityBlocked ? <section className="rounded-3xl border border-[#f1c787] bg-[#fff8eb] p-7"><span className="grid h-12 w-12 place-items-center rounded-full bg-white text-2xl">↻</span><h1 className="mt-5 text-3xl font-semibold">We need a clearer image before continuing.</h1><p className="mt-3 leading-7 text-[#615945]">{assessment.quality.guidance}</p><ul className="mt-4 list-disc space-y-1 pl-5 text-sm text-[#756244]">{assessment.quality.issues.map((issue) => <li key={issue}>{issue}</li>)}</ul><button onClick={onReset} className="mt-6 rounded-xl bg-[#166534] px-5 py-3 font-semibold text-white">Replace documents</button></section> : <>
      <section className="rounded-3xl border border-[#b9dfc0] bg-[#f3fbf4] p-7 sm:p-9"><span className="grid h-12 w-12 place-items-center rounded-full bg-white text-2xl">✓</span><h1 className="mt-5 text-3xl font-semibold tracking-[-0.04em]">Your new address is ready to review.</h1><p className="mt-3 max-w-xl leading-7 text-[#536457]">{assessment.summary}</p><div className="mt-6 flex flex-wrap gap-3 text-sm"><span className="rounded-full bg-white px-3 py-1.5 font-semibold text-[#2e6540]">{Math.round(assessment.confidence * 100)}% text-read confidence</span><span className="rounded-full bg-white px-3 py-1.5 font-semibold text-[#526958]">{source === "openai" ? "Analysed with OpenAI Vision" : "Synthetic demo assessment"}</span></div><p className="mt-3 text-xs text-[#66776a]">Text-read confidence is not a government approval prediction.</p></section>
      <section className="rounded-3xl border border-[#d7e5d9] bg-white p-6 sm:p-8"><p className="text-sm font-bold uppercase tracking-[0.14em] text-[#31804a]">Parivahan-ready address</p><p className="mt-3 text-xl font-semibold leading-8">{assessment.extraction.address}</p><p className="mt-3 text-sm text-[#607163]">Extracted from the new-address proof for {assessment.extraction.applicantName || "the applicant"}.</p>{!accepted ? <button onClick={() => setAccepted(true)} className="mt-5 rounded-xl bg-[#166534] px-5 py-3 font-semibold text-white">Use this address in my application →</button> : <p className="mt-5 rounded-xl bg-[#e9f7ea] px-4 py-3 text-sm font-semibold text-[#236b39]">✓ Address confirmed for the mock application.</p>}</section>
      <section className="rounded-2xl border border-[#dce7dd] bg-white p-5"><p className="font-semibold">Identity consistency</p><p className="mt-2 text-sm leading-6 text-[#5e7061]">{assessment.identity.summary}</p></section>
      <Passport score={score} timestamp={timestamp} reportId={reportId} licence={licence} proof={proof} />
      {majorMismatch && <section className="rounded-2xl bg-[#fff0e6] p-5 text-sm leading-6 text-[#864d18]"><strong>Correction required:</strong> A substantive identity or document difference was found. Correct it and run the check again; a clarification note cannot override it.</section>}
      {minorMismatches.map((item) => <MismatchCard key={item.field} item={item} proof={proof} />)}
      {minorMismatches.length > 0 && !majorMismatch && <Clarification mismatches={minorMismatches} signed={signed} onSigned={() => setSigned(true)} />}
      <section className="rounded-2xl border border-[#dce7dd] bg-white p-5"><button onClick={() => setShowRescue(!showRescue)} className="font-semibold text-[#28653b]">{showRescue ? "− Hide" : "+ I already filled Parivahan"}</button><p className="mt-2 text-sm leading-6 text-[#647466]">Optional rescue check: paste the address already entered on the government form.</p>{showRescue && <div className="mt-4"><textarea value={submittedAddress} onChange={(event) => setSubmittedAddress(event.target.value)} placeholder="Paste the address already entered on Parivahan" className="min-h-24 w-full rounded-xl border border-[#bfd0c0] p-3 outline-none focus:ring-2 focus:ring-[#4a9660]" />{comparison && <p className={`mt-3 rounded-xl px-4 py-3 text-sm ${comparison.match ? "bg-[#edf8ef] text-[#28653b]" : "bg-[#fff0e7] text-[#8b4f1c]"}`}>{comparison.match ? "✓ The entered address matches after safe formatting normalisation." : `! Correct the application address to: ${assessment.extraction.address}`}</p>}</div>}</section>
      {ready ? <button onClick={() => setPacketReady(true)} className="w-full rounded-xl bg-[#166534] px-5 py-4 font-semibold text-white shadow-lg shadow-[#166534]/20">Prepare submission-ready packet →</button> : <p className="rounded-xl bg-[#fff8e8] px-4 py-3 text-sm leading-6 text-[#76551f]">To prepare the packet, confirm the extracted address{minorMismatches.length ? " and sign the eligible clarification note" : ""}{majorMismatch ? " after correcting the major difference" : ""}.</p>}
    </>}
    <button onClick={onReset} className="rounded-xl border border-[#bfd1c1] bg-white px-5 py-3 font-semibold text-[#285536]">Check another application</button>
  </section>;
}

function Passport({ score, timestamp, reportId, licence, proof }: { score: number; timestamp: string; reportId: string; licence: UploadedFile; proof: UploadedFile }) { const label = score >= 90 ? "Ready to submit" : score >= 60 ? "Confirm before payment" : "Fix before payment"; return <section className="rounded-3xl border border-[#d7e5d9] bg-white p-6"><div className="flex items-start justify-between gap-4"><div><p className="text-sm font-bold uppercase tracking-[0.14em] text-[#31804a]">SahiSetu scrutiny passport</p><h2 className="mt-2 text-2xl font-semibold">{label}</h2><p className="mt-2 text-xs text-[#607163]">Unofficial applicant-held report · {timestamp} · {reportId}</p></div><div className="rounded-2xl bg-[#e9f7ea] px-5 py-4 text-center text-[#1e6b37]"><p className="text-3xl font-bold">{score}</p><p className="text-xs font-bold uppercase tracking-wide">Readiness</p></div></div><div className="mt-5 grid gap-3 text-sm sm:grid-cols-2"><Checklist done={Boolean(licence)} text={`${licence?.name ?? "Current licence"} attached`} /><Checklist done={Boolean(proof)} text={`${proof?.name ?? "New-address proof"} attached`} /><Checklist done text="Image resolution passed local check" /><Checklist done text="Address extracted for user review" /></div><p className="mt-4 text-xs leading-5 text-[#6b7c6d]">Not a Parivahan status, decision, or endorsement. State-specific document rules still apply.</p></section>; }

function Checklist({ done, text }: { done: boolean; text: string }) { return <p className={`rounded-xl px-3 py-3 ${done ? "bg-[#edf8ef] text-[#2a653a]" : "bg-[#fff3e1] text-[#80591b]"}`}>{done ? "✓" : "!"} {text}</p>; }

function MismatchCard({ item, proof }: { item: Mismatch; proof: UploadedFile }) { return <article className="rounded-2xl border border-[#e4e6dd] bg-white p-6"><div className="flex items-start justify-between gap-4"><div><p className="font-semibold">{item.field}</p><p className="mt-2 text-sm leading-6 text-[#5e7061]">{item.explanation}</p></div><span className="rounded-full bg-[#fff0cf] px-3 py-1 text-xs font-bold text-[#87550d]">{item.severity}</span></div><div className="mt-5 grid gap-4 sm:grid-cols-[1fr_160px]"><div><div className="grid gap-3 text-sm sm:grid-cols-2"><p className="rounded-xl bg-[#f7f8f4] p-3"><span className="block text-xs font-bold uppercase text-[#718073]">Form says</span>{item.formValue}</p><p className="rounded-xl bg-[#f7f8f4] p-3"><span className="block text-xs font-bold uppercase text-[#718073]">Proof says</span>{item.documentValue}</p></div><p className="mt-3 rounded-xl bg-[#edf7ee] p-3 text-sm text-[#245e35]"><strong>Fix:</strong> Use the proof wording or attach the clarification note.</p></div>{proof?.dataUrl && <div className="overflow-hidden rounded-xl border border-[#d9e4da]"><p className="p-2 text-xs font-bold uppercase text-[#637766]">Proof excerpt</p><div className="h-24 overflow-hidden"><Image src={proof.dataUrl} alt="Address-proof excerpt" width={160} height={96} unoptimized className="h-full w-full scale-[2.1] object-cover" /></div></div>}</div></article>; }

function Clarification({ mismatches, signed, onSigned }: { mismatches: Mismatch[]; signed: boolean; onSigned: () => void }) { const [name, setName] = useState(""); return <section className="rounded-3xl border border-[#c8dfcb] bg-white p-6"><p className="text-sm font-bold uppercase tracking-[0.14em] text-[#31804a]">Eligible clarification</p><h2 className="mt-2 text-2xl font-semibold">Explain only harmless variations.</h2><p className="mt-3 text-sm leading-6 text-[#516753]">This note covers {mismatches.length} minor wording difference{mismatches.length === 1 ? "" : "s"}. It cannot override a major mismatch.</p>{!signed ? <div className="mt-5 flex flex-col gap-3 sm:flex-row"><input value={name} onChange={(event) => setName(event.target.value)} placeholder="Type your name to mock e-sign" className="min-w-0 flex-1 rounded-xl border border-[#bcd0bf] px-4 py-3" /><button disabled={!name.trim()} onClick={onSigned} className="rounded-xl bg-[#166534] px-5 py-3 font-semibold text-white disabled:opacity-50">Mock e-sign note</button></div> : <p className="mt-5 rounded-xl bg-[#edf8ef] p-4 text-sm font-semibold text-[#236b39]">✓ Mock clarification note signed.</p>}</section>; }

function compareAddresses(submitted: string, extracted: string) { const normalise = (value: string) => value.toLowerCase().replaceAll(".", "").replace(/\brd\b/g, "road").replace(/indira\s+nagar/g, "indiranagar").replace(/bangalore/g, "bengaluru").replace(/[^a-z0-9]/g, ""); return { match: normalise(submitted) === normalise(extracted) }; }

function Packet({ reportId, timestamp, onReset }: { reportId: string; timestamp: string; onReset: () => void }) { return <section className="mt-8"><div className="rounded-3xl border border-[#b8dfc0] bg-[#f1fbf3] p-8"><span className="text-3xl">✓</span><p className="mt-5 text-sm font-bold uppercase tracking-[0.14em] text-[#31804a]">Mock packet prepared</p><h1 className="mt-2 text-4xl font-semibold">Ready with clarity.</h1><p className="mt-4 leading-7 text-[#4b6551]">Your packet contains the confirmed new address, document check, and SahiSetu Scrutiny Passport.</p></div><section className="mt-6 rounded-3xl border border-[#dce7dd] bg-white p-6"><p className="font-semibold">SahiSetu Scrutiny Passport</p><p className="mt-1 text-sm text-[#647466]">{reportId} · {timestamp}</p><p className="mt-5 rounded-xl bg-[#fff8e8] p-4 text-sm leading-6 text-[#76551f]">Unofficial companion report only. SahiSetu does not submit to or represent Parivahan or any RTO.</p><button onClick={() => window.print()} className="mt-5 rounded-xl border border-[#bfd1c1] px-5 py-3 font-semibold text-[#285536]">Print / save packet</button></section><button onClick={onReset} className="mt-6 text-sm font-semibold text-[#3a7149] underline">Start another check</button></section>; }
