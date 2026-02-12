
import { CalculationResult, AmortizationEntry, BankComparisonEntry, OpportunityCostData } from '../types';

export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

export const calculateCompoundInterest = (
  principal: number,
  monthlyRate: number,
  months: number,
  monthlyContribution: number = 0
): CalculationResult => {
  const i = monthlyRate / 100;
  let currentTotal = principal;
  let totalInterest = 0;
  const series = [];

  for (let m = 0; m <= months; m++) {
    if (m > 0) {
      const interestEarned = currentTotal * i;
      totalInterest += interestEarned;
      currentTotal += interestEarned + monthlyContribution;
    }
    series.push({
      name: `Mês ${m}`,
      value: Math.round(currentTotal),
      interest: Math.round(totalInterest),
    });
  }

  const totalPaid = principal + (monthlyContribution * months);
  const percentage = (currentTotal / totalPaid) * 100;

  return {
    totalAmount: currentTotal,
    totalInterest: totalInterest,
    principal: totalPaid,
    percentageInterest: ((currentTotal - totalPaid) / totalPaid) * 100,
    timeSeries: series,
    impactMessage: `Seu dinheiro cresceu ${percentage.toFixed(0)}% em relação ao investido.`,
  };
};

export const calculateLoan = (
  principal: number,
  annualRate: number,
  months: number
): CalculationResult => {
  const i = annualRate / 100 / 12;
  // Prestação pela fórmula Price: P = (PV * i * (1 + i)^n) / ((1 + i)^n - 1)
  const installment = (principal * i * Math.pow(1 + i, months)) / (Math.pow(1 + i, months) - 1);
  const totalAmount = installment * months;
  const totalInterest = totalAmount - principal;
  
  const series = [];
  const schedule: AmortizationEntry[] = [];

  let balance = principal;
  series.push({ name: 'Mês 0', value: Math.round(balance), interest: 0 });

  for (let m = 1; m <= months; m++) {
    const interestPayment = balance * i;
    const principalPayment = installment - interestPayment;
    balance -= principalPayment;
    
    // Ajuste para arredondamentos no último mês
    const finalBalance = m === months ? 0 : Math.max(0, balance);

    schedule.push({
      period: m,
      installment: installment,
      principalPaid: principalPayment,
      interestPaid: interestPayment,
      remainingBalance: finalBalance
    });

    series.push({
      name: `Mês ${m}`,
      value: Math.round(finalBalance),
      interest: Math.round(totalInterest * (m / months)),
    });
  }

  const multiplier = (totalAmount / principal).toFixed(2);
  const interestPercentage = (totalInterest / totalAmount) * 100;

  return {
    totalAmount,
    totalInterest,
    principal,
    installmentValue: installment,
    installments: months,
    percentageInterest: (totalInterest / principal) * 100,
    timeSeries: series,
    amortizationSchedule: schedule,
    impactMessage: `Você pagará ${multiplier}x o valor original. Os juros representam ${interestPercentage.toFixed(0)}% do total pago.`,
  };
};

export const calculateBankComparison = (
  principal: number,
  months: number,
  banks: { name: string; rate: number }[],
  investmentRate: number = 0
): CalculationResult => {
  const comparisonResults: BankComparisonEntry[] = banks.map(bank => {
    const i = bank.rate / 100 / 12;
    const installment = (principal * i * Math.pow(1 + i, months)) / (Math.pow(1 + i, months) - 1);
    const totalAmount = installment * months;
    return {
      bankName: bank.name,
      rate: bank.rate,
      totalAmount: totalAmount,
      totalInterest: totalAmount - principal,
      installmentValue: installment
    };
  });

  // Pick the best for time series display
  const bestResult = comparisonResults.reduce((prev, curr) => (prev.totalAmount < curr.totalAmount ? prev : curr));
  const fullResult = calculateLoan(principal, bestResult.rate, months);

  // Opportunity Cost Calculation
  const monthlyInvRate = Math.pow(1 + investmentRate / 100, 1 / 12) - 1;
  const investmentFinalValue = principal * Math.pow(1 + monthlyInvRate, months);
  const investmentGain = investmentFinalValue - principal;

  const opportunityCost: OpportunityCostData = {
    investmentFinalValue,
    investmentGain,
    investmentRate
  };

  return {
    ...fullResult,
    comparisonData: comparisonResults,
    opportunityCost,
    impactMessage: `Existem ${banks.length} opções disponíveis. A melhor taxa (${bestResult.rate}%) resulta em um custo de juros de ${formatCurrency(bestResult.totalInterest)}, enquanto investir o mesmo valor renderia ${formatCurrency(investmentGain)}.`
  };
};

export const calculateFII = (
  initialAmount: number,
  monthlyContribution: number,
  monthlyDividendYield: number,
  annualAppreciation: number,
  months: number
): CalculationResult => {
  let currentBalance = initialAmount;
  let totalDividends = 0;
  let totalAppreciation = 0;
  const series = [];

  const monthlyAppreciationRate = Math.pow(1 + annualAppreciation / 100, 1 / 12) - 1;
  const dividendRate = monthlyDividendYield / 100;

  series.push({ name: 'Mês 0', value: Math.round(currentBalance), interest: 0 });

  for (let m = 1; m <= months; m++) {
    const appreciation = currentBalance * monthlyAppreciationRate;
    const dividends = currentBalance * dividendRate;
    
    totalDividends += dividends;
    totalAppreciation += appreciation;
    
    currentBalance += appreciation + dividends + monthlyContribution;

    series.push({
      name: `Mês ${m}`,
      value: Math.round(currentBalance),
      interest: Math.round(totalDividends + totalAppreciation),
    });
  }

  const totalInvested = initialAmount + monthlyContribution * months;
  const totalGain = currentBalance - totalInvested;

  return {
    totalAmount: currentBalance,
    totalInterest: totalGain,
    principal: totalInvested,
    percentageInterest: (totalGain / totalInvested) * 100,
    timeSeries: series,
    impactMessage: `Seu patrimônio em FIIs gerou um retorno total de ${formatCurrency(totalGain)}, sendo ${formatCurrency(totalDividends)} apenas em dividendos isentos.`,
  };
};

export const calculateRetirement = (
  currentAge: number,
  retireAge: number,
  monthlyIncomeDesired: number,
  currentSavings: number,
  monthlyContribution: number,
  annualReturn: number
): CalculationResult => {
  const months = (retireAge - currentAge) * 12;
  const monthlyReturn = Math.pow(1 + (annualReturn / 100), 1 / 12) - 1;
  
  let currentTotal = currentSavings;
  let totalInterest = 0;
  const series = [];

  for (let m = 0; m <= months; m++) {
    if (m > 0) {
      const interestEarned = currentTotal * monthlyReturn;
      totalInterest += interestEarned;
      currentTotal += interestEarned + monthlyContribution;
    }
    if (m % 12 === 0) {
      series.push({
        name: `Idade ${currentAge + (m / 12)}`,
        value: Math.round(currentTotal),
        interest: Math.round(totalInterest),
      });
    }
  }

  const safeWithdrawalRate = 0.004; // 4% Rule Monthly
  const possibleMonthlyIncome = currentTotal * safeWithdrawalRate;

  return {
    totalAmount: currentTotal,
    totalInterest: totalInterest,
    principal: currentSavings + (monthlyContribution * months),
    percentageInterest: (totalInterest / (currentSavings + (monthlyContribution * months))) * 100,
    timeSeries: series,
    impactMessage: `Com este montante, você poderá retirar aproximadamente ${formatCurrency(possibleMonthlyIncome)} por mês perpetuamente.`,
  };
};
