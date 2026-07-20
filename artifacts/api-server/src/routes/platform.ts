import { Router, type IRouter } from "express";
import { gte, sql } from "drizzle-orm";
import { db, usageEventsTable, modelsTable, skillSubmissionsTable } from "@workspace/db";
const router: IRouter = Router();

/* ── GET /platform/metrics ── public ──────────────────── */
router.get("/platform/metrics", async (_req, res): Promise<void> => {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [[totals], [modelCount], [recentStats]] = await Promise.all([
    db.select({
      totalRequests: sql<number>`count(*)::bigint`,
      totalTokens:   sql<number>`coalesce(sum(${usageEventsTable.inputTokens} + ${usageEventsTable.outputTokens}), 0)::bigint`,
      totalBilledUsd: sql<number>`coalesce(sum(${usageEventsTable.billedUsd}::numeric), 0)::float`,
    }).from(usageEventsTable),
    db.select({ count: sql<number>`count(*)::int` }).from(modelsTable),
    db.select({
      requests:  sql<number>`count(*)::int`,
      billedUsd: sql<number>`coalesce(sum(${usageEventsTable.billedUsd}::numeric), 0)::float`,
    }).from(usageEventsTable).where(gte(usageEventsTable.createdAt, sevenDaysAgo)),
  ]);

  res.json({
    totalRequests:    Number(totals?.totalRequests ?? 0),
    totalTokens:      Number(totals?.totalTokens ?? 0),
    totalBilledUsd:   Number(totals?.totalBilledUsd ?? 0),
    avgDailyRequests: Math.round(Number(recentStats?.requests ?? 0) / 7),
    avgDailyBilledUsd: Number(recentStats?.billedUsd ?? 0) / 7,
    activeModelCount: Number(modelCount?.count ?? 0),
  });
});

/* ── POST /api/skills/submit ── public ────────────────── */
router.post("/api/skills/submit", async (req, res): Promise<void> => {
  const { name, description, specUrl, category, pricePer1k, contactEmail, contactName } = req.body ?? {};

  const missing = ["name","description","specUrl","category","pricePer1k","contactEmail","contactName"]
    .filter(k => !req.body?.[k] || typeof req.body[k] !== "string" || !req.body[k].trim());
  if (missing.length) {
    res.status(400).json({ error: `Missing or empty fields: ${missing.join(", ")}` });
    return;
  }

  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRe.test(contactEmail)) {
    res.status(400).json({ error: "Invalid email address" });
    return;
  }
  if (!/^https?:\/\/.+/.test(specUrl)) {
    res.status(400).json({ error: "specUrl must be a valid URL" });
    return;
  }
  if (!/^\d+(\.\d{1,4})?$/.test(pricePer1k)) {
    res.status(400).json({ error: "pricePer1k must be a valid dollar amount" });
    return;
  }

  const id = `skill_${crypto.randomUUID().replace(/-/g, "").slice(0, 12)}`;

  await db.insert(skillSubmissionsTable).values({
    id, name: name.trim(), description: description.trim(),
    specUrl: specUrl.trim(), category: category.trim(),
    pricePer1k: pricePer1k.trim(), contactEmail: contactEmail.trim(),
    contactName: contactName.trim(), status: "pending",
  });

  res.status(201).json({
    ok: true,
    submissionId: id,
    message: "Submission received. We'll review it within 24 hours.",
  });
});

export default router;
