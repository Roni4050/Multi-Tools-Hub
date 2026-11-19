/**
 * MultiTools Hub - US Real Estate Commission & Agent Split Calculator
 * 100% Client-Side Financial Modeling
 */

document.addEventListener('DOMContentLoaded', () => {
  // DOM Inputs
  const homePriceInput = document.getElementById('home-price');
  const commissionRateInput = document.getElementById('commission-rate');
  const commissionPresetBtns = document.querySelectorAll('.comm-preset-btn');
  const sideSplitSelect = document.getElementById('side-split');
  const agentSplitSelect = document.getElementById('agent-split');
  const franchiseFeeInput = document.getElementById('franchise-fee');
  const deskFeeInput = document.getElementById('desk-fee');
  const taxReserveInput = document.getElementById('tax-reserve');
  const copyBreakdownBtn = document.getElementById('copy-breakdown-btn');

  // Outputs
  const outTotalCommission = document.getElementById('out-total-comm');
  const outSideCommission = document.getElementById('out-side-comm');
  const outBrokerCut = document.getElementById('out-broker-cut');
  const outAgentGross = document.getElementById('out-agent-gross');
  const outTaxDeduction = document.getElementById('out-tax-deduction');
  const outAgentNet = document.getElementById('out-agent-net');

  // Distribution visual bars
  const barBroker = document.getElementById('bar-broker');
  const barTax = document.getElementById('bar-tax');
  const barNet = document.getElementById('bar-net');

  function calculate() {
    const salePrice = parseFloat(homePriceInput?.value) || 0;
    const totalCommRate = (parseFloat(commissionRateInput?.value) || 0) / 100;
    const sideRatio = parseFloat(sideSplitSelect?.value) || 0.50; // default 50%
    const agentRatio = parseFloat(agentSplitSelect?.value) || 0.70; // default 70% to agent
    const franchiseFeeRate = (parseFloat(franchiseFeeInput?.value) || 0) / 100;
    const fixedDeskFee = parseFloat(deskFeeInput?.value) || 0;
    const taxRate = (parseFloat(taxReserveInput?.value) || 0) / 100;

    // 1. Total Commission Pool
    const totalGrossCommission = salePrice * totalCommRate;

    // 2. Your Side's Gross Commission (e.g. Listing Side or Buyer Side)
    const yourSideGross = totalGrossCommission * sideRatio;

    // 3. Franchise Fee deduction (if applicable, deducted before broker split)
    const franchiseAmount = yourSideGross * franchiseFeeRate;
    const distributableGross = Math.max(0, yourSideGross - franchiseAmount);

    // 4. Broker Split vs Agent Gross
    const agentGrossBeforeDesk = distributableGross * agentRatio;
    const brokerShare = (distributableGross * (1 - agentRatio)) + franchiseAmount;

    // 5. Desk Fee / E&O deduction
    const agentGrossAfterDesk = Math.max(0, agentGrossBeforeDesk - fixedDeskFee);

    // 6. Taxes (Self-Employment + Federal/State reserve)
    const taxDeduction = agentGrossAfterDesk * taxRate;

    // 7. Net Take-Home Pay
    const netTakeHome = Math.max(0, agentGrossAfterDesk - taxDeduction);

    // Format outputs
    const fmt = (num) => '$' + num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    if (outTotalCommission) outTotalCommission.textContent = fmt(totalGrossCommission);
    if (outSideCommission) outSideCommission.textContent = fmt(yourSideGross);
    if (outBrokerCut) outBrokerCut.textContent = fmt(brokerShare + fixedDeskFee);
    if (outAgentGross) outAgentGross.textContent = fmt(agentGrossBeforeDesk);
    if (outTaxDeduction) outTaxDeduction.textContent = fmt(taxDeduction);
    if (outAgentNet) outAgentNet.textContent = fmt(netTakeHome);

    // Visual Distribution Bar (percentages of your side gross)
    if (yourSideGross > 0) {
      const brokerPct = (((brokerShare + fixedDeskFee) / yourSideGross) * 100).toFixed(1);
      const taxPct = ((taxDeduction / yourSideGross) * 100).toFixed(1);
      const netPct = ((netTakeHome / yourSideGross) * 100).toFixed(1);

      if (barBroker) {
        barBroker.style.width = `${brokerPct}%`;
        barBroker.title = `Brokerage Share: ${brokerPct}%`;
      }
      if (barTax) {
        barTax.style.width = `${taxPct}%`;
        barTax.title = `Taxes & Reserves: ${taxPct}%`;
      }
      if (barNet) {
        barNet.style.width = `${netPct}%`;
        barNet.title = `Agent Net Take-Home: ${netPct}%`;
      }
    }
  }

  // Commission Preset Buttons (e.g. 5.0%, 5.5%, 6.0%)
  commissionPresetBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      commissionPresetBtns.forEach(b => {
        b.classList.remove('bg-indigo-600', 'text-white');
        b.classList.add('bg-slate-100', 'dark:bg-slate-800', 'text-slate-700', 'dark:text-slate-300');
      });
      btn.classList.add('bg-indigo-600', 'text-white');
      btn.classList.remove('bg-slate-100', 'dark:bg-slate-800', 'text-slate-700', 'dark:text-slate-300');

      if (commissionRateInput) {
        commissionRateInput.value = btn.dataset.rate;
        calculate();
      }
    });
  });

  // Copy Breakdown
  if (copyBreakdownBtn) {
    copyBreakdownBtn.addEventListener('click', () => {
      const price = parseFloat(homePriceInput?.value) || 0;
      const rate = commissionRateInput?.value || '5.5';

      const summary = `🏠 MultiTools Hub Real Estate Commission Breakdown\n` +
        `Property Sale Price: $${price.toLocaleString()}\n` +
        `Total Commission (${rate}%): ${outTotalCommission.textContent}\n` +
        `Your Side Gross: ${outSideCommission.textContent}\n` +
        `Brokerage Cut & Fees: ${outBrokerCut.textContent}\n` +
        `Agent Gross Commission: ${outAgentGross.textContent}\n` +
        `Estimated Taxes Reserved: ${outTaxDeduction.textContent}\n` +
        `----------------------------------------\n` +
        `⭐ Net Take-Home Pay: ${outAgentNet.textContent}\n` +
        `(Calculated privately at MultiTools Hub)`;

      navigator.clipboard.writeText(summary).then(() => {
        if (window.showToast) window.showToast('Commission breakdown copied to clipboard!');
      });
    });
  }

  // Input Listeners
  [
    homePriceInput, commissionRateInput, sideSplitSelect, agentSplitSelect,
    franchiseFeeInput, deskFeeInput, taxReserveInput
  ].forEach(inp => {
    if (inp) inp.addEventListener('input', calculate);
  });

  calculate();
});
