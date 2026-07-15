import Papa from 'papaparse';
import { ParsedCoordinates, ParsedVTSResult, VTSMetadata, VesselRecord } from '../types/vts';

// Fungsi konversi format DDM (Degrees and Decimal Minutes) ke DD (Decimal Degrees)
export function parseDDM(coordStr: string): ParsedCoordinates | null {
  if (!coordStr) return null;

  // Format pemisah bisa garis miring atau spasi
  const parts = coordStr.split('/');
  if (parts.length !== 2) return null;

  const rawLat = parts[0].trim();
  const rawLng = parts[1].trim();

  const convertPart = (part: string) => {
    // Normalisasi koma ke titik, hapus spasi berlebih
    const cleaned = part.replace(/,/g, '.').replace(/\s+/g, '');

    // Menangkap: Derajat, Menit, dan Cardinal Direction
    // Mendukung trailing tick setelah menit: e.g. 05'18.7'S atau 05'32,000S
    const match = cleaned.match(/^(\d+)'([\d.]+)'?([NSEWnsew])$/i);
    if (!match) return null;

    const degrees = parseInt(match[1], 10);
    const minutes = parseFloat(match[2]);
    const direction = match[3].toUpperCase();

    if (isNaN(degrees) || isNaN(minutes)) return null;

    let decimal = degrees + (minutes / 60);

    // Negative sign for South and West
    if (direction === 'S' || direction === 'W') {
      decimal = -decimal;
    }

    return {
      decimal,
      degrees,
      minutes,
      direction
    };
  };

  const latResult = convertPart(rawLat);
  const lngResult = convertPart(rawLng);

  if (!latResult || !lngResult) return null;

  // Validasi cardinal direction
  if (latResult.direction !== 'S' && latResult.direction !== 'N') return null;
  if (lngResult.direction !== 'E' && lngResult.direction !== 'W') return null;

  return {
    lat: latResult.decimal,
    lng: lngResult.decimal,
    rawLat: `${latResult.degrees}° ${latResult.minutes.toFixed(3)}' ${latResult.direction}`,
    rawLng: `${lngResult.degrees}° ${lngResult.minutes.toFixed(3)}' ${lngResult.direction}`,
    latFormatted: `${latResult.decimal.toFixed(6)}°`,
    lngFormatted: `${lngResult.decimal.toFixed(6)}°`
  };
}

// Helper to determine movement direction from Remarks (Keterangan)
export const getMovementType = (remarks: string) => {
  const r = remarks?.toUpperCase() || '';
  if (r.startsWith('IN')) return 'IN';
  if (r.startsWith('OUT')) return 'OUT';
  return 'OTHER';
};

