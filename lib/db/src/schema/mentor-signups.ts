import { createInsertSchema } from "drizzle-zod";
import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { z } from "zod/v4";

export const mentorSignupsTable = pgTable("mentor_signups", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  field: text("field").notNull(),
  yearsExperience: text("years_experience").notNull(),
  helpOptions: text("help_options").array().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertMentorSignupSchema = createInsertSchema(mentorSignupsTable).omit({
  id: true,
  createdAt: true,
});

export type InsertMentorSignup = z.infer<typeof insertMentorSignupSchema>;
export type MentorSignup = typeof mentorSignupsTable.$inferSelect;