import React, { useState, useEffect, useRef } from 'react';
import { VesselRecord } from '../types/vts';
import { renderRemarksBadges } from './VesselHelpers';

interface VesselTableProps {
  filteredVessels: VesselRecord[];
  selectedVessel: VesselRecord | null;
  setSelectedVessel: (vessel: VesselRecord | null) => void;
}

export default function VesselTable({
  filteredVessels,
  selectedVessel,
  setSelectedVessel,
}: VesselTableProps) {
  const [displayVessels, setDisplayVessels] = useState<VesselRecord[]>([]);
  const [translateY, setTranslateY] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  // Synchronize display lists with filtered data
  useEffect(() => {
    setDisplayVessels((prev) => {
      // If length is different or empty, reset completely
      if (prev.length !== filteredVessels.length || prev.length === 0) {
        return filteredVessels;
      }
      // Check if we have different items (by checking no)
      const prevNos = new Set(prev.map((v) => v.no));
      const hasDifferentItems = filteredVessels.some((v) => !prevNos.has(v.no));
      if (hasDifferentItems) {
        return filteredVessels;
      }
      // If matching structure, update fields in-place
      return prev.map((oldV) => {
        const updated = filteredVessels.find((newV) => newV.no === oldV.no);
        return updated || oldV;
      });
    });

    setTranslateY(0);
    setIsTransitioning(false);
  }, [filteredVessels]);

  // Auto-scroll loop effect
  useEffect(() => {
    if (selectedVessel) return;

    const desktopHeight = 70; // Height of one row

    const interval = setInterval(() => {
      // Desktop Auto-scroll (only if more than 7 rows visible and not hovered)
      if (filteredVessels.length > 7 && !isHovered) {
        setIsTransitioning(true);
        setTranslateY(-desktopHeight);

        setTimeout(() => {
          setDisplayVessels((prev) => {
            if (prev.length === 0) return prev;
            const [first, ...rest] = prev;
            return [...rest, first];
          });
          setIsTransitioning(false);
          setTranslateY(0);
        }, 600);
      }
    }, 3500);

    return () => clearInterval(interval);
  }, [filteredVessels, isHovered, selectedVessel]);

  return (
    <section className="bg-slate-900/20 border border-slate-800/60 rounded-2xl overflow-x-auto custom-scrollbar backdrop-blur-md shadow-xl hidden lg:block">
      <div className="min-w-[1450px]">
        {/* Header Grid */}
        <div className="bg-slate-900/80 border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-widest grid grid-cols-[50px_130px_minmax(340px,_1fr)_100px_120px_120px_110px_150px_110px] gap-2 items-center px-6 py-4">
          <div className="text-center">No</div>
          <div className="text-center">Waktu</div>
          <div>Nama Kapal / Call Sign</div>
          <div>MMSI</div>
          <div>Asal</div>
          <div>Tujuan</div>
          <div className="text-center">ETA</div>
          <div>
            Waktu Sandar / Labuh / Departure</div>
          <div>Keterangan</div>
        </div>

        {/* Table Body Viewport */}
        <div
          ref={containerRef}
          className="overflow-y-auto overflow-x-hidden relative custom-scrollbar"
          style={{ height: filteredVessels.length > 7 ? '490px' : 'auto' }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => {
            setIsHovered(false);
            if (containerRef.current) {
              containerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
            }
          }}
        >
          <div
            style={{
              transform: `translateY(${translateY}px)`,
              transition: isTransitioning ? 'transform 600ms ease-in-out' : 'none',
            }}
          >
            {displayVessels.length === 0 ? (
              <div className="p-12 text-center text-slate-500 italic border-b border-slate-800/60">
                Tidak ada kapal yang sesuai dengan filter pencarian.
              </div>
            ) : (
              displayVessels.map((vessel, index) => (
                <div
                  key={`${vessel.no}-${index}`}
                  onClick={() => setSelectedVessel(vessel)}
                  className={`h-[70px] grid grid-cols-[50px_130px_minmax(340px,_1fr)_100px_120px_120px_110px_150px_110px] gap-2 items-center px-6 border-b border-slate-800/60 text-sm cursor-pointer transition-colors group ${index % 2 === 0 ? 'bg-slate-900/10' : 'bg-slate-900/30'
                    } hover:bg-cyan-500/5`}
                >
                  <div className="text-center text-slate-500 font-mono font-bold text-xs">{vessel.no}</div>
                  <div className="font-mono font-medium text-cyan-400/90 text-xs text-center">{vessel.waktu}</div>
                  <div className="pr-4 truncate">
                    <div className="font-bold text-white group-hover:text-cyan-300 transition-colors uppercase tracking-wide truncate">
                      {vessel.namaKapal.split('/')[0]}
                    </div>
                    {vessel.namaKapal.includes('/') && (
                      <div className="text-xs text-slate-400 font-mono font-semibold mt-0.5 truncate">
                        CS: {vessel.namaKapal.split('/')[1]}
                      </div>
                    )}
                  </div>
                  <div className="font-mono text-xs text-slate-300 truncate">{vessel.mmsi || '-'}</div>
                  <div className="text-slate-200 font-semibold uppercase truncate">{vessel.asal}</div>
                  <div className="text-cyan-400 font-bold uppercase truncate">{vessel.tujuan}</div>
                  <div className="font-mono text-xs text-slate-300 truncate text-center">{vessel.eta || '-'}</div>
                  <div>
                    {vessel.waktuSandarLabuh ? (
                      <span
                        className={`font-semibold text-xs uppercase px-2 py-1 rounded inline-block ${vessel.waktuSandarLabuh.toUpperCase().includes('TD')
                          ? 'text-cyan-400 bg-cyan-400/10 border border-cyan-500/20'
                          : vessel.waktuSandarLabuh.toUpperCase().includes('ANCHOR') ||
                            vessel.waktuSandarLabuh.toUpperCase().includes('ANCOR')
                            ? 'text-amber-400 bg-amber-400/10 border border-amber-500/20'
                            : 'text-slate-300 bg-slate-800/80 border border-slate-700/60'
                          }`}
                      >
                        {vessel.waktuSandarLabuh}
                      </span>
                    ) : (
                      <span className="text-slate-500">-</span>
                    )}
                  </div>
                  <div className="overflow-hidden">{renderRemarksBadges(vessel.keterangan)}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
