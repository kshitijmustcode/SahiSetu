"use client";

import Link from "next/link";
import { ChangeEvent, FormEvent, useState } from "react";

type UploadedFile = { name: string; size: string; dataUrl: string } | null;
type Assessment = {
  overallStatus: "clear" | "needs_clarification" | "needs_correction";
  confidence: number;
  documentAddress: string;
  summary: string;
  mismatches: { field: string; formValue: string; documentValue: string; severity: "minor" | "major"; explanation: string; recommendedAction: "clarification_note" | "correct_form" }[];
};

export default function ApplyPage() {
  const [address, setAddress] = useState("12 M.G. Rd., Indira Nagar, Bengaluru, Karnataka 560038");
  const [licence, setLicence] = useState<UploadedFile>(null);
  const [proof, setProof] = useState<UploadedFile>(null);
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [source, setSource] = useState<"openai" | "synthetic_demo" | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function addFile(event: ChangeEvent<HTMLInputElement>, setFile: (file: UploadedFile) => void) {
    const file = event.target.files?.[0];
    if (!file) return;
    const dataUrl = await optimisedDataUrl(file);
    setFile({ name: file.name, size: `${Math.max(1, Math.round(file.size / 1024))} KB`, dataUrl });
  }

  async function startCheck(event: FormEvent) {
    event.preventDefault();
    if (!licence || !proof) { setError("Please choose both synthetic documents before continuing."); return; }
    setError(""); setLoading(true);
    try {
      const response = await fetch("/api/pre-scrutiny", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ address, documents: [licence, proof] }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "We could not run the document check.");
      setAssessment(data.assessment); setSource(data.source);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "We could not run the document check.");
    } finally { setLoading(false); }
  }

  return <main className="min-h-screen bg-[#fffdf8] text-[#17281f]"><div className="mx-auto max-w-3xl px-5 py-6 sm:px-8 sm:py-10">
    <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-[#356044] hover:text-[#166534]">← Back to SahiSetu</Link>
    <header className="mt-9"><div className="flex items-center justify-between"><p className="text-sm font-bold uppercase tracking-[0.14em] text-[#31804a]">Address change</p><p className="text-sm font-medium text-[#617466]">{assessment ? "Step 2 of 3" : "Step 1 of 3"}</p></div><div className="mt-3 h-2 rounded-full bg-[#e4ede3]"><div className={`h-full rounded-full bg-[#218144] ${assessment ? "w-2/3" : "w-1/3"}`} /></div></header>
    {assessment ? <Results assessment={assessment} source={source} onReset={() => setAssessment(null)} /> : <form onSubmit={startCheck} className="mt-8 space-y-8"><section><h1 className="text-4xl font-semibold tracking-[-0.045em] sm:text-5xl">Let’s check your application.</h1><p className="mt-4 max-w-2xl text-lg leading-8 text-[#586b5d]">Use only synthetic documents for this prototype. We will look for small differences before a mock submission.</p></section><section className="rounded-3xl border border-[#dbe8dc] bg-white p-6 sm:p-8"><h2 className="text-xl font-semibold">New address</h2><label className="mt-5 block text-sm font-semibold" htmlFor="address">Address exactly as entered in your RTO application</label><textarea id="address" required value={address} onChange={(event) => setAddress(event.target.value)} className="mt-2 min-h-28 w-full rounded-xl border border-[#bfd0c0] bg-[#fffefa] p-4 text-base leading-6 outline-none ring-[#4a9660] focus:ring-2" /><p className="mt-2 text-sm text-[#6b7c6d]">Example formatting differences: Rd. vs Road, Indira Nagar vs Indiranagar.</p></section><section className="rounded-3xl border border-[#dbe8dc] bg-white p-6 sm:p-8"><h2 className="text-xl font-semibold">Supporting documents</h2><p className="mt-2 text-sm leading-6 text-[#647466]">Upload a synthetic driving licence and synthetic address proof. JPG, PNG, or PDF.</p><div className="mt-6 grid gap-4 sm:grid-cols-2"><UploadCard title="Driving licence" file={licence} onChange={(event) => addFile(event, setLicence)} /><UploadCard title="Address proof" file={proof} onChange={(event) => addFile(event, setProof)} /></div></section>{error && <p className="rounded-xl bg-[#fff0ee] px-4 py-3 text-sm text-[#9d301e]">{error}</p>}<p className="rounded-xl bg-[#f3f9f2] px-4 py-3 text-sm leading-6 text-[#44634b]"><strong>Privacy note:</strong> SahiSetu is a demo. Do not upload real government IDs, Aadhaar numbers, or other sensitive data.</p><button disabled={loading} className="w-full rounded-xl bg-[#166534] px-6 py-4 text-base font-semibold text-white shadow-lg shadow-[#166534]/20 hover:bg-[#10572b] disabled:cursor-wait disabled:opacity-70">{loading ? "Checking your documents…" : "Run AI pre-scrutiny →"}</button></form>}
  </div></main>;
}

