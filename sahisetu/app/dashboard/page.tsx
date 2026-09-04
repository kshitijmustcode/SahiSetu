"use client";

import Link from "next/link";
import { useState } from "react";
import { Form1AMedicalShield } from "../components/form-1a-medical-shield";
import { SiteFooter, SiteNavigation } from "../components/site-chrome";
import { useLanguage } from "../components/language-toggle";
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

  const readyCount =
    (renewalActionNeeded ? 0 : 1) + (contactConfirmed ? 1 : 0) + (demoJourney.aarohiMedicalReady ? 1 : 0);
  const profileContent = {
    eyebrow: t("DL Guardian", "DL गार्जियन"),
    title: t(
      "Stay ready before a licence deadline becomes urgent.",
      "लाइसेंस की समय-सीमा तत्काल बनने से पहले तैयार रहें।",
    ),
    description: t(
      "Aarohi Sharma’s demo profile is due for renewal soon. SahiSetu checks readiness and explains the next safe action.",
      "आराही शर्मा की डेमो प्रोफ़ाइल का नवीनीकरण जल्द होना है। SahiSetu तैयारी जाँचता और सुरक्षित अगला कदम समझाता है।",
    ),
    urgencyLabel: t("Renewal urgency", "नवीनीकरण की तात्कालिकता"),
    urgency: t(`${renewal.daysRemaining} days`, `${renewal.daysRemaining} दिन`),
    urgencyDetail: t(
      `Expiry detected from the licence: ${aarohiSyntheticLicence.visibleExpiryText}. Checked today: ${formatIndiaDate(renewal.referenceDate)}.`,
      `लाइसेंस से समाप्ति तिथि मिली: ${aarohiSyntheticLicence.visibleExpiryText}। आज जाँचा गया: ${formatIndiaDate(renewal.referenceDate)}।`,
    ),
  };
  const activeChecklist = [
    {
      label: t("Current driving licence", "वर्तमान ड्राइविंग लाइसेंस"),
      detail: renewalActionNeeded
        ? t(
            `Expiry detected: ${aarohiSyntheticLicence.visibleExpiryText} · ${renewal.daysRemaining} days remaining. Start renewal readiness now.`,
            `समाप्ति तिथि मिली: ${aarohiSyntheticLicence.visibleExpiryText} · ${renewal.daysRemaining} दिन शेष। नवीनीकरण तैयारी अभी शुरू करें।`,
          )
        : t(
            `Expiry detected: ${aarohiSyntheticLicence.visibleExpiryText}. The renewal window is currently safe.`,
            `समाप्ति तिथि मिली: ${aarohiSyntheticLicence.visibleExpiryText}। नवीनीकरण विंडो अभी सुरक्षित है।`,
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
    {
      label: t("Form 1A medical readiness", "Form 1A मेडिकल तैयारी"),
      detail: demoJourney.aarohiMedicalReady
        ? t(
            "Core visible fields are ready for human review. Verify whether Form 1A applies in the official service.",
            "मुख्य दिखाई देने वाले फ़ील्ड मानवीय समीक्षा के लिए तैयार हैं। आधिकारिक सेवा में सत्यापित करें कि Form 1A लागू है या नहीं।",
          )
        : t(
            "Check the doctor registration number, seal/stamp, signature, and fitness declaration before relying on the form.",
            "फॉर्म पर निर्भर होने से पहले डॉक्टर पंजीकरण नंबर, मुहर/स्टाम्प, हस्ताक्षर और फिटनेस घोषणा जाँचें।",
          ),
      state: demoJourney.aarohiMedicalReady ? "ready" : "review",
    },
  ];

  return (
    <main className="min-h-screen bg-[#fffdf8] text-[#17281f]">
      <div className="mx-auto max-w-6xl px-5 py-5 sm:px-8">
        <SiteNavigation>
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
        </SiteNavigation>

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
                    {t("Renewal readiness", "नवीनीकरण तैयारी")}
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold">
                    {t(`${readyCount} of 4 readiness checks complete`, `4 में से ${readyCount} तैयारी जाँच पूरी`)}
                  </h2>
                  <p className="mt-2 max-w-xl text-sm leading-6 text-[#5c6d60]">
                    {t(
                      "Resolve the amber and red items before using the official renewal service. This is a preparation checklist, not an approval result.",
                      "आधिकारिक नवीनीकरण सेवा इस्तेमाल करने से पहले एम्बर और लाल आइटम हल करें। यह तैयारी-सूची है, मंजूरी परिणाम नहीं।",
                    )}
                  </p>
                </div>
                <span className="rounded-full bg-[#fff4ee] px-3 py-1.5 text-sm font-bold text-[#934124]">
                  {t("Action needed", "कार्रवाई आवश्यक")}
                </span>
              </div>
              <div className="mt-6 space-y-3">
                {activeChecklist.map((item) => {
                  const resolved = item.label === "Contact number readiness" && contactConfirmed;
                  const state = resolved ? "ready" : item.state;
                  const detail = resolved
                    ? "Confirmed for this demo. Update official details only through the authorised service."
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
                  href="/apply?demo=normal"
                  className="rounded-xl bg-[#166534] px-5 py-3 text-center font-semibold text-white shadow-lg shadow-[#166534]/15 hover:bg-[#10572b]"
                >
                  {t("Review address proof", "पते के प्रमाण की समीक्षा करें")}
                </Link>
                <button
                  onClick={() => setDemoJourneyState({ aarohiContactReady: !contactConfirmed })}
                  className="rounded-xl border border-[#c7d9c8] bg-white px-5 py-3 font-semibold text-[#285536] hover:bg-[#f4faf3]"
                >
                  {contactConfirmed
                    ? t("Undo contact confirmation", "संपर्क पुष्टि वापस लें")
                    : t("Confirm demo contact readiness", "डेमो संपर्क तैयारी की पुष्टि करें")}
                </button>
              </div>
            </section>

            <Form1AMedicalShield
              hindi={hindi}
              complete={demoJourney.aarohiMedicalReady}
              onComplete={(ready) => setDemoJourneyState({ aarohiMedicalReady: ready })}
            />

            {demoJourney.aarohiPacketReady && (
              <section className="rounded-3xl border border-[#b9dfc0] bg-[#f1fbf3] p-6 sm:p-8">
                <p className="text-sm font-bold uppercase tracking-[0.14em] text-[#31804a]">
                  {t("Handoff pack", "हैंडऑफ पैक")}
                </p>
                <h2 className="mt-2 text-2xl font-semibold">
                  {t(
                    "Your readiness packet is ready to take forward.",
                    "आपका तैयारी पैकेट आगे ले जाने के लिए तैयार है।",
                  )}
                </h2>
                <p className="mt-3 text-sm leading-6 text-[#4b6551]">
                  {t(
                    "Save a reviewable summary of the expiry evidence, confirmation, remaining boundary, and safe official next action. Nothing is submitted from SahiSetu.",
                    "समाप्ति प्रमाण, पुष्टि, बची सीमा और सुरक्षित आधिकारिक अगली कार्रवाई का समीक्षा योग्य सार सहेजें। SahiSetu से कुछ भी सबमिट नहीं होता।",
                  )}
                </p>
                <Link
                  href="/handoff?case=aarohi"
                  className="mt-5 inline-flex rounded-xl bg-[#166534] px-5 py-3 font-semibold text-white hover:bg-[#10572b]"
                >
                  {t("Open handoff pack →", "हैंडऑफ पैक खोलें →")}
                </Link>
              </section>
            )}
          </div>

          <aside className="space-y-6">
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
          </aside>
        </section>

        <SiteFooter>
          {t(
            "Independent demo · not an official government service.",
            "SahiSetu एक स्वतंत्र, केवल-सिंथेटिक-डेटा प्रोटोटाइप है—आधिकारिक सरकारी सेवा नहीं।",
          )}
        </SiteFooter>
      </div>
    </main>
  );
}
