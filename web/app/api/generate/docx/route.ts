import { NextRequest, NextResponse } from 'next/server';
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';
import { normalizeMCS } from '@/lib/mcs';

export async function POST(req: NextRequest) {
  try {
    const { mcs } = (await req.json()) as { mcs?: unknown };
    if (!mcs) return NextResponse.json({ error: 'mcs required' }, { status: 400 });

    const data = normalizeMCS(mcs);

    const children: Paragraph[] = [
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        children: [new TextRun({ text: data.personal.name || 'Resume', bold: true })],
      }),
      new Paragraph({
        children: [
          new TextRun(
            [data.personal.title, data.personal.email, data.personal.phone, data.personal.location]
              .filter(Boolean)
              .join(' · ')
          ),
        ],
      }),
    ];

    if (data.summary) {
      children.push(new Paragraph({ text: '' }));
      children.push(new Paragraph({ heading: HeadingLevel.HEADING_2, text: 'Summary' }));
      children.push(new Paragraph({ text: data.summary }));
    }

    if (data.experience.length > 0) {
      children.push(new Paragraph({ text: '' }));
      children.push(new Paragraph({ heading: HeadingLevel.HEADING_2, text: 'Experience' }));
      data.experience.forEach((exp) => {
        children.push(new Paragraph({
          children: [
            new TextRun({ text: `${exp.role} — ${exp.company}`, bold: true }),
            new TextRun({ text: `   ${[exp.startDate, exp.current ? 'Present' : exp.endDate].filter(Boolean).join(' — ')}` }),
          ],
        }));
        if (exp.location) children.push(new Paragraph({ children: [new TextRun({ text: exp.location, italics: true })] }));
        (exp.bullets ?? []).forEach((bullet) => children.push(new Paragraph({ text: bullet, bullet: { level: 0 } })));
      });
    }

    if (data.education.length > 0) {
      children.push(new Paragraph({ text: '' }));
      children.push(new Paragraph({ heading: HeadingLevel.HEADING_2, text: 'Education' }));
      data.education.forEach((edu) => {
        children.push(
          new Paragraph({
            children: [new TextRun({ text: edu.institution, bold: true }), new TextRun(` · ${[edu.degree, edu.field].filter(Boolean).join(' in ')}`)],
          })
        );
      });
    }

    if (data.skills.length > 0) {
      children.push(new Paragraph({ text: '' }));
      children.push(new Paragraph({ heading: HeadingLevel.HEADING_2, text: 'Skills' }));
      children.push(new Paragraph({ text: data.skills.map((s) => s.name).join(' · ') }));
    }

    if ((data.projects ?? []).length > 0) {
      children.push(new Paragraph({ text: '' }));
      children.push(new Paragraph({ heading: HeadingLevel.HEADING_2, text: 'Projects' }));
      (data.projects ?? []).forEach((project) => {
        children.push(new Paragraph({ text: [project.name, project.url].filter(Boolean).join(' · '), heading: HeadingLevel.HEADING_3 }));
        if (project.description) children.push(new Paragraph({ text: project.description }));
      });
    }

    if ((data.languages ?? []).length > 0) {
      children.push(new Paragraph({ text: '' }));
      children.push(new Paragraph({ heading: HeadingLevel.HEADING_2, text: 'Languages' }));
      children.push(new Paragraph({ text: (data.languages ?? []).map((l) => [l.language, l.proficiency].filter(Boolean).join(' ')).join(' · ') }));
    }

    const doc = new Document({ sections: [{ properties: {}, children }] });
    const buffer = await Packer.toBuffer(doc);

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': 'attachment; filename="resume.docx"',
      },
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'DOCX export failed' }, { status: 500 });
  }
}