// Fungsi Fetcher untuk mengambil dan mem-parsing CSV secara mentah (header: false)
export const fetcher = (url: string): Promise<ParsedVTSResult> => {
  // Menambahkan cache-buster timestamp agar browser/CDN tidak menyajikan cache lama
  const fetchUrl = `${url}&t=${Date.now()}`;
  return fetch(fetchUrl, {
    cache: 'no-store',
  })
    .then((res) => {
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('text/html')) {
        throw new Error('Received HTML instead of CSV. Google Sheets may be offline or restricted.');
      }
      return res.text();
    })
    .then((csvText) => {
      const parsed = Papa.parse<string[]>(csvText, { header: false, skipEmptyLines: true });
      const rows = parsed.data;

      const metadata: VTSMetadata = {
        sektor: '',
        operatorVts: '',
        vtso: '',
        waktu: '',
        tanggal: '',
        shift: '',
        tahun: '',
        supervisor: '',
        nip: '',
      };

      const vessels: VesselRecord[] = [];

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i] || [];
        const cleanedRow = row.map((cell) => (cell || '').trim());

        // Cari metadata Sektor & Operator
        const isSektorHeader = cleanedRow.some((cell) => cell.toLowerCase() === 'sektor');
        if (isSektorHeader) {
          const opIndex = cleanedRow.findIndex((cell) => cell.toLowerCase() === 'operator vts');
          if (opIndex !== -1 && cleanedRow[opIndex + 1]) {
            metadata.operatorVts = cleanedRow[opIndex + 1];
          }

          const nextRow = (rows[i + 1] || []).map((cell) => (cell || '').trim());
          if (nextRow.length > 0) {
            const sectorIndex = nextRow.findIndex((cell) => cell.toLowerCase() === 'sector');
            if (sectorIndex !== -1 && nextRow[sectorIndex + 1]) {
              metadata.sektor = nextRow[sectorIndex + 1];
            }
            const vtsoIndex = nextRow.findIndex((cell) => cell.toLowerCase() === 'vtso');
            if (vtsoIndex !== -1 && nextRow[vtsoIndex + 1]) {
              metadata.vtso = nextRow[vtsoIndex + 1];
            }
            const timeIndex = nextRow.findIndex((cell) => cell.toLowerCase() === 'time');
            if (timeIndex !== -1 && nextRow[timeIndex + 1]) {
              metadata.waktu = nextRow[timeIndex + 1];
            }
          }
        }

        // Cari metadata Tanggal & Tahun & Shift
        const isTanggalHeader = cleanedRow.some((cell) => cell.toLowerCase() === 'tanggal');
        if (isTanggalHeader) {
          const shiftMatch = cleanedRow.find((cell) => cell.toLowerCase().includes('shift'));
          if (shiftMatch) {
            metadata.shift = shiftMatch;
          }

          const nextRow = (rows[i + 1] || []).map((cell) => (cell || '').trim());
          if (nextRow.length > 0) {
            const dateIndex = nextRow.findIndex((cell) => cell.toLowerCase() === 'date');
            if (dateIndex !== -1 && nextRow[dateIndex + 1]) {
              metadata.tanggal = nextRow[dateIndex + 1];
            }
            const yearIndex = nextRow.findIndex((cell) => cell.toLowerCase() === 'year');
            if (yearIndex !== -1 && nextRow[yearIndex + 1]) {
              metadata.tahun = yearIndex !== -1 && nextRow[yearIndex + 1] ? nextRow[yearIndex + 1] : '';
            }
          }
        }

        // Ekstraksi baris kapal
        if (cleanedRow.length >= 15) {
          const noCell = cleanedRow[0];
          const timeCell = cleanedRow[1];

          const noVal = parseInt(noCell, 10);
          const isNoLike = !isNaN(noVal) && noVal > 0;
          const isTimeLike = timeCell.toLowerCase().includes('lt') || /^\d{4}$/.test(timeCell);

          if (isTimeLike && isNoLike) {
            vessels.push({
              no: noCell,
              waktu: timeCell,
              namaKapal: cleanedRow[2] || '',
              mmsi: cleanedRow[3] || '',
              asal: cleanedRow[4] || '',
              tujuan: cleanedRow[5] || '',
              eta: cleanedRow[6] || '',
              waktuSandarLabuh: cleanedRow[7] || '',
              posisiLabuh: cleanedRow[8] || '',
              loa: cleanedRow[9] || '',
              gt: cleanedRow[10] || '',
              draft: cleanedRow[11] || '',
              muatan: cleanedRow[12] || '',
              agen: cleanedRow[13] || '',
              keterangan: cleanedRow[14] || '',
            });
          }
        }

        // Ekstraksi Supervisor / NIP di bagian bawah
        const nipIndex = cleanedRow.findIndex((cell) => cell.toLowerCase().includes('nip.'));
        if (nipIndex !== -1) {
          metadata.nip = cleanedRow[nipIndex].replace(/nip\.\s*/i, '');
          const prevRow = (rows[i - 1] || []).map((cell) => (cell || '').trim());
          if (prevRow.length > 0) {
            metadata.supervisor = prevRow[nipIndex] || prevRow.find((cell) => cell !== '') || '';
          }
        }
      }

      return { metadata, vessels };
    });
};
