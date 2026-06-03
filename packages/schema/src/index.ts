import { z } from 'zod';

export const PersonalSchema = z.object({
  name: z.string().default(''),
  title: z.string().optional(),
  location: z.string().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
  website: z.string().optional(),
  linkedin: z.string().optional(),
  github: z.string().optional(),
  twitter: z.string().optional(),
});

export const ExperienceSchema = z.object({
  company: z.string(),
  role: z.string(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  current: z.boolean().optional().default(false),
  location: z.string().optional(),
  bullets: z.array(z.string()).default([]),
});

export const EducationSchema = z.object({
  institution: z.string(),
  degree: z.string().optional(),
  field: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  gpa: z.string().optional(),
  honors: z.string().optional(),
});

export const SkillSchema = z.object({
  name: z.string(),
  category: z.string().optional(),
});

export const ProjectSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  url: z.string().optional(),
  tech: z.array(z.string()).default([]),
  bullets: z.array(z.string()).default([]),
});

export const LanguageSchema = z.object({
  language: z.string(),
  proficiency: z.string().optional(),
});

export const MetaSchema = z.object({
  version: z.number().int().default(1),
  updated_at: z.string().default(() => new Date().toISOString()),
});

export const CoverLetterSchema = z.object({
  content: z.string(),
  created_at: z.string().default(() => new Date().toISOString()),
});

// ─── Snapshot & Annotation Schemas ───────────────────────────────────
export const SnapshotRegionSchema = z.object({
  x: z.number(),
  y: z.number(),
  width: z.number(),
  height: z.number(),
});

export const SnapshotSchema = z.object({
  id: z.string(),
  type: z.enum(['region', 'element', 'full-page']),
  region: SnapshotRegionSchema.optional(),
  selector: z.string().optional(),
  page: z.string(),
  pageLabel: z.string(),
  title: z.string().default('Untitled Snapshot'),
  textContent: z.string().default(''),
  htmlSnapshot: z.string().optional(),
  dataPath: z.string().optional(),
  timestamp: z.string().default(() => new Date().toISOString()),
  resolved: z.boolean().default(false),
});

export const AnnotationSchema = z.object({
  id: z.string(),
  snapshotId: z.string(),
  type: z.enum(['edit', 'question', 'suggestion', 'comparison', 'action']).default('suggestion'),
  content: z.string(),
  aiResponse: z.string().optional(),
  applied: z.boolean().default(false),
  timestamp: z.string().default(() => new Date().toISOString()),
});

export const AIActionSchema = z.object({
  id: z.string(),
  type: z.enum([
    'compare-jd',
    'edit-section',
    'improve-bullet',
    'score-resume',
    'generate-summary',
    'generate-cover-letter',
    'suggest-skills',
    'export-cv',
    'clarify-question',
    'custom',
  ]),
  params: z.record(z.string(), z.unknown()).default({}),
  status: z.enum(['pending', 'running', 'done', 'failed']).default('pending'),
  result: z.unknown().optional(),
  error: z.string().optional(),
  timestamp: z.string().default(() => new Date().toISOString()),
});

export const FABMessageSchema = z.object({
  id: z.string(),
  role: z.enum(['user', 'assistant', 'system']),
  content: z.string(),
  action: AIActionSchema.optional(),
  timestamp: z.string().default(() => new Date().toISOString()),
});

export type SnapshotRegion = z.infer<typeof SnapshotRegionSchema>;
export type Snapshot = z.infer<typeof SnapshotSchema>;
export type Annotation = z.infer<typeof AnnotationSchema>;
export type AIAction = z.infer<typeof AIActionSchema>;
export type FABMessage = z.infer<typeof FABMessageSchema>;

export const MCSSchema = z.object({
  personal: PersonalSchema.default({ name: '' }),
  summary: z.string().optional(),
  experience: z.array(ExperienceSchema).default([]),
  education: z.array(EducationSchema).default([]),
  skills: z.array(SkillSchema).default([]),
  projects: z.array(ProjectSchema).optional(),
  languages: z.array(LanguageSchema).optional(),
  headshotPath: z.string().optional(),
  coverLetters: z.record(z.string(), CoverLetterSchema).optional(),
  meta: MetaSchema.default({ version: 1, updated_at: new Date().toISOString() }),
  history: z.array(z.unknown()).default([]),
});

export type Personal = z.infer<typeof PersonalSchema>;
export type Experience = z.infer<typeof ExperienceSchema>;
export type Education = z.infer<typeof EducationSchema>;
export type Skill = z.infer<typeof SkillSchema>;
export type Project = z.infer<typeof ProjectSchema>;
export type Language = z.infer<typeof LanguageSchema>;
export type Meta = z.infer<typeof MetaSchema>;
export type CoverLetter = z.infer<typeof CoverLetterSchema>;
export type MCS = z.infer<typeof MCSSchema>;
