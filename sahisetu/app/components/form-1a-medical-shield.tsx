"use client";

import { useState } from "react";

type FormVariant = "complete" | "missing-registration" | "missing-seal" | "missing-declaration";

const variants: Array<{ id: FormVariant; label: string; labelHi: string }> = [
  { id: "complete", label: "Complete Form 1A", labelHi: "पूर्ण Form 1A" },
  { id: "missing-registration", label: "Registration number missing", labelHi: "पंजीकरण नंबर अनुपस्थित" },
  { id: "missing-seal", label: "Seal/stamp missing", labelHi: "मुहर/स्टाम्प अनुपस्थित" },
  { id: "missing-declaration", label: "Fitness declaration missing", labelHi: "फिटनेस घोषणा अनुपस्थित" },
];

export function Form1AMedicalShield({
  hindi,
  complete,
  onComplete,
}: {
  hindi: boolean;
  complete: boolean;
  onComplete: (ready: boolean) => void;
}) {
  const [variant, setVariant] = useState<FormVariant>(complete ? "complete" : "missing-registration");
  const [checked, setChecked] = useState(complete);
  const t = (english: string, hindiText: string) => (hindi ? hindiText : english);
  const missing = {
    registration: variant === "missing-registration",
    seal: variant === "missing-seal",
    declaration: variant === "missing-declaration",
  };
  const fields = [
    {
      label: t("Practitioner registration number", "चिकित्सक पंजीकरण नंबर"),
      value: missing.registration ? t("Not visible", "दिखाई नहीं दे रहा") : "KMC/2011/48291",
      ready: !missing.registration,
    },
    {
      label: t("Official seal / stamp", "आधिकारिक मुहर / स्टाम्प"),
      value: missing.seal ? t("Not visible", "दिखाई नहीं दे रहा") : t("Visible", "दिखाई दे रहा"),
      ready: !missing.seal,
    },
    {
      label: t("Doctor signature", "डॉक्टर के हस्ताक्षर"),
      value: t("Visible", "दिखाई दे रहे"),
      ready: true,
    },
    {
      label: t("Medical fitness declaration", "चिकित्सीय फिटनेस घोषणा"),
      value: missing.declaration ? t("Not visible", "दिखाई नहीं दे रहा") : t("Visible", "दिखाई दे रही"),
      ready: !missing.declaration,
    },
  ];
  const ready = fields.every((field) => field.ready);

  function inspect() {
    setChecked(true);
    onComplete(ready);
  }

  function printDoctorNote() {
    document.body.dataset.printMedicalNote = "true";
    window.requestAnimationFrame(() => {
      window.print();
      window.setTimeout(() => {
        delete document.body.dataset.printMedicalNote;
      }, 0);
    });
  }

  return (
    <section className="medical-shield rounded-3xl border border-[#b9d8ed] bg-[#f5fbff] p-6 sm:p-8">
      <p className="text-sm font-bold uppercase tracking-[0.14em] text-[#1e638f]">
        {t("Form 1A medical readiness shield", "Form 1A मेडिकल रेडीनेस शील्ड")}
      </p>
      <div className="mt-3 flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-2xl">
          <h2 className="text-2xl font-semibold">
            {t(
              "Catch a preventable doctor-form gap before the visit.",
              "विज़िट से पहले डॉक्टर फॉर्म की रोकी जा सकने वाली कमी पकड़ें।",
            )}
          </h2>
          <p className="mt-3 text-sm leading-6 text-[#496779]">
            {t(
              "This demo assumes a renewal applicant aged 42. Form 1A may be required for applicants aged 40+ or for transport-licence cases; verify the relevant official service before acting.",
              "यह डेमो 42 वर्ष के नवीनीकरण आवेदक को मानता है। 40+ आयु के आवेदकों या परिवहन-लाइसेंस मामलों में Form 1A की आवश्यकता हो सकती है; कार्रवाई से पहले संबंधित आधिकारिक सेवा में सत्यापित करें।",
            )}
          </p>
        </div>
        <a
          href="https://parivahan.gov.in/sites/default/files/DownloadForm/cmvr/FORM-1A.pdf"
          target="_blank"
          rel="noreferrer"
          className="shrink-0 rounded-xl border border-[#9fc8dc] bg-white px-4 py-2.5 text-sm font-semibold text-[#1e638f] hover:bg-[#eaf6fb]"
        >
          {t("View official Form 1A ↗", "आधिकारिक Form 1A देखें ↗")}
        </a>
      </div>

      <div className="mt-6 flex flex-wrap gap-2" aria-label={t("Choose a demo form", "डेमो फॉर्म चुनें")}>
        {variants.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => {
              setVariant(item.id);
              setChecked(false);
              onComplete(false);
            }}
            className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${variant === item.id ? "border-[#1e638f] bg-[#1e638f] text-white" : "border-[#b9d8ed] bg-white text-[#245b7c] hover:bg-[#e9f5fb]"}`}
          >
            {hindi ? item.labelHi : item.label}
          </button>
        ))}
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[.8fr_1.2fr]">
        <div className="rounded-2xl border border-[#cce0ea] bg-white p-5">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#27709a]">
            {t("Demo Form 1A", "डेमो Form 1A")}
          </p>
          <p className="mt-2 text-lg font-semibold">{t("Medical certificate", "मेडिकल सर्टिफिकेट")}</p>
          <p className="mt-1 text-sm text-[#5b7280]">
            {t("Applicant: Aarohi Sharma · Age: 42", "आवेदक: आराही शर्मा · आयु: 42")}
          </p>
          <div className="mt-5 space-y-3 border-t border-[#e0ebef] pt-4 text-sm">
            <p>{t("Doctor: Dr. Ananya Rao", "डॉक्टर: डॉ. अनन्या राव")}</p>
            <p>
              {t("Registration: ", "पंजीकरण: ")}
              {missing.registration ? "—" : "KMC/2011/48291"}
            </p>
            <p>
              {t("Seal/stamp: ", "मुहर/स्टाम्प: ")}
              {missing.seal ? "—" : t("Present", "उपस्थित")}
            </p>
            <p>{t("Signature: Present", "हस्ताक्षर: उपस्थित")}</p>
            <p>
              {t("Fitness declaration: ", "फिटनेस घोषणा: ")}
              {missing.declaration ? "—" : t("Present", "उपस्थित")}
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-[#cce0ea] bg-white p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#27709a]">
                {t("Pre-check results", "प्री-चेक परिणाम")}
              </p>
              <h3 className="mt-1 text-lg font-semibold">
                {checked
                  ? ready
                    ? t("Ready for human review", "मानवीय समीक्षा के लिए तैयार")
                    : t("Doctor action needed", "डॉक्टर की कार्रवाई आवश्यक")
                  : t("Review the visible fields", "दिखाई देने वाले फ़ील्ड की समीक्षा करें")}
              </h3>
            </div>
            <button
              type="button"
              onClick={inspect}
              className="rounded-xl bg-[#1e638f] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#164d70]"
            >
              {t("Run pre-check", "प्री-चेक चलाएँ")}
            </button>
          </div>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {fields.map((field) => (
              <div
                key={field.label}
                className={`rounded-xl border p-3 text-sm ${checked && !field.ready ? "border-[#f0c4b4] bg-[#fff4ee] text-[#8b3822]" : "border-[#d5e5d8] bg-[#f6fbf7] text-[#2b6240]"}`}
              >
                <p className="font-semibold">
                  {field.ready ? "✓" : "!"} {field.label}
                </p>
                <p className="mt-1 text-xs leading-5 opacity-90">{field.value}</p>
              </div>
            ))}
          </div>
          {checked ? (
            <div
              className={`mt-4 rounded-xl p-4 text-sm leading-6 ${ready ? "bg-[#eaf7ec] text-[#28653d]" : "bg-[#fff4e8] text-[#80591b]"}`}
            >
              <p className="font-semibold">
                {ready
                  ? t(
                      "Form details are visible for human review. This is not a medical-fitness or licence decision.",
                      "फॉर्म विवरण मानवीय समीक्षा के लिए दिखाई दे रहे हैं। यह मेडिकल फिटनेस या लाइसेंस निर्णय नहीं है।",
                    )
                  : t(
                      "Ask the doctor to complete the highlighted item(s) before you rely on this form.",
                      "इस फॉर्म पर निर्भर होने से पहले डॉक्टर से हाइलाइट किए गए आइटम पूरे करने को कहें।",
                    )}
              </p>
              <button
                type="button"
                onClick={printDoctorNote}
                className="mt-3 rounded-lg border border-current px-3 py-2 text-xs font-bold hover:bg-white/60"
              >
                {t("Print doctor confirmation note", "डॉक्टर पुष्टि नोट प्रिंट करें")}
              </button>
            </div>
          ) : null}
        </div>
      </div>

      <div className="medical-note mt-6 rounded-2xl border border-dashed border-[#9fc8dc] bg-white p-5 text-sm leading-6 text-[#29485b]">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#27709a]">
          {t("Doctor confirmation note · demo only", "डॉक्टर पुष्टि नोट · केवल डेमो")}
        </p>
        <h3 className="mt-2 text-lg font-semibold">
          {t("Please confirm these visible Form 1A details", "कृपया इन दिखाई देने वाले Form 1A विवरणों की पुष्टि करें")}
        </h3>
        <ul className="mt-3 space-y-1.5">
          {fields.map((field) => (
            <li key={field.label}>□ {field.label}</li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-[#5b7280]">
          {t(
            "Prepared by SahiSetu for a demo journey. It is not a prescription, medical opinion, government form, or evidence of acceptance.",
            "SahiSetu द्वारा डेमो यात्रा के लिए तैयार। यह प्रिस्क्रिप्शन, मेडिकल राय, सरकारी फॉर्म या स्वीकृति का प्रमाण नहीं है।",
          )}
        </p>
      </div>
    </section>
  );
}
