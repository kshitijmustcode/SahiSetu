export type RenewalUrgency = "safe" | "renew-soon" | "urgent" | "expired";

// This fixture mirrors the clearly visible date on Aarohi's synthetic licence image.
export const aarohiSyntheticLicence = {
  assetPath: "/demo-documents/aarohi-sharma-synthetic-driving-licence-with-expiry.png",
  licenceNumber: "DEMO-DL-42-2020-0012345",
  validUntil: "2026-09-12",
  visibleExpiryText: "12 September 2026",
  source: "Visible expiry field on the synthetic driving-licence fixture",
} as const;

function utcDate(value: string) {
  return new Date(`${value}T00:00:00Z`);
}

function currentIndiaDate() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const valueFor = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)?.value;
  return `${valueFor("year")}-${valueFor("month")}-${valueFor("day")}`;
}

export function formatIndiaDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(utcDate(value));
}

export function getRenewalReadiness(licence = aarohiSyntheticLicence): {
  daysRemaining: number;
  urgency: RenewalUrgency;
  referenceDate: string;
} {
  const millisecondsPerDay = 24 * 60 * 60 * 1000;
  const referenceDate = currentIndiaDate();
  const daysRemaining = Math.round(
    (utcDate(licence.validUntil).getTime() - utcDate(referenceDate).getTime()) / millisecondsPerDay,
  );

  if (daysRemaining < 0) return { daysRemaining, urgency: "expired", referenceDate };
  if (daysRemaining <= 7) return { daysRemaining, urgency: "urgent", referenceDate };
  if (daysRemaining <= 30) return { daysRemaining, urgency: "renew-soon", referenceDate };
  return { daysRemaining, urgency: "safe", referenceDate };
}
