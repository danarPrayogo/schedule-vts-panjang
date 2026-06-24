'use client';

import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface VesselMapProps {
  lat: number;
  lng: number;
  label: string;
}

export default function VesselMap({ lat, lng, label }: VesselMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerInstanceRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Resolve Leaflet's default marker icon paths when bundled with Next.js/Webpack
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    });

    // Create the map if it hasn't been initialized yet
    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        zoomControl: true,
        scrollWheelZoom: true,
      }).setView([lat, lng], 13);

      // Using CartoDB Dark Matter map tiles to blend with the dark/glassmorphic VTS theme
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        maxZoom: 20,
      }).addTo(map);

      // Create marker with popup
      const marker = L.marker([lat, lng])
        .addTo(map)
        .bindPopup(`<strong class="text-slate-900">${label}</strong>`)
        .openPopup();

      mapInstanceRef.current = map;
      markerInstanceRef.current = marker;
    } else {
      // Update coordinates if the map is already initialized
      const map = mapInstanceRef.current;
      const marker = markerInstanceRef.current;

      map.setView([lat, lng], 13);
      if (marker) {
        marker.setLatLng([lat, lng]);
        marker.setPopupContent(`<strong class="text-slate-900">${label}</strong>`).openPopup();
      }
    }

    // Force map size invalidation to fix rendering issues inside collapsible containers/modals
    setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    }, 200);

  }, [lat, lng, label]);

  // Clean up Leaflet instances on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markerInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <div className="w-full h-full relative overflow-hidden rounded-xl border border-slate-800/80 shadow-2xl bg-slate-950/80">
      <div ref={mapContainerRef} className="w-full h-full min-h-[280px] z-10" />
      {/* Subtle bottom gradient to blend map with dark container */}
      <div className="absolute inset-x-0 bottom-0 h-4 bg-gradient-to-t from-slate-950/50 to-transparent pointer-events-none z-20" />
    </div>
  );
}
