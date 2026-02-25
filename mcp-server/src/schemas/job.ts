import { z } from "zod";

/**
 * Zod schemas for job-related data structures
 */

export const JobSchema = z.object({
  id: z.string().uuid(),
  external_id: z.string(),
  source: z.string(),
  title: z.string(),
  company: z.string(),
  location: z.string().optional(),
  remote: z.boolean(),
  url: z.string().url(),
  description: z.string().optional(),
  requirements: z.string().optional(),
  salary_min: z.number().optional(),
  salary_max: z.number().optional(),
  posted_date: z.string().datetime().optional(),
  company_stage: z.enum(["startup", "growth", "faang"]).optional(),
  tech_stack: z.array(z.string()).optional(),
  overall_score: z.number().min(0).max(100).optional(),
  role_match_score: z.number().min(0).max(100).optional(),
  tech_stack_score: z.number().min(0).max(100).optional(),
  company_stage_score: z.number().min(0).max(100).optional(),
  experience_level_score: z.number().min(0).max(100).optional(),
  location_score: z.number().min(0).max(100).optional(),
  matched_keywords: z.array(z.string()).optional(),
  red_flags: z.array(z.string()).optional(),
  reasoning: z.string().optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export const JobScoreSchema = z.object({
  overall_score: z.number().min(0).max(100),
  role_match: z.number().min(0).max(100),
  tech_stack_match: z.number().min(0).max(100),
  company_stage_match: z.number().min(0).max(100),
  experience_level_match: z.number().min(0).max(100),
  location_match: z.number().min(0).max(100),
  reasoning: z.string(),
  matched_keywords: z.array(z.string()),
  red_flags: z.array(z.string()),
});

export const SearchJobsInputSchema = z.object({
  keywords: z.array(z.string()),
  location: z.string().optional(),
  remote_only: z.boolean().default(false),
  page: z.number().int().positive().default(1),
  limit: z.number().int().min(1).max(50).default(20),
});

export const FilterJobsInputSchema = z.object({
  min_score: z.number().min(0).max(100).default(70),
  role_type: z.array(z.string()).optional(),
  company_stage: z.array(z.enum(["startup", "growth", "faang"])).optional(),
  tech_stack: z.array(z.string()).optional(),
  limit: z.number().int().positive().default(50),
});

export type Job = z.infer<typeof JobSchema>;
export type JobScore = z.infer<typeof JobScoreSchema>;
export type SearchJobsInput = z.infer<typeof SearchJobsInputSchema>;
export type FilterJobsInput = z.infer<typeof FilterJobsInputSchema>;
