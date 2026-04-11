import { MCSSchema, type MCS } from '@nexus/schema';

export type MissingField = {
  path: string;
  label: string;
  section: 'personal' | 'summary' | 'experience' | 'education' | 'skills' | 'projects' | 'languages';
};

export type SectionCompleteness = {
  section: MissingField['section'];
  score: number;
  missing: MissingField[];
};

export type MCSQuality = {
  overall: number;
  sections: SectionCompleteness[];
  missingFields: MissingField[];
  isComplete: boolean;
};

function cleanText(value: unknown): string {
  if (value == null) return '';
  const next = String(value).trim();
  return next === 'null' || next === 'undefined' ? '' : next;
}

function cleanStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map(cleanText).filter(Boolean);
}

export function normalizeMCS(input: unknown): MCS {
  const base = typeof input === 'object' && input ? (input as Record<string, unknown>) : {};
  const personalRaw = typeof base.personal === 'object' && base.personal ? (base.personal as Record<string, unknown>) : {};

  const normalized: MCS = {
    personal: {
      name: cleanText(personalRaw.name),
      title: cleanText(personalRaw.title),
      location: cleanText(personalRaw.location),
      email: cleanText(personalRaw.email),
      phone: cleanText(personalRaw.phone),
      website: cleanText(personalRaw.website),
      linkedin: cleanText(personalRaw.linkedin),
      github: cleanText(personalRaw.github),
      twitter: cleanText(personalRaw.twitter),
    },
    summary: cleanText(base.summary),
    experience: Array.isArray(base.experience)
      ? base.experience.map((item) => {
          const x = typeof item === 'object' && item ? (item as Record<string, unknown>) : {};
          return {
            company: cleanText(x.company),
            role: cleanText(x.role),
            startDate: cleanText(x.startDate),
            endDate: cleanText(x.endDate),
            current: Boolean(x.current),
            location: cleanText(x.location),
            bullets: cleanStringArray(x.bullets),
          };
        })
      : [],
    education: Array.isArray(base.education)
      ? base.education.map((item) => {
          const x = typeof item === 'object' && item ? (item as Record<string, unknown>) : {};
          return {
            institution: cleanText(x.institution),
            degree: cleanText(x.degree),
            field: cleanText(x.field),
            startDate: cleanText(x.startDate),
            endDate: cleanText(x.endDate),
            gpa: cleanText(x.gpa),
            honors: cleanText(x.honors),
          };
        })
      : [],
    skills: Array.isArray(base.skills)
      ? base.skills.map((item) => {
          const x = typeof item === 'object' && item ? (item as Record<string, unknown>) : {};
          return {
            name: cleanText(x.name),
            category: cleanText(x.category),
          };
        }).filter((x) => x.name)
      : [],
    projects: Array.isArray(base.projects)
      ? base.projects.map((item) => {
          const x = typeof item === 'object' && item ? (item as Record<string, unknown>) : {};
          return {
            name: cleanText(x.name),
            description: cleanText(x.description),
            url: cleanText(x.url),
            tech: cleanStringArray(x.tech),
            bullets: cleanStringArray(x.bullets),
          };
        })
      : [],
    languages: Array.isArray(base.languages)
      ? base.languages.map((item) => {
          const x = typeof item === 'object' && item ? (item as Record<string, unknown>) : {};
          return {
            language: cleanText(x.language),
            proficiency: cleanText(x.proficiency),
          };
        }).filter((x) => x.language)
      : [],
    headshotPath: cleanText(base.headshotPath),
    coverLetters:
      typeof base.coverLetters === 'object' && base.coverLetters
        ? Object.fromEntries(
            Object.entries(base.coverLetters as Record<string, unknown>).flatMap(([k, v]) => {
              if (!v || typeof v !== 'object') return [];
              const entry = v as Record<string, unknown>;
              const content = cleanText(entry.content);
              if (!content) return [];
              return [[k, { content, created_at: cleanText(entry.created_at) || new Date().toISOString() }]];
            })
          )
        : {},
    meta: {
      version:
        typeof base.meta === 'object' && base.meta && typeof (base.meta as Record<string, unknown>).version === 'number'
          ? ((base.meta as Record<string, unknown>).version as number)
          : 1,
      updated_at:
        typeof base.meta === 'object' && base.meta
          ? cleanText((base.meta as Record<string, unknown>).updated_at) || new Date().toISOString()
          : new Date().toISOString(),
    },
    history: Array.isArray(base.history) ? base.history : [],
  };

  return MCSSchema.parse(normalized);
}


