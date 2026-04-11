import { NextRequest, NextResponse } from 'next/server';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import type { MCS } from '@nexus/schema';

export async function POST(req: NextRequest) {
  try {
    const { mcs } = (await req.json()) as { mcs: MCS };
    if (!mcs) return NextResponse.json({ error: 'mcs required' }, { status: 400 });

    const sections = [
      new Paragraph({ children: [new TextRun({ text: mcs.personal?.name || 'Resume', bold: true, size: 32 })] }),
      new Paragraph({ children: [new TextRun({ text: mcs.personal?.title || '', size: 22 })] }),
      new Paragraph({ children: [new TextRun({ text: `${mcs.personal?.email || ''} ${mcs.personal?.location || ''}`.trim(), size: 20 })] }),
      new Paragraph({ text: '' }),
      new Paragraph({ children: [new TextRun({ text: 'Experience', bold: true, size: 24 })] }),
      ...mcs.experience.flatMap((exp) => [
        new Paragraph({ children: [new TextRun({ text: `${exp.role} — ${exp.company}`, bold: true, size: 22 })] }),
        ...exp.bullets.map((b) => new Paragraph({ text: `• ${b}` })),
      ]),
      new Paragraph({ text: '' }),
      new Paragraph({ children: [new TextRun({ text: 'Skills', bold: true, size: 24 })] }),
      new Paragraph({ text: mcs.skills.map((s) => s.name).join(', ') }),
    ];

    const doc = new Document({ sections: [{ properties: {}, children: sections }] });
    const buffer = await Packer.toBuffer(doc);

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': 'attachment; filename=\"resume.docx\"',
      },
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
