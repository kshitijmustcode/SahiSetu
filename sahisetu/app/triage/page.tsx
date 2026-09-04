"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { ExplainableAuditTimeline, type AuditTimelineStep } from "../components/explainable-audit-timeline";
import { LanguageToggle, useLanguage } from "../components/language-toggle";
import { resetDemoJourneyState, useDemoJourneyState } from "../lib/demo-journey-state";
import { aarohiSyntheticLicence, getRenewalReadiness } from "../lib/dl-readiness";
import { grantTriageDemoAccess, revokeTriageDemoAccess, useTriageDemoAccess } from "../lib/triage-demo-access";

type TriageCase = {
  name: string;
  profile: string;
  signal: "green" | "amber" | "blue";
  state: string;
  summary: string;
  evidence: string[];
  focus: string;
  citizenNextAction: string;
  timeline: AuditTimelineStep[];
};

const signalStyle = {
  green: "border-[#b9dfc0] bg-[#edf8ef] text-[#246238]",
  amber: "border-[#efd9a2] bg-[#fff8e8] text-[#80591b]",
  blue: "border-[#b8d5e8] bg-[#f0f8fc] text-[#235779]",
};

export default function TriagePage() {
  const hindi = useLanguage() === "hi";
  const renewal = getRenewalReadiness();
  const demoJourney = useDemoJourneyState();
  const hasTriageDemoAccess = useTriageDemoAccess();
  const [email, setEmail] = useState("");
  const [passcode, setPasscode] = useState("");
  const [accessError, setAccessError] = useState("");
  const t = (english: string, hindiText: string) => (hindi ? hindiText : english);

  function handleSignIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validEmail = email.trim().toLowerCase() === "rto.demo@sahisetu.example";
    const validPasscode = passcode === "SahiSetuRTO2026";

    if (!validEmail || !validPasscode) {
      setAccessError(
        t(
          "Use the judge demo credentials shown on this screen.",
          "स्क्रीन पर दिखाए गए सिंथेटिक जज डेमो क्रेडेंशियल का उपयोग करें।",
        ),
      );
      return;
    }

    setAccessError("");
    grantTriageDemoAccess();
  }

  if (!hasTriageDemoAccess) {
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
              <Link
                href="/demo"
                className="rounded-lg border border-[#c7dcc9] bg-[#f4faf3] px-3 py-2 text-sm font-semibold text-[#285536] hover:bg-[#eaf6ec]"
              >
                {t("Citizen demos", "नागरिक डेमो")}
              </Link>
            </div>
          </nav>

          <section className="py-14 sm:py-20">
            <p className="inline-flex rounded-full bg-[#f0f8fc] px-3 py-1.5 text-sm font-semibold text-[#235779]">
              {t("Prototype staff access", "प्रोटोटाइप स्टाफ एक्सेस")}
            </p>
            <h1 className="mt-5 max-w-3xl text-4xl font-semibold tracking-[-0.05em] sm:text-5xl">
              {t("RTO triage is limited to the staff-demo perspective.", "RTO ट्रायेज स्टाफ-डेमो दृश्य तक सीमित है।")}
            </h1>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-[#526558]">
              {t(
                "Enter the visible demo credentials to open the view-only handoff screen. This is a hackathon demonstration gate, not real authentication or access to an RTO system.",
                "सिंथेटिक, केवल-दृश्य हैंडऑफ स्क्रीन खोलने के लिए दिखाए गए डेमो क्रेडेंशियल दर्ज करें। यह हैकाथॉन डेमो गेट है, वास्तविक प्रमाणीकरण या RTO सिस्टम तक पहुँच नहीं।",
              )}
            </p>

            <div className="mt-10 grid gap-6 lg:grid-cols-2">
              <section
                className="rounded-3xl border border-[#b8d5e8] bg-[#f0f8fc] p-6 sm:p-8"
                aria-label={t("Judge demo credentials", "जज डेमो क्रेडेंशियल")}
              >
                <p className="text-sm font-bold uppercase tracking-[0.14em] text-[#235779]">
                  {t("Judge demo credentials", "जज डेमो क्रेडेंशियल")}
                </p>
                <h2 className="mt-3 text-2xl font-semibold text-[#193b63]">
                  {t("Self-guided triage walkthrough", "स्व-निर्देशित ट्रायेज वॉकथ्रू")}
                </h2>
                <dl className="mt-6 space-y-4 text-sm">
                  <div className="rounded-xl border border-[#b8d5e8] bg-white px-4 py-3">
                    <dt className="font-semibold text-[#3d6382]">{t("Email", "ईमेल")}</dt>
                    <dd className="mt-1 font-mono text-[#193b63]">rto.demo@sahisetu.example</dd>
                  </div>
                  <div className="rounded-xl border border-[#b8d5e8] bg-white px-4 py-3">
                    <dt className="font-semibold text-[#3d6382]">{t("Password", "पासवर्ड")}</dt>
                    <dd className="mt-1 font-mono text-[#193b63]">SahiSetuRTO2026</dd>
                  </div>
                </dl>
                <p className="mt-6 text-sm leading-6 text-[#3d6382]">
                  {t(
                    "These visible credentials are only for judges to explore demo cases. They do not belong to a real staff account.",
                    "ये दिखाए गए क्रेडेंशियल केवल जजों के लिए काल्पनिक मामलों का अनुभव लेने हेतु हैं। ये किसी वास्तविक स्टाफ खाते के नहीं हैं।",
                  )}
                </p>
              </section>

              <form onSubmit={handleSignIn} className="rounded-3xl border border-[#dce7dd] bg-white p-6 sm:p-8">
                <p className="text-sm font-bold uppercase tracking-[0.14em] text-[#31804a]">
                  {t("RTO member demo sign-in", "RTO सदस्य डेमो साइन-इन")}
                </p>
                <h2 className="mt-3 text-2xl font-semibold">
                  {t("Open prototype triage", "प्रोटोटाइप ट्रायेज खोलें")}
                </h2>
                <div className="mt-6 space-y-4">
                  <label className="block text-sm font-semibold text-[#365442]">
                    {t("Email", "ईमेल")}
                    <input
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      type="email"
                      autoComplete="username"
                      className="mt-2 w-full rounded-xl border border-[#bfd1c1] bg-[#fffdf8] px-4 py-3 text-[#17281f] outline-none ring-[#31804a] focus:ring-2"
                    />
                  </label>
                  <label className="block text-sm font-semibold text-[#365442]">
                    {t("Password", "पासवर्ड")}
                    <input
                      value={passcode}
                      onChange={(event) => setPasscode(event.target.value)}
                      type="password"
                      autoComplete="current-password"
                      className="mt-2 w-full rounded-xl border border-[#bfd1c1] bg-[#fffdf8] px-4 py-3 text-[#17281f] outline-none ring-[#31804a] focus:ring-2"
                    />
                  </label>
                </div>
                {accessError ? (
                  <p className="mt-4 rounded-xl bg-[#fff4ee] px-4 py-3 text-sm leading-6 text-[#7d3922]">
                    {accessError}
                  </p>
                ) : null}
                <button
                  type="submit"
                  className="mt-6 w-full rounded-xl bg-[#193b63] px-5 py-3 font-semibold text-white hover:bg-[#142f50]"
                >
                  {t("Open prototype triage →", "प्रोटोटाइप ट्रायेज खोलें →")}
                </button>
              </form>
            </div>
          </section>
          <footer className="border-t border-[#e1eade] py-7 text-sm text-[#66796a]">
            {t(
              "Independent demo · not an official government service.",
              "SahiSetu एक स्वतंत्र, केवल-सिंथेटिक-डेटा प्रोटोटाइप है—आधिकारिक सरकारी सेवा नहीं।",
            )}
          </footer>
        </div>
      </main>
    );
  }

  const cases: TriageCase[] = [
    {
      name: "Aarohi Sharma",
      profile: t("DL renewal readiness", "DL नवीनीकरण तैयारी"),
      signal: demoJourney.aarohiPacketReady || renewal.urgency === "safe" ? "green" : "amber",
      state: demoJourney.aarohiContactReady
        ? demoJourney.aarohiPacketReady
          ? t(
              `Readiness packet prepared · ${renewal.daysRemaining} days remain`,
              `तैयारी पैकेट तैयार · ${renewal.daysRemaining} दिन शेष`,
            )
          : t("Contact confirmed · renewal needs attention", "संपर्क पुष्टि · नवीनीकरण पर ध्यान चाहिए")
        : renewal.urgency === "safe"
          ? t("Readiness pack review", "तैयारी पैक समीक्षा")
          : t("Renewal needs attention", "नवीनीकरण पर ध्यान चाहिए"),
      summary: t(
        `A synthetic licence visibly expires on ${aarohiSyntheticLicence.visibleExpiryText}; ${renewal.daysRemaining} days remain in the demo reference date.`,
        `सिंथेटिक लाइसेंस पर ${aarohiSyntheticLicence.visibleExpiryText} की समाप्ति दिखाई देती है; डेमो संदर्भ तिथि में ${renewal.daysRemaining} दिन शेष हैं।`,
      ),
      evidence: [
        t("Licence expiry field", "लाइसेंस की समाप्ति फ़ील्ड"),
        t("Readiness checklist", "तैयारी सूची"),
        t("Simulated contact-readiness state", "सिमुलेटेड संपर्क-तैयारी स्थिति"),
        ...(demoJourney.aarohiMedicalReady
          ? [t("Form 1A pre-check ready for human review", "Form 1A प्री-चेक मानवीय समीक्षा के लिए तैयार")]
          : []),
      ],
      focus: t(
        "Explain the preparation gap; do not make a renewal or eligibility decision.",
        "तैयारी की कमी समझाएँ; नवीनीकरण या पात्रता का निर्णय न लें।",
      ),
      citizenNextAction: t(
        demoJourney.aarohiPacketReady
          ? "The synthetic readiness packet is prepared. Continue through the relevant official renewal service when ready; SahiSetu has not submitted anything."
          : demoJourney.aarohiContactReady
            ? "Contact readiness is confirmed. Review the synthetic renewal pack before using the relevant official service; SahiSetu has not submitted anything."
            : "Review the synthetic document pack before using an official renewal service.",
        demoJourney.aarohiPacketReady
          ? "सिंथेटिक तैयारी पैकेट तैयार है। तैयार होने पर संबंधित आधिकारिक नवीनीकरण सेवा से आगे बढ़ें; SahiSetu ने कुछ भी सबमिट नहीं किया है।"
          : demoJourney.aarohiContactReady
            ? "संपर्क तैयारी की पुष्टि हो गई है। संबंधित आधिकारिक सेवा से पहले सिंथेटिक नवीनीकरण पैक की समीक्षा करें; SahiSetu ने कुछ भी सबमिट नहीं किया है।"
            : "आधिकारिक नवीनीकरण सेवा से पहले सिंथेटिक दस्तावेज़ पैक की समीक्षा करें।",
      ),
      timeline: [
        {
          label: t("Licence captured", "लाइसेंस लिया गया"),
          detail: t("Demo record available.", "डेमो रिकॉर्ड उपलब्ध है।"),
          state: "complete",
        },
        {
          label: t("Expiry extracted", "समाप्ति निकाली गई"),
          detail: aarohiSyntheticLicence.visibleExpiryText,
          state: "complete",
        },
        {
          label: t("Citizen confirmation", "नागरिक पुष्टि"),
          detail: demoJourney.aarohiContactReady
            ? t("Contact readiness confirmed in the citizen demo.", "नागरिक डेमो में संपर्क तैयारी की पुष्टि हुई।")
            : t("Contact readiness remains a demo choice.", "संपर्क तैयारी डेमो विकल्प है।"),
          state: demoJourney.aarohiContactReady ? "complete" : "current",
        },
        {
          label: t("Readiness result", "तैयारी परिणाम"),
          detail: demoJourney.aarohiPacketReady
            ? t(
                `Readiness packet prepared; ${renewal.daysRemaining} days remain.`,
                `तैयारी पैकेट तैयार; ${renewal.daysRemaining} दिन शेष।`,
              )
            : demoJourney.aarohiMedicalReady
              ? t(
                  "Form 1A visible fields are ready for human review; renewal still needs attention.",
                  "Form 1A दिखाई देने वाले फ़ील्ड मानवीय समीक्षा के लिए तैयार हैं; नवीनीकरण पर अभी भी ध्यान चाहिए।",
                )
              : t("Renewal needs attention.", "नवीनीकरण पर ध्यान चाहिए।"),
          state: demoJourney.aarohiPacketReady ? "complete" : "attention",
        },
        {
          label: t("Safe next action", "सुरक्षित अगली कार्रवाई"),
          detail: demoJourney.aarohiPacketReady
            ? t(
                "Continue through the official renewal service when ready.",
                "तैयार होने पर आधिकारिक नवीनीकरण सेवा से आगे बढ़ें।",
              )
            : demoJourney.aarohiContactReady
              ? t(
                  "Review the renewal pack before using the official service.",
                  "आधिकारिक सेवा से पहले नवीनीकरण पैक की समीक्षा करें।",
                )
              : t("Review the pack.", "पैक की समीक्षा करें।"),
          state: demoJourney.aarohiPacketReady ? "complete" : "current",
        },
      ],
    },
    {
      name: "Rohan Mehta",
      profile: t("Address change · Under Scrutiny", "पता परिवर्तन · जाँच में"),
      signal: demoJourney.rohanPacketReady ? "green" : "amber",
      state: demoJourney.rohanPacketReady
        ? t("Readiness packet prepared", "तैयारी पैकेट तैयार")
        : t("Citizen wording review", "नागरिक शब्दावली समीक्षा"),
      summary: t(
        "The old Koramangala address on the synthetic licence is expected. The proof supplies the new Indiranagar address: Lakeview Road.",
        "सिंथेटिक लाइसेंस पर पुराना कोरमंगला पता अपेक्षित है। प्रमाण नया इंदिरानगर पता देता है: Lakeview Road।",
      ),
      evidence: [
        t("Old-address synthetic driving licence", "पुराने पते का सिंथेटिक ड्राइविंग लाइसेंस"),
        t("New-address proof: Lakeview Road, Indiranagar", "नए पते का प्रमाण: Lakeview Road, इंदिरानगर"),
        t("Synthetic Under Scrutiny status reference", "सिंथेटिक Under Scrutiny स्थिति संदर्भ"),
      ],
      focus: t(
        "Compare only the citizen’s final application text with the proof. The old licence address is not a mismatch to resolve.",
        "केवल नागरिक के अंतिम आवेदन टेक्स्ट की प्रमाण से तुलना करें। पुराने लाइसेंस का पता कोई हल करने वाला अंतर नहीं है।",
      ),
      citizenNextAction: t(
        demoJourney.rohanPacketReady
          ? "A synthetic readiness packet is prepared. Continue through the relevant official address-change service when ready; SahiSetu has not submitted anything."
          : "Review the exact proof wording; create a clarification note only if the citizen changes Lakeview to Lake View.",
        demoJourney.rohanPacketReady
          ? "सिंथेटिक तैयारी पैकेट तैयार है। तैयार होने पर संबंधित आधिकारिक पता-परिवर्तन सेवा से आगे बढ़ें; SahiSetu ने कुछ भी सबमिट नहीं किया है।"
          : "प्रमाण की सटीक शब्दावली देखें; नागरिक द्वारा Lakeview को Lake View करने पर ही स्पष्टीकरण नोट बनाएँ।",
      ),
      timeline: [
        {
          label: t("Documents uploaded", "दस्तावेज़ अपलोड"),
          detail: t("Licence and proof retained.", "लाइसेंस और प्रमाण सुरक्षित हैं।"),
          state: "complete",
        },
        { label: t("Field extracted", "फ़ील्ड निकाला गया"), detail: "Lakeview Road", state: "complete" },
        {
          label: t("Citizen confirmation", "नागरिक पुष्टि"),
          detail: demoJourney.rohanPacketReady
            ? t("Final draft reviewed in the citizen demo.", "अंतिम ड्राफ्ट की नागरिक डेमो में समीक्षा हुई।")
            : t("Final draft needs review.", "अंतिम ड्राफ्ट की समीक्षा चाहिए।"),
          state: demoJourney.rohanPacketReady ? "complete" : "current",
        },
        {
          label: t("Readiness result", "तैयारी परिणाम"),
          detail: demoJourney.rohanPacketReady
            ? t("Synthetic readiness packet prepared.", "सिंथेटिक तैयारी पैकेट तैयार।")
            : t("Amber until the final text is compared.", "अंतिम टेक्स्ट की तुलना तक एम्बर।"),
          state: demoJourney.rohanPacketReady ? "complete" : "attention",
        },
        {
          label: t("Safe next action", "सुरक्षित अगली कार्रवाई"),
          detail: demoJourney.rohanPacketReady
            ? t(
                "Continue through the official address-change service when ready.",
                "तैयार होने पर आधिकारिक पता-परिवर्तन सेवा से आगे बढ़ें।",
              )
            : t(
                "Use proof wording or note a real minor difference.",
                "प्रमाण शब्दावली उपयोग करें या वास्तविक छोटे अंतर का नोट लें।",
              ),
          state: demoJourney.rohanPacketReady ? "complete" : "pending",
        },
      ],
    },
    {
      name: "Neha Verma",
      profile: t("Application Rescue · payment pending", "आवेदन सहायता · भुगतान लंबित"),
      signal: demoJourney.nehaSummaryReady ? "green" : "blue",
      state: demoJourney.nehaSummaryReady
        ? t("Support summary prepared", "सहायता-सार तैयार")
        : t("Evidence retention required", "प्रमाण सुरक्षित रखना जरूरी"),
      summary: t(
        "A fictional ₹450 transaction is recorded as deducted but pending. The status is not proof of failure, approval, or a need to pay again.",
        "काल्पनिक ₹450 लेन-देन कटा हुआ लेकिन लंबित है। यह स्थिति असफलता, मंजूरी या फिर से भुगतान की जरूरत का प्रमाण नहीं है।",
      ),
      evidence: [
        "DEMO-TXN-7742",
        "DEMO-APP-NV-9081",
        t("Synthetic payment-pending record", "सिंथेटिक भुगतान-लंबित रिकॉर्ड"),
        t("Transaction date and amount", "लेन-देन तिथि और राशि"),
      ],
      focus: t(
        "Keep the evidence together and route the citizen to official status verification. Never retry, refund, or decide the payment here.",
        "प्रमाण साथ रखें और नागरिक को आधिकारिक स्थिति-जाँच तक ले जाएँ। यहाँ भुगतान दोहराएँ, रिफंड या निर्णय कभी न लें।",
      ),
      citizenNextAction: t(
        demoJourney.nehaSummaryReady
          ? "The synthetic support summary is prepared. Use the relevant official payment-status or support route before considering another payment."
          : "Use the relevant official payment-status or support route before considering another payment.",
        demoJourney.nehaSummaryReady
          ? "सिंथेटिक सहायता-सार तैयार है। दूसरे भुगतान पर विचार करने से पहले संबंधित आधिकारिक भुगतान-स्थिति या सहायता मार्ग उपयोग करें।"
          : "दूसरे भुगतान पर विचार करने से पहले संबंधित आधिकारिक भुगतान-स्थिति या सहायता मार्ग उपयोग करें।",
      ),
      timeline: [
        {
          label: t("Status record", "स्थिति रिकॉर्ड"),
          detail: t("Payment pending.", "भुगतान लंबित।"),
          state: "complete",
        },
        { label: t("Fields extracted", "फ़ील्ड निकाले गए"), detail: "DEMO-TXN-7742", state: "complete" },
        {
          label: t("Citizen confirmation", "नागरिक पुष्टि"),
          detail: demoJourney.nehaSummaryReady
            ? t("Evidence summary completed in the citizen demo.", "नागरिक डेमो में प्रमाण सार पूरा हुआ।")
            : t("Evidence checklist remains.", "प्रमाण सूची बाकी है।"),
          state: demoJourney.nehaSummaryReady ? "complete" : "current",
        },
        {
          label: t("Readiness result", "तैयारी परिणाम"),
          detail: demoJourney.nehaSummaryReady
            ? t(
                "Support summary is ready; official clarification is still needed.",
                "सहायता-सार तैयार है; आधिकारिक स्पष्टीकरण अभी भी जरूरी है।",
              )
            : t("Official clarification is needed.", "आधिकारिक स्पष्टीकरण जरूरी है।"),
          state: demoJourney.nehaSummaryReady ? "complete" : "attention",
        },
        {
          label: t("Safe next action", "सुरक्षित अगली कार्रवाई"),
          detail: demoJourney.nehaSummaryReady
            ? t("Use the official support route with the summary.", "सार के साथ आधिकारिक सहायता मार्ग उपयोग करें।")
            : t("Verify through the official route.", "आधिकारिक मार्ग से जाँचें।"),
          state: demoJourney.nehaSummaryReady ? "complete" : "pending",
        },
      ],
    },
  ];

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
            <button
              onClick={resetDemoJourneyState}
              className="rounded-lg border border-[#e3c996] bg-white px-3 py-2 text-sm font-semibold text-[#80591b] hover:bg-[#fff8e8]"
            >
              {t("Reset demo progress", "डेमो प्रगति रीसेट करें")}
            </button>
            <button
              onClick={revokeTriageDemoAccess}
              className="rounded-lg border border-[#b8d5e8] bg-[#f0f8fc] px-3 py-2 text-sm font-semibold text-[#235779] hover:bg-[#e3f2fa]"
            >
              {t("Exit staff view", "स्टाफ दृश्य से बाहर निकलें")}
            </button>
            <Link
              href="/demo"
              className="rounded-lg border border-[#c7dcc9] bg-[#f4faf3] px-3 py-2 text-sm font-semibold text-[#285536] hover:bg-[#eaf6ec]"
            >
              {t("Citizen demos", "नागरिक डेमो")}
            </Link>
          </div>
        </nav>

        <header className="border-b border-[#e1eade] py-10 sm:py-14">
          <p className="inline-flex rounded-full bg-[#f0f8fc] px-3 py-1.5 text-sm font-semibold text-[#235779]">
            {t("Prototype RTO triage view", "प्रोटोटाइप RTO ट्रायेज दृश्य")}
          </p>
          <h1 className="mt-4 max-w-4xl text-4xl font-semibold tracking-[-0.05em] sm:text-5xl">
            {t(
              "The same evidence, made reviewable for a staff-facing handoff.",
              "वही प्रमाण, स्टाफ-उन्मुख हैंडऑफ के लिए समीक्षा योग्य।",
            )}
          </h1>
          <p className="mt-4 max-w-3xl text-lg leading-8 text-[#526558]">
            {t(
              "This one-screen prototype mirrors the explanations shown to citizens. It is view and triage only—not an RTO system, queue, official status record, or approve/reject tool.",
              "यह एक-स्क्रीन प्रोटोटाइप नागरिकों को दिखाए गए स्पष्टीकरण को दोहराता है। यह केवल दृश्य और ट्रायेज है—RTO सिस्टम, कतार, आधिकारिक स्थिति रिकॉर्ड या मंजूर/अस्वीकार उपकरण नहीं।",
            )}
          </p>
        </header>

        <section className="py-8" aria-label={t("Demo case summaries", "डेमो मामलों का सार")}>
          <div className="mb-6 flex flex-wrap gap-3 text-sm">
            <span className="rounded-full bg-[#edf8ef] px-3 py-1.5 font-semibold text-[#246238]">
              {t("Green: ready for citizen review", "हरा: नागरिक समीक्षा के लिए तैयार")}
            </span>
            <span className="rounded-full bg-[#fff8e8] px-3 py-1.5 font-semibold text-[#80591b]">
              {t("Amber: clarification or attention", "एम्बर: स्पष्टीकरण या ध्यान")}
            </span>
            <span className="rounded-full bg-[#f0f8fc] px-3 py-1.5 font-semibold text-[#235779]">
              {t("Blue: retain evidence and wait", "नीला: प्रमाण रखें और प्रतीक्षा करें")}
            </span>
          </div>
          <div className="space-y-6">
            {cases.map((caseItem) => (
              <article key={caseItem.name} className="rounded-3xl border border-[#dce7dd] bg-white p-6 sm:p-8">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <p className="text-sm font-bold uppercase tracking-[0.14em] text-[#31804a]">{caseItem.profile}</p>
                    <h2 className="mt-2 text-2xl font-semibold">{caseItem.name}</h2>
                    <p className="mt-3 max-w-3xl leading-7 text-[#526558]">{caseItem.summary}</p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full border px-3 py-1.5 text-sm font-bold ${signalStyle[caseItem.signal]}`}
                  >
                    {caseItem.state}
                  </span>
                </div>

                <div className="mt-6 grid gap-5 lg:grid-cols-[.9fr_1.1fr]">
                  <section className="rounded-2xl border border-[#dce7dd] bg-[#fbfefb] p-5">
                    <p className="text-sm font-bold uppercase tracking-[0.14em] text-[#31804a]">
                      {t("Evidence summary", "प्रमाण सार")}
                    </p>
                    <ul className="mt-4 space-y-3 text-sm leading-6 text-[#48624e]">
                      {caseItem.evidence.map((item) => (
                        <li key={item} className="flex gap-2">
                          <span aria-hidden="true">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-5 rounded-xl bg-[#fff8e8] p-4 text-sm leading-6 text-[#76551f]">
                      <strong>{t("Triage focus:", "ट्रायेज फोकस:")}</strong> {caseItem.focus}
                    </div>
                  </section>
                  <ExplainableAuditTimeline
                    language={hindi ? "hi" : "en"}
                    title={t("Shared citizen-to-triage trail", "नागरिक से ट्रायेज तक साझा ट्रेल")}
                    description={t(
                      "This is the same explanation structure available in the citizen journey.",
                      "यह वही स्पष्टीकरण संरचना है जो नागरिक यात्रा में उपलब्ध है।",
                    )}
                    steps={caseItem.timeline}
                    footer={
                      <p className="rounded-xl bg-[#f0f8fc] px-4 py-3 text-sm leading-6 text-[#235779]">
                        <strong>{t("Citizen’s safe next action:", "नागरिक की सुरक्षित अगली कार्रवाई:")}</strong>{" "}
                        {caseItem.citizenNextAction}
                      </p>
                    }
                  />
                </div>
              </article>
            ))}
          </div>
        </section>
        <footer className="border-t border-[#e1eade] py-7 text-sm text-[#66796a]">
          {t(
            "Independent demo. This view cannot approve, reject, update, or access an official application.",
            "SahiSetu एक स्वतंत्र, केवल-सिंथेटिक-डेटा प्रोटोटाइप है। यह दृश्य किसी आधिकारिक आवेदन को मंजूर, अस्वीकार, अपडेट या एक्सेस नहीं कर सकता।",
          )}
        </footer>
      </div>
    </main>
  );
}
