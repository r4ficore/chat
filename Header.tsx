import React, { useState, useEffect, useRef } from 'react';
import { Bell, Sun, Moon, Monitor, LayoutGrid } from 'lucide-react';
import { AppMode } from '../types';

interface HeaderProps {
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
  activeMode: AppMode;
  onModeSelect: (mode: AppMode) => void;
  onOpenLauncher: () => void;
}

export const Header: React.FC<HeaderProps> = ({ darkMode, setDarkMode, activeMode, onModeSelect, onOpenLauncher }) => {
  const [sessionId] = useState(() => Math.floor(100000 + Math.random() * 900000));
  const [status, setStatus] = useState<'active' | 'waking-up' | 'inactive'>('active');
  const [inactiveTimeStr, setInactiveTimeStr] = useState('');
  
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);
  const wakeUpTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(Date.now());

  const INACTIVITY_LIMIT = 3 * 60 * 1000;

  useEffect(() => {
    startInactivityTimer();

    const handleActivity = () => {
        const now = Date.now();
        lastActivityRef.current = now;

        if (status === 'inactive') {
            if (!wakeUpTimerRef.current) {
                setStatus('waking-up');
                wakeUpTimerRef.current = setTimeout(() => {
                    setStatus('active');
                    wakeUpTimerRef.current = null;
                    startInactivityTimer();
                }, 3000);
            }
        } else if (status === 'active') {
            startInactivityTimer();
        }
    };

    function startInactivityTimer() {
        if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
        inactivityTimerRef.current = setTimeout(() => {
            setStatus('inactive');
            const date = new Date();
            setInactiveTimeStr(date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
        }, INACTIVITY_LIMIT);
    }

    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('keydown', handleActivity);
    window.addEventListener('click', handleActivity);

    return () => {
        if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
        if (wakeUpTimerRef.current) clearTimeout(wakeUpTimerRef.current);
        window.removeEventListener('mousemove', handleActivity);
        window.removeEventListener('keydown', handleActivity);
        window.removeEventListener('click', handleActivity);
    };
  }, [status]);

  const modes: AppMode[] = ['CORE', 'VISION', 'STORY', 'VALUE', 'SCALE'];

  return (
    <header className="w-full border-b border-slate-200 dark:border-[#222222] bg-white/60 dark:bg-[#2a2a2a]/60 backdrop-blur-md sticky top-0 z-50 transition-colors duration-300 h-[55px] flex-none">
      <div className="max-w-[1800px] mx-auto px-6 h-full flex items-center justify-between relative">
        
        {/* Left: Launcher & Session */}
        <div className="flex items-center z-20">
            <button 
                onClick={onOpenLauncher}
                title="Otwórz Narzędzia" 
                className="p-2 mr-4 rounded-lg text-slate-400 hover:text-jet dark:hover:text-white hover:bg-slate-100 dark:hover:bg-graphite transition-all"
            >
                <LayoutGrid className="w-[