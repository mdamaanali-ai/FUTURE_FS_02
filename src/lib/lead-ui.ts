import type { LeadStatus } from "@contracts/leads";

export const statusStyles: Record<LeadStatus, string> = {
  new: "bg-cobalt/10 text-cobalt border-cobalt/30",
  contacted: "bg-amber-100 text-amber-800 border-amber-300",
  converted: "bg-emerald-100 text-emerald-800 border-emerald-300",
};

export const statusDot: Record<LeadStatus, string> = {
  new: "bg-cobalt",
  contacted: "bg-amber-500",
  converted: "bg-emerald-600",
};

export function formatDate(d: Date | string) {
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatDateTime(d: Date | string) {
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function toDatetimeLocalValue(d: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours(),
  )}:${pad(d.getMinutes())}`;
}
