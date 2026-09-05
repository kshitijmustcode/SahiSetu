"use client";

import Link from "next/link";
import { FormEvent, useRef, useState } from "react";
import { SiteFooter, SiteNavigation } from "../components/site-chrome";
import { useLanguage } from "../components/language-toggle";
import type { HelpSource } from "../lib/guided-help-knowledge";

type Answer = { answer: string; sources: HelpSource[]; mode: "source-grounded" };

type DecodedStatus = {
  meaning: string;
  meaningHi: string;
  payment: string;
  paymentHi: string;
  next: string;
  nextHi: string;
};

const statusOptions = [
  { label: "Application under scrutiny at RTO level", labelHi: "RTO स्तर पर आवेदन की जाँच जारी है" },
  { label: "Document upload pending", labelHi: "दस्तावेज़ अपलोड लंबित है" },
  { label: "Pending at printing layer", labelHi: "प्रिंटिंग स्तर पर लंबित है" },
  { label: "Objection raised", labelHi: "आपत्ति दर्ज की गई है" },
  { label: "Payment deducted, application pending", labelHi: "भुगतान कट गया, आवेदन लंबित है" },
];

function decodeStatus(value: string): DecodedStatus | null {
  const status = value.toLowerCase();
  if (status.includes("scrutiny")) {
    return {
      meaning:
        "This wording commonly indicates that the application is awaiting or undergoing review. It is not an approval, rejection, or a reason to visit the RTO immediately.",
      meaningHi:
        "इसका सामान्य अर्थ है कि आवेदन समीक्षा की प्रतीक्षा में है या उसकी समीक्षा चल रही है। यह स्वीकृति, अस्वीकृति या तुरंत RTO जाने का निर्देश नहीं है।",
      payment: "SahiSetu cannot verify a payment from this status. Keep your receipt and transaction reference.",
      paymentHi: "SahiSetu इस स्थिति से भुगतान की पुष्टि नहीं कर सकता। अपनी रसीद और ट्रांज़ैक्शन संदर्भ सुरक्षित रखें।",
      next: "Review the official application-status page and any visible document/request message. Keep your application reference; follow the relevant official service if it asks for an action.",
      nextHi:
        "आधिकारिक आवेदन-स्थिति पेज और कोई दिखाई देने वाला दस्तावेज़/अनुरोध संदेश देखें। अपना आवेदन संदर्भ रखें; यदि आधिकारिक सेवा कोई कार्रवाई कहे तो उसी का पालन करें।",
    };
  }
  if (status.includes("upload") || (status.includes("document") && status.includes("pending"))) {
    return {
      meaning:
        "The wording commonly indicates that the official flow still expects a document step or has not reflected an upload yet. It does not tell SahiSetu whether a file was accepted.",
      meaningHi:
        "इसका सामान्य अर्थ है कि आधिकारिक प्रक्रिया अभी दस्तावेज़ चरण की अपेक्षा कर रही है या अपलोड अभी दिखा नहीं है। इससे SahiSetu यह नहीं बता सकता कि फ़ाइल स्वीकार हुई या नहीं।",
      payment:
        "This status does not confirm anything about a payment. Keep the upload acknowledgement or screenshots with your receipt, if you have one.",
      paymentHi:
        "यह स्थिति भुगतान के बारे में कुछ पुष्टि नहीं करती। यदि उपलब्ध हो तो अपलोड रसीद या स्क्रीनशॉट को अपनी भुगतान रसीद के साथ रखें।",
      next: "Use the relevant state application-status route to check whether the document is listed. Re-upload only if the official flow specifically asks you to.",
      nextHi:
        "संबंधित राज्य आवेदन-स्थिति मार्ग में देखें कि दस्तावेज़ सूचीबद्ध है या नहीं। केवल तभी दोबारा अपलोड करें जब आधिकारिक प्रक्रिया स्पष्ट रूप से कहे।",
    };
  }
  if (status.includes("printing")) {
    return {
      meaning:
        "This wording commonly points to a later processing or printing stage. SahiSetu cannot confirm issuance, dispatch, or an exact completion date from it.",
      meaningHi:
        "इसका सामान्य अर्थ बाद के प्रसंस्करण या प्रिंटिंग चरण से हो सकता है। SahiSetu इससे जारी होने, प्रेषण या सटीक पूर्णता तारीख की पुष्टि नहीं कर सकता।",
      payment:
        "This status is not a payment confirmation. Retain the original receipt and do not make a duplicate payment because of this wording alone.",
      paymentHi:
        "यह स्थिति भुगतान की पुष्टि नहीं है। मूल रसीद सुरक्षित रखें और केवल इस स्थिति के आधार पर दोबारा भुगतान न करें।",
      next: "Check the official application-status route for a dispatch, collection, or action message. If the official service gives no action, keep the reference and check again through that service.",
      nextHi:
        "आधिकारिक आवेदन-स्थिति मार्ग में प्रेषण, संग्रह या कार्रवाई संदेश देखें। यदि आधिकारिक सेवा कोई कार्रवाई नहीं दिखाती, तो संदर्भ रखें और उसी सेवा में फिर जाँचें।",
    };
  }
  if (status.includes("objection")) {
    return {
      meaning:
        "An objection normally means the official service expects clarification or a correction. A code by itself is not enough for SahiSetu to infer the reason safely.",
      meaningHi:
        "आपत्ति का सामान्य अर्थ है कि आधिकारिक सेवा स्पष्टीकरण या सुधार चाहती है। केवल कोड से SahiSetu कारण का सुरक्षित अनुमान नहीं लगा सकता।",
      payment:
        "An objection does not by itself say whether a payment is successful, refundable, or due again. Keep your receipt and reference.",
      paymentHi:
        "केवल आपत्ति से यह नहीं पता चलता कि भुगतान सफल, वापसी योग्य या दोबारा देय है। अपनी रसीद और संदर्भ सुरक्षित रखें।",
      next: "Open the official notice or application-status details and act only on the specific document or correction request shown there. Do not guess from the sub-code alone.",
      nextHi:
        "आधिकारिक नोटिस या आवेदन-स्थिति विवरण खोलें और केवल वहाँ दिखाए गए विशेष दस्तावेज़ या सुधार अनुरोध पर कार्य करें। केवल उप-कोड से अनुमान न लगाएँ।",
    };
  }
  if (status.includes("payment") || status.includes("deducted")) {
    return {
      meaning:
        "A deducted-payment message with a pending application can be a reconciliation issue, but SahiSetu cannot see the bank, gateway, or official application record.",
      meaningHi:
        "आवेदन लंबित होने पर भुगतान कटने का संदेश मिलान संबंधी समस्या हो सकता है, लेकिन SahiSetu बैंक, पेमेंट गेटवे या आधिकारिक आवेदन रिकॉर्ड नहीं देख सकता।",
      payment:
        "Do not treat this as proof that money is safe or lost. Retain the receipt, transaction reference, amount, and date.",
      paymentHi:
        "इसे पैसे सुरक्षित या खो जाने का प्रमाण न मानें। रसीद, ट्रांज़ैक्शन संदर्भ, राशि और तारीख सुरक्षित रखें।",
      next: "Use the official transaction-status service before considering another payment. If it asks for support, share evidence only through the official route.",
      nextHi:
        "दोबारा भुगतान पर विचार करने से पहले आधिकारिक लेनदेन-स्थिति सेवा का उपयोग करें। यदि सहायता मांगी जाए, तो प्रमाण केवल आधिकारिक मार्ग से साझा करें।",
    };
  }
  return null;
}

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
  const [statusText, setStatusText] = useState("");
  const [decodedStatus, setDecodedStatus] = useState<DecodedStatus | null>(null);
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
        <SiteNavigation>
          <Link
            href="/demo"
            className="rounded-lg border border-[#c7dcc9] bg-[#f4faf3] px-3 py-2 text-sm font-semibold text-[#285536] hover:bg-[#eaf6ec]"
          >
            {hindi ? "डेमो चुनें" : "Choose demo"}
          </Link>
        </SiteNavigation>

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
                <p className="mt-3 whitespace-pre-wrap leading-7 text-[#284636]">
                  {answer.answer.replaceAll("**", "").replaceAll("__", "")}
                </p>
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

          <section className="mt-8 rounded-3xl border border-[#b9d8ed] bg-[#f6fbff] p-6 shadow-sm sm:p-8">
            <p className="text-sm font-bold uppercase tracking-[0.14em] text-[#1e638f]">
              {hindi ? "स्थिति डिकोडर" : "Status Decoder"}
            </p>
            <h2 className="mt-2 text-2xl font-semibold">
              {hindi
                ? "अस्पष्ट स्थिति को शांत, सुरक्षित मार्गदर्शन में बदलें"
                : "Turn an opaque status into calm, safe guidance"}
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-[#526b7b]">
              {hindi
                ? "स्थिति चुनें या शब्द लिखें। यह उपकरण केवल आपके ब्राउज़र में चलता है, कोई आईडी या व्यक्तिगत जानकारी न डालें।"
                : "Choose a familiar status or type its wording. This tool runs only in your browser; do not enter an ID or personal information."}
            </p>
            <div className="mt-5">
              <label htmlFor="status-decoder" className="sr-only">
                {hindi ? "स्थिति टेक्स्ट" : "Status text"}
              </label>
              <input
                id="status-decoder"
                value={statusText}
                onChange={(event) => {
                  const nextStatus = event.target.value.slice(0, 180);
                  setStatusText(nextStatus);
                  setDecodedStatus(decodeStatus(nextStatus));
                }}
                list="known-statuses"
                autoComplete="off"
                placeholder={hindi ? "उदाहरण: Application under Scrutiny" : "Example: Application under Scrutiny"}
                className="w-full rounded-xl border border-[#afd0e2] bg-white px-4 py-3 text-sm outline-none placeholder:text-[#7890a0] focus:border-[#2779a6] focus:ring-4 focus:ring-[#dceef7]"
              />
              <datalist id="known-statuses">
                {statusOptions.map((option) => (
                  <option key={option.label} value={option.label} label={hindi ? option.labelHi : option.label} />
                ))}
              </datalist>
            </div>
            <div className="mt-4 flex flex-wrap gap-2" aria-label={hindi ? "सामान्य स्थितियाँ" : "Common statuses"}>
              {statusOptions.map((option) => (
                <button
                  key={option.label}
                  type="button"
                  onClick={() => {
                    setStatusText(option.label);
                    setDecodedStatus(decodeStatus(option.label));
                  }}
                  className="rounded-full border border-[#b9d8ed] bg-white px-3 py-1.5 text-xs font-semibold text-[#245b7c] hover:bg-[#e9f5fb]"
                >
                  {hindi ? option.labelHi : option.label}
                </button>
              ))}
            </div>
            {decodedStatus ? (
              <section
                aria-live="polite"
                className="mt-6 grid gap-3 rounded-2xl border border-[#b9d8ed] bg-white p-5 md:grid-cols-3"
              >
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#27709a]">
                    {hindi ? "आमतौर पर मतलब" : "What it commonly means"}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-[#29485b]">
                    {hindi ? decodedStatus.meaningHi : decodedStatus.meaning}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#27709a]">
                    {hindi ? "भुगतान सीमा" : "Payment boundary"}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-[#29485b]">
                    {hindi ? decodedStatus.paymentHi : decodedStatus.payment}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#27709a]">
                    {hindi ? "सुरक्षित अगला कदम" : "Safe next step"}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-[#29485b]">
                    {hindi ? decodedStatus.nextHi : decodedStatus.next}
                  </p>
                </div>
              </section>
            ) : statusText.trim().length >= 3 ? (
              <p className="mt-5 rounded-xl border border-dashed border-[#b9d8ed] bg-white/70 p-4 text-sm leading-6 text-[#526b7b]">
                {hindi
                  ? "इस शब्द के लिए कोई सुरक्षित, निश्चित व्याख्या नहीं है। आधिकारिक स्थिति विवरण या नोटिस देखें; केवल कोड से अनुमान न लगाएँ।"
                  : "There is no safe, definite explanation for this wording. Check the official status details or notice; do not infer the reason from a code alone."}
              </p>
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
        <SiteFooter>
          {hindi
            ? "स्वतंत्र, केवल-सिंथेटिक-डेटा प्रोटोटाइप — कोई आधिकारिक सरकारी सेवा नहीं।"
            : "Independent demo · not an official government service."}
        </SiteFooter>
      </div>
    </main>
  );
}
