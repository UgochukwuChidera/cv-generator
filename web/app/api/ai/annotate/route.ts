export const dynamic = 'force-dynamic';

import { NextRequest } from 'next/server';
import { streamText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { normalizeMCS } from '@/lib/mcs';
import { parseAIJson, callAI, type AIProvider } from '@/lib/ai';
import type { Snapshot } from '@nexus/schema';

const PROVIDER_CONFIG: Record<string, { baseURL: string; defaultModel: string }> = {
  groq: { baseURL: 'https://api.groq.com/openai/v1', defaultModel: 'llama-3.3-70b-versatile' },
  openai: { baseURL: 'https://api.openai.com/v1', defaultModel: 'gpt-4o-mini' },
  openrouter: { baseURL: 'https://openrouter.ai/api/v1', defaultModel: 'openai/gpt-4o-mini' },
};

export async function POST(req: NextRequest) {
  try {
    const { snapshot, annotation, mcs, provider, model } = (await req.json()) as {
      snapshot?: Snapshot;
      annotation?: string;
      mcs?: unknown;
      provider?: AIProvider;
      model?: string;
    };
    const apiKey = req.headers.get('x-api-key') || '';

    if (!apiKey) {
      return Response.json({ ok: false, error: 'AI API key required' }, { status: 401 });
    }
    if (!snapshot || !annotation) {
      return Response.json({ ok: false, error: 'snapshot and annotation are required' }, { status: 400 });
    }

    const currentMcs = normalizeMCS(mcs || {});
    const prov = (provider || 'openai') as AIProvider;

    const systemPrompt = `You are Nexus, an elite career intelligence AI embedded in a CV builder app.
The user has captured a snapshot of their CV and written an annotation/request about it.

Snapshot context:
- Page: ${snapshot.pageLabel} (${snapshot.page})
- Section reference: ${snapshot.dataPath || 'unknown'}
- Content: ${snapshot.textContent?.slice(0, 2000)}

User annotation: ${annotation}

Response rules:
1. First, address the user's annotation directly in natural language.
2. If the user wants an edit to the CV, include a JSON patch at the end inside \`\`\`json ... \`\`\` that can be merged into the MCS.
3. If they want a score, include a score (0-100) in the JSON patch.
4. If the annotation resolves the issue, set "resolved": true in the JSON.
5. Keep responses concise and actionable.
6. If you can't fulfill the request, explain why clearly.

Output JSON patch format:
\`\`\`json
{
  "summary": "updated summary text",
  "resolved": true,
  "score": 85
}
\`\`\``;

    const isStreamable = prov === 'groq' || prov === 'openai' || prov === 'openrouter';
    let fullText = '';

    if (isStreamable) {
      const cfg = PROVIDER_CONFIG[prov];
      const client = createOpenAI({ apiKey, baseURL: cfg.baseURL });
      const result = streamText({
        model: client(model || cfg.defaultModel),
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Current CV:\n${JSON.stringify(currentMcs)}\n\nSnapshot: ${snapshot.title}\nContent: ${snapshot.textContent}\n\nAnnotation: ${annotation}` },
        ],
        temperature: 0.2,
      });
      for await (const chunk of result.textStream) {
        fullText += chunk;
      }
    } else {
      const response = await callAI(
        { provider: prov, apiKey, model },
        [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Current CV:\n${JSON.stringify(currentMcs)}\n\nSnapshot: ${snapshot.title}\nContent: ${snapshot.textContent}\n\nAnnotation: ${annotation}` },
        ]
      );
      fullText = response.content;
    }

    let mcsPatch: Record<string, unknown> | undefined;
    let resolved = false;
    try {
      const parsed = parseAIJson<Record<string, unknown>>(fullText);
      mcsPatch = parsed;
      if (parsed.resolved === true) resolved = true;
      delete (mcsPatch as Record<string, unknown>)?.resolved;
      delete (mcsPatch as Record<string, unknown>)?.score;
    } catch {
      const jsonMatch = fullText.match(/```json\n([\s\S]*?)\n```/);
      if (jsonMatch) {
        try {
          const parsed = JSON.parse(jsonMatch[1]);
          mcsPatch = parsed;
          if (parsed.resolved === true) resolved = true;
          delete (mcsPatch as Record<string, unknown>)?.resolved;
          delete (mcsPatch as Record<string, unknown>)?.score;
        } catch { /* skip */ }
      }
    }

    const cleanResponse = fullText.replace(/```json\n[\s\S]*?\n```/g, '').trim();

    return Response.json({
      ok: true,
      response: cleanResponse,
      mcsPatch: mcsPatch || undefined,
      resolved,
      action: {
        type: snapshot.dataPath ? 'edit-section' : 'custom',
        params: { section: snapshot.dataPath, annotation },
        status: 'done',
      },
    });
  } catch (error) {
    console.error('Annotate API Error:', error);
    return Response.json(
      { ok: false, error: error instanceof Error ? error.message : 'Annotation failed' },
      { status: 500 }
    );
  }
}
