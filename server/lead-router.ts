import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createRouter, publicQuery, adminQuery } from "./middleware.js";
import { LEAD_STATUSES, LEAD_SOURCES } from "../contracts/leads.js";
import {
  createLead,
  listLeads,
  getLeadWithNotes,
  updateLeadStatus,
  deleteLead,
  addNote,
  deleteNote,
  leadStats,
} from "./queries/leads.js";

const submitInput = z.object({
  name: z.string().trim().min(1, "Name is required").max(255),
  email: z.string().trim().email("A valid email is required").max(320),
  phone: z.string().trim().max(64).optional(),
  company: z.string().trim().max(255).optional(),
  source: z.enum(LEAD_SOURCES).default("website"),
  message: z.string().trim().max(5000).optional(),
});

export const leadRouter = createRouter({
  // Public endpoint — this is what a website contact form posts to.
  submit: publicQuery.input(submitInput).mutation(async ({ input }) => {
    const lead = await createLead({
      name: input.name,
      email: input.email,
      phone: input.phone || null,
      company: input.company || null,
      source: input.source,
      message: input.message || null,
    });
    return { ok: true, id: lead?.id };
  }),

  // Admin endpoints below — secured behind the admin role.
  list: adminQuery
    .input(
      z.object({
        status: z.enum(LEAD_STATUSES).optional(),
        source: z.enum(LEAD_SOURCES).optional(),
        search: z.string().trim().max(200).optional(),
      }),
    )
    .query(({ input }) => listLeads(input)),

  get: adminQuery
    .input(z.object({ id: z.number().int().positive() }))
    .query(async ({ input }) => {
      const lead = await getLeadWithNotes(input.id);
      if (!lead) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Lead not found" });
      }
      return lead;
    }),

  updateStatus: adminQuery
    .input(
      z.object({
        id: z.number().int().positive(),
        status: z.enum(LEAD_STATUSES),
      }),
    )
    .mutation(({ input }) => updateLeadStatus(input.id, input.status)),

  remove: adminQuery
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(async ({ input }) => {
      await deleteLead(input.id);
      return { ok: true };
    }),

  addNote: adminQuery
    .input(
      z.object({
        leadId: z.number().int().positive(),
        content: z.string().trim().min(1, "Note cannot be empty").max(5000),
        followUpAt: z.date().optional(),
      }),
    )
    .mutation(({ input }) => addNote(input)),

  deleteNote: adminQuery
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(async ({ input }) => {
      await deleteNote(input.id);
      return { ok: true };
    }),

  stats: adminQuery.query(() => leadStats()),
});
