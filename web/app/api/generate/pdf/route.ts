import { NextRequest, NextResponse } from 'next/server';
import React from 'react';
import { Document, Page, Text, View, StyleSheet, pdf } from '@react-pdf/renderer';
import { normalizeMCS } from '@/lib/mcs';

const baseStyles = StyleSheet.create({
  page: { padding: 28, fontSize: 10, fontFamily: 'Helvetica' },
  name: { fontSize: 20, marginBottom: 4, fontWeight: 'bold' },
  contact: { fontSize: 10, marginBottom: 10, color: '#444' },
  heading: { fontSize: 11, marginTop: 10, marginBottom: 4, textTransform: 'uppercase', fontWeight: 'bold' },
  roleLine: { display: 'flex', flexDirection: 'row', justifyContent: 'space-between' },
  role: { fontSize: 10, fontWeight: 'bold' },
  meta: { color: '#555', marginBottom: 2 },
  bullet: { marginLeft: 8, marginBottom: 2 },
  skillWrap: { display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  skillPill: { borderWidth: 1, borderColor: '#d1d5e1', borderRadius: 10, paddingHorizontal: 5, paddingVertical: 1, marginBottom: 3 },
});

/**
 * Map a web CSS font-family string to one of react-pdf's built-in fonts.
 * react-pdf supports: 'Helvetica', 'Times-Roman', 'Courier' (and their bold/italic variants).
 */
function mapWebFontToPdfFont(fontFamily: string | undefined): string {
  if (!fontFamily) return 'Helvetica';
  if (fontFamily.includes('Times') || (fontFamily.includes('serif') && !fontFamily.includes('sans'))) return 'Times-Roman';
  if (fontFamily.includes('Mono') || fontFamily.includes('Consolas') || fontFamily.includes('Courier')) return 'Courier';
  return 'Helvetica';
}

export async function POST(req: NextRequest) {
  try {
    const { mcs, theme, documentType, accent: accentParam, fontFamily: fontFamilyParam } = (await req.json()) as { mcs?: unknown; theme?: string; documentType?: 'resume' | 'cv'; accent?: string; fontFamily?: string };
    if (!mcs) return NextResponse.json({ error: 'mcs required' }, { status: 400 });

    const data = normalizeMCS(mcs);
    const accent = accentParam ?? (theme === 'Modern' ? '#2d6cdf' : theme === 'Creative' ? '#8a3ffc' : theme === 'Academic' ? '#2f2f2f' : theme === 'Minimal' ? '#111111' : '#ff4d6a');
    const pdfFont = mapWebFontToPdfFont(fontFamilyParam);
    const maxExperience = documentType === 'cv' ? 8 : 4;
    const maxProjects = documentType === 'cv' ? 4 : 2;
    const styles = StyleSheet.create({
      ...baseStyles,
      page: { ...baseStyles.page, fontFamily: pdfFont },
      heading: { ...baseStyles.heading, color: accent },
      name: { ...baseStyles.name, color: accent },
    });

    const doc = React.createElement(
      Document,
      null,
      React.createElement(
        Page,
        { size: 'A4', style: styles.page },
        React.createElement(Text, { style: styles.name }, data.personal.name || 'Resume'),
        React.createElement(
          Text,
          { style: styles.contact },
          [data.personal.title, data.personal.email, data.personal.phone, data.personal.location].filter(Boolean).join(' · ')
        ),
        data.summary
          ? React.createElement(
              View,
              null,
              React.createElement(Text, { style: styles.heading }, 'Summary'),
              React.createElement(Text, null, data.summary)
            )
          : null,
        data.experience.length > 0
          ? React.createElement(
              View,
              null,
              React.createElement(Text, { style: styles.heading }, 'Experience'),
              ...data.experience.slice(0, maxExperience).map((exp, idx) =>
                React.createElement(
                  View,
                  { key: `${exp.company}-${idx}` },
                  React.createElement(
                    View,
                    { style: styles.roleLine },
                    React.createElement(Text, { style: styles.role }, `${exp.role} — ${exp.company}`),
                    React.createElement(Text, null, [exp.startDate, exp.current ? 'Present' : exp.endDate].filter(Boolean).join(' — '))
                  ),
                  exp.location ? React.createElement(Text, { style: styles.meta }, exp.location) : null,
                  ...(exp.bullets ?? []).map((b, bulletIndex) => React.createElement(Text, { key: `${idx}-${bulletIndex}`, style: styles.bullet }, `• ${b}`))
                )
              )
            )
          : null,
        data.education.length > 0
          ? React.createElement(
              View,
              null,
              React.createElement(Text, { style: styles.heading }, 'Education'),
              ...data.education.map((edu, idx) =>
                React.createElement(Text, { key: `${edu.institution}-${idx}` }, `${edu.institution} · ${[edu.degree, edu.field].filter(Boolean).join(' in ')}`)
              )
            )
          : null,
        data.skills.length > 0
          ? React.createElement(
              View,
              null,
              React.createElement(Text, { style: styles.heading }, 'Skills'),
              React.createElement(
                View,
                { style: styles.skillWrap },
                ...data.skills.map((s, idx) =>
                  React.createElement(
                    View,
                    { key: `${s.name}-${idx}`, style: styles.skillPill },
                    React.createElement(Text, null, s.name)
                  )
                )
              )
            )
          : null,
        (data.projects ?? []).length > 0
          ? React.createElement(
              View,
              null,
              React.createElement(Text, { style: styles.heading }, 'Projects'),
              ...(data.projects ?? []).slice(0, maxProjects).map((project, idx) =>
                React.createElement(Text, { key: `${project.name}-${idx}` }, `${project.name}${project.description ? ` — ${project.description}` : ''}`)
              )
            )
          : null
      )
    );

    const blob = await pdf(doc).toBlob();
    const arrayBuffer = await blob.arrayBuffer();

    return new NextResponse(arrayBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="resume.pdf"',
      },
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'PDF export failed' }, { status: 500 });
  }
}
