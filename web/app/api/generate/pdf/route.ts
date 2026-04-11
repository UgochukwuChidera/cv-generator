import { NextRequest, NextResponse } from 'next/server';
import React from 'react';
import { Document, Page, Text, View, StyleSheet, pdf } from '@react-pdf/renderer';
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

export async function POST(req: NextRequest) {
  try {
    const { mcs } = (await req.json()) as { mcs?: unknown };
    if (!mcs) return NextResponse.json({ error: 'mcs required' }, { status: 400 });

    const data = normalizeMCS(mcs);

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
              ...data.experience.map((exp, idx) =>
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
              React.createElement(Text, null, data.skills.map((s) => s.name).join(' · '))
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
