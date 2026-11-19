/**
 * Tool 10: SVG Color Changer & High-Res PNG Exporter
 * Client-side SVG DOM manipulation, color mapping, and Canvas rasterization
 */

document.addEventListener('DOMContentLoaded', () => {
  const dropZone = document.getElementById('svg-dropzone');
  const fileInput = document.getElementById('svg-file-input');
  const pasteInput = document.getElementById('svg-paste-input');
  const pasteBtn = document.getElementById('svg-paste-btn');

  const workspace = document.getElementById('svg-workspace');
  const previewBox = document.getElementById('svg-preview-box');
  const colorListEl = document.getElementById('svg-color-list');
  const passedPaletteEl = document.getElementById('passed-palette-chips');

  const downloadSvgBtn = document.getElementById('download-svg-btn');
  const downloadPng1x = document.getElementById('download-png-1x');
  const downloadPng2x = document.getElementById('download-png-2x');
  const downloadPng4x = document.getElementById('download-png-4x');
  const copySvgBtn = document.getElementById('copy-svg-btn');
  const resetBtn = document.getElementById('svg-reset-btn');
  const sampleBtn = document.getElementById('svg-sample-btn');

  let currentSvgDoc = null; // Parsed Document
  let originalSvgText = '';
  let fileName = 'graphic.svg';
  let detectedColors = []; // Array of { hex, count, elements: [ { el, attr } ] }

  if (sampleBtn) {
    sampleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const sampleSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <circle cx="100" cy="100" r="90" fill="#4f46e5" stroke="#312e81" stroke-width="6"/>
  <polygon points="100,35 120,78 165,85 132,118 140,165 100,142 60,165 68,118 35,85 80,78" fill="#fbbf24" stroke="#d97706" stroke-width="4"/>
  <circle cx="100" cy="100" r="25" fill="#ef4444"/>
</svg>`;
      fileName = 'sample-badge.svg';
      loadSvgString(sampleSvg);
      window.showToast('Sample vector badge loaded! Try changing colors.', 'success');
    });
  }

  // Check URL query params for passed palette from Tool 9
  const urlParams = new URLSearchParams(window.location.search);
  const passedColors = urlParams.get('colors');
  if (passedColors && passedPaletteEl) {
    const hexList = passedColors.split(',').map(c => '#' + c.replace('#', '').trim());
    if (hexList.length > 0) {
      passedPaletteEl.classList.remove('hidden');
      const chipContainer = passedPaletteEl.querySelector('.chips-container');
      if (chipContainer) {
        chipContainer.innerHTML = '';
        hexList.forEach(hex => {
          const chip = document.createElement('button');
          chip.type = 'button';
          chip.className = 'w-6 h-6 rounded-full border border-black/20 shadow-sm transition-transform hover:scale-125';
          chip.style.backgroundColor = hex;
          chip.title = `Click to copy ${hex}`;
          chip.onclick = () => window.copyToClipboard(hex, `Copied ${hex}!`);
          chipContainer.appendChild(chip);
        });
      }
    }
  }

  if (dropZone && fileInput) {
    window.setupDropZone(dropZone, fileInput, (files) => {
      const file = files[0];
      if (!file || (!file.name.toLowerCase().endsWith('.svg') && file.type !== 'image/svg+xml')) {
        window.showToast('Please upload a valid .svg file', 'error');
        return;
      }
      fileName = file.name;
      const reader = new FileReader();
      reader.onload = (e) => loadSvgString(e.target.result);
      reader.readAsText(file);
    });
  }

  if (pasteBtn && pasteInput) {
    pasteBtn.addEventListener('click', () => {
      const text = pasteInput.value.trim();
      if (!text || !text.includes('<svg')) {
        window.showToast('Please paste valid SVG markup', 'error');
        return;
      }
      fileName = 'pasted-vector.svg';
      loadSvgString(text);
    });
  }

  function loadSvgString(svgStr) {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(svgStr, 'image/svg+xml');
      const svgEl = doc.querySelector('svg');

      if (!svgEl || doc.querySelector('parsererror')) {
        window.showToast('Invalid SVG markup', 'error');
        return;
      }

      currentSvgDoc = doc;
      originalSvgText = svgStr;

      // Extract colors
      parseSvgColors();

      dropZone.classList.add('hidden');
      if (pasteInput) pasteInput.parentElement.classList.add('hidden');
      workspace.classList.remove('hidden');

      updateSvgPreview();
      window.showToast(`SVG loaded! Found ${detectedColors.length} unique colors.`, 'success');
    } catch (err) {
      console.error('Error parsing SVG:', err);
      window.showToast('Failed to parse SVG', 'error');
    }
  }

  function parseSvgColors() {
    detectedColors = [];
    const colorMap = {}; // normalizedHex -> { count, entries: [{ el, attr }] }

    const allEls = currentSvgDoc.querySelectorAll('*');
    allEls.forEach(el => {
      ['fill', 'stroke'].forEach(attr => {
        const val = el.getAttribute(attr);
        if (val && val !== 'none' && val !== 'transparent' && !val.startsWith('url(')) {
          const hex = normalizeColorToHex(val);
          if (hex) {
            if (!colorMap[hex]) colorMap[hex] = { count: 0, entries: [] };
            colorMap[hex].count++;
            colorMap[hex].entries.push({ el, attr });
          }
        }
      });

      // Inline styles (e.g. style="fill:#ff0000; stroke:#000")
      const styleAttr = el.getAttribute('style');
      if (styleAttr) {
        ['fill', 'stroke'].forEach(prop => {
          const match = new RegExp(`${prop}\\s*:\\s*([^;]+)`, 'i').exec(styleAttr);
          if (match && match[1]) {
            const raw = match[1].trim();
            if (raw !== 'none' && raw !== 'transparent' && !raw.startsWith('url(')) {
              const hex = normalizeColorToHex(raw);
              if (hex) {
                if (!colorMap[hex]) colorMap[hex] = { count: 0, entries: [] };
                colorMap[hex].count++;
                colorMap[hex].entries.push({ el, attr: 'style-' + prop });
              }
            }
          }
        });
      }
    });

    detectedColors = Object.keys(colorMap).map(hex => ({
      hex,
      count: colorMap[hex].count,
      entries: colorMap[hex].entries
    })).sort((a, b) => b.count - a.count);

    renderColorControls();
  }

  function normalizeColorToHex(str) {
    if (str.startsWith('#')) {
      let h = str.toUpperCase();
      if (h.length === 4) {
        h = '#' + h[1] + h[1] + h[2] + h[2] + h[3] + h[3];
      }
      return h.substring(0, 7);
    }

    // Try dummy element for rgb() or named colors
    const dummy = document.createElement('div');
    dummy.style.color = str;
    document.body.appendChild(dummy);
    const computed = window.getComputedStyle(dummy).color;
    document.body.removeChild(dummy);

    const match = /rgb\((\d+),\s*(\d+),\s*(\d+)\)/.exec(computed);
    if (match) {
      const r = parseInt(match[1], 10).toString(16).padStart(2, '0');
      const g = parseInt(match[2], 10).toString(16).padStart(2, '0');
      const b = parseInt(match[3], 10).toString(16).padStart(2, '0');
      return `#${r}${g}${b}`.toUpperCase();
    }
    return null;
  }

  function renderColorControls() {
    if (!colorListEl) return;
    colorListEl.innerHTML = '';

    if (detectedColors.length === 0) {
      colorListEl.innerHTML = '<p class="text-sm text-slate-500 italic p-3">No direct fill/stroke colors detected (may use external CSS or gradients).</p>';
      return;
    }

    detectedColors.forEach((item, index) => {
      const row = document.createElement('div');
      row.className = 'flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 gap-3';
      row.innerHTML = `
        <div class="flex items-center gap-2.5">
          <input type="color" value="${item.hex}" class="w-8 h-8 rounded-lg border-0 cursor-pointer p-0 bg-transparent" onchange="window.replaceSvgColor(${index}, this.value)">
          <div>
            <p class="font-mono text-xs font-bold text-slate-800 dark:text-slate-100">${item.hex}</p>
            <p class="text-[11px] text-slate-500 dark:text-slate-400">${item.count} ${item.count === 1 ? 'element' : 'elements'}</p>
          </div>
        </div>
        <div class="flex items-center gap-1.5">
          <button type="button" class="text-xs px-2 py-1 rounded bg-slate-200 dark:bg-slate-700 hover:bg-indigo-100 hover:text-indigo-700 dark:hover:bg-indigo-950/80 dark:hover:text-indigo-300 font-mono transition-colors" onclick="window.copyToClipboard('${item.hex}', 'Copied ${item.hex}!')">
            Copy
          </button>
        </div>
      `;
      colorListEl.appendChild(row);
    });
  }

  window.replaceSvgColor = function (colorIndex, newHex) {
    const item = detectedColors[colorIndex];
    if (!item) return;

    item.entries.forEach(({ el, attr }) => {
      if (attr.startsWith('style-')) {
        const prop = attr.replace('style-', '');
        el.style[prop] = newHex;
      } else {
        el.setAttribute(attr, newHex);
      }
    });

    item.hex = newHex.toUpperCase();
    updateSvgPreview();
    window.showToast(`Color updated to ${newHex}`, 'info');
  };

  function updateSvgPreview() {
    if (!currentSvgDoc || !previewBox) return;
    const serializer = new XMLSerializer();
    const svgStr = serializer.serializeToString(currentSvgDoc.querySelector('svg'));
    previewBox.innerHTML = svgStr;

    const liveSvg = previewBox.querySelector('svg');
    if (liveSvg) {
      liveSvg.classList.add('w-full', 'h-full', 'max-h-[360px]');
    }
  }

  function getSerializedSvg() {
    const serializer = new XMLSerializer();
    return serializer.serializeToString(currentSvgDoc.querySelector('svg'));
  }

  if (downloadSvgBtn) {
    downloadSvgBtn.addEventListener('click', () => {
      if (!currentSvgDoc) return;
      const svgStr = getSerializedSvg();
      const blob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const base = fileName.replace(/\.[^/.]+$/, '');
      a.download = `${base}-recolored.svg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 5000);
      window.showToast('Recolored SVG downloaded!', 'success');
    });
  }

  if (copySvgBtn) {
    copySvgBtn.addEventListener('click', () => {
      if (!currentSvgDoc) return;
      const svgStr = getSerializedSvg();
      window.copyToClipboard(svgStr, 'SVG markup copied to clipboard!');
    });
  }

  // PNG Export with resolution multiplier
  function exportPng(scale) {
    if (!currentSvgDoc) return;
    const svgStr = getSerializedSvg();
    const svgEl = currentSvgDoc.querySelector('svg');

    let width = parseFloat(svgEl.getAttribute('width')) || 800;
    let height = parseFloat(svgEl.getAttribute('height')) || 600;

    const viewBox = svgEl.getAttribute('viewBox');
    if (viewBox) {
      const parts = viewBox.split(/[\s,]+/).map(Number);
      if (parts.length === 4 && parts[2] > 0 && parts[3] > 0) {
        width = parts[2];
        height = parts[3];
      }
    }

    const canvas = document.createElement('canvas');
    canvas.width = width * scale;
    canvas.height = height * scale;
    const ctx = canvas.getContext('2d');

    const img = new Image();
    const svgBlob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);

      canvas.toBlob((blob) => {
        const downloadUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        const base = fileName.replace(/\.[^/.]+$/, '');
        a.download = `${base}-${scale}x.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(downloadUrl), 5000);
        window.showToast(`Exported ${scale}x PNG (${canvas.width}×${canvas.height}px)!`, 'success');
      }, 'image/png');
    };
    img.src = url;
  }

  if (downloadPng1x) downloadPng1x.addEventListener('click', () => exportPng(1));
  if (downloadPng2x) downloadPng2x.addEventListener('click', () => exportPng(2));
  if (downloadPng4x) downloadPng4x.addEventListener('click', () => exportPng(4));

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      currentSvgDoc = null;
      originalSvgText = '';
      detectedColors = [];
      workspace.classList.add('hidden');
      dropZone.classList.remove('hidden');
      if (pasteInput) {
        pasteInput.parentElement.classList.remove('hidden');
        pasteInput.value = '';
      }
      fileInput.value = '';
    });
  }
});
