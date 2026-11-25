export function toCsv<T>(rows: T[], keys: (keyof T)[], headers: string[]) {
  const escape = (v:unknown) => `"${String(v??'').replaceAll('"','""')}"`;
  return '\uFEFF'+headers.join(',')+'\r\n'+rows.map(row=>keys.map(k=>escape(row[k])).join(',')).join('\r\n');
}
export function downloadFile(content: string, filename: string, type: string) {
  const url = URL.createObjectURL(new Blob([content],{type}));
  const link = document.createElement('a'); link.href=url; link.download=filename; link.click();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
}
