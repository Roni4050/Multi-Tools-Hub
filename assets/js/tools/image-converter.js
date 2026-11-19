/**
 * MultiTools Hub - Image Converter Tool
 * Isolated IIFE - zero global scope conflicts
 * Tabs: Format Converter (Raster) | Raster → SVG | SVG → Raster
 */
(function ImageConverterModule() {
  'use strict';

  // ── Shared State ───────────────────────────────────────────────────────────
  const state = {
    tab1Files: [],
    tab2Files: [],
    tab3Files: [],
  };

  // ── Tab Switching ──────────────────────────────────────────────────────────
  function initTabs() {
    const tabBtns = document.querySelectorAll('[data-tab-btn]');
    const tabPanels = document.querySelectorAll('[data-tab-panel]');
    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const target = btn.getAttribute('data-tab-btn');
        tabBtns.forEach(b => {
          b.classList.remove('bg-indigo-600', 'text-white', 'shadow-sm');
          b.classList.add('text-slate-600', 'dark:text-slate-300', 'bg-transparent');
        });
        btn.classList.add('bg-indigo-600', 'text-white', 'shadow-sm');
        btn.classList.remove('text-slate-600', 'dark:text-slate-300', 'bg-transparent');
        tabPanels.forEach(panel => {
          panel.classList.toggle('hidden', panel.getAttribute('data-tab-panel') !== target);
        });
      });
    });
  }

  // ── Shared Utilities ────────────────────────────────────────────────────────
  function loadImageFromFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = e => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error('Invalid image: ' + file.name));
        img.src = e.target.result;
      };
      reader.onerror = () => reject(new Error('FileReader error'));
      reader.readAsDataURL(file);
    });
  }

  function canvasToBlob(canvas, mimeType, quality) {
    return new Promise(resolve => canvas.toBlob(resolve, mimeType, quality));
  }

  function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  }

  function baseName(filename) {
    return filename.replace(/\.[^/.]+$/, '');
  }

  function fmt(bytes) {
    return window.formatBytes ? window.formatBytes(bytes) : (bytes / 1024).toFixed(1) + ' KB';
  }

  // ══════════════════════════════════════════════════════════════════════════
  //  TAB 1 — FORMAT CONVERTER (Raster → Raster)
  // ══════════════════════════════════════════════════════════════════════════
  function initTab1() {
    const dz = document.getElementById('t1-dropzone');
    const fi = document.getElementById('t1-file-input');
    if (!dz) return;

    window.setupDropZone(dz, fi, files => handleT1Files(Array.from(files)));

    const qualitySlider = document.getElementById('t1-quality');
    const qualityVal = document.getElementById('t1-quality-val');
    const outputFmt = document.getElementById('t1-output-format');
    const qualityRow = document.getElementById('t1-quality-row');

    if (qualitySlider) {
      qualitySlider.addEventListener('input', () => {
        qualityVal.textContent = qualitySlider.value + '%';
      });
    }
    if (outputFmt) {
      outputFmt.addEventListener('change', () => {
        const lossy = ['jpeg', 'webp'].includes(outputFmt.value);
        if (qualityRow) qualityRow.classList.toggle('hidden', !lossy);
      });
    }

    const convertBtn = document.getElementById('t1-convert-btn');
    const zipBtn = document.getElementById('t1-zip-btn');
    const clearBtn = document.getElementById('t1-clear-btn');
    const sampleBtn = document.getElementById('t1-sample-btn');

    if (convertBtn) convertBtn.addEventListener('click', convertT1All);
    if (zipBtn) zipBtn.addEventListener('click', zipT1All);
    if (clearBtn) clearBtn.addEventListener('click', () => { state.tab1Files = []; renderT1List(); });
    if (sampleBtn) sampleBtn.addEventListener('click', loadT1Samples);
  }

  async function loadT1Samples() {
    const samples = [
      { name: 'sample-gradient-a.png', w: 800, h: 500, colors: ['#4f46e5', '#7c3aed'] },
      { name: 'sample-gradient-b.jpg', w: 600, h: 600, colors: ['#059669', '#10b981'] },
      { name: 'sample-gradient-c.png', w: 1200, h: 630, colors: ['#dc2626', '#f59e0b'] },
    ];
    const files = [];
    for (const s of samples) {
      const canvas = document.createElement('canvas');
      canvas.width = s.w; canvas.height = s.h;
      const ctx = canvas.getContext('2d');
      const grad = ctx.createLinearGradient(0, 0, s.w, s.h);
      s.colors.forEach((c, i) => grad.addColorStop(i, c));
      ctx.fillStyle = grad; ctx.fillRect(0, 0, s.w, s.h);
      ctx.fillStyle = 'rgba(255,255,255,0.18)';
      ctx.font = `bold ${Math.floor(s.w / 12)}px sans-serif`;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('MultiTools Hub Sample', s.w / 2, s.h / 2);
      const isJpeg = s.name.endsWith('.jpg');
      const blob = await canvasToBlob(canvas, isJpeg ? 'image/jpeg' : 'image/png', 0.92);
      files.push(new File([blob], s.name, { type: blob.type }));
    }
    handleT1Files(files);
    if (window.showToast) window.showToast('3 sample images loaded', 'success');
  }

  function handleT1Files(files) {
    const valid = files.filter(f => /^image\/(jpeg|png|webp|gif|bmp)$/.test(f.type));
    if (!valid.length) { if (window.showToast) window.showToast('Upload JPG, PNG, or WEBP images', 'error'); return; }
    state.tab1Files = [...state.tab1Files, ...valid].slice(0, 50);
    renderT1List();
  }

  function renderT1List() {
    const list = document.getElementById('t1-file-list');
    const wrap = document.getElementById('t1-list-wrap');
    const actionRow = document.getElementById('t1-action-row');
    if (!list) return;
    if (!state.tab1Files.length) {
      wrap && wrap.classList.add('hidden');
      actionRow && actionRow.classList.add('hidden');
      list.innerHTML = ''; return;
    }
    wrap && wrap.classList.remove('hidden');
    actionRow && actionRow.classList.remove('hidden');
    list.innerHTML = state.tab1Files.map((f, i) => `
      <div class="flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60" id="t1-row-${i}">
        <div class="flex items-center gap-3 min-w-0">
          <div class="w-9 h-9 rounded-lg bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center flex-shrink-0">
            <i data-lucide="image" class="w-4 h-4"></i>
          </div>
          <div class="min-w-0">
            <p class="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate max-w-[200px]">${f.name}</p>
            <p class="text-xs text-slate-500">${fmt(f.size)} · ${f.type.split('/')[1].toUpperCase()}</p>
          </div>
        </div>
        <div class="flex items-center gap-2 flex-shrink-0">
          <span id="t1-row-status-${i}" class="text-xs text-slate-400 font-mono"></span>
          <button type="button" onclick="window._t1Remove(${i})" class="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors">
            <i data-lucide="x" class="w-3.5 h-3.5"></i>
          </button>
        </div>
      </div>`).join('');
    if (window.lucide) window.lucide.createIcons();
  }

  window._t1Remove = function (i) { state.tab1Files.splice(i, 1); renderT1List(); };

  async function convertT1Single(file, index) {
    const fmtEl = document.getElementById('t1-output-format');
    const qualEl = document.getElementById('t1-quality');
    const fmtVal = fmtEl ? fmtEl.value : 'png';
    const quality = qualEl ? parseInt(qualEl.value, 10) / 100 : 0.9;
    const mimeMap = { jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp' };
    const mime = mimeMap[fmtVal] || 'image/png';
    const ext = fmtVal === 'jpeg' ? 'jpg' : fmtVal;
    const statusEl = document.getElementById(`t1-row-status-${index}`);
    if (statusEl) statusEl.textContent = '⏳';
    try {
      const img = await loadImageFromFile(file);
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth; canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      if (mime !== 'image/png') { ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, canvas.width, canvas.height); }
      ctx.drawImage(img, 0, 0);
      const blob = await canvasToBlob(canvas, mime, quality);
      if (statusEl) statusEl.textContent = `✓ ${fmt(blob.size)}`;
      return { blob, name: baseName(file.name) + '.' + ext };
    } catch (e) {
      if (statusEl) statusEl.textContent = '✗ Error';
      console.error('Convert error:', e); return null;
    }
  }

  async function convertT1All() {
    if (!state.tab1Files.length) { if (window.showToast) window.showToast('Upload images first', 'info'); return; }
    const btn = document.getElementById('t1-convert-btn');
    if (btn) { btn.disabled = true; btn.textContent = 'Converting…'; }
    const results = [];
    for (let i = 0; i < state.tab1Files.length; i++) {
      const r = await convertT1Single(state.tab1Files[i], i);
      if (r) results.push(r);
    }
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = '<i data-lucide="refresh-cw" class="w-4 h-4"></i><span>Convert &amp; Download</span>';
      if (window.lucide) window.lucide.createIcons();
    }
    if (results.length === 1) {
      downloadBlob(results[0].blob, results[0].name);
      if (window.showToast) window.showToast('Image converted & downloaded!', 'success');
    } else if (results.length > 1) {
      results.forEach(r => downloadBlob(r.blob, r.name));
      if (window.showToast) window.showToast(`${results.length} images downloaded!`, 'success');
    }
  }

  async function zipT1All() {
    if (!state.tab1Files.length) { if (window.showToast) window.showToast('No files to ZIP', 'info'); return; }
    if (!window.JSZip) { if (window.showToast) window.showToast('JSZip not loaded. Please refresh.', 'error'); return; }
    const btn = document.getElementById('t1-zip-btn');
    if (btn) { btn.disabled = true; btn.textContent = 'Zipping…'; }
    const zip = new window.JSZip();
    const folder = zip.folder('converted-images');
    const fmtEl = document.getElementById('t1-output-format');
    const qualEl = document.getElementById('t1-quality');
    const fmtVal = fmtEl ? fmtEl.value : 'png';
    const quality = qualEl ? parseInt(qualEl.value, 10) / 100 : 0.9;
    const mimeMap = { jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp' };
    const mime = mimeMap[fmtVal] || 'image/png';
    const ext = fmtVal === 'jpeg' ? 'jpg' : fmtVal;

    for (let i = 0; i < state.tab1Files.length; i++) {
      const file = state.tab1Files[i];
      const statusEl = document.getElementById(`t1-row-status-${i}`);
      if (statusEl) statusEl.textContent = '⏳';
      try {
        const img = await loadImageFromFile(file);
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth; canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');
        if (mime !== 'image/png') { ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, canvas.width, canvas.height); }
        ctx.drawImage(img, 0, 0);
        const blob = await canvasToBlob(canvas, mime, quality);
        const arrBuf = await blob.arrayBuffer();
        folder.file(baseName(file.name) + '.' + ext, arrBuf);
        if (statusEl) statusEl.textContent = `✓ ${fmt(blob.size)}`;
      } catch (e) {
        if (statusEl) statusEl.textContent = '✗';
        console.error(e);
      }
    }
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    downloadBlob(zipBlob, 'converted-images.zip');
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = '<i data-lucide="archive" class="w-4 h-4"></i><span>Download ZIP</span>';
      if (window.lucide) window.lucide.createIcons();
    }
    if (window.showToast) window.showToast(`ZIP with ${state.tab1Files.length} files downloaded!`, 'success');
  }

  // ══════════════════════════════════════════════════════════════════════════
  //  TAB 2 — RASTER → SVG (Embed as base64 <image> inside SVG container)
  // ══════════════════════════════════════════════════════════════════════════
  function initTab2() {
    const dz = document.getElementById('t2-dropzone');
    const fi = document.getElementById('t2-file-input');
    if (!dz) return;
    window.setupDropZone(dz, fi, files => handleT2Files(Array.from(files)));
    const convertBtn = document.getElementById('t2-convert-btn');
    const zipBtn = document.getElementById('t2-zip-btn');
    const clearBtn = document.getElementById('t2-clear-btn');
    const sampleBtn = document.getElementById('t2-sample-btn');
    if (convertBtn) convertBtn.addEventListener('click', convertT2All);
    if (zipBtn) zipBtn.addEventListener('click', zipT2All);
    if (clearBtn) clearBtn.addEventListener('click', () => { state.tab2Files = []; renderT2List(); });
    if (sampleBtn) sampleBtn.addEventListener('click', loadT2Sample);
  }

  async function loadT2Sample() {
    const canvas = document.createElement('canvas');
    canvas.width = 640; canvas.height = 400;
    const ctx = canvas.getContext('2d');
    const g = ctx.createLinearGradient(0, 0, 640, 400);
    g.addColorStop(0, '#6366f1'); g.addColorStop(1, '#8b5cf6');
    ctx.fillStyle = g; ctx.fillRect(0, 0, 640, 400);
    ctx.fillStyle = 'rgba(255,255,255,0.2)'; ctx.font = 'bold 42px sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('PNG \u2192 SVG', 320, 200);
    const blob = await canvasToBlob(canvas, 'image/png', 1);
    const file = new File([blob], 'sample-to-svg.png', { type: 'image/png' });
    handleT2Files([file]);
    if (window.showToast) window.showToast('Sample PNG loaded', 'success');
  }

  function handleT2Files(files) {
    const valid = files.filter(f => /^image\/(jpeg|png|webp)$/.test(f.type));
    if (!valid.length) { if (window.showToast) window.showToast('Upload JPG, PNG, or WEBP files', 'error'); return; }
    state.tab2Files = [...state.tab2Files, ...valid].slice(0, 20);
    renderT2List();
  }

  function renderT2List() {
    const list = document.getElementById('t2-file-list');
    const wrap = document.getElementById('t2-list-wrap');
    const actionRow = document.getElementById('t2-action-row');
    if (!list) return;
    if (!state.tab2Files.length) {
      wrap && wrap.classList.add('hidden');
      actionRow && actionRow.classList.add('hidden');
      list.innerHTML = ''; return;
    }
    wrap && wrap.classList.remove('hidden');
    actionRow && actionRow.classList.remove('hidden');
    list.innerHTML = state.tab2Files.map((f, i) => `
      <div class="flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60">
        <div class="flex items-center gap-3 min-w-0">
          <div class="w-9 h-9 rounded-lg bg-violet-100 dark:bg-violet-950/80 text-violet-600 dark:text-violet-400 flex items-center justify-center flex-shrink-0">
            <i data-lucide="image" class="w-4 h-4"></i>
          </div>
          <div class="min-w-0">
            <p class="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate max-w-[200px]">${f.name}</p>
            <p class="text-xs text-slate-500">${fmt(f.size)} · Will embed as SVG &lt;image&gt;</p>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <span id="t2-status-${i}" class="text-xs font-mono text-slate-400"></span>
          <button type="button" onclick="window._t2Remove(${i})" class="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors">
            <i data-lucide="x" class="w-3.5 h-3.5"></i>
          </button>
        </div>
      </div>`).join('');
    if (window.lucide) window.lucide.createIcons();
  }

  window._t2Remove = function (i) { state.tab2Files.splice(i, 1); renderT2List(); };

  function fileToDataURL(file) {
    return new Promise((res, rej) => {
      const r = new FileReader();
      r.onload = e => res(e.target.result);
      r.onerror = rej;
      r.readAsDataURL(file);
    });
  }

  async function rasterToSvg(file, index) {
    const statusEl = document.getElementById(`t2-status-${index}`);
    if (statusEl) statusEl.textContent = '⏳';
    try {
      const dataUrl = await fileToDataURL(file);
      const img = new Image();
      await new Promise((res, rej) => { img.onload = res; img.onerror = rej; img.src = dataUrl; });
      const w = img.naturalWidth, h = img.naturalHeight;
      const svgStr = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <title>${baseName(file.name)}</title>
  <desc>Generated by MultiTools Hub Image Converter</desc>
  <image x="0" y="0" width="${w}" height="${h}" xlink:href="${dataUrl}" href="${dataUrl}" preserveAspectRatio="xMidYMid meet"/>
</svg>`;
      const blob = new Blob([svgStr], { type: 'image/svg+xml' });
      if (statusEl) statusEl.textContent = `\u2713 ${w}\xd7${h} \u2192 SVG (${fmt(blob.size)})`;
      return { blob, name: baseName(file.name) + '.svg' };
    } catch (e) {
      if (statusEl) statusEl.textContent = '\u2717 Error';
      console.error('Raster→SVG error:', e); return null;
    }
  }

  async function convertT2All() {
    if (!state.tab2Files.length) { if (window.showToast) window.showToast('Upload images first', 'info'); return; }
    const results = [];
    for (let i = 0; i < state.tab2Files.length; i++) {
      const r = await rasterToSvg(state.tab2Files[i], i);
      if (r) results.push(r);
    }
    if (results.length === 1) {
      downloadBlob(results[0].blob, results[0].name);
      if (window.showToast) window.showToast('SVG file downloaded!', 'success');
    } else if (results.length > 1) {
      results.forEach(r => downloadBlob(r.blob, r.name));
      if (window.showToast) window.showToast(`${results.length} SVG files downloaded!`, 'success');
    }
  }

  async function zipT2All() {
    if (!state.tab2Files.length) { if (window.showToast) window.showToast('Upload images first', 'info'); return; }
    if (!window.JSZip) { if (window.showToast) window.showToast('JSZip not loaded', 'error'); return; }
    const zip = new window.JSZip();
    const folder = zip.folder('raster-to-svg');
    for (let i = 0; i < state.tab2Files.length; i++) {
      const r = await rasterToSvg(state.tab2Files[i], i);
      if (r) { const ab = await r.blob.arrayBuffer(); folder.file(r.name, ab); }
    }
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    downloadBlob(zipBlob, 'raster-to-svg.zip');
    if (window.showToast) window.showToast('ZIP downloaded!', 'success');
  }

  // ══════════════════════════════════════════════════════════════════════════
  //  TAB 3 — SVG → RASTER (Rasterize via offscreen Canvas at DPI scale)
  // ══════════════════════════════════════════════════════════════════════════
  function initTab3() {
    const dz = document.getElementById('t3-dropzone');
    const fi = document.getElementById('t3-file-input');
    if (!dz) return;
    window.setupDropZone(dz, fi, files => handleT3Files(Array.from(files)));

    const qualitySlider = document.getElementById('t3-quality');
    const qualityVal = document.getElementById('t3-quality-val');
    const outputFmt = document.getElementById('t3-output-format');
    const qualityRow = document.getElementById('t3-quality-row');

    if (qualitySlider) qualitySlider.addEventListener('input', () => { qualityVal.textContent = qualitySlider.value + '%'; });
    if (outputFmt) outputFmt.addEventListener('change', () => {
      const lossy = ['jpeg', 'webp'].includes(outputFmt.value);
      if (qualityRow) qualityRow.classList.toggle('hidden', !lossy);
    });

    const convertBtn = document.getElementById('t3-convert-btn');
    const zipBtn = document.getElementById('t3-zip-btn');
    const clearBtn = document.getElementById('t3-clear-btn');
    const sampleBtn = document.getElementById('t3-sample-btn');

    if (convertBtn) convertBtn.addEventListener('click', convertT3All);
    if (zipBtn) zipBtn.addEventListener('click', zipT3All);
    if (clearBtn) clearBtn.addEventListener('click', () => { state.tab3Files = []; renderT3List(); });
    if (sampleBtn) sampleBtn.addEventListener('click', loadT3Sample);
  }

  function loadT3Sample() {
    const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#6366f1;stop-opacity:1"/>
      <stop offset="100%" style="stop-color:#8b5cf6;stop-opacity:1"/>
    </linearGradient>
  </defs>
  <rect width="600" height="400" fill="url(#bg)" rx="16"/>
  <circle cx="300" cy="175" r="90" fill="rgba(255,255,255,0.12)"/>
  <circle cx="120" cy="80" r="60" fill="rgba(255,255,255,0.08)"/>
  <circle cx="520" cy="340" r="80" fill="rgba(255,255,255,0.08)"/>
  <text x="300" y="170" font-family="sans-serif" font-size="30" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="middle">SVG Vector Sample</text>
  <text x="300" y="215" font-family="sans-serif" font-size="14" fill="rgba(255,255,255,0.75)" text-anchor="middle">MultiTools Hub \u2022 SVG to Raster Converter</text>
  <rect x="40" y="310" width="520" height="4" rx="2" fill="rgba(255,255,255,0.18)"/>
  <circle cx="80" cy="350" r="12" fill="rgba(255,255,255,0.3)"/>
  <circle cx="120" cy="350" r="12" fill="rgba(255,255,255,0.2)"/>
  <circle cx="160" cy="350" r="12" fill="rgba(255,255,255,0.1)"/>
</svg>`;
    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    const file = new File([blob], 'sample-vector.svg', { type: 'image/svg+xml' });
    handleT3Files([file]);
    if (window.showToast) window.showToast('Sample SVG loaded', 'success');
  }

  function handleT3Files(files) {
    const valid = files.filter(f => f.type === 'image/svg+xml' || f.name.toLowerCase().endsWith('.svg'));
    if (!valid.length) { if (window.showToast) window.showToast('Please upload SVG files only', 'error'); return; }
    state.tab3Files = [...state.tab3Files, ...valid].slice(0, 20);
    renderT3List();
  }

  function renderT3List() {
    const list = document.getElementById('t3-file-list');
    const wrap = document.getElementById('t3-list-wrap');
    const actionRow = document.getElementById('t3-action-row');
    if (!list) return;
    if (!state.tab3Files.length) {
      wrap && wrap.classList.add('hidden');
      actionRow && actionRow.classList.add('hidden');
      list.innerHTML = ''; return;
    }
    wrap && wrap.classList.remove('hidden');
    actionRow && actionRow.classList.remove('hidden');
    list.innerHTML = state.tab3Files.map((f, i) => `
      <div class="flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60">
        <div class="flex items-center gap-3 min-w-0">
          <div class="w-9 h-9 rounded-lg bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
            <i data-lucide="file-code-2" class="w-4 h-4"></i>
          </div>
          <div class="min-w-0">
            <p class="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate max-w-[200px]">${f.name}</p>
            <p class="text-xs text-slate-500">${fmt(f.size)} \u00b7 SVG Vector</p>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <span id="t3-status-${i}" class="text-xs font-mono text-slate-400"></span>
          <button type="button" onclick="window._t3Remove(${i})" class="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors">
            <i data-lucide="x" class="w-3.5 h-3.5"></i>
          </button>
        </div>
      </div>`).join('');
    if (window.lucide) window.lucide.createIcons();
  }

  window._t3Remove = function (i) { state.tab3Files.splice(i, 1); renderT3List(); };

  async function svgToRaster(file, index) {
    const statusEl = document.getElementById(`t3-status-${index}`);
    const scaleEl = document.getElementById('t3-scale');
    const fmtEl = document.getElementById('t3-output-format');
    const qualEl = document.getElementById('t3-quality');
    const scale = scaleEl ? parseInt(scaleEl.value, 10) : 2;
    const fmtVal = fmtEl ? fmtEl.value : 'png';
    const quality = qualEl ? parseInt(qualEl.value, 10) / 100 : 0.92;
    const mimeMap = { jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp' };
    const mime = mimeMap[fmtVal] || 'image/png';
    const ext = fmtVal === 'jpeg' ? 'jpg' : fmtVal;

    if (statusEl) statusEl.textContent = '\u23f3';
    try {
      const text = await file.text();
      const svgBlob = new Blob([text], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(svgBlob);
      const img = await new Promise((res, rej) => {
        const im = new Image();
        im.onload = () => res(im);
        im.onerror = () => rej(new Error('SVG load failed: ' + file.name));
        im.src = url;
      });
      URL.revokeObjectURL(url);

      const baseW = img.naturalWidth || 600;
      const baseH = img.naturalHeight || 400;
      const w = baseW * scale;
      const h = baseH * scale;
      const canvas = document.createElement('canvas');
      canvas.width = w; canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (mime !== 'image/png') { ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, w, h); }
      ctx.drawImage(img, 0, 0, w, h);

      const outBlob = await canvasToBlob(canvas, mime, quality);
      if (statusEl) statusEl.textContent = `\u2713 ${w}\xd7${h} · ${fmt(outBlob.size)}`;
      return { blob: outBlob, name: `${baseName(file.name)}@${scale}x.${ext}` };
    } catch (e) {
      if (statusEl) statusEl.textContent = '\u2717 Error';
      console.error('SVG\u2192Raster error:', e); return null;
    }
  }

  async function convertT3All() {
    if (!state.tab3Files.length) { if (window.showToast) window.showToast('Upload SVG files first', 'info'); return; }
    const btn = document.getElementById('t3-convert-btn');
    if (btn) { btn.disabled = true; btn.textContent = 'Converting\u2026'; }
    const results = [];
    for (let i = 0; i < state.tab3Files.length; i++) {
      const r = await svgToRaster(state.tab3Files[i], i);
      if (r) results.push(r);
    }
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = '<i data-lucide="refresh-cw" class="w-4 h-4"></i><span>Convert &amp; Download</span>';
      if (window.lucide) window.lucide.createIcons();
    }
    if (results.length === 1) {
      downloadBlob(results[0].blob, results[0].name);
      if (window.showToast) window.showToast('Image downloaded!', 'success');
    } else if (results.length > 1) {
      results.forEach(r => downloadBlob(r.blob, r.name));
      if (window.showToast) window.showToast(`${results.length} images downloaded!`, 'success');
    }
  }

  async function zipT3All() {
    if (!state.tab3Files.length) { if (window.showToast) window.showToast('Upload SVG files first', 'info'); return; }
    if (!window.JSZip) { if (window.showToast) window.showToast('JSZip not loaded', 'error'); return; }
    const btn = document.getElementById('t3-zip-btn');
    if (btn) { btn.disabled = true; btn.textContent = 'Zipping\u2026'; }
    const zip = new window.JSZip();
    const folder = zip.folder('svg-to-raster');
    for (let i = 0; i < state.tab3Files.length; i++) {
      const r = await svgToRaster(state.tab3Files[i], i);
      if (r) { const ab = await r.blob.arrayBuffer(); folder.file(r.name, ab); }
    }
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    downloadBlob(zipBlob, 'svg-to-raster.zip');
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = '<i data-lucide="archive" class="w-4 h-4"></i><span>Download ZIP</span>';
      if (window.lucide) window.lucide.createIcons();
    }
    if (window.showToast) window.showToast('ZIP downloaded!', 'success');
  }

  // ── Bootstrap ──────────────────────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', () => {
    initTabs();
    initTab1();
    initTab2();
    initTab3();
  });

})();
