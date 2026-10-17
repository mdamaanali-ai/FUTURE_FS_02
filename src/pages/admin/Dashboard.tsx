import AdminShell from "@/components/AdminShell";
import { trpc } from "@/providers/trpc";
import {
  LEAD_SOURCES,
  LEAD_SOURCE_LABELS,
  LEAD_STATUSES,
  LEAD_STATUS_LABELS,
  type LeadStatus,
} from "@contracts/leads";
import { formatDate, formatDateTime, statusDot, statusStyles } from "@/lib/lead-ui";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { CalendarClock, ChevronRight, Search, StickyNote } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router";

function StatBlock({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <div className="border border-border bg-white px-5 py-4">
      <p className="micro-label text-muted-foreground">{label}</p>
      <p className="mt-2 font-mono text-3xl font-semibold leading-none tracking-tight">
        {value}
      </p>
      {hint ? (
        <p className="mt-2 text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}

function StatusSelect({
  id,
  status,
}: {
  id: number;
  status: LeadStatus;
}) {
  const utils = trpc.useUtils();
  const mutation = trpc.leads.updateStatus.useMutation({
    onSuccess: () => {
      utils.leads.list.invalidate();
      utils.leads.stats.invalidate();
    },
  });
  return (
    <Select
      value={status}
      onValueChange={(v) =>
        mutation.mutate({ id, status: v as LeadStatus })
      }
      disabled={mutation.isPending}
    >
      <SelectTrigger
        aria-label="Update lead status"
        onClick={(e) => e.stopPropagation()}
        className={`h-9 w-[140px] border text-xs font-medium ${statusStyles[status]}`}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {LEAD_STATUSES.map((s) => (
          <SelectItem key={s} value={s}>
            <span className="flex items-center gap-2">
              <span className={`h-2 w-2 rounded-full ${statusDot[s]}`} />
              {LEAD_STATUS_LABELS[s]}
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export default function Dashboard() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState<LeadStatus | "all">("all");
  const [source, setSource] = useState<(typeof LEAD_SOURCES)[number] | "all">(
    "all",
  );

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(t);
  }, [search]);

  const stats = trpc.leads.stats.useQuery();
  const list = trpc.leads.list.useQuery({
    search: debouncedSearch || undefined,
    status: status === "all" ? undefined : status,
    source: source === "all" ? undefined : source,
  });

  const s = stats.data;

  return (
    <AdminShell>
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="micro-label text-muted-foreground">Pipeline</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">Leads</h1>
        </div>
        <p className="font-mono text-xs text-muted-foreground">
          {list.data ? `${list.data.length} record${list.data.length === 1 ? "" : "s"}` : ""}
        </p>
      </header>

      {/* Stats */}
      <section className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-5">
        {stats.isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))
        ) : s ? (
          <>
            <StatBlock
              label="Total leads"
              value={s.total}
              hint={`+${s.recent7d} in last 7 days`}
            />
            <StatBlock label="New" value={s.byStatus.new ?? 0} />
            <StatBlock label="Contacted" value={s.byStatus.contacted ?? 0} />
            <StatBlock label="Converted" value={s.byStatus.converted ?? 0} />
            <StatBlock
              label="Conversion"
              value={`${s.conversionRate}%`}
              hint="converted / total"
            />
          </>
        ) : null}
      </section>

      {/* Upcoming follow-ups */}
      {s && s.upcomingFollowUps.length > 0 && (
        <section className="mt-6 border border-border bg-white">
          <div className="flex items-center gap-2 border-b border-border px-5 py-3">
            <CalendarClock className="h-4 w-4 text-cobalt" aria-hidden />
            <p className="micro-label text-foreground">Next follow-ups</p>
          </div>
          <ul className="divide-y divide-border">
            {s.upcomingFollowUps.map((f) => (
              <li key={f.noteId}>
                <Link
                  to={`/admin/leads/${f.leadId}`}
                  className="flex min-h-11 flex-wrap items-center gap-x-4 gap-y-1 px-5 py-2.5 text-sm transition-colors hover:bg-secondary/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <span className="font-mono text-xs text-cobalt">
                    {f.followUpAt ? formatDateTime(f.followUpAt) : ""}
                  </span>
                  <span className="font-medium">{f.leadName}</span>
                  <span className="truncate text-muted-foreground">
                    {f.content}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Filters */}
      <section className="mt-8 flex flex-col gap-3 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, email or company…"
            className="h-11 pl-9"
            aria-label="Search leads"
          />
        </div>
        <div className="flex gap-3">
          <Select
            value={status}
            onValueChange={(v) => setStatus(v as LeadStatus | "all")}
          >
            <SelectTrigger className="h-11 flex-1 md:w-[160px]" aria-label="Filter by status">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {LEAD_STATUSES.map((st) => (
                <SelectItem key={st} value={st}>
                  {LEAD_STATUS_LABELS[st]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={source}
            onValueChange={(v) => setSource(v as typeof source)}
          >
            <SelectTrigger className="h-11 flex-1 md:w-[160px]" aria-label="Filter by source">
              <SelectValue placeholder="All sources" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All sources</SelectItem>
              {LEAD_SOURCES.map((so) => (
                <SelectItem key={so} value={so}>
                  {LEAD_SOURCE_LABELS[so]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </section>

      {/* Lead table */}
      <section className="mt-4 overflow-x-auto border border-border bg-white">
        <table className="hairline-table w-full min-w-[760px] text-sm">
          <thead>
            <tr className="bg-secondary/50 text-left">
              <th className="micro-label px-4 py-3 text-muted-foreground">Lead</th>
              <th className="micro-label px-4 py-3 text-muted-foreground">Contact</th>
              <th className="micro-label px-4 py-3 text-muted-foreground">Source</th>
              <th className="micro-label px-4 py-3 text-muted-foreground">Status</th>
              <th className="micro-label px-4 py-3 text-muted-foreground">Notes</th>
              <th className="micro-label px-4 py-3 text-muted-foreground">Received</th>
              <th className="w-10 px-2 py-3" aria-label="Open" />
            </tr>
          </thead>
          <tbody>
            {list.isLoading &&
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  <td colSpan={7} className="px-4 py-3">
                    <Skeleton className="h-6 w-full" />
                  </td>
                </tr>
              ))}
            {list.data?.map((lead) => (
              <tr key={lead.id} className="group transition-colors hover:bg-secondary/40">
                <td className="px-4 py-2.5">
                  <Link
                    to={`/admin/leads/${lead.id}`}
                    className="block min-h-11 py-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <span className="block font-medium text-foreground group-hover:text-cobalt">
                      {lead.name}
                    </span>
                    {lead.company && (
                      <span className="block text-xs text-muted-foreground">
                        {lead.company}
                      </span>
                    )}
                  </Link>
                </td>
                <td className="px-4 py-2.5">
                  <span className="block text-foreground">{lead.email}</span>
                  {lead.phone && (
                    <span className="block font-mono text-xs text-muted-foreground">
                      {lead.phone}
                    </span>
                  )}
                </td>
                <td className="px-4 py-2.5 text-muted-foreground">
                  {LEAD_SOURCE_LABELS[lead.source]}
                </td>
                <td className="px-4 py-2.5">
                  <StatusSelect id={lead.id} status={lead.status} />
                </td>
                <td className="px-4 py-2.5">
                  <span className="inline-flex items-center gap-1.5 font-mono text-xs text-muted-foreground">
                    <StickyNote className="h-3.5 w-3.5" aria-hidden />
                    {lead.noteCount}
                  </span>
                </td>
                <td className="px-4 py-2.5 font-mono text-xs text-muted-foreground">
                  {formatDate(lead.createdAt)}
                </td>
                <td className="px-2 py-2.5">
                  <Link
                    to={`/admin/leads/${lead.id}`}
                    aria-label={`Open ${lead.name}`}
                    className="flex h-11 w-8 items-center justify-center text-muted-foreground transition-colors hover:text-cobalt focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {list.data && list.data.length === 0 && (
          <div className="border-t border-dashed border-border px-6 py-14 text-center">
            <p className="micro-label text-muted-foreground">No leads found</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Try a different search or filter — new contact-form submissions
              appear here automatically.
            </p>
          </div>
        )}
      </section>
    </AdminShell>
  );
}
