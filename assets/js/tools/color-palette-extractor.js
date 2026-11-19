/**
 * Tool 9: Image Color Palette & HEX Extractor
 * Canvas pixel sampling, color quantization, and SVG editor inter-linking
 */

document.addEventListener('DOMContentLoaded', () => {
  const dropZone = document.getElementById('palette-dropzone');
  const fileInput = document.getElementById('palette-file-input');
  const workspace = document.getElementById('palette-workspace');
  const imagePreview = document.getElementById('image-preview');
  const swatchesContainer = document.getElementById('swatches-container');
  const copyCssBtn = document.getElementById('copy-css-btn');
  const downloadCardBtn = document.getElementById('download-palette-card-btn');
  const useSvgBtn = document.getElementById('use-in-svg-btn');
  const resetBtn = document.getElementById('palette-reset-btn');
  const sampleBtn = document.getElementById('palette-sample-btn');

  let extractedColors = []; // Array of hex strings

  if (!dropZone || !fileInput) return;

  if (sampleBtn) {
    sampleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const canvas = document.createElement('canvas');
      canvas.width = 600;
      canvas.height = 400;
      const ctx = canvas.getContext('2d');
      // Draw colorful sunset landscape
      const grad = ctx.createLinearGradient(0, 0, 0, 400);
      grad.addColorStop(0, '#f97316');
      grad.addColorStop(0.3, '#ec4899');
      grad.addColorStop(0.6, '#8b5cf6');
      grad.addColorStop(1, '#1e1b4b');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 600, 400);

      // Golden sun
      ctx.fillStyle = '#fde047';
      ctx.beginPath();
      ctx.arc(300, 260, 80, 0, Math.PI * 2);
      ctx.fill();

      // Mountains
      ctx.fillStyle = '#312e81';
      ctx.beginPath();
      ctx.moveTo(0, 400);
      ctx.lineTo(150, 240);
      ctx.lineTo(320, 340);
      ctx.lineTo(480, 220);
      ctx.lineTo(600, 400);
      ctx.closePath();
      ctx.fill();

      const img = new Image();
      img.onload = () => {
        if (imagePreview) imagePreview.src = img.src;
        dropZone.classList.add('hidden');
        workspace.classList.remove('hidden');
        extractPalette(img);
        window.showToast('Sample sunset landscape loaded & colors extracted!', 'success');
      };
      img.src = canvas.toDataURL('image/png');
    });
  }

  window.setupDropZone(dropZone, fileInput, (files) => {
    const file = files[0];
    if (!file || !file.type.startsWith('image/')) {
      window.showToast('Please select a valid image file', 'error');
      return;
    }
    processImage(file);
  });

  // Paste support
  window.addEventListener('paste', (e) => {
    const items = e.clipboardData ? e.clipboardData.items : [];
    for (const item of items) {
      if (item.type.startsWith('image/')) {
        const file = item.getAsFile();
        if (file) {
          processImage(file);
          window.showToast('Pasted image from clipboard!', 'info');
          break;
        }
      }
    }
  });

  function processImage(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        if (imagePreview) imagePreview.src = img.src;
        dropZone.classList.add('hidden');
        workspace.classList.remove('hidden');
        extractPalette(img);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  function extractPalette(img) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    // Scale down image for fast sampling (max 150x150)
    const maxDim = 150;
    const scale = Math.min(maxDim / img.naturalWidth, maxDim / img.naturalHeight, 1);
    canvas.width = Math.max(1, Math.floor(img.naturalWidth * scale));
    canvas.height = Math.max(1, Math.floor(img.naturalHeight * scale));

    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

    // Color quantization with spatial & distance filtering
    const colorMap = {};
    const step = 4; // Sample every pixel

    for (let i = 0; i < imgData.length; i += 4 * step) {
      const r = imgData[i];
      const g = imgData[i + 1];
      const b = imgData[i + 2];
      const a = imgData[i + 3];

      if (a < 128) continue; // Skip transparent pixels

      // Quantize to reduce near-duplicates (bin to 16-level steps)
      const qR = Math.round(r / 16) * 16;
      const qG = Math.round(g / 16) * 16;
      const qB = Math.round(b / 16) * 16;
      const key = `${qR},${qG},${qB}`;

      colorMap[key] = (colorMap[key] || 0) + 1;
    }

    // Sort by frequency
    const sorted = Object.keys(colorMap)
      .map(key => {
        const [r, g, b] = key.split(',').map(Number);
        return { r, g, b, count: colorMap[key] };
      })
      .sort((a, b) => b.count - a.count);

    // Pick 8 sufficiently distinct colors
    const picked = [];
    for (const c of sorted) {
      if (picked.length >= 8) break;
      const isDistinct = picked.every(p => colorDistance(c, p) > 45);
      if (isDistinct) {
        picked.push(c);
      }
    }

    // Fallback if not enough distinct colors found
    let idx = 0;
    while (picked.length < 8 && idx < sorted.length) {
      if (!picked.includes(sorted[idx])) {
        picked.push(sorted[idx]);
      }
      idx++;
    }

    extractedColors = picked.map(c => rgbToHex(c.r, c.g, c.b));
    renderSwatches(picked);
    window.showToast('Extracted 8 dominant colors!', 'success');
  }

  function colorDistance(c1, c2) {
    const dr = c1.r - c2.r;
    const dg = c1.g - c2.g;
    const db = c1.b - c2.b;
    return Math.sqrt(dr * dr + dg * dg + db * db);
  }

  function rgbToHex(r, g, b) {
    return '#' + [r, g, b].map(x => {
      const hex = Math.min(255, Math.max(0, x)).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('').toUpperCase();
  }

  function rgbToHsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
    return `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;
  }

  function getLuminance(r, g, b) {
    return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  }

  function renderSwatches(colors) {
    if (!swatchesContainer) return;
    swatchesContainer.innerHTML = '';

    colors.forEach(c => {
      const hex = rgbToHex(c.r, c.g, c.b);
      const rgb = `rgb(${c.r}, ${c.g}, ${c.b})`;
      const hsl = rgbToHsl(c.r, c.g, c.b);
      const isLight = getLuminance(c.r, c.g, c.b) > 0.55;

      const card = document.createElement('div');
      card.className = 'group rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-white dark:bg-slate-800 shadow-sm transition-all hover:shadow-md';
      card.innerHTML = `
        <div class="h-24 w-full relative flex items-center justify-center cursor-pointer transition-transform group-hover:scale-105" style="background-color: ${hex}" onclick="window.copyToClipboard('${hex}', 'Copied ${hex}!')">
          <span class="text-xs font-bold px-2 py-1 rounded bg-black/30 backdrop-blur-sm text-white opacity-0 group-hover:opacity-100 transition-opacity">
            Copy HEX
          </span>
        </div>
        <div class="p-3 space-y-1.5 text-xs">
          <div class="flex items-center justify-between">
            <span class="font-mono font-bold text-slate-800 dark:text-slate-100">${hex}</span>
            <button type="button" class="text-slate-400 hover:text-indigo-600 transition-colors" title="Copy HEX" onclick="window.copyToClipboard('${hex}', 'Copied ${hex}!')">
              <i data-lucide="copy" class="w-3.5 h-3.5"></i>
            </button>
          </div>
          <div class="flex items-center justify-between text-slate-500 dark:text-slate-400 font-mono text-[11px]">
            <span>${rgb}</span>
            <button type="button" class="text-slate-400 hover:text-indigo-600 transition-colors" title="Copy RGB" onclick="window.copyToClipboard('${rgb}', 'Copied RGB!')">
              <i data-lucide="copy" class="w-3.5 h-3.5"></i>
            </button>
          </div>
          <div class="flex items-center justify-between text-slate-500 dark:text-slate-400 font-mono text-[11px]">
            <span>${hsl}</span>
            <button type="button" class="text-slate-400 hover:text-indigo-600 transition-colors" title="Copy HSL" onclick="window.copyToClipboard('${hsl}', 'Copied HSL!')">
              <i data-lucide="copy" class="w-3.5 h-3.5"></i>
            </button>
          </div>
        </div>
      `;
      swatchesContainer.appendChild(card);
    });

    // Update Action button for SVG Editor
    if (useSvgBtn) {
      const cleanHexList = extractedColors.map(h => h.replace('#', '')).join(',');
      useSvgBtn.href = `svg-color-changer.html?colors=${cleanHexList}`;
    }

    if (window.lucide) window.lucide.createIcons();
  }

  if (copyCssBtn) {
    copyCssBtn.addEventListener('click', () => {
      if (extractedColors.length === 0) return;
      let css = ':root {\n';
      extractedColors.forEach((hex, i) => {
        css += `  --color-palette-${i + 1}: ${hex};\n`;
      });
      css += '}';
      window.copyToClipboard(css, 'CSS variables copied to clipboard!');
    });
  }

  if (downloadCardBtn) {
    downloadCardBtn.addEventListener('click', () => {
      if (extractedColors.length === 0) return;

      const cardCanvas = document.createElement('canvas');
      cardCanvas.width = 1200;
      cardCanvas.height = 630;
      const ctx = cardCanvas.getContext('2d');

      // Background
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, 1200, 630);

      // Header title
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 36px -apple-system, sans-serif';
      ctx.fillText('MultiTools Hub • Extracted Color Palette', 60, 80);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '22px -apple-system, sans-serif';
      ctx.fillText('8 Dominant & Harmonious Tones', 60, 120);

      // Draw 8 swatches
      const cols = 4;
      const rows = 2;
      const startX = 60;
      const startY = 160;
      const swatchW = 250;
      const swatchH = 180;
      const gapX = 26;
      const gapY = 26;

      extractedColors.forEach((hex, i) => {
        const col = i % cols;
        const row = Math.floor(i / cols);
        const x = startX + col * (swatchW + gapX);
        const y = startY + row * (swatchH + gapY);

        ctx.fillStyle = hex;
        ctx.beginPath();
        ctx.roundRect(x, y, swatchW, swatchH - 45, 12);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 22px monospace';
        ctx.fillText(hex, x + 10, y + swatchH - 12);
      });

      cardCanvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `color-palette-${Date.now()}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 5000);
        window.showToast('Palette PNG card downloaded!', 'success');
      });
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      extractedColors = [];
      fileInput.value = '';
      workspace.classList.add('hidden');
      dropZone.classList.remove('hidden');
    });
  }
});
