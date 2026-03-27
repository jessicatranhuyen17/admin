export function toCsv(rows: Record<string, any>[], headers?: string[]) {
  const keys = headers ?? (rows[0] ? Object.keys(rows[0]) : []);
  const escape = (v: any) => {
    const s = String(v ?? "");
    if (/[\n\r,\"]/g.test(s)) return `"${s.replaceAll('"', '""')}"`;
    return s;
  };

  const lines = [keys.join(",")];
  for (const r of rows) {
    lines.push(keys.map((k) => escape(r[k])).join(","));
  }
  return lines.join("\n");
}

export function downloadText(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
