import React, { useState, useEffect } from 'react';

interface HeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isValidating: boolean;
  mutate: () => void;
}

export default function Header({
  searchQuery,
  setSearchQuery,
  isValidating,
  mutate,
}: HeaderProps) {
  // Real-time local clock
  const [timeStr, setTimeStr] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }) + ' LT'
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="bg-slate-900/40 border border-slate-800/60 rounded-2xl p-6 backdrop-blur-md shadow-xl flex flex-col md:flex-row md:justify-between md:items-center gap-6">
      <div className="space-y-4 w-full md:w-auto">
        <div className="flex items-center gap-3">
          <img src="/logo-navigasi.png" alt="Logo Navigasi" className="w-12 h-12 object-contain" />
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
              VTS PANJANG TRAFFIC BOARD
            </h1>
          </div>
        </div>

        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
            <svg suppressHydrationWarning className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Cari Nama Kapal / MMSI..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950/40 border border-slate-700/80 rounded-xl py-2.5 pl-11 pr-4 text-sm text-white focus:outline-none focus:border-cyan-500/80 focus:ring-1 focus:ring-cyan-500/50 transition-all placeholder:text-slate-500 shadow-inner"
          />
        </div>
      </div>

      <div className="flex flex-col items-end gap-3">
        <div className="text-left md:text-right bg-slate-950/40 border border-slate-800/60 p-4 rounded-xl md:min-w-[200px] flex flex-col justify-center w-full">
          <span className="text-xs text-slate-500 uppercase tracking-widest font-mono">WAKTU SEKARANG</span>
          <span className="text-2xl md:text-3xl font-bold font-mono text-cyan-300 drop-shadow-[0_0_10px_rgba(34,211,238,0.2)] mt-1">
            {timeStr || '00:00:00 LT'}
          </span>
        </div>

        <div className="flex items-center gap-3 bg-slate-900/40 border border-slate-800/60 px-4 py-2 rounded-xl backdrop-blur-md shadow-sm w-full justify-between">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">LIVE</span>
          </div>
          <div className="w-px h-4 bg-slate-700"></div>
          <button
            onClick={() => mutate()}
            disabled={isValidating}
            className="text-[10px] text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-mono tracking-wider whitespace-nowrap"
          >
            <img src="/load.png" alt="Loading" className={`w-3.5 h-3.5 ${isValidating ? 'animate-spin' : ''}`} />
            {isValidating ? 'MENYINKRONKAN...' : 'SINKRONKAN'}
          </button>
        </div>
      </div>
    </header>
  );
}
