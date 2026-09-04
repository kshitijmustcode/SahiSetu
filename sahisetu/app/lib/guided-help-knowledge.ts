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
    id: "parivahan-services",
    title: "Parivahan Sewa — licence-related services",
    url: "https://parivahan.gov.in/contactus",
    summary:
      "Parivahan lists licence-related services including application status, appointment booking, duplicate licence and other driving-licence services. Availability can vary by state.",
    keywords: ["licence", "license", "driving", "application", "status", "appointment", "service", "under scrutiny"],
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
    keywords: ["form", "form 9", "renewal", "address", "change", "licence", "license"],
  },
  {
    id: "parivahan-transaction-status",
    title: "Parivahan eTransPgi — transaction status",
    url: "https://www.parivahan.gov.in/eTransPgi/transactionStatus",
    summary:
      "The official transaction-status service provides fields for a transaction, payment, bank reference, or application identifier. A citizen should use the official service and retain their own receipt/reference rather than attempting a duplicate payment.",
    keywords: ["payment", "deducted", "money", "transaction", "bank", "receipt", "pending", "refund", "payment id"],
  },
];

export function retrieveHelpSources(question: string, limit = 3) {
  const terms: string[] = question.toLowerCase().match(/[a-z0-9]+/g) ?? [];
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
