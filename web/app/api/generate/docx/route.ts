import { NextRequest, NextResponse } from 'next/server';
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';
import { normalizeMCS } from '@/lib/mcs';

export async function POST(req: NextRequest) {
  try {
    const { mcs, theme, documentType } = (await req.json()) as { mcs?: unknown; theme?: string; documentType?: 'resume' | 'cv' };
    if (!mcs) return NextResponse.json({ error: 'mcs required' }, { status: 400 });

    const data = normalizeMCS(mcs);
    const accent = theme === 'Modern' ? '2D6CDF' : theme === 'Creative' ? '8A3FFC' : theme === 'Academic' ? '2F2F2F' : theme === 'Minimal' ? '111111' : 'C12B45';
    const maxExperience = documentType === 'cv' ? 8 : 4;
    const maxProjects = documentType === 'cv' ? 5 : 2;

    const children: Paragraph[] = [
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        children: [new TextRun({ text: data.personal.name || 'Resume', bold: true, color: accent, size: 44 })],
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
      children.push(new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun({ text: 'Summary', color: accent })] }));
      children.push(new Paragraph({ text: data.summary }));
    }

    if (data.experience.length > 0) {
      children.push(new Paragraph({ text: '' }));
      children.push(new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun({ text: 'Experience', color: accent })] }));
      data.experience.slice(0, maxExperience).forEach((exp) => {
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
      children.push(new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun({ text: 'Education', color: accent })] }));
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
      children.push(new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun({ text: 'Skills', color: accent })] }));
      children.push(new Paragraph({ text: data.skills.map((s) => s.name).join(' · ') }));
    }

    if ((data.projects ?? []).length > 0) {
      children.push(new Paragraph({ text: '' }));
      children.push(new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun({ text: 'Projects', color: accent })] }));
      (data.projects ?? []).slice(0, maxProjects).forEach((project) => {
        children.push(new Paragraph({ text: [project.name, project.url].filter(Boolean).join(' · '), heading: HeadingLevel.HEADING_3 }));
        if (project.description) children.push(new Paragraph({ text: project.description }));
      });
    }

    if ((data.languages ?? []).length > 0) {
      children.push(new Paragraph({ text: '' }));
      children.push(new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun({ text: 'Languages', color: accent })] }));
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
