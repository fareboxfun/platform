import { pgTable, text, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const skillSubmissionStatusEnum = pgEnum("skill_submission_status", [
  "pending",
  "reviewing",
  "approved",
  "rejected",
]);

export const skillSubmissionsTable = pgTable("skill_submissions", {
  id:           text("id").primaryKey(),
  name:         text("name").notNull(),
  description:  text("description").notNull(),
  specUrl:      text("spec_url").notNull(),
  category:     text("category").notNull(),
  pricePer1k:   text("price_per_1k").notNull(),   // USD string e.g. "0.50"
  contactEmail: text("contact_email").notNull(),
  contactName:  text("contact_name").notNull(),
  status:       skillSubmissionStatusEnum("status").notNull().default("pending"),
  createdAt:    timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertSkillSubmissionSchema = createInsertSchema(skillSubmissionsTable).omit({
  createdAt: true,
  status: true,
});

export type InsertSkillSubmission = z.infer<typeof insertSkillSubmissionSchema>;
export type SkillSubmission = typeof skillSubmissionsTable.$inferSelect;
