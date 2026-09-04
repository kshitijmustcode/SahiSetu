import type { ReactNode } from "react";

export type AuditTimelineStep = {
  label: string;
  detail: string;
  state: "complete" | "current" | "attention" | "pending";
};

const stateStyle = {
  complete: "border-[#b9dfc0] bg-[#edf8ef] text-[#246238]",
  current: "border-[#b8d5e8] bg-[#f0f8fc] text-[#235779]",
  attention: "border-[#efd9a2] bg-[#fff8e8] text-[#80591b]",
  pending: "border-[#d9e3da] bg-[#fafcf9] text-[#657467]",
};

const stateIcon = { complete: "✓", current: "→", attention: "!", pending: "○" };

export function ExplainableAuditTimeline({
  steps,
  language,
  title,
  description,
  footer,
}: {
  steps: AuditTimelineStep[];
  language: "en" | "hi";
  title?: string;
  description?: string;
  footer?: ReactNode;
}) {
  const hindi = language === "hi";
  return (
    <section className="rounded-3xl border border-[#cddfce] bg-[#fbfefb] p-6 sm:p-8">
      <p className="text-sm font-bold uppercase tracking-[0.14em] text-[#31804a]">
        {hindi ? "समझने योग्य ऑडिट ट्रेल" : "Explainable audit trail"}
      </p>
      <h2 className="mt-2 text-2xl font-semibold">
        {title ?? (hindi ? "आपकी स्थिति यहाँ तक कैसे पहुँची" : "How this case reached its next step")}
      </h2>
      <p className="mt-3 max-w-3xl text-sm leading-6 text-[#5b7060]">
        {description ??
          (hindi
            ? "हर चरण में दिखता है कि किस रिकॉर्ड का उपयोग हुआ, क्या पढ़ा गया, नागरिक को क्या समीक्षा करनी है और सुरक्षित अगला कदम क्या है।"
            : "Each step shows the record used, what was read, what the citizen needs to review, and the safe next action.")}
      </p>
      <ol className="mt-6 grid grid-cols-[repeat(auto-fit,minmax(12rem,1fr))] gap-3">
        {steps.map((step, index) => (
          <li key={step.label} className={`rounded-2xl border p-4 ${stateStyle[step.state]}`}>
            <div className="flex items-center gap-2">
              <span
                className="grid h-6 w-6 place-items-center rounded-full bg-white/80 text-sm font-bold"
                aria-hidden="true"
              >
                {stateIcon[step.state]}
              </span>
              <span className="text-xs font-bold uppercase tracking-[0.12em]">{index + 1}</span>
            </div>
            <p className="mt-3 font-semibold leading-5">{step.label}</p>
            <p className="mt-2 text-sm leading-5 opacity-90">{step.detail}</p>
          </li>
        ))}
      </ol>
      {footer && <div className="mt-5">{footer}</div>}
    </section>
  );
}
