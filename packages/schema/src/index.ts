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
