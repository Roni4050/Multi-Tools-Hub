/**
 * MultiTools Hub - US License Plate & VIN Format Decoder / Validator
 * 100% Client-Side NHTSA & ISO 3779 Modulo 11 Check Digit Algorithm
 */

document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const vinInput = document.getElementById('vin-input');
  const decodeBtn = document.getElementById('decode-btn');
  const sampleVinBtns = document.querySelectorAll('.sample-vin-btn');

  // Outputs
  const vinResultContainer = document.getElementById('vin-result-container');
  const checkDigitBadge = document.getElementById('check-digit-badge');
  const outCountry = document.getElementById('out-country');
  const outMake = document.getElementById('out-make');
  const outYear = document.getElementById('out-year');
  const outVehicleType = document.getElementById('out-vehicle-type');
  const outAssemblyPlant = document.getElementById('out-assembly-plant');
  const outSerial = document.getElementById('out-serial');
  const outCharacterBreakdown = document.getElementById('vin-character-breakdown');

  // License plate search
  const plateStateInput = document.getElementById('plate-state-input');
  const plateFormatGrid = document.getElementById('plate-format-grid');

  // NHTSA Standard Weight Factors for Modulo 11 Check Digit Calculation
  const WEIGHTS = [8, 7, 6, 5, 4, 3, 2, 10, 0, 9, 8, 7, 6, 5, 4, 3, 2];

  // Letter Numerical Equivalents
  const LETTER_VALUES = {
    'A': 1, 'B': 2, 'C': 3, 'D': 4, 'E': 5, 'F': 6, 'G': 7, 'H': 8,
    'J': 1, 'K': 2, 'L': 3, 'M': 4, 'N': 5, 'P': 7, 'R': 9,
    'S': 2, 'T': 3, 'U': 4, 'V': 5, 'W': 6, 'X': 7, 'Y': 8, 'Z': 9,
    '0': 0, '1': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9
  };

  // Model Year Code Map (Pos 10)
  const YEAR_CODES = {
    'A': 2010, 'B': 2011, 'C': 2012, 'D': 2013, 'E': 2014, 'F': 2015,
    'G': 2016, 'H': 2017, 'J': 2018, 'K': 2019, 'L': 2020, 'M': 2021,
    'N': 2022, 'P': 2023, 'R': 2024, 'S': 2025, 'T': 2026, 'V': 2027,
    'W': 2028, 'X': 2029, 'Y': 2030,
    '1': 2001, '2': 2002, '3': 2003, '4': 2004, '5': 2005, '6': 2006,
    '7': 2007, '8': 2008, '9': 2009
  };

  // WMI (World Manufacturer Identifier) Database
  const WMI_MAP = {
    '1FA': { make: 'Ford', country: 'United States', type: 'Passenger Car' },
    '1FB': { make: 'Ford', country: 'United States', type: 'Truck / Commercial' },
    '1FC': { make: 'Ford', country: 'United States', type: 'Basic Stripped Chassis' },
    '1FD': { make: 'Ford', country: 'United States', type: 'Incomplete Vehicle' },
    '1FM': { make: 'Ford', country: 'United States', type: 'SUV / MPV' },
    '1FT': { make: 'Ford', country: 'United States', type: 'Truck (F-150 / Super Duty)' },
    '1G1': { make: 'Chevrolet', country: 'United States', type: 'Passenger Car' },
    '1GC': { make: 'Chevrolet', country: 'United States', type: 'Truck (Silverado)' },
    '1GN': { make: 'Chevrolet', country: 'United States', type: 'SUV (Tahoe / Suburban)' },
    '1GT': { make: 'GMC', country: 'United States', type: 'Truck / SUV (Sierra / Yukon)' },
    '1HG': { make: 'Honda', country: 'United States', type: 'Passenger Car (Accord / Civic)' },
    '1J4': { make: 'Jeep', country: 'United States', type: 'SUV (Wrangler / Grand Cherokee)' },
    '1LN': { make: 'Lincoln', country: 'United States', type: 'Passenger Car' },
    '2G1': { make: 'Chevrolet', country: 'Canada', type: 'Passenger Car (Camaro / Impala)' },
    '2HG': { make: 'Honda', country: 'Canada', type: 'Passenger Car (Civic)' },
    '2T1': { make: 'Toyota', country: 'Canada', type: 'Passenger Car (Corolla)' },
    '3FA': { make: 'Ford', country: 'Mexico', type: 'Passenger Car (Fusion / Fiesta)' },
    '3GN': { make: 'Chevrolet', country: 'Mexico', type: 'SUV (Equinox / Blazer)' },
    '3VW': { make: 'Volkswagen', country: 'Mexico', type: 'Passenger Car (Jetta / Golf)' },
    '4S3': { make: 'Subaru', country: 'United States', type: 'Passenger Car (Outback / Legacy)' },
    '4T1': { make: 'Toyota', country: 'United States', type: 'Passenger Car (Camry)' },
    '5N1': { make: 'Nissan', country: 'United States', type: 'SUV (Pathfinder / Rogue)' },
    '5YJ': { make: 'Tesla', country: 'United States', type: 'Electric Passenger Car (Model S / 3)' },
    '7SA': { make: 'Tesla', country: 'United States', type: 'Electric SUV (Model X / Y)' },
    'JHM': { make: 'Honda', country: 'Japan', type: 'Passenger Car' },
    'JM1': { make: 'Mazda', country: 'Japan', type: 'Passenger Car' },
    'JN1': { make: 'Nissan', country: 'Japan', type: 'Passenger Car' },
    'JT2': { make: 'Toyota', country: 'Japan', type: 'SUV / Truck' },
    'JTD': { make: 'Toyota', country: 'Japan', type: 'Passenger Car (Prius)' },
    'KL1': { make: 'Chevrolet', country: 'South Korea', type: 'Passenger Car' },
    'KM8': { make: 'Hyundai', country: 'South Korea', type: 'SUV (Tucson / Santa Fe)' },
    'KNA': { make: 'Kia', country: 'South Korea', type: 'Passenger Car' },
    'SAJ': { make: 'Jaguar', country: 'United Kingdom', type: 'Passenger Car' },
    'SAL': { make: 'Land Rover', country: 'United Kingdom', type: 'SUV' },
    'WAU': { make: 'Audi', country: 'Germany', type: 'Passenger Car' },
    'WBA': { make: 'BMW', country: 'Germany', type: 'Passenger Car' },
    'WBY': { make: 'BMW i', country: 'Germany', type: 'Electric Vehicle' },
    'WDD': { make: 'Mercedes-Benz', country: 'Germany', type: 'Passenger Car' },
    'WP0': { make: 'Porsche', country: 'Germany', type: 'Sports Car' },
    'WVW': { make: 'Volkswagen', country: 'Germany', type: 'Passenger Car' },
    'YV1': { make: 'Volvo', country: 'Sweden', type: 'Passenger Car' },
    'ZAR': { make: 'Alfa Romeo', country: 'Italy', type: 'Passenger Car' },
    'ZFF': { make: 'Ferrari', country: 'Italy', type: 'Supercar' }
  };

  // US State License Plate Standard Format Table
  const PLATE_FORMATS = [
    { state: "California", code: "CA", format: "1ABC234 (1 digit, 3 letters, 3 digits)", sticker: "Upper right corner" },
    { state: "Texas", code: "TX", format: "ABC-1234 (3 letters, 4 digits)", sticker: "Windshield sticker" },
    { state: "Florida", code: "FL", format: "ABC-D12 or 12A-BCD", sticker: "Upper right corner" },
    { state: "New York", code: "NY", format: "ABC-1234 (3 letters, 4 digits)", sticker: "Windshield inspection" },
    { state: "Illinois", code: "IL", format: "AB 12345 or A12 3456", sticker: "Upper right corner" },
    { state: "Pennsylvania", code: "PA", format: "ABC-1234 (3 letters, 4 digits)", sticker: "Sticker-less (electronic)" },
    { state: "Ohio", code: "OH", format: "ABC 1234 (3 letters, 4 digits)", sticker: "Bottom right corner" },
    { state: "Georgia", code: "GA", format: "ABC1234 (3 letters, 4 digits)", sticker: "Bottom right corner" },
    { state: "North Carolina", code: "NC", format: "ABC-1234 (3 letters, 4 digits)", sticker: "Upper right corner" },
    { state: "Michigan", code: "MI", format: "ABC 1234 (3 letters, 4 digits)", sticker: "Upper right corner" },
    { state: "Washington", code: "WA", format: "ABC1234 (3 letters, 4 digits)", sticker: "Lower right corner" },
    { state: "Arizona", code: "AZ", format: "ABC1234 or AB12345", sticker: "Upper right corner" },
    { state: "Colorado", code: "CO", format: "ABC-123 or ABC-D12", sticker: "Lower right corner" }
  ];

  function decodeVIN() {
    let vin = vinInput?.value.trim().toUpperCase() || '';
    if (!vin) return;

    // Filter out spaces or dashes
    vin = vin.replace(/[^A-Z0-9]/g, '');

    // Check for illegal letters I, O, Q
    const illegalChars = vin.match(/[IOQ]/g);
    if (illegalChars) {
      if (checkDigitBadge) {
        checkDigitBadge.className = 'px-3 py-1.5 rounded-lg text-xs font-bold bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300';
        checkDigitBadge.textContent = `❌ Invalid VIN: Letters I, O, and Q are legally prohibited in 17-digit VINs (Confused with 1 and 0).`;
      }
      return;
    }

    if (vin.length !== 17) {
      if (checkDigitBadge) {
        checkDigitBadge.className = 'px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300';
        checkDigitBadge.textContent = `⚠️ Incomplete: VIN must be exactly 17 characters (Currently ${vin.length}).`;
      }
      return;
    }

    // NHTSA Modulo 11 Check Digit Algorithm
    let sum = 0;
    for (let i = 0; i < 17; i++) {
      const char = vin[i];
      const val = LETTER_VALUES[char] !== undefined ? LETTER_VALUES[char] : 0;
      sum += val * WEIGHTS[i];
    }

    const remainder = sum % 11;
    let expectedCheck = remainder === 10 ? 'X' : remainder.toString();
    const actualCheck = vin[8]; // Position 9 (0-indexed 8)
    const isValidCheck = (expectedCheck === actualCheck);

    // Update Check Digit Badge
    if (checkDigitBadge) {
      if (isValidCheck) {
        checkDigitBadge.className = 'px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 flex items-center gap-2';
        checkDigitBadge.innerHTML = `<i data-lucide="check-circle" class="w-4 h-4"></i> Official Check Digit Verified (Position 9: "${actualCheck}" matches NHTSA Modulo-11 Math)`;
      } else {
        checkDigitBadge.className = 'px-3 py-1.5 rounded-lg text-xs font-bold bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border border-rose-300 dark:border-rose-800 flex items-center gap-2';
        checkDigitBadge.innerHTML = `<i data-lucide="alert-triangle" class="w-4 h-4"></i> Check Digit Mismatch (Expected "${expectedCheck}", found "${actualCheck}"). This VIN may be fabricated or mistyped.`;
      }
      if (window.lucide) window.lucide.createIcons();
    }

    // Decode WMI (Pos 1-3)
    const wmi = vin.substring(0, 3);
    const wmiData = WMI_MAP[wmi];

    // Decode Country from Pos 1
    let country = 'Unknown Origin';
    const cChar = vin[0];
    if (['1', '4', '5'].includes(cChar)) country = 'United States';
    else if (cChar === '2') country = 'Canada';
    else if (cChar === '3') country = 'Mexico';
    else if (cChar === 'J') country = 'Japan';
    else if (cChar === 'K') country = 'South Korea';
    else if (cChar === 'S') country = 'United Kingdom';
    else if (cChar === 'W') country = 'Germany';
    else if (cChar === 'V') country = 'France / Spain';
    else if (cChar === 'Z') country = 'Italy';
    else if (cChar === 'Y') country = 'Sweden / Finland';

    // Decode Year (Pos 10)
    const yearChar = vin[9];
    const modelYear = YEAR_CODES[yearChar] || 'Standard Vehicle Era';

    // Populate Results
    if (outCountry) outCountry.textContent = wmiData ? wmiData.country : country;
    if (outMake) outMake.textContent = wmiData ? wmiData.make : 'Recognized Automotive Make';
    if (outYear) outYear.textContent = `${modelYear} (Code: ${yearChar})`;
    if (outVehicleType) outVehicleType.textContent = wmiData ? wmiData.type : 'Passenger / Commercial Vehicle';
    if (outAssemblyPlant) outAssemblyPlant.textContent = `Plant Code "${vin[10]}"`;
    if (outSerial) outSerial.textContent = vin.substring(11, 17);

    // Visual Segment Breakdown
    if (outCharacterBreakdown) {
      outCharacterBreakdown.innerHTML = `
        <div class="flex flex-wrap gap-1 font-mono text-sm font-bold">
          <span class="px-2 py-1 rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300" title="WMI: World Manufacturer Identifier">${vin.substring(0, 3)}</span>
          <span class="px-2 py-1 rounded bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300" title="VDS: Vehicle Descriptor Section">${vin.substring(3, 8)}</span>
          <span class="px-2 py-1 rounded ${isValidCheck ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300' : 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'}" title="Check Digit (Position 9)">${vin[8]}</span>
          <span class="px-2 py-1 rounded bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300" title="Model Year (Position 10)">${vin[9]}</span>
          <span class="px-2 py-1 rounded bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300" title="Assembly Plant (Position 11)">${vin[10]}</span>
          <span class="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300" title="Sequential Production Number">${vin.substring(11, 17)}</span>
        </div>
      `;
    }

    if (vinResultContainer) vinResultContainer.classList.remove('hidden');
  }

  // Sample VIN click
  sampleVinBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      if (vinInput) {
        vinInput.value = btn.dataset.vin;
        decodeVIN();
      }
    });
  });

  if (decodeBtn) decodeBtn.addEventListener('click', decodeVIN);
  if (vinInput) {
    vinInput.addEventListener('input', () => {
      vinInput.value = vinInput.value.toUpperCase();
      if (vinInput.value.replace(/[^A-Z0-9]/g, '').length === 17) {
        decodeVIN();
      }
    });
  }

  // Render License Plate Formats
  function renderPlates() {
    if (!plateFormatGrid) return;
    const query = plateStateInput?.value.trim().toLowerCase() || '';

    const list = PLATE_FORMATS.filter(p =>
      p.state.toLowerCase().includes(query) ||
      p.code.toLowerCase() === query ||
      p.format.toLowerCase().includes(query)
    );

    plateFormatGrid.innerHTML = list.map(p => `
      <div class="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        <div class="flex items-center justify-between mb-1">
          <h4 class="font-bold text-slate-900 dark:text-white text-sm">${p.state}</h4>
          <span class="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">${p.code}</span>
        </div>
        <div class="text-xs text-indigo-600 dark:text-indigo-400 font-mono font-bold mb-1">${p.format}</div>
        <div class="text-[11px] text-slate-500 dark:text-slate-400">🏷️ Sticker: ${p.sticker}</div>
      </div>
    `).join('');
  }

  if (plateStateInput) plateStateInput.addEventListener('input', renderPlates);

  renderPlates();
});
