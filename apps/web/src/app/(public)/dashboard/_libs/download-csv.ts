// Client-side CSV download shared by the master Export and per-region "Export report"
// buttons (replaces the previous inline blob duplication).

export type CsvRow = (string | number)[];

const escapeCell = (cell: string | number): string => {
  const s = String(cell);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

export function downloadCsv(filename: string, rows: CsvRow[]): void {
  const csv = rows.map((r) => r.map(escapeCell).join(",")).join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
