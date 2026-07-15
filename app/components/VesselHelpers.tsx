import React from 'react';

// Dimension Formatter for Tug & Barge
export const formatDimension = (val: string, type: 'LOA' | 'GT' | 'DRAFT') => {
  if (!val || val === '0') return <span className="text-slate-500">-</span>;
  if (val.includes('/')) {
    const [tb, tk] = val.split('/');
    return (
      <div className="flex flex-col text-[11px] leading-tight">
        <span className="text-slate-300 font-semibold truncate">
          TB: {tb.trim()}
          {type === 'LOA' ? ' m' : type === 'GT' ? ' GT' : ' m'}
        </span>
        <span className="text-slate-400 truncate">
          TK: {tk.trim()}
          {type === 'LOA' ? ' m' : type === 'GT' ? ' GT' : ' m'}
        </span>
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

// Render remarks badges
export const renderRemarksBadges = (remarks: string) => {
  if (!remarks) return null;
  const parts = remarks
    .split('/')
    .map((part) => {
      let cleaned = part.trim();
      // Hapus prefix/suffix "IN" atau "OUT" secara case-insensitive
      cleaned = cleaned.replace(/^(IN|OUT)\b\s*/i, '');
      cleaned = cleaned.replace(/\s*\b(IN|OUT)$/i, '');
      return cleaned.trim();
    })
    .filter((part) => part !== '');

  if (parts.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1">
      {parts.map((part, index) => {
        let bgClass = 'bg-slate-800 text-slate-300 border border-slate-700';
        if (part.toUpperCase() === 'YES') {
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
export const renderCargoBadge = (cargo: string) => {
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
