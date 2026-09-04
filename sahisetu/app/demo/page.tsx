"use client";

import Link from "next/link";
import { LanguageToggle, useLanguage } from "../components/language-toggle";
import { resetDemoJourneyState } from "../lib/demo-journey-state";
import { getRenewalReadiness } from "../lib/dl-readiness";

const aarohiRenewal = getRenewalReadiness();

const profiles = [
  {
    name: "Aarohi Sharma",
    label: "My licence expires soon",
    labelHi: "मेरा लाइसेंस जल्द समाप्त हो रहा है",
    issue: `My licence expires in ${aarohiRenewal.daysRemaining} days`,
    issueHi: `मेरा लाइसेंस ${aarohiRenewal.daysRemaining} दिनों में समाप्त हो रहा है`,
    detail: "Renewal readiness, communication readiness, and simulated reminders.",
    detailHi: "नवीनीकरण तैयारी, संचार तैयारी और सिमुलेटेड रिमाइंडर।",
    href: "/dashboard",
    icon: "⌛",
    tone: "border-[#f0c4b4] bg-[#fff4ee] text-[#7d3922]",
    action: "Check renewal readiness",
    actionHi: "नवीनीकरण तैयारी जाँचें",
  },
  {
    name: "Rohan Mehta",
    label: "My documents don’t match",
    labelHi: "मेरे दस्तावेज़ मेल नहीं खाते",
    issue: "“Lake View Road” or “Lakeview Road”?",
    issueHi: "“Lake View Road” या “Lakeview Road”?",
    detail:
      "Rohan moved from Koramangala to Indiranagar. Compare the new address he entered with his synthetic proof before submitting.",
    detailHi:
      "रोहन कोरमंगला से इंदिरानगर चले गए। सबमिशन से पहले आवेदन में लिखा नया पता उनके सिंथेटिक प्रमाण से मिलाएँ।",
    href: "/apply?demo=rohan",
    icon: "⌂",
    tone: "border-[#efd9a2] bg-[#fff9e9] text-[#79591d]",
    action: "Compare my documents",
    actionHi: "मेरे दस्तावेज़ों की तुलना करें",
  },
  {
    name: "Neha Verma",
    label: "My payment is pending",
    labelHi: "मेरा भुगतान लंबित है",
    issue: "₹450 deducted, but renewal still pending",
    issueHi: "₹450 कटे, लेकिन नवीनीकरण अभी भी लंबित है",
    detail: "Review Neha’s synthetic payment record and prepare the evidence needed before any next step.",
    detailHi: "अगला कदम लेने से पहले नेहा के सिंथेटिक भुगतान रिकॉर्ड की समीक्षा करें और जरूरी प्रमाण तैयार करें।",
    href: "/rescue?case=payment-pending",
    icon: "₹",
    tone: "border-[#c8d9ef] bg-[#f1f6fc] text-[#234f7d]",
    action: "Start payment recovery",
    actionHi: "भुगतान रिकवरी शुरू करें",
  },
];

export default function DemoProfilesPage() {
  const hindi = useLanguage() === "hi";
  return (
    <main className="min-h-screen bg-[#fffdf8] text-[#17281f]">
      <div className="mx-auto max-w-5xl px-5 py-5 sm:px-8">
        <nav className="flex items-center justify-between" aria-label="Main navigation">
          <Link href="/" className="flex items-center gap-3 font-semibold tracking-tight">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#166534] text-lg text-white shadow-sm">
              स
            </span>
            <span className="text-xl">SahiSetu</span>
          </Link>
          <div className="flex items-center gap-2">
            <LanguageToggle />
            <button
              onClick={resetDemoJourneyState}
              className="rounded-lg border border-[#e3c996] bg-white px-3 py-2 text-sm font-semibold text-[#80591b] hover:bg-[#fff8e8]"
            >
              {hindi ? "डेमो प्रगति रीसेट करें" : "Reset demo progress"}
            </button>
            <span className="hidden rounded-full border border-[#e8cd98] bg-[#fff8e8] px-3 py-1.5 text-xs font-medium text-[#80591b] sm:inline">
              {hindi ? "सिंथेटिक डेमो प्रोफ़ाइल" : "Synthetic demo profiles"}
            </span>
          </div>
        </nav>
        <section className="py-16 sm:py-24">
          <p className="inline-flex rounded-full bg-[#fff1d7] px-3 py-1.5 text-sm font-semibold text-[#8a5410]">
            {hindi ? "एक स्थिति चुनें" : "Choose a scenario"}
          </p>
          <h1 className="mt-5 max-w-3xl text-4xl font-semibold tracking-[-0.05em] sm:text-6xl">
            {hindi ? "नागरिक के तत्काल क्षण से शुरू करें।" : "Start with a citizen’s urgent moment."}
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-[#526558]">
            {hindi
              ? "हर प्रोफ़ाइल काल्पनिक है। इस प्रोटोटाइप में कोई खाता, व्यक्तिगत जानकारी, फोन नंबर, भुगतान या आधिकारिक सरकारी रिकॉर्ड उपयोग नहीं किया जाता।"
              : "Every profile is fictional. No account, personal information, phone number, payment, or official government record is used in this prototype."}
          </p>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {profiles.map((profile) => (
              <article key={profile.name} className={`flex flex-col rounded-3xl border p-6 ${profile.tone}`}>
                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-white/80 text-xl font-bold">
                  {profile.icon}
                </span>
                <p className="mt-6 text-sm font-bold uppercase tracking-[0.14em] opacity-80">
                  {hindi ? profile.labelHi : profile.label}
                </p>
                <h2 className="mt-2 text-2xl font-semibold">{profile.name}</h2>
                <p className="mt-4 text-lg font-semibold leading-6">{hindi ? profile.issueHi : profile.issue}</p>
                <p className="mt-3 flex-1 text-sm leading-6 opacity-90">{hindi ? profile.detailHi : profile.detail}</p>
                <Link
                  href={profile.href}
                  className="mt-7 rounded-xl bg-white px-4 py-3 text-center text-sm font-bold text-[#274735] shadow-sm ring-1 ring-black/5"
                >
                  {hindi ? profile.actionHi : profile.action} →
                </Link>
              </article>
            ))}
          </div>
        </section>
        <footer className="border-t border-[#e1eade] py-7 text-sm text-[#66796a]">
          {hindi
            ? "SahiSetu एक स्वतंत्र, केवल-सिंथेटिक-डेटा प्रोटोटाइप है—आधिकारिक सरकारी सेवा नहीं।"
            : "SahiSetu is an independent, synthetic-data-only prototype—not an official government service."}
        </footer>
      </div>
    </main>
  );
}
