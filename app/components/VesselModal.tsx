import React from 'react';
import { VesselRecord } from '../types/vts';
import { parseDDM } from '../utils/vts';
import { formatDimension, renderCargoBadge, renderRemarksBadges } from './VesselHelpers';

interface VesselModalProps {
  vessel: VesselRecord;
  onClose: () => void;
}

// Google Maps coordinate query link
const getMapLink = (pos: string) => {
  if (!pos || pos === 'ON POSITION' || pos === 'ANCHORAGE UP' || pos === 'OUT') return null;
  const cleanPos = pos.replace(/'/g, '°').replace('/', ' ');
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(cleanPos)}`;
};

export default function VesselModal({ vessel, onClose }: VesselModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm transition-all">
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-[#0e1726] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden relative"
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-900/80 p-5 border-b border-slate-800 flex justify-between items-center">
          <div className="space-y-1">
            <span className="text-[9px] font-bold text-cyan-400 bg-cyan-400/10 px-2 py-0.5 rounded-full uppercase tracking-wider font-mono">
              Detail Kapal #{vessel.no}
            </span>
            <h3 className="text-xl font-black text-white uppercase tracking-wider">
              {vessel.namaKapal.split('/')[0]}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 p-1.5 rounded-lg transition-all"
          >
            <svg suppressHydrationWarning className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
              <span className="font-mono text-sm text-slate-200 mt-0.5 block">{vessel.mmsi || '-'}</span>
            </div>
            <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-850">
              <span className="block text-[10px] font-bold text-slate-500 uppercase">Waktu Laporan</span>
              <span className="font-mono text-sm text-cyan-300 font-semibold mt-0.5 block">{vessel.waktu}</span>
            </div>
          </div>

          {/* Voyage Section */}
          <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-850 space-y-3">
            <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">Rute Pelayaran</span>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <span className="block text-[9px] text-slate-500 uppercase">Pelabuhan Asal</span>
                <span className="font-bold text-sm text-white uppercase">{vessel.asal || '-'}</span>
              </div>
              <div className="px-4 text-cyan-400 animate-pulse font-bold">→</div>
              <div className="flex-1 text-right">
                <span className="block text-[9px] text-slate-500 uppercase">Pelabuhan Tujuan</span>
                <span className="font-bold text-sm text-cyan-300 uppercase">{vessel.tujuan || '-'}</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/40 text-xs">
              <div>
                <span className="text-slate-500">Estimasi Kedatangan (ETA):</span>
                <span className="block font-mono text-slate-200 font-bold mt-0.5">{vessel.eta || '-'}</span>
              </div>
              <div className="text-right">
                <span className="text-slate-500">Status Operasional:</span>
                <span className="block font-mono text-slate-200 font-bold mt-0.5">{vessel.waktuSandarLabuh || '-'}</span>
              </div>
            </div>
          </div>

          {/* Coordinates Section */}
          {(() => {
            const parsed = parseDDM(vessel.posisiLabuh);
            if (parsed) {
              return (
                <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-850 space-y-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="block text-[10px] font-bold text-slate-500 uppercase">Posisi Labuh / Jangkar</span>
                      <span className="font-mono text-sm text-slate-200 font-bold mt-1 block">{vessel.posisiLabuh}</span>
                    </div>
                    {getMapLink(vessel.posisiLabuh) && (
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${parsed.lat},${parsed.lng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-extrabold text-xs px-3.5 py-2 rounded-lg transition-colors flex items-center gap-1 shadow-lg shadow-cyan-500/20 cursor-pointer"
                      >
                        <svg suppressHydrationWarning className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        </svg>
                        Buka Peta
                      </a>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-800/40 text-xs">
                    <div>
                      <span className="block text-[9px] text-slate-500 font-semibold uppercase">Latitude Desimal</span>
                      <span className="font-mono text-cyan-300 font-bold block">{parsed.latFormatted}</span>
                    </div>
                    <div>
                      <span className="block text-[9px] text-slate-500 font-semibold uppercase">Longitude Desimal</span>
                      <span className="font-mono text-cyan-300 font-bold block">{parsed.lngFormatted}</span>
                    </div>
                  </div>
                </div>
              );
            }

            // Fallback for non-coordinates or unparseable coordinates (e.g. "ON POSITION", "OUT", "SANDAR")
            return (
              <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-850 flex items-center justify-between">
                <div>
                  <span className="block text-[10px] font-bold text-slate-500 uppercase">Posisi Labuh / Jangkar</span>
                  <span className="font-mono text-sm text-slate-200 font-bold mt-1 block">{vessel.posisiLabuh || 'ON POSITION'}</span>
                </div>
                {getMapLink(vessel.posisiLabuh) && (
                  <a
                    href={getMapLink(vessel.posisiLabuh)!}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-extrabold text-xs px-3.5 py-2 rounded-lg transition-colors flex items-center gap-1 shadow-lg shadow-cyan-500/20"
                  >
                    <svg suppressHydrationWarning className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    </svg>
                    Buka Peta
                  </a>
                )}
              </div>
            );
          })()}

          {/* Specs Grid */}
          <div className="grid grid-cols-3 gap-2.5 bg-slate-950/40 p-4 rounded-xl border border-slate-850 text-center">
            <div>
              <span className="block text-[9px] font-bold text-slate-500 uppercase">LOA (Length)</span>
              <div className="mt-1 font-semibold">{formatDimension(vessel.loa, 'LOA')}</div>
            </div>
            <div>
              <span className="block text-[9px] font-bold text-slate-500 uppercase">GT (Tonnage)</span>
              <div className="mt-1 font-semibold">{formatDimension(vessel.gt, 'GT')}</div>
            </div>
            <div>
              <span className="block text-[9px] font-bold text-slate-500 uppercase">DRAFT (Kedalaman)</span>
              <div className="mt-1 font-semibold">{formatDimension(vessel.draft, 'DRAFT')}</div>
            </div>
          </div>

          {/* Cargo & Agent details */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-900/50 p-3.5 rounded-xl border border-slate-850">
              <span className="block text-[10px] font-bold text-slate-500 uppercase">Jenis Muatan</span>
              <div className="mt-1">{renderCargoBadge(vessel.muatan)}</div>
            </div>
            <div className="bg-slate-900/50 p-3.5 rounded-xl border border-slate-850">
              <span className="block text-[10px] font-bold text-slate-500 uppercase">Keagenan</span>
              <span className="font-extrabold text-sm text-slate-200 mt-1 block uppercase">{vessel.agen || '-'}</span>
            </div>
          </div>

          {/* Keterangan */}
          <div className="bg-slate-900/50 p-3.5 rounded-xl border border-slate-850">
            <span className="block text-[10px] font-bold text-slate-500 uppercase mb-2">Keterangan / Remarks</span>
            {renderRemarksBadges(vessel.keterangan)}
          </div>
        </div>
      </div>
    </div>
  );
}
