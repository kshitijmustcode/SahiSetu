"use client";

import Link from "next/link";
import { SiteFooter, SiteNavigation } from "./components/site-chrome";
import { useLanguage } from "./components/language-toggle";
import { getRenewalReadiness } from "./lib/dl-readiness";

const services = [
  {
    icon: "⌛",
    title: "DL Guardian",
    titleHi: "DL गार्जियन",
    detail: "Surface an expiry risk, check renewal readiness, and set opt-in simulated reminders.",
    detailHi: "काल्पनिक समाप्ति-जोखिम देखें, नवीनीकरण की तैयारी जाँचें और वैकल्पिक डेमो रिमाइंडर सेट करें।",
    tone: "border-[#f0c4b4] bg-[#fff4ee] text-[#7b3924]",
  },
  {
    icon: "⌂",
    title: "Document readiness",
    titleHi: "दस्तावेज़ तैयारी",
    detail: "Read demo documents, stop on unclear uploads, and show the exact field that needs correction.",
    detailHi: "सिंथेटिक दस्तावेज़ पढ़ें, अस्पष्ट अपलोड पर रुकें और ठीक किया जाने वाला सटीक फ़ील्ड देखें।",
    tone: "border-[#d5e4d6] bg-[#f3faf4] text-[#285d38]",
  },
  {
    icon: "!",
    title: "Application rescue",
    titleHi: "आवेदन सहायता",
    detail: "Turn a stuck-status or payment-pending scenario into one safe next action and evidence checklist.",
    detailHi: "अटकी स्थिति या भुगतान-लंबित मामले को एक सुरक्षित अगली कार्रवाई और प्रमाण-सूची में बदलें।",
    tone: "border-[#c8d9ef] bg-[#f1f6fc] text-[#234f7d]",
  },
];

const demoChecks = [
  [
    "01",
    "Normal address check",
    "सामान्य पता जाँच",
    "Run the full document journey and create a reviewable report.",
    "पूरी सिंथेटिक दस्तावेज़ यात्रा चलाएँ और समीक्षा योग्य रिपोर्ट बनाएँ।",
    "/apply?demo=normal",
  ],
  [
    "02",
    "Fail closed on unreadable proof",
    "अस्पष्ट प्रमाण पर सुरक्षित रूप से रोकें",
    "See SahiSetu stop when a blurry, cropped, or obscured image is unsafe to use.",
    "धुंधली, कटी हुई या छिपी तस्वीर सुरक्षित न होने पर SahiSetu को रुकते देखें।",
    "/apply?demo=blurryProof",
  ],
];

