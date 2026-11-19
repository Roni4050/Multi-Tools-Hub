/**
 * Tool 5: Aspect Ratio & Upscale Resolution Calculator
 * Microstock 4MP verification, aspect ratio simplification, and upscale calculations
 */

document.addEventListener('DOMContentLoaded', () => {
  const widthInput = document.getElementById('calc-width');
  const heightInput = document.getElementById('calc-height');
  
  const ratioResultEl = document.getElementById('result-ratio');
  const decimalResultEl = document.getElementById('result-decimal');
  const mpResultEl = document.getElementById('result-mp');
  const microstockBadgeEl = document.getElementById('result-microstock-badge');
  const upscaleListEl = document.getElementById('upscale-list');
  const visualAspectBox = document.getElementById('visual-aspect-box');

  const resizeActionBtn = document.getElementById('resize-action-btn');
  const presetBtns = document.querySelectorAll('.aspect-preset-btn');

  // Dimension Resizer inputs
  const targetWInput = document.getElementById('target-w-input');
  const targetHInput = document.getElementById('target-h-input');

  // Image Upload elements
  const dropZone = document.getElementById('aspect-dropzone');
  const fileInput = document.getElementById('aspect-file-input');
  const previewBar = document.getElementById('aspect-image-preview-bar');
  const thumbEl = document.getElementById('aspect-thumb');
  const fileNameEl = document.getElementById('aspect-file-name');
  const detectedDimsEl = document.getElementById('aspect-detected-dims');
  const clearImageBtn = document.getElementById('aspect-clear-image-btn');

  if (dropZone && fileInput) {
    window.setupDropZone(dropZone, fileInput, (files) => {
      const file = files[0];
      if (!file || !file.type.startsWith('image/')) {
        window.showToast('Please upload a valid image file', 'error');
        return;
      }
      loadImage(file);
    });
  }

  function loadImage(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        widthInput.value = img.naturalWidth;
        heightInput.value = img.naturalHeight;
        if (targetWInput) targetWInput.value = img.naturalWidth;
        if (targetHInput) targetHInput.value = img.naturalHeight;

        if (previewBar && thumbEl && fileNameEl && detectedDimsEl) {
          thumbEl.src = img.src;
          fileNameEl.textContent = file.name;
          detectedDimsEl.textContent = `${img.naturalWidth} × ${img.naturalHeight} px`;
          previewBar.classList.remove('hidden');
        }
        calculate();
        window.showToast(`Detected ${img.naturalWidth} × ${img.naturalHeight} px from image!`, 'success');
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  if (clearImageBtn) {
    clearImageBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (fileInput) fileInput.value = '';
      if (previewBar) previewBar.classList.add('hidden');
      if (thumbEl) thumbEl.src = '';
      window.showToast('Image cleared', 'info');
    });
  }

  function gcd(a, b) {
    return b === 0 ? a : gcd(b, a % b);
  }

  // Find standard aspect ratio with approximate matching if needed
  function getStandardRatio(w, h) {
    if (w <= 0 || h <= 0) return '0:0';
    
    // Direct reduction
    const divisor = gcd(Math.round(w), Math.round(h));
    let simpW = Math.round(w) / divisor;
    let simpH = Math.round(h) / divisor;

    // Common standard video and photo ratios to check against decimals
    const dec = w / h;
    const knownRatios = [
      { name: '16:9', val: 16 / 9, w: 16, h: 9 },
      { name: '9:16', val: 9 / 16, w: 9, h: 16 },
      { name: '4:3', val: 4 / 3, w: 4, h: 3 },
      { name: '3:4', val: 3 / 4, w: 3, h: 4 },
      { name: '1:1', val: 1, w: 1, h: 1 },
      { name: '4:5', val: 4 / 5, w: 4, h: 5 },
      { name: '5:4', val: 5 / 4, w: 5, h: 4 },
      { name: '3:2', val: 3 / 2, w: 3, h: 2 },
      { name: '2:3', val: 2 / 3, w: 2, h: 3 },
      { name: '21:9', val: 21 / 9, w: 21, h: 9 },
      { name: '9:21', val: 9 / 21, w: 9, h: 21 },
      { name: '1.91:1', val: 1.91, w: 191, h: 100 }
    ];

    for (const kr of knownRatios) {
      if (Math.abs(dec - kr.val) < 0.015) {
        return kr.name;
      }
    }

    if (simpW > 50 || simpH > 50) {
      return `${(w / h).toFixed(2)}:1`;
    }

    return `${simpW}:${simpH}`;
  }

  function calculate() {
    const w = parseFloat(widthInput.value) || 0;
    const h = parseFloat(heightInput.value) || 0;

    if (w <= 0 || h <= 0) {
      if (ratioResultEl) ratioResultEl.textContent = '—';
      if (decimalResultEl) decimalResultEl.textContent = '—';
      if (mpResultEl) mpResultEl.textContent = '0.00 MP';
      if (microstockBadgeEl) {
        microstockBadgeEl.innerHTML = '<span class="text-slate-400">Enter dimensions to check</span>';
      }
      return;
    }

    // Aspect ratio
    const ratioStr = getStandardRatio(w, h);
    const decimalRatio = (w / h).toFixed(3);
    const totalPixels = w * h;
    const megapixels = (totalPixels / 1000000).toFixed(2);

    if (ratioResultEl) ratioResultEl.textContent = ratioStr;
    if (decimalResultEl) decimalResultEl.textContent = `${decimalRatio}:1`;
    if (mpResultEl) mpResultEl.textContent = `${megapixels} MP`;

    // Microstock check (4MP threshold for Adobe Stock, Shutterstock, Dreamstime)
    if (microstockBadgeEl) {
      if (totalPixels >= 4000000) {
        microstockBadgeEl.innerHTML = `
          <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300">
            <i data-lucide="check-circle" class="w-3.5 h-3.5"></i>
            Meets 4MP Microstock Standard (${megapixels} MP)
          </div>
        `;
      } else {
        const neededUpscale = Math.ceil(Math.sqrt(4000000 / totalPixels) * 10) / 10;
        microstockBadgeEl.innerHTML = `
          <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300">
            <i data-lucide="alert-triangle" class="w-3.5 h-3.5"></i>
            Below 4MP minimum (Needs ~${neededUpscale}x upscale for Adobe/Shutterstock)
          </div>
        `;
      }
    }

    // Visual aspect box representation
    if (visualAspectBox) {
      const maxBoxSize = 140;
      let boxW, boxH;
      if (w >= h) {
        boxW = maxBoxSize;
        boxH = Math.max(20, Math.round(maxBoxSize * (h / w)));
      } else {
        boxH = maxBoxSize;
        boxW = Math.max(20, Math.round(maxBoxSize * (w / h)));
      }
      visualAspectBox.style.width = `${boxW}px`;
      visualAspectBox.style.height = `${boxH}px`;
    }

    // Upscale dimensions table
    if (upscaleListEl) {
      const scales = [1.5, 2, 3, 4, 8];
      upscaleListEl.innerHTML = '';
      scales.forEach(scale => {
        const upW = Math.round(w * scale);
        const upH = Math.round(h * scale);
        const upMp = ((upW * upH) / 1000000).toFixed(1);
        const row = document.createElement('div');
        row.className = 'flex items-center justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-xs';
        row.innerHTML = `
          <span class="font-bold text-indigo-600 dark:text-indigo-400 w-10">${scale}x</span>
          <span class="font-mono text-slate-700 dark:text-slate-200">${upW} × ${upH} px</span>
          <span class="text-slate-500 dark:text-slate-400 font-medium">${upMp} MP</span>
          <button type="button" class="px-2 py-1 rounded bg-slate-200 hover:bg-indigo-100 hover:text-indigo-700 dark:bg-slate-700 dark:hover:bg-indigo-950/80 dark:hover:text-indigo-300 transition-colors" onclick="window.useUpscaleDimensions(${upW}, ${upH})">
            Use
          </button>
        `;
        upscaleListEl.appendChild(row);
      });
    }

    // Update Action Button link
    if (resizeActionBtn) {
      resizeActionBtn.href = `bulk-image-resizer.html?w=${Math.round(w)}&h=${Math.round(h)}`;
    }

    // Update Dimension converter helper
    if (targetWInput && (!targetWInput.value || document.activeElement !== targetWInput)) {
      targetWInput.value = Math.round(w);
      if (targetHInput) targetHInput.value = Math.round(h);
    }

    if (window.lucide) window.lucide.createIcons();
  }

  window.useUpscaleDimensions = function(w, h) {
    if (widthInput && heightInput) {
      widthInput.value = w;
      heightInput.value = h;
      calculate();
      window.showToast(`Applied ${w} × ${h} px`, 'info');
    }
  };

  // Presets
  presetBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const w = btn.getAttribute('data-w');
      const h = btn.getAttribute('data-h');
      if (widthInput && heightInput) {
        widthInput.value = w;
        heightInput.value = h;
        calculate();
        window.showToast(`Preset: ${w} × ${h} px applied`, 'info');
      }
    });
  });

  if (widthInput) widthInput.addEventListener('input', calculate);
  if (heightInput) heightInput.addEventListener('input', calculate);

  // Dimension Resizer sync
  if (targetWInput) {
    targetWInput.addEventListener('input', () => {
      const origW = parseFloat(widthInput.value) || 1920;
      const origH = parseFloat(heightInput.value) || 1080;
      const newW = parseFloat(targetWInput.value) || 0;
      if (newW > 0 && origW > 0 && targetHInput) {
        targetHInput.value = Math.round(newW * (origH / origW));
      }
    });
  }

  if (targetHInput) {
    targetHInput.addEventListener('input', () => {
      const origW = parseFloat(widthInput.value) || 1920;
      const origH = parseFloat(heightInput.value) || 1080;
      const newH = parseFloat(targetHInput.value) || 0;
      if (newH > 0 && origH > 0 && targetWInput) {
        targetWInput.value = Math.round(newH * (origW / origH));
      }
    });
  }

  // Initial calculation
  calculate();
});
