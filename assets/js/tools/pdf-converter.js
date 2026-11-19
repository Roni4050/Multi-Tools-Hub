/**
 * All-in-One PDF Converter Studio
 * Client-Side Image/SVG to PDF, PDF to Image/SVG, and PDF to Text/Markdown
 * Powered by pdf-lib, Mozilla PDF.js, and JSZip
 */

document.addEventListener('DOMContentLoaded', () => {
  // Ensure Lucide icons render
  if (window.lucide) window.lucide.createIcons();

  // Tab switching logic
  const tabBtnImg2Pdf = document.getElementById('tab-btn-img2pdf');
  const tabBtnPdf2Img = document.getElementById('tab-btn-pdf2img');
  const tabBtnPdf2Txt = document.getElementById('tab-btn-pdf2txt');

  const panelImg2Pdf = document.getElementById('panel-img2pdf');
  const panelPdf2Img = document.getElementById('panel-pdf2img');
  const panelPdf2Txt = document.getElementById('panel-pdf2txt');

  function switchTab(activeBtn, activePanel) {
    [tabBtnImg2Pdf, tabBtnPdf2Img, tabBtnPdf2Txt].forEach(btn => {
      btn.classList.remove('bg-white', 'dark:bg-slate-900', 'shadow-sm', 'text-indigo-600', 'dark:text-indigo-400');
      btn.classList.add('text-slate-600', 'dark:text-slate-400');
    });
    activeBtn.classList.add('bg-white', 'dark:bg-slate-900', 'shadow-sm', 'text-indigo-600', 'dark:text-indigo-400');
    activeBtn.classList.remove('text-slate-600', 'dark:text-slate-400');

    [panelImg2Pdf, panelPdf2Img, panelPdf2Txt].forEach(panel => panel.classList.add('hidden'));
    activePanel.classList.remove('hidden');

    if (window.lucide) window.lucide.createIcons();
  }

  if (tabBtnImg2Pdf && panelImg2Pdf) tabBtnImg2Pdf.addEventListener('click', () => switchTab(tabBtnImg2Pdf, panelImg2Pdf));
  if (tabBtnPdf2Img && panelPdf2Img) tabBtnPdf2Img.addEventListener('click', () => switchTab(tabBtnPdf2Img, panelPdf2Img));
  if (tabBtnPdf2Txt && panelPdf2Txt) tabBtnPdf2Txt.addEventListener('click', () => switchTab(tabBtnPdf2Txt, panelPdf2Txt));

  // =========================================================================
  // TAB 1: IMAGES & SVG TO PDF CONVERTER
  // =========================================================================
  const imgDropZone = document.getElementById('img2pdf-dropzone');
  const imgFileInput = document.getElementById('img2pdf-file-input');
  const imgSampleBtn = document.getElementById('img2pdf-sample-btn');
  const imgListEl = document.getElementById('img2pdf-file-list');
  const imgEmptyState = document.getElementById('img2pdf-empty-state');
  const imgStatsEl = document.getElementById('img2pdf-stats');
  const imgClearBtn = document.getElementById('img2pdf-clear-btn');
  const imgCompileBtn = document.getElementById('img2pdf-compile-btn');
  const imgProgress = document.getElementById('img2pdf-progress');
  const imgProgressBar = document.getElementById('img2pdf-progress-bar');
  const imgProgressText = document.getElementById('img2pdf-progress-text');

  const pageSizeSelect = document.getElementById('pdf-page-size');
  const orientationSelect = document.getElementById('pdf-orientation');
  const marginSelect = document.getElementById('pdf-margin');

  let queuedItems = []; // Array of { id, name, size, type, dataUrl, width, height, isSvg, svgCode }

  if (imgDropZone && imgFileInput) {
    window.setupDropZone(imgDropZone, imgFileInput, handleFilesSelected);
  }

  async function handleFilesSelected(files) {
    const validFiles = Array.from(files).filter(f => 
      f.type.startsWith('image/') || 
      f.name.toLowerCase().endsWith('.svg') ||
      f.name.toLowerCase().endsWith('.png') ||
      f.name.toLowerCase().endsWith('.jpg') ||
      f.name.toLowerCase().endsWith('.jpeg') ||
      f.name.toLowerCase().endsWith('.webp')
    );

    if (validFiles.length === 0) {
      window.showToast('Please upload valid image or SVG files', 'error');
      return;
    }

    window.showToast(`Loading ${validFiles.length} file(s)...`, 'info');

    for (const file of validFiles) {
      await processImageOrSvg(file);
    }

    renderImgList();
    if (imgFileInput) imgFileInput.value = '';
  }

  function processImageOrSvg(file) {
    return new Promise((resolve) => {
      const isSvg = file.type === 'image/svg+xml' || file.name.toLowerCase().endsWith('.svg');
      const reader = new FileReader();

      reader.onload = async (e) => {
        const id = 'item_' + Math.random().toString(36).substr(2, 9);
        if (isSvg) {
          const svgCode = e.target.result;
          // High-DPI rasterization preview for SVG
          const raster = await rasterizeSvg(svgCode, 1200);
          queuedItems.push({
            id,
            name: file.name,
            size: file.size,
            type: 'image/svg+xml',
            dataUrl: raster.dataUrl,
            width: raster.width,
            height: raster.height,
            isSvg: true,
            svgCode: svgCode
          });
        } else {
          const dataUrl = e.target.result;
          const img = new Image();
          img.onload = () => {
            queuedItems.push({
              id,
              name: file.name,
              size: file.size,
              type: file.type || 'image/png',
              dataUrl: dataUrl,
              width: img.naturalWidth || 800,
              height: img.naturalHeight || 600,
              isSvg: false
            });
            resolve();
          };
          img.onerror = () => resolve();
          img.src = dataUrl;
          return;
        }
        resolve();
      };

      if (isSvg) {
        reader.readAsText(file);
      } else {
        reader.readAsDataURL(file);
      }
    });
  }

  function rasterizeSvg(svgString, targetWidth = 1200) {
    return new Promise((resolve) => {
      const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const img = new Image();
      img.onload = () => {
        const aspect = (img.naturalWidth || 800) / (img.naturalHeight || 800);
        const w = targetWidth;
        const h = Math.round(targetWidth / aspect);

        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, w, h);
        ctx.drawImage(img, 0, 0, w, h);

        URL.revokeObjectURL(url);
        resolve({
          dataUrl: canvas.toDataURL('image/png'),
          width: w,
          height: h
        });
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        resolve({
          dataUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAA',
          width: 800,
          height: 600
        });
      };
      img.src = url;
    });
  }

  function renderImgList() {
    if (queuedItems.length === 0) {
      imgEmptyState.classList.remove('hidden');
      imgListEl.classList.add('hidden');
      imgCompileBtn.disabled = true;
      imgClearBtn.disabled = true;
      if (imgStatsEl) imgStatsEl.textContent = '0 items queued';
      return;
    }

    imgEmptyState.classList.add('hidden');
    imgListEl.classList.remove('hidden');
    imgCompileBtn.disabled = false;
    imgClearBtn.disabled = false;
    if (imgStatsEl) imgStatsEl.textContent = `${queuedItems.length} item(s) ready to compile`;

    imgListEl.innerHTML = '';
    queuedItems.forEach((item, index) => {
      const row = document.createElement('div');
      row.className = 'flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700/80 transition-all hover:border-indigo-400';
      row.innerHTML = `
        <div class="flex items-center gap-3 min-w-0 flex-1 mr-3">
          <span class="w-6 h-6 rounded-md bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold text-xs flex items-center justify-center flex-shrink-0">
            ${index + 1}
          </span>
          <img src="${item.dataUrl}" alt="${escapeHtml(item.name)}" class="w-10 h-10 rounded-lg object-cover border border-slate-200 dark:border-slate-700 shadow-sm flex-shrink-0">
          <div class="min-w-0 flex-1">
            <p class="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">${escapeHtml(item.name)}</p>
            <div class="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
              <span>${window.formatBytes(item.size)}</span>
              <span>•</span>
              <span class="font-mono text-indigo-600 dark:text-indigo-400">${item.width} × ${item.height} px</span>
              ${item.isSvg ? '<span class="px-1.5 py-0.2 rounded text-[10px] bg-violet-100 dark:bg-violet-950/80 text-violet-700 dark:text-violet-300 font-bold">Vector SVG</span>' : ''}
            </div>
          </div>
        </div>
        <div class="flex items-center gap-1">
          <button type="button" class="p-1.5 text-slate-500 hover:text-indigo-600 dark:text-slate-400 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors ${index === 0 ? 'opacity-30 cursor-not-allowed' : ''}" title="Move Up" ${index === 0 ? 'disabled' : ''} onclick="window.pdfConvMove(${index}, -1)">
            <i data-lucide="arrow-up" class="w-4 h-4"></i>
          </button>
          <button type="button" class="p-1.5 text-slate-500 hover:text-indigo-600 dark:text-slate-400 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors ${index === queuedItems.length - 1 ? 'opacity-30 cursor-not-allowed' : ''}" title="Move Down" ${index === queuedItems.length - 1 ? 'disabled' : ''} onclick="window.pdfConvMove(${index}, 1)">
            <i data-lucide="arrow-down" class="w-4 h-4"></i>
          </button>
          <button type="button" class="p-1.5 text-rose-500 hover:text-rose-700 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors" title="Remove" onclick="window.pdfConvRemove(${index})">
            <i data-lucide="trash-2" class="w-4 h-4"></i>
          </button>
        </div>
      `;
      imgListEl.appendChild(row);
    });

    if (window.lucide) window.lucide.createIcons();
  }

  window.pdfConvMove = function (index, direction) {
    const target = index + direction;
    if (target < 0 || target >= queuedItems.length) return;
    const temp = queuedItems[index];
    queuedItems[index] = queuedItems[target];
    queuedItems[target] = temp;
    renderImgList();
  };

  window.pdfConvRemove = function (index) {
    queuedItems.splice(index, 1);
    renderImgList();
  };

  if (imgClearBtn) {
    imgClearBtn.addEventListener('click', () => {
      queuedItems = [];
      renderImgList();
      window.showToast('Cleared all items', 'info');
    });
  }

  // Load Demo Images & SVG
  if (imgSampleBtn) {
    imgSampleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      // Slide 1 Canvas
      const c1 = document.createElement('canvas');
      c1.width = 1200;
      c1.height = 800;
      const ctx1 = c1.getContext('2d');
      const g1 = ctx1.createLinearGradient(0, 0, 1200, 800);
      g1.addColorStop(0, '#4f46e5');
      g1.addColorStop(1, '#7c3aed');
      ctx1.fillStyle = g1;
      ctx1.fillRect(0, 0, 1200, 800);
      ctx1.fillStyle = '#ffffff';
      ctx1.font = 'bold 52px sans-serif';
      ctx1.textAlign = 'center';
      ctx1.fillText('Page 1: Project Overview & Strategy', 600, 380);
      ctx1.font = '28px sans-serif';
      ctx1.fillText('Client Presentation Document • MultiTools Hub', 600, 440);
      const url1 = c1.toDataURL('image/jpeg', 0.9);

      // Slide 2 Canvas
      const c2 = document.createElement('canvas');
      c2.width = 1200;
      c2.height = 800;
      const ctx2 = c2.getContext('2d');
      const g2 = ctx2.createLinearGradient(0, 0, 1200, 800);
      g2.addColorStop(0, '#0284c7');
      g2.addColorStop(1, '#059669');
      ctx2.fillStyle = g2;
      ctx2.fillRect(0, 0, 1200, 800);
      ctx2.fillStyle = '#ffffff';
      ctx2.font = 'bold 52px sans-serif';
      ctx2.textAlign = 'center';
      ctx2.fillText('Page 2: Quarterly Performance Metrics', 600, 380);
      ctx2.font = '28px sans-serif';
      ctx2.fillText('+148% Growth in Creator Productivity', 600, 440);
      const url2 = c2.toDataURL('image/jpeg', 0.9);

      // SVG Badge
      const sampleSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600">
        <rect width="800" height="600" fill="#0f172a"/>
        <circle cx="400" cy="300" r="180" fill="#6366f1" opacity="0.8"/>
        <polygon points="400,180 435,260 520,265 455,320 475,405 400,360 325,405 345,320 280,265 365,260" fill="#fbbf24"/>
        <text x="400" y="470" fill="#ffffff" font-size="32" font-family="sans-serif" font-weight="bold" text-anchor="middle">Page 3: Certified Vector Emblem (SVG)</text>
      </svg>`;

      rasterizeSvg(sampleSvg, 1200).then(raster => {
        queuedItems.push({
          id: 'demo_1',
          name: '01_Strategy_Overview.jpg',
          size: Math.round(url1.length * 0.75),
          type: 'image/jpeg',
          dataUrl: url1,
          width: 1200,
          height: 800,
          isSvg: false
        });
        queuedItems.push({
          id: 'demo_2',
          name: '02_Performance_Metrics.jpg',
          size: Math.round(url2.length * 0.75),
          type: 'image/jpeg',
          dataUrl: url2,
          width: 1200,
          height: 800,
          isSvg: false
        });
        queuedItems.push({
          id: 'demo_3',
          name: '03_Vector_Certificate.svg',
          size: 1540,
          type: 'image/svg+xml',
          dataUrl: raster.dataUrl,
          width: raster.width,
          height: raster.height,
          isSvg: true,
          svgCode: sampleSvg
        });

        renderImgList();
        window.showToast('Demo slides & vector badge loaded! Click Compile.', 'success');
      });
    });
  }

  // Compile & Download PDF
  if (imgCompileBtn) {
    imgCompileBtn.addEventListener('click', async () => {
      if (queuedItems.length === 0) return;
      if (!window.PDFLib) {
        window.showToast('PDF engine initializing, please retry...', 'info');
        return;
      }

      imgCompileBtn.disabled = true;
      imgProgress.classList.remove('hidden');
      imgProgressBar.style.width = '10%';
      imgProgressText.textContent = 'Initializing PDF document...';

      try {
        const pdfDoc = await window.PDFLib.PDFDocument.create();
        const pageSize = pageSizeSelect.value;
        const orientation = orientationSelect.value;
        const marginPx = marginSelect.value === 'none' ? 0 : marginSelect.value === 'medium' ? 40 : 20;

        for (let i = 0; i < queuedItems.length; i++) {
          const item = queuedItems[i];
          const pct = Math.round(10 + ((i + 1) / queuedItems.length) * 80);
          imgProgressBar.style.width = `${pct}%`;
          imgProgressText.textContent = `Embedding item ${i + 1} of ${queuedItems.length}: ${item.name}`;

          // Embed image into pdf-lib
          let embeddedImg;
          if (item.dataUrl.startsWith('data:image/jpeg') || item.dataUrl.startsWith('data:image/jpg')) {
            const bytes = dataUrlToUint8Array(item.dataUrl);
            embeddedImg = await pdfDoc.embedJpg(bytes);
          } else {
            // PNG, WebP or rasterized SVG
            const bytes = dataUrlToUint8Array(item.dataUrl);
            embeddedImg = await pdfDoc.embedPng(bytes);
          }

          // Compute page size
          let pageW, pageH;
          if (pageSize === 'fit') {
            pageW = item.width;
            pageH = item.height;
          } else if (pageSize === 'letter') {
            pageW = 612;
            pageH = 792;
          } else {
            // A4
            pageW = 595.28;
            pageH = 841.89;
          }

          // Swap if landscape
          if (orientation === 'landscape' && pageSize !== 'fit') {
            const temp = pageW;
            pageW = pageH;
            pageH = temp;
          }

          const page = pdfDoc.addPage([pageW, pageH]);

          // Scale image to fit inside margins
          const printableW = pageW - (marginPx * 2);
          const printableH = pageH - (marginPx * 2);

          const imgRatio = item.width / item.height;
          const targetRatio = printableW / printableH;

          let drawW, drawH;
          if (imgRatio > targetRatio) {
            drawW = printableW;
            drawH = printableW / imgRatio;
          } else {
            drawH = printableH;
            drawW = printableH * imgRatio;
          }

          const drawX = marginPx + ((printableW - drawW) / 2);
          const drawY = marginPx + ((printableH - drawH) / 2);

          page.drawImage(embeddedImg, {
            x: drawX,
            y: drawY,
            width: drawW,
            height: drawH
          });
        }

        imgProgressBar.style.width = '100%';
        imgProgressText.textContent = 'Finalizing PDF...';

        const pdfBytes = await pdfDoc.save();
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `converted-document-${Date.now()}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        setTimeout(() => URL.revokeObjectURL(url), 5000);
        window.showToast('PDF compiled & downloaded successfully!', 'success');
      } catch (err) {
        console.error('PDF Compile Error:', err);
        window.showToast('Failed to compile PDF: ' + err.message, 'error');
      } finally {
        imgCompileBtn.disabled = false;
        setTimeout(() => imgProgress.classList.add('hidden'), 2000);
      }
    });
  }

  // =========================================================================
  // TAB 2: PDF TO IMAGES / SVG CONVERTER
  // =========================================================================
  const pdf2ImgDropZone = document.getElementById('pdf2img-dropzone');
  const pdf2ImgFileInput = document.getElementById('pdf2img-file-input');
  const pdf2ImgSampleBtn = document.getElementById('pdf2img-sample-btn');
  const pdf2ImgWorkspace = document.getElementById('pdf2img-workspace');
  const pdf2ImgFileName = document.getElementById('pdf2img-filename');
  const pdf2ImgFileMeta = document.getElementById('pdf2img-filemeta');
  const pdf2ImgResetBtn = document.getElementById('pdf2img-reset-btn');
  const pdf2ImgFormatSelect = document.getElementById('pdf2img-format-select');
  const pdf2ImgScaleSelect = document.getElementById('pdf2img-scale-select');
  const pdf2ImgQuality = document.getElementById('pdf2img-quality');
  const pdf2ImgQualityVal = document.getElementById('pdf2img-quality-val');
  const pdf2ImgDownloadZipBtn = document.getElementById('pdf2img-download-zip-btn');
  const pdf2ImgPagesGrid = document.getElementById('pdf2img-pages-grid');
  const pdf2ImgProgress = document.getElementById('pdf2img-progress');
  const pdf2ImgProgressBar = document.getElementById('pdf2img-progress-bar');
  const pdf2ImgProgressText = document.getElementById('pdf2img-progress-text');
  const pdf2ImgPageCountBadge = document.getElementById('pdf2img-page-count-badge');

  let currentPdfDoc = null; // PDFDocumentProxy
  let currentPdfBuffer = null;
  let currentPdfName = 'document.pdf';
  let renderedPageCanvases = []; // Array of { pageNum, canvas, width, height }

  if (pdf2ImgQuality && pdf2ImgQualityVal) {
    pdf2ImgQuality.addEventListener('input', (e) => {
      pdf2ImgQualityVal.textContent = `${e.target.value}%`;
    });
  }

  if (pdf2ImgDropZone && pdf2ImgFileInput) {
    window.setupDropZone(pdf2ImgDropZone, pdf2ImgFileInput, (files) => {
      const file = files[0];
      if (!file || (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf')) {
        window.showToast('Please upload a valid PDF document', 'error');
        return;
      }
      loadPdfDocument(file);
    });
  }

  async function loadPdfDocument(file) {
    try {
      currentPdfName = file.name;
      const arrayBuffer = await file.arrayBuffer();
      currentPdfBuffer = arrayBuffer;
      await renderPdfPages(arrayBuffer, file.name, file.size);
    } catch (err) {
      console.error('Error loading PDF:', err);
      window.showToast('Failed to open PDF document', 'error');
    }
  }

  async function renderPdfPages(arrayBuffer, name, size) {
    if (!window.pdfjsLib) {
      window.showToast('PDF.js renderer loading, please wait...', 'info');
      return;
    }

    pdf2ImgProgress.classList.remove('hidden');
    pdf2ImgProgressBar.style.width = '15%';
    pdf2ImgProgressText.textContent = 'Parsing PDF structure...';

    try {
      const loadingTask = window.pdfjsLib.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      currentPdfDoc = pdf;

      pdf2ImgFileName.textContent = name;
      pdf2ImgFileMeta.textContent = `${pdf.numPages} pages • ${window.formatBytes(size || arrayBuffer.byteLength)}`;
      if (pdf2ImgPageCountBadge) pdf2ImgPageCountBadge.textContent = `Showing ${pdf.numPages} page(s)`;

      pdf2ImgDropZone.classList.add('hidden');
      pdf2ImgWorkspace.classList.remove('hidden');
      pdf2ImgPagesGrid.innerHTML = '';
      renderedPageCanvases = [];

      const scale = parseFloat(pdf2ImgScaleSelect.value) || 2;

      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const pct = Math.round(15 + (pageNum / pdf.numPages) * 80);
        pdf2ImgProgressBar.style.width = `${pct}%`;
        pdf2ImgProgressText.textContent = `Rendering page ${pageNum} of ${pdf.numPages}...`;

        const page = await pdf.getPage(pageNum);
        const viewport = page.getViewport({ scale: scale });

        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext('2d');

        await page.render({
          canvasContext: ctx,
          viewport: viewport
        }).promise;

        renderedPageCanvases.push({
          pageNum,
          canvas,
          width: viewport.width,
          height: viewport.height
        });

        // Create UI Card for Page
        const card = document.createElement('div');
        card.className = 'p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 space-y-3';
        card.innerHTML = `
          <div class="flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-300">
            <span>Page ${pageNum}</span>
            <span class="font-mono text-indigo-600 dark:text-indigo-400">${viewport.width} × ${viewport.height} px</span>
          </div>
          <div class="rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 bg-white flex items-center justify-center max-h-72">
            <img src="${canvas.toDataURL('image/jpeg', 0.85)}" alt="Page ${pageNum}" class="w-full h-auto object-contain">
          </div>
          <button type="button" class="w-full py-2 px-3 rounded-lg bg-white dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5" onclick="window.downloadSinglePdfPage(${pageNum})">
            <i data-lucide="download" class="w-3.5 h-3.5"></i>
            <span>Download Page ${pageNum}</span>
          </button>
        `;
        pdf2ImgPagesGrid.appendChild(card);
      }

      if (window.lucide) window.lucide.createIcons();
      window.showToast(`Rendered ${pdf.numPages} pages successfully!`, 'success');
    } catch (err) {
      console.error('PDF render error:', err);
      window.showToast('Error rendering PDF: ' + err.message, 'error');
    } finally {
      pdf2ImgProgressBar.style.width = '100%';
      setTimeout(() => pdf2ImgProgress.classList.add('hidden'), 1000);
    }
  }

  // Handle format change or scale change re-render
  if (pdf2ImgScaleSelect) {
    pdf2ImgScaleSelect.addEventListener('change', () => {
      if (currentPdfBuffer) {
        renderPdfPages(currentPdfBuffer, currentPdfName, currentPdfBuffer.byteLength);
      }
    });
  }

  // Download Single Page
  window.downloadSinglePdfPage = function (pageNum) {
    const item = renderedPageCanvases.find(p => p.pageNum === pageNum);
    if (!item) return;

    const format = pdf2ImgFormatSelect.value;
    const quality = (parseFloat(pdf2ImgQuality.value) || 90) / 100;
    const baseName = currentPdfName.replace(/\.[^/.]+$/, '');

    if (format === 'svg') {
      const pngUrl = item.canvas.toDataURL('image/png');
      const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${item.width}" height="${item.height}" viewBox="0 0 ${item.width} ${item.height}">
  <image href="${pngUrl}" width="${item.width}" height="${item.height}"/>
</svg>`;
      const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
      downloadBlob(blob, `${baseName}-page-${pageNum}.svg`);
    } else {
      const mime = format === 'png' ? 'image/png' : format === 'webp' ? 'image/webp' : 'image/jpeg';
      const ext = format === 'jpeg' ? 'jpg' : format;
      item.canvas.toBlob((blob) => {
        downloadBlob(blob, `${baseName}-page-${pageNum}.${ext}`);
      }, mime, quality);
    }
  };

  // Download All Pages as ZIP
  if (pdf2ImgDownloadZipBtn) {
    pdf2ImgDownloadZipBtn.addEventListener('click', async () => {
      if (renderedPageCanvases.length === 0) return;
      if (!window.JSZip) {
        window.showToast('ZIP packager not ready', 'error');
        return;
      }

      pdf2ImgDownloadZipBtn.disabled = true;
      pdf2ImgProgress.classList.remove('hidden');
      pdf2ImgProgressBar.style.width = '20%';
      pdf2ImgProgressText.textContent = 'Packaging pages into ZIP archive...';

      try {
        const zip = new window.JSZip();
        const format = pdf2ImgFormatSelect.value;
        const quality = (parseFloat(pdf2ImgQuality.value) || 90) / 100;
        const baseName = currentPdfName.replace(/\.[^/.]+$/, '');

        for (let i = 0; i < renderedPageCanvases.length; i++) {
          const item = renderedPageCanvases[i];
          const pct = Math.round(20 + ((i + 1) / renderedPageCanvases.length) * 75);
          pdf2ImgProgressBar.style.width = `${pct}%`;
          pdf2ImgProgressText.textContent = `Compressing page ${item.pageNum} of ${renderedPageCanvases.length}...`;

          if (format === 'svg') {
            const pngUrl = item.canvas.toDataURL('image/png');
            const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${item.width}" height="${item.height}" viewBox="0 0 ${item.width} ${item.height}">
  <image href="${pngUrl}" width="${item.width}" height="${item.height}"/>
</svg>`;
            zip.file(`${baseName}-page-${item.pageNum}.svg`, svgContent);
          } else {
            const mime = format === 'png' ? 'image/png' : format === 'webp' ? 'image/webp' : 'image/jpeg';
            const ext = format === 'jpeg' ? 'jpg' : format;
            const dataUrl = item.canvas.toDataURL(mime, quality);
            const base64Data = dataUrl.split(',')[1];
            zip.file(`${baseName}-page-${item.pageNum}.${ext}`, base64Data, { base64: true });
          }
        }

        const zipBlob = await zip.generateAsync({ type: 'blob' });
        downloadBlob(zipBlob, `${baseName}-converted-images.zip`);
        window.showToast(`Exported ${renderedPageCanvases.length} pages as ZIP!`, 'success');
      } catch (err) {
        console.error('ZIP Error:', err);
        window.showToast('Failed to create ZIP: ' + err.message, 'error');
      } finally {
        pdf2ImgDownloadZipBtn.disabled = false;
        setTimeout(() => pdf2ImgProgress.classList.add('hidden'), 1500);
      }
    });
  }

  if (pdf2ImgResetBtn) {
    pdf2ImgResetBtn.addEventListener('click', () => {
      currentPdfDoc = null;
      currentPdfBuffer = null;
      renderedPageCanvases = [];
      pdf2ImgFileInput.value = '';
      pdf2ImgWorkspace.classList.add('hidden');
      pdf2ImgDropZone.classList.remove('hidden');
    });
  }

  // Load Demo 3-Page Presentation PDF
  if (pdf2ImgSampleBtn) {
    pdf2ImgSampleBtn.addEventListener('click', async (e) => {
      e.stopPropagation();
      if (!window.PDFLib) {
        window.showToast('PDF engine initializing, please retry...', 'info');
        return;
      }
      try {
        window.showToast('Generating 3-page sample PDF presentation...', 'info');
        const pdfDoc = await window.PDFLib.PDFDocument.create();

        // Slide 1
        const p1 = pdfDoc.addPage([842, 595]); // Landscape A4
        p1.drawText('MultiTools Hub - Creator Studio', { x: 60, y: 500, size: 32 });
        p1.drawText('Page 1: Full-Stack Client-Side Utilities for Modern Creators', { x: 60, y: 440, size: 18 });
        p1.drawText('All processing happens 100% inside your web browser with zero server uploads.', { x: 60, y: 390, size: 14 });

        // Slide 2
        const p2 = pdfDoc.addPage([842, 595]);
        p2.drawText('Key Architectural Pillars', { x: 60, y: 500, size: 32 });
        p2.drawText('Page 2: 1. Zero Cloud Latency  •  2. Confidentiality  •  3. Unlimited Exports', { x: 60, y: 440, size: 18 });

        // Slide 3
        const p3 = pdfDoc.addPage([842, 595]);
        p3.drawText('Export Versatility', { x: 60, y: 500, size: 32 });
        p3.drawText('Page 3: Render pages into PNG, JPG, WebP, or standalone SVG containers.', { x: 60, y: 440, size: 18 });

        const bytes = await pdfDoc.save();
        currentPdfName = 'Sample_Creator_Presentation.pdf';
        currentPdfBuffer = bytes.buffer;
        await renderPdfPages(bytes.buffer, currentPdfName, bytes.byteLength);
      } catch (err) {
        console.error(err);
        window.showToast('Failed to load sample presentation', 'error');
      }
    });
  }

  // =========================================================================
  // TAB 3: PDF TO PLAIN TEXT & MARKDOWN EXTRACTOR
  // =========================================================================
  const pdf2TxtDropZone = document.getElementById('pdf2txt-dropzone');
  const pdf2TxtFileInput = document.getElementById('pdf2txt-file-input');
  const pdf2TxtSampleBtn = document.getElementById('pdf2txt-sample-btn');
  const pdf2TxtWorkspace = document.getElementById('pdf2txt-workspace');
  const pdf2TxtOutput = document.getElementById('pdf2txt-output');
  const pdf2TxtCounts = document.getElementById('pdf2txt-counts');
  const pdf2TxtCopyBtn = document.getElementById('pdf2txt-copy-btn');
  const pdf2TxtDownloadTxt = document.getElementById('pdf2txt-download-txt');
  const pdf2TxtDownloadMd = document.getElementById('pdf2txt-download-md');
  const pdf2TxtResetBtn = document.getElementById('pdf2txt-reset-btn');
  const pdf2TxtProgress = document.getElementById('pdf2txt-progress');
  const pdf2TxtProgressBar = document.getElementById('pdf2txt-progress-bar');
  const pdf2TxtProgressText = document.getElementById('pdf2txt-progress-text');

  let extractedDocName = 'document.pdf';

  if (pdf2TxtDropZone && pdf2TxtFileInput) {
    window.setupDropZone(pdf2TxtDropZone, pdf2TxtFileInput, async (files) => {
      const file = files[0];
      if (!file || (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf')) {
        window.showToast('Please upload a valid PDF document', 'error');
        return;
      }
      extractedDocName = file.name;
      const buffer = await file.arrayBuffer();
      extractTextFromPdf(buffer, file.name);
    });
  }

  async function extractTextFromPdf(arrayBuffer, name) {
    if (!window.pdfjsLib) {
      window.showToast('PDF.js text extractor initializing...', 'info');
      return;
    }

    pdf2TxtProgress.classList.remove('hidden');
    pdf2TxtProgressBar.style.width = '20%';
    pdf2TxtProgressText.textContent = 'Extracting text streams...';

    try {
      const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let fullMarkdown = `# Document: ${name}\n\n`;

      for (let i = 1; i <= pdf.numPages; i++) {
        const pct = Math.round(20 + (i / pdf.numPages) * 75);
        pdf2TxtProgressBar.style.width = `${pct}%`;
        pdf2TxtProgressText.textContent = `Reading page ${i} of ${pdf.numPages}...`;

        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        
        let pageText = '';
        let lastY;
        for (const item of textContent.items) {
          if (lastY !== undefined && Math.abs(item.transform[5] - lastY) > 5) {
            pageText += '\n';
          } else if (pageText.length > 0 && !pageText.endsWith(' ') && !pageText.endsWith('\n')) {
            pageText += ' ';
          }
          pageText += item.str;
          lastY = item.transform[5];
        }

        fullMarkdown += `## Page ${i}\n\n${pageText.trim()}\n\n---\n\n`;
      }

      pdf2TxtOutput.value = fullMarkdown.trim();
      updateTextCounts(pdf2TxtOutput.value);

      pdf2TxtDropZone.classList.add('hidden');
      pdf2TxtWorkspace.classList.remove('hidden');

      window.showToast(`Extracted text from ${pdf.numPages} pages!`, 'success');
    } catch (err) {
      console.error('Text extraction error:', err);
      window.showToast('Failed to extract text: ' + err.message, 'error');
    } finally {
      pdf2TxtProgressBar.style.width = '100%';
      setTimeout(() => pdf2TxtProgress.classList.add('hidden'), 1000);
    }
  }

  function updateTextCounts(text) {
    const chars = text.length;
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    if (pdf2TxtCounts) {
      pdf2TxtCounts.textContent = `${words.toLocaleString()} words • ${chars.toLocaleString()} characters`;
    }
  }

  if (pdf2TxtOutput) {
    pdf2TxtOutput.addEventListener('input', () => {
      updateTextCounts(pdf2TxtOutput.value);
    });
  }

  if (pdf2TxtCopyBtn) {
    pdf2TxtCopyBtn.addEventListener('click', () => {
      if (!pdf2TxtOutput.value) return;
      window.copyToClipboard(pdf2TxtOutput.value, 'Extracted text copied to clipboard!');
    });
  }

  if (pdf2TxtDownloadTxt) {
    pdf2TxtDownloadTxt.addEventListener('click', () => {
      if (!pdf2TxtOutput.value) return;
      const base = extractedDocName.replace(/\.[^/.]+$/, '');
      const blob = new Blob([pdf2TxtOutput.value], { type: 'text/plain;charset=utf-8' });
      downloadBlob(blob, `${base}-extracted.txt`);
      window.showToast('Downloaded .TXT file!', 'success');
    });
  }

  if (pdf2TxtDownloadMd) {
    pdf2TxtDownloadMd.addEventListener('click', () => {
      if (!pdf2TxtOutput.value) return;
      const base = extractedDocName.replace(/\.[^/.]+$/, '');
      const blob = new Blob([pdf2TxtOutput.value], { type: 'text/markdown;charset=utf-8' });
      downloadBlob(blob, `${base}-extracted.md`);
      window.showToast('Downloaded .MD file!', 'success');
    });
  }

  if (pdf2TxtResetBtn) {
    pdf2TxtResetBtn.addEventListener('click', () => {
      pdf2TxtOutput.value = '';
      pdf2TxtFileInput.value = '';
      pdf2TxtWorkspace.classList.add('hidden');
      pdf2TxtDropZone.classList.remove('hidden');
    });
  }

  // Load Sample PDF for Extraction
  if (pdf2TxtSampleBtn) {
    pdf2TxtSampleBtn.addEventListener('click', async (e) => {
      e.stopPropagation();
      if (!window.PDFLib) {
        window.showToast('PDF engine initializing, please retry...', 'info');
        return;
      }
      try {
        window.showToast('Generating sample text document...', 'info');
        const pdfDoc = await window.PDFLib.PDFDocument.create();

        const p1 = pdfDoc.addPage([595, 842]);
        p1.drawText('EXECUTIVE SUMMARY: PRIVACY-FIRST WEB ARCHITECTURE', { x: 50, y: 760, size: 16 });
        p1.drawText('MultiTools Hub demonstrates how client-side WebAssembly, Canvas API, and', { x: 50, y: 720, size: 12 });
        p1.drawText('HTML5 APIs eliminate the need for centralized document processing servers.', { x: 50, y: 700, size: 12 });
        p1.drawText('By parsing, rasterizing, and compiling all files in memory, user privacy is', { x: 50, y: 680, size: 12 });
        p1.drawText('guaranteed with zero cloud data storage risks.', { x: 50, y: 660, size: 12 });

        const p2 = pdfDoc.addPage([595, 842]);
        p2.drawText('SECTION 2: PERFORMANCE BENCHMARKS & RESOLUTION METRICS', { x: 50, y: 760, size: 16 });
        p2.drawText('Vector SVG rasterization at 2x scale yields 144 DPI resolution with flawless', { x: 50, y: 720, size: 12 });
        p2.drawText('typographic legibility and sharp contrast.', { x: 50, y: 700, size: 12 });

        const bytes = await pdfDoc.save();
        extractedDocName = 'Sample_Whitepaper_Privacy.pdf';
        extractTextFromPdf(bytes.buffer, extractedDocName);
      } catch (err) {
        console.error(err);
        window.showToast('Failed to generate sample document', 'error');
      }
    });
  }

  // Helper: Download Blob
  function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  }

  // Helper: Data URL to Uint8Array
  function dataUrlToUint8Array(dataUrl) {
    const base64 = dataUrl.split(',')[1];
    const binary = atob(base64);
    const len = binary.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
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
