import {
  mysqlTable,
  mysqlEnum,
  serial,
  bigint,
  varchar,
  text,
  timestamp,
  index,
} from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: serial("id").primaryKey(),
  unionId: varchar("unionId", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 320 }),
  avatar: text("avatar"),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
  lastSignInAt: timestamp("lastSignInAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const leads = mysqlTable(
  "leads",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    email: varchar("email", { length: 320 }).notNull(),
    phone: varchar("phone", { length: 64 }),
    company: varchar("company", { length: 255 }),
    source: mysqlEnum("source", [
      "website",
      "referral",
      "social",
      "email",
      "other",
    ])
      .default("website")
      .notNull(),
    status: mysqlEnum("status", ["new", "contacted", "converted"])
      .default("new")
      .notNull(),
    message: text("message"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt")
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    statusIdx: index("leads_status_idx").on(table.status),
    emailIdx: index("leads_email_idx").on(table.email),
  }),
);

export type Lead = typeof leads.$inferSelect;
export type InsertLead = typeof leads.$inferInsert;

export const leadNotes = mysqlTable(
  "lead_notes",
  {
    id: serial("id").primaryKey(),
    leadId: bigint("leadId", { mode: "number", unsigned: true }).notNull(),
    content: text("content").notNull(),
    followUpAt: timestamp("followUpAt"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    leadIdx: index("lead_notes_lead_idx").on(table.leadId),
    followUpIdx: index("lead_notes_followup_idx").on(table.followUpAt),
  }),
);

export type LeadNote = typeof leadNotes.$inferSelect;
export type InsertLeadNote = typeof leadNotes.$inferInsert;
