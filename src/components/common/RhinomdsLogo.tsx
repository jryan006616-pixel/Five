import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
}

export const RhinomdsLogo: React.FC<LogoProps> = ({
  size = 'md',
  showText = true,
  className = '',
}) => {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-11 h-11',
    xl: 'w-14 h-14',
  };

  const textSizes = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl',
  };

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Futuristic Geometric Rhino Emblem */}
      <div className={`relative flex items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 via-sky-600 to-slate-900 p-0.5 shadow-lg shadow-cyan-500/20 group`}>
        <div className="absolute inset-0 rounded-xl bg-cyan-400/30 blur-sm opacity-50 group-hover:opacity-100 transition-opacity"></div>
        <div className={`${iconSizes[size]} relative rounded-[10px] bg-[#0c121e] flex items-center justify-center p-1.5 overflow-hidden`}>
          {/* Futuristic stylized Rhino Horn / Geometric Shield SVG */}
          <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full text-cyan-400">
            {/* Rhino Armor Face */}
            <path
              d="M50 12 L78 28 L72 65 L50 90 L28 65 L22 28 Z"
              stroke="currentColor"
              strokeWidth="6"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="opacity-90"
            />
            {/* Powerful Primary Rhino Horn */}
            <path
              d="M50 20 L58 48 L50 44 L42 48 Z"
              fill="url(#rhinoGrad)"
              stroke="#38bdf8"
              strokeWidth="3"
              strokeLinejoin="round"
            />
            {/* Secondary Nose Horn */}
            <path
              d="M50 48 L55 64 L50 60 L45 64 Z"
              fill="#06b6d4"
              stroke="#0ea5e9"
              strokeWidth="2"
            />
            {/* Futuristic Tech Lines / Medical Cross Elements */}
            <line x1="32" y1="44" x2="40" y2="44" stroke="#38bdf8" strokeWidth="4" strokeLinecap="round" />
            <line x1="60" y1="44" x2="68" y2="44" stroke="#38bdf8" strokeWidth="4" strokeLinecap="round" />
            
            <defs>
              <linearGradient id="rhinoGrad" x1="50" y1="20" x2="50" y2="48" gradientUnits="userSpaceOnUse">
                <stop stopColor="#38bdf8" />
                <stop offset="1" stopColor="#0284c7" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>

      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1">
            <span className={`font-['Space_Grotesk'] font-bold tracking-tight text-white ${textSizes[size]}`}>
              RHINO<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-sky-400">MDS</span>
            </span>
            <span className="px-1.5 py-0.5 text-[9px] font-mono font-bold uppercase tracking-wider text-cyan-300 bg-cyan-950/80 border border-cyan-800/60 rounded">
              PORTAL
            </span>
          </div>
          <span className="text-[10px] font-medium tracking-wider text-slate-400 uppercase">
            Medical Billing & RCM Workforce
          </span>
        </div>
      )}
    </div>
  );
};
