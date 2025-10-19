import { read, utils } from 'xlsx';
import Papa from 'papaparse';

export interface ParsedFileData {
  headers: string[];
  previewData: string[][];
  allData: string[][];
  fileName: string;
}

export const parseFile = (file: File): Promise<ParsedFileData> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    const fileNameWithoutExt = file.name.replace(/\.[^/.]+$/, "");

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        if (!data) {
          return reject(new Error("Gagal membaca data dari file."));
        }

        let headers: string[] = [];
        let rows: string[][] = [];

        if (fileExtension === 'csv') {
          const result = Papa.parse<string[]>(data as string, { header: false, skipEmptyLines: true });
          if (result.errors.length > 0) {
              console.error("Kesalahan parsing CSV:", result.errors);
              const firstError = result.errors[0].message;
              return reject(new Error(`Gagal mem-parsing CSV: ${firstError}`));
          }
          if (result.data.length > 0) {
            headers = result.data[0].map(h => String(h || ''));
            rows = result.data.slice(1);
          }
        } else if (fileExtension === 'xlsx' || fileExtension === 'xls') {
          const workbook = read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          if (!sheetName) {
            return reject(new Error("Tidak ada sheet yang ditemukan di dalam file Excel."));
          }
          const worksheet = workbook.Sheets[sheetName];
          const json = utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
          if (json.length > 0) {
            headers = json[0].map(h => String(h || ''));
            rows = json.slice(1);
          }
        } else {
          return reject(new Error("Tipe file tidak didukung. Silakan pilih file CSV atau Excel."));
        }
        
        const nonEmptyRows = rows.filter(row => row.some(cell => cell != null && String(cell).trim() !== ''));
        
        if (headers.length > 0 && nonEmptyRows.length > 0) {
          resolve({ 
            headers, 
            allData: nonEmptyRows.map(row => row.map(cell => String(cell || ''))),
            previewData: nonEmptyRows.slice(0, 10).map(row => row.map(cell => String(cell || ''))),
            fileName: fileNameWithoutExt 
          });
        } else {
          reject(new Error("File yang dipilih kosong atau tidak memiliki header dan data."));
        }
      } catch (error) {
        console.error("Kesalahan saat mem-parsing file:", error);
        const errorMessage = error instanceof Error ? error.message : "Terjadi kesalahan yang tidak diketahui.";
        reject(new Error(`Gagal memproses file: ${errorMessage}`));
      }
    };

    reader.onerror = (e) => {
      console.error("FileReader error:", e);
      reject(new Error("Gagal membaca file dengan FileReader."));
    };

    if (fileExtension === 'csv') {
      reader.readAsText(file);
    } else if (fileExtension === 'xlsx' || fileExtension === 'xls') {
      reader.readAsArrayBuffer(file);
    } else {
       reject(new Error("Tipe file tidak didukung."));
    }
  });
};