function UploadCard({ title, file, onChange }: { title: string; file: UploadedFile; onChange: (event: ChangeEvent<HTMLInputElement>) => void }) {
  const id = title.toLowerCase().replace(" ", "-");
  return <div className="rounded-2xl border border-dashed border-[#abc9b0] bg-[#fbfefb] p-5"><p className="font-semibold">{title}</p>{file ? <div className="mt-4 rounded-xl bg-[#e9f6eb] p-3"><p className="truncate text-sm font-semibold text-[#1c6836]">✓ {file.name}</p><p className="mt-1 text-xs text-[#59775e]">{file.size} · ready to check</p><label htmlFor={id} className="mt-3 inline-block cursor-pointer text-sm font-semibold text-[#287a43]">Replace file</label></div> : <><p className="mt-2 text-sm leading-5 text-[#6a7a6d]">Choose a synthetic image or PDF.</p><label htmlFor={id} className="mt-4 inline-block cursor-pointer rounded-lg border border-[#b9d5bd] bg-white px-3 py-2 text-sm font-semibold text-[#2a713e]">Choose file</label></>}<input id={id} className="sr-only" accept="image/png,image/jpeg,application/pdf" type="file" onChange={onChange} /></div>;
}

async function optimisedDataUrl(file: File) {
  const original = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
  if (!file.type.startsWith("image/")) return original;

  const image = new Image();
  image.src = original;
  await new Promise<void>((resolve, reject) => { image.onload = () => resolve(); image.onerror = () => reject(new Error("Could not read this image.")); });
  const scale = Math.min(1, 1280 / Math.max(image.width, image.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(image.width * scale);
  canvas.height = Math.round(image.height * scale);
  canvas.getContext("2d")?.drawImage(image, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", 0.78);
}

function Results({ assessment, source, onReset }: { assessment: Assessment; source: "openai" | "synthetic_demo" | null; onReset: () => void }) {
  const [showNote, setShowNote] = useState(false);
  const [noteSigned, setNoteSigned] = useState(false);
  const [packetReady, setPacketReady] = useState(false);
  const clear = assessment.overallStatus === "clear";
  const mismatchCount = assessment.mismatches.length;
  const hasMajorMismatch = assessment.mismatches.some((item) => item.severity === "major");
  const resultHeading = clear
    ? "Your documents look consistent."
    : mismatchCount === 1
      ? hasMajorMismatch ? "One difference needs correction." : "One small difference needs attention."
      : `${mismatchCount} differences need attention.`;
  if (packetReady) return <SubmissionReady onReset={onReset} />;
  return <section className="mt-8"><p className="text-sm font-bold uppercase tracking-[0.14em] text-[#31804a]">Pre-scrutiny result</p><div className={`mt-4 rounded-3xl border p-7 sm:p-9 ${clear ? "border-[#b9dfc0] bg-[#f3fbf4]" : "border-[#f0d49f] bg-[#fff9ed]"}`}><span className="grid h-12 w-12 place-items-center rounded-full bg-white text-2xl">{clear ? "✓" : "⚠"}</span><h1 className="mt-5 text-3xl font-semibold tracking-[-0.04em]">{resultHeading}</h1><p className="mt-3 max-w-xl leading-7 text-[#536457]">{assessment.summary}</p><div className="mt-6 flex flex-wrap gap-3 text-sm"><span className="rounded-full bg-white px-3 py-1.5 font-semibold text-[#2e6540]" title="How confidently the AI read and compared the visible document text—not an approval prediction.">{Math.round(assessment.confidence * 100)}% text-read confidence</span><span className="rounded-full bg-white px-3 py-1.5 font-semibold text-[#526958]">{source === "openai" ? "Analysed with OpenAI Vision" : "Synthetic demo assessment"}</span></div><p className="mt-3 text-xs leading-5 text-[#66776a]">Text-read confidence reflects document-reading certainty, not the likelihood of RTO approval.</p></div>{assessment.mismatches.map((item) => <article key={item.field} className="mt-6 rounded-2xl border border-[#e4e6dd] bg-white p-6"><div className="flex items-start justify-between gap-4"><div><p className="font-semibold">{item.field}</p><p className="mt-2 text-sm leading-6 text-[#5e7061]">{item.explanation}</p></div><span className="rounded-full bg-[#fff0cf] px-3 py-1 text-xs font-bold text-[#87550d]">{item.severity}</span></div><dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2"><div className="rounded-xl bg-[#f7f8f4] p-3"><dt className="text-xs font-semibold uppercase tracking-wide text-[#718073]">Form says</dt><dd className="mt-1 leading-5">{item.formValue}</dd></div><div className="rounded-xl bg-[#f7f8f4] p-3"><dt className="text-xs font-semibold uppercase tracking-wide text-[#718073]">Proof says</dt><dd className="mt-1 leading-5">{item.documentValue}</dd></div></dl></article>)}{!clear && <button onClick={() => setShowNote(true)} className="mt-6 w-full rounded-xl bg-[#166534] px-5 py-4 font-semibold text-white shadow-lg shadow-[#166534]/20 hover:bg-[#10572b]">Generate clarification note →</button>}{showNote && <ClarificationNote mismatch={assessment.mismatches[0]} onSigned={() => setNoteSigned(true)} />}{(clear || noteSigned) && <button onClick={() => setPacketReady(true)} className="mt-6 w-full rounded-xl bg-[#166534] px-5 py-4 font-semibold text-white shadow-lg shadow-[#166534]/20 hover:bg-[#10572b]">Prepare submission-ready packet →</button>}<button onClick={onReset} className="mt-6 rounded-xl border border-[#bfd1c1] bg-white px-5 py-3 font-semibold text-[#285536]">Check another application</button></section>;
}

function ClarificationNote({ mismatch, onSigned }: { mismatch: Assessment["mismatches"][number]; onSigned: () => void }) {
  const [signature, setSignature] = useState("");
  const [signed, setSigned] = useState(false);
  return <section className="mt-6 rounded-3xl border border-[#c8dfcb] bg-white p-6 sm:p-8"><div className="flex items-center justify-between gap-4"><div><p className="text-sm font-bold uppercase tracking-[0.14em] text-[#31804a]">Generated clarification</p><h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em]">A simple note can prevent a delay.</h2></div><span className="rounded-full bg-[#e8f5e9] px-3 py-1.5 text-xs font-bold text-[#2d7544]">Draft</span></div><article className="mt-6 rounded-2xl border border-[#dce5dc] bg-[#fffefa] p-5 text-sm leading-7 text-[#364b3b]"><p><strong>To the concerned RTO officer,</strong></p><p className="mt-4">I confirm that the locality shown as <strong>“{mismatch.formValue.includes("Indira Nagar") ? "Indira Nagar" : mismatch.formValue}</strong>” in my application and <strong>“{mismatch.documentValue}</strong>” in my submitted address proof refer to the same address. The difference is only a formatting or spelling variation.</p><p className="mt-4">I request that my address-change application be considered using the supporting document submitted with it.</p><p className="mt-5">Sincerely,<br /><span className="font-medium">Applicant</span></p></article>{!signed ? <div className="mt-6"><label htmlFor="signature" className="text-sm font-semibold">Type your name to mock e-sign this note</label><div className="mt-2 flex flex-col gap-3 sm:flex-row"><input id="signature" value={signature} onChange={(event) => setSignature(event.target.value)} placeholder="e.g. Aisha Sharma" className="min-w-0 flex-1 rounded-xl border border-[#bcd0bf] px-4 py-3 outline-none ring-[#4a9660] focus:ring-2" /><button disabled={!signature.trim()} onClick={() => { setSigned(true); onSigned(); }} className="rounded-xl bg-[#166534] px-5 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50">Mock e-sign note</button></div><p className="mt-2 text-xs leading-5 text-[#708072]">This is a prototype signature, not a legal e-signature.</p></div> : <div className="mt-6 rounded-2xl bg-[#edf8ef] p-5"><p className="font-semibold text-[#1e6635]">✓ Clarification note e-signed by {signature}</p><p className="mt-1 text-sm leading-6 text-[#48644e]">Your clarification is now ready to attach to the mock submission packet.</p></div>}</section>;
}

function SubmissionReady({ onReset }: { onReset: () => void }) {
  return <section className="mt-8"><div className="rounded-3xl border border-[#b8dfc0] bg-[#f1fbf3] p-7 sm:p-10"><span className="grid h-14 w-14 place-items-center rounded-full bg-white text-3xl text-[#17753a]">✓</span><p className="mt-6 text-sm font-bold uppercase tracking-[0.14em] text-[#31804a]">Packet prepared</p><h1 className="mt-2 text-4xl font-semibold tracking-[-0.045em]">You’re ready to submit with clarity.</h1><p className="mt-4 max-w-2xl text-lg leading-8 text-[#4b6551]">Your mock application packet contains the address-change form, both supporting documents, the pre-scrutiny result, and your e-signed clarification note.</p></div><section className="mt-6 rounded-3xl border border-[#dce7dd] bg-white p-6 sm:p-8"><h2 className="text-xl font-semibold">Submission packet</h2><div className="mt-5 divide-y divide-[#e7eee7] rounded-2xl border border-[#e1e9e1]"><PacketRow name="Address-change application" detail="Completed · ready" /><PacketRow name="Synthetic driving licence" detail="Attached · checked" /><PacketRow name="Synthetic address proof" detail="Attached · checked" /><PacketRow name="Clarification note" detail="Mock e-signed · attached" /></div><div className="mt-6 rounded-2xl bg-[#fff8e8] p-5 text-sm leading-6 text-[#76551f]"><strong>What happens next:</strong> In a real implementation, you would be guided to submit this packet through the official portal. SahiSetu does not submit to, access, or represent any government system.</div><div className="mt-6 flex flex-col gap-3 sm:flex-row"><button onClick={() => window.print()} className="rounded-xl border border-[#bfd1c1] bg-white px-5 py-3 font-semibold text-[#285536]">Print / save packet</button><Link href="/" className="rounded-xl bg-[#166534] px-5 py-3 text-center font-semibold text-white">Finish demo</Link></div></section><button onClick={onReset} className="mt-6 text-sm font-semibold text-[#3a7149] underline underline-offset-4">Start another check</button></section>;
}

function PacketRow({ name, detail }: { name: string; detail: string }) { return <div className="flex items-center justify-between gap-4 p-4"><div className="flex items-center gap-3"><span className="grid h-8 w-8 place-items-center rounded-full bg-[#e7f4e8] text-[#1f743a]">✓</span><span className="font-medium">{name}</span></div><span className="text-sm text-[#627565]">{detail}</span></div>; }
