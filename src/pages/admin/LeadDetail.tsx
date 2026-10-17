import AdminShell from "@/components/AdminShell";
import { trpc } from "@/providers/trpc";
import {
  LEAD_SOURCE_LABELS,
  LEAD_STATUSES,
  LEAD_STATUS_LABELS,
  type LeadStatus,
} from "@contracts/leads";
import {
  formatDateTime,
  statusDot,
  toDatetimeLocalValue,
} from "@/lib/lead-ui";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  ArrowLeft,
  Building2,
  CalendarClock,
  Mail,
  Phone,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router";

export default function LeadDetail() {
  const { id } = useParams<{ id: string }>();
  const leadId = Number(id);
  const navigate = useNavigate();
  const utils = trpc.useUtils();

  const lead = trpc.leads.get.useQuery(
    { id: leadId },
    { enabled: Number.isFinite(leadId) && leadId > 0 },
  );

  const invalidate = () => {
    utils.leads.get.invalidate({ id: leadId });
    utils.leads.list.invalidate();
    utils.leads.stats.invalidate();
  };

  const statusMutation = trpc.leads.updateStatus.useMutation({
    onSuccess: invalidate,
  });
  const noteMutation = trpc.leads.addNote.useMutation({
    onSuccess: () => {
      setNoteText("");
      setFollowUp("");
      invalidate();
    },
  });
  const deleteNoteMutation = trpc.leads.deleteNote.useMutation({
    onSuccess: invalidate,
  });
  const deleteLeadMutation = trpc.leads.remove.useMutation({
    onSuccess: () => {
      utils.leads.list.invalidate();
      utils.leads.stats.invalidate();
      navigate("/admin");
    },
  });

  const [noteText, setNoteText] = useState("");
  const [followUp, setFollowUp] = useState("");

  const l = lead.data;

  return (
    <AdminShell>
      <Link
        to="/admin"
        className="inline-flex min-h-11 items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-cobalt focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden /> Back to leads
      </Link>

      {lead.isLoading ? (
        <div className="mt-6 space-y-4">
          <Skeleton className="h-10 w-72" />
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : !l ? (
        <div className="mt-10 border border-dashed border-border bg-white px-6 py-14 text-center">
          <p className="micro-label text-muted-foreground">Not found</p>
          <p className="mt-2 text-sm text-muted-foreground">
            This lead doesn't exist or was deleted.
          </p>
        </div>
      ) : (
        <>
          <header className="mt-4 flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="micro-label text-muted-foreground">
                Lead #{String(l.id).padStart(4, "0")} · {LEAD_SOURCE_LABELS[l.source]}
              </p>
              <h1 className="mt-1 text-3xl font-semibold tracking-tight">
                {l.name}
              </h1>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="text-destructive hover:text-destructive">
                  <Trash2 className="mr-2 h-4 w-4" aria-hidden /> Delete lead
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete this lead?</AlertDialogTitle>
                  <AlertDialogDescription>
                    {l.name} and all {l.notes.length} note
                    {l.notes.length === 1 ? "" : "s"} will be permanently
                    removed. This cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => deleteLeadMutation.mutate({ id: l.id })}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </header>

          {/* Status pipeline */}
          <section className="mt-6 border border-border bg-white p-5">
            <p className="micro-label text-muted-foreground">Status</p>
            <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
              {LEAD_STATUSES.map((s, i) => {
                const active = l.status === s;
                return (
                  <button
                    key={s}
                    onClick={() =>
                      !active && statusMutation.mutate({ id: l.id, status: s as LeadStatus })
                    }
                    disabled={statusMutation.isPending}
                    aria-pressed={active}
                    className={`flex min-h-11 items-center gap-3 border px-4 py-2.5 text-sm transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                      active
                        ? "border-cobalt bg-cobalt text-white"
                        : "border-border bg-white text-foreground hover:border-cobalt/50 hover:bg-cobalt/5"
                    }`}
                  >
                    <span
                      className={`h-2 w-2 rounded-full ${active ? "bg-white" : statusDot[s]}`}
                      aria-hidden
                    />
                    <span className="font-mono text-xs text-current/60">
                      0{i + 1}
                    </span>
                    <span className="font-medium">{LEAD_STATUS_LABELS[s]}</span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Contact details + message */}
          <section className="mt-4 grid gap-4 lg:grid-cols-2">
            <div className="border border-border bg-white p-5">
              <p className="micro-label text-muted-foreground">Contact</p>
              <ul className="mt-3 space-y-2.5 text-sm">
                <li className="flex items-center gap-3">
                  <Mail className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
                  <a
                    href={`mailto:${l.email}`}
                    className="min-h-6 text-cobalt underline-offset-2 hover:underline"
                  >
                    {l.email}
                  </a>
                </li>
                {l.phone && (
                  <li className="flex items-center gap-3">
                    <Phone className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
                    <span className="font-mono">{l.phone}</span>
                  </li>
                )}
                {l.company && (
                  <li className="flex items-center gap-3">
                    <Building2 className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
                    <span>{l.company}</span>
                  </li>
                )}
              </ul>
              <div className="mt-4 border-t border-border pt-3 font-mono text-xs text-muted-foreground">
                Received {formatDateTime(l.createdAt)} · Updated{" "}
                {formatDateTime(l.updatedAt)}
              </div>
            </div>
            <div className="border border-border bg-white p-5">
              <p className="micro-label text-muted-foreground">
                Original message
              </p>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                {l.message || "—"}
              </p>
            </div>
          </section>

          {/* Notes & follow-ups */}
          <section className="mt-4 border border-border bg-white">
            <div className="border-b border-border px-5 py-3">
              <p className="micro-label text-foreground">
                Notes & follow-ups ({l.notes.length})
              </p>
            </div>

            <form
              className="border-b border-border p-5"
              onSubmit={(e) => {
                e.preventDefault();
                if (!noteText.trim()) return;
                noteMutation.mutate({
                  leadId: l.id,
                  content: noteText.trim(),
                  followUpAt: followUp ? new Date(followUp) : undefined,
                });
              }}
            >
              <Textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Log a call, email or next step…"
                className="min-h-20"
                aria-label="Note content"
              />
              <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="flex items-center gap-2">
                  <CalendarClock
                    className="h-4 w-4 text-muted-foreground"
                    aria-hidden
                  />
                  <Input
                    type="datetime-local"
                    value={followUp}
                    min={toDatetimeLocalValue(new Date())}
                    onChange={(e) => setFollowUp(e.target.value)}
                    className="h-11 w-full sm:w-60"
                    aria-label="Follow-up date (optional)"
                  />
                </div>
                <Button
                  type="submit"
                  className="min-h-11 sm:ml-auto"
                  disabled={noteMutation.isPending || !noteText.trim()}
                >
                  {noteMutation.isPending ? "Saving…" : "Add note"}
                </Button>
              </div>
              {noteMutation.isError && (
                <p className="mt-2 text-sm text-destructive" role="alert">
                  Couldn't save the note. Please try again.
                </p>
              )}
            </form>

            {l.notes.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <p className="text-sm text-muted-foreground">
                  No notes yet — log your first follow-up above.
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {l.notes.map((n) => (
                  <li key={n.id} className="group flex gap-4 px-5 py-4">
                    <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-cobalt" aria-hidden />
                    <div className="min-w-0 flex-1">
                      <p className="whitespace-pre-wrap text-sm leading-relaxed">
                        {n.content}
                      </p>
                      <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-xs text-muted-foreground">
                        <span>{formatDateTime(n.createdAt)}</span>
                        {n.followUpAt && (
                          <span className="inline-flex items-center gap-1 text-cobalt">
                            <CalendarClock className="h-3.5 w-3.5" aria-hidden />
                            Follow up {formatDateTime(n.followUpAt)}
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => deleteNoteMutation.mutate({ id: n.id })}
                      aria-label="Delete note"
                      className="flex h-11 w-11 shrink-0 items-center justify-center text-muted-foreground opacity-100 transition-colors hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </AdminShell>
  );
}
