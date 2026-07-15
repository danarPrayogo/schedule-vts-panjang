import React, { useState, useEffect, useRef } from 'react';
import { VesselRecord } from '../types/vts';
import { renderRemarksBadges } from './VesselHelpers';

interface VesselCardsProps {
  filteredVessels: VesselRecord[];
  selectedVessel: VesselRecord | null;
  setSelectedVessel: (vessel: VesselRecord | null) => void;
}

export default function VesselCards({
  filteredVessels,
  selectedVessel,
  setSelectedVessel,
}: VesselCardsProps) {
  const [displayVesselsMobile, setDisplayVesselsMobile] = useState<VesselRecord[]>([]);
  const [translateYMobile, setTranslateYMobile] = useState(0);
  const [isTransitioningMobile, setIsTransitioningMobile] = useState(true);
  const [isHoveredMobile, setIsHoveredMobile] = useState(false);

  const containerMobileRef = useRef<HTMLDivElement>(null);
  const touchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleTouchStart = () => {
    if (touchTimeoutRef.current) clearTimeout(touchTimeoutRef.current);
    setIsHoveredMobile(true);
  };

  const handleTouchEnd = () => {
    if (touchTimeoutRef.current) clearTimeout(touchTimeoutRef.current);
    touchTimeoutRef.current = setTimeout(() => {
      if (containerMobileRef.current) {
        containerMobileRef.current.scrollTo({ top: 0, behavior: 'smooth' });
      }
      setIsHoveredMobile(false);
    }, 5000);
  };

  // Synchronize display lists with filtered data
  useEffect(() => {
    setDisplayVesselsMobile((prev) => {
      if (prev.length !== filteredVessels.length || prev.length === 0) {
        return filteredVessels;
      }
      const prevNos = new Set(prev.map((v) => v.no));
      const hasDifferentItems = filteredVessels.some((v) => !prevNos.has(v.no));
      if (hasDifferentItems) {
        return filteredVessels;
      }
      return prev.map((oldV) => {
        const updated = filteredVessels.find((newV) => newV.no === oldV.no);
        return updated || oldV;
      });
    });

    setTranslateYMobile(0);
    setIsTransitioningMobile(false);
  }, [filteredVessels]);

  // Auto-scroll loop effect
  useEffect(() => {
    if (selectedVessel) return;

    const mobileHeight = 216; // Height of one mobile card (200px) + gap (16px)

    const interval = setInterval(() => {
      // Mobile Auto-scroll (only if more than 2 cards visible and not hovered)
      if (filteredVessels.length > 2 && !isHoveredMobile) {
        setIsTransitioningMobile(true);
        setTranslateYMobile(-mobileHeight);

        setTimeout(() => {
          setDisplayVesselsMobile((prev) => {
            if (prev.length === 0) return prev;
            const [first, ...rest] = prev;
            return [...rest, first];
          });
          setIsTransitioningMobile(false);
          setTranslateYMobile(0);
        }, 600);
      }
    }, 3500);

    return () => clearInterval(interval);
  }, [filteredVessels, isHoveredMobile, selectedVessel]);

  return (
    <section className="lg:hidden">
      {filteredVessels.length === 0 ? (
        <div className="bg-slate-900/30 p-8 text-center text-slate-500 rounded-2xl border border-slate-800">
          Tidak ada data kapal.
        </div>
      ) : (
        <div
          ref={containerMobileRef}
          className="overflow-y-auto overflow-x-hidden relative max-w-md mx-auto custom-scrollbar"
          style={{ height: filteredVessels.length > 2 ? '416px' : 'auto' }}
          onMouseEnter={() => setIsHoveredMobile(true)}
          onMouseLeave={() => {
            setIsHoveredMobile(false);
            if (containerMobileRef.current) {
              containerMobileRef.current.scrollTo({ top: 0, behavior: 'smooth' });
            }
          }}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div
            className="space-y-4"
            style={{
              transform: `translateY(${translateYMobile}px)`,
              transition: isTransitioningMobile ? 'transform 600ms ease-in-out' : 'none',
            }}
          >
            {displayVesselsMobile.map((vessel, index) => (
              <div
                key={`${vessel.no}-${index}`}
                onClick={() => setSelectedVessel(vessel)}
                className="h-[200px] bg-slate-900/40 hover:bg-slate-900/70 border border-slate-800/80 hover:border-slate-700/80 rounded-2xl p-4 backdrop-blur-md shadow-md cursor-pointer transition-colors duration-200 flex flex-col justify-between"
              >
                <div className="flex justify-between items-start">
                  <div className="space-y-1 overflow-hidden pr-2">
                    <span className="text-[10px] font-bold font-mono text-slate-500 bg-slate-950 px-1.5 py-0.5 rounded uppercase">
                      No. {vessel.no}
                    </span>
                    <h3 className="text-base font-bold text-white uppercase tracking-wide truncate">
                      {vessel.namaKapal.split('/')[0]}
                    </h3>
                    {vessel.namaKapal.includes('/') && (
                      <p className="text-xs font-mono font-medium text-slate-400 truncate">
                        CS: {vessel.namaKapal.split('/')[1]}
                      </p>
                    )}
                  </div>
                  <div className="shrink-0">{renderRemarksBadges(vessel.keterangan)}</div>
                </div>

                <div className="grid grid-cols-2 gap-x-4 gap-y-1 pt-2 border-t border-slate-800/40 text-xs overflow-hidden">
                  <div className="truncate">
                    <span className="block text-slate-500 font-semibold uppercase text-[9px]">Waktu</span>
                    <span className="font-mono text-cyan-400 font-bold text-xs">{vessel.waktu}</span>
                  </div>
                  <div className="truncate">
                    <span className="block text-slate-500 font-semibold uppercase text-[9px]">Asal</span>
                    <span className="font-semibold text-slate-200 uppercase truncate text-xs">{vessel.asal}</span>
                  </div>
                  <div className="truncate">
                    <span className="block text-slate-500 font-semibold uppercase text-[9px]">Tujuan</span>
                    <span className="font-semibold text-cyan-400 uppercase truncate text-xs">{vessel.tujuan}</span>
                  </div>
                  <div className="truncate">
                    <span className="block text-slate-500 font-semibold uppercase text-[9px]">ETA</span>
                    <span className="font-mono text-slate-300 truncate text-xs">{vessel.eta || '-'}</span>
                  </div>
                  <div className="truncate">
                    <span className="block text-slate-500 font-semibold uppercase text-[9px]">
                      Waktu Sandar / Labuh / Departure</span>
                    <span
                      className={`font-semibold truncate text-xs block mt-0.5 ${vessel.waktuSandarLabuh.toUpperCase().includes('TD')
                        ? 'text-cyan-400'
                        : vessel.waktuSandarLabuh.toUpperCase().includes('ANCHOR') ||
                          vessel.waktuSandarLabuh.toUpperCase().includes('ANCOR')
                          ? 'text-amber-400'
                          : 'text-slate-300'
                        }`}
                    >
                      {vessel.waktuSandarLabuh || '-'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
