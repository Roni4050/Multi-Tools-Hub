/**
 * MultiTools Hub - US Mortgage & Loan Calculator
 * 100% Client-side Realtime Calculation
 * Computes: P&I, Property Tax, Home Insurance, PMI, HOA, Amortization Schedule & CSV
 */
(function MortgageCalculatorModule() {
  'use strict';

  let amortizationData = [];

  function init() {
    initInputs();
    initDownPaymentSync();
    initCsvExport();
    initSampleButton();
    calculate();
  }

  function initInputs() {
    const inputs = [
      'mort-home-price', 'mort-down-dollar', 'mort-down-pct',
      'mort-term-years', 'mort-interest-rate', 'mort-prop-tax',
      'mort-home-ins', 'mort-hoa', 'mort-pmi-rate'
    ];

    inputs.forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('input', calculate);
        el.addEventListener('change', calculate);
      }
    });

    const termBtns = document.querySelectorAll('[data-term-val]');
    termBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const val = btn.getAttribute('data-term-val');
        const termInput = document.getElementById('mort-term-years');
        if (termInput) {
          termInput.value = val;
          termBtns.forEach(b => b.classList.remove('bg-indigo-600', 'text-white'));
          btn.classList.add('bg-indigo-600', 'text-white');
          calculate();
        }
      });
    });
  }

  function initDownPaymentSync() {
    const homePriceEl = document.getElementById('mort-home-price');
    const downDollarEl = document.getElementById('mort-down-dollar');
    const downPctEl = document.getElementById('mort-down-pct');

    if (downDollarEl && homePriceEl && downPctEl) {
      downDollarEl.addEventListener('input', () => {
        const price = parseFloat(homePriceEl.value) || 0;
        const dollar = parseFloat(downDollarEl.value) || 0;
        if (price > 0) {
          downPctEl.value = ((dollar / price) * 100).toFixed(1);
        }
        calculate();
      });

      downPctEl.addEventListener('input', () => {
        const price = parseFloat(homePriceEl.value) || 0;
        const pct = parseFloat(downPctEl.value) || 0;
        downDollarEl.value = (price * (pct / 100)).toFixed(0);
        calculate();
      });

      homePriceEl.addEventListener('input', () => {
        const price = parseFloat(homePriceEl.value) || 0;
        const pct = parseFloat(downPctEl.value) || 0;
        downDollarEl.value = (price * (pct / 100)).toFixed(0);
        calculate();
      });
    }
  }

  function initSampleButton() {
    const btn = document.getElementById('mort-sample-btn');
    if (!btn) return;
    btn.addEventListener('click', () => {
      setVal('mort-home-price', 425000);
      setVal('mort-down-pct', 20);
      setVal('mort-down-dollar', 85000);
      setVal('mort-term-years', 30);
      setVal('mort-interest-rate', 6.75);
      setVal('mort-prop-tax', 4500);
      setVal('mort-home-ins', 1400);
      setVal('mort-hoa', 0);
      setVal('mort-pmi-rate', 0.5);
      calculate();
      if (window.showToast) window.showToast('Loaded typical US single-family home mortgage scenario!', 'success');
    });
  }

  function setVal(id, val) {
    const el = document.getElementById(id);
    if (el) el.value = val;
  }

  function calculate() {
    const homePrice = parseFloat(document.getElementById('mort-home-price')?.value) || 0;
    const downDollar = parseFloat(document.getElementById('mort-down-dollar')?.value) || 0;
    const termYears = parseFloat(document.getElementById('mort-term-years')?.value) || 30;
    const annualRate = parseFloat(document.getElementById('mort-interest-rate')?.value) || 0;
    const annualPropTax = parseFloat(document.getElementById('mort-prop-tax')?.value) || 0;
    const annualInsurance = parseFloat(document.getElementById('mort-home-ins')?.value) || 0;
    const monthlyHoa = parseFloat(document.getElementById('mort-hoa')?.value) || 0;
    const pmiRate = parseFloat(document.getElementById('mort-pmi-rate')?.value) || 0;

    const loanAmount = Math.max(0, homePrice - downDollar);
    const monthlyRate = (annualRate / 100) / 12;
    const totalPayments = termYears * 12;

    // Monthly Principal & Interest: M = P [ i(1 + i)^n ] / [ (1 + i)^n – 1]
    let monthlyPI = 0;
    if (monthlyRate > 0 && totalPayments > 0 && loanAmount > 0) {
      monthlyPI = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, totalPayments)) / (Math.pow(1 + monthlyRate, totalPayments) - 1);
    } else if (totalPayments > 0 && loanAmount > 0) {
      monthlyPI = loanAmount / totalPayments;
    }

    const monthlyTax = annualPropTax / 12;
    const monthlyIns = annualInsurance / 12;

    // PMI applies if down payment is less than 20%
    const downPaymentRatio = homePrice > 0 ? downDollar / homePrice : 0;
    let monthlyPmi = 0;
    if (downPaymentRatio < 0.20 && loanAmount > 0) {
      monthlyPmi = (loanAmount * (pmiRate / 100)) / 12;
    }

    const totalMonthlyPayment = monthlyPI + monthlyTax + monthlyIns + monthlyPmi + monthlyHoa;
    const totalLoanCost = (monthlyPI * totalPayments);
    const totalInterestPaid = Math.max(0, totalLoanCost - loanAmount);
    const totalOverallCost = homePrice + totalInterestPaid + (annualPropTax * termYears) + (annualInsurance * termYears);

    // Amortization Schedule Calculation
    buildAmortizationSchedule(loanAmount, monthlyRate, monthlyPI, totalPayments, termYears);

    // Render Metrics
    renderMetric('mort-monthly-total', `$${totalMonthlyPayment.toFixed(0)}`);
    renderMetric('mort-pi-val', `$${monthlyPI.toFixed(0)}`);
    renderMetric('mort-tax-val', `$${monthlyTax.toFixed(0)}`);
    renderMetric('mort-ins-val', `$${monthlyIns.toFixed(0)}`);
    renderMetric('mort-pmi-val', `$${monthlyPmi.toFixed(0)}`);
    renderMetric('mort-hoa-val', `$${monthlyHoa.toFixed(0)}`);

    renderMetric('mort-loan-amt-val', `$${loanAmount.toLocaleString('en-US')}`);
    renderMetric('mort-total-interest-val', `$${totalInterestPaid.toLocaleString('en-US', { maximumFractionDigits: 0 })}`);
    renderMetric('mort-total-cost-val', `$${totalOverallCost.toLocaleString('en-US', { maximumFractionDigits: 0 })}`);

    // Render Breakdown Bar
    renderPaymentBar(totalMonthlyPayment, monthlyPI, monthlyTax, monthlyIns, monthlyPmi, monthlyHoa);
  }

  function renderMetric(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  }

  function renderPaymentBar(total, pi, tax, ins, pmi, hoa) {
    if (total <= 0) return;
    const setWidth = (id, val) => {
      const el = document.getElementById(id);
      if (el) {
        const pct = Math.max(0, (val / total) * 100);
        el.style.width = pct + '%';
      }
    };
    setWidth('mort-bar-pi', pi);
    setWidth('mort-bar-tax', tax);
    setWidth('mort-bar-ins', ins);
    setWidth('mort-bar-pmi', pmi);
    setWidth('mort-bar-hoa', hoa);
  }

  function buildAmortizationSchedule(principal, monthlyRate, monthlyPayment, totalMonths, termYears) {
    amortizationData = [];
    let balance = principal;
    let currentYear = new Date().getFullYear();

    let yearlyPrincipal = 0;
    let yearlyInterest = 0;

    for (let month = 1; month <= totalMonths; month++) {
      const interestPayment = balance * monthlyRate;
      const principalPayment = Math.min(balance, monthlyPayment - interestPayment);
      balance = Math.max(0, balance - principalPayment);

      yearlyPrincipal += principalPayment;
      yearlyInterest += interestPayment;

      if (month % 12 === 0 || month === totalMonths) {
        const yearNumber = Math.ceil(month / 12);
        amortizationData.push({
          year: currentYear + yearNumber - 1,
          principalPaid: yearlyPrincipal,
          interestPaid: yearlyInterest,
          remainingBalance: balance
        });
        yearlyPrincipal = 0;
        yearlyInterest = 0;
      }
    }

    renderAmortizationTable();
  }

  function renderAmortizationTable() {
    const tableBody = document.getElementById('mort-amort-body');
    if (!tableBody) return;

    tableBody.innerHTML = amortizationData.slice(0, 15).map(row => `
      <tr class="border-b border-slate-100 dark:border-slate-800 text-xs font-mono">
        <td class="py-2.5 font-bold text-slate-800 dark:text-slate-200">${row.year}</td>
        <td class="py-2.5 text-right text-emerald-600 dark:text-emerald-400 font-semibold">$${row.principalPaid.toLocaleString('en-US', { maximumFractionDigits: 0 })}</td>
        <td class="py-2.5 text-right text-indigo-600 dark:text-indigo-400 font-semibold">$${row.interestPaid.toLocaleString('en-US', { maximumFractionDigits: 0 })}</td>
        <td class="py-2.5 text-right text-slate-700 dark:text-slate-300">$${row.remainingBalance.toLocaleString('en-US', { maximumFractionDigits: 0 })}</td>
      </tr>
    `).join('');
  }

  function initCsvExport() {
    const csvBtn = document.getElementById('mort-export-csv-btn');
    if (!csvBtn) return;

    csvBtn.addEventListener('click', () => {
      if (amortizationData.length === 0) return;

      let csv = 'Year,Principal Paid,Interest Paid,Remaining Balance\n';
      amortizationData.forEach(r => {
        csv += `${r.year},${r.principalPaid.toFixed(2)},${r.interestPaid.toFixed(2)},${r.remainingBalance.toFixed(2)}\n`;
      });

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'mortgage-amortization-schedule.csv';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      if (window.showToast) window.showToast('Amortization schedule exported to CSV!', 'success');
    });
  }

  document.addEventListener('DOMContentLoaded', init);
})();
