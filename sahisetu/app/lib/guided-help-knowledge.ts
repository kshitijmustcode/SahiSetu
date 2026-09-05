export type HelpSource = {
  id: string;
  title: string;
  url: string;
  summary: string;
  keywords: string[];
};

// This intentionally small source pack is retrieved locally on the server. It is
// not a live crawl, so a hostile webpage can never alter an answer at runtime.
export const helpSources: HelpSource[] = [
  {
    id: "parivahan-address-change",
    title: "Parivahan Sewa FAQ — change of address on driving licence",
    url: "https://parivahan.gov.in/en/faq/services-on-driver-license?page=0",
    summary:
      "The official FAQ says a citizen can use Sarathi, select their state, choose Driving Licence then Services on Driving Licence, enter driving-licence number and date of birth, then select Change of Address. Current state requirements must be checked in Sarathi.",
    keywords: ["address", "change", "moved", "move", "proof", "wording", "driving", "licence", "license"],
  },
  {
    id: "parivahan-status-faq",
    title: "Parivahan Sewa FAQ — application status and upload-pending guidance",
    url: "https://parivahan.gov.in/hi/node/167",
    summary:
      "For a driving-licence application that still asks for documents after upload, the FAQ directs citizens to Sarathi, select the relevant state, and use Application Status. State-specific workflows may differ.",
    keywords: ["upload", "uploaded", "document", "pending", "application", "status", "scrutiny", "sarathi"],
  },
  {
    id: "parivahan-renewal",
    title: "mParivahan — renewal of driving licence",
    url: "https://mparivahan.parivahan.gov.in/mstatic/english/dl-info-renewal-dl.html",
    summary:
      "The official information page describes renewal timing and documents. It says an application for renewal may be entertained up to one year before expiry; requirements and fees depend on the service and circumstances.",
    keywords: ["renewal", "renew", "expiry", "expires", "expired", "dl", "licence", "license", "form 9", "medical"],
  },
  {
    id: "parivahan-forms",
    title: "Parivahan Sewa — download forms",
    url: "https://parivahan.gov.in/parivahan/en/content/download-forms",
    summary:
      "Parivahan's forms page lists Form 9 for renewal of driving licence and other official forms. The applicable service path and state requirements should be checked before use.",
    keywords: ["form", "form 9", "renewal", "renew", "licence", "license"],
  },
  {
    id: "sarathi-verify-pay-status",
    title: "Sarathi — Verify Pay Status instructions",
    url: "https://sarathi.parivahan.gov.in/paymentscov/HELP.htm",
    summary:
      "For LL/DL payments, Sarathi’s official instructions say Verify Pay Status checks payment status using an application number, date of birth, and CAPTCHA. Citizens should retain their receipt/reference and use the official service before considering another payment.",
    keywords: [
      "payment",
      "deducted",
      "money",
      "transaction",
      "receipt",
      "pending",
      "refund",
      "driving",
      "licence",
      "license",
    ],
  },
];

export function retrieveHelpSources(question: string, limit = 3) {
  const terms: string[] = question.toLowerCase().match(/[a-z0-9]+/g) ?? [];
  const hasAny = (...keywords: string[]) => keywords.some((keyword) => terms.includes(keyword));
  const byId = (id: string) => helpSources.find((source) => source.id === id);
  const exactSources = (ids: string[]) => ids.map(byId).filter((source): source is HelpSource => Boolean(source));

  if (hasAny("payment", "deducted", "transaction", "receipt", "refund", "money")) {
    return exactSources(["sarathi-verify-pay-status"]);
  }
  if (hasAny("address", "moved", "move", "proof", "wording")) {
    return exactSources(["parivahan-address-change"]);
  }
  if (hasAny("renewal", "renew", "expiry", "expires", "expired", "medical", "form")) {
    return exactSources(["parivahan-renewal", "parivahan-forms"]);
  }
  if (hasAny("upload", "uploaded", "scrutiny", "status")) {
    return exactSources(["parivahan-status-faq"]);
  }
  const scored: Array<{ source: HelpSource; score: number }> = helpSources
    .map((source) => ({
      source,
      score: source.keywords.reduce<number>((total, keyword) => total + Number(terms.includes(keyword)), 0),
    }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score);
  if (!scored.length) return helpSources.slice(0, limit);
  return scored.slice(0, limit).map(({ source }) => source);
}
