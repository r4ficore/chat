import React from 'react';
import { SlidersHorizontal } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <div className="mt-auto w-full border-t border-slate-200 dark:border-[#222222] bg-white/60 dark:bg-[#2a2a2a]/60 backdrop-blur-md transition-colors duration-300 flex-none z-50 h-[55px]">
      <div className="max-w-[1800px] mx-auto px-6 h-full flex items-center justify-between">
        <div className="flex items-center gap-6 h-full">
          <button className="text-xs font-medium text-slate-500 dark:text-[#666] hover:text-jet dark:hover:text-white transition-colors tracking-wide uppercase font-mono">Nowy Czat</button>
          <button className="text-xs font-medium text-slate-500 dark:text-[#666] hover:text-jet dark:hover:text-white transition-colors tracking-wide uppercase font-mono">Historia</button>
        </div>

        <div className="w-[200px] flex items-center gap-3">
          <div className="flex-1 flex flex-col gap-1">
            <div className="flex items-center justify-between text-[9px] font-mono text-slate-500 dark:text-[#666]">
              <span>MEMORY</span>
              <span className="text-gold font-bold">42%</span>
            </div>
            <div className="w-full h-1.5 bg-slate-200 dark:bg-[#000000] rounded-full overflow-hidden">
              <div className="h-full bg-gold w-[42%] shadow-[0_0_5px_rgba(214,179,118,0.5)]"></div>
            </div>
          </div>
          <button title="Ustawienia Kontekstu" className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 dark:border-[#222] text-slate-500 dark:text-[#666] hover:text-gold hover:border-gold hover:bg-gold/5 transition-all">
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};