const DEFAULT_EXPERIENCE = {
  company: '',
  role: '',
  startDate: '',
  endDate: '',
  current: false,
  location: '',
  bullets: [] as string[],
};

const REQUIRED: Record<MissingField['section'], Array<{ path: string; label: string }>> = {
  personal: [
    { path: 'personal.name', label: 'Full name' },
    { path: 'personal.title', label: 'Professional title' },
    { path: 'personal.email', label: 'Email' },
    { path: 'personal.location', label: 'Location' },
  ],
  summary: [{ path: 'summary', label: 'Professional summary' }],
  experience: [
    { path: 'experience[0].role', label: 'Latest role' },
    { path: 'experience[0].company', label: 'Latest company' },
    { path: 'experience[0].bullets', label: 'Latest role achievements' },
  ],
  education: [{ path: 'education[0].institution', label: 'Education institution' }],
  skills: [{ path: 'skills', label: 'Skills list' }],
  projects: [],
  languages: [],
};

function getByPath(mcs: MCS, path: string): unknown {
  if (path === 'summary') return mcs.summary;
  if (path === 'skills') return mcs.skills;
  const parts = path.replace(/\[(\d+)\]/g, '.$1').split('.');
  let cur: unknown = mcs;
  for (const part of parts) {
    if (cur == null || typeof cur !== 'object') return undefined;
    cur = (cur as Record<string, unknown>)[part];
  }
  return cur;
}

function present(value: unknown): boolean {
  if (Array.isArray(value)) return value.filter((v) => cleanText(v)).length > 0;
  return Boolean(cleanText(value));
}

function ensurePrimaryExperience(mcs: MCS) {
  if (!mcs.experience[0]) mcs.experience[0] = { ...DEFAULT_EXPERIENCE };
}

export function assessMCSQuality(mcs: MCS): MCSQuality {
  const sections: SectionCompleteness[] = (Object.keys(REQUIRED) as MissingField['section'][]).map((section) => {
    const required = REQUIRED[section];
    if (required.length === 0) return { section, score: 100, missing: [] };

    const missing = required
      .filter((rule) => !present(getByPath(mcs, rule.path)))
      .map((rule) => ({ ...rule, section }));

    return {
      section,
      score: Math.round(((required.length - missing.length) / required.length) * 100),
      missing,
    };
  });

  const overall = Math.round(sections.reduce((acc, x) => acc + x.score, 0) / sections.length);
  const missingFields = sections.flatMap((x) => x.missing);
  return { overall, sections, missingFields, isComplete: missingFields.length === 0 };
}

export function buildClarificationQuestions(quality: MCSQuality): string[] {
  return quality.missingFields.slice(0, 5).map((field) => `Please provide your ${field.label.toLowerCase()}.`);
}

export function mergeClarificationAnswers(mcs: MCS, answers: Record<string, string>): MCS {
  const next = structuredClone(mcs);

  for (const [path, value] of Object.entries(answers)) {
    const cleaned = cleanText(value);
    if (!cleaned) continue;

    switch (path) {
      case 'personal.name':
        next.personal.name = cleaned;
        break;
      case 'personal.title':
        next.personal.title = cleaned;
        break;
      case 'personal.email':
        next.personal.email = cleaned;
        break;
      case 'personal.location':
        next.personal.location = cleaned;
        break;
      case 'summary':
        next.summary = cleaned;
        break;
      case 'experience[0].role':
        ensurePrimaryExperience(next);
        next.experience[0].role = cleaned;
        break;
      case 'experience[0].company':
        ensurePrimaryExperience(next);
        next.experience[0].company = cleaned;
        break;
      case 'experience[0].bullets':
        ensurePrimaryExperience(next);
        next.experience[0].bullets = [cleaned];
        break;
      case 'education[0].institution':
        if (!next.education[0]) next.education[0] = { institution: '' };
        next.education[0].institution = cleaned;
        break;
      case 'skills':
        next.skills = cleaned
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean)
          .map((name) => ({ name }));
        break;
      default:
        break;
    }
  }

  next.meta.updated_at = new Date().toISOString();
  return normalizeMCS(next);
}
