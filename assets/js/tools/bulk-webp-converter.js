/**
 * Tool 7: Bulk WebP & Image Format Converter
 * Fast client-side batch compression and format conversion with size savings analytics
 */

document.addEventListener('DOMContentLoaded', () => {
  const dropZone = document.getElementById('converter-dropzone');
  const fileInput = document.getElementById('converter-file-input');
  const formatSelect = document.getElementById('convert-format');
  const qualitySlider = document.getElementById('convert-quality');
  const qualityValueText = document.getElementById('convert-quality-val');

  const fileListEl = document.getElementById('converter-list');
  const emptyState = document.getElementById('converter-empty-state');
  const statsBanner = document.getElementById('converter-stats-banner');
  const statOriginalEl = document.getElementById('stat-original');
  const statConvertedEl = document.getElementById('stat-converted');
  const statSavedEl = document.getElementById('stat-saved');
  const downloadAllBtn = document.getElementById('converter-download-all');
  const clearAllBtn = document.getElementById('converter-clear-all');
  const sampleBtn = document.getElementById('converter-sample-btn');
  const progressContainer = document.getElementById('converter-progress');
  const progressBar = document.getElementById('converter-progress-bar');
  const progressText = document.getElementById('converter-progress-text');

  let items = []; // Array of { file, name, origSize, origType, convertedBlob, convertedSize, dataUrl, convertedUrl }

  if (sampleBtn) {
    sampleBtn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const samples = [
        { name: 'sample_raw_camera.png', w: 1600, h: 1200, color: '#f59e0b', label: 'RAW Photography Test (PNG)' },
        { name: 'sample_portfolio_banner.png', w: 1920, h: 1080, color: '#6366f1', label: 'Portfolio Header Banner (PNG)' },
        { name: 'sample_ui_mockup.png', w: 1400, h: 900, color: '#06b6d4', label: 'UI Product Mockup (PNG)' }
      ];

      for (let i = 0; i < samples.length; i++) {
        const s = samples[i];
        const c = document.createElement('canvas');
        c.width = s.w;
        c.height = s.h;
        const ctx = c.getContext('2d');
        ctx.fillStyle = s.color;
        ctx.fillRect(0, 0, s.w, s.h);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 50px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(s.label, s.w / 2, s.h / 2);

        // High size uncompressed PNG data
        const dataUrl = c.toDataURL('image/png');
        items.push({
          file: { name: s.name, size: Math.round(dataUrl.length * 0.75) },
          name: s.name,
          origSize: Math.round(dataUrl.length * 0.75),
          origType: 'image/png',
          dataUrl,
          convertedBlob: null,
          convertedSize: 0,
          convertedUrl: null
        });
      }

      await reprocessAll();
      window.showToast('3 Sample images loaded! Notice the 70-85% size savings in WebP.', 'success');
    });
  }

  if (qualitySlider && qualityValueText) {
    qualitySlider.addEventListener('input', (e) => {
      qualityValueText.textContent = `${e.target.value}%`;
    });
    qualitySlider.addEventListener('change', reprocessAll);
  }

  if (formatSelect) {
    formatSelect.addEventListener('change', reprocessAll);
  }

  if (dropZone && fileInput) {
    window.setupDropZone(dropZone, fileInput, handleFilesSelected);
  }

  async function handleFilesSelected(files) {
    const valid = Array.from(files).filter(f => f.type.startsWith('image/')).slice(0, 50);
    if (valid.length === 0) {
      window.showToast('Please select valid image files', 'error');
      return;
    }

    window.showToast(`Processing ${valid.length} image(s)...`, 'info');

    for (const file of valid) {
      try {
        const dataUrl = await readFileAsDataURL(file);
        items.push({
          file,
          name: file.name,
          origSize: file.size,
          origType: file.type,
          dataUrl,
          convertedBlob: null,
          convertedSize: 0,
          convertedUrl: null
        });
      } catch (err) {
        console.error('Error loading image:', file.name, err);
      }
    }

    fileInput.value = '';
    await reprocessAll();
  }

  function readFileAsDataURL(file) {
    return new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(r.result);
      r.onerror = reject;
      r.readAsDataURL(file);
    });
  }

  async function reprocessAll() {
    if (items.length === 0) {
      emptyState.classList.remove('hidden');
      fileListEl.classList.add('hidden');
      statsBanner.classList.add('hidden');
      return;
    }

    emptyState.classList.add('hidden');
    fileListEl.classList.remove('hidden');
    statsBanner.classList.remove('hidden');

    const format = formatSelect ? formatSelect.value : 'webp';
    const quality = (parseInt(qualitySlider.value, 10) || 85) / 100;
    const mimeType = format === 'webp' ? 'image/webp' : (format === 'png' ? 'image/png' : 'image/jpeg');

    progressContainer.classList.remove('hidden');
    progressBar.style.width = '10%';
    progressText.textContent = `Converting images to ${format.toUpperCase()}...`;

    const total = items.length;
    for (let i = 0; i < total; i++) {
      const item = items[i];
      if (item.convertedUrl) URL.revokeObjectURL(item.convertedUrl);

      const blob = await convertImageCanvas(item.dataUrl, mimeType, quality);
      item.convertedBlob = blob;
      item.convertedSize = blob.size;
      item.convertedUrl = URL.createObjectURL(blob);

      progressBar.style.width = `${Math.round(((i + 1) / total) * 90)}%`;
    }

    progressBar.style.width = '100%';
    setTimeout(() => progressContainer.classList.add('hidden'), 500);

    renderList();
    updateStats();
  }

  function convertImageCanvas(dataUrl, mimeType, quality) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');

        if (mimeType === 'image/jpeg') {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        ctx.drawImage(img, 0, 0);
        canvas.toBlob((blob) => {
          if (!blob) {
            reject(new Error('Conversion failed'));
            return;
          }
          resolve(blob);
        }, mimeType, quality);
      };
      img.onerror = reject;
      img.src = dataUrl;
    });
  }

  function renderList() {
    fileListEl.innerHTML = '';
    const format = formatSelect ? formatSelect.value : 'webp';

    items.forEach((item, index) => {
      const base = item.name.replace(/\.[^/.]+$/, '');
      const outName = `${base}.${format}`;
      const diff = item.origSize - item.convertedSize;
      const pct = Math.round((diff / item.origSize) * 100);

      const card = document.createElement('div');
      card.className = 'flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700/80 gap-3';
      card.innerHTML = `
        <div class="flex items-center gap-3 min-w-0 flex-1">
          <div class="w-12 h-12 rounded-lg bg-slate-200 dark:bg-slate-700 overflow-hidden flex-shrink-0 flex items-center justify-center">
            <img src="${item.convertedUrl || item.dataUrl}" alt="${escapeHtml(outName)}" class="w-full h-full object-cover">
          </div>
          <div class="min-w-0 flex-1">
            <p class="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">${escapeHtml(outName)}</p>
            <div class="flex items-center gap-2 mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              <span class="line-through">${window.formatBytes(item.origSize)}</span>
              <span>→</span>
              <span class="font-bold text-slate-700 dark:text-slate-200">${window.formatBytes(item.convertedSize)}</span>
              <span class="inline-flex items-center px-1.5 py-0.2 rounded font-semibold ${
                pct >= 0 ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300' : 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300'
              }">
                ${pct >= 0 ? `-${pct}%` : `+${Math.abs(pct)}%`}
              </span>
            </div>
          </div>
        </div>
        <div class="flex items-center gap-1.5">
          <a href="${item.convertedUrl}" download="${outName}" class="px-2.5 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors flex items-center gap-1">
            <i data-lucide="download" class="w-3.5 h-3.5"></i>
            <span>Save</span>
          </a>
          <button type="button" class="p-1.5 text-rose-500 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors" onclick="window.removeConverterItem(${index})">
            <i data-lucide="trash-2" class="w-4 h-4"></i>
          </button>
        </div>
      `;
      fileListEl.appendChild(card);
    });

    if (window.lucide) window.lucide.createIcons();
  }

  function updateStats() {
    let origTotal = 0;
    let convTotal = 0;
    items.forEach(it => {
      origTotal += it.origSize;
      convTotal += it.convertedSize;
    });

    const diff = origTotal - convTotal;
    const pct = origTotal > 0 ? Math.round((diff / origTotal) * 100) : 0;

    if (statOriginalEl) statOriginalEl.textContent = window.formatBytes(origTotal);
    if (statConvertedEl) statConvertedEl.textContent = window.formatBytes(convTotal);
    if (statSavedEl) {
      if (diff >= 0) {
        statSavedEl.textContent = `${window.formatBytes(diff)} saved (${pct}%)`;
        statSavedEl.className = 'text-emerald-600 dark:text-emerald-400 font-bold';
      } else {
        statSavedEl.textContent = `+${window.formatBytes(Math.abs(diff))} (${Math.abs(pct)}%)`;
        statSavedEl.className = 'text-amber-600 dark:text-amber-400 font-bold';
      }
    }
  }

  window.removeConverterItem = function (index) {
    if (items[index] && items[index].convertedUrl) {
      URL.revokeObjectURL(items[index].convertedUrl);
    }
    items.splice(index, 1);
    if (items.length === 0) {
      emptyState.classList.remove('hidden');
      fileListEl.classList.add('hidden');
      statsBanner.classList.add('hidden');
    } else {
      renderList();
      updateStats();
    }
    window.showToast('Item removed', 'info');
  };

  if (clearAllBtn) {
    clearAllBtn.addEventListener('click', () => {
      items.forEach(it => {
        if (it.convertedUrl) URL.revokeObjectURL(it.convertedUrl);
      });
      items = [];
      emptyState.classList.remove('hidden');
      fileListEl.classList.add('hidden');
      statsBanner.classList.add('hidden');
      window.showToast('All items cleared', 'info');
    });
  }

  if (downloadAllBtn) {
    downloadAllBtn.addEventListener('click', async () => {
      if (items.length === 0) return;
      if (!window.JSZip) {
        window.showToast('ZIP library is loading...', 'error');
        return;
      }

      downloadAllBtn.disabled = true;
      progressContainer.classList.remove('hidden');
      progressBar.style.width = '20%';
      progressText.textContent = 'Zipping converted files...';

      try {
        const zip = new window.JSZip();
        const format = formatSelect ? formatSelect.value : 'webp';

        items.forEach(it => {
          const base = it.name.replace(/\.[^/.]+$/, '');
          zip.file(`${base}.${format}`, it.convertedBlob);
        });

        progressBar.style.width = '80%';
        const zipBlob = await zip.generateAsync({ type: 'blob' });
        const url = URL.createObjectURL(zipBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `converted-${format}-images.zip`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 5000);

        progressBar.style.width = '100%';
        progressText.textContent = 'ZIP download ready!';
        window.showToast(`Downloaded all ${items.length} images in ZIP!`, 'success');
      } catch (err) {
        console.error('ZIP error:', err);
        window.showToast('Failed to create ZIP: ' + err.message, 'error');
      } finally {
        downloadAllBtn.disabled = false;
        setTimeout(() => progressContainer.classList.add('hidden'), 2000);
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