export default function Home() {
  const hindi = useLanguage() === "hi";
  const renewal = getRenewalReadiness();
  return (
    <main className="min-h-screen overflow-hidden bg-[#fffdf8] text-[#17281f]">
      <div className="mx-auto max-w-6xl px-5 py-5 sm:px-8">
        <SiteNavigation>
          <Link
            href="/help"
            className="hidden rounded-lg border border-[#c7dcc9] bg-[#f4faf3] px-3 py-2 text-sm font-semibold text-[#285536] hover:bg-[#eaf6ec] sm:inline"
          >
            {hindi ? "सहायता केंद्र" : "Help centre"}
          </Link>
          <Link
            href="/demo"
            className="rounded-lg border border-[#c7dcc9] bg-[#f4faf3] px-3 py-2 text-sm font-semibold text-[#285536] hover:bg-[#eaf6ec]"
          >
            {hindi ? "डेमो चुनें" : "Choose demo"}
          </Link>
          <a
            href="https://github.com/kshitijmustcode/SahiSetu"
            target="_blank"
            rel="noreferrer"
            className="hidden rounded-lg border border-[#d7e1d7] bg-white px-3 py-2 text-sm font-semibold text-[#285536] hover:bg-[#f4faf3] sm:inline"
          >
            GitHub ↗
          </a>
        </SiteNavigation>

        <section className="grid items-center gap-12 py-16 sm:py-24 lg:grid-cols-[1.08fr_.92fr] lg:py-28">
          <div>
            <p className="inline-flex rounded-full bg-[#fff1d7] px-3 py-1.5 text-sm font-semibold text-[#8a5410]">
              {hindi ? "परिवहन सेवाओं के लिए सक्रिय सहायता परत" : "A proactive support layer for transport services"}
            </p>
            <h1 className="mt-5 max-w-3xl text-5xl font-semibold leading-[1.03] tracking-[-0.055em] sm:text-6xl lg:text-7xl">
              {hindi ? "आवेदन से पहले लाइसेंस-दस्तावेज़ों की गलतियाँ " : "Catch licence-document mistakes "}
              <span className="text-[#19713d]">{hindi ? "पकड़ें।" : "before you apply."}</span>
            </h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-[#526558]">
              {hindi
                ? "SahiSetu नागरिकों को समाप्ति, दस्तावेज़ और आवेदन-स्थिति की समस्या जल्दी पकड़ने में मदद करता है—और आधिकारिक सेवा इस्तेमाल करने से पहले एक सुरक्षित अगली कार्रवाई समझाता है।"
                : "SahiSetu helps citizens catch expiry, document, and application-status issues early and explains one safe next action before they use the official service."}
            </p>
            <section className="mt-8 max-w-2xl rounded-2xl border border-[#d6e5d7] bg-[#f5faf5] p-4 sm:p-5">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#31804a]">
                {hindi ? "राष्ट्रीय पैमाना और संदर्भ" : "National scale & context"}
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl bg-white p-3">
                  <p className="text-2xl font-semibold text-[#19713d]">20.26+ {hindi ? "करोड़" : "crore"}</p>
                  <p className="mt-1 text-xs leading-5 text-[#526558]">
                    {hindi
                      ? "राष्ट्रीय रजिस्ट्री में ड्राइविंग-लाइसेंस रिकॉर्ड"
                      : "Driving-licence records in the national registry"}
                  </p>
                </div>
                <div className="rounded-xl bg-white p-3">
                  <p className="text-2xl font-semibold text-[#9a5b13]">Sarathi</p>
                  <p className="mt-1 text-xs leading-5 text-[#526558]">
                    {hindi ? "DL पता-परिवर्तन सेवा सूचीबद्ध है" : "Lists change of address in DL as a service"}
                  </p>
                </div>
                <div className="rounded-xl bg-white p-3">
                  <p className="text-2xl font-semibold text-[#a2462a]">₹5,000</p>
                  <p className="mt-1 text-xs leading-5 text-[#526558]">
                    {hindi
                      ? "धारा 3/4 के विरुद्ध ड्राइविंग पर धारा 181 का जुर्माना"
                      : "Section 181 fine for driving contrary to sections 3/4"}
                  </p>
                </div>
              </div>
              <p className="mt-3 text-xs leading-5 text-[#647466]">
                {hindi
                  ? "स्रोत: MoRTH वार्षिक रिपोर्ट 2023–24 (31 मार्च 2024 तक) और भारत कोड, मोटर वाहन अधिनियम, धारा 181। यह रजिस्ट्री आकार है, वार्षिक लेन-देन नहीं।"
                  : "Sources: MoRTH Annual Report 2023–24 (as of 31 March 2024) and India Code, Motor Vehicles Act, section 181. This is registry size, not annual transactions."}
              </p>
              <p className="mt-2 text-xs font-semibold text-[#46675b]">
                <a
                  href="https://morth.gov.in/#/"
                  target="_blank"
                  rel="noreferrer"
                  className="underline underline-offset-2 hover:text-[#166534]"
                >
                  {hindi ? "MoRTH वार्षिक रिपोर्ट खोलें ↗" : "Open MoRTH Annual Report ↗"}
                </a>
                <span aria-hidden="true"> · </span>
                <a
                  href="https://www.indiacode.nic.in/handle/123456789/1802"
                  target="_blank"
                  rel="noreferrer"
                  className="underline underline-offset-2 hover:text-[#166534]"
                >
                  {hindi ? "धारा 181 खोलें ↗" : "Open section 181 ↗"}
                </a>
              </p>
              <section className="mt-4 rounded-xl bg-[#193b63] p-4 text-white sm:p-5">
                <p className="text-center text-xs font-bold uppercase tracking-[0.14em] text-[#b9d8ed]">
                  {hindi ? "SahiSetu क्या मदद करता है" : "What SahiSetu helps with"}
                </p>
                <div className="mt-4 grid gap-4 text-center sm:grid-cols-3">
                  <div className="border-t border-[#41627f] pt-4 sm:border-t-0 sm:border-r sm:pr-4 sm:pt-0">
                    <p className="text-sm font-semibold text-[#a8e7b5]">
                      {hindi ? "समाप्ति और तैयारी की कमियाँ जल्दी देखें" : "Spot expiry and preparation gaps early"}
                    </p>
                  </div>
                  <div className="border-t border-[#41627f] pt-4 sm:border-t-0 sm:border-r sm:px-4 sm:pt-0">
                    <p className="text-sm font-semibold text-[#a8e7b5]">
                      {hindi
                        ? "आगे बढ़ने से पहले पता-प्रविष्टि अंतर पकड़ें"
                        : "Catch address-entry differences before proceeding"}
                    </p>
                  </div>
                  <div className="border-t border-[#41627f] pt-4 sm:border-t-0 sm:pl-4 sm:pt-0">
                    <p className="text-sm font-semibold text-[#a8e7b5]">
                      {hindi
                        ? "दूसरे भुगतान पर विचार करने से पहले लंबित भुगतान जाँचें"
                        : "Verify an unresolved payment before considering another payment"}
                    </p>
                  </div>
                </div>
              </section>
            </section>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/demo"
                className="rounded-xl bg-[#193b63] px-6 py-3.5 text-center text-base font-semibold text-white shadow-lg shadow-[#193b63]/20 transition hover:bg-[#142f50]"
              >
                {hindi ? "डेमो स्थिति चुनें →" : "Choose a demo scenario →"}
              </Link>
              <Link
                href="/help"
                className="rounded-xl border border-[#cfe0d1] bg-white px-6 py-3.5 text-center text-base font-semibold text-[#285536] transition hover:bg-[#f4faf3]"
              >
                {hindi ? "निर्देशित सहायता पाएँ →" : "Get guided help →"}
              </Link>
            </div>
            <p className="mt-4 text-sm leading-6 text-[#728176]">
              {hindi
                ? "केवल सिंथेटिक डेटा। SahiSetu नागरिकों को प्रमाणित नहीं करता, आवेदन जमा नहीं करता, भुगतान संसाधित नहीं करता या सरकारी निर्णय नहीं लेता।"
                : "Demo data only. SahiSetu does not authenticate citizens, submit applications, process payments, or make government decisions."}
            </p>
            <Link
              href="/triage"
              className="mt-3 inline-flex text-sm font-semibold text-[#46675b] underline underline-offset-4 hover:text-[#166534]"
            >
              {hindi ? "जज / RTO डेमो देखें →" : "For judges: view the RTO demo →"}
            </Link>
          </div>
          <div className="relative mx-auto w-full max-w-md">
            <div className="absolute -inset-10 -z-0 rounded-full bg-[#dff3df] blur-3xl" />
            <div className="relative rounded-3xl border border-[#d7e8d8] bg-white p-6 shadow-2xl shadow-[#244c2d]/10 sm:p-7">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-bold uppercase tracking-[0.14em] text-[#31804a]">
                    {hindi ? "आराही की डेमो प्रोफ़ाइल" : "Aarohi’s demo profile"}
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold">
                    {hindi ? "नवीनीकरण जोखिम मिला" : "Renewal risk found"}
                  </h2>
                </div>
                <span className="rounded-full bg-[#fff1e9] px-3 py-1.5 text-sm font-bold text-[#934124]">
                  {hindi ? `${renewal.daysRemaining} दिन` : `${renewal.daysRemaining} days`}
                </span>
              </div>
              <p className="mt-3 text-sm leading-6 text-[#556b59]">
                {hindi
                  ? "एक काल्पनिक लाइसेंस की समाप्ति निकट है। आधिकारिक नवीनीकरण यात्रा शुरू करने से पहले SahiSetu जरूरी ध्यान-बिंदु दिखाता है।"
                  : "A licence in the demo is nearing expiry. SahiSetu shows what needs attention before the citizen starts the official renewal journey."}
              </p>
              <div className="mt-6 space-y-3">
                <Status
                  icon="✓"
                  color="green"
                  text={hindi ? "डेमो प्रोफ़ाइल में लाइसेंस मिला" : "Licence detected in demo profile"}
                />
                <Status
                  icon="!"
                  color="amber"
                  text={hindi ? "पते के प्रमाण की समीक्षा आवश्यक" : "Address proof needs review"}
                />
                <Status
                  icon="→"
                  color="red"
                  text={hindi ? "संचार तैयारी की पुष्टि करें" : "Confirm communication readiness"}
                />
              </div>
              <Link
                href="/dashboard?profile=aarohi"
                className="mt-6 block rounded-xl bg-[#166534] px-4 py-3 text-center font-semibold text-white shadow-lg shadow-[#166534]/15 hover:bg-[#10572b]"
              >
                {hindi ? "DL गार्जियन खोलें →" : "Open DL Guardian →"}
              </Link>
            </div>
          </div>
        </section>

        <section className="border-t border-[#e1eade] py-16 sm:py-20">
          <div className="max-w-2xl">
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#31804a]">
              {hindi ? "SahiSetu किसमें मदद करता है" : "What SahiSetu helps with"}
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">
              {hindi
                ? "छोटी समस्या महंगी देरी बनने से पहले, एक स्पष्ट अगला कदम।"
                : "One clearer next step, before a small issue becomes a costly delay."}
            </h2>
            <p className="mt-4 leading-7 text-[#637467]">
              {hindi
                ? "यह प्रोटोटाइप दस्तावेज़ तैयारी को समय-सीमा और रिकवरी मार्गदर्शन से जोड़ता है। यह तैयार करता और समझाता है; हर आधिकारिक कार्रवाई की जिम्मेदारी आधिकारिक परिवहन सेवा और संबंधित RTO की रहती है।"
                : "The prototype combines document readiness with lifecycle and recovery guidance. It prepares and explains; the official transport service and concerned RTO remain responsible for every official action."}
            </p>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {services.map((service) => (
              <article key={service.title} className={`rounded-3xl border p-6 ${service.tone}`}>
                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-white/80 text-xl font-bold">
                  {service.icon}
                </span>
                <h3 className="mt-8 text-xl font-semibold">{hindi ? service.titleHi : service.title}</h3>
                <p className="mt-3 text-sm leading-6 opacity-90">{hindi ? service.detailHi : service.detail}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="border-t border-[#e1eade] py-16 sm:py-20">
          <div className="grid gap-8 lg:grid-cols-[.82fr_1.18fr] lg:items-center">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#31804a]">
                {hindi ? "काम करने वाला प्रमाण" : "The working proof"}
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">
                {hindi ? "दस्तावेज़ जाँच जो सुरक्षित रूप से रुकती है।" : "Document checks that fail closed."}
              </h2>
              <p className="mt-4 leading-7 text-[#637467]">
                {hindi
                  ? "मौजूदा पता-परिवर्तन प्रवाह सिंथेटिक दस्तावेज़ों को जाँचने के लिए OpenAI Vision का उपयोग करता है। यह अनुमान लगाने के बजाय अस्पष्ट, कटी हुई, बदली हुई या अधूरी अपलोड अस्वीकार करता है और सटीक अंतर को समीक्षा योग्य बनाता है।"
                  : "The existing address-change flow uses OpenAI Vision to assess demo documents. It rejects unclear, cropped, swapped, or incomplete uploads instead of guessing—and makes the exact difference reviewable."}
              </p>
              <Link
                href="/apply?demo=normal"
                className="mt-6 inline-flex rounded-xl border border-[#bfd8c2] bg-white px-5 py-3 font-semibold text-[#285536] hover:bg-[#f4faf3]"
              >
                {hindi ? "दस्तावेज़ जाँच चलाएँ →" : "Run the document check →"}
              </Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {demoChecks.map(([number, title, titleHi, detail, detailHi, href]) => (
                <Link
                  href={href}
                  key={number}
                  className="group rounded-3xl border border-[#dbe8dc] bg-white p-6 transition hover:-translate-y-0.5 hover:border-[#9cc9a3] hover:shadow-lg hover:shadow-[#244c2d]/5"
                >
                  <p className="text-sm font-bold text-[#4c9461]">{number}</p>
                  <h3 className="mt-8 text-xl font-semibold group-hover:text-[#166534]">{hindi ? titleHi : title}</h3>
                  <p className="mt-3 text-sm leading-6 text-[#637467]">{hindi ? detailHi : detail}</p>
                  <span className="mt-6 inline-flex text-sm font-semibold text-[#246538]">
                    {hindi ? "स्थिति खोलें →" : "Open scenario →"}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-[#e1eade] py-16 sm:py-20">
          <div className="grid gap-8 rounded-3xl border border-[#d7e5d9] bg-[#f7fbf7] p-6 sm:p-9 lg:grid-cols-[1fr_.9fr] lg:items-center">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#31804a]">
                {hindi ? "सुरक्षा के साथ डिज़ाइन" : "Safe by design"}
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-[-0.035em]">
                {hindi
                  ? "कोई ब्लैक-बॉक्स मंजूरी नहीं। कोई नकली आधिकारिक कार्रवाई नहीं।"
                  : "No black-box approvals. No fake official actions."}
              </h2>
              <p className="mt-4 leading-7 text-[#536b59]">
                {hindi
                  ? "हर परिणाम सहायक दस्तावेज़ फ़ील्ड और अनुशंसित अगली कार्रवाई के साथ हरा, एम्बर या लाल तैयारी-स्पष्टीकरण है। यह प्रोटोटाइप केवल काल्पनिक डेटा उपयोग करता है।"
                  : "Every result is a Green, Amber, or Red readiness explanation with the supporting document field and recommended next action."}
              </p>
            </div>
            <ul className="space-y-3 text-sm leading-6 text-[#405a47]">
              <li>
                ✓{" "}
                {hindi
                  ? "समझ में आने वाली तैयारी—मंजूरी की भविष्यवाणी नहीं"
                  : "Explainable readiness—not approval prediction"}
              </li>
              <li>
                ✓{" "}
                {hindi
                  ? "दस्तावेज़ अस्पष्ट हो तो अनुमान नहीं, दोबारा अपलोड"
                  : "Re-upload rather than guess when a document is unclear"}
              </li>
              <li>✓ {hindi ? "सिमुलेटेड रिमाइंडर—असली संदेश नहीं" : "Simulated reminders—not real messages"}</li>
              <li>
                ✓{" "}
                {hindi
                  ? "आधिकारिक सेवा को हैंडऑफ़—नकली सबमिशन या भुगतान नहीं"
                  : "Official-service handoff—not fake submission or payment"}
              </li>
            </ul>
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

function Status({ icon, color, text }: { icon: string; color: "green" | "amber" | "red"; text: string }) {
  const colors = {
    green: "border-[#bfe0c5] bg-[#eef9f0] text-[#246238]",
    amber: "border-[#efd9a2] bg-[#fff9e9] text-[#80591b]",
    red: "border-[#f0c4b4] bg-[#fff4ee] text-[#934124]",
  };
  return (
    <div className={`flex items-center gap-3 rounded-2xl border p-4 ${colors[color]}`}>
      <span className="grid h-6 w-6 place-items-center rounded-full bg-white text-sm font-bold">{icon}</span>
      <span className="text-sm font-semibold">{text}</span>
    </div>
  );
}
