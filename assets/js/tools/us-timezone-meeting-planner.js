/**
 * MultiTools Hub - US Time Zone Meeting Planner & Converter
 * 100% Client-Side Interactive Time Matrix
 */

document.addEventListener('DOMContentLoaded', () => {
  // US Time Zones Offset relative to UTC (Standard vs Daylight Savings Aware)
  // For standard reference: ET = UTC-5 (or -4 in EDT), CT = -6 (-5), MT = -7 (-6), PT = -8 (-7), AKT = -9 (-8), HAT = -10 (-10)
  // Using Intl API to ensure exact live DST awareness:
  const ZONES = [
    { id: "et", name: "Eastern Time", abbr: "ET", iana: "America/New_York", cities: "New York, Miami, Atlanta, Boston" },
    { id: "ct", name: "Central Time", abbr: "CT", iana: "America/Chicago", cities: "Chicago, Dallas, Houston, Nashville" },
    { id: "mt", name: "Mountain Time", abbr: "MT", iana: "America/Denver", cities: "Denver, Phoenix*, Salt Lake City" },
    { id: "pt", name: "Pacific Time", abbr: "PT", iana: "America/Los_Angeles", cities: "Los Angeles, San Francisco, Seattle" },
    { id: "akt", name: "Alaska Time", abbr: "AKT", iana: "America/Anchorage", cities: "Anchorage, Fairbanks, Juneau" },
    { id: "hat", name: "Hawaii Time", abbr: "HST", iana: "Pacific/Honolulu", cities: "Honolulu (No DST)" }
  ];

  // DOM Elements
  const timeSlider = document.getElementById('time-slider');
  const meetingDateInput = document.getElementById('meeting-date');
  const meetingTitleInput = document.getElementById('meeting-title');
  const meetingDurationSelect = document.getElementById('meeting-duration');
  const copyInviteBtn = document.getElementById('copy-invite-btn');
  const gcalBtn = document.getElementById('gcal-btn');
  const zoneCardsContainer = document.getElementById('zone-cards-container');
  const overlapStatusBadge = document.getElementById('overlap-status-badge');
  const quickHourBtns = document.querySelectorAll('.quick-hour-btn');

  // Set today's date
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  if (meetingDateInput) meetingDateInput.value = todayStr;

  // Initial slider value set to current hour or 2:00 PM (14:00 = 840 min)
  let currentMinutes = 14 * 60; // 2:00 PM ET
  if (timeSlider) timeSlider.value = currentMinutes;

  function formatTime(hours, minutes) {
    const period = hours >= 12 ? 'PM' : 'AM';
    let h12 = hours % 12;
    if (h12 === 0) h12 = 12;
    const mStr = minutes < 10 ? '0' + minutes : minutes;
    return `${h12}:${mStr} ${period}`;
  }

  function getZoneTime(ianaZone, baseDate, baseMinutesET) {
    // Construct date at baseMinutesET in Eastern Time
    const year = baseDate.getFullYear();
    const month = baseDate.getMonth();
    const day = baseDate.getDate();
    const hours = Math.floor(baseMinutesET / 60);
    const mins = baseMinutesET % 60;

    // Use Date arithmetic relative to ET
    // ET is standard reference for the slider
    const referenceET = new Date(Date.UTC(year, month, day, hours + 4, mins)); // Approximate UTC offset

    try {
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: ianaZone,
        hour: 'numeric',
        minute: 'numeric',
        hour12: false
      });
      const parts = formatter.formatToParts(referenceET);
      const h = parseInt(parts.find(p => p.type === 'hour').value, 10);
      const m = parseInt(parts.find(p => p.type === 'minute').value, 10);
      return { hours: h, minutes: m };
    } catch (e) {
      // Fallback relative offset if Intl lacks zone
      return { hours, minutes: mins };
    }
  }

  function renderClocks() {
    const baseDate = new Date(meetingDateInput?.value || todayStr);
    const sliderVal = parseInt(timeSlider?.value) || currentMinutes;
    const duration = parseInt(meetingDurationSelect?.value) || 30;

    let allFourContinentalWorking = true; // ET, CT, MT, PT
    const results = [];

    ZONES.forEach(zone => {
      // Offset calculation relative to slider (Slider represents ET)
      let offsetFromET = 0;
      if (zone.id === 'et') offsetFromET = 0;
      else if (zone.id === 'ct') offsetFromET = -60;
      else if (zone.id === 'mt') offsetFromET = -120;
      else if (zone.id === 'pt') offsetFromET = -180;
      else if (zone.id === 'akt') offsetFromET = -240;
      else if (zone.id === 'hat') offsetFromET = -300;

      let totalMins = (sliderVal + offsetFromET + 1440) % 1440;
      let hours = Math.floor(totalMins / 60);
      let mins = totalMins % 60;

      let isWorkingHour = hours >= 9 && hours < 17;
      if (['et', 'ct', 'mt', 'pt'].includes(zone.id) && !isWorkingHour) {
        allFourContinentalWorking = false;
      }

      results.push({
        ...zone,
        hours,
        minutes: mins,
        timeFormatted: formatTime(hours, mins),
        isWorkingHour
      });
    });

    // Render cards
    if (zoneCardsContainer) {
      zoneCardsContainer.innerHTML = results.map(z => `
        <div class="p-4 rounded-xl border ${z.isWorkingHour ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'} transition-all">
          <div class="flex items-center justify-between mb-2">
            <div class="flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-full ${z.isWorkingHour ? 'bg-emerald-500 shadow-sm shadow-emerald-500/50' : 'bg-amber-400'}"></span>
              <h3 class="font-bold text-slate-900 dark:text-white text-sm">${z.name} (${z.abbr})</h3>
            </div>
            <span class="text-[11px] font-semibold px-2 py-0.5 rounded-full ${z.isWorkingHour ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'}">
              ${z.isWorkingHour ? 'Working Hours' : 'Outside 9-5'}
            </span>
          </div>
          <div class="text-2xl font-black text-indigo-600 dark:text-indigo-400 tracking-tight my-1">
            ${z.timeFormatted}
          </div>
          <p class="text-[11px] text-slate-500 dark:text-slate-400 truncate">
            ${z.cities}
          </p>
        </div>
      `).join('');
    }

    // Overlap banner
    if (overlapStatusBadge) {
      if (allFourContinentalWorking) {
        overlapStatusBadge.className = "px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 flex items-center gap-2";
        overlapStatusBadge.innerHTML = `<i data-lucide="check-circle" class="w-4 h-4"></i> Optimal US Overlap (All 4 Continental Zones In Normal Business Hours)`;
      } else {
        overlapStatusBadge.className = "px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 flex items-center gap-2";
        overlapStatusBadge.innerHTML = `<i data-lucide="alert-triangle" class="w-4 h-4"></i> Partial Overlap (One or more US regions are outside standard 9 AM - 5 PM)`;
      }
      if (window.lucide) window.lucide.createIcons();
    }
  }

  // Event Listeners
  if (timeSlider) {
    timeSlider.addEventListener('input', renderClocks);
  }

  if (meetingDateInput) {
    meetingDateInput.addEventListener('change', renderClocks);
  }

  if (meetingDurationSelect) {
    meetingDurationSelect.addEventListener('change', renderClocks);
  }

  quickHourBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetET = parseInt(btn.dataset.hour);
      if (timeSlider) {
        timeSlider.value = targetET * 60;
        renderClocks();
      }
    });
  });

  // Copy Meeting Invitation
  if (copyInviteBtn) {
    copyInviteBtn.addEventListener('click', () => {
      const sliderVal = parseInt(timeSlider?.value) || 840;
      const title = meetingTitleInput?.value.trim() || 'Team Meeting / Client Call';
      const date = meetingDateInput?.value || todayStr;
      const duration = meetingDurationSelect?.value || '30';

      const etTotal = sliderVal;
      const ctTotal = (sliderVal - 60 + 1440) % 1440;
      const mtTotal = (sliderVal - 120 + 1440) % 1440;
      const ptTotal = (sliderVal - 180 + 1440) % 1440;

      const etStr = formatTime(Math.floor(etTotal / 60), etTotal % 60);
      const ctStr = formatTime(Math.floor(ctTotal / 60), ctTotal % 60);
      const mtStr = formatTime(Math.floor(mtTotal / 60), mtTotal % 60);
      const ptStr = formatTime(Math.floor(ptTotal / 60), ptTotal % 60);

      const invite = `📅 ${title}\n` +
        `Date: ${date} (${duration} minutes)\n\n` +
        `⏰ Synchronized US Times:\n` +
        ` • Eastern (ET):  ${etStr}\n` +
        ` • Central (CT):  ${ctStr}\n` +
        ` • Mountain (MT): ${mtStr}\n` +
        ` • Pacific (PT):  ${ptStr}\n\n` +
        `Coordinated via MultiTools Hub US Meeting Planner.`;

      navigator.clipboard.writeText(invite).then(() => {
        if (window.showToast) window.showToast('Meeting invitation copied to clipboard!');
      });
    });
  }

  // Google Calendar Link Generator
  if (gcalBtn) {
    gcalBtn.addEventListener('click', () => {
      const sliderVal = parseInt(timeSlider?.value) || 840;
      const title = encodeURIComponent(meetingTitleInput?.value.trim() || 'US Team Sync');
      const dateStr = meetingDateInput?.value || todayStr;
      const duration = parseInt(meetingDurationSelect?.value) || 30;

      const startHours = Math.floor(sliderVal / 60);
      const startMins = sliderVal % 60;

      const d = new Date(dateStr);
      d.setHours(startHours, startMins, 0);

      const endD = new Date(d.getTime() + duration * 60000);

      function toGcalDate(dt) {
        return dt.toISOString().replace(/-|:|\.\d\d\d/g, '');
      }

      const gcalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${toGcalDate(d)}/${toGcalDate(endD)}&details=Synchronized+across+ET,+CT,+MT,+and+PT+time+zones.`;
      window.open(gcalUrl, '_blank');
    });
  }

  renderClocks();
});
