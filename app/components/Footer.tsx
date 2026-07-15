import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="fixed bottom-0 left-0 right-0 w-full bg-slate-950/80 border-t border-slate-800/50 py-3 text-center backdrop-blur-md z-30">
      <p className="text-[11px] text-slate-400 font-mono tracking-wider">
        Created By <span className="text-cyan-400 font-bold">VTS PANJANG</span> X{' '}
        <Link
          href="/developers"
          className="text-cyan-400 font-bold hover:text-cyan-300 transition-colors cursor-pointer"
        >
          KP TEKNIK INFORMATIKA ITERA 2026
        </Link>
      </p>
    </footer>
  );
}
