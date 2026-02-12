
import React from 'react';

interface InputProps {
  label: string;
  value: number;
  onChange: (val: number) => void;
  prefix?: string;
  suffix?: string;
  step?: number;
  min?: number;
}

export const FinanceInput: React.FC<InputProps> = ({ label, value, onChange, prefix, suffix, step = 1, min = 0 }) => (
  <div className="flex flex-col gap-1.5 sm:gap-2 w-full">
    <label className="text-[10px] sm:text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider ml-1">{label}</label>
    <div className="relative group">
      <div className="absolute inset-0 bg-blue-500/5 dark:bg-blue-400/5 rounded-xl sm:rounded-2xl blur-xl group-focus-within:bg-blue-500/10 dark:group-focus-within:bg-blue-400/10 transition-all opacity-0 group-focus-within:opacity-100" />
      <div className="relative flex items-center">
        {prefix && (
          <span className="absolute left-4 text-slate-900 dark:text-white font-bold text-base sm:text-lg">
            {prefix}
          </span>
        )}
        <input
          type="number"
          inputMode="decimal"
          value={value}
          min={min}
          step={step}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          className={`w-full bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-xl sm:rounded-2xl py-3 sm:py-4 px-4 sm:px-5 text-lg sm:text-xl font-bold text-slate-800 dark:text-white focus:ring-4 focus:ring-blue-500/10 dark:focus:ring-blue-400/10 focus:border-blue-500 dark:focus:border-blue-400 outline-none transition-all shadow-sm ${prefix ? 'pl-11 sm:pl-12' : ''} ${suffix ? 'pr-12 sm:pr-14' : ''}`}
        />
        {suffix && (
          <span className="absolute right-4 sm:right-5 text-slate-400 dark:text-slate-500 font-bold text-sm sm:text-base">
            {suffix}
          </span>
        )}
      </div>
    </div>
  </div>
);
