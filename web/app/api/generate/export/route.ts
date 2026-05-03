import { NextRequest, NextResponse } from 'next/server';
import yaml from 'js-yaml';
import { normalizeMCS } from '@/lib/mcs';
import { mcsToHtml } from '@/lib/render';

export async function POST(req: NextRequest) {
  try {
    const { mcs, format, theme, documentType, accent, fontFamily } = (await req.json()) as {
      mcs?: unknown;
      format?: 'JSON' | 'YAML' | 'HTML';
      theme?: string;
      documentType?: 'resume' | 'cv';
      accent?: string;
      fontFamily?: string;
    };

    if (!mcs || !format) {
      return NextResponse.json({ error: 'mcs and format are required' }, { status: 400 });
    }

    const normalized = normalizeMCS(mcs);

    if (format === 'JSON') {
      return new NextResponse(JSON.stringify(normalized, null, 2), {
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': 'attachment; filename="resume.json"',
        },
      });
    }

    if (format === 'YAML') {
      return new NextResponse(yaml.dump(normalized), {
        headers: {
          'Content-Type': 'application/x-yaml',
          'Content-Disposition': 'attachment; filename="resume.yaml"',
        },
      });
    }

    const html = mcsToHtml(normalized, theme || 'Professional', documentType === 'cv' ? 'cv' : 'resume', accent, fontFamily);
    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': 'attachment; filename="resume.html"',
      },
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Export failed' }, { status: 500 });
  }
}
