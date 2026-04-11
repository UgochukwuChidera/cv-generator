'use client';

const FORMATS = ['PDF', 'DOCX', 'HTML', 'JSON', 'YAML'] as const;

export type ExportFormat = typeof FORMATS[number];

export default function FormatPicker({
  value,
  onChange,
}: {
  value: ExportFormat;
  onChange: (format: ExportFormat) => void;
}) {
  return (
    <div className="fmt-list">
      {FORMATS.map((format) => (
        <label key={format} className="fmt-label">
          <input type="radio" name="format" checked={value === format} onChange={() => onChange(format)} />
          <span>{format}</span>
        </label>
      ))}
    </div>
  );
}
