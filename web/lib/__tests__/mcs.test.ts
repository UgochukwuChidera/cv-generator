import { describe, it, expect } from 'vitest';
import {
  normalizeMCS,
  assessMCSQuality,
  buildClarificationQuestions,
  mergeClarificationAnswers,
} from '../mcs';

// ---------------------------------------------------------------------------
// normalizeMCS
// ---------------------------------------------------------------------------
describe('normalizeMCS', () => {
  it('returns a valid MCS object from an empty input', () => {
    const mcs = normalizeMCS({});
    expect(mcs.personal).toBeDefined();
    expect(mcs.personal.name).toBe('');
    expect(mcs.experience).toEqual([]);
    expect(mcs.education).toEqual([]);
    expect(mcs.skills).toEqual([]);
    expect(mcs.meta.version).toBe(1);
  });

  it('preserves provided personal fields', () => {
    const mcs = normalizeMCS({ personal: { name: 'Jane Doe', email: 'jane@example.com' } });
    expect(mcs.personal.name).toBe('Jane Doe');
    expect(mcs.personal.email).toBe('jane@example.com');
    expect(mcs.personal.phone).toBe('');
  });

  it('trims whitespace from personal fields', () => {
    const mcs = normalizeMCS({ personal: { name: '  Alice Smith  ', title: '  Engineer  ' } });
    expect(mcs.personal.name).toBe('Alice Smith');
    expect(mcs.personal.title).toBe('Engineer');
  });

  it('role with spaces is preserved', () => {
    const mcs = normalizeMCS({
      experience: [{ company: 'Acme Corp', role: 'Senior Software Engineer', startDate: '2020', endDate: '', current: false, location: '', bullets: [] }],
    });
    expect(mcs.experience[0].role).toBe('Senior Software Engineer');
  });

  it('filters out empty skill entries', () => {
    const mcs = normalizeMCS({ skills: [{ name: '' }, { name: 'TypeScript', category: 'Language' }] });
    expect(mcs.skills).toHaveLength(1);
    expect(mcs.skills[0].name).toBe('TypeScript');
  });

  it('preserves bullets in experience entries', () => {
    const mcs = normalizeMCS({
      experience: [
        {
          company: 'Corp',
          role: 'Dev',
          bullets: ['Built X', 'Led team of 5'],
          startDate: '2019',
          endDate: '2022',
          current: false,
          location: '',
        },
      ],
    });
    expect(mcs.experience[0].bullets).toEqual(['Built X', 'Led team of 5']);
  });

  it('converts null/undefined string fields to empty string', () => {
    const mcs = normalizeMCS({ personal: { name: null as unknown as string } });
    expect(mcs.personal.name).toBe('');
  });

  it('replaces literal "null" and "undefined" strings with empty string', () => {
    const mcs = normalizeMCS({ personal: { name: 'null', title: 'undefined' } });
    expect(mcs.personal.name).toBe('');
    expect(mcs.personal.title).toBe('');
  });

  it('handles missing experience gracefully', () => {
    const mcs = normalizeMCS({ experience: null as unknown as [] });
    expect(mcs.experience).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// assessMCSQuality
// ---------------------------------------------------------------------------
describe('assessMCSQuality', () => {
  it('returns low overall quality for a fully empty profile', () => {
    const mcs = normalizeMCS({});
    const quality = assessMCSQuality(mcs);
    // Projects section scores 100 by default (no required fields), so overall > 0
    expect(quality.overall).toBeLessThan(25);
    expect(quality.isComplete).toBe(false);
    expect(quality.missingFields.length).toBeGreaterThan(0);
  });

  it('returns high overall quality for a fully filled profile (excl. languages)', () => {
    const mcs = normalizeMCS({
      personal: { name: 'John', title: 'Engineer', email: 'j@j.com', location: 'NYC' },
      summary: 'Experienced software engineer.',
      experience: [{ company: 'Acme', role: 'Dev', startDate: '2020', endDate: '', current: true, location: '', bullets: ['Led key project'] }],
      education: [{ institution: 'MIT', degree: 'BS', field: 'CS', startDate: '2015', endDate: '2019' }],
      skills: [{ name: 'TypeScript', category: 'Language' }],
      languages: [{ language: 'English', proficiency: 'Native' }],
    });
    const quality = assessMCSQuality(mcs);
    expect(quality.overall).toBe(100);
    expect(quality.isComplete).toBe(true);
    expect(quality.missingFields).toHaveLength(0);
  });

  it('reports missing personal.name when empty', () => {
    const mcs = normalizeMCS({ personal: { email: 'a@b.com', title: 'Dev', location: 'NYC' } });
    const quality = assessMCSQuality(mcs);
    const missingPaths = quality.missingFields.map((f) => f.path);
    expect(missingPaths).toContain('personal.name');
  });

  it('reports missing summary when absent', () => {
    const mcs = normalizeMCS({ personal: { name: 'Test', title: 'Dev', email: 'a@b.com', location: 'X' } });
    const quality = assessMCSQuality(mcs);
    const missingPaths = quality.missingFields.map((f) => f.path);
    expect(missingPaths).toContain('summary');
  });

  it('section scores are 0-100', () => {
    const mcs = normalizeMCS({});
    const quality = assessMCSQuality(mcs);
    for (const s of quality.sections) {
      expect(s.score).toBeGreaterThanOrEqual(0);
      expect(s.score).toBeLessThanOrEqual(100);
    }
  });
});

// ---------------------------------------------------------------------------
// buildClarificationQuestions
// ---------------------------------------------------------------------------
describe('buildClarificationQuestions', () => {
  it('returns at most 5 questions', () => {
    const mcs = normalizeMCS({});
    const quality = assessMCSQuality(mcs);
    const questions = buildClarificationQuestions(quality);
    expect(questions.length).toBeLessThanOrEqual(5);
  });

  it('returns empty array for a complete profile', () => {
    const mcs = normalizeMCS({
      personal: { name: 'A', title: 'B', email: 'a@b.com', location: 'C' },
      summary: 'Summary here.',
      experience: [{ company: 'X', role: 'Y', startDate: '2020', endDate: '', current: true, location: '', bullets: ['Did Z'] }],
      education: [{ institution: 'Uni' }],
      skills: [{ name: 'JS' }],
    });
    const quality = assessMCSQuality(mcs);
    const questions = buildClarificationQuestions(quality);
    expect(questions).toHaveLength(0);
  });

  it('questions contain "provide" phrasing', () => {
    const mcs = normalizeMCS({});
    const quality = assessMCSQuality(mcs);
    const questions = buildClarificationQuestions(quality);
    for (const q of questions) {
      expect(q.toLowerCase()).toContain('provide');
    }
  });
});

// ---------------------------------------------------------------------------
// mergeClarificationAnswers
// ---------------------------------------------------------------------------
describe('mergeClarificationAnswers', () => {
  it('updates personal.name from answers', () => {
    const mcs = normalizeMCS({});
    const next = mergeClarificationAnswers(mcs, { 'personal.name': 'Alice' });
    expect(next.personal.name).toBe('Alice');
  });

  it('updates personal.title from answers', () => {
    const mcs = normalizeMCS({});
    const next = mergeClarificationAnswers(mcs, { 'personal.title': 'Software Engineer' });
    expect(next.personal.title).toBe('Software Engineer');
  });

  it('updates personal.email from answers', () => {
    const mcs = normalizeMCS({});
    const next = mergeClarificationAnswers(mcs, { 'personal.email': 'test@example.com' });
    expect(next.personal.email).toBe('test@example.com');
  });

  it('updates personal.location from answers', () => {
    const mcs = normalizeMCS({});
    const next = mergeClarificationAnswers(mcs, { 'personal.location': 'New York City' });
    expect(next.personal.location).toBe('New York City');
  });

  it('updates summary from answers', () => {
    const mcs = normalizeMCS({});
    const next = mergeClarificationAnswers(mcs, { summary: 'A great developer.' });
    expect(next.summary).toBe('A great developer.');
  });

  it('updates experience[0].role from answers', () => {
    const mcs = normalizeMCS({});
    const next = mergeClarificationAnswers(mcs, { 'experience[0].role': 'Product Manager' });
    expect(next.experience[0].role).toBe('Product Manager');
  });

  it('splits skills string by comma', () => {
    const mcs = normalizeMCS({});
    const next = mergeClarificationAnswers(mcs, { skills: 'TypeScript, React, Node.js' });
    expect(next.skills.map((s) => s.name)).toEqual(['TypeScript', 'React', 'Node.js']);
  });

  it('ignores empty answer values', () => {
    const mcs = normalizeMCS({ personal: { name: 'Bob' } });
    const next = mergeClarificationAnswers(mcs, { 'personal.name': '   ' });
    expect(next.personal.name).toBe('Bob');
  });

  it('preserves role names with spaces (regression)', () => {
    const mcs = normalizeMCS({});
    const next = mergeClarificationAnswers(mcs, { 'experience[0].role': 'Senior Full Stack Engineer' });
    expect(next.experience[0].role).toBe('Senior Full Stack Engineer');
  });

  it('updates meta.updated_at timestamp', () => {
    const before = new Date().toISOString();
    const mcs = normalizeMCS({});
    const next = mergeClarificationAnswers(mcs, { 'personal.name': 'Test' });
    expect(next.meta.updated_at >= before).toBe(true);
  });
});
