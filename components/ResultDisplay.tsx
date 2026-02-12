
import React, { useState } from 'react';
import { CalculationResult } from '../types';
import { formatCurrency } from '../services/calculators';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  LabelList,
  Legend,
  Cell
} from 'recharts';
// Added Info to the imports below
import { Table, Eye, EyeOff, Building2, TrendingDown, TrendingUp, Target, HandCoins, Info } from 'lucide-react';

interface ResultDisplayProps {
  result: CalculationResult;
  isDebt?: boolean;
}

export const ResultDisplay: React.FC<ResultDisplayProps> = ({ result, isDebt }) => {
  const [showAmortization, setShowAmortization] = useState(false);

  const comparisonData = [
    { 
      label: 'Base', 
      principal: result.principal, 
      interest: 0 
    },
    { 
      label: isDebt ? 'Total Final' : 'Final', 
      principal: result.principal, 
      interest: result.totalInterest 
    }
  ];

  // Colors as requested
  const principalColor = '#1e1b4b'; // Deep Indigo (Indigo 950)
  const principalColorDark = '#312e81'; // Lighter indigo for better visibility
  const interestColorSolid = '#ef4444'; // Bright Contrasting Red
  const investmentGainColor = '#10b981'; // Emerald 500
  const patternId = 'pattern-interest-vibrant';

  // Opportunity Cost Comparison Data
  const opportunityData = result.opportunityCost ? [
    { name: 'Custo do Empréstimo', value: result.totalInterest, color: interestColorSolid },
    { name: 'Ganho do Investimento', value: result.opportunityCost.investmentGain, color: investmentGainColor }
  ] : null;

  return (
    <div className="space-y-6 sm:space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700 w-full">
      {/* Comparison Grid (if available) */}
      {result.comparisonData && (
        <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm w-full">
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg">
              <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h4 className="text-lg font-bold text-slate-800 dark:text-slate-100 tracking-tight">Comparação entre Instituições</h4>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {result.comparisonData.map((bank, idx) => {
              const isBest = bank.totalAmount === Math.min(...(result.comparisonData?.map(b => b.totalAmount) || []));
              return (
                <div key={idx} className={`relative p-5 rounded-2xl border-2 transition-all ${isBest ? 'border-emerald-500 bg-emerald-50/30 dark:bg-emerald-900/10' : 'border-slate-50 dark:border-slate-800 bg-white dark:bg-slate-900/50'}`}>
                  {isBest && (
                    <div className="absolute -top-3 left-4 bg-emerald-500 text-white text-[9px] font-black uppercase px-2 py-1 rounded-full flex items-center gap-1 shadow-lg shadow-emerald-500/20">
                      <TrendingDown className="w-3 h-3" /> Melhor Opção
                    </div>
                  )}
                  <p className="text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-1">{bank.bankName}</p>
                  <p className="text-xl font-black text-slate-800 dark:text-slate-100 mb-4">{bank.rate}% <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase">A.A.</span></p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-500 dark:text-slate-400">Prestação:</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{formatCurrency(bank.installmentValue)}</span>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-500 dark:text-slate-400">Custo Total:</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{formatCurrency(bank.totalAmount)}</span>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-500 dark:text-slate-400">Total Juros:</span>
                      <span className={`font-bold ${isBest ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-400'}`}>{formatCurrency(bank.totalInterest)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Principal Impact Card */}
      <div className="relative overflow-hidden bg-slate-900 dark:bg-black rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-10 lg:p-12 text-white shadow-2xl border border-white/5">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px]" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 bg-purple-500/10 rounded-full blur-[80px]" />
        
        <div className="relative z-10 flex flex-col xl:flex-row justify-between items-start xl:items-end gap-6 sm:gap-8">
          <div className="w-full xl:w-auto">
            <p className="text-blue-200/60 font-bold uppercase tracking-[0.2em] text-[10px] mb-3 sm:mb-4">
              {result.comparisonData ? 'Melhor Opção Encontrada' : (isDebt ? 'Valor Total Estimado' : 'Patrimônio Final')}
            </p>
            <h3 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tighter mb-4 sm:mb-6">
              {formatCurrency(result.totalAmount)}
            </h3>
            <div className="flex flex-wrap gap-2 sm:gap-4 items-center">
              <span className={`px-3 sm:px-4 py-1.5 rounded-full text-[10px] sm:text-xs font-bold ${isDebt ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                {isDebt ? 'Custo da Dívida' : 'Investimento + Juros'}
              </span>
              <span className="text-slate-400 text-[10px] sm:text-xs">
                Base: {formatCurrency(result.principal)}
              </span>
            </div>
          </div>
          
          <div className="bg-white/5 border border-white/10 p-5 sm:p-6 rounded-2xl sm:rounded-3xl backdrop-blur-md w-full xl:w-auto">
            <p className="text-slate-400 text-[10px] font-bold uppercase mb-2">Acúmulo de Juros</p>
            <div className="flex items-baseline gap-2">
              <span className={`text-2xl sm:text-3xl font-bold ${isDebt ? 'text-red-400' : 'text-blue-400'}`}>
                {formatCurrency(result.totalInterest)}
              </span>
            </div>
            <p className="text-slate-500 text-[10px] mt-1 font-semibold">Representa {result.percentageInterest.toFixed(1)}% do valor base</p>
          </div>
        </div>
      </div>

      {/* Opportunity Cost Side-by-Side (New Section) */}
      {result.opportunityCost && (
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm w-full">
           <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
              <div className="flex items-center gap-4">
                <div className="bg-emerald-100 dark:bg-emerald-900/30 p-3 rounded-2xl">
                  <Target className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <h4 className="text-xl font-black text-slate-800 dark:text-white tracking-tight">Custo de Oportunidade</h4>
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mt-0.5">Dívida vs. Investimento</p>
                </div>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/50 px-4 py-2 rounded-xl border border-slate-100 dark:border-slate-700">
                <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mr-2">Referência:</span>
                <span className="text-xs font-black text-emerald-500">{result.opportunityCost.investmentRate}% A.A.</span>
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
              <div className="space-y-6">
                 <div className="p-6 rounded-3xl bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30">
                    <div className="flex items-center gap-3 mb-3">
                       <TrendingUp className="w-5 h-5 text-red-500 rotate-180" />
                       <span className="text-xs font-black text-red-700 dark:text-red-400 uppercase tracking-widest">Custo do Empréstimo</span>
                    </div>
                    <p className="text-3xl font-black text-red-900 dark:text-red-300">{formatCurrency(result.totalInterest)}</p>
                    <p className="text-xs text-red-600 dark:text-red-500/70 mt-2 font-medium">Este é o valor que &ldquo;sai&rdquo; do seu bolso apenas em juros.</p>
                 </div>

                 <div className="p-6 rounded-3xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30">
                    <div className="flex items-center gap-3 mb-3">
                       <TrendingUp className="w-5 h-5 text-emerald-500" />
                       <span className="text-xs font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-widest">Ganho de Investimento</span>
                    </div>
                    <p className="text-3xl font-black text-emerald-900 dark:text-emerald-300">{formatCurrency(result.opportunityCost.investmentGain)}</p>
                    <p className="text-xs text-emerald-600 dark:text-emerald-500/70 mt-2 font-medium">Este é o valor que você &ldquo;deixa de ganhar&rdquo; se não investir.</p>
                 </div>
              </div>

              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                   <BarChart data={opportunityData} layout="vertical" margin={{ left: 20, right: 30, top: 0, bottom: 0 }}>
                      <XAxis type="number" hide />
                      <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }} width={120} />
                      <Tooltip 
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="bg-slate-900 p-3 rounded-xl shadow-xl text-white text-[11px] font-bold">
                                {formatCurrency(payload[0].value as number)}
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Bar dataKey="value" barSize={40} radius={[0, 10, 10, 0]}>
                         {opportunityData?.map((entry, index) => (
                           <Cell key={`cell-${index}`} fill={entry.color} />
                         ))}
                         <LabelList dataKey="value" position="right" formatter={(val: number) => formatCurrency(val)} style={{ fontSize: '10px', fontWeight: '900', fill: '#64748b' }} />
                      </Bar>
                   </BarChart>
                </ResponsiveContainer>
              </div>
           </div>

           <div className="mt-8 p-6 bg-slate-50 dark:bg-slate-800/30 rounded-2xl flex items-start gap-4">
              {/* Using Info icon which is now imported */}
              <Info className="w-5 h-5 text-blue-500 shrink-0 mt-1" />
              <p className="text-xs font-medium text-slate-600 dark:text-slate-400 leading-relaxed">
                <strong>Análise de Oportunidade:</strong> Se a rentabilidade do seu investimento for maior que a taxa do empréstimo, você estaria tecnicamente perdendo dinheiro ao tomar o crédito em vez de utilizar capital próprio investido. Atualmente, o custo total dos juros superaria seu rendimento em <span className="font-bold text-red-500">{formatCurrency(Math.abs(result.totalInterest - result.opportunityCost.investmentGain))}</span> ao final do período.
              </p>
           </div>
        </div>
      )}

      {/* Grid for Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8 w-full">
        <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col w-full">
          <h4 className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-100 mb-6 sm:mb-8 flex justify-between items-center">
            Proporção de Custo
            <span className="text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-3 py-1 rounded-full uppercase">Impacto Visual</span>
          </h4>
          <div className="h-64 sm:h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonData} margin={{ top: 20, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <pattern id="pattern-interest-vibrant" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                    <rect width="6" height="6" fill="#ef4444" />
                    <line x1="0" y1="0" x2="0" y2="6" stroke="#ffffff" strokeWidth="1.5" strokeOpacity="0.25" />
                  </pattern>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" className="dark:opacity-5" />
                <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }} />
                <YAxis hide />
                <Tooltip 
                  cursor={{ fill: '#f8fafc', opacity: 0.1 }} 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const pData = payload[0]?.payload;
                      const pValue = payload[0]?.value as number || 0;
                      const iValue = payload[1]?.value as number || 0;
                      const total = pValue + iValue;
                      return (
                        <div className="bg-slate-900 dark:bg-black p-3 sm:p-4 rounded-xl sm:rounded-2xl shadow-xl border border-slate-800 dark:border-slate-700 text-white min-w-[140px]">
                          <p className="text-slate-400 text-[9px] font-bold uppercase mb-2 border-b border-white/10 pb-1">
                            {pData?.label || ''}
                          </p>
                          <div className="space-y-1.5">
                            <div className="flex justify-between gap-4">
                              <span className="text-[10px] text-slate-400">Principal:</span>
                              <span className="text-[10px] font-bold">{formatCurrency(pValue)}</span>
                            </div>
                            {iValue > 0 && (
                              <div className="flex justify-between gap-4">
                                <span className="text-[10px] text-slate-400">Juros:</span>
                                <span className="text-[10px] font-bold text-red-400">
                                  {formatCurrency(iValue)}
                                </span>
                              </div>
                            )}
                            <div className="flex justify-between gap-4 pt-1 border-t border-white/10">
                              <span className="text-[10px] font-bold">Total:</span>
                              <span className="text-[10px] font-bold">{formatCurrency(total)}</span>
                            </div>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }} 
                />
                <Legend 
                  verticalAlign="bottom" 
                  height={36} 
                  iconType="rect" 
                  iconSize={12} 
                  formatter={(value) => <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 capitalize">{value === 'interest' ? 'Juros (Impacto)' : 'Principal (Base)'}</span>} 
                />
                <Bar 
                  dataKey="principal" 
                  stackId="total" 
                  fill={document.documentElement.classList.contains('dark') ? principalColorDark : principalColor} 
                  radius={result.totalInterest > 0 ? [0, 0, 12, 12] : [12, 12, 12, 12]} 
                  barSize={65}
                >
                   <LabelList dataKey="principal" position="center" content={(props: any) => {
                      const { x, y, width, height, value, payload } = props;
                      if (!payload || height < 25) return null;
                      const interest = payload.interest || 0;
                      const total = value + interest;
                      const percentage = ((value / total) * 100).toFixed(0);
                      return <text x={x + width / 2} y={y + height / 2} fill="#ffffff" textAnchor="middle" dominantBaseline="middle" style={{ fontSize: '11px', fontWeight: '900' }}>{percentage}%</text>;
                    }} />
                </Bar>
                <Bar 
                  dataKey="interest" 
                  stackId="total" 
                  fill={`url(#${patternId})`} 
                  stroke={interestColorSolid}
                  strokeWidth={1}
                  radius={[12, 12, 0, 0]} 
                  barSize={65}
                >
                  <LabelList dataKey="interest" position="center" content={(props: any) => {
                      const { x, y, width, height, payload } = props;
                      if (!payload || height < 20) return null;
                      const interest = payload.interest || 0;
                      const principal = payload.principal || 1;
                      const total = principal + interest;
                      const percentage = ((interest / total) * 100).toFixed(0);
                      return <text x={x + width / 2} y={y + height / 2} fill="#ffffff" textAnchor="middle" dominantBaseline="middle" style={{ fontSize: '12px', fontWeight: '900', filter: 'drop-shadow(0px 1px 3px rgba(0,0,0,0.6))' }}>{percentage}%</text>;
                    }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col w-full">
          <h4 className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-100 mb-6 sm:mb-8">Progressão Acumulada</h4>
          <div className="h-64 sm:h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={result.timeSeries} margin={{ left: -20, right: 10 }}>
                <defs>
                  <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={interestColorSolid} stopOpacity={0.2}/>
                    <stop offset="95%" stopColor={interestColorSolid} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" className="dark:opacity-5" />
                <XAxis dataKey="name" hide />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#94a3b8' }} tickFormatter={(val) => `R$${val/1000}k`} />
                <Tooltip content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-white dark:bg-slate-800 p-3 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700">
                        <p className="text-slate-400 dark:text-slate-500 text-[9px] font-bold uppercase tracking-wider mb-1">{payload[0].payload.name}</p>
                        <p className="text-slate-900 dark:text-slate-100 font-black text-sm">{formatCurrency(payload[0].value as number)}</p>
                      </div>
                    );
                  }
                  return null;
                }} />
                <Area type="monotone" dataKey="value" stroke={interestColorSolid} strokeWidth={3} fillOpacity={1} fill="url(#colorVal)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className={`p-6 sm:p-10 rounded-[2rem] sm:rounded-[2.5rem] text-center border-2 border-dashed ${isDebt ? 'bg-red-50/50 dark:bg-red-900/10 border-red-200 dark:border-red-800' : 'bg-indigo-50/50 dark:bg-indigo-900/10 border-indigo-200 dark:border-indigo-800'}`}>
        <p className={`text-lg sm:text-xl md:text-2xl font-black tracking-tight leading-snug ${isDebt ? 'text-red-900 dark:text-red-400' : 'text-indigo-900 dark:text-indigo-400'}`}>
          &ldquo;{result.impactMessage}&rdquo;
        </p>
      </div>

      {isDebt && result.amortizationSchedule && !result.comparisonData && (
        <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm w-full overflow-hidden">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div className="flex items-center gap-3">
              <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded-lg"><Table className="w-5 h-5 text-slate-600 dark:text-slate-400" /></div>
              <h4 className="text-lg font-bold text-slate-800 dark:text-slate-100 tracking-tight">Cronograma de Parcelas</h4>
            </div>
            <button onClick={() => setShowAmortization(!showAmortization)} className="flex items-center gap-2 px-4 py-2 bg-slate-900 dark:bg-slate-700 text-white rounded-xl text-xs font-bold hover:bg-slate-800 dark:hover:bg-slate-600 transition-colors shadow-lg shadow-slate-900/10 active:scale-95">
              {showAmortization ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
              {showAmortization ? 'Ocultar Detalhes' : 'Ver Amortização Completa'}
            </button>
          </div>
          {showAmortization && (
            <div className="overflow-x-auto -mx-6 sm:mx-0">
              <table className="min-w-full divide-y divide-slate-100 dark:divide-slate-800">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/50">
                    <th className="px-4 py-4 text-left text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Parcela</th>
                    <th className="px-4 py-4 text-left text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Prestação</th>
                    <th className="px-4 py-4 text-left text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Amortização</th>
                    <th className="px-4 py-4 text-left text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Juros</th>
                    <th className="px-4 py-4 text-left text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Saldo Devedor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-800 bg-white dark:bg-slate-900">
                  {result.amortizationSchedule.map((row) => (
                    <tr key={row.period} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="whitespace-nowrap px-4 py-4 text-xs font-bold text-slate-500 dark:text-slate-400">#{row.period}</td>
                      <td className="whitespace-nowrap px-4 py-4 text-xs font-black text-slate-900 dark:text-slate-200">{formatCurrency(row.installment)}</td>
                      <td className="whitespace-nowrap px-4 py-4 text-xs font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(row.principalPaid)}</td>
                      <td className="whitespace-nowrap px-4 py-4 text-xs font-bold text-red-400 dark:text-red-500">{formatCurrency(row.interestPaid)}</td>
                      <td className="whitespace-nowrap px-4 py-4 text-xs font-black text-slate-900 dark:text-slate-200">{formatCurrency(row.remainingBalance)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {!showAmortization && <div className="text-center py-6 text-slate-400 dark:text-slate-500 text-xs font-medium">Clique no botão acima para ver como sua dívida diminui mês a mês.</div>}
        </div>
      )}
    </div>
  );
};
