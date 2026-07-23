'use client';

import React from 'react';
import Link from 'next/link';

export default function DevelopersPage() {
  const developers = [
    {
      name: 'Danar Prayogo',
      role: 'Lead Fullstack Developer & Frontend',
      description: 'Bertanggung jawab atas arsitektur utama aplikasi, merancang antarmuka pengguna (UI/UX) yang interaktif dan responsif, serta mengelola sinkronisasi data real-time pada sistem VTS Panjang.',
      image: '/dp.jpg',
      instagram: 'https://www.instagram.com/danar.prayoga.149?igsh=MTVjZHJxcXgxOWhzYg==',
      github: 'https://github.com/danarPrayogo',
      imageStyle: { backgroundSize: '150%', backgroundPosition: 'center 20%' }
    },
    {
      name: 'Muhammad Dzaky',
      role: 'Backend Engineer',
      description: 'Mengembangkan sistem API untuk menghubungkan antara data dari Google Sheets dengan aplikasi, serta mengelola optimasi parsing data CSV dan integrasi koordinat kapal ke Google Maps.',
      image: '/dzaky.jpg',
      instagram: 'https://www.instagram.com/dzaky1605?igsh=MXQ5ZTZsOGYwNmgwMQ==',
      github: 'https://github.com/14-039-MuhammadDzaky',
      imageStyle: { backgroundSize: '130%', backgroundPosition: 'center 25%' }
    }
  ];

  return (
    <div
      className="min-h-screen w-full flex flex-col overflow-x-hidden text-white font-sans selection:bg-cyan-500/30 selection:text-cyan-300 relative z-0 bg-cover bg-center bg-no-repeat bg-fixed"
      style={{
        backgroundImage: "linear-gradient(rgba(7, 11, 19, 0.90), rgba(7, 11, 19, 0.96)), url('/bg-vts.jpeg')",
      }}
    >
      {/* ITERA logo watermark behind content */}
      <div className="absolute inset-0 bg-[url('https://upload.wikimedia.org/wikipedia/commons/e/e4/Logo_ITERA.png')] bg-no-repeat bg-[center_top_12%] md:bg-[center_top_8%] bg-[length:450px] md:bg-[length:550px] opacity-[0.05] pointer-events-none -z-10" />

      <div className="max-w-[1200px] w-full mx-auto p-6 md:p-12 pb-24 flex-grow flex flex-col justify-center">
        {/* Header Section */}
        <header className="mb-14 text-center space-y-4 pt-4">
          <div className="flex justify-center mb-6">
            <Link
              href="/"
              className="inline-flex items-center bg-slate-900/60 border border-slate-800/80 text-slate-300 hover:text-white transition-all duration-200 px-5 py-2 rounded-full text-xs font-semibold tracking-wide shadow-sm hover:shadow-md group gap-2 backdrop-blur-sm"
            >
              <svg
                className="w-3.5 h-3.5 transform group-hover:-translate-x-0.5 transition-transform"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Kembali ke Dashboard
            </Link>
          </div>

          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white uppercase">
            Tim Pengembang
          </h1>
          <p className="text-slate-400 max-w-2xl mx-auto text-sm md:text-base font-normal leading-relaxed">
            Dibuat dengan dedikasi tinggi oleh tim kuliah praktik teknik informatika ITERA 2026 untuk mendukung operasional Vessel Traffic Service (VTS) Panjang.
          </p>
        </header>

        {/* Grid of Developer Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-3xl mx-auto w-full">
          {developers.map((dev, index) => (
            <div key={index} className="relative group w-full h-[460px] cursor-pointer">
              {/* Stacked Border 1 (Rotated Clockwise on hover) */}
              <div className="absolute inset-0 border-2 border-cyan-500 rounded-[32px] opacity-0 scale-95 transition-all duration-500 ease-out group-hover:opacity-100 group-hover:scale-100 group-hover:rotate-[6deg] group-hover:translate-x-1 group-hover:translate-y-1 -z-10 pointer-events-none shadow-[0_0_20px_rgba(6,182,212,0.25)]" />

              {/* Stacked Border 2 (Rotated Counter-Clockwise on hover) */}
              <div className="absolute inset-0 border-2 border-cyan-500/60 rounded-[32px] opacity-0 scale-95 transition-all duration-500 ease-out group-hover:opacity-100 group-hover:scale-100 group-hover:rotate-[-4deg] group-hover:-translate-x-1 group-hover:-translate-y-1 -z-20 pointer-events-none" />

              {/* Main Card */}
              <div className="relative w-full h-full rounded-[32px] overflow-hidden border-[3px] border-slate-800/80 group-hover:border-cyan-400 shadow-[0_6px_20px_rgba(0,0,0,0.4)] group-hover:shadow-[0_12px_35px_rgba(6,182,212,0.35)] transition-all duration-500 ease-out bg-[#070b13]">
                {/* Front Side: Photo with Gradient Overlay */}
                <div
                  style={{ backgroundImage: `url(${dev.image})`, ...dev.imageStyle }}
                  className="absolute inset-0 bg-cover bg-center transition-all duration-500 ease-out scale-100 group-hover:scale-110 group-hover:opacity-0 flex flex-col justify-end p-6 bg-slate-900"
                >
                  {/* Bottom Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#070b13] via-[#070b13]/50 to-transparent -z-10" />

                  <div className="z-10">
                    <h3 className="text-xl font-extrabold text-white tracking-wide uppercase leading-tight font-sans whitespace-pre-line">
                      {dev.name}
                    </h3>
                    <p className="text-[11px] font-mono font-bold text-cyan-400 tracking-wider uppercase mt-1">
                      {dev.role}
                    </p>
                  </div>
                </div>

                {/* Back Side: Cool Blue/Cyan Info Gradient */}
                <div className="absolute inset-0 flex flex-col justify-between p-8 bg-gradient-to-b from-[#090d16] to-[#0f172a] opacity-0 group-hover:opacity-100 transition-all duration-500 ease-out transform translate-y-4 group-hover:translate-y-0">
                  <div className="flex flex-col items-center text-center mt-4">
                    <h3 className="text-xl font-extrabold text-white tracking-wide uppercase leading-tight font-sans whitespace-pre-line">
                      {dev.name}
                    </h3>
                    <p className="text-[11px] font-mono font-bold text-cyan-400 tracking-wider uppercase mt-1.5 pb-4 border-b border-slate-800/80 w-full">
                      {dev.role}
                    </p>
                    <p className="text-sm text-slate-300 font-medium leading-relaxed mt-6">
                      {dev.description}
                    </p>
                  </div>

                  {/* Social Buttons */}
                  <div className="flex justify-center items-center gap-3.5 mt-auto mb-2">
                    <a
                      href={dev.instagram}
                      className="w-10 h-10 rounded-full bg-slate-900/60 hover:bg-slate-950 text-slate-300 hover:text-white flex items-center justify-center border border-slate-800 hover:border-slate-600 hover:scale-110 transition-all duration-200"
                      aria-label="Instagram"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                        <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" />
                        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                      </svg>
                    </a>
                    <a
                      href={dev.github}
                      className="w-10 h-10 rounded-full bg-slate-900/60 hover:bg-slate-950 text-slate-300 hover:text-white flex items-center justify-center border border-slate-800 hover:border-slate-600 hover:scale-110 transition-all duration-200"
                      aria-label="GitHub"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Info Text */}
      <footer className="mt-auto w-full bg-slate-950/80 border-t border-slate-900 py-4 text-center backdrop-blur-md">
        <p className="text-[11px] text-slate-500 font-mono tracking-wider font-semibold">
          Created By <span className="text-cyan-500 font-bold">VTS PANJANG</span> X <Link href="/developers" className="text-cyan-500 font-bold hover:text-cyan-400 transition-colors cursor-pointer">KP TEKNIK INFORMATIKA ITERA 2026</Link>
        </p>
      </footer>
    </div>
  );
}
