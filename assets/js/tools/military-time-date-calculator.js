/**
 * MultiTools Hub - US Military Time (24-Hour) & Date Duration Calculator
 * 100% Client-Side Time & Calendar Math
 */

document.addEventListener('DOMContentLoaded', () => {
  // Navigation Tabs
  const tabBtns = document.querySelectorAll('.time-tab-btn');
  const tabPanels = document.querySelectorAll('.time-tab-panel');

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

  // TAB 1: Military Time Converter
  const milInput = document.getElementById('mil-input');
  const stdHoursInput = document.getElementById('std-hours');
  const stdMinsInput = document.getElementById('std-mins');
  const stdAmPmSelect = document.getElementById('std-ampm');

  const outStandardTime = document.getElementById('out-std-time');
  const outMilitaryTime = document.getElementById('out-mil-time');
  const outPhonetic = document.getElementById('out-mil-phonetic');

  const NUMBER_WORDS = [
    "Zero", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
    "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen",
    "Twenty", "Twenty-One", "Twenty-Two", "Twenty-Three"
  ];

  function getMilitaryPhonetic(hours, minutes) {
    let hWord = "";
    if (hours === 0) hWord = "Zero Zero";
    else if (hours < 10) hWord = "Zero " + NUMBER_WORDS[hours];
    else hWord = NUMBER_WORDS[hours];

    let mWord = "";
    if (minutes === 0) {
      mWord = "Hundred Hours";
    } else if (minutes < 10) {
      mWord = "Zero " + NUMBER_WORDS[minutes] + " Hours";
    } else {
      mWord = minutes + " Hours";
    }

    return `${hWord} ${mWord}`;
  }

  // Convert Military -> Standard
  function convertFromMilitary() {
    let val = milInput?.value.replace(/\D/g, '') || '';
    if (val.length < 3) return;

    let h = 0;
    let m = 0;

    if (val.length === 3) {
      h = parseInt(val.substring(0, 1), 10);
      m = parseInt(val.substring(1, 3), 10);
    } else {
      h = parseInt(val.substring(0, 2), 10);
      m = parseInt(val.substring(2, 4), 10);
    }

    if (h > 23) h = 23;
    if (m > 59) m = 59;

    const period = h >= 12 ? 'PM' : 'AM';
    let h12 = h % 12;
    if (h12 === 0) h12 = 12;
    const mStr = m < 10 ? '0' + m : m;

    if (outStandardTime) outStandardTime.textContent = `${h12}:${mStr} ${period}`;
    if (outPhonetic) outPhonetic.textContent = `🗣️ Pronounced: "${getMilitaryPhonetic(h, m)}"`;

    // Sync Standard Inputs
    if (stdHoursInput) stdHoursInput.value = h12;
    if (stdMinsInput) stdMinsInput.value = m;
    if (stdAmPmSelect) stdAmPmSelect.value = period;
  }

  // Convert Standard -> Military
  function convertFromStandard() {
    let h12 = parseInt(stdHoursInput?.value) || 12;
    let m = parseInt(stdMinsInput?.value) || 0;
    let ampm = stdAmPmSelect?.value || 'PM';

    if (h12 > 12) h12 = 12;
    if (h12 < 1) h12 = 1;
    if (m > 59) m = 59;
    if (m < 0) m = 0;

    let h24 = h12;
    if (ampm === 'AM') {
      if (h12 === 12) h24 = 0;
    } else {
      if (h12 !== 12) h24 = h12 + 12;
    }

    const hStr = h24 < 10 ? '0' + h24 : h24.toString();
    const mStr = m < 10 ? '0' + m : m.toString();
    const milResult = `${hStr}${mStr}`;

    if (outMilitaryTime) outMilitaryTime.textContent = `${milResult} Hours`;
    if (outPhonetic) outPhonetic.textContent = `🗣️ Pronounced: "${getMilitaryPhonetic(h24, m)}"`;

    if (milInput) milInput.value = milResult;
  }

  if (milInput) milInput.addEventListener('input', convertFromMilitary);
  [stdHoursInput, stdMinsInput, stdAmPmSelect].forEach(inp => {
    if (inp) inp.addEventListener('input', convertFromStandard);
  });

  // TAB 2: Date Duration & Business Working Days
  const startDateInput = document.getElementById('start-date');
  const endDateInput = document.getElementById('end-date');
  const excludeHolidaysCheckbox = document.getElementById('exclude-us-holidays');

  const outTotalDays = document.getElementById('out-total-days');
  const outWorkDays = document.getElementById('out-work-days');
  const outWeekendDays = document.getElementById('out-weekend-days');
  const outWeeksBreakdown = document.getElementById('out-weeks-breakdown');

  // Major US Federal Holidays (Approximate Month/Day or standard list)
  const US_HOLIDAYS = [
    "01-01", // New Year's Day
    "01-19", // MLK Day (approx mid Jan)
    "02-16", // Washington's Birthday / Presidents Day
    "05-25", // Memorial Day
    "06-19", // Juneteenth
    "07-04", // Independence Day
    "09-07", // Labor Day
    "10-12", // Columbus Day
    "11-11", // Veterans Day
    "11-26", // Thanksgiving
    "12-25"  // Christmas Day
  ];

  function calculateDateDuration() {
    const sStr = startDateInput?.value;
    const eStr = endDateInput?.value;
    if (!sStr || !eStr) return;

    let start = new Date(sStr + 'T00:00:00');
    let end = new Date(eStr + 'T00:00:00');

    if (start > end) {
      // Swap if reversed
      const temp = start;
      start = end;
      end = temp;
    }

    const diffTime = Math.abs(end - start);
    const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    let workDays = 0;
    let weekendDays = 0;
    let holidayDays = 0;

    const cur = new Date(start);
    while (cur < end) {
      const dayOfWeek = cur.getDay(); // 0 = Sunday, 6 = Saturday
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        weekendDays++;
      } else {
        const mm = String(cur.getMonth() + 1).padStart(2, '0');
        const dd = String(cur.getDate()).padStart(2, '0');
        const key = `${mm}-${dd}`;

        if (excludeHolidaysCheckbox && excludeHolidaysCheckbox.checked && US_HOLIDAYS.includes(key)) {
          holidayDays++;
        } else {
          workDays++;
        }
      }
      cur.setDate(cur.getDate() + 1);
    }

    const weeks = Math.floor(totalDays / 7);
    const remDays = totalDays % 7;

    if (outTotalDays) outTotalDays.textContent = `${totalDays} Calendar Days`;
    if (outWorkDays) outWorkDays.textContent = `${workDays} Business Days`;
    if (outWeekendDays) outWeekendDays.textContent = `${weekendDays} Weekend Days`;
    if (outWeeksBreakdown) outWeeksBreakdown.textContent = `${weeks} Weeks and ${remDays} Days`;
  }

  // Pre-fill today and +30 days
  const today = new Date();
  const plus30 = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
  if (startDateInput) startDateInput.value = today.toISOString().split('T')[0];
  if (endDateInput) endDateInput.value = plus30.toISOString().split('T')[0];

  [startDateInput, endDateInput, excludeHolidaysCheckbox].forEach(inp => {
    if (inp) inp.addEventListener('change', calculateDateDuration);
  });

  // TAB 3: Add / Subtract Date
  const baseDateInput = document.getElementById('calc-base-date');
  const calcOpSelect = document.getElementById('calc-op');
  const calcAmountInput = document.getElementById('calc-amount');
  const calcUnitSelect = document.getElementById('calc-unit');
  const outCalcResultDate = document.getElementById('out-calc-result-date');

  function calculateAddSubtractDate() {
    const baseStr = baseDateInput?.value;
    if (!baseStr) return;

    const dt = new Date(baseStr + 'T00:00:00');
    const op = calcOpSelect?.value || 'add';
    const amount = parseInt(calcAmountInput?.value) || 0;
    const unit = calcUnitSelect?.value || 'days';

    const multiplier = op === 'add' ? 1 : -1;

    if (unit === 'days') {
      dt.setDate(dt.getDate() + (amount * multiplier));
    } else if (unit === 'weeks') {
      dt.setDate(dt.getDate() + (amount * 7 * multiplier));
    } else if (unit === 'months') {
      dt.setMonth(dt.getMonth() + (amount * multiplier));
    } else if (unit === 'years') {
      dt.setFullYear(dt.getFullYear() + (amount * multiplier));
    }

    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    if (outCalcResultDate) {
      outCalcResultDate.textContent = dt.toLocaleDateString('en-US', options);
    }
  }

  if (baseDateInput) baseDateInput.value = today.toISOString().split('T')[0];
  [baseDateInput, calcOpSelect, calcAmountInput, calcUnitSelect].forEach(inp => {
    if (inp) inp.addEventListener('input', calculateAddSubtractDate);
  });

  // Initial calculations
  convertFromStandard();
  calculateDateDuration();
  calculateAddSubtractDate();
});
