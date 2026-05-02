import Link from 'next/link';

export default function ThemesPage() {
  return (
    <div className="cl-wrap">
      <div className="card-lo">
        <h4>Themes moved</h4>
        <p>The theme picker is now part of the Export page.</p>
        <Link href="/export" className="btn-primary">Go to Export</Link>
      </div>
    </div>
  );
}
