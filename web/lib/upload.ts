import yaml from 'js-yaml';
import { normalizeMCS } from './mcs';

export type UploadedPayload = {
  name: string;
  mimeType?: string;
  base64: string;
};

const PDF_TEXT_CHUNK_LIMIT = 2000;

function decodeBase64(base64: string): Uint8Array {
  return Uint8Array.from(Buffer.from(base64, 'base64'));
}

function decodeUtf8(data: Uint8Array): string {
  return new TextDecoder('utf-8', { fatal: false }).decode(data);
}

function sanitizeExtractedText(text: string): string {
  return text
    .replace(/[<>]/g, ' ')
    .replace(/\bscript\b/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function tryParseStructured(text: string): string {
  const trimmed = text.trim();
  if (!trimmed) return '';

  try {
    if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
      const parsed = JSON.parse(trimmed);
      const mcs = normalizeMCS(parsed);
      return JSON.stringify(mcs);
    }
  } catch {
    // continue
  }

  try {
    const parsed = yaml.load(trimmed);
    if (parsed && typeof parsed === 'object') {
      const mcs = normalizeMCS(parsed);
      return JSON.stringify(mcs);
    }
  } catch {
    // continue
  }

  return sanitizeExtractedText(trimmed);
}

function extractLikelyPdfText(binaryAsString: string): string {
  const chunks: string[] = [];
  const regex = /\(([^()]*)\)/g;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(binaryAsString)) && chunks.length < PDF_TEXT_CHUNK_LIMIT) {
    const candidate = match[1].replace(/\\[nrt]/g, ' ').replace(/\\\d{3}/g, ' ');
    if (/[A-Za-z]{2,}/.test(candidate)) chunks.push(candidate);
  }
  return sanitizeExtractedText(chunks.join(' '));
}

function extractLikelyDocxText(binaryAsString: string): string {
  const xmlPieces = binaryAsString.match(/<w:t[^>]*>[^<]+<\/w:t>/g) ?? [];
  if (xmlPieces.length > 0) {
    const content = xmlPieces
      .map((piece) => {
        const start = piece.indexOf('>');
        const end = piece.lastIndexOf('<');
        return start >= 0 && end > start ? piece.slice(start + 1, end).trim() : piece.trim();
      })
      .filter(Boolean)
      .join(' ');
    return sanitizeExtractedText(content);
  }

  const fallback = binaryAsString.replace(/[^\x20-\x7E\n]/g, ' ');
  return sanitizeExtractedText(fallback);
}

export function extractTextFromUpload(file: UploadedPayload): string {
  const data = decodeBase64(file.base64);
  const lower = file.name.toLowerCase();

  if (lower.endsWith('.txt') || lower.endsWith('.json') || lower.endsWith('.yaml') || lower.endsWith('.yml')) {
    const text = decodeUtf8(data);
    return tryParseStructured(text);
  }

  const binary = Buffer.from(data).toString('latin1');

  if (lower.endsWith('.pdf') || file.mimeType === 'application/pdf') {
    return extractLikelyPdfText(binary);
  }

  if (
    lower.endsWith('.docx') ||
    file.mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ) {
    return extractLikelyDocxText(binary);
  }

  return sanitizeExtractedText(decodeUtf8(data));
}
