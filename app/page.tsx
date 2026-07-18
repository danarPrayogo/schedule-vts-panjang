'use client';

import React, { useState, useMemo } from 'react';
import useSWR from 'swr';
import { ParsedVTSResult, VesselRecord } from './types/vts';
import { fetcher, getMovementType } from './utils/vts';
import Header from './components/Header';
import VesselTable from './components/VesselTable';
import VesselCards from './components/VesselCards';
import VesselModal from './components/VesselModal';
import Footer from './components/Footer';

export default function VTSBoard() {
  const sheetUrl =
    'https://docs.google.com/spreadsheets/d/12LiKh6sfYoqf74nyr1-mVbdyfO7QN5PHu7oE-kCuXcM/export?format=csv&gid=0';

  const { data, error, isLoading, isValidating, mutate } = useSWR<ParsedVTSResult>(
    sheetUrl,
    fetcher,
    {
      refreshInterval: 5000, // Refresh every 5 seconds for quicker updates
      dedupingInterval: 0, // Bypass deduping so manual sync/polling fetches immediately
    }
  );

  // State untuk Filter & Pencarian
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter] = useState<'ALL' | 'IN' | 'OUT' | 'ANCHOR'>('ALL');
  const [agentFilter] = useState('ALL');
  const [cargoFilter] = useState('ALL');
  const [selectedVessel, setSelectedVessel] = useState<VesselRecord | null>(null);

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

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-center items-center p-6">
        <div className="bg-red-500/10 border border-red-500/30 p-6 rounded-xl max-w-md text-center">
          <svg
            suppressHydrationWarning
            className="w-12 h-12 text-red-400 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <h2 className="text-xl font-bold mb-2">Koneksi Gagal</h2>
          <p className="text-slate-400 text-sm mb-4">
            Gagal memuat data dari Google Sheets. Pastikan publikasi CSV sheet aktif.
          </p>
          <button
            onClick={() => mutate(undefined, { revalidate: true })}
            className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded transition-colors text-sm"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen w-full flex flex-col overflow-x-hidden bg-cover bg-center bg-no-repeat bg-fixed text-white font-sans selection:bg-cyan-500/30 selection:text-cyan-300"
      style={{
        backgroundImage:
          "linear-gradient(rgba(7, 11, 19, 0.85), rgba(7, 11, 19, 0.95)), url('/bg-vts.jpeg')",
      }}
    >
      <div className="max-w-[1600px] flex-1 w-full mx-auto p-4 md:p-8 space-y-6 pb-20">
        <Header
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          isValidating={isValidating}
          mutate={() => mutate(undefined, { revalidate: true })}
        />

        {isLoading ? (
          <div className="space-y-4">
            <div className="h-96 bg-slate-900/30 border border-slate-800/60 rounded-2xl animate-pulse"></div>
          </div>
        ) : (
          <>
            <VesselTable
              filteredVessels={filteredVessels}
              selectedVessel={selectedVessel}
              setSelectedVessel={setSelectedVessel}
            />

            <VesselCards
              filteredVessels={filteredVessels}
              selectedVessel={selectedVessel}
              setSelectedVessel={setSelectedVessel}
            />
          </>
        )}
      </div>

      <Footer />

      {selectedVessel && (
        <VesselModal vessel={selectedVessel} onClose={() => setSelectedVessel(null)} />
      )}
    </div>
  );
}