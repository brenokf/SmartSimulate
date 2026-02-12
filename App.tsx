
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { 
  CalculatorType, 
  CalculationResult 
} from './types';
import { 
  calculateCompoundInterest, 
  calculateLoan,
  calculateRetirement,
  calculateBankComparison,
  calculateFII,
  formatCurrency
} from './services/calculators';
import { FinanceInput } from './components/CalculatorInputs';
import { ResultDisplay } from './components/ResultDisplay';
import { 
  TrendingUp, 
  HandCoins, 
  Home, 
  PiggyBank, 
  CalendarClock,
  ChevronLeft,
  ArrowRight,
  ShieldCheck,
  Zap,
  Building2,
  Plus,
  Trash2,
  Building,
  Globe,
  RefreshCw,
  Coins,
  Sun,
  Moon,
  ArrowLeftRight,
  Search,
  ArrowDownUp,
  Info,
  Clock,
  ExternalLink,
  Target,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

// Constantes de atualização e API
const CACHE_DURATION = 15 * 60 * 1000; // 15 minutos
const REFRESH_INTERVAL = 15 * 60 * 1000; // 15 minutos
const API_TOKEN = (import.meta.env.VITE_AWESOME_API_TOKEN || '').trim();
const MAX_PAIRS_PER_CYCLE = 10;
const PAIRS_PER_REQUEST = 2;

// Lista de pares válidos (base BRL) + turismo/PTAX principais
const CURRENCY_PAIRS = [
  'USD-BRL',
  'EUR-BRL',
  'GBP-BRL',
  'JPY-BRL',
  'CHF-BRL',
  'CAD-BRL',
  'AUD-BRL',
  'CNY-BRL',
  'ARS-BRL',
  'CLP-BRL',
  'MXN-BRL',
  'BTC-BRL',
  'ETH-BRL',
  'LTC-BRL',
  'XRP-BRL',
  'DOGE-BRL',
  'SOL-BRL',
  'BNB-BRL',
  'SGD-BRL',
  'NZD-BRL',
  'HKD-BRL',
  'DKK-BRL',
  'NOK-BRL',
  'SEK-BRL',
  'PLN-BRL',
  'TRY-BRL',
  'THB-BRL',
  'AED-BRL',
  'SAR-BRL',
  'KRW-BRL',
  'INR-BRL',
  'RUB-BRL',
  'ZAR-BRL',
  'COP-BRL',
  'PEN-BRL',
  'UYU-BRL',
  'PYG-BRL',
  'BOB-BRL',
  'USD-BRLT',
  'EUR-BRLT',
  'USD-BRLPTAX',
  'EUR-BRLPTAX'
];

interface RateData {
  bid: number;
  pctChange: string;
}

interface RateCacheEntry {
  rates: Record<string, RateData>;
  timestamp: number;
}

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<CalculatorType | null>(null);
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    if (isDarkMode) {
      html.classList.add('dark');
      body.classList.remove('light');
      body.classList.add('dark');
    } else {
      html.classList.remove('dark');
      body.classList.remove('dark');
      body.classList.add('light');
    }
  }, [isDarkMode]);

  // Form States
  const [amount, setAmount] = useState(5000);
  const [rate, setRate] = useState(12);
  const [time, setTime] = useState(24);
  const [extra, setExtra] = useState(200);
  const [age, setAge] = useState(30);
  const [retireAge, setRetireAge] = useState(65);
  const [appreciation, setAppreciation] = useState(5);
  const [expectedReturn, setExpectedReturn] = useState(10.75);

  const [comparisonBanks, setComparisonBanks] = useState<{ name: string; rate: number }[]>([
    { name: 'Banco A', rate: 12 },
    { name: 'Banco B', rate: 10.5 }
  ]);

  // Currency Converter States
  const [inputValue, setInputValue] = useState(1);
  const [baseCurrency, setBaseCurrency] = useState('USD');
  const [targetCurrency, setTargetCurrency] = useState('BRL');
  const [rates, setRates] = useState<Record<string, RateData>>({ BRL: { bid: 1, pctChange: '0' } });
  const [loadingRates, setLoadingRates] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [currencySearch, setCurrencySearch] = useState('');
  
  const rateCache = useRef<Record<string, RateCacheEntry>>({});

  const currencyNames: Record<string, {name: string, flag: string}> = {
    BRL: { name: 'Real Brasileiro', flag: '🇧🇷' },
    USD: { name: 'Dólar Americano', flag: '🇺🇸' },
    EUR: { name: 'Euro', flag: '🇪🇺' },
    GBP: { name: 'Libra Esterlina', flag: '🇬🇧' },
    JPY: { name: 'Iene Japonês', flag: '🇯🇵' },
    CHF: { name: 'Franco Suíço', flag: '🇨🇭' },
    CAD: { name: 'Dólar Canadense', flag: '🇨🇦' },
    AUD: { name: 'Dólar Australiano', flag: '🇦🇺' },
    CNY: { name: 'Yuan Chinês', flag: '🇨🇳' },
    ARS: { name: 'Peso Argentino', flag: '🇦🇷' },
    CLP: { name: 'Peso Chileno', flag: '🇨🇱' },
    MXN: { name: 'Peso Mexicano', flag: '🇲🇽' },
    BTC: { name: 'Bitcoin', flag: '₿' },
    ETH: { name: 'Ethereum', flag: 'Ξ' },
  };

  const fetchRates = useCallback(async (forceRefresh: boolean = false) => {
    const now = Date.now();
    const cacheKey = 'AWESOME_API_RATES_V2';
    const cachedEntry = rateCache.current[cacheKey];
    const hasApiToken = API_TOKEN.length > 0;

    if (!forceRefresh && cachedEntry && (now - cachedEntry.timestamp) < CACHE_DURATION) {
      setRates(cachedEntry.rates);
      setLastUpdated(new Date(cachedEntry.timestamp).toLocaleTimeString('pt-BR'));
      return;
    }

    setLoadingRates(true);
    try {
      const pairsToLoad = CURRENCY_PAIRS.slice(0, MAX_PAIRS_PER_CYCLE);
      const queryToken = hasApiToken ? `?token=${encodeURIComponent(API_TOKEN)}` : '';
      const progressiveRates: Record<string, RateData> = { BRL: { bid: 1, pctChange: '0' } };

      if (cachedEntry?.rates) {
        Object.assign(progressiveRates, cachedEntry.rates);
      }

      for (let index = 0; index < pairsToLoad.length; index += PAIRS_PER_REQUEST) {
        const pairChunk = pairsToLoad.slice(index, index + PAIRS_PER_REQUEST);
        const pairPath = pairChunk.join(',');

        try {
          let response = await fetch(`https://economia.awesomeapi.com.br/json/last/${pairPath}${queryToken}`, {
            cache: 'no-store',
            headers: {
              'Cache-Control': 'no-cache'
            }
          });

          if (!response.ok && hasApiToken) {
            response = await fetch(`https://economia.awesomeapi.com.br/json/last/${pairPath}`, {
              cache: 'no-store',
              headers: {
                'Cache-Control': 'no-cache'
              }
            });
          }

          if (!response.ok) {
            continue;
          }

          const payload = await response.json();
          if (!payload || payload.status === 404) {
            continue;
          }

          Object.keys(payload).forEach((key) => {
            const item = payload[key];
            const parsedBid = Number.parseFloat(item?.bid);
            if (item && Number.isFinite(parsedBid) && parsedBid > 0) {
              const currencyCode = item.code || key.replace('BRLPTAX', '').replace('BRLT', '').replace('BRL', '');
              if (currencyCode) {
                progressiveRates[currencyCode] = {
                  bid: parsedBid,
                  pctChange: item.pctChange || '0'
                };
              }
            }
          });

          setRates({ ...progressiveRates });
        } catch {
          continue;
        }
      }

      const newRates = { ...progressiveRates };
      
      if (Object.keys(newRates).length > 1) {
        const timestamp = Date.now();

        rateCache.current[cacheKey] = {
          rates: newRates,
          timestamp: timestamp
        };

        setRates(newRates);
        setLastUpdated(new Date(timestamp).toLocaleTimeString('pt-BR'));
      } else if (cachedEntry) {
        setRates(cachedEntry.rates);
        setLastUpdated(new Date(cachedEntry.timestamp).toLocaleTimeString('pt-BR'));
      }
    } catch (error) {
      console.error('Erro ao buscar cotações na AwesomeAPI:', error);
      if (cachedEntry) {
        setRates(cachedEntry.rates);
        setLastUpdated(new Date(cachedEntry.timestamp).toLocaleTimeString('pt-BR'));
      }
    } finally {
      setLoadingRates(false);
    }
  }, []);

  useEffect(() => {
    let intervalId: number;
    if (activeTab === 'CURRENCY_CONVERTER') {
      fetchRates();
      intervalId = window.setInterval(() => fetchRates(true), REFRESH_INTERVAL);
    }
    return () => { if (intervalId) window.clearInterval(intervalId); };
  }, [activeTab, fetchRates]);

  const allAvailableCurrencies = useMemo(() => {
    return Object.keys(rates).sort();
  }, [rates]);

  const convertedValue = useMemo(() => {
    if (loadingRates) return 0;
    const baseRate = rates[baseCurrency]?.bid || 1;
    const targetRate = rates[targetCurrency]?.bid || 1;
    const valInBRL = baseCurrency === 'BRL' ? inputValue : inputValue * baseRate;
    return targetCurrency === 'BRL' ? valInBRL : valInBRL / targetRate;
  }, [inputValue, baseCurrency, targetCurrency, rates, loadingRates]);

  const exchangeRateInfo = useMemo(() => {
    const baseToBrl = rates[baseCurrency]?.bid || 1;
    const targetToBrl = rates[targetCurrency]?.bid || 1;
    return baseToBrl / targetToBrl;
  }, [baseCurrency, targetCurrency, rates]);

  const swapCurrencies = () => {
    const oldBase = baseCurrency;
    const oldTarget = targetCurrency;
    setBaseCurrency(oldTarget);
    setTargetCurrency(oldBase);
  };

  const filteredCurrenciesList = useMemo(() => {
    return allAvailableCurrencies.filter(code => 
      code.toLowerCase().includes(currencySearch.toLowerCase()) || 
      (currencyNames[code]?.name || '').toLowerCase().includes(currencySearch.toLowerCase())
    );
  }, [allAvailableCurrencies, currencySearch]);

  const resetFields = () => {
    setAmount(5000);
    setRate(activeTab === 'INVESTMENT_FUNDO_IMOBILIARIO' ? 0.8 : 12);
    setTime(24);
    setExtra(200);
    setAge(30);
    setRetireAge(65);
    setAppreciation(5);
    setExpectedReturn(10.75);
    setResult(null);
    setComparisonBanks([{ name: 'Banco A', rate: 12 }, { name: 'Banco B', rate: 10.5 }]);
  };

  const handleCalculate = () => {
    if (!activeTab) return;
    let res: CalculationResult | null = null;
    switch (activeTab) {
      case 'COMPOUND_INTEREST': res = calculateCompoundInterest(amount, rate / 12, time, extra); break;
      case 'LOAN': case 'FINANCING': res = calculateLoan(amount, rate, time); break;
      case 'SAVINGS': res = calculateCompoundInterest(amount, (rate || 10.75) / 12, time, extra); break;
      case 'RETIREMENT': res = calculateRetirement(age, retireAge, amount, extra, extra, rate); break;
      case 'CREDIT_CARD': res = calculateLoan(amount, 14.5 * 12, time); break;
      case 'COMPARISON': res = calculateBankComparison(amount, time, comparisonBanks, expectedReturn); break;
      case 'INVESTMENT_FUNDO_IMOBILIARIO': res = calculateFII(amount, extra, rate, appreciation, time); break;
    }
    setResult(res);
  };

  const addComparisonBank = () => {
    if (comparisonBanks.length < 6) {
      setComparisonBanks([...comparisonBanks, { name: `Banco ${String.fromCharCode(65 + comparisonBanks.length)}`, rate: 12 }]);
    }
  };

  const removeComparisonBank = (index: number) => {
    if (comparisonBanks.length > 2) setComparisonBanks(comparisonBanks.filter((_, i) => i !== index));
  };

  const updateComparisonBank = (index: number, field: 'name' | 'rate', value: string | number) => {
    const newBanks = [...comparisonBanks];
    newBanks[index] = { ...newBanks[index], [field]: value };
    setComparisonBanks(newBanks);
  };

  const calculators = [
    { id: 'COMPOUND_INTEREST', name: 'Juros Compostos', icon: TrendingUp, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-950/50', desc: 'Simule o crescimento exponencial do seu patrimônio.' },
    { id: 'LOAN', name: 'Empréstimos', icon: HandCoins, color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-950/50', desc: 'Descubra quanto você realmente vai pagar ao banco.' },
    { id: 'FINANCING', name: 'Financiamento', icon: Home, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-950/50', desc: 'Planeje a compra do seu imóvel ou veículo.' },
    { id: 'SAVINGS', name: 'CDB / CDI', icon: PiggyBank, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/50', desc: 'Compare rendimentos de renda fixa.' },
    { id: 'INVESTMENT_FUNDO_IMOBILIARIO', name: 'Fundos Imobiliários', icon: Building, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/50', desc: 'Simule dividendos mensais e valorização de cotas.' },
    { id: 'CURRENCY_CONVERTER', name: 'Conversor Global', icon: Globe, color: 'text-cyan-600 dark:text-cyan-400', bg: 'bg-cyan-50 dark:bg-cyan-950/50', desc: 'Câmbio comercial real em tempo real via AwesomeAPI.' },
    { id: 'RETIREMENT', name: 'Aposentadoria', icon: CalendarClock, color: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-50 dark:bg-violet-950/50', desc: 'Quanto você precisa para viver de renda?' },
    { id: 'COMPARISON', name: 'Comparador de Bancos', icon: Building2, color: 'text-blue-700 dark:text-blue-300', bg: 'bg-blue-100 dark:bg-blue-950/60', desc: 'Compare taxas de diferentes bancos lado a lado.' },
  ];

  const popularGrid = ['USD', 'EUR', 'GBP', 'BTC', 'ARS', 'BRL', 'CAD', 'ETH'];
  const defaultGridCurrencies = useMemo(() => {
    const popularAvailable = popularGrid.filter((code) => code === 'BRL' || !!rates[code]);
    if (popularAvailable.length > 0) {
      return popularAvailable;
    }

    const allAvailable = allAvailableCurrencies.filter((code) => code === 'BRL' || !!rates[code]);
    return allAvailable.length > 0 ? allAvailable : ['BRL'];
  }, [rates, allAvailableCurrencies]);

  return (
    <div className="w-full min-h-screen transition-all duration-700 ease-in-out bg-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-16">
        <header className="flex flex-col md:flex-row justify-between items-center mb-10 md:mb-20 gap-8">
          <div className="text-center md:text-left w-full md:w-auto">
            <div className="inline-flex items-center gap-2 bg-blue-600/5 dark:bg-blue-400/10 text-blue-600 dark:text-blue-400 px-4 py-2 rounded-full text-[10px] md:text-xs font-extrabold uppercase tracking-widest mb-4">
              <Zap className="w-3 h-3 fill-current" /> Educação Financeira de Elite
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold text-slate-900 dark:text-white tracking-tighter leading-tight">
              Smart<span className="text-blue-600 dark:text-blue-400">Simulate.</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-4 text-base sm:text-lg lg:text-xl font-medium max-w-lg mx-auto md:mx-0">
              Cálculos precisos com cotações de mercado real em tempo real.
            </p>
          </div>
          <div className="flex gap-4 items-center">
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-3 rounded-2xl bg-white/80 dark:bg-slate-900/80 glass-card border border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400 premium-shadow hover:scale-110 active:scale-95 transition-all"
            >
              {isDarkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-indigo-600" />}
            </button>
          </div>
        </header>

        {!activeTab ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {calculators.map((calc) => (
              <button key={calc.id} onClick={() => { setActiveTab(calc.id as CalculatorType); resetFields(); }} className="group bg-white/70 dark:bg-slate-900/70 glass-card p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] border border-slate-100/50 dark:border-slate-800/50 premium-shadow hover:shadow-2xl hover:-translate-y-1 transition-all text-left flex flex-col gap-4 relative overflow-hidden">
                <div className={`${calc.bg} ${calc.color} p-4 rounded-2xl w-fit relative z-10 group-hover:scale-110 transition-transform`}><calc.icon className="w-6 h-6 sm:w-8" /></div>
                <div className="relative z-10">
                  <h3 className="text-xl sm:text-2xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">{calc.name}</h3>
                  <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium leading-relaxed text-sm sm:text-base">{calc.desc}</p>
                </div>
                <div className="mt-auto flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold text-[10px] uppercase tracking-wider">
                  Abrir <ArrowRight className="w-4 h-4" />
                </div>
              </button>
            ))}
          </div>
        ) : activeTab === 'CURRENCY_CONVERTER' ? (
          <div className="animate-in fade-in zoom-in-95 duration-500">
            <button onClick={() => setActiveTab(null)} className="group flex items-center gap-2 text-slate-400 dark:text-slate-500 hover:text-slate-800 mb-6 font-bold transition-colors uppercase text-[10px] tracking-widest">
              <ChevronLeft className="w-4 h-4" /> Voltar ao Painel
            </button>
            
            <div className="max-w-6xl mx-auto space-y-8 sm:space-y-12">
              <div className="bg-white/90 dark:bg-slate-900/90 glass-card p-6 sm:p-12 rounded-[2.5rem] sm:rounded-[3.5rem] premium-shadow border border-slate-100 dark:border-slate-800 overflow-hidden relative">
                <div className="absolute top-0 right-0 p-4 sm:p-8 flex items-center gap-4">
                  <button onClick={() => fetchRates(true)} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-cyan-600 transition-all">
                    <RefreshCw className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${loadingRates ? 'animate-spin' : ''}`} /> Sincronizar
                  </button>
                </div>
                
                <div className="flex flex-col items-center text-center mb-10 sm:mb-16">
                  <div className="bg-cyan-100 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 p-4 sm:p-5 rounded-[1.5rem] sm:rounded-[2rem] mb-4 sm:mb-6 shadow-2xl shadow-cyan-500/20">
                    <Globe className="w-10 h-10 sm:w-12 sm:h-12" />
                  </div>
                  <h2 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tighter mb-4">Mercado em Tempo Real</h2>
                  <div className="inline-flex items-center gap-3 bg-slate-50 dark:bg-slate-800/50 px-4 sm:px-6 py-2 rounded-full border border-slate-100 dark:border-slate-700">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                    <p className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                      {lastUpdated ? `Sync: ${lastUpdated}` : 'Conectando ao núcleo AwesomeAPI...'}
                    </p>
                  </div>
                </div>

                <div className="max-w-4xl mx-auto">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-center">
                    <div className="lg:col-span-5 space-y-4">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Moeda Base</label>
                      <div className="bg-slate-50 dark:bg-slate-800/80 p-5 sm:p-6 rounded-[2rem] sm:rounded-[2.5rem] border border-transparent focus-within:border-cyan-500/30 transition-all group">
                        <div className="flex items-center gap-4 mb-4">
                          <span className="text-3xl sm:text-4xl group-hover:scale-110 transition-transform">{currencyNames[baseCurrency]?.flag || '🏳️'}</span>
                          <select value={baseCurrency} onChange={(e) => setBaseCurrency(e.target.value)} className="flex-1 bg-transparent border-none font-black text-xl sm:text-2xl text-slate-800 dark:text-white outline-none cursor-pointer appearance-none">
                            {allAvailableCurrencies.map(code => (
                              <option key={code} value={code} className="bg-white dark:bg-slate-900 text-slate-800 dark:text-white">
                                {code} - {currencyNames[code]?.name || 'Moeda'}
                              </option>
                            ))}
                          </select>
                        </div>
                        <input type="number" value={inputValue} onChange={(e) => setInputValue(parseFloat(e.target.value) || 0)} className="w-full bg-white dark:bg-slate-900/50 rounded-xl sm:rounded-2xl py-3 sm:py-4 px-4 sm:px-6 font-black text-2xl sm:text-3xl text-slate-900 dark:text-white border border-slate-100 dark:border-slate-700 outline-none focus:ring-4 focus:ring-cyan-500/5" />
                      </div>
                    </div>

                    <div className="lg:col-span-2 flex flex-col items-center justify-center pt-2 sm:pt-6">
                      <button onClick={swapCurrencies} className="p-4 sm:p-6 bg-cyan-600 text-white rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all border-4 sm:border-8 border-white dark:border-slate-900">
                        <ArrowLeftRight className="w-6 h-6 sm:w-8 sm:h-8" />
                      </button>
                    </div>

                    <div className="lg:col-span-5 space-y-4">
                      <label className="text-[10px] font-black text-cyan-600 dark:text-cyan-400 uppercase tracking-widest ml-2">Moeda Destino</label>
                      <div className="bg-cyan-50/50 dark:bg-cyan-900/10 p-5 sm:p-6 rounded-[2rem] sm:rounded-[2.5rem] border-2 border-cyan-100/50 transition-all">
                        <div className="flex items-center gap-4 mb-4">
                          <span className="text-3xl sm:text-4xl">{currencyNames[targetCurrency]?.flag || '🏳️'}</span>
                          <select value={targetCurrency} onChange={(e) => setTargetCurrency(e.target.value)} className="flex-1 bg-transparent border-none font-black text-xl sm:text-2xl text-slate-800 dark:text-white outline-none cursor-pointer appearance-none">
                            {allAvailableCurrencies.map(code => (
                              <option key={code} value={code} className="bg-white dark:bg-slate-900 text-slate-800 dark:text-white">
                                {code} - {currencyNames[code]?.name || 'Moeda'}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="w-full bg-white dark:bg-slate-900/50 rounded-xl sm:rounded-2xl py-3 sm:py-4 px-4 sm:px-6 font-black text-2xl sm:text-3xl text-cyan-600 dark:text-cyan-400 border border-cyan-100 dark:border-cyan-800/30 min-h-[64px] sm:min-h-[82px] flex items-center truncate">
                          {loadingRates ? <div className="flex gap-1 animate-pulse"><div className="w-2 h-2 bg-cyan-400 rounded-full" /><div className="w-2 h-2 bg-cyan-400 rounded-full" /></div> : convertedValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: targetCurrency.includes('BTC') ? 6 : 4 })}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 sm:mt-12 p-6 sm:p-10 bg-gradient-to-br from-slate-900 to-slate-800 rounded-[2rem] sm:rounded-[2.5rem] text-white flex flex-col md:flex-row items-center justify-between gap-6 sm:gap-10 shadow-2xl relative overflow-hidden border border-white/5">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl -mr-16 -mt-16" />
                    <div className="flex items-center gap-4 sm:gap-6 relative z-10 text-center md:text-left">
                      <div className="hidden sm:block p-4 sm:p-5 bg-white/10 rounded-2xl backdrop-blur-md border border-white/10"><ArrowDownUp className="w-6 h-6 sm:w-7 sm:h-7 text-cyan-400" /></div>
                      <div>
                        <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Cotação Comercial</p>
                        <h4 className="text-2xl sm:text-3xl font-black tracking-tight">1 {baseCurrency} = <span className="text-cyan-400">{exchangeRateInfo.toFixed(4)}</span> {targetCurrency}</h4>
                      </div>
                    </div>
                    <div className="flex items-center gap-6 sm:gap-8 relative z-10 w-full md:w-auto justify-center md:justify-end">
                       <div className="flex flex-col items-center md:items-end">
                         <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Spread Sugerido</span>
                         <span className="text-sm sm:text-base font-black text-emerald-400">+0.25%</span>
                       </div>
                       <div className="h-10 w-[1px] bg-white/10" />
                       <div className="flex flex-col items-center md:items-end">
                         <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Variação 24h</span>
                         {(() => {
                           const pct = parseFloat(rates[targetCurrency]?.pctChange || '0');
                           return <span className={`text-sm sm:text-base font-black flex items-center gap-1 ${pct >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                             {pct >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                             {Math.abs(pct).toFixed(2)}%
                           </span>
                         })()}
                       </div>
                    </div>
                  </div>

                  <div className="mt-12 sm:mt-20 pt-10 sm:pt-16 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 sm:mb-12 gap-6 sm:gap-8">
                       <div className="space-y-2 max-w-xl">
                         <div className="flex items-center gap-3">
                           <h3 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tighter">Comparativo Geral</h3>
                           <span className="px-3 py-1 bg-cyan-500 text-white text-[9px] font-black rounded-full uppercase">Live</span>
                         </div>
                         <p className="text-slate-500 dark:text-slate-400 text-sm font-medium leading-relaxed">Analise em tempo real o valor de {inputValue} {baseCurrency} frente às moedas mais relevantes do mercado global.</p>
                       </div>
                       <div className="relative w-full md:w-96 group">
                         <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-cyan-500 transition-colors" />
                         <input type="text" placeholder="Código ou nome da moeda..." value={currencySearch} onChange={(e) => setCurrencySearch(e.target.value)} className="w-full bg-slate-100 dark:bg-slate-800/80 pl-14 pr-6 py-4 sm:py-5 rounded-[1.5rem] sm:rounded-[2rem] text-sm font-bold border-2 border-transparent focus:border-cyan-500/20 outline-none transition-all shadow-inner" />
                       </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6 sm:gap-8">
                      {loadingRates && allAvailableCurrencies.length <= 1 ? (
                        Array.from({ length: 8 }).map((_, i) => (
                          <div key={i} className="p-6 sm:p-8 rounded-[2rem] sm:rounded-[3rem] border border-slate-100 dark:border-slate-800 bg-white/50 dark:bg-slate-800/20 animate-pulse h-48 sm:h-56 flex flex-col justify-between">
                            <div className="flex justify-between items-center"><div className="w-10 h-10 sm:w-12 sm:h-12 bg-slate-200 dark:bg-slate-700 rounded-full" /><div className="w-10 h-4 bg-slate-200 dark:bg-slate-700 rounded" /></div>
                            <div className="w-full h-8 bg-slate-200 dark:bg-slate-700 rounded mt-4" />
                          </div>
                        ))
                      ) : (
                        (currencySearch ? filteredCurrenciesList : defaultGridCurrencies).map((code) => {
                          const rateObj = rates[code];
                          if (!rateObj && code !== 'BRL') return null;
                          
                          const baseRate = rates[baseCurrency]?.bid || 1;
                          const targetRate = rateObj?.bid || 1;
                          const currentRate = baseRate / targetRate;
                          const converted = inputValue * currentRate;
                          const info = currencyNames[code];
                          const isActive = targetCurrency === code;
                          const pct = parseFloat(rateObj?.pctChange || '0');

                          return (
                            <button 
                              key={code} 
                              onClick={() => { setTargetCurrency(code); window.scrollTo({ top: 0, behavior: 'smooth' }); }} 
                              className={`group relative flex flex-col justify-between p-6 sm:p-8 rounded-[2.5rem] border-2 transition-all text-left min-h-[15rem] h-auto shadow-sm overflow-hidden ${isActive ? 'border-cyan-500 bg-cyan-500/[0.04] dark:bg-cyan-900/20 shadow-xl shadow-cyan-500/10 scale-[1.02]' : 'border-slate-50 dark:border-slate-800/40 bg-white dark:bg-slate-900/40 hover:border-cyan-200 dark:hover:border-cyan-800 hover:bg-slate-50 dark:hover:bg-slate-800 hover:-translate-y-1 active:scale-[0.98]'}`}
                            >
                              {/* Header Layout - Fixed Overlap */}
                              <div className="flex flex-row justify-between items-start w-full gap-4 relative z-10">
                                <div className="flex flex-row items-center gap-4 flex-1 min-w-0">
                                  <div className={`p-2 rounded-full flex-shrink-0 transition-transform group-hover:scale-110 ${isActive ? 'bg-cyan-500/10' : 'bg-slate-50 dark:bg-slate-800/50'}`}>
                                    <span className="text-3xl sm:text-4xl leading-none">{info?.flag || '🏳️'}</span>
                                  </div>
                                  <div className="min-w-0 flex-1 overflow-hidden">
                                    <p className="text-sm sm:text-base font-black text-slate-800 dark:text-white uppercase leading-tight truncate">{code}</p>
                                    <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase truncate tracking-tight">{info?.name || 'Moeda'}</p>
                                  </div>
                                </div>
                                <div className={`px-2.5 py-1.5 rounded-full text-[10px] font-black flex items-center gap-1.5 flex-shrink-0 self-start shadow-sm ${pct >= 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                                  {pct >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                  {Math.abs(pct).toFixed(2)}%
                                </div>
                              </div>

                              {/* Value Section */}
                              <div className="mt-8 space-y-4 relative z-10 w-full">
                                <div className="space-y-1.5">
                                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] opacity-80">Câmbio Atualizado</p>
                                  <h4 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tighter leading-none break-all sm:break-normal">
                                    {converted.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: code.includes('BTC') ? 6 : 2 })}
                                  </h4>
                                </div>
                                
                                <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800/50 w-full">
                                   <div className="flex items-center gap-3">
                                     <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-cyan-500 animate-pulse shadow-[0_0_10px_rgba(6,182,212,0.8)]' : 'bg-slate-300 dark:bg-slate-700'}`} />
                                     <span className={`text-[11px] font-black uppercase tracking-widest ${isActive ? 'text-cyan-600 dark:text-cyan-400' : 'text-slate-400'}`}>
                                       {isActive ? 'Simulação Ativa' : 'Clique para Simular'}
                                     </span>
                                   </div>
                                   <ChevronRight className={`w-5 h-5 transition-all flex-shrink-0 ${isActive ? 'text-cyan-500 translate-x-1.5' : 'text-slate-300 dark:text-slate-700 group-hover:text-cyan-400 group-hover:translate-x-1.5'}`} />
                                </div>
                              </div>
                              
                              {/* Background Decoration */}
                              <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-[0.04] dark:group-hover:opacity-[0.06] transition-opacity pointer-events-none transform translate-x-4 -translate-y-4">
                                <Coins className="w-28 h-28 -rotate-12" />
                              </div>
                            </button>
                          );
                        })
                      )}
                      
                      {!loadingRates && filteredCurrenciesList.length === 0 && (
                        <div className="col-span-full py-20 sm:py-32 flex flex-col items-center text-center space-y-8">
                           <div className="p-10 bg-slate-50 dark:bg-slate-800 rounded-full shadow-inner"><Search className="w-16 h-16 text-slate-300" /></div>
                           <div className="space-y-3">
                             <h4 className="text-3xl font-black text-slate-400 tracking-tight">Câmbio não encontrado</h4>
                             <p className="text-slate-500 max-w-md font-medium text-base">Verifique se digitou o código (ex: USD) ou nome da moeda corretamente.</p>
                           </div>
                           <button onClick={() => setCurrencySearch('')} className="px-10 py-4 bg-slate-900 dark:bg-slate-700 text-white text-xs font-black rounded-full hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20 uppercase tracking-widest">Limpar Busca</button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10 mt-16">
                   <div className="md:col-span-2 bg-cyan-600 p-10 sm:p-14 rounded-[3rem] text-white relative overflow-hidden shadow-2xl">
                     <div className="absolute bottom-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl -mb-40 -mr-40" />
                     <h4 className="text-2xl sm:text-3xl font-black mb-6">Por que usar AwesomeAPI?</h4>
                     <p className="text-base sm:text-lg text-cyan-50 opacity-90 leading-relaxed font-medium">Dados auditados e sincronizados com as principais mesas de câmbio. Nossas taxas representam o câmbio comercial real, utilizado em transações interbancárias e investimentos de grande escala.</p>
                   </div>
                   <div className="bg-slate-900 p-10 sm:p-14 rounded-[3rem] text-white flex flex-col justify-center border border-white/5">
                     <Clock className="w-10 h-10 text-cyan-400 mb-8" />
                     <h4 className="text-xl sm:text-2xl font-black mb-3">Sync Automático</h4>
                     <p className="text-slate-400 text-sm sm:text-base font-medium leading-relaxed">Atualizamos os dados a cada 15 minutos para garantir máxima precisão durante o horário comercial.</p>
                   </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="animate-in fade-in zoom-in-95 duration-500">
            <button onClick={() => setActiveTab(null)} className="group flex items-center gap-2 text-slate-400 hover:text-slate-800 mb-6 font-bold transition-colors uppercase text-[10px] tracking-widest">
              <ChevronLeft className="w-4 h-4" /> Voltar ao Painel
            </button>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
              <div className="lg:col-span-4 space-y-6 sm:space-y-8">
                <div className="bg-white/80 dark:bg-slate-900/80 glass-card p-6 sm:p-10 rounded-[2.5rem] sm:rounded-[3rem] premium-shadow border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-4 mb-8 sm:mb-10">
                    {(() => {
                      const info = calculators.find(c => c.id === activeTab);
                      return info && (<><div className={`${info.bg} ${info.color} p-4 rounded-2xl shrink-0`}><info.icon className="w-8 h-8" /></div><h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">{info.name}</h2></>)
                    })()}
                  </div>
                  <div className="space-y-6">
                    <FinanceInput label={activeTab === 'INVESTMENT_FUNDO_IMOBILIARIO' ? "Patrimônio Inicial" : "Valor do Crédito"} value={amount} onChange={setAmount} prefix="R$" />
                    <FinanceInput label="Prazo (Meses)" value={time} onChange={setTime} suffix="m" />
                    
                    {activeTab === 'COMPARISON' ? (
                      <div className="space-y-4 pt-4 border-t border-slate-50 dark:border-slate-800">
                        <div className="flex justify-between items-center mb-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Bancos e Taxas (A.A.)</label>
                          <button onClick={addComparisonBank} className="text-blue-600 hover:text-blue-700 p-1 rounded-lg bg-blue-50 transition-colors"><Plus className="w-4 h-4" /></button>
                        </div>
                        {comparisonBanks.map((bank, idx) => (
                          <div key={idx} className="flex gap-2 items-end group">
                            <div className="flex-1">
                              <input type="text" value={bank.name} onChange={(e) => updateComparisonBank(idx, 'name', e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl py-2 px-3 text-xs font-bold focus:ring-2 focus:ring-blue-500/20 outline-none" />
                            </div>
                            <div className="w-20">
                              <input type="number" step="0.1" value={bank.rate} onChange={(e) => updateComparisonBank(idx, 'rate', parseFloat(e.target.value) || 0)} className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl py-2 px-3 text-xs font-bold text-center" />
                            </div>
                            {comparisonBanks.length > 2 && (
                              <button onClick={() => removeComparisonBank(idx)} className="p-2 text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"><Trash2 className="w-3.5 h-3.5" /></button>
                            )}
                          </div>
                        ))}
                        <div className="pt-4 border-t border-slate-50 dark:border-slate-800">
                           <FinanceInput label="Retorno de Investimento (A.A.)" value={expectedReturn} onChange={setExpectedReturn} suffix="%" step={0.05} />
                        </div>
                      </div>
                    ) : (
                      <>
                        <FinanceInput label={activeTab === 'INVESTMENT_FUNDO_IMOBILIARIO' ? "Dividend Yield Mensal" : "Taxa (Anual)"} value={rate} onChange={setRate} suffix="%" step={0.01} />
                        {activeTab === 'RETIREMENT' ? (
                          <>
                            <FinanceInput label="Idade Atual" value={age} onChange={setAge} suffix="anos" />
                            <FinanceInput label="Idade Alvo" value={retireAge} onChange={setRetireAge} suffix="anos" />
                          </>
                        ) : activeTab === 'INVESTMENT_FUNDO_IMOBILIARIO' ? (
                          <>
                            <FinanceInput label="Aporte Mensal" value={extra} onChange={setExtra} prefix="R$" />
                            <FinanceInput label="Valorização Anual" value={appreciation} onChange={setAppreciation} suffix="%" step={0.1} />
                          </>
                        ) : (
                          <FinanceInput label={activeTab === 'COMPOUND_INTEREST' || activeTab === 'SAVINGS' ? 'Aporte' : 'Entrada'} value={extra} onChange={setExtra} prefix="R$" />
                        )}
                      </>
                    )}
                    <button onClick={handleCalculate} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 sm:py-5 rounded-2xl font-extrabold flex items-center justify-center gap-3 transition-all shadow-xl shadow-blue-500/20 active:scale-95 mt-4">Simular Agora <ArrowRight className="w-5 h-5" /></button>
                  </div>
                </div>
              </div>
              <div className="lg:col-span-8 w-full overflow-hidden">
                {result ? (<ResultDisplay result={result} isDebt={activeTab === 'LOAN' || activeTab === 'FINANCING' || activeTab === 'CREDIT_CARD' || activeTab === 'COMPARISON'} />) : (
                  <div className="h-full min-h-[400px] sm:min-h-[500px] flex flex-col items-center justify-center text-center p-8 sm:p-12 bg-white/30 dark:bg-slate-900/30 glass-card border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[2.5rem] sm:rounded-[3rem]"><div className="w-16 h-16 sm:w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6"><Zap className="w-8 h-8 sm:w-10 sm:h-10 text-slate-300" /></div><h3 className="text-xl sm:text-2xl font-bold text-slate-400">Pronto para simular?</h3><p className="text-slate-400 mt-2 max-w-xs font-medium text-sm sm:text-base">Preencha os dados à esquerda e veja a mágica dos juros acontecer.</p></div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
