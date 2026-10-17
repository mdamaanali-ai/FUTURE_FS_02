import { getDb } from "../server/queries/connection.js";
import { leads, leadNotes } from "./schema.js";

async function seed() {
  const db = getDb();

  const existing = await db.select().from(leads).limit(1);
  if (existing.length > 0) {
    console.log("Leads already exist, skipping seed.");
    return;
  }

  const sampleLeads = [
    {
      name: "Aarav Mehta",
      email: "aarav@brightnest.studio",
      company: "Brightnest Studio",
      phone: "+91 98200 11223",
      source: "website" as const,
      status: "new" as const,
      message:
        "Hi! We need a new website for our interior design studio. Around 10 pages with a portfolio gallery. What are your rates?",
    },
    {
      name: "Sofia Alvarez",
      email: "sofia.alvarez@kavacoffee.co",
      company: "Kava Coffee Co.",
      source: "referral" as const,
      status: "contacted" as const,
      message:
        "Referred by Daniel. Looking for e-commerce development for our coffee subscription box.",
    },
    {
      name: "Daniel Kim",
      email: "dkim@northwindlogistics.com",
      company: "Northwind Logistics",
      phone: "+1 415 555 0182",
      source: "website" as const,
      status: "converted" as const,
      message:
        "Need a dashboard for our fleet tracking. Signed the proposal last Friday.",
    },
    {
      name: "Priya Nair",
      email: "priya@fernandfable.in",
      company: "Fern & Fable",
      source: "social" as const,
      status: "new" as const,
      message:
        "Saw your work on Instagram. We are a plant boutique and want an online store before the festive season.",
    },
    {
      name: "Marcus Thompson",
      email: "marcus.t@apexfitness.io",
      company: "Apex Fitness",
      source: "email" as const,
      status: "contacted" as const,
      message:
        "Following up on my earlier email — we'd like a booking system integrated into our site.",
    },
    {
      name: "Lena Fischer",
      email: "lena@fischerlegal.de",
      company: "Fischer Legal",
      source: "website" as const,
      status: "converted" as const,
      message:
        "Website refresh for our law firm. Project completed and final invoice paid.",
    },
    {
      name: "Rohan Desai",
      email: "rohan.desai@quickbite.app",
      company: "QuickBite",
      source: "other" as const,
      status: "new" as const,
      message:
        "Met at the startup meetup. We need a landing page for our food delivery app launch.",
    },
    {
      name: "Emily Chen",
      email: "emily.chen@lumenphoto.art",
      source: "website" as const,
      status: "contacted" as const,
      message:
        "Freelance photographer — need a portfolio site with client galleries.",
    },
  ];

  const now = Date.now();
  for (let i = 0; i < sampleLeads.length; i++) {
    const createdAt = new Date(now - (sampleLeads.length - i) * 26 * 3600 * 1000);
    const [{ id }] = await db
      .insert(leads)
      .values({ ...sampleLeads[i], createdAt, updatedAt: createdAt })
      .$returningId();

    if (i === 1) {
      await db.insert(leadNotes).values({
        leadId: id,
        content:
          "Called Sofia — sent the e-commerce proposal. She wants Shopify vs. custom comparison.",
        followUpAt: new Date(now + 2 * 24 * 3600 * 1000),
      });
      await db.insert(leadNotes).values({
        leadId: id,
        content: "Initial email exchange. Budget range $4k–6k.",
      });
    }
    if (i === 4) {
      await db.insert(leadNotes).values({
        leadId: id,
        content:
          "Demo scheduled for the booking system. Marcus to share their class schedule CSV.",
        followUpAt: new Date(now + 4 * 24 * 3600 * 1000),
      });
    }
    if (i === 7) {
      await db.insert(leadNotes).values({
        leadId: id,
        content: "Sent portfolio references. Waiting on brand assets.",
        followUpAt: new Date(now + 1 * 24 * 3600 * 1000),
      });
    }
  }

  console.log(`Seeded ${sampleLeads.length} leads with notes.`);
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
