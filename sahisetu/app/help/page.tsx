"use client";

import Link from "next/link";
import { FormEvent, useRef, useState } from "react";
import { LanguageToggle, useLanguage } from "../components/language-toggle";
import type { HelpSource } from "../lib/guided-help-knowledge";

type Answer = { answer: string; sources: HelpSource[]; mode: "source-grounded" };

const issues = [
  {
    title: "My payment was deducted, but my application is pending",
    titleHi: "भुगतान कट गया, लेकिन आवेदन लंबित है",
    detail: "Keep your receipt and transaction reference. Do not pay a second time just to clear uncertainty.",
    detailHi: "रसीद और ट्रांज़ैक्शन संदर्भ संभालकर रखें। केवल अनिश्चितता मिटाने के लिए दूसरी बार भुगतान न करें।",
    question:
      "My payment was deducted, but my application is still pending. What evidence should I retain and what is the safe next step?",
    tone: "border-[#b9d8ed] bg-[#f1f8fd] text-[#1e5279]",
    icon: "₹",
  },
  {
    title: "My application shows Under Scrutiny",
    titleHi: "मेरे आवेदन में Under Scrutiny दिख रहा है",
    detail: "Turn an opaque status into the evidence you need to retain and one safe next step.",
    detailHi: "अस्पष्ट स्थिति को जरूरी प्रमाण और एक सुरक्षित अगले कदम में बदलें।",
    question:
      "My driving-licence application shows Under Scrutiny. What should I check before I use the official service?",
    tone: "border-[#efd6a0] bg-[#fff9e9] text-[#795719]",
    icon: "!",
  },
  {
    title: "I uploaded documents, but upload is still pending",
    titleHi: "मैंने दस्तावेज़ अपलोड किए, पर स्थिति अभी भी लंबित है",
    detail: "Prepare a clear checklist before checking the relevant official application-status route.",
    detailHi: "संबंधित आधिकारिक आवेदन-स्थिति मार्ग जाँचने से पहले एक स्पष्ट सूची तैयार करें।",
    question: "I uploaded my documents, but the application still says upload pending. What should I check first?",
    tone: "border-[#d6e5d5] bg-[#f2faf3] text-[#285d38]",
    icon: "↑",
  },
  {
    title: "My driving licence expires soon",
    titleHi: "मेरा ड्राइविंग लाइसेंस जल्द समाप्त हो रहा है",
    detail: "See the renewal-readiness checklist before starting the relevant official service.",
    detailHi: "संबंधित आधिकारिक सेवा शुरू करने से पहले नवीनीकरण-तैयारी सूची देखें।",
    question: "My driving licence expires soon. What should I understand before I start the official renewal service?",
    tone: "border-[#f0c5b3] bg-[#fff4ee] text-[#7c3923]",
    icon: "⌛",
  },
  {
    title: "My address changed",
    titleHi: "मेरा पता बदल गया है",
    detail: "Read the new proof carefully and make the final application wording reviewable before submitting.",
    detailHi: "नए प्रमाण को ध्यान से पढ़ें और जमा करने से पहले अंतिम आवेदन-वाक्यांश को समीक्षा योग्य बनाएं।",
    question:
      "My address changed. How should I prepare my address proof and final application wording before using the official service?",
    tone: "border-[#d9e5cf] bg-[#f6fbf0] text-[#46662c]",
    icon: "⌂",
  },
];

