/**
 * MultiTools Hub - Etsy, eBay & Amazon FBA Fee & Profit Calculator (USA)
 * 100% Client-side Realtime Calculation
 * Accurate 2026 US platform fee schedules
 */
(function EcommerceCalculatorModule() {
  'use strict';

  let currentPlatform = 'etsy'; // 'etsy', 'ebay', 'amazon'

  const presets = {
    etsy: {
      price: 35.00,
      shippingCharged: 4.99,
      itemCost: 8.50,
      shippingCost: 3.75,
      adSpend: 0
    },
    ebay: {
      price: 65.00,
      shippingCharged: 0.00, // Free shipping
      itemCost: 20.00,
      shippingCost: 6.50,
      adSpend: 2.0 // 2% promoted listing
    },
    amazon: {
      price: 29.99,
      shippingCharged: 0.00,
      itemCost: 6.00,
      shippingCost: 0.00, // FBA handles shipping
      adSpend: 1.50
    }
  };

  function init() {
    initTabs();
    initInputs();
    initPresets();
    calculate();
  }

  function initTabs() {
    const tabBtns = document.querySelectorAll('[data-ecom-tab]');
    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        currentPlatform = btn.getAttribute('data-ecom-tab');
        tabBtns.forEach(b => {
          b.classList.remove('bg-indigo-600', 'text-white', 'shadow-sm');
          b.classList.add('text-slate-600', 'dark:text-slate-300', 'bg-transparent');
        });
        btn.classList.add('bg-indigo-600', 'text-white', 'shadow-sm');
        btn.classList.remove('text-slate-600', 'dark:text-slate-300', 'bg-transparent');

        // Toggle platform specific options
        const fbaWeightRow = document.getElementById('ecom-fba-row');
        const ebayCategoryRow = document.getElementById('ecom-ebay-row');
        if (fbaWeightRow) fbaWeightRow.classList.toggle('hidden', currentPlatform !== 'amazon');
        if (ebayCategoryRow) ebayCategoryRow.classList.toggle('hidden', currentPlatform !== 'ebay');

        // Apply preset
        if (presets[currentPlatform]) {
          applyPresetValues(presets[currentPlatform]);
        }
        calculate();
      });
    });
  }

  function applyPresetValues(data) {
    const set = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.value = val;
    };
    set('ecom-price', data.price);
    set('ecom-ship-charged', data.shippingCharged);
    set('ecom-cogs', data.itemCost);
    set('ecom-ship-cost', data.shippingCost);
    set('ecom-ad-cost', data.adSpend);
  }

  function initInputs() {
    const inputs = [
      'ecom-price', 'ecom-ship-charged', 'ecom-cogs',
      'ecom-ship-cost', 'ecom-ad-cost', 'ecom-fba-size', 'ecom-ebay-cat'
    ];

    inputs.forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('input', calculate);
        el.addEventListener('change', calculate);
      }
    });
  }

  function initPresets() {
    const sampleBtn = document.getElementById('ecom-sample-btn');
    if (sampleBtn) {
      sampleBtn.addEventListener('click', () => {
        if (presets[currentPlatform]) {
          applyPresetValues(presets[currentPlatform]);
          calculate();
          if (window.showToast) window.showToast(`Loaded sample scenario for ${currentPlatform.toUpperCase()}!`, 'success');
        }
      });
    }
  }

  function calculate() {
    const price = parseFloat(document.getElementById('ecom-price')?.value) || 0;
    const shipCharged = parseFloat(document.getElementById('ecom-ship-charged')?.value) || 0;
    const cogs = parseFloat(document.getElementById('ecom-cogs')?.value) || 0;
    const shipCost = parseFloat(document.getElementById('ecom-ship-cost')?.value) || 0;
    const adCost = parseFloat(document.getElementById('ecom-ad-cost')?.value) || 0;

    const totalRevenue = price + shipCharged;
    let feeBreakdown = [];
    let totalFees = 0;

    if (currentPlatform === 'etsy') {
      // 2026 US Etsy Fee Schedule:
      // Listing fee: $0.20 per transaction
      // Transaction fee: 6.5% of total order (item price + shipping charged)
      // Payment Processing: 3% + $0.25 (US domestic payment rate)
      const listingFee = 0.20;
      const transactionFee = totalRevenue * 0.065;
      const paymentFee = (totalRevenue * 0.03) + 0.25;
      totalFees = listingFee + transactionFee + paymentFee + adCost;

      feeBreakdown = [
        { label: 'Etsy Listing Fee', amount: listingFee },
        { label: 'Transaction Fee (6.5%)', amount: transactionFee },
        { label: 'Payment Processing (3% + $0.25)', amount: paymentFee }
      ];
      if (adCost > 0) feeBreakdown.push({ label: 'Etsy Ads / Offsite Fee', amount: adCost });

    } else if (currentPlatform === 'ebay') {
      // 2026 US eBay Fee Schedule:
      // Standard Final Value Fee: 13.25% of the total amount of the sale up to $7,500 + $0.30 per order
      const catSelect = document.getElementById('ecom-ebay-cat');
      let fvfRate = 0.1325;
      if (catSelect && catSelect.value === 'books') fvfRate = 0.1455;
      if (catSelect && catSelect.value === 'guitars') fvfRate = 0.0635;
      if (catSelect && catSelect.value === 'electronics') fvfRate = 0.0900;

      const fvfFee = (totalRevenue * fvfRate) + 0.30;
      const promotedAdFee = (totalRevenue * (adCost / 100));
      totalFees = fvfFee + promotedAdFee;

      feeBreakdown = [
        { label: `eBay Final Value Fee (${(fvfRate * 100).toFixed(1)}% + $0.30)`, amount: fvfFee }
      ];
      if (adCost > 0) feeBreakdown.push({ label: `Promoted Listing (${adCost}%)`, amount: promotedAdFee });

    } else if (currentPlatform === 'amazon') {
      // 2026 US Amazon FBA Fee Schedule:
      // Referral Fee: Standard 15% (or $0.30 minimum)
      // FBA Fulfillment Fee: based on size tier
      const fbaTier = document.getElementById('ecom-fba-size')?.value || 'small_standard';
      let fbaPickPackFee = 3.22; // Small standard (< 6 oz)
      if (fbaTier === 'large_1lb') fbaPickPackFee = 4.15; // Large standard (up to 1 lb)
      if (fbaTier === 'large_2lb') fbaPickPackFee = 5.40; // Large standard (1 to 2 lb)
      if (fbaTier === 'small_oversize') fbaPickPackFee = 9.73;

      const referralFee = Math.max(0.30, price * 0.15);
      totalFees = referralFee + fbaPickPackFee + adCost;

      feeBreakdown = [
        { label: 'Amazon Referral Fee (15%)', amount: referralFee },
        { label: `FBA Pick & Pack Fee (${fbaTier.replace('_', ' ')})`, amount: fbaPickPackFee }
      ];
      if (adCost > 0) feeBreakdown.push({ label: 'Amazon PPC Advertising', amount: adCost });
    }

    const totalCosts = cogs + shipCost + totalFees;
    const netProfit = totalRevenue - totalCosts;
    const margin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;
    const roi = (cogs + shipCost) > 0 ? (netProfit / (cogs + shipCost)) * 100 : 0;

    // Break-even estimate: Price where profit = 0
    // Profit = (P + ShipCharged) - COGS - ShipCost - Fees(P) = 0
    let breakEven = 0;
    if (currentPlatform === 'etsy') {
      // P + SC - COGS - ShipCost - 0.20 - 0.065(P+SC) - (0.03(P+SC) + 0.25) - ad = 0
      // (P + SC) * (1 - 0.065 - 0.03) = COGS + ShipCost + 0.45 + ad
      const denom = (1 - 0.095);
      breakEven = Math.max(0, (cogs + shipCost + 0.45 + adCost) / denom - shipCharged);
    } else if (currentPlatform === 'ebay') {
      const denom = (1 - 0.1325 - (adCost / 100));
      breakEven = Math.max(0, (cogs + shipCost + 0.30) / Math.max(0.1, denom) - shipCharged);
    } else {
      // Amazon 15%
      const denom = 0.85;
      const fbaPickPackFee = 4.15;
      breakEven = Math.max(0, (cogs + fbaPickPackFee + adCost) / denom);
    }

    // Render Metrics
    renderMetric('ecom-profit-val', `$${netProfit.toFixed(2)}`, netProfit >= 0 ? 'text-emerald-600' : 'text-rose-600');
    renderMetric('ecom-margin-val', `${margin.toFixed(1)}%`, margin >= 0 ? 'text-emerald-600' : 'text-rose-600');
    renderMetric('ecom-roi-val', `${roi.toFixed(1)}%`, roi >= 0 ? 'text-indigo-600' : 'text-rose-600');
    renderMetric('ecom-fees-val', `$${totalFees.toFixed(2)}`, 'text-slate-800 dark:text-slate-200');
    renderMetric('ecom-breakeven-val', `$${breakEven.toFixed(2)}`, 'text-slate-800 dark:text-slate-200');

    // Render Fee Breakdown Table
    const breakdownEl = document.getElementById('ecom-fee-breakdown');
    if (breakdownEl) {
      breakdownEl.innerHTML = feeBreakdown.map(item => `
        <div class="flex items-center justify-between py-1 text-xs text-slate-600 dark:text-slate-400">
          <span>${item.label}</span>
          <span class="font-mono font-semibold text-slate-900 dark:text-white">$${item.amount.toFixed(2)}</span>
        </div>
      `).join('');
    }

    // Render Interactive Visual Stack Bar
    renderVisualStack(totalRevenue, cogs, shipCost, totalFees, netProfit);
  }

  function renderMetric(id, text, colorClass) {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = text;
    el.className = `text-2xl sm:text-3xl font-extrabold font-mono tracking-tight ${colorClass}`;
  }

  function renderVisualStack(revenue, cogs, shipCost, fees, profit) {
    const barCogs = document.getElementById('bar-cogs');
    const barShip = document.getElementById('bar-ship');
    const barFees = document.getElementById('bar-fees');
    const barProfit = document.getElementById('bar-profit');

    if (!barCogs || revenue <= 0) return;

    const pctCogs = Math.min(100, Math.max(0, (cogs / revenue) * 100));
    const pctShip = Math.min(100, Math.max(0, (shipCost / revenue) * 100));
    const pctFees = Math.min(100, Math.max(0, (fees / revenue) * 100));
    const pctProfit = Math.min(100, Math.max(0, (Math.max(0, profit) / revenue) * 100));

    barCogs.style.width = pctCogs + '%';
    barShip.style.width = pctShip + '%';
    barFees.style.width = pctFees + '%';
    barProfit.style.width = pctProfit + '%';

    barCogs.title = `Item Cost: ${pctCogs.toFixed(1)}%`;
    barShip.title = `Shipping: ${pctShip.toFixed(1)}%`;
    barFees.title = `Platform Fees: ${pctFees.toFixed(1)}%`;
    barProfit.title = `Net Profit: ${pctProfit.toFixed(1)}%`;
  }

  document.addEventListener('DOMContentLoaded', init);
})();
