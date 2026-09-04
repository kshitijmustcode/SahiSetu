"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { LanguageToggle, useLanguage } from "../components/language-toggle";
import { useDemoJourneyState } from "../lib/demo-journey-state";
import { aarohiSyntheticLicence, getRenewalReadiness } from "../lib/dl-readiness";

type HandoffCase = "aarohi" | "rohan" | "neha";

type HandoffContent = {
  name: string;
  label: string;
  evidence: string[];
  finding: string;
  boundary: string;
  nextAction: string;
  returnHref: string;
  returnLabel: string;
};

function subscribeToLocation(callback: () => void) {
  window.addEventListener("popstate", callback);
  return () => window.removeEventListener("popstate", callback);
}

function handoffCaseFromLocation(): HandoffCase {
  const caseKey = new URLSearchParams(window.location.search).get("case");
  return caseKey === "rohan" || caseKey === "neha" ? caseKey : "aarohi";
}

export default function HandoffPage() {
  const hindi = useLanguage() === "hi";
  const caseKey = useSyncExternalStore<HandoffCase>(subscribeToLocation, handoffCaseFromLocation, () => "aarohi");
  const journey = useDemoJourneyState();
  const renewal = getRenewalReadiness();
  const hydrated = useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false,
  );
  const t = (english: string, hindiText: string) => (hindi ? hindiText : english);
  const issued = hydrated
    ? (() => {
        const now = new Date();
        return {
          reference: `SS-HANDOFF-${caseKey.toUpperCase()}-${now.getTime().toString().slice(-6)}`,
          timestamp: new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" }).format(now),
        };
      })()
    : null;
  const content: Record<HandoffCase, HandoffContent> = {
    aarohi: {
      name: "Aarohi Sharma",
      label: t("DL renewal readiness", "DL नवीनीकरण तैयारी"),
      evidence: [
        t(
          `Synthetic licence expiry: ${aarohiSyntheticLicence.visibleExpiryText}`,
          `सिंथेटिक लाइसेंस समाप्ति: ${aarohiSyntheticLicence.visibleExpiryText}`,
        ),
        t("Synthetic document-readiness check", "सिंथेटिक दस्तावेज़-तैयारी जाँच"),
        t("Citizen contact-readiness confirmation", "नागरिक संपर्क-तैयारी पुष्टि"),
      ],
      finding: t(
        `A readiness packet was prepared with ${renewal.daysRemaining} days remaining in this synthetic scenario.`,
        `इस सिंथेटिक स्थिति में ${renewal.daysRemaining} दिन शेष रहते एक तैयारी पैकेट तैयार हुआ।`,
      ),
      boundary: t(
        "The visible expiry still needs attention. This pack is preparation evidence, not a renewal decision or application submission.",
        "दिखाई गई समाप्ति पर अभी भी ध्यान देना जरूरी है। यह पैकेट तैयारी प्रमाण है, नवीनीकरण निर्णय या आवेदन सबमिशन नहीं।",
      ),
      nextAction: t(
        "Use the relevant official renewal service when ready, with the reviewed synthetic documents beside you.",
        "तैयार होने पर समीक्षा किए गए सिंथेटिक दस्तावेज़ों के साथ संबंधित आधिकारिक नवीनीकरण सेवा उपयोग करें।",
      ),
      returnHref: "/dashboard?profile=aarohi",
      returnLabel: t("Back to Aarohi’s dashboard", "आराही के डैशबोर्ड पर वापस"),
    },
    rohan: {
      name: "Rohan Mehta",
      label: t("Address-change readiness", "पता-परिवर्तन तैयारी"),
      evidence: [
        t("Old Koramangala address on the synthetic licence", "सिंथेटिक लाइसेंस पर पुराना कोरमंगला पता"),
        t("New-address proof: 44 Lakeview Road, Indiranagar", "नए पते का प्रमाण: 44 Lakeview Road, इंदिरानगर"),
        t("Citizen-reviewed final application wording", "नागरिक द्वारा समीक्षा की गई अंतिम आवेदन शब्दावली"),
      ],
      finding: t(
        "The old licence address is expected because Rohan moved. The review compares only the new application text with the new-address proof.",
        "रोहन स्थानांतरित हुए हैं, इसलिए पुराने लाइसेंस का पता अपेक्षित है। समीक्षा केवल नए आवेदन टेक्स्ट की नए पते के प्रमाण से तुलना करती है।",
      ),
      boundary: t(
        "This pack records a preparation check. It does not change the licence address, decide eligibility, or submit an application.",
        "यह पैकेट तैयारी जाँच दर्ज करता है। यह लाइसेंस पता नहीं बदलता, पात्रता तय नहीं करता या आवेदन जमा नहीं करता।",
      ),
      nextAction: t(
        "Use the exact proof wording, or keep the mock clarification note only when a real minor difference remains, then continue through the official address-change service.",
        "प्रमाण की सटीक शब्दावली उपयोग करें, या वास्तविक छोटा अंतर रहने पर ही मॉक स्पष्टीकरण नोट रखें, फिर आधिकारिक पता-परिवर्तन सेवा से आगे बढ़ें।",
      ),
      returnHref: "/apply?demo=rohan",
      returnLabel: t("Back to Rohan’s document review", "रोहन की दस्तावेज़ समीक्षा पर वापस"),
    },
    neha: {
      name: "Neha Verma",
      label: t("Application Rescue · payment pending", "आवेदन सहायता · भुगतान लंबित"),
      evidence: [
        "DEMO-APP-NV-9081",
        "DEMO-TXN-7742",
        t("Synthetic payment-pending record and transaction amount", "सिंथेटिक भुगतान-लंबित रिकॉर्ड और लेन-देन राशि"),
      ],
      finding: t(
        "A synthetic support summary was prepared so the payment evidence stays together.",
        "एक सिंथेटिक सहायता-सार तैयार हुआ ताकि भुगतान प्रमाण साथ रहे।",
      ),
      boundary: t(
        "A pending status is not proof of failure, approval, refund, or a need to pay again.",
        "लंबित स्थिति असफलता, मंजूरी, रिफंड या फिर से भुगतान की जरूरत का प्रमाण नहीं है।",
      ),
      nextAction: t(
        "Use the relevant official payment-status or support route with this evidence before considering another payment.",
        "दूसरे भुगतान पर विचार करने से पहले इस प्रमाण के साथ संबंधित आधिकारिक भुगतान-स्थिति या सहायता मार्ग उपयोग करें।",
      ),
      returnHref: "/rescue?case=payment-pending",
      returnLabel: t("Back to Neha’s Application Rescue", "नेहा की आवेदन सहायता पर वापस"),
    },
  };
  const prepared =
    caseKey === "aarohi"
      ? journey.aarohiPacketReady
      : caseKey === "rohan"
        ? journey.rohanPacketReady
        : journey.nehaSummaryReady;
  const active = content[caseKey];
  const addressReview =
    caseKey === "aarohi" ? journey.aarohiAddressReview : caseKey === "rohan" ? journey.rohanAddressReview : null;

  return (
    <main className="min-h-screen bg-[#fffdf8] text-[#17281f]">
      <div className="mx-auto max-w-4xl px-5 py-5 sm:px-8">
        <nav className="flex items-center justify-between print:hidden" aria-label="Main navigation">
          <Link href="/" className="flex items-center gap-3 font-semibold tracking-tight">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#166534] text-lg text-white shadow-sm">
              स
            </span>
            <span className="text-xl">SahiSetu</span>
          </Link>
          <LanguageToggle />
        </nav>

        <section className="py-10 sm:py-14">
          <div
            className={`rounded-3xl border p-7 sm:p-10 ${prepared ? "border-[#b9dfc0] bg-[#f1fbf3]" : "border-[#efd9a2] bg-[#fff8e8]"}`}
          >
            <p className="text-sm font-bold uppercase tracking-[0.14em] text-[#31804a]">
              {t("Synthetic handoff pack · demo only", "सिंथेटिक हैंडऑफ पैक · केवल डेमो")}
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-[-0.05em] sm:text-5xl">
              {prepared
                ? t("Ready with clarity.", "स्पष्टता के साथ तैयार।")
                : t("This pack is not ready yet.", "यह पैक अभी तैयार नहीं है।")}
            </h1>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-[#4b6551]">
              {prepared
                ? t(
                    "A reviewable summary of synthetic evidence, citizen confirmation, unresolved boundaries, and the safe next action.",
                    "सिंथेटिक प्रमाण, नागरिक पुष्टि, अनसुलझी सीमाओं और सुरक्षित अगली कार्रवाई का समीक्षा योग्य सार।",
                  )
                : t(
                    "Complete the relevant citizen journey first. SahiSetu does not create a handoff pack from an unfinished checklist.",
                    "पहले संबंधित नागरिक यात्रा पूरी करें। SahiSetu अधूरी सूची से हैंडऑफ पैक नहीं बनाता।",
                  )}
            </p>
          </div>

          <section className="mt-6 rounded-3xl border border-[#dce7dd] bg-white p-6 sm:p-8">
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#e5eee6] pb-6">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.14em] text-[#31804a]">{active.label}</p>
                <h2 className="mt-2 text-3xl font-semibold">{active.name}</h2>
                <p className="mt-2 text-sm text-[#647466]">
                  {issued
                    ? `${issued.reference} · ${issued.timestamp}`
                    : t("Preparing local demo reference…", "स्थानीय डेमो संदर्भ तैयार हो रहा है…")}
                </p>
              </div>
              <span
                className={`rounded-full px-3 py-1.5 text-sm font-bold ${prepared ? "bg-[#e9f7ea] text-[#236b39]" : "bg-[#fff4e8] text-[#80591b]"}`}
              >
                {prepared ? t("Prepared", "तैयार") : t("Incomplete", "अपूर्ण")}
              </span>
            </div>

            {prepared ? (
              <>
                <div className="mt-6 grid gap-6 sm:grid-cols-2">
                  <section>
                    <h3 className="font-semibold">{t("Evidence retained", "सुरक्षित प्रमाण")}</h3>
                    <ul className="mt-3 space-y-2 text-sm leading-6 text-[#4d6251]">
                      {active.evidence.map((item) => (
                        <li key={item}>✓ {item}</li>
                      ))}
                    </ul>
                  </section>
                  <section>
                    <h3 className="font-semibold">{t("What SahiSetu found", "SahiSetu ने क्या पाया")}</h3>
                    <p className="mt-3 text-sm leading-6 text-[#4d6251]">{active.finding}</p>
                  </section>
                </div>

                <section className="mt-6 rounded-2xl bg-[#fff8e8] p-5 text-sm leading-6 text-[#76551f]">
                  <h3 className="font-semibold">{t("What this does not decide", "यह क्या तय नहीं करता")}</h3>
                  <p className="mt-2">{active.boundary}</p>
                </section>
                {addressReview ? (
                  <section
                    className={`mt-4 rounded-2xl border p-5 text-sm leading-6 ${addressReview.hasMinorDifference ? "border-[#efd9a2] bg-[#fff8e8] text-[#76551f]" : "border-[#c8dfcb] bg-[#f3fbf4] text-[#285536]"}`}
                  >
                    <h3 className="font-semibold">
                      {addressReview.hasMinorDifference
                        ? t("Minor wording difference · citizen review", "छोटा शब्दावली अंतर · नागरिक समीक्षा")
                        : t("What changed in the reviewed text", "समीक्षित टेक्स्ट में क्या बदला")}
                    </h3>
                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      <p>
                        <strong>{t("Proof wording", "प्रमाण शब्दावली")}:</strong>
                        <br />
                        {addressReview.proofAddress}
                      </p>
                      <p>
                        <strong>{t("Final application text", "अंतिम आवेदन टेक्स्ट")}:</strong>
                        <br />
                        {addressReview.finalAddress}
                      </p>
                    </div>
                    <p className="mt-3">
                      {addressReview.hasMinorDifference
                        ? addressReview.clarificationSigned
                          ? t(
                              "Minor wording difference detected: the citizen changed the wording and signed the synthetic clarification note. This is a mock review record, not an official declaration.",
                              "छोटा शब्दावली अंतर मिला: नागरिक ने शब्दावली बदली और सिंथेटिक स्पष्टीकरण नोट पर हस्ताक्षर किए। यह मॉक समीक्षा रिकॉर्ड है, आधिकारिक घोषणा नहीं।",
                            )
                          : t(
                              "Minor wording difference detected: the citizen changed the wording, but no synthetic clarification note was signed.",
                              "छोटा शब्दावली अंतर मिला: नागरिक ने शब्दावली बदली, लेकिन किसी सिंथेटिक स्पष्टीकरण नोट पर हस्ताक्षर नहीं हुए।",
                            )
                        : t(
                            "The citizen confirmed the wording extracted from the synthetic proof without changing it.",
                            "नागरिक ने सिंथेटिक प्रमाण से निकाली गई शब्दावली को बिना बदले पुष्टि की।",
                          )}
                    </p>
                  </section>
                ) : null}
                <section className="mt-4 rounded-2xl bg-[#f0f8fc] p-5 text-sm leading-6 text-[#235779]">
                  <h3 className="font-semibold">{t("Safe next action", "सुरक्षित अगली कार्रवाई")}</h3>
                  <p className="mt-2">{active.nextAction}</p>
                </section>
              </>
            ) : (
              <section className="mt-6 rounded-2xl bg-[#fff8e8] p-5 text-sm leading-6 text-[#76551f]">
                <h3 className="font-semibold">{t("What to complete first", "पहले क्या पूरा करें")}</h3>
                <p className="mt-2">
                  {t(
                    "Return to the citizen journey, complete its evidence and confirmation steps, then open this page again. The completed pack will include only the synthetic evidence relevant to this case.",
                    "नागरिक यात्रा पर लौटें, उसके प्रमाण और पुष्टि चरण पूरे करें, फिर यह पेज दोबारा खोलें। पूर्ण पैकेट में केवल इस मामले से संबंधित सिंथेटिक प्रमाण शामिल होंगे।",
                  )}
                </p>
              </section>
            )}
            <p className="mt-6 text-xs leading-5 text-[#647466]">
              {t(
                "Fictional, synthetic demo only. SahiSetu has not submitted, paid, approved, updated, or accessed an official application.",
                "केवल काल्पनिक, सिंथेटिक डेमो। SahiSetu ने कोई आधिकारिक आवेदन जमा, भुगतान, मंजूर, अपडेट या एक्सेस नहीं किया है।",
              )}
            </p>
          </section>

          <div className="mt-6 flex flex-wrap gap-3 print:hidden">
            {prepared ? (
              <button
                onClick={() => window.print()}
                className="rounded-xl bg-[#166534] px-5 py-3 font-semibold text-white hover:bg-[#10572b]"
              >
                {t("Save this handoff pack as PDF", "इस हैंडऑफ पैक को PDF के रूप में सहेजें")}
              </button>
            ) : null}
            <Link
              href={active.returnHref}
              className="rounded-xl border border-[#bfd1c1] bg-white px-5 py-3 font-semibold text-[#285536] hover:bg-[#f4faf3]"
            >
              {active.returnLabel}
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
