'use client';

import React from 'react';
import Link from 'next/link';

export default function DevelopersPage() {
  const developers = [
    {
      name: 'Nama Developer 1',
      role: 'Full Stack Developer',
      description: 'Mahasiswa Kerja Praktik Teknik Informatika ITERA 2026.',
      image: 'https://ui-avatars.com/api/?name=Dev+1&background=0891b2&color=fff&size=256',
      github: '#',
      linkedin: '#'
    },
    {
      name: 'Nama Developer 2',
      role: 'Frontend Developer',
      description: 'Mahasiswa Kerja Praktik Teknik Informatika ITERA 2026.',
      image: 'https://ui-avatars.com/api/?name=Dev+2&background=0891b2&color=fff&size=256',
      github: '#',
      linkedin: '#'
    },
    {
      name: 'Nama Developer 3',
      role: 'Backend Developer',
      description: 'Mahasiswa Kerja Praktik Teknik Informatika ITERA 2026.',
      image: 'https://ui-avatars.com/api/?name=Dev+3&background=0891b2&color=fff&size=256',
      github: '#',
      linkedin: '#'
    },
    {
      name: 'Nama Developer 4',
      role: 'UI/UX Designer',
      description: 'Mahasiswa Kerja Praktik Teknik Informatika ITERA 2026.',
      image: 'https://ui-avatars.com/api/?name=Dev+4&background=0891b2&color=fff&size=256',
      github: '#',
      linkedin: '#'
    }
  ];

  return (
    <div
      className="min-h-screen w-full flex flex-col overflow-x-hidden bg-cover bg-center bg-no-repeat bg-fixed text-white font-sans selection:bg-cyan-500/30 selection:text-cyan-300"
      style={{
        backgroundImage: "linear-gradient(rgba(7, 11, 19, 0.85), rgba(7, 11, 19, 0.95)), url('/bg-vts.jpeg')",
      }}
    >
      <div className="max-w-[1200px] w-full mx-auto p-6 md:p-12 pb-24">
        <header className="mb-12 text-center space-y-4 pt-4">
          <Link href="/" className="inline-flex items-center text-cyan-400 hover:text-cyan-300 transition-colors mb-6 text-sm font-mono tracking-wider group">
            <span className="bg-cyan-400/10 p-1.5 rounded-full mr-3 group-hover:bg-cyan-400/20 transition-colors">
              <svg suppressHydrationWarning className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </span>
            KEMBALI KE DASHBOARD
          </Link>
          <div className="flex justify-center mb-6">
            <div className="p-2 rounded-2xl bg-white/5 border border-white/10 shadow-lg backdrop-blur-sm">
                <img src="/logo-navigasi.png" alt="Logo Navigasi" className="w-16 h-16 object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]" />
            </div>
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            Tim Pengembang
          </h1>
          <p className="text-slate-400 max-w-2xl mx-auto text-sm md:text-base leading-relaxed">
            Aplikasi VTS Panjang Traffic Board ini dikembangkan oleh mahasiswa Kerja Praktik dari Program Studi Teknik Informatika, Institut Teknologi Sumatera (ITERA) tahun 2026.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {developers.map((dev, index) => (
            <div 
              key={index}
              className="bg-slate-900/40 border border-slate-800/60 rounded-2xl p-6 backdrop-blur-md shadow-xl hover:bg-slate-900/60 transition-all duration-300 group hover:-translate-y-2 hover:shadow-cyan-500/20 flex flex-col h-full"
            >
              <div className="flex flex-col items-center text-center space-y-5 flex-grow">
                <div className="relative">
                  <div className="w-28 h-28 rounded-full p-1 bg-gradient-to-tr from-cyan-500 to-blue-500 shadow-lg shadow-cyan-500/30 group-hover:shadow-cyan-500/50 transition-shadow">
                    <img 
                      src={dev.image} 
                      alt={dev.name}
                      className="w-full h-full rounded-full object-cover border-4 border-slate-900 bg-slate-800"
                    />
                  </div>
                  <div className="absolute -bottom-2 -right-2 bg-slate-800 rounded-full p-2 border border-slate-700 shadow-md">
                    <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                    </svg>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-white group-hover:text-cyan-400 transition-colors leading-tight">{dev.name}</h3>
                  <p className="text-cyan-500 text-xs font-mono tracking-wider font-semibold">{dev.role}</p>
                </div>
                
                <p className="text-[13px] text-slate-400 leading-relaxed">
                  {dev.description}
                </p>
              </div>

              <div className="flex items-center gap-3 pt-5 mt-4 border-t border-slate-800/60 w-full justify-center">
                <a href={dev.github} className="text-slate-400 hover:text-white transition-colors p-2.5 bg-slate-950 rounded-xl border border-slate-800 hover:border-slate-600 hover:shadow-md">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                  </svg>
                </a>
                <a href={dev.linkedin} className="text-slate-400 hover:text-cyan-400 transition-colors p-2.5 bg-slate-950 rounded-xl border border-slate-800 hover:border-cyan-500/30 hover:shadow-md">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd" />
                  </svg>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Footer info text */}
      <footer className="mt-auto w-full bg-slate-950/80 border-t border-slate-800/50 py-4 text-center backdrop-blur-md">
        <p className="text-[11px] text-slate-400 font-mono tracking-wider">
          Created By <span className="text-cyan-400 font-bold">VTS PANJANG</span> X <Link href="/developers" className="text-cyan-400 font-bold hover:text-cyan-300 transition-colors cursor-pointer">KP TEKNIK INFORMATIKA ITERA 2026</Link>
        </p>
      </footer>
    </div>
  );
}
