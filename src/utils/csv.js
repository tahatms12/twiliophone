import { saveAs } from 'file-saver';
import Papa from 'papaparse';

export function exportLog(log, filename) {
  const csv = Papa.unparse(log);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  saveAs(blob, filename);
}
