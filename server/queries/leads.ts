import { getDb } from "./connection.js";
import { leads, leadNotes, type InsertLead } from "../../db/schema.js";
import type { LeadSource, LeadStatus } from "../../contracts/leads.js";
import { and, desc, eq, like, or, sql, gte, count, isNotNull } from "drizzle-orm";

export async function createLead(data: InsertLead) {
  const [{ id }] = await getDb().insert(leads).values(data).$returningId();
  return getDb().query.leads.findFirst({ where: eq(leads.id, id) });
}

export async function listLeads(filters: {
  status?: LeadStatus;
  source?: LeadSource;
  search?: string;
}) {
  const conditions = [];
  if (filters.status) conditions.push(eq(leads.status, filters.status));
  if (filters.source) conditions.push(eq(leads.source, filters.source));
  if (filters.search) {
    const q = `%${filters.search}%`;
    conditions.push(
      or(
        like(leads.name, q),
        like(leads.email, q),
        like(leads.company, q),
      ),
    );
  }

  const rows = await getDb()
    .select()
    .from(leads)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(leads.createdAt));

  const noteCounts = await getDb()
    .select({ leadId: leadNotes.leadId, total: count() })
    .from(leadNotes)
    .groupBy(leadNotes.leadId);
  const countByLead = new Map(noteCounts.map((r) => [r.leadId, r.total]));

  return rows.map((lead) => ({
    ...lead,
    noteCount: countByLead.get(lead.id) ?? 0,
  }));
}

export async function getLeadWithNotes(id: number) {
  const db = getDb();
  const lead = await db.query.leads.findFirst({ where: eq(leads.id, id) });
  if (!lead) return null;
  const notes = await db
    .select()
    .from(leadNotes)
    .where(eq(leadNotes.leadId, id))
    .orderBy(desc(leadNotes.createdAt));
  return { ...lead, notes };
}

export async function updateLeadStatus(id: number, status: LeadStatus) {
  await getDb().update(leads).set({ status }).where(eq(leads.id, id));
  return getDb().query.leads.findFirst({ where: eq(leads.id, id) });
}

export async function deleteLead(id: number) {
  const db = getDb();
  await db.delete(leadNotes).where(eq(leadNotes.leadId, id));
  await db.delete(leads).where(eq(leads.id, id));
}

export async function addNote(data: {
  leadId: number;
  content: string;
  followUpAt?: Date | null;
}) {
  const db = getDb();
  const [{ id }] = await db
    .insert(leadNotes)
    .values({
      leadId: data.leadId,
      content: data.content,
      followUpAt: data.followUpAt ?? null,
    })
    .$returningId();
  return db.query.leadNotes.findFirst({ where: eq(leadNotes.id, id) });
}

export async function deleteNote(id: number) {
  await getDb().delete(leadNotes).where(eq(leadNotes.id, id));
}

export async function leadStats() {
  const db = getDb();

  const byStatus = await db
    .select({ status: leads.status, total: count() })
    .from(leads)
    .groupBy(leads.status);

  const bySource = await db
    .select({ source: leads.source, total: count() })
    .from(leads)
    .groupBy(leads.source);

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const [{ recent }] = await db
    .select({ recent: count() })
    .from(leads)
    .where(gte(leads.createdAt, sevenDaysAgo));

  const upcomingFollowUps = await db
    .select({
      noteId: leadNotes.id,
      followUpAt: leadNotes.followUpAt,
      content: leadNotes.content,
      leadId: leads.id,
      leadName: leads.name,
      leadStatus: leads.status,
    })
    .from(leadNotes)
    .innerJoin(leads, eq(leadNotes.leadId, leads.id))
    .where(
      and(
        isNotNull(leadNotes.followUpAt),
        gte(leadNotes.followUpAt, new Date()),
        sql`${leads.status} != 'converted'`,
      ),
    )
    .orderBy(leadNotes.followUpAt)
    .limit(5);

  const total = byStatus.reduce((sum, r) => sum + r.total, 0);
  const converted = byStatus.find((r) => r.status === "converted")?.total ?? 0;

  return {
    total,
    byStatus: Object.fromEntries(byStatus.map((r) => [r.status, r.total])),
    bySource: Object.fromEntries(bySource.map((r) => [r.source, r.total])),
    recent7d: recent,
    conversionRate: total > 0 ? Math.round((converted / total) * 100) : 0,
    upcomingFollowUps,
  };
}
