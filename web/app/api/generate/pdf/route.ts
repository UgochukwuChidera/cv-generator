import { NextRequest, NextResponse } from 'next/server';
import React from 'react';
import { Document, Page, Text, View, StyleSheet, pdf } from '@react-pdf/renderer';
import type { MCS } from '@nexus/schema';
import { normalizeMCS } from '@/lib/mcs';

const styles = StyleSheet.create({
  page: { padding: 28, fontSize: 10, fontFamily: 'Helvetica' },
  name: { fontSize: 20, marginBottom: 4 },
  contact: { fontSize: 10, marginBottom: 10, color: '#444' },
  heading: { fontSize: 11, marginTop: 10, marginBottom: 4, textTransform: 'uppercase' },
  roleLine: { display: 'flex', flexDirection: 'row', justifyContent: 'space-between' },
  role: { fontSize: 10, fontWeight: 'bold' },
  meta: { color: '#555', marginBottom: 2 },
  bullet: { marginLeft: 8, marginBottom: 2 },
});

function ResumeDoc({ mcs }: { mcs: MCS }) {
  return React.createElement(
    Document,
    null,
    React.createElement(
      Page,
      { size: 'A4', style: styles.page },
      React.createElement(Text, { style: styles.name }, mcs.personal.name || 'Resume'),
      React.createElement(
        Text,
        { style: styles.contact },
        [mcs.personal.title, mcs.personal.email, mcs.personal.phone, mcs.personal.location].filter(Boolean).join(' · ')
      ),
      mcs.summary ? React.createElement(View, null, React.createElement(Text, { style: styles.heading }, 'Summary'), React.createElement(Text, null, mcs.summary)) : null,
      mcs.experience.length > 0
        ? React.createElement(
            View,
            null,
            React.createElement(Text, { style: styles.heading }, 'Experience'),
            ...mcs.experience.map((exp, idx) =>
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
                ...(exp.bullets ?? []).map((b, bIdx) => React.createElement(Text, { key: `${idx}-${bIdx}`, style: styles.bullet }, `• ${b}`))
              )
            )
          )
        : null,
      mcs.education.length > 0
        ? React.createElement(
            View,
            null,
            React.createElement(Text, { style: styles.heading }, 'Education'),
            ...mcs.education.map((edu, idx) =>
              React.createElement(Text, { key: `${edu.institution}-${idx}` }, `${edu.institution} · ${[edu.degree, edu.field].filter(Boolean).join(' in ')}`)
            )
          )
        : null,
      mcs.skills.length > 0
        ? React.createElement(
            View,
            null,
            React.createElement(Text, { style: styles.heading }, 'Skills'),
            React.createElement(Text, null, mcs.skills.map((s) => s.name).join(' · '))
          )
        : null
    )
  );
}

export async function POST(req: NextRequest) {
  try {
    const { mcs } = (await req.json()) as { mcs?: unknown };
    if (!mcs) return NextResponse.json({ error: 'mcs required' }, { status: 400 });

    const normalized = normalizeMCS(mcs);
    const buffer = await pdf(React.createElement(ResumeDoc, { mcs: normalized })).toBuffer();

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="resume.pdf"',
      },
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'PDF export failed' }, { status: 500 });
  }
}