export default function GuidedHelpPage() {
  const language = useLanguage();
  const hindi = language === "hi";
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<Answer | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const questionField = useRef<HTMLTextAreaElement>(null);

  function chooseQuestion(suggestedQuestion: string) {
    setQuestion(suggestedQuestion);
    setAnswer(null);
    setError("");
    questionField.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    questionField.current?.focus();
  }

  async function ask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAnswer(null);
    setError("");
    setLoading(true);
    try {
      const response = await fetch("/api/guided-help", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ question, language }),
      });
      const data = (await response.json()) as Answer & { error?: string };
      if (!response.ok || data.error) {
        setError(data.error ?? "We could not answer that question right now.");
        return;
      }
      setAnswer(data);
    } catch {
      setError("We could not answer that question right now. Please try an issue card instead.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#fffdf8] text-[#17281f]">
      <div className="mx-auto max-w-6xl px-5 py-5 sm:px-8">
        <nav className="flex items-center justify-between" aria-label="Main navigation">
          <Link href="/" className="flex items-center gap-3 font-semibold tracking-tight">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#166534] text-lg text-white shadow-sm">
              स
            </span>
            <span className="text-xl">SahiSetu</span>
          </Link>
          <div className="flex items-center gap-2">
            <LanguageToggle />
            <Link
              href="/demo"
              className="rounded-lg border border-[#c7dcc9] bg-[#f4faf3] px-3 py-2 text-sm font-semibold text-[#285536] hover:bg-[#eaf6ec]"
            >
              {hindi ? "डेमो चुनें" : "Choose demo"}
            </Link>
          </div>
        </nav>

        <section className="py-14 sm:py-20">
          <p className="inline-flex rounded-full bg-[#eaf5ed] px-3 py-1.5 text-sm font-semibold text-[#23663a]">
            {hindi ? "निर्देशित सहायता केंद्र" : "Guided Help Centre"}
          </p>
          <div className="mt-5 grid gap-10 lg:grid-cols-[1.05fr_.95fr] lg:items-start">
            <div>
              <h1 className="max-w-3xl text-4xl font-semibold tracking-[-0.05em] sm:text-6xl">
                {hindi ? "समस्या बताइए। अगला सुरक्षित कदम समझिए।" : "Name the problem. Understand the safe next step."}
              </h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-[#526558]">
                {hindi
                  ? "सामान्य परिवहन-पेपरवर्क समस्याओं के लिए छोटा, स्रोत-आधारित मार्गदर्शन। SahiSetu कोई आधिकारिक सेवा नहीं है और कोई आवेदन, भुगतान या स्थिति नहीं देखता।"
                  : "Short, source-grounded guidance for common transport-paperwork problems. SahiSetu is not an official service and cannot view applications, payments, or status."}
              </p>
            </div>
            <aside className="rounded-3xl border border-[#efd6a0] bg-[#fff9e9] p-5 text-sm leading-6 text-[#775819]">
              <p className="font-bold">{hindi ? "गोपनीयता सीमा" : "Privacy boundary"}</p>
              <p className="mt-1">
                {hindi
                  ? "लाइसेंस/आवेदन नंबर, फोन, ईमेल, पता, OTP, बैंक या भुगतान संदर्भ न लिखें। सवाल केवल यह उत्तर बनाने के लिए इस्तेमाल होता है; SahiSetu कोई नागरिक रिकॉर्ड नहीं बनाता।"
                  : "Do not enter licence or application numbers, phone, email, address, OTP, bank, or payment references. Your question is used only to create this response; SahiSetu does not create a citizen record."}
              </p>
            </aside>
          </div>

          <section className="mt-10 rounded-3xl border border-[#cce1d0] bg-white p-6 shadow-sm sm:p-8">
            <p className="text-sm font-bold uppercase tracking-[0.14em] text-[#2f7947]">
              {hindi ? "स्रोत-आधारित प्रश्न" : "Source-grounded question"}
            </p>
            <h2 className="mt-2 text-2xl font-semibold">
              {hindi ? "परिवहन पेपरवर्क पर पूछें" : "Ask about transport paperwork"}
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-[#607164]">
              {hindi
                ? "उत्तर केवल छोटे, चुने हुए आधिकारिक स्रोत पैक से बनाया जाता है। यदि स्रोत में जवाब नहीं है, तो केंद्र अनुमान नहीं लगाएगा।"
                : "Answers are generated only from a small, curated official-source pack. If the pack does not cover your question, the centre will not guess."}
            </p>
            <form onSubmit={ask} className="mt-5">
              <label htmlFor="help-question" className="sr-only">
                {hindi ? "आपका सवाल" : "Your question"}
              </label>
              <textarea
                id="help-question"
                ref={questionField}
                value={question}
                onChange={(event) => setQuestion(event.target.value)}
                maxLength={500}
                autoComplete="off"
                placeholder={
                  hindi
                    ? "उदाहरण: भुगतान कट गया लेकिन आवेदन लंबित है—मुझे पहले क्या संभालकर रखना चाहिए?"
                    : "Example: My payment was deducted but the application is pending — what should I retain first?"
                }
                className="min-h-32 w-full rounded-2xl border border-[#bfd4c1] bg-[#fffefa] p-4 text-base leading-6 outline-none placeholder:text-[#809082] focus:border-[#31804a] focus:ring-4 focus:ring-[#dff1e2]"
              />
              <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-xs text-[#6d7d70]">
                  {question.length}/500 ·{" "}
                  {hindi ? "व्यक्तिगत जानकारी शामिल न करें" : "Do not include personal information"}
                </span>
                <button
                  type="submit"
                  disabled={loading || question.trim().length < 5}
                  className="rounded-xl bg-[#166534] px-5 py-3 font-semibold text-white shadow-sm hover:bg-[#10572b] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading
                    ? hindi
                      ? "स्रोत देखे जा रहे हैं…"
                      : "Checking sources…"
                    : hindi
                      ? "सुरक्षित मार्गदर्शन पाएँ →"
                      : "Get safe guidance →"}
                </button>
              </div>
            </form>
            {error ? (
              <p role="alert" className="mt-5 rounded-xl bg-[#fff0eb] p-4 text-sm font-medium text-[#8b3822]">
                {error}
              </p>
            ) : null}
            {answer ? (
              <section aria-live="polite" className="mt-6 rounded-2xl border border-[#bcdcc3] bg-[#f3fbf4] p-5">
                <p className="text-sm font-bold uppercase tracking-[0.14em] text-[#287343]">
                  {hindi ? "मार्गदर्शन" : "Guidance"}
                </p>
                <p className="mt-3 whitespace-pre-wrap leading-7 text-[#284636]">{answer.answer}</p>
                <div className="mt-5 border-t border-[#cde2d1] pt-4">
                  <p className="text-sm font-bold text-[#315e3f]">
                    {hindi ? "इस्तेमाल किए गए आधिकारिक स्रोत" : "Official sources used"}
                  </p>
                  <ul className="mt-2 space-y-2 text-sm">
                    {answer.sources.map((source) => (
                      <li key={source.id}>
                        <a
                          href={source.url}
                          target="_blank"
                          rel="noreferrer"
                          className="font-semibold text-[#185e92] underline underline-offset-2"
                        >
                          {source.title} ↗
                        </a>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-3 text-xs text-[#607164]">
                    {hindi
                      ? "स्रोत पैक की समीक्षा: 4 सितम्बर 2026। राज्य-विशिष्ट प्रक्रिया अलग हो सकती है; संबंधित आधिकारिक सेवा में सत्यापित करें।"
                      : "Source pack reviewed 4 September 2026. State-specific steps can differ; verify in the relevant official service."}
                  </p>
                </div>
              </section>
            ) : null}
          </section>

          <section className="mt-12">
            <p className="text-sm font-bold uppercase tracking-[0.14em] text-[#2f7947]">
              {hindi ? "सामान्य समस्याएँ" : "Common problems"}
            </p>
            <h2 className="mt-2 text-3xl font-semibold tracking-[-0.04em]">
              {hindi ? "एक सवाल चुनें, फिर अपना संदर्भ जोड़ें" : "Choose a question, then add your context"}
            </h2>
            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {issues.map((issue) => (
                <button
                  key={issue.title}
                  type="button"
                  onClick={() => chooseQuestion(issue.question)}
                  className={`group rounded-2xl border p-5 text-left transition hover:-translate-y-0.5 hover:shadow-md ${issue.tone}`}
                >
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-white/75 text-lg font-bold">
                    {issue.icon}
                  </span>
                  <h3 className="mt-5 text-lg font-semibold leading-6">{hindi ? issue.titleHi : issue.title}</h3>
                  <p className="mt-2 text-sm leading-6 opacity-90">{hindi ? issue.detailHi : issue.detail}</p>
                  <p className="mt-5 text-sm font-bold">{hindi ? "यह सवाल पूछें →" : "Ask this question →"}</p>
                </button>
              ))}
            </div>
          </section>
        </section>
        <footer className="border-t border-[#e1eade] py-7 text-sm text-[#66796a]">
          {hindi
            ? "स्वतंत्र, केवल-सिंथेटिक-डेटा प्रोटोटाइप — कोई आधिकारिक सरकारी सेवा नहीं।"
            : "Independent, synthetic-data-only prototype — not an official government service."}
        </footer>
      </div>
    </main>
  );
}
