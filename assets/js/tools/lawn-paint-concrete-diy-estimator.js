/**
 * MultiTools Hub - US Lawn, Paint, Concrete & Mulch DIY Estimator
 * 100% Client-Side Calculations for Homeowners & Contractors
 */

document.addEventListener('DOMContentLoaded', () => {
  // Navigation Tabs
  const tabBtns = document.querySelectorAll('.diy-tab-btn');
  const tabPanels = document.querySelectorAll('.diy-tab-panel');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => {
        b.classList.remove('bg-indigo-600', 'text-white', 'shadow-sm');
        b.classList.add('bg-white', 'dark:bg-slate-900', 'text-slate-600', 'dark:text-slate-300');
      });
      btn.classList.add('bg-indigo-600', 'text-white', 'shadow-sm');
      btn.classList.remove('bg-white', 'dark:bg-slate-900', 'text-slate-600', 'dark:text-slate-300');

      const target = btn.dataset.tab;
      tabPanels.forEach(p => {
        if (p.id === target) p.classList.remove('hidden');
        else p.classList.add('hidden');
      });
    });
  });

  // TAB 1: Paint Calculator
  const roomLengthInput = document.getElementById('paint-length');
  const roomWidthInput = document.getElementById('paint-width');
  const roomHeightInput = document.getElementById('paint-height');
  const doorsCountInput = document.getElementById('paint-doors');
  const windowsCountInput = document.getElementById('paint-windows');
  const coatsCountInput = document.getElementById('paint-coats');
  const paintPriceInput = document.getElementById('paint-price');

  const outPaintArea = document.getElementById('out-paint-area');
  const outPaintGallons = document.getElementById('out-paint-gallons');
  const outPaintQuarts = document.getElementById('out-paint-quarts');
  const outPaintCost = document.getElementById('out-paint-cost');

  function calculatePaint() {
    const l = parseFloat(roomLengthInput?.value) || 0;
    const w = parseFloat(roomWidthInput?.value) || 0;
    const h = parseFloat(roomHeightInput?.value) || 0;
    const doors = parseInt(doorsCountInput?.value) || 0;
    const windows = parseInt(windowsCountInput?.value) || 0;
    const coats = parseInt(coatsCountInput?.value) || 2;
    const pricePerGal = parseFloat(paintPriceInput?.value) || 45;

    // Perimeter = 2 * (l + w), Total wall area = Perimeter * h
    const grossWallArea = 2 * (l + w) * h;
    const deductions = (doors * 21) + (windows * 15); // Standard US deductions (sq ft)
    const netAreaOneCoat = Math.max(0, grossWallArea - deductions);
    const totalAreaCoated = netAreaOneCoat * coats;

    // US standard paint coverage: 350 sq ft per gallon
    const gallonsNeededExact = totalAreaCoated / 350;
    const fullGallons = Math.ceil(gallonsNeededExact);
    const leftoverGallons = fullGallons - gallonsNeededExact;
    const quarts = Math.ceil((gallonsNeededExact - Math.floor(gallonsNeededExact)) * 4);
    const totalCost = fullGallons * pricePerGal;

    if (outPaintArea) outPaintArea.textContent = `${totalAreaCoated.toFixed(0)} sq ft`;
    if (outPaintGallons) outPaintGallons.textContent = `${fullGallons} Gal${fullGallons > 1 ? 's' : ''}`;
    if (outPaintQuarts) outPaintQuarts.textContent = `(or ${Math.floor(gallonsNeededExact)} gal + ${quarts} qt)`;
    if (outPaintCost) outPaintCost.textContent = `$${totalCost.toFixed(2)}`;
  }

  [roomLengthInput, roomWidthInput, roomHeightInput, doorsCountInput, windowsCountInput, coatsCountInput, paintPriceInput].forEach(inp => {
    if (inp) inp.addEventListener('input', calculatePaint);
  });

  // TAB 2: Mulch & Soil Estimator
  const mulchLengthInput = document.getElementById('mulch-length');
  const mulchWidthInput = document.getElementById('mulch-width');
  const mulchDepthSelect = document.getElementById('mulch-depth');
  const mulchPriceInput = document.getElementById('mulch-price');

  const outMulchYards = document.getElementById('out-mulch-yards');
  const outMulch2cuBags = document.getElementById('out-mulch-2cu');
  const outMulch3cuBags = document.getElementById('out-mulch-3cu');
  const outMulchCost = document.getElementById('out-mulch-cost');

  function calculateMulch() {
    const l = parseFloat(mulchLengthInput?.value) || 0;
    const w = parseFloat(mulchWidthInput?.value) || 0;
    const depthInches = parseFloat(mulchDepthSelect?.value) || 3;
    const pricePerBag = parseFloat(mulchPriceInput?.value) || 3.98;

    // Area in sq ft
    const areaSqFt = l * w;
    // Cubic feet = Area * (depth / 12)
    const cubicFeet = areaSqFt * (depthInches / 12);
    // Cubic Yards = Cubic Feet / 27
    const cubicYards = cubicFeet / 27;

    // Standard US bags at Lowe's / Home Depot: 2 cu. ft. and 3 cu. ft.
    const bags2cu = Math.ceil(cubicFeet / 2);
    const bags3cu = Math.ceil(cubicFeet / 3);
    const estimatedCost = bags2cu * pricePerBag;

    if (outMulchYards) outMulchYards.textContent = `${cubicYards.toFixed(2)} cu yd`;
    if (outMulch2cuBags) outMulch2cuBags.textContent = `${bags2cu} Bags (2 cu. ft.)`;
    if (outMulch3cuBags) outMulch3cuBags.textContent = `or ${bags3cu} Bags (3 cu. ft.)`;
    if (outMulchCost) outMulchCost.textContent = `$${estimatedCost.toFixed(2)}`;
  }

  [mulchLengthInput, mulchWidthInput, mulchDepthSelect, mulchPriceInput].forEach(inp => {
    if (inp) inp.addEventListener('input', calculateMulch);
  });

  // TAB 3: Concrete Slab Estimator
  const concLengthInput = document.getElementById('conc-length');
  const concWidthInput = document.getElementById('conc-width');
  const concThicknessSelect = document.getElementById('conc-thickness');
  const concWasteInput = document.getElementById('conc-waste');

  const outConcYards = document.getElementById('out-conc-yards');
  const outConc80lb = document.getElementById('out-conc-80lb');
  const outConc60lb = document.getElementById('out-conc-60lb');
  const outConcTruckload = document.getElementById('out-conc-truck');

  function calculateConcrete() {
    const l = parseFloat(concLengthInput?.value) || 0;
    const w = parseFloat(concWidthInput?.value) || 0;
    const thickInches = parseFloat(concThicknessSelect?.value) || 4;
    const wastePercent = parseFloat(concWasteInput?.value) || 10;

    const area = l * w;
    const cubicFeetRaw = area * (thickInches / 12);
    const cubicFeetWithWaste = cubicFeetRaw * (1 + wastePercent / 100);
    const cubicYards = cubicFeetWithWaste / 27;

    // One 80lb bag of Quikrete yields approx 0.60 cu ft (45 bags per cu yd)
    // One 60lb bag of Quikrete yields approx 0.45 cu ft (60 bags per cu yd)
    const bags80 = Math.ceil(cubicFeetWithWaste / 0.60);
    const bags60 = Math.ceil(cubicFeetWithWaste / 0.45);

    if (outConcYards) outConcYards.textContent = `${cubicYards.toFixed(2)} cu yd`;
    if (outConc80lb) outConc80lb.textContent = `${bags80} Bags`;
    if (outConc60lb) outConc60lb.textContent = `${bags60} Bags`;
    if (outConcTruckload) {
      if (cubicYards >= 4) {
        outConcTruckload.textContent = `Recommended Ready-Mix Delivery (${cubicYards.toFixed(1)} yards)`;
      } else {
        outConcTruckload.textContent = `DIY Bag Mixing Feasible (< 4 yards)`;
      }
    }
  }

  [concLengthInput, concWidthInput, concThicknessSelect, concWasteInput].forEach(inp => {
    if (inp) inp.addEventListener('input', calculateConcrete);
  });

  // TAB 4: Grass Seed & Fertilizer
  const lawnAreaInput = document.getElementById('lawn-area');
  const outOverseedLbs = document.getElementById('out-overseed-lbs');
  const outNewLawnLbs = document.getElementById('out-newlawn-lbs');
  const outFertilizerBags = document.getElementById('out-fert-bags');

  function calculateLawn() {
    const sqFt = parseFloat(lawnAreaInput?.value) || 0;

    // Standard US cool/warm season mix: Overseeding ~ 3-4 lbs per 1,000 sq ft; New lawn ~ 6-8 lbs per 1,000 sq ft
    const overseedLbs = Math.ceil((sqFt / 1000) * 3.5);
    const newLawnLbs = Math.ceil((sqFt / 1000) * 7.0);

    // Standard fertilizer bag covers 5,000 sq ft
    const fertBags = Math.ceil(sqFt / 5000);

    if (outOverseedLbs) outOverseedLbs.textContent = `${overseedLbs} lbs`;
    if (outNewLawnLbs) outNewLawnLbs.textContent = `${newLawnLbs} lbs`;
    if (outFertilizerBags) outFertilizerBags.textContent = `${fertBags} Bag${fertBags > 1 ? 's' : ''} (5k sq ft bags)`;
  }

  if (lawnAreaInput) lawnAreaInput.addEventListener('input', calculateLawn);

  // Initialize
  calculatePaint();
  calculateMulch();
  calculateConcrete();
  calculateLawn();
});
