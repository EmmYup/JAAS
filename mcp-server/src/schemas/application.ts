import { z } from "zod";

/**
 * Zod schemas for application-related data structures
 */

export const ApplicationSchema = z.object({
  id: z.string().uuid(),
  job_id: z.string().uuid(),
  resume_version: z.string(),
  cover_letter_id: z.string().uuid().optional(),
  custom_notes: z.string().optional(),
  status: z.enum(["draft", "submitted", "interview", "rejected", "offer"]),
  submitted_at: z.string().datetime().optional(),
  response_date: z.string().datetime().optional(),
  submission_method: z.string().optional(),
  submission_url: z.string().url().optional(),
  contact_email: z.string().email().optional(),
  ethics_check_passed: z.boolean(),
  quality_score: z.number().min(0).max(100).optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export const CoverLetterSchema = z.object({
  id: z.string().uuid(),
  job_id: z.string().uuid(),
  content: z.string(),
  tone: z.enum(["professional", "enthusiastic", "technical"]),
  model_used: z.string(),
  prompt_version: z.string().optional(),
  generation_time_ms: z.number().optional(),
  is_generic: z.boolean(),
  word_count: z.number(),
  created_at: z.string().datetime(),
});

export const ResumeVersionSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  file_path: z.string(),
  target_roles: z.array(z.string()),
  highlights: z.array(z.string()),
  description: z.string().optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export const CreateApplicationInputSchema = z.object({
  job_id: z.string().uuid(),
  resume_version: z.string().optional(),
  cover_letter_tone: z.enum(["professional", "enthusiastic", "technical"]).default("professional"),
  custom_notes: z.string().optional(),
});

export const SubmitApplicationInputSchema = z.object({
  application_id: z.string().uuid(),
  dry_run: z.boolean().default(false),
});

export const BatchSubmitInputSchema = z.object({
  application_ids: z.array(z.string().uuid()),
  max_per_day: z.number().int().min(1).max(50).default(50),
  dry_run: z.boolean().default(false),
});

export type Application = z.infer<typeof ApplicationSchema>;
export type CoverLetter = z.infer<typeof CoverLetterSchema>;
export type ResumeVersion = z.infer<typeof ResumeVersionSchema>;
export type CreateApplicationInput = z.infer<typeof CreateApplicationInputSchema>;
export type SubmitApplicationInput = z.infer<typeof SubmitApplicationInputSchema>;
export type BatchSubmitInput = z.infer<typeof BatchSubmitInputSchema>;
