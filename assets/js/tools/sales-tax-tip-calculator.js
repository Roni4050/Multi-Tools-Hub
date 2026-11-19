/**
 * MultiTools Hub - US Sales Tax & Tip Split Calculator
 * 100% Client-Side Private Logic
 */

document.addEventListener('DOMContentLoaded', () => {
  // 50 US States + DC Sales Tax Data (State Base Sales Tax %)
  const US_STATE_TAXES = [
    { code: "AL", name: "Alabama", tax: 4.0 },
    { code: "AK", name: "Alaska", tax: 0.0 },
    { code: "AZ", name: "Arizona", tax: 5.6 },
    { code: "AR", name: "Arkansas", tax: 6.5 },
    { code: "CA", name: "California", tax: 7.25 },
    { code: "CO", name: "Colorado", tax: 2.9 },
    { code: "CT", name: "Connecticut", tax: 6.35 },
    { code: "DE", name: "Delaware", tax: 0.0 },
    { code: "DC", name: "District of Columbia", tax: 6.0 },
    { code: "FL", name: "Florida", tax: 6.0 },
    { code: "GA", name: "Georgia", tax: 4.0 },
    { code: "HI", name: "Hawaii", tax: 4.0 },
    { code: "ID", name: "Idaho", tax: 6.0 },
    { code: "IL", name: "Illinois", tax: 6.25 },
    { code: "IN", name: "Indiana", tax: 7.0 },
    { code: "IA", name: "Iowa", tax: 6.0 },
    { code: "KS", name: "Kansas", tax: 6.5 },
    { code: "KY", name: "Kentucky", tax: 6.0 },
    { code: "LA", name: "Louisiana", tax: 4.45 },
    { code: "ME", name: "Maine", tax: 5.5 },
    { code: "MD", name: "Maryland", tax: 6.0 },
    { code: "MA", name: "Massachusetts", tax: 6.25 },
    { code: "MI", name: "Michigan", tax: 6.0 },
    { code: "MN", name: "Minnesota", tax: 6.875 },
    { code: "MS", name: "Mississippi", tax: 7.0 },
    { code: "MO", name: "Missouri", tax: 4.225 },
    { code: "MT", name: "Montana", tax: 0.0 },
    { code: "NE", name: "Nebraska", tax: 5.5 },
    { code: "NV", name: "Nevada", tax: 6.85 },
    { code: "NH", name: "New Hampshire", tax: 0.0 },
    { code: "NJ", name: "New Jersey", tax: 6.625 },
    { code: "NM", name: "New Mexico", tax: 5.125 },
    { code: "NY", name: "New York", tax: 4.0 },
    { code: "NC", name: "North Carolina", tax: 4.75 },
    { code: "ND", name: "North Dakota", tax: 5.0 },
    { code: "OH", name: "Ohio", tax: 5.75 },
    { code: "OK", name: "Oklahoma", tax: 4.5 },
    { code: "OR", name: "Oregon", tax: 0.0 },
    { code: "PA", name: "Pennsylvania", tax: 6.0 },
    { code: "RI", name: "Rhode Island", tax: 7.0 },
    { code: "SC", name: "South Carolina", tax: 6.0 },
    { code: "SD", name: "South Dakota", tax: 4.2 },
    { code: "TN", name: "Tennessee", tax: 7.0 },
    { code: "TX", name: "Texas", tax: 6.25 },
    { code: "UT", name: "Utah", tax: 6.1 },
    { code: "VT", name: "Vermont", tax: 6.0 },
    { code: "VA", name: "Virginia", tax: 5.3 },
    { code: "WA", name: "Washington", tax: 6.5 },
    { code: "WV", name: "West Virginia", tax: 6.0 },
    { code: "WI", name: "Wisconsin", tax: 5.0 },
    { code: "WY", name: "Wyoming", tax: 4.0 }
  ];

  // DOM Elements
  const billAmountInput = document.getElementById('bill-amount');
  const stateSelect = document.getElementById('state-select');
  const taxRateInput = document.getElementById('tax-rate');
  const localTaxInput = document.getElementById('local-tax-rate');
  const tipButtons = document.querySelectorAll('.tip-btn');
  const customTipInput = document.getElementById('custom-tip');
  const splitGuestsInput = document.getElementById('split-guests');
  const guestsCountDisplay = document.getElementById('guests-count-display');
  const decreaseGuestsBtn = document.getElementById('decrease-guests');
  const increaseGuestsBtn = document.getElementById('increase-guests');
  const tipBeforeTaxCheckbox = document.getElementById('tip-before-tax');
  const roundUpBtn = document.getElementById('round-up-btn');
  const resetBtn = document.getElementById('reset-btn');
  const copySummaryBtn = document.getElementById('copy-summary-btn');

  // Output Elements
  const outSubtotal = document.getElementById('out-subtotal');
  const outTax = document.getElementById('out-tax');
  const outTip = document.getElementById('out-tip');
  const outGrandTotal = document.getElementById('out-grand-total');
  const outPerPersonTotal = document.getElementById('out-per-person-total');
  const outPerPersonTip = document.getElementById('out-per-person-tip');
  const outPerPersonTax = document.getElementById('out-per-person-tax');

  let currentTipPercent = 18; // Default US dining standard
  let shouldRoundUp = false;

  // Populate States
  if (stateSelect) {
    stateSelect.innerHTML = '<option value="custom">Custom Tax Rate (or 0%)</option>' +
      US_STATE_TAXES.map(s => `<option value="${s.code}" data-tax="${s.tax}">${s.name} (${s.tax}%)</option>`).join('');
  }

  function calculate() {
    const rawBill = parseFloat(billAmountInput?.value) || 0;
    const baseTax = parseFloat(taxRateInput?.value) || 0;
    const localTax = parseFloat(localTaxInput?.value) || 0;
    const totalTaxRate = (baseTax + localTax) / 100;
    const guests = Math.max(1, parseInt(splitGuestsInput?.value) || 1);

    if (guestsCountDisplay) {
      guestsCountDisplay.textContent = `${guests} Person${guests > 1 ? 's' : ''}`;
    }

    // Tax calculation
    const taxAmount = rawBill * totalTaxRate;

    // Tip calculation: standard etiquette can be pre-tax or post-tax
    const tipBase = (tipBeforeTaxCheckbox && tipBeforeTaxCheckbox.checked) ? rawBill : (rawBill + taxAmount);
    let tipAmount = tipBase * (currentTipPercent / 100);

    let grandTotal = rawBill + taxAmount + tipAmount;

    // Round up logic
    if (shouldRoundUp && grandTotal > 0) {
      const rounded = Math.ceil(grandTotal);
      tipAmount += (rounded - grandTotal);
      grandTotal = rounded;
    }

    const perPersonTotal = grandTotal / guests;
    const perPersonTip = tipAmount / guests;
    const perPersonTax = taxAmount / guests;

    // Update UI
    if (outSubtotal) outSubtotal.textContent = `$${rawBill.toFixed(2)}`;
    if (outTax) outTax.textContent = `$${taxAmount.toFixed(2)}`;
    if (outTip) outTip.textContent = `$${tipAmount.toFixed(2)} (${currentTipPercent}%)`;
    if (outGrandTotal) outGrandTotal.textContent = `$${grandTotal.toFixed(2)}`;
    if (outPerPersonTotal) outPerPersonTotal.textContent = `$${perPersonTotal.toFixed(2)}`;
    if (outPerPersonTip) outPerPersonTip.textContent = `$${perPersonTip.toFixed(2)}`;
    if (outPerPersonTax) outPerPersonTax.textContent = `$${perPersonTax.toFixed(2)}`;
  }

  // State selection change
  if (stateSelect) {
    stateSelect.addEventListener('change', (e) => {
      const selected = stateSelect.options[stateSelect.selectedIndex];
      if (selected && selected.dataset.tax !== undefined) {
        taxRateInput.value = selected.dataset.tax;
      }
      shouldRoundUp = false;
      calculate();
    });
  }

  // Tip buttons
  tipButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      tipButtons.forEach(b => {
        b.classList.remove('bg-indigo-600', 'text-white', 'border-indigo-600');
        b.classList.add('bg-slate-100', 'dark:bg-slate-800', 'text-slate-700', 'dark:text-slate-200');
      });
      btn.classList.add('bg-indigo-600', 'text-white', 'border-indigo-600');
      btn.classList.remove('bg-slate-100', 'dark:bg-slate-800', 'text-slate-700', 'dark:text-slate-200');

      currentTipPercent = parseFloat(btn.dataset.tip);
      if (customTipInput) customTipInput.value = '';
      shouldRoundUp = false;
      calculate();
    });
  });

  // Custom tip input
  if (customTipInput) {
    customTipInput.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      if (!isNaN(val) && val >= 0) {
        currentTipPercent = val;
        tipButtons.forEach(b => {
          b.classList.remove('bg-indigo-600', 'text-white', 'border-indigo-600');
          b.classList.add('bg-slate-100', 'dark:bg-slate-800', 'text-slate-700', 'dark:text-slate-200');
        });
        shouldRoundUp = false;
        calculate();
      }
    });
  }

  // Guests buttons
  if (decreaseGuestsBtn) {
    decreaseGuestsBtn.addEventListener('click', () => {
      let g = parseInt(splitGuestsInput.value) || 1;
      if (g > 1) {
        splitGuestsInput.value = g - 1;
        calculate();
      }
    });
  }
  if (increaseGuestsBtn) {
    increaseGuestsBtn.addEventListener('click', () => {
      let g = parseInt(splitGuestsInput.value) || 1;
      if (g < 50) {
        splitGuestsInput.value = g + 1;
        calculate();
      }
    });
  }
  if (splitGuestsInput) {
    splitGuestsInput.addEventListener('input', calculate);
  }

  // Round up button
  if (roundUpBtn) {
    roundUpBtn.addEventListener('click', () => {
      shouldRoundUp = !shouldRoundUp;
      if (shouldRoundUp) {
        roundUpBtn.classList.add('bg-indigo-50', 'dark:bg-indigo-950/80', 'text-indigo-600', 'border-indigo-400');
      } else {
        roundUpBtn.classList.remove('bg-indigo-50', 'dark:bg-indigo-950/80', 'text-indigo-600', 'border-indigo-400');
      }
      calculate();
    });
  }

  // Reset button
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (billAmountInput) billAmountInput.value = '';
      if (localTaxInput) localTaxInput.value = '0';
      if (splitGuestsInput) splitGuestsInput.value = '1';
      shouldRoundUp = false;
      calculate();
    });
  }

  // Copy Summary
  if (copySummaryBtn) {
    copySummaryBtn.addEventListener('click', () => {
      const summary = `🧾 MultiTools Hub Bill Summary\n` +
        `Subtotal: ${outSubtotal.textContent}\n` +
        `Tax: ${outTax.textContent}\n` +
        `Tip (${currentTipPercent}%): ${outTip.textContent}\n` +
        `--------------------\n` +
        `Grand Total: ${outGrandTotal.textContent}\n` +
        `Split (${splitGuestsInput.value} guests): ${outPerPersonTotal.textContent} each\n` +
        `(Calculated privately at MultiTools Hub)`;

      navigator.clipboard.writeText(summary).then(() => {
        if (window.showToast) window.showToast('Bill breakdown copied to clipboard!');
      });
    });
  }

  // Listeners on inputs
  [billAmountInput, taxRateInput, localTaxInput, tipBeforeTaxCheckbox].forEach(el => {
    if (el) el.addEventListener('input', () => {
      shouldRoundUp = false;
      calculate();
    });
  });

  // Initial calculation
  calculate();
});
