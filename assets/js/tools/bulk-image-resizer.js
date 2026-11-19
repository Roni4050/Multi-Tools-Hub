/**
 * Tool 6: Bulk Image Resizer & Cropper
 * Batch Canvas Resizing with Aspect Ratio Lock and JSZip Download
 */

document.addEventListener('DOMContentLoaded', () => {
  const dropZone = document.getElementById('resizer-dropzone');
  const fileInput = document.getElementById('resizer-file-input');
  const targetWInput = document.getElementById('target-width');
  const targetHInput = document.getElementById('target-height');
  const lockAspectCheck = document.getElementById('lock-aspect');
  const resizeModeSelect = document.getElementById('resize-mode');
  const formatSelect = document.getElementById('output-format');
  const qualitySlider = document.getElementById('quality-slider');
  const qualityValueText = document.getElementById('quality-value');

  const fileListEl = document.getElementById('resizer-file-list');
  const emptyState = document.getElementById('resizer-empty-state');
  const batchActions = document.getElementById('batch-actions');
  const downloadAllBtn = document.getElementById('download-all-zip-btn');
  const clearAllBtn = document.getElementById('clear-all-btn');
  const sampleBtn = document.getElementById('resizer-sample-btn');
  const progressContainer = document.getElementById('resizer-progress');
  const progressBar = document.getElementById('resizer-progress-bar');
  const progressText = document.getElementById('resizer-progress-text');

  let images = []; // Array of { id, file, name, size, type, dataUrl, origW, origH }

  if (sampleBtn) {
    sampleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const samples = [
        { name: 'landscape_4k.jpg', w: 3840, h: 2160, color: '#3b82f6', label: 'Landscape 4K (3840×2160)' },
        { name: 'vertical_story.jpg', w: 1080, h: 1920, color: '#ec4899', label: 'Vertical Story (1080×1920)' },
        { name: 'square_product.jpg', w: 2000, h: 2000, color: '#10b981', label: 'Square Product (2000×2000)' }
      ];

      samples.forEach((s, idx) => {
        const c = document.createElement('canvas');
        c.width = s.w;
        c.height = s.h;
        const ctx = c.getContext('2d');
        ctx.fillStyle = s.color;
        ctx.fillRect(0, 0, s.w, s.h);
        ctx.fillStyle = '#ffffff';
        ctx.font = `bold ${Math.round(s.w / 20)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText(s.label, s.w / 2, s.h / 2);

        const dataUrl = c.toDataURL('image/jpeg', 0.9);
        images.push({
          id: 'sample_' + idx,
          file: { name: s.name, size: Math.round(dataUrl.length * 0.75) },
          name: s.name,
          size: Math.round(dataUrl.length * 0.75),
          type: 'image/jpeg',
          dataUrl,
          origW: s.w,
          origH: s.h
        });
      });

      renderList();
      window.showToast('3 Sample images loaded into resizer!', 'success');
    });
  }

  // Check URL query params for prefilled dimensions (e.g. from aspect-ratio-calculator.html?w=1920&h=1080)
  const urlParams = new URLSearchParams(window.location.search);
  const paramW = urlParams.get('w');
  const paramH = urlParams.get('h');
  if (paramW && targetWInput) targetWInput.value = paramW;
  if (paramH && targetHInput) targetHInput.value = paramH;

  let currentAspect = (parseFloat(targetWInput.value) || 1920) / (parseFloat(targetHInput.value) || 1080);

  if (targetWInput && targetHInput && lockAspectCheck) {
    targetWInput.addEventListener('input', () => {
      if (lockAspectCheck.checked) {
        const w = parseFloat(targetWInput.value) || 0;
        if (w > 0 && currentAspect > 0) {
          targetHInput.value = Math.round(w / currentAspect);
        }
      }
      renderList();
    });

    targetHInput.addEventListener('input', () => {
      if (lockAspectCheck.checked) {
        const h = parseFloat(targetHInput.value) || 0;
        if (h > 0 && currentAspect > 0) {
          targetWInput.value = Math.round(h * currentAspect);
        }
      }
      renderList();
    });

    lockAspectCheck.addEventListener('change', () => {
      const w = parseFloat(targetWInput.value) || 1920;
      const h = parseFloat(targetHInput.value) || 1080;
      currentAspect = w / h;
    });
  }

  if (qualitySlider && qualityValueText) {
    qualitySlider.addEventListener('input', (e) => {
      qualityValueText.textContent = `${e.target.value}%`;
    });
  }

  if (resizeModeSelect) resizeModeSelect.addEventListener('change', renderList);
  if (formatSelect) formatSelect.addEventListener('change', renderList);

  if (dropZone && fileInput) {
    window.setupDropZone(dropZone, fileInput, handleFilesSelected);
  }

  async function handleFilesSelected(files) {
    const valid = Array.from(files).filter(f => f.type.startsWith('image/'));
    if (valid.length === 0) {
      window.showToast('Please select valid image files (JPG, PNG, WebP)', 'error');
      return;
    }

    window.showToast(`Loading ${valid.length} image(s)...`, 'info');

    for (const file of valid) {
      const id = 'img_' + Math.random().toString(36).substr(2, 9);
      try {
        const dataUrl = await readFileAsDataURL(file);
        const dims = await getImageDimensions(dataUrl);

        // If this is the very first image and no URL params were provided, pre-fill with its dimensions
        if (images.length === 0 && !paramW && !paramH && targetWInput && targetHInput) {
          targetWInput.value = dims.w;
          targetHInput.value = dims.h;
          currentAspect = dims.w / dims.h;
        }

        images.push({
          id,
          file,
          name: file.name,
          size: file.size,
          type: file.type,
          dataUrl,
          origW: dims.w,
          origH: dims.h
        });
      } catch (err) {
        console.error('Failed to load image:', file.name, err);
      }
    }

    renderList();
    fileInput.value = '';
  }

  function readFileAsDataURL(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  function getImageDimensions(dataUrl) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve({ w: img.naturalWidth, h: img.naturalHeight });
      img.onerror = () => resolve({ w: 800, h: 600 });
      img.src = dataUrl;
    });
  }

  function renderList() {
    if (images.length === 0) {
      emptyState.classList.remove('hidden');
      fileListEl.classList.add('hidden');
      batchActions.classList.add('hidden');
      return;
    }

    emptyState.classList.add('hidden');
    fileListEl.classList.remove('hidden');
    batchActions.classList.remove('hidden');

    const tw = parseInt(targetWInput.value, 10) || 1920;
    const th = parseInt(targetHInput.value, 10) || 1080;
    const format = formatSelect ? formatSelect.value : 'original';

    fileListEl.innerHTML = '';
    images.forEach((item, index) => {
      const ext = format === 'original' ? item.name.split('.').pop() : format;
      const card = document.createElement('div');
      card.className = 'flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700/80 gap-3';
      card.innerHTML = `
        <div class="flex items-center gap-3 min-w-0 flex-1">
          <div class="w-12 h-12 rounded-lg bg-slate-200 dark:bg-slate-700 overflow-hidden flex-shrink-0 flex items-center justify-center">
            <img src="${item.dataUrl}" alt="${escapeHtml(item.name)}" class="w-full h-full object-cover">
          </div>
          <div class="min-w-0 flex-1">
            <p class="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">${escapeHtml(item.name)}</p>
            <div class="flex items-center gap-2 mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              <span>Original: ${item.origW} × ${item.origH}</span>
              <span>→</span>
              <span class="font-semibold text-indigo-600 dark:text-indigo-400">Target: ${tw} × ${th} (.${ext})</span>
            </div>
          </div>
        </div>
        <div class="flex items-center gap-1.5">
          <button type="button" class="px-2.5 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors flex items-center gap-1" onclick="window.downloadSingleResized(${index})">
            <i data-lucide="download" class="w-3.5 h-3.5"></i>
            <span>Save</span>
          </button>
          <button type="button" class="p-1.5 text-rose-500 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors" onclick="window.removeResizerItem(${index})">
            <i data-lucide="trash-2" class="w-4 h-4"></i>
          </button>
        </div>
      `;
      fileListEl.appendChild(card);
    });

    if (window.lucide) window.lucide.createIcons();
  }

  window.removeResizerItem = function (index) {
    images.splice(index, 1);
    renderList();
    window.showToast('Image removed', 'info');
  };

  if (clearAllBtn) {
    clearAllBtn.addEventListener('click', () => {
      images = [];
      renderList();
      window.showToast('All images cleared', 'info');
    });
  }

  // Core canvas resize helper
  function processResizeImage(item, targetW, targetH, mode, format, quality) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = targetW;
        canvas.height = targetH;
        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // Background handling for transparent PNGs converted to JPEG
        const mimeType = format === 'original' 
          ? (item.type || 'image/jpeg') 
          : (format === 'png' ? 'image/png' : format === 'webp' ? 'image/webp' : 'image/jpeg');

        if (mimeType === 'image/jpeg') {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, targetW, targetH);
        }

        if (mode === 'stretch') {
          ctx.drawImage(img, 0, 0, targetW, targetH);
        } else if (mode === 'crop') {
          // Center crop (fill)
          const imgRatio = img.naturalWidth / img.naturalHeight;
          const targetRatio = targetW / targetH;
          let sW, sH, sX, sY;

          if (imgRatio > targetRatio) {
            sH = img.naturalHeight;
            sW = sH * targetRatio;
            sX = (img.naturalWidth - sW) / 2;
            sY = 0;
          } else {
            sW = img.naturalWidth;
            sH = sW / targetRatio;
            sX = 0;
            sY = (img.naturalHeight - sH) / 2;
          }
          ctx.drawImage(img, sX, sY, sW, sH, 0, 0, targetW, targetH);
        } else {
          // Fit (contain without crop)
          const scale = Math.min(targetW / img.naturalWidth, targetH / img.naturalHeight);
          const dw = img.naturalWidth * scale;
          const dh = img.naturalHeight * scale;
          const dx = (targetW - dw) / 2;
          const dy = (targetH - dh) / 2;

          ctx.drawImage(img, dx, dy, dw, dh);
        }

        canvas.toBlob((blob) => {
          if (!blob) {
            reject(new Error('Canvas export failed'));
            return;
          }
          resolve(blob);
        }, mimeType, quality);
      };
      img.onerror = reject;
      img.src = item.dataUrl;
    });
  }

  window.downloadSingleResized = async function (index) {
    const item = images[index];
    if (!item) return;

    const targetW = parseInt(targetWInput.value, 10) || 1920;
    const targetH = parseInt(targetHInput.value, 10) || 1080;
    const mode = resizeModeSelect ? resizeModeSelect.value : 'fit';
    const format = formatSelect ? formatSelect.value : 'original';
    const quality = (parseInt(qualitySlider.value, 10) || 90) / 100;

    try {
      window.showToast('Resizing image...', 'info');
      const blob = await processResizeImage(item, targetW, targetH, mode, format, quality);
      const url = URL.createObjectURL(blob);
      const ext = format === 'original' ? item.name.split('.').pop() : format;
      const base = item.name.replace(/\.[^/.]+$/, '');
      const a = document.createElement('a');
      a.href = url;
      a.download = `${base}-${targetW}x${targetH}.${ext}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 5000);
      window.showToast('Image downloaded!', 'success');
    } catch (err) {
      console.error('Resize error:', err);
      window.showToast('Error resizing image', 'error');
    }
  };

  if (downloadAllBtn) {
    downloadAllBtn.addEventListener('click', async () => {
      if (images.length === 0) return;
      if (!window.JSZip) {
        window.showToast('ZIP library is loading. Please wait...', 'error');
        return;
      }

      downloadAllBtn.disabled = true;
      progressContainer.classList.remove('hidden');
      progressBar.style.width = '10%';

      const targetW = parseInt(targetWInput.value, 10) || 1920;
      const targetH = parseInt(targetHInput.value, 10) || 1080;
      const mode = resizeModeSelect ? resizeModeSelect.value : 'fit';
      const format = formatSelect ? formatSelect.value : 'original';
      const quality = (parseInt(qualitySlider.value, 10) || 90) / 100;

      try {
        const zip = new window.JSZip();
        const total = images.length;

        for (let i = 0; i < total; i++) {
          const item = images[i];
          progressText.textContent = `Resizing ${i + 1} of ${total}: ${item.name}...`;
          progressBar.style.width = `${Math.round(((i + 1) / total) * 80)}%`;

          const blob = await processResizeImage(item, targetW, targetH, mode, format, quality);
          const ext = format === 'original' ? item.name.split('.').pop() : format;
          const base = item.name.replace(/\.[^/.]+$/, '');
          zip.file(`${base}-${targetW}x${targetH}.${ext}`, blob);
        }

        progressText.textContent = 'Creating ZIP file...';
        progressBar.style.width = '90%';

        const zipBlob = await zip.generateAsync({ type: 'blob' });
        const url = URL.createObjectURL(zipBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `resized-images-${targetW}x${targetH}.zip`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 5000);

        progressBar.style.width = '100%';
        progressText.textContent = 'All images downloaded!';
        window.showToast(`Batch completed: ${total} images resized and zipped!`, 'success');
      } catch (err) {
        console.error('Batch error:', err);
        window.showToast('Batch processing failed: ' + err.message, 'error');
      } finally {
        downloadAllBtn.disabled = false;
        setTimeout(() => progressContainer.classList.add('hidden'), 2500);
      }
    });
  }

  function escapeHtml(str) {
    return str.replace(/[&<>'"]/g, tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag));
  }
});
