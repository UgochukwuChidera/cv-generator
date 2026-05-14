import { z } from 'zod';

export const UpdateExperienceActionSchema = z.object({
  type: z.literal('updateExperience'),
  index: z.number().int().nonnegative().optional(),
  experience: z.object({
    company: z.string().optional(),
    role: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    current: z.boolean().optional(),
    location: z.string().optional(),
    bullets: z.array(z.string()).optional(),
  }),
});

export const AddSkillActionSchema = z.object({
  type: z.literal('addSkill'),
  skill: z.object({
    name: z.string().min(1),
    category: z.string().optional(),
  }),
});

export const GenerateSummaryActionSchema = z.object({
  type: z.literal('generateSummary'),
  summary: z.string().min(1),
});

export const UpdatePersonalActionSchema = z.object({
  type: z.literal('updatePersonal'),
  personal: z.object({
    name: z.string().optional(),
    title: z.string().optional(),
    location: z.string().optional(),
    email: z.string().optional(),
    phone: z.string().optional(),
    website: z.string().optional(),
    linkedin: z.string().optional(),
    github: z.string().optional(),
    twitter: z.string().optional(),
  }),
});

export const NoopActionSchema = z.object({
  type: z.literal('noop'),
  reason: z.string().optional(),
});

export const VoiceActionSchema = z.discriminatedUnion('type', [
  UpdateExperienceActionSchema,
  AddSkillActionSchema,
  GenerateSummaryActionSchema,
  UpdatePersonalActionSchema,
  NoopActionSchema,
]);

export const VoiceAssistantOutputSchema = z.object({
  action: VoiceActionSchema,
  assistantResponse: z.string().min(1),
});

export const VoiceApiSuccessSchema = z.object({
  ok: z.literal(true),
  transcript: z.string(),
  action: VoiceActionSchema,
  assistantResponse: z.string(),
});

export const VoiceApiErrorSchema = z.object({
  ok: z.literal(false),
  error: z.string(),
});

export const VoiceApiResponseSchema = z.union([VoiceApiSuccessSchema, VoiceApiErrorSchema]);

export type VoiceAction = z.infer<typeof VoiceActionSchema>;
export type VoiceAssistantOutput = z.infer<typeof VoiceAssistantOutputSchema>;
export type VoiceApiSuccess = z.infer<typeof VoiceApiSuccessSchema>;
export type VoiceApiError = z.infer<typeof VoiceApiErrorSchema>;
export type VoiceApiResponse = z.infer<typeof VoiceApiResponseSchema>;
