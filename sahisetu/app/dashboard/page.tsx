"use client";

import Link from "next/link";
import { useState, useSyncExternalStore } from "react";
import { ExplainableAuditTimeline, type AuditTimelineStep } from "../components/explainable-audit-timeline";
import { LanguageToggle, useLanguage } from "../components/language-toggle";
import { setDemoJourneyState, useDemoJourneyState } from "../lib/demo-journey-state";
import { aarohiSyntheticLicence, formatIndiaDate, getRenewalReadiness } from "../lib/dl-readiness";

type Reminder = "60 days" | "30 days" | "7 days";

const tone = {
  ready: "border-[#bfdfc5] bg-[#eef9f0] text-[#246238]",
  review: "border-[#efd9a2] bg-[#fff8e8] text-[#80591b]",
  action: "border-[#f0c4b4] bg-[#fff4ee] text-[#934124]",
};

export default function DashboardPage() {
  const hindi = useLanguage() === "hi";
  const t = (english: string, hindiText: string) => (hindi ? hindiText : english);
  const renewal = getRenewalReadiness();
  const renewalActionNeeded = renewal.urgency !== "safe";
  const profile = useSyncExternalStore(
    (callback) => {
      window.addEventListener("popstate", callback);
      return () => window.removeEventListener("popstate", callback);
    },
    () => new URLSearchParams(window.location.search).get("profile") ?? "aarohi",
    () => "aarohi",
  );
  const demoJourney = useDemoJourneyState();
  const contactConfirmed = demoJourney.aarohiContactReady;
  const [reminders, setReminders] = useState<Reminder[]>(["30 days", "7 days"]);
  const [saved, setSaved] = useState(false);

  function toggleReminder(reminder: Reminder) {
    setSaved(false);
    setReminders((current) =>
      current.includes(reminder) ? current.filter((item) => item !== reminder) : [...current, reminder],
    );
  }

  const profileContent =
    profile === "rohan"
      ? {
          name: "Rohan Mehta",
          eyebrow: t("Document readiness · synthetic demo", "दस्तावेज़ तैयारी · सिंथेटिक डेमो"),
          title: t(
            "Correct the proof before a small mismatch becomes a blocked application.",
            "छोटा अंतर आवेदन रोकने से पहले प्रमाण ठीक करें।",
          ),
          description: t(
            "Rohan’s synthetic address proof needs review before he uses the official address-change service.",
            "रोहन के सिंथेटिक पते के प्रमाण को आधिकारिक पता-परिवर्तन सेवा से पहले समीक्षा चाहिए।",
          ),
          urgencyLabel: t("Document issue", "दस्तावेज़ समस्या"),
          urgency: t("Review now", "अभी समीक्षा करें"),
          urgencyDetail: t(
            "A fictional locality wording difference needs an exact check against the proof.",
            "काल्पनिक इलाके की शब्दावली में अंतर का प्रमाण से सटीक मिलान जरूरी है।",
          ),
          actionLabel: t("Review Rohan’s documents", "रोहन के दस्तावेज़ों की समीक्षा करें"),
          actionHref: "/apply?demo=rohan",
          rescue: t(
            "Application Rescue already turns `Under Scrutiny`, upload-pending, and payment-pending cases into a clear evidence checklist and safe next action.",
            "आवेदन सहायता `Under Scrutiny`, upload-pending और payment-pending मामलों को स्पष्ट प्रमाण-सूची और सुरक्षित अगली कार्रवाई में बदलती है।",
          ),
          sectionLabel: t("Address-change readiness", "पता-परिवर्तन तैयारी"),
          sectionTitle: t("Document review before submission", "सबमिशन से पहले दस्तावेज़ समीक्षा"),
          sectionDetail: t(
            "Resolve the amber item before using the official service. This is a preparation checklist, not an approval result.",
            "आधिकारिक सेवा इस्तेमाल करने से पहले एम्बर आइटम हल करें। यह तैयारी-सूची है, मंजूरी परिणाम नहीं।",
          ),
          badge: t("Review needed", "समीक्षा आवश्यक"),
        }
      : profile === "neha"
        ? {
            name: "Neha Verma",
            eyebrow: t("Application Rescue · synthetic demo", "आवेदन सहायता · सिंथेटिक डेमो"),
            title: t(
              "A payment status should never leave a citizen guessing what to do next.",
              "भुगतान स्थिति से नागरिक को अगला कदम अनुमान लगाने पर मजबूर नहीं होना चाहिए।",
            ),
            description: t(
              "Neha’s fictional payment is shown as deducted but pending. SahiSetu prepares a safe recovery path—it does not process, retry, or refund payments.",
              "नेहा का काल्पनिक भुगतान कटा हुआ लेकिन लंबित है। SahiSetu सुरक्षित रिकवरी मार्ग तैयार करता है—यह भुगतान प्रोसेस, दोहराता या रिफंड नहीं करता।",
            ),
            urgencyLabel: t("Payment status", "भुगतान स्थिति"),
            urgency: t("Pending", "लंबित"),
            urgencyDetail: t(
              "Keep the receipt and transaction reference before taking any further action.",
              "कोई और कार्रवाई करने से पहले रसीद और लेन-देन संदर्भ सुरक्षित रखें।",
            ),
            actionLabel: t("Open payment recovery", "भुगतान रिकवरी खोलें"),
            actionHref: "/rescue?case=payment-pending",
            rescue: t(
              "Application Rescue covers `Payment Deducted but Pending`, upload-pending, and `Under Scrutiny` with evidence checklists and safe next actions.",
              "आवेदन सहायता `भुगतान कटा लेकिन लंबित`, upload-pending और `Under Scrutiny` को प्रमाण-सूची और सुरक्षित अगली कार्रवाई के साथ कवर करती है।",
            ),
            sectionLabel: t("Recovery readiness", "रिकवरी तैयारी"),
            sectionTitle: t("Retain evidence before you act", "कार्रवाई से पहले प्रमाण सुरक्षित रखें"),
            sectionDetail: t(
              "Avoid blind repeat payments. This synthetic demo helps a citizen understand what evidence to retain and when to use an official help route.",
              "बिना सोचे दोबारा भुगतान न करें। यह सिंथेटिक डेमो बताता है कि कौन सा प्रमाण रखें और आधिकारिक सहायता मार्ग कब उपयोग करें।",
            ),
            badge: t("Evidence needed", "प्रमाण आवश्यक"),
          }
        : {
            name: "Aarohi Sharma",
            eyebrow: t("DL Guardian · synthetic demo", "DL गार्जियन · सिंथेटिक डेमो"),
            title: t(
              "Stay ready before a licence deadline becomes urgent.",
              "लाइसेंस की समय-सीमा तत्काल बनने से पहले तैयार रहें।",
            ),
            description: t(
              "Aarohi Sharma’s demo profile is due for renewal soon. SahiSetu checks readiness and explains the next safe action—it does not submit to Parivahan or an RTO.",
              "आराही शर्मा की डेमो प्रोफ़ाइल का नवीनीकरण जल्द होना है। SahiSetu तैयारी जाँचता और सुरक्षित अगला कदम समझाता है—यह Parivahan या RTO को सबमिट नहीं करता।",
            ),
            urgencyLabel: t("Renewal urgency", "नवीनीकरण की तात्कालिकता"),
            urgency: t(`${renewal.daysRemaining} days`, `${renewal.daysRemaining} दिन`),
            urgencyDetail: t(
              `Expiry detected from the synthetic licence: ${aarohiSyntheticLicence.visibleExpiryText}. Checked today: ${formatIndiaDate(renewal.referenceDate)}.`,
              `सिंथेटिक लाइसेंस से समाप्ति तिथि मिली: ${aarohiSyntheticLicence.visibleExpiryText}। आज जाँचा गया: ${formatIndiaDate(renewal.referenceDate)}।`,
            ),
            actionLabel: t("Review address proof", "पते के प्रमाण की समीक्षा करें"),
            actionHref: "/apply?demo=normal",
            rescue: t(
              "Application Rescue guides synthetic `Under Scrutiny`, upload-pending, and payment-pending cases to an evidence checklist and safe next action.",
              "आवेदन सहायता सिंथेटिक `Under Scrutiny`, upload-pending और payment-pending मामलों को प्रमाण-सूची और सुरक्षित अगली कार्रवाई तक ले जाती है।",
            ),
            sectionLabel: t("Renewal readiness", "नवीनीकरण तैयारी"),
            sectionTitle: t("{readyCount} of 3 readiness checks complete", "3 में से {readyCount} तैयारी जाँच पूरी"),
            sectionDetail: t(
              "Resolve the amber and red items before using the official renewal service. This is a preparation checklist, not an approval result.",
              "आधिकारिक नवीनीकरण सेवा इस्तेमाल करने से पहले एम्बर और लाल आइटम हल करें। यह तैयारी-सूची है, मंजूरी परिणाम नहीं।",
            ),
            badge: t("Action needed", "कार्रवाई आवश्यक"),
          };
  const readyCount = (renewalActionNeeded ? 0 : 1) + (contactConfirmed ? 1 : 0);
  const auditSteps: AuditTimelineStep[] =
    profile === "rohan"
      ? [
          {
            label: t("Documents uploaded", "दस्तावेज़ अपलोड"),
            detail: t(
              "Synthetic licence and new-address proof retained.",
              "सिंथेटिक लाइसेंस और नए पते का प्रमाण सुरक्षित है।",
            ),
            state: "complete",
          },
          {
            label: t("Fields extracted", "फ़ील्ड निकाले गए"),
            detail: t("Proof reads Lakeview Road, Indiranagar.", "प्रमाण में Lakeview Road, इंदिरानगर पढ़ा गया।"),
            state: "complete",
          },
          {
            label: t("Citizen confirmation", "नागरिक पुष्टि"),
            detail: t(
              "Review the exact new-address text in the document check.",
              "दस्तावेज़ जाँच में सटीक नए पते के टेक्स्ट की समीक्षा करें।",
            ),
            state: "current",
          },
          {
            label: t("Readiness result", "तैयारी परिणाम"),
            detail: t(
              "Amber until the application wording is compared with the proof.",
              "आवेदन की शब्दावली प्रमाण से मिलने तक एम्बर।",
            ),
            state: "attention",
          },
          {
            label: t("Safe next action", "सुरक्षित अगली कार्रवाई"),
            detail: t(
              "Use the document review; prepare a note only if a difference remains.",
              "दस्तावेज़ समीक्षा करें; अंतर रहने पर ही नोट तैयार करें।",
            ),
            state: "pending",
          },
        ]
      : profile === "neha"
        ? [
            {
              label: t("Status record captured", "स्थिति रिकॉर्ड लिया गया"),
              detail: t("Synthetic payment-pending record retained.", "सिंथेटिक भुगतान-लंबित रिकॉर्ड सुरक्षित है।"),
              state: "complete",
            },
            {
              label: t("Fields extracted", "फ़ील्ड निकाले गए"),
              detail: t("Application and transaction references identified.", "आवेदन और लेन-देन संदर्भ पहचाने गए।"),
              state: "complete",
            },
            {
              label: t("Citizen confirmation", "नागरिक पुष्टि"),
              detail: t("Keep the receipt and reference together in Rescue.", "रसीद और संदर्भ Rescue में साथ रखें।"),
              state: "current",
            },
            {
              label: t("Readiness result", "तैयारी परिणाम"),
              detail: t(
                "Amber: payment is pending, not failed or approved.",
                "एम्बर: भुगतान लंबित है, असफल या मंजूर नहीं।",
              ),
              state: "attention",
            },
            {
              label: t("Safe next action", "सुरक्षित अगली कार्रवाई"),
              detail: t(
                "Verify through the official route before considering another payment.",
                "दूसरे भुगतान से पहले आधिकारिक मार्ग से जाँचें।",
              ),
              state: "pending",
            },
          ]
        : [
            {
              label: t("Licence captured", "लाइसेंस लिया गया"),
              detail: t(
                "Synthetic licence is available for readiness review.",
                "सिंथेटिक लाइसेंस तैयारी समीक्षा के लिए उपलब्ध है।",
              ),
              state: "complete",
            },
            {
              label: t("Expiry extracted", "समाप्ति तिथि निकाली गई"),
              detail: t(
                `Visible expiry: ${aarohiSyntheticLicence.visibleExpiryText}.`,
                `दिखाई समाप्ति: ${aarohiSyntheticLicence.visibleExpiryText}।`,
              ),
              state: "complete",
            },
            {
              label: t("Citizen confirmation", "नागरिक पुष्टि"),
              detail: contactConfirmed
                ? t("Demo contact readiness confirmed.", "डेमो संपर्क तैयारी की पुष्टि हुई।")
                : t("Confirm demo contact readiness.", "डेमो संपर्क तैयारी की पुष्टि करें।"),
              state: contactConfirmed ? "complete" : "current",
            },
            {
              label: t("Readiness result", "तैयारी परिणाम"),
              detail: renewalActionNeeded
                ? t(
                    `${renewal.daysRemaining} days remain. Renewal needs attention.`,
                    `${renewal.daysRemaining} दिन शेष। नवीनीकरण पर ध्यान चाहिए।`,
                  )
                : t("Renewal window is safe in this demo.", "इस डेमो में नवीनीकरण विंडो सुरक्षित है।"),
              state: renewalActionNeeded ? "attention" : "complete",
            },
            {
              label: t("Safe next action", "सुरक्षित अगली कार्रवाई"),
              detail: t(
                "Review the document pack before using the official renewal service.",
                "आधिकारिक नवीनीकरण सेवा से पहले दस्तावेज़ पैक देखें।",
              ),
              state: "current",
            },
          ];
  const activeChecklist =
    profile === "rohan"
      ? [
          { label: "Current driving licence", detail: "Detected from Rohan’s synthetic demo profile.", state: "ready" },
          {
            label: "New-address proof",
            detail: "Correction required: compare the locality wording with the visible proof before submitting.",
            state: "review",
          },
          {
            label: "Reviewed address text",
            detail: "Not ready: use the exact proof wording or document the harmless formatting difference.",
            state: "action",
          },
        ]
      : profile === "neha"
        ? [
            {
              label: "Payment receipt",
              detail: "Retain the fictional receipt, transaction time, and amount as evidence.",
              state: "ready",
            },
            {
              label: "Transaction reference",
              detail: "Record the reference before checking the official payment status or contacting support.",
              state: "review",
            },
            {
              label: "Repeat-payment decision",
              detail: "Do not pay again blindly while the original fictional transaction remains pending.",
              state: "action",
            },
          ]
        : [
            {
              label: t("Current driving licence", "वर्तमान ड्राइविंग लाइसेंस"),
              detail: renewalActionNeeded
                ? t(
                    `Expiry detected: ${aarohiSyntheticLicence.visibleExpiryText} · ${renewal.daysRemaining} days remaining. Start renewal readiness now.`,
                    `समाप्ति तिथि मिली: ${aarohiSyntheticLicence.visibleExpiryText} · ${renewal.daysRemaining} दिन शेष। नवीनीकरण तैयारी अभी शुरू करें।`,
                  )
                : t(
                    `Expiry detected: ${aarohiSyntheticLicence.visibleExpiryText}. Renewal window is safe in this synthetic scenario.`,
                    `समाप्ति तिथि मिली: ${aarohiSyntheticLicence.visibleExpiryText}। इस सिंथेटिक स्थिति में नवीनीकरण विंडो सुरक्षित है।`,
                  ),
              state: renewalActionNeeded ? "action" : "ready",
            },
            {
              label: t("Current address proof", "वर्तमान पते का प्रमाण"),
              detail: t(
                "Review required: the locality wording differs from the proof.",
                "समीक्षा आवश्यक: इलाके की शब्दावली प्रमाण से अलग है।",
              ),
              state: "review",
            },
            {
              label: t("Contact number readiness", "संपर्क नंबर तैयारी"),
              detail: t(
                "Not confirmed. Important official alerts may not reach this number.",
                "पुष्टि नहीं हुई। महत्वपूर्ण आधिकारिक अलर्ट इस नंबर तक नहीं पहुँच सकते।",
              ),
              state: "action",
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
            <Link
              href="/demo"
              className="hidden rounded-full border border-[#e8cd98] bg-[#fff8e8] px-3 py-1.5 text-xs font-medium text-[#80591b] hover:bg-[#fff1d7] sm:inline"
            >
              {t("Change demo profile", "डेमो प्रोफ़ाइल बदलें")}
            </Link>
            <Link
              href="/apply"
              className="rounded-lg border border-[#d7e1d7] bg-white px-3 py-2 text-sm font-semibold text-[#285536] hover:bg-[#f4faf3]"
            >
              {t("Address check", "पता जाँच")}
            </Link>
          </div>
        </nav>

        <header className="border-b border-[#e1eade] py-10 sm:py-14">
          <div className="flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="inline-flex rounded-full bg-[#fff1d7] px-3 py-1.5 text-sm font-semibold text-[#8a5410]">
                {profileContent.eyebrow}
              </p>
              <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-[-0.05em] sm:text-5xl">
                {profileContent.title}
              </h1>
              <p className="mt-4 max-w-2xl text-lg leading-8 text-[#526558]">{profileContent.description}</p>
            </div>
            <div className="rounded-2xl border border-[#f0c4b4] bg-[#fff4ee] p-5 lg:w-72">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#934124]">
                {profileContent.urgencyLabel}
              </p>
              <p className="mt-2 text-3xl font-semibold text-[#6f311b]">{profileContent.urgency}</p>
              <p className="mt-1 text-sm leading-6 text-[#784b3a]">{profileContent.urgencyDetail}</p>
            </div>
          </div>
        </header>

        <section className="grid gap-6 py-8 lg:grid-cols-[1.42fr_.85fr]">
          <div className="space-y-6">
            <section className="rounded-3xl border border-[#dce7dd] bg-white p-6 sm:p-8">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-bold uppercase tracking-[0.14em] text-[#31804a]">
                    {profileContent.sectionLabel}
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold">
                    {profile === "aarohi"
                      ? t(`${readyCount} of 3 readiness checks complete`, `3 में से ${readyCount} तैयारी जाँच पूरी`)
                      : profileContent.sectionTitle}
                  </h2>
                  <p className="mt-2 max-w-xl text-sm leading-6 text-[#5c6d60]">{profileContent.sectionDetail}</p>
                </div>
                <span className="rounded-full bg-[#fff4ee] px-3 py-1.5 text-sm font-bold text-[#934124]">
                  {profileContent.badge}
                </span>
              </div>
              <div className="mt-6 space-y-3">
                {activeChecklist.map((item) => {
                  const resolved = item.label === "Contact number readiness" && contactConfirmed;
                  const state = resolved ? "ready" : item.state;
                  const detail = resolved
                    ? "Confirmed for this synthetic demo. Update official details only through the authorised service."
                    : item.detail;
                  return (
                    <article key={item.label} className={`rounded-2xl border p-4 ${tone[state as keyof typeof tone]}`}>
                      <div className="flex gap-3">
                        <span
                          className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-white/80 text-sm font-bold"
                          aria-hidden="true"
                        >
                          {state === "ready" ? "✓" : state === "review" ? "!" : "→"}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold">{item.label}</p>
                          <p className="mt-1 text-sm leading-6 opacity-90">{detail}</p>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Link
                  href={profileContent.actionHref}
                  className="rounded-xl bg-[#166534] px-5 py-3 text-center font-semibold text-white shadow-lg shadow-[#166534]/15 hover:bg-[#10572b]"
                >
                  {profileContent.actionLabel}
                </Link>
                {profile === "aarohi" && (
                  <button
                    onClick={() => setDemoJourneyState({ aarohiContactReady: !contactConfirmed })}
                    className="rounded-xl border border-[#c7d9c8] bg-white px-5 py-3 font-semibold text-[#285536] hover:bg-[#f4faf3]"
                  >
                    {contactConfirmed
                      ? t("Undo contact confirmation", "संपर्क पुष्टि वापस लें")
                      : t("Confirm demo contact readiness", "डेमो संपर्क तैयारी की पुष्टि करें")}
                  </button>
                )}
              </div>
            </section>

            <ExplainableAuditTimeline language={hindi ? "hi" : "en"} steps={auditSteps} />

            <section className="rounded-3xl border border-[#dce7dd] bg-white p-6 sm:p-8">
              <p className="text-sm font-bold uppercase tracking-[0.14em] text-[#31804a]">
                {t("What happens next", "आगे क्या होगा")}
              </p>
              <h2 className="mt-2 text-2xl font-semibold">
                {t("A clear path, without a black-box decision.", "ब्लैक-बॉक्स निर्णय के बिना एक स्पष्ट मार्ग।")}
              </h2>
              <ol className="mt-6 space-y-4 border-l-2 border-[#d8eadb] pl-5 text-sm leading-6 text-[#506556]">
                <li>
                  <strong className="text-[#17281f]">{t("Check your documents.", "अपने दस्तावेज़ जाँचें।")}</strong>{" "}
                  {t(
                    "SahiSetu catches unreadable, incomplete, or inconsistent demo documents before you proceed.",
                    "आगे बढ़ने से पहले SahiSetu अपठनीय, अधूरे या असंगत डेमो दस्तावेज़ पकड़ता है।",
                  )}
                </li>
                <li>
                  <strong className="text-[#17281f]">
                    {t("Review the exact issue.", "सटीक समस्या की समीक्षा करें।")}
                  </strong>{" "}
                  {t(
                    "You see the relevant field, document wording, and corrective action.",
                    "आपको संबंधित फ़ील्ड, दस्तावेज़ की शब्दावली और सुधारात्मक कार्रवाई दिखती है।",
                  )}
                </li>
                <li>
                  <strong className="text-[#17281f]">
                    {t("Continue through the official route.", "आधिकारिक मार्ग से आगे बढ़ें।")}
                  </strong>{" "}
                  {t(
                    "SahiSetu never submits, pays, approves, or updates an official application.",
                    "SahiSetu कभी भी आधिकारिक आवेदन जमा, भुगतान, मंजूर या अपडेट नहीं करता।",
                  )}
                </li>
              </ol>
            </section>
          </div>

          <aside className="space-y-6">
            {profile === "aarohi" ? (
              <section className="rounded-3xl border border-[#d7e5d9] bg-[#f7fbf7] p-6">
                <p className="text-sm font-bold uppercase tracking-[0.14em] text-[#31804a]">
                  {t("Reminder centre", "रिमाइंडर केंद्र")}
                </p>
                <h2 className="mt-2 text-2xl font-semibold">{t("Choose demo reminders", "डेमो रिमाइंडर चुनें")}</h2>
                <p className="mt-3 text-sm leading-6 text-[#536b59]">
                  {t(
                    "These are previews only. No SMS, WhatsApp, email, or calendar event is sent.",
                    "ये केवल पूर्वावलोकन हैं। कोई SMS, WhatsApp, ईमेल या कैलेंडर इवेंट नहीं भेजा जाता।",
                  )}
                </p>
                <div className="mt-5 space-y-3">
                  {(["60 days", "30 days", "7 days"] as Reminder[]).map((reminder) => (
                    <label
                      key={reminder}
                      className="flex cursor-pointer items-center justify-between rounded-xl border border-[#d5e4d6] bg-white px-4 py-3 text-sm font-semibold text-[#294d34]"
                    >
                      <span>{hindi ? `${reminder} पहले` : `${reminder} before expiry`}</span>
                      <input
                        type="checkbox"
                        checked={reminders.includes(reminder)}
                        onChange={() => toggleReminder(reminder)}
                        className="h-4 w-4 accent-[#166534]"
                      />
                    </label>
                  ))}
                </div>
                <button
                  onClick={() => setSaved(true)}
                  className="mt-5 w-full rounded-xl bg-[#193b63] px-4 py-3 font-semibold text-white hover:bg-[#142f50]"
                >
                  {t("Save simulated reminders", "सिमुलेटेड रिमाइंडर सहेजें")}
                </button>
                {saved && (
                  <p className="mt-3 rounded-xl bg-[#e7f6e9] p-3 text-sm font-medium text-[#246238]">
                    ✓{" "}
                    {t(
                      "Reminder preview saved for this browser session.",
                      "इस ब्राउज़र सत्र के लिए रिमाइंडर पूर्वावलोकन सहेजा गया।",
                    )}
                  </p>
                )}
              </section>
            ) : (
              <section className="rounded-3xl border border-[#d7e5d9] bg-[#f7fbf7] p-6">
                <p className="text-sm font-bold uppercase tracking-[0.14em] text-[#31804a]">
                  {t("Synthetic scenario", "सिंथेटिक स्थिति")}
                </p>
                <h2 className="mt-2 text-2xl font-semibold">
                  {t("One clear next action.", "एक स्पष्ट अगली कार्रवाई।")}
                </h2>
                <p className="mt-3 text-sm leading-6 text-[#536b59]">
                  {t(
                    "This profile demonstrates how SahiSetu will make a document or payment issue explainable before a citizen takes the next official step.",
                    "यह प्रोफ़ाइल दिखाती है कि अगला आधिकारिक कदम लेने से पहले SahiSetu दस्तावेज़ या भुगतान समस्या को कैसे समझने योग्य बनाएगा।",
                  )}
                </p>
                <Link
                  href={profileContent.actionHref}
                  className="mt-5 block rounded-xl bg-[#193b63] px-4 py-3 text-center font-semibold text-white hover:bg-[#142f50]"
                >
                  {profileContent.actionLabel}
                </Link>
              </section>
            )}

            <section className="rounded-3xl border border-[#efd9a2] bg-[#fffaf0] p-6">
              <p className="text-sm font-bold uppercase tracking-[0.14em] text-[#8a5a12]">
                {t("Already submitted the application?", "क्या आवेदन पहले ही जमा कर दिया है?")}
              </p>
              <h2 className="mt-2 text-xl font-semibold">
                {t("Application Rescue is ready.", "आवेदन सहायता तैयार है।")}
              </h2>
              <p className="mt-3 text-sm leading-6 text-[#6f5a35]">{profileContent.rescue}</p>
              <Link
                href={
                  profile === "rohan"
                    ? "/rescue?case=under-scrutiny"
                    : profile === "neha"
                      ? "/rescue?case=payment-pending"
                      : "/rescue?case=upload-pending"
                }
                className="mt-4 block rounded-xl border border-[#e4c77f] bg-white px-4 py-3 text-center text-sm font-semibold text-[#80591b] hover:bg-[#fff7e5]"
              >
                {t("Open Application Rescue →", "आवेदन सहायता खोलें →")}
              </Link>
              <span className="mt-4 inline-flex rounded-full bg-white px-3 py-1.5 text-xs font-bold text-[#8a5a12] ring-1 ring-[#efd9a2]">
                {t("Prototype preview", "प्रोटोटाइप पूर्वावलोकन")}
              </span>
            </section>
          </aside>
        </section>

        <footer className="border-t border-[#e1eade] py-7 text-sm text-[#66796a]">
          {t(
            "SahiSetu is an independent, synthetic-data-only prototype—not an official government service.",
            "SahiSetu एक स्वतंत्र, केवल-सिंथेटिक-डेटा प्रोटोटाइप है—आधिकारिक सरकारी सेवा नहीं।",
          )}
        </footer>
      </div>
    </main>
  );
}
