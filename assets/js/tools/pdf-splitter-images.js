/**
 * Tool 2: PDF Splitter & Image-to-PDF Converter
 * Powered by pdf-lib & JSZip (100% client-side)
 */

document.addEventListener('DOMContentLoaded', () => {
  // Tab Switching
  const tabSplitBtn = document.getElementById('tab-split-btn');
  const tabImagesBtn = document.getElementById('tab-images-btn');
  const panelSplit = document.getElementById('panel-split');
  const panelImages = document.getElementById('panel-images');

  if (tabSplitBtn && tabImagesBtn) {
    tabSplitBtn.addEventListener('click', () => {
      tabSplitBtn.classList.add('bg-white', 'dark:bg-slate-800', 'shadow-sm', 'text-indigo-600', 'dark:text-indigo-400');
      tabSplitBtn.classList.remove('text-slate-600', 'dark:text-slate-400');
      tabImagesBtn.classList.remove('bg-white', 'dark:bg-slate-800', 'shadow-sm', 'text-indigo-600', 'dark:text-indigo-400');
      tabImagesBtn.classList.add('text-slate-600', 'dark:text-slate-400');
      panelSplit.classList.remove('hidden');
      panelImages.classList.add('hidden');
    });

    tabImagesBtn.addEventListener('click', () => {
      tabImagesBtn.classList.add('bg-white', 'dark:bg-slate-800', 'shadow-sm', 'text-indigo-600', 'dark:text-indigo-400');
      tabImagesBtn.classList.remove('text-slate-600', 'dark:text-slate-400');
      tabSplitBtn.classList.remove('bg-white', 'dark:bg-slate-800', 'shadow-sm', 'text-indigo-600', 'dark:text-indigo-400');
      tabSplitBtn.classList.add('text-slate-600', 'dark:text-slate-400');
      panelImages.classList.remove('hidden');
      panelSplit.classList.add('hidden');
    });
  }

  // ==================== TAB A: SPLIT PDF ====================
  const splitDropZone = document.getElementById('split-dropzone');
  const splitFileInput = document.getElementById('split-file-input');
  const splitInfoCard = document.getElementById('split-info-card');
  const splitFileName = document.getElementById('split-file-name');
  const splitFileMeta = document.getElementById('split-file-meta');
  const splitRangeInput = document.getElementById('split-range-input');
  const splitActionBtn = document.getElementById('split-action-btn');
  const splitZipBtn = document.getElementById('split-zip-btn');
  const splitResetBtn = document.getElementById('split-reset-btn');
  const splitProgress = document.getElementById('split-progress');
  const splitProgressBar = document.getElementById('split-progress-bar');
  const splitProgressText = document.getElementById('split-progress-text');
  const sampleSplitBtn = document.getElementById('load-sample-split-pdf-btn');

  let currentSplitPdf = null; // { arrayBuffer, pdfDoc, pageCount, name }

  if (sampleSplitBtn) {
    sampleSplitBtn.addEventListener('click', async (e) => {
      e.stopPropagation();
      if (!window.PDFLib) {
        window.showToast('PDF engine initializing, please wait...', 'info');
        return;
      }
      try {
        window.showToast('Generating 5-page sample PDF in memory...', 'info');
        const pdfDoc = await window.PDFLib.PDFDocument.create();
        for (let i = 1; i <= 5; i++) {
          const page = pdfDoc.addPage([595, 842]);
          page.drawText(`MultiTools Hub Sample Document - Page ${i}`, { x: 50, y: 750, size: 22 });
          page.drawText(`This is test page ${i} of 5. You can test extracting pages 1-2, 4 or exporting to ZIP.`, { x: 50, y: 700, size: 14 });
        }
        const pdfBytes = await pdfDoc.save();
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const file = new File([blob], 'Sample_Document_5_Pages.pdf', { type: 'application/pdf' });
        loadSplitPdf(file);
        window.showToast('5-page demo PDF loaded! Enter page ranges or click Extract.', 'success');
      } catch (err) {
        console.error(err);
        window.showToast('Failed to load sample PDF', 'error');
      }
    });
  }

  if (splitDropZone && splitFileInput) {
    window.setupDropZone(splitDropZone, splitFileInput, async (files) => {
      const file = files[0];
      if (!file || (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf')) {
        window.showToast('Please upload a valid PDF document', 'error');
        return;
      }
      loadSplitPdf(file);
    });
  }

  async function loadSplitPdf(file) {
    try {
      window.showToast('Inspecting PDF...', 'info');
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await window.PDFLib.PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
      const pageCount = pdfDoc.getPageCount();

      currentSplitPdf = {
        arrayBuffer,
        pdfDoc,
        pageCount,
        name: file.name
      };

      splitFileName.textContent = file.name;
      splitFileMeta.textContent = `${pageCount} total pages • ${window.formatBytes(file.size)}`;
      splitRangeInput.placeholder = `e.g. 1-2, 4, 5-${pageCount}`;
      splitRangeInput.value = `1-${Math.min(pageCount, 3)}`;

      splitDropZone.classList.add('hidden');
      splitInfoCard.classList.remove('hidden');
      splitActionBtn.disabled = false;
      splitZipBtn.disabled = false;

      window.showToast(`Loaded ${pageCount} pages from PDF`, 'success');
      if (window.lucide) window.lucide.createIcons();
    } catch (err) {
      console.error('Error loading PDF for split:', err);
      window.showToast('Failed to load PDF (may be password-protected or corrupted)', 'error');
    }
  }

  if (splitResetBtn) {
    splitResetBtn.addEventListener('click', () => {
      currentSplitPdf = null;
      splitFileInput.value = '';
      splitInfoCard.classList.add('hidden');
      splitDropZone.classList.remove('hidden');
      splitActionBtn.disabled = true;
      splitZipBtn.disabled = true;
    });
  }

  // Helper to parse page range string like "1-3, 5, 8-10"
  function parsePageRanges(rangeStr, maxPages) {
    const indices = new Set();
    const parts = rangeStr.split(',').map(s => s.trim()).filter(Boolean);
    
    for (const part of parts) {
      if (part.includes('-')) {
        const [startStr, endStr] = part.split('-').map(s => s.trim());
        const start = parseInt(startStr, 10);
        const end = parseInt(endStr, 10);
        if (isNaN(start) || isNaN(end) || start < 1 || end > maxPages || start > end) {
          return null; // invalid range
        }
        for (let i = start; i <= end; i++) {
          indices.add(i - 1); // 0-based
        }
      } else {
        const p = parseInt(part, 10);
        if (isNaN(p) || p < 1 || p > maxPages) {
          return null;
        }
        indices.add(p - 1);
      }
    }
    return Array.from(indices).sort((a, b) => a - b);
  }

  // Extract selected page range as single PDF
  if (splitActionBtn) {
    splitActionBtn.addEventListener('click', async () => {
      if (!currentSplitPdf) return;
      const rangeStr = splitRangeInput.value.trim();
      const pageIndices = parsePageRanges(rangeStr, currentSplitPdf.pageCount);

      if (!pageIndices || pageIndices.length === 0) {
        window.showToast(`Please enter valid page numbers between 1 and ${currentSplitPdf.pageCount}`, 'error');
        return;
      }

      splitProgress.classList.remove('hidden');
      splitProgressBar.style.width = '30%';
      splitProgressText.textContent = `Extracting ${pageIndices.length} page(s)...`;
      splitActionBtn.disabled = true;

      try {
        const newDoc = await window.PDFLib.PDFDocument.create();
        const copiedPages = await newDoc.copyPages(currentSplitPdf.pdfDoc, pageIndices);
        copiedPages.forEach(p => newDoc.addPage(p));

        splitProgressBar.style.width = '80%';
        splitProgressText.textContent = 'Saving PDF...';

        const pdfBytes = await newDoc.save();
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const baseName = currentSplitPdf.name.replace(/\.[^/.]+$/, '');
        a.download = `${baseName}-extracted-pages.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 5000);

        splitProgressBar.style.width = '100%';
        splitProgressText.textContent = 'Extracted successfully!';
        window.showToast(`Extracted ${pageIndices.length} page(s) successfully!`, 'success');
      } catch (err) {
        console.error('Split error:', err);
        window.showToast('Error extracting pages: ' + err.message, 'error');
      } finally {
        splitActionBtn.disabled = false;
        setTimeout(() => splitProgress.classList.add('hidden'), 2000);
      }
    });
  }

  // Extract all pages into individual PDFs zipped with JSZip
  if (splitZipBtn) {
    splitZipBtn.addEventListener('click', async () => {
      if (!currentSplitPdf) return;
      if (!window.JSZip) {
        window.showToast('ZIP library loading. Please try again.', 'error');
        return;
      }

      splitProgress.classList.remove('hidden');
      splitProgressBar.style.width = '10%';
      splitZipBtn.disabled = true;

      try {
        const zip = new window.JSZip();
        const total = currentSplitPdf.pageCount;
        const baseName = currentSplitPdf.name.replace(/\.[^/.]+$/, '');

        for (let i = 0; i < total; i++) {
          splitProgressText.textContent = `Processing page ${i + 1} of ${total}...`;
          splitProgressBar.style.width = `${Math.round(((i + 1) / total) * 80)}%`;

          const singlePageDoc = await window.PDFLib.PDFDocument.create();
          const [copiedPage] = await singlePageDoc.copyPages(currentSplitPdf.pdfDoc, [i]);
          singlePageDoc.addPage(copiedPage);

          const bytes = await singlePageDoc.save();
          const pageNum = String(i + 1).padStart(3, '0');
          zip.file(`${baseName}-page-${pageNum}.pdf`, bytes);
        }

        splitProgressText.textContent = 'Compressing into ZIP archive...';
        splitProgressBar.style.width = '90%';

        const zipBlob = await zip.generateAsync({ type: 'blob' });
        const url = URL.createObjectURL(zipBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${baseName}-all-pages.zip`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 5000);

        splitProgressBar.style.width = '100%';
        splitProgressText.textContent = 'ZIP download started!';
        window.showToast(`All ${total} pages exported to ZIP!`, 'success');
      } catch (err) {
        console.error('ZIP split error:', err);
        window.showToast('Failed to export pages to ZIP: ' + err.message, 'error');
      } finally {
        splitZipBtn.disabled = false;
        setTimeout(() => splitProgress.classList.add('hidden'), 2500);
      }
    });
  }

  // ==================== TAB B: IMAGES TO PDF ====================
  const imgDropZone = document.getElementById('img-dropzone');
  const imgFileInput = document.getElementById('img-file-input');
  const imgListEl = document.getElementById('img-list');
  const imgEmptyState = document.getElementById('img-empty-state');
  const imgConvertBtn = document.getElementById('img-convert-btn');
  const imgClearBtn = document.getElementById('img-clear-btn');
  const pageSizeSelect = document.getElementById('page-size-select');
  const pageMarginSelect = document.getElementById('page-margin-select');
  const pageOrientSelect = document.getElementById('page-orient-select');
  const sampleImagesBtn = document.getElementById('load-sample-images-pdf-btn');

  let imageFiles = []; // Array of { id, file, name, size, dataUrl, width, height }

  if (imgDropZone && imgFileInput) {
    window.setupDropZone(imgDropZone, imgFileInput, handleImagesSelected);
  }

  if (sampleImagesBtn) {
    sampleImagesBtn.addEventListener('click', async (e) => {
      e.stopPropagation();
      try {
        window.showToast('Generating 3 sample slides in memory...', 'info');
        const colors = [
          { bg: '#4f46e5', title: 'Slide 1: Executive Overview' },
          { bg: '#0891b2', title: 'Slide 2: Data & Analytics' },
          { bg: '#059669', title: 'Slide 3: Conclusions & Next Steps' }
        ];
        for (let i = 0; i < colors.length; i++) {
          const c = document.createElement('canvas');
          c.width = 1200;
          c.height = 800;
          const ctx = c.getContext('2d');
          ctx.fillStyle = colors[i].bg;
          ctx.fillRect(0, 0, 1200, 800);
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 48px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(colors[i].title, 600, 380);
          ctx.font = '24px sans-serif';
          ctx.fillText('MultiTools Hub Images-to-PDF Test Page', 600, 440);
          const dataUrl = c.toDataURL('image/jpeg', 0.9);
          imageFiles.push({
            id: 'sample_img_' + (i + 1),
            file: { name: `slide_${i + 1}.jpg`, size: Math.round(dataUrl.length * 0.75) },
            name: `slide_${i + 1}.jpg`,
            size: Math.round(dataUrl.length * 0.75),
            dataUrl,
            width: 1200,
            height: 800
          });
        }
        renderImageList();
        window.showToast('3 Sample slides loaded! Click "Compile & Download PDF".', 'success');
      } catch (err) {
        console.error(err);
        window.showToast('Failed to generate sample images', 'error');
      }
    });
  }

  async function handleImagesSelected(files) {
    const validFiles = Array.from(files).filter(f => f.type.startsWith('image/'));
    if (validFiles.length === 0) {
      window.showToast('Please upload image files (JPG, PNG, WEBP)', 'error');
      return;
    }

    window.showToast(`Loading ${validFiles.length} image(s)...`, 'info');

    for (const file of validFiles) {
      const fileId = 'img_' + Math.random().toString(36).substr(2, 9);
      try {
        const dataUrl = await readFileAsDataURL(file);
        const dims = await getImageDimensions(dataUrl);

        imageFiles.push({
          id: fileId,
          file,
          name: file.name,
          size: file.size,
          dataUrl,
          width: dims.width,
          height: dims.height
        });
      } catch (err) {
        console.error('Error loading image:', err);
      }
    }

    renderImageList();
    imgFileInput.value = '';
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
      img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
      img.onerror = () => resolve({ width: 800, height: 600 });
      img.src = dataUrl;
    });
  }

  function renderImageList() {
    if (imageFiles.length === 0) {
      imgEmptyState.classList.remove('hidden');
      imgListEl.classList.add('hidden');
      imgConvertBtn.disabled = true;
      if (imgClearBtn) imgClearBtn.disabled = true;
      return;
    }

    imgEmptyState.classList.add('hidden');
    imgListEl.classList.remove('hidden');
    imgConvertBtn.disabled = false;
    if (imgClearBtn) imgClearBtn.disabled = false;

    imgListEl.innerHTML = '';
    imageFiles.forEach((item, index) => {
      const card = document.createElement('div');
      card.className = 'flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700/80 gap-3';
      card.innerHTML = `
        <div class="flex items-center gap-3 min-w-0 flex-1">
          <div class="w-12 h-12 rounded-lg bg-slate-200 dark:bg-slate-700 overflow-hidden flex-shrink-0 flex items-center justify-center">
            <img src="${item.dataUrl}" alt="${escapeHtml(item.name)}" class="w-full h-full object-cover">
          </div>
          <div class="min-w-0 flex-1">
            <p class="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">${escapeHtml(item.name)}</p>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">${item.width} × ${item.height} px • ${window.formatBytes(item.size)}</p>
          </div>
        </div>
        <div class="flex items-center gap-1">
          <button type="button" class="p-1.5 text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors ${index === 0 ? 'opacity-30 cursor-not-allowed' : ''}" ${index === 0 ? 'disabled' : ''} onclick="window.imgMove(${index}, -1)">
            <i data-lucide="arrow-up" class="w-4 h-4"></i>
          </button>
          <button type="button" class="p-1.5 text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors ${index === imageFiles.length - 1 ? 'opacity-30 cursor-not-allowed' : ''}" ${index === imageFiles.length - 1 ? 'disabled' : ''} onclick="window.imgMove(${index}, 1)">
            <i data-lucide="arrow-down" class="w-4 h-4"></i>
          </button>
          <button type="button" class="p-1.5 text-rose-500 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors" onclick="window.imgRemove(${index})">
            <i data-lucide="trash-2" class="w-4 h-4"></i>
          </button>
        </div>
      `;
      imgListEl.appendChild(card);
    });

    if (window.lucide) window.lucide.createIcons();
  }

  window.imgMove = function (index, dir) {
    const target = index + dir;
    if (target < 0 || target >= imageFiles.length) return;
    const temp = imageFiles[index];
    imageFiles[index] = imageFiles[target];
    imageFiles[target] = temp;
    renderImageList();
  };

  window.imgRemove = function (index) {
    imageFiles.splice(index, 1);
    renderImageList();
    window.showToast('Image removed', 'info');
  };

  if (imgClearBtn) {
    imgClearBtn.addEventListener('click', () => {
      imageFiles = [];
      renderImageList();
      window.showToast('Images cleared', 'info');
    });
  }

  if (imgConvertBtn) {
    imgConvertBtn.addEventListener('click', async () => {
      if (imageFiles.length === 0) return;
      if (!window.PDFLib) {
        window.showToast('PDF Library loading...', 'error');
        return;
      }

      imgConvertBtn.disabled = true;
      window.showToast('Generating PDF from images...', 'info');

      try {
        const pdfDoc = await window.PDFLib.PDFDocument.create();
        const pageSizeChoice = pageSizeSelect ? pageSizeSelect.value : 'a4';
        const marginChoice = pageMarginSelect ? pageMarginSelect.value : 'small';
        const orientChoice = pageOrientSelect ? pageOrientSelect.value : 'auto';

        let marginPts = 0;
        if (marginChoice === 'small') marginPts = 28; // ~10mm
        else if (marginChoice === 'normal') marginPts = 56; // ~20mm

        for (const item of imageFiles) {
          // Normalize image to JPEG Uint8Array via Canvas for universal pdf-lib embedding
          const jpegBytes = await convertImageToJpegBytes(item.dataUrl);
          const embeddedImage = await pdfDoc.embedJpg(jpegBytes);

          let pageWidth, pageHeight;

          if (pageSizeChoice === 'fit') {
            pageWidth = embeddedImage.width + marginPts * 2;
            pageHeight = embeddedImage.height + marginPts * 2;
          } else if (pageSizeChoice === 'letter') {
            pageWidth = 612; // 8.5 in * 72 pt
            pageHeight = 792; // 11 in * 72 pt
          } else {
            // A4 default (595.28 x 841.89 pt)
            pageWidth = 595.28;
            pageHeight = 841.89;
          }

          // Apply orientation
          const isLandscapeImg = embeddedImage.width > embeddedImage.height;
          if (orientChoice === 'landscape' || (orientChoice === 'auto' && isLandscapeImg && pageSizeChoice !== 'fit')) {
            if (pageWidth < pageHeight) {
              const temp = pageWidth;
              pageWidth = pageHeight;
              pageHeight = temp;
            }
          } else if (orientChoice === 'portrait') {
            if (pageWidth > pageHeight) {
              const temp = pageWidth;
              pageWidth = pageHeight;
              pageHeight = temp;
            }
          }

          const page = pdfDoc.addPage([pageWidth, pageHeight]);

          const availWidth = pageWidth - marginPts * 2;
          const availHeight = pageHeight - marginPts * 2;

          const scaleFactor = Math.min(availWidth / embeddedImage.width, availHeight / embeddedImage.height);
          const drawWidth = embeddedImage.width * scaleFactor;
          const drawHeight = embeddedImage.height * scaleFactor;

          const x = marginPts + (availWidth - drawWidth) / 2;
          const y = marginPts + (availHeight - drawHeight) / 2;

          page.drawImage(embeddedImage, {
            x,
            y,
            width: drawWidth,
            height: drawHeight
          });
        }

        const pdfBytes = await pdfDoc.save();
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `images-to-pdf-${Date.now()}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 5000);

        window.showToast(`Converted ${imageFiles.length} image(s) to PDF!`, 'success');
      } catch (err) {
        console.error('Image to PDF error:', err);
        window.showToast('Failed to convert images: ' + err.message, 'error');
      } finally {
        imgConvertBtn.disabled = false;
      }
    });
  }

  function convertImageToJpegBytes(dataUrl) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');
        // white background for transparency in PNG/WEBP
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);

        canvas.toBlob((blob) => {
          if (!blob) {
            reject(new Error('Canvas toBlob failed'));
            return;
          }
          const reader = new FileReader();
          reader.onload = () => resolve(new Uint8Array(reader.result));
          reader.onerror = reject;
          reader.readAsArrayBuffer(blob);
        }, 'image/jpeg', 0.92);
      };
      img.onerror = reject;
      img.src = dataUrl;
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
