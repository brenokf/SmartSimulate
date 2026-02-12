
export type CalculatorType = 
  | 'COMPOUND_INTEREST' 
  | 'CREDIT_CARD' 
  | 'LOAN' 
  | 'FINANCING' 
  | 'SAVINGS' 
  | 'RETIREMENT'
  | 'COMPARISON'
  | 'INVESTMENT_FUNDO_IMOBILIARIO'
  | 'CURRENCY_CONVERTER';

export interface AmortizationEntry {
  period: number;
  installment: number;
  principalPaid: number;
  interestPaid: number;
  remainingBalance: number;
}

export interface BankComparisonEntry {
  bankName: string;
  rate: number;
  totalAmount: number;
  totalInterest: number;
  installmentValue: number;
}

export interface OpportunityCostData {
  investmentFinalValue: number;
  investmentGain: number;
  investmentRate: number;
}

export interface CalculationResult {
  totalAmount: number;
  totalInterest: number;
  principal: number;
  installments?: number;
  installmentValue?: number;
  percentageInterest: number;
  timeSeries: { name: string; value: number; interest: number }[];
  impactMessage: string;
  amortizationSchedule?: AmortizationEntry[];
  comparisonData?: BankComparisonEntry[];
  opportunityCost?: OpportunityCostData;
}

export interface CalculatorProps {
  onCalculate: (result: CalculationResult) => void;
}
