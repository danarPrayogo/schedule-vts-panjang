'use client';

import React, { useState, useMemo, useEffect } from 'react';
import useSWR from 'swr';
import Papa from 'papaparse';

// Tipe data untuk metadata VTS
interface VTSMetadata {
  sektor: string;
  operatorVts: string;
  vtso: string;
  waktu: string;
  tanggal: string;
  shift: string;
  tahun: string;
  supervisor: string;
  nip: string;
}

// Tipe data untuk rekaman kapal
interface VesselRecord {
  no: string;
  waktu: string;
  namaKapal: string;
  mmsi: string;
  asal: string;
  tujuan: string;
  eta: string;
  waktuSandarLabuh: string;
  posisiLabuh: string;
  loa: string;
  gt: string;
  draft: string;
  muatan: string;
  agen: string;
  keterangan: string;
}

interface ParsedVTSResult {
  metadata: VTSMetadata;
  vessels: VesselRecord[];
}

// Helper to determine movement direction from Remarks (Keterangan)
const getMovementType = (remarks: string) => {
  const r = remarks?.toUpperCase() || '';
  if (r.startsWith('IN')) return 'IN';
  if (r.startsWith('OUT')) return 'OUT';
  return 'OTHER';
};

// Fungsi Fetcher untuk mengambil dan mem-parsing CSV secara mentah (header: false)
const fetcher = (url: string): Promise<ParsedVTSResult> => {
  // Menambahkan cache-buster timestamp agar browser/CDN tidak menyajikan cache lama
  const fetchUrl = `${url}&t=${Date.now()}`;
  return fetch(fetchUrl)
    .then((res) => res.text())
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
          const timeCell = cleanedRow[0];
          const noCell = cleanedRow[14];

          const noVal = parseInt(noCell, 10);
          const isNoLike = !isNaN(noVal) && noVal > 0;
          const isTimeLike = timeCell.toLowerCase().includes('lt') || /^\d{4}$/.test(timeCell);

          if (isTimeLike && isNoLike) {
            vessels.push({
              waktu: timeCell,
              namaKapal: cleanedRow[1] || '',
              mmsi: cleanedRow[2] || '',
              asal: cleanedRow[3] || '',
              tujuan: cleanedRow[4] || '',
              eta: cleanedRow[5] || '',
              waktuSandarLabuh: cleanedRow[6] || '',
              posisiLabuh: cleanedRow[7] || '',
              loa: cleanedRow[8] || '',
              gt: cleanedRow[9] || '',
              draft: cleanedRow[10] || '',
              muatan: cleanedRow[11] || '',
              agen: cleanedRow[12] || '',
              keterangan: cleanedRow[13] || '',
              no: noCell,
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

export default function VTSBoard() {
  const sheetUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTx-AGlee7IojZ49KYMcdJSaPzaaWfQ-M95w5o8p6ujMmccW0gK9TAXq_sczAzeTR282ShHeKO6D-zx/pub?output=csv';

  const { data, error, isLoading, mutate } = useSWR<ParsedVTSResult>(sheetUrl, fetcher, {
    refreshInterval: 10000, // Refresh every 10 seconds
  });

  // State untuk Filter & Pencarian
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'IN' | 'OUT' | 'ANCHOR'>('ALL');
  const [agentFilter, setAgentFilter] = useState('ALL');
  const [cargoFilter, setCargoFilter] = useState('ALL');
  const [selectedVessel, setSelectedVessel] = useState<VesselRecord | null>(null);

  // Real-time local clock
  const [timeStr, setTimeStr] = useState('');
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' LT');
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Filter unique lists
  const uniqueAgents = useMemo(() => {
    if (!data?.vessels) return [];
    const agents = data.vessels.map(v => v.agen.trim()).filter(Boolean);
    return Array.from(new Set(agents)).sort();
  }, [data]);

  const uniqueCargos = useMemo(() => {
    if (!data?.vessels) return [];
    const cargos = data.vessels.map(v => v.muatan.trim()).filter(Boolean);
    return Array.from(new Set(cargos)).sort();
  }, [data]);

  // Main filter logic
  const filteredVessels = useMemo(() => {
    if (!data?.vessels) return [];
    return data.vessels.filter((vessel) => {
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch =
        vessel.namaKapal.toLowerCase().includes(searchLower) ||
        vessel.mmsi.toLowerCase().includes(searchLower) ||
        vessel.asal.toLowerCase().includes(searchLower) ||
        vessel.tujuan.toLowerCase().includes(searchLower) ||
        vessel.muatan.toLowerCase().includes(searchLower) ||
        vessel.agen.toLowerCase().includes(searchLower) ||
        vessel.keterangan.toLowerCase().includes(searchLower);

      const moveType = getMovementType(vessel.keterangan);
      const isAnchor =
        vessel.waktuSandarLabuh.toUpperCase().includes('ANCHOR') ||
        vessel.waktuSandarLabuh.toUpperCase().includes('ANCOR');

      let matchesStatus = true;
      if (statusFilter === 'IN') matchesStatus = moveType === 'IN';
      else if (statusFilter === 'OUT') matchesStatus = moveType === 'OUT';
      else if (statusFilter === 'ANCHOR') matchesStatus = isAnchor;

      const matchesAgent = agentFilter === 'ALL' || vessel.agen.trim() === agentFilter;
      const matchesCargo = cargoFilter === 'ALL' || vessel.muatan.trim() === cargoFilter;

      return matchesSearch && matchesStatus && matchesAgent && matchesCargo;
    });
  }, [data, searchQuery, statusFilter, agentFilter, cargoFilter]);

  // Summary Metrics
  const stats = useMemo(() => {
    const total = data?.vessels?.length || 0;
    if (!data?.vessels) return { total, arrivals: 0, departures: 0, anchored: 0, totalGt: 0 };
    
    let arrivals = 0;
    let departures = 0;
    let anchored = 0;
    let totalGt = 0;

    data.vessels.forEach((v) => {
      const move = getMovementType(v.keterangan);
      if (move === 'IN') arrivals++;
      if (move === 'OUT') departures++;

      if (
        v.waktuSandarLabuh.toUpperCase().includes('ANCHOR') ||
        v.waktuSandarLabuh.toUpperCase().includes('ANCOR')
      ) {
        anchored++;
      }

      // Sum GT values (handling combo like 225/4338)
      if (v.gt) {
        if (v.gt.includes('/')) {
          v.gt.split('/').forEach((g) => {
            const parsedG = parseInt(g.trim(), 10);
            if (!isNaN(parsedG)) totalGt += parsedG;
          });
        } else {
          const parsedG = parseInt(v.gt, 10);
          if (!isNaN(parsedG)) totalGt += parsedG;
        }
      }
    });

    return { total, arrivals, departures, anchored, totalGt };
  }, [data]);

  // Dimension Formatter for Tug & Barge
  const formatDimension = (val: string, type: 'LOA' | 'GT' | 'DRAFT') => {
    if (!val || val === '0') return <span className="text-slate-500">-</span>;
    if (val.includes('/')) {
      const [tb, tk] = val.split('/');
      return (
        <div className="flex flex-col text-[11px] leading-tight">
          <span className="text-slate-300 font-semibold truncate">TB: {tb.trim()}{type === 'LOA' ? ' m' : type === 'GT' ? ' GT' : ' m'}</span>
          <span className="text-slate-400 truncate">TK: {tk.trim()}{type === 'LOA' ? ' m' : type === 'GT' ? ' GT' : ' m'}</span>
        </div>
      );
    }
    return (
      <span className="font-mono text-sm text-slate-200">
        {val}
        <span className="text-xs text-slate-400 ml-0.5">
          {type === 'LOA' ? 'm' : type === 'GT' ? 'GT' : 'm'}
        </span>
      </span>
    );
  };

  // Google Maps coordinate query link
  const getMapLink = (pos: string) => {
    if (!pos || pos === 'ON POSITION' || pos === 'ANCHORAGE UP' || pos === 'OUT') return null;
    const cleanPos = pos.replace(/'/g, '°').replace('/', ' ');
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(cleanPos)}`;
  };

  // Render remarks badges
  const renderRemarksBadges = (remarks: string) => {
    if (!remarks) return null;
    const parts = remarks.split('/');
    return (
      <div className="flex flex-wrap gap-1">
        {parts.map((part, index) => {
          let bgClass = 'bg-slate-800 text-slate-300 border border-slate-700';
          if (part.toUpperCase() === 'IN') {
            bgClass = 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold';
          } else if (part.toUpperCase() === 'OUT') {
            bgClass = 'bg-sky-500/20 text-sky-300 border border-sky-500/30 font-bold';
          } else if (part.toUpperCase() === 'YES') {
            bgClass = 'bg-violet-500/20 text-violet-300 border border-violet-500/30';
          }
          return (
            <span key={index} className={`text-[11px] px-2 py-0.5 rounded-full uppercase tracking-wider ${bgClass}`}>
              {part}
            </span>
          );
        })}
      </div>
    );
  };

  // Render Cargo Badge
  const renderCargoBadge = (cargo: string) => {
    if (!cargo || cargo.toUpperCase() === 'NIL') {
      return <span className="text-slate-500 italic text-sm">Nil</span>;
    }
    
    const c = cargo.toUpperCase();
    let colorClass = 'bg-slate-800 text-slate-300 border border-slate-700';
    if (c.includes('COAL') || c.includes('BATUBARA')) {
      colorClass = 'bg-amber-500/10 text-amber-300 border border-amber-500/20';
    } else if (c.includes('CPO') || c.includes('BUNGKIL')) {
      colorClass = 'bg-yellow-500/10 text-yellow-200 border border-yellow-500/20';
    } else if (c.includes('SOLAR') || c.includes('BIOSOLAR') || c.includes('LPG') || c.includes('B40')) {
      colorClass = 'bg-purple-500/10 text-purple-300 border border-purple-500/20';
    }
    
    return (
      <span className={`text-xs px-2 py-0.5 rounded font-medium border uppercase ${colorClass}`}>
        {cargo}
      </span>
    );
  };

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-center items-center p-6">
        <div className="bg-red-500/10 border border-red-500/30 p-6 rounded-xl max-w-md text-center">
          <svg className="w-12 h-12 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h2 className="text-xl font-bold mb-2">Koneksi Gagal</h2>
          <p className="text-slate-400 text-sm mb-4">Gagal memuat data dari Google Sheets. Pastikan publikasi CSV sheet aktif.</p>
          <button onClick={() => mutate()} className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded transition-colors text-sm">
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070b13] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(16,40,78,0.25),rgba(255,255,255,0))] text-white font-sans selection:bg-cyan-500/30 selection:text-cyan-300">
      
      {/* Top Banner Status */}
      <div className="bg-slate-900/60 border-b border-slate-800/80 backdrop-blur-md px-4 py-2 text-xs flex justify-between items-center text-slate-400">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span>VTS PANJANG LIVE STREAM</span>
        </div>
        <div className="flex items-center gap-3">
          <span>Polling Auto-Refresh</span>
          <button 
            onClick={() => mutate()} 
            className="text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 12H18.5" />
            </svg>
            SINKRONKAN
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-6">

        {/* Header Dashboard */}
        <header className="bg-slate-900/40 border border-slate-800/60 rounded-2xl p-6 backdrop-blur-md shadow-xl flex flex-col md:flex-row md:justify-between md:items-center gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-1 rounded-xl bg-white/5 border border-white/10 shadow-lg">
                <img src="/logo-navigasi.png" alt="Logo Navigasi" className="w-12 h-12 object-contain" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                  VTS PANJANG TRAFFIC BOARD
                </h1>
              </div>
            </div>
            

          </div>

          <div className="text-left md:text-right bg-slate-950/40 border border-slate-800/60 p-4 rounded-xl md:min-w-[200px] flex flex-col justify-center">
            <span className="text-xs text-slate-500 uppercase tracking-widest font-mono">WAKTU SEKARANG</span>
            <span className="text-2xl md:text-3xl font-bold font-mono text-cyan-300 drop-shadow-[0_0_10px_rgba(34,211,238,0.2)] mt-1">
              {timeStr || '00:00:00 LT'}
            </span>
            <span className="text-[10px] text-slate-500 font-mono mt-1 uppercase">SINKRONISASI AKTIF</span>
          </div>
        </header>



        {/* Vessel Table (Desktop Mode) */}
        {isLoading ? (
          <div className="space-y-4">
            <div className="h-96 bg-slate-900/30 border border-slate-800/60 rounded-2xl animate-pulse"></div>
          </div>
        ) : (
          <section className="bg-slate-900/20 border border-slate-800/60 rounded-2xl overflow-hidden backdrop-blur-md shadow-xl hidden lg:block">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[1000px]">
                <thead>
                  <tr className="bg-slate-900/80 border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                    <th className="p-4 w-16 text-center">No</th>
                    <th className="p-4 w-28">Waktu</th>
                    <th className="p-4 w-72">Nama Kapal / Call Sign</th>
                    <th className="p-4 w-44">Asal</th>
                    <th className="p-4 w-44">Tujuan</th>
                    <th className="p-4 w-36">ETA</th>
                    <th className="p-4 w-48">Waktu Sandar / Labuh</th>
                    <th className="p-4 w-40">Keterangan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-sm">
                  {filteredVessels.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-12 text-center text-slate-500 italic">
                        Tidak ada kapal yang sesuai dengan filter pencarian.
                      </td>
                    </tr>
                  ) : (
                    filteredVessels.map((vessel, index) => (
                      <tr
                        key={vessel.no || index}
                        onClick={() => setSelectedVessel(vessel)}
                        className={`hover:bg-cyan-500/5 transition-colors cursor-pointer group ${
                          index % 2 === 0 ? 'bg-slate-900/10' : 'bg-slate-900/30'
                        }`}
                      >
                        <td className="p-4 text-center text-slate-500 font-mono font-bold text-xs">{vessel.no}</td>
                        <td className="p-4 font-mono font-medium text-cyan-400/90 text-xs">{vessel.waktu}</td>
                        <td className="p-4">
                          <div className="font-bold text-white group-hover:text-cyan-300 transition-colors uppercase tracking-wide">
                            {vessel.namaKapal.split('/')[0]}
                          </div>
                          {vessel.namaKapal.includes('/') && (
                            <div className="text-xs text-slate-400 font-mono font-semibold mt-0.5">
                              CS: {vessel.namaKapal.split('/')[1]}
                            </div>
                          )}
                        </td>
                        <td className="p-4 text-slate-200 font-semibold uppercase">{vessel.asal}</td>
                        <td className="p-4 text-cyan-400 font-bold uppercase">{vessel.tujuan}</td>
                        <td className="p-4 font-mono text-xs text-slate-300">{vessel.eta}</td>
                        <td className="p-4">
                          <span className={`font-semibold text-xs uppercase px-2 py-1 rounded inline-block ${
                            vessel.waktuSandarLabuh.toUpperCase().includes('ANCHOR') || vessel.waktuSandarLabuh.toUpperCase().includes('ANCOR')
                              ? 'text-amber-400 bg-amber-400/10 border border-amber-500/20'
                              : vessel.waktuSandarLabuh.toUpperCase().includes('TD')
                              ? 'text-cyan-400 bg-cyan-400/10 border border-cyan-500/20'
                              : 'text-slate-300 bg-slate-800'
                          }`}>
                            {vessel.waktuSandarLabuh || '-'}
                          </span>
                        </td>
                        <td className="p-4">{renderRemarksBadges(vessel.keterangan)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Vessel Cards (Mobile/Tablet Mode) */}
        {!isLoading && (
          <section className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:hidden">
            {filteredVessels.length === 0 ? (
              <div className="col-span-full bg-slate-900/30 p-8 text-center text-slate-500 rounded-2xl border border-slate-800">
                Tidak ada data kapal.
              </div>
            ) : (
              filteredVessels.map((vessel, index) => (
                <div
                  key={vessel.no || index}
                  onClick={() => setSelectedVessel(vessel)}
                  className="bg-slate-900/40 hover:bg-slate-900/70 border border-slate-800/80 hover:border-slate-700/80 rounded-2xl p-5 backdrop-blur-md shadow-md cursor-pointer transition-all duration-200 space-y-4"
                >
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold font-mono text-slate-500 bg-slate-950 px-1.5 py-0.5 rounded uppercase">
                        No. {vessel.no}
                      </span>
                      <h3 className="text-lg font-bold text-white uppercase tracking-wide">
                        {vessel.namaKapal.split('/')[0]}
                      </h3>
                      {vessel.namaKapal.includes('/') && (
                        <p className="text-xs font-mono font-medium text-slate-400">
                          CS: {vessel.namaKapal.split('/')[1]}
                        </p>
                      )}
                    </div>
                    {renderRemarksBadges(vessel.keterangan)}
                  </div>

                  <div className="grid grid-cols-2 gap-x-4 gap-y-3 pt-3 border-t border-slate-800/40 text-xs">
                    <div>
                      <span className="block text-slate-500 font-semibold uppercase">Waktu</span>
                      <span className="font-mono text-cyan-400 font-bold">{vessel.waktu}</span>
                    </div>
                    <div>
                      <span className="block text-slate-500 font-semibold uppercase">Asal</span>
                      <span className="font-semibold text-slate-200 uppercase">{vessel.asal}</span>
                    </div>
                    <div>
                      <span className="block text-slate-500 font-semibold uppercase">Tujuan</span>
                      <span className="font-semibold text-cyan-400 uppercase">{vessel.tujuan}</span>
                    </div>
                    <div>
                      <span className="block text-slate-500 font-semibold uppercase">ETA</span>
                      <span className="font-mono text-slate-300">{vessel.eta || '-'}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="block text-slate-500 font-semibold uppercase">Waktu Sandar / Labuh</span>
                      <span className="font-semibold text-slate-200">{vessel.waktuSandarLabuh || '-'}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </section>
        )}


      </div>

      {/* Vessel Detail Modal Overlay */}
      {selectedVessel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm transition-all">
          <div 
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg bg-[#0e1726] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden relative"
          >
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-slate-900 to-slate-900/80 p-5 border-b border-slate-800 flex justify-between items-center">
              <div className="space-y-1">
                <span className="text-[9px] font-bold text-cyan-400 bg-cyan-400/10 px-2 py-0.5 rounded-full uppercase tracking-wider font-mono">
                  Detail Kapal #{selectedVessel.no}
                </span>
                <h3 className="text-xl font-black text-white uppercase tracking-wider">
                  {selectedVessel.namaKapal.split('/')[0]}
                </h3>
              </div>
              <button
                onClick={() => setSelectedVessel(null)}
                className="text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 p-1.5 rounded-lg transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              
              {/* Primary info grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-850">
                  <span className="block text-[10px] font-bold text-slate-500 uppercase">MMSI</span>
                  <span className="font-mono text-sm text-slate-200 mt-0.5 block">{selectedVessel.mmsi || '-'}</span>
                </div>
                <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-850">
                  <span className="block text-[10px] font-bold text-slate-500 uppercase">Waktu Laporan</span>
                  <span className="font-mono text-sm text-cyan-300 font-semibold mt-0.5 block">{selectedVessel.waktu}</span>
                </div>
              </div>

              {/* Voyage Section */}
              <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-850 space-y-3">
                <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">Rute Pelayaran</span>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <span className="block text-[9px] text-slate-500 uppercase">Pelabuhan Asal</span>
                    <span className="font-bold text-sm text-white uppercase">{selectedVessel.asal || '-'}</span>
                  </div>
                  <div className="px-4 text-cyan-400 animate-pulse font-bold">→</div>
                  <div className="flex-1 text-right">
                    <span className="block text-[9px] text-slate-500 uppercase">Pelabuhan Tujuan</span>
                    <span className="font-bold text-sm text-cyan-300 uppercase">{selectedVessel.tujuan || '-'}</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/40 text-xs">
                  <div>
                    <span className="text-slate-500">Estimasi Kedatangan (ETA):</span>
                    <span className="block font-mono text-slate-200 font-bold mt-0.5">{selectedVessel.eta || '-'}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-500">Status Operasional:</span>
                    <span className="block font-mono text-slate-200 font-bold mt-0.5">{selectedVessel.waktuSandarLabuh || '-'}</span>
                  </div>
                </div>
              </div>

              {/* Coordinates Section */}
              <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-850 flex items-center justify-between">
                <div>
                  <span className="block text-[10px] font-bold text-slate-500 uppercase">Posisi Labuh / Jangkar</span>
                  <span className="font-mono text-sm text-slate-200 font-bold mt-1 block">{selectedVessel.posisiLabuh || 'ON POSITION'}</span>
                </div>
                {getMapLink(selectedVessel.posisiLabuh) && (
                  <a
                    href={getMapLink(selectedVessel.posisiLabuh)!}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-extrabold text-xs px-3.5 py-2 rounded-lg transition-colors flex items-center gap-1 shadow-lg shadow-cyan-500/20"
                  >
                    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    </svg>
                    Buka Peta
                  </a>
                )}
              </div>

              {/* Specs Grid */}
              <div className="grid grid-cols-3 gap-2.5 bg-slate-950/40 p-4 rounded-xl border border-slate-850 text-center">
                <div>
                  <span className="block text-[9px] font-bold text-slate-500 uppercase">LOA (Length)</span>
                  <div className="mt-1 font-semibold">{formatDimension(selectedVessel.loa, 'LOA')}</div>
                </div>
                <div>
                  <span className="block text-[9px] font-bold text-slate-500 uppercase">GT (Tonnage)</span>
                  <div className="mt-1 font-semibold">{formatDimension(selectedVessel.gt, 'GT')}</div>
                </div>
                <div>
                  <span className="block text-[9px] font-bold text-slate-500 uppercase">DRAFT (Kedalaman)</span>
                  <div className="mt-1 font-semibold">{formatDimension(selectedVessel.draft, 'DRAFT')}</div>
                </div>
              </div>

              {/* Cargo & Agent details */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-900/50 p-3.5 rounded-xl border border-slate-850">
                  <span className="block text-[10px] font-bold text-slate-500 uppercase">Jenis Muatan</span>
                  <div className="mt-1">{renderCargoBadge(selectedVessel.muatan)}</div>
                </div>
                <div className="bg-slate-900/50 p-3.5 rounded-xl border border-slate-850">
                  <span className="block text-[10px] font-bold text-slate-500 uppercase">Keagenan</span>
                  <span className="font-extrabold text-sm text-slate-200 mt-1 block uppercase">{selectedVessel.agen || '-'}</span>
                </div>
              </div>

              {/* Keterangan */}
              <div className="bg-slate-900/50 p-3.5 rounded-xl border border-slate-850">
                <span className="block text-[10px] font-bold text-slate-500 uppercase mb-2">Keterangan / Remarks</span>
                {renderRemarksBadges(selectedVessel.keterangan)}
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}