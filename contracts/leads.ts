// Shared lead constants — used by both the tRPC API and the React client.

export const LEAD_STATUSES = ["new", "contacted", "converted"] as const;
export type LeadStatus = (typeof LEAD_STATUSES)[number];

export const LEAD_SOURCES = [
  "website",
  "referral",
  "social",
  "email",
  "other",
] as const;
export type LeadSource = (typeof LEAD_SOURCES)[number];

export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  new: "New",
  contacted: "Contacted",
  converted: "Converted",
};

export const LEAD_SOURCE_LABELS: Record<LeadSource, string> = {
  website: "Website form",
  referral: "Referral",
  social: "Social media",
  email: "Email",
  other: "Other",
};
