/**
 * Tool 1: PDF Merger & Page Organizer
 * Powered by pdf-lib (100% client-side in browser)
 */

document.addEventListener('DOMContentLoaded', () => {
  const dropZone = document.getElementById('pdf-dropzone');
  const fileInput = document.getElementById('pdf-file-input');
  const fileListEl = document.getElementById('pdf-file-list');
  const emptyState = document.getElementById('empty-state');
  const mergeBtn = document.getElementById('merge-btn');
  const clearBtn = document.getElementById('clear-btn');
  const sampleBtn = document.getElementById('load-sample-pdfs-btn');
  const progressContainer = document.getElementById('progress-container');
  const progressBar = document.getElementById('progress-bar');
  const progressText = document.getElementById('progress-text');
  const totalStatsEl = document.getElementById('total-stats');

  let pdfFiles = []; // Array of { id, file, name, size, pageCount, arrayBuffer }

  if (!dropZone || !fileInput) return;

  window.setupDropZone(dropZone, fileInput, handleFilesSelected);

  if (sampleBtn) {
    sampleBtn.addEventListener('click', async (e) => {
      e.stopPropagation();
      if (!window.PDFLib) {
        window.showToast('PDF engine initializing, please wait...', 'info');
        return;
      }
      try {
        window.showToast('Generating 2 demo PDF files...', 'info');
        
        // PDF 1 (2 pages)
        const pdf1 = await window.PDFLib.PDFDocument.create();
        const p1 = pdf1.addPage([595, 842]);
        p1.drawText('Document A - Page 1\nMultiTools Hub Sample PDF', { x: 50, y: 750, size: 24 });
        p1.drawText('This is a real client-side generated PDF file ready for merging test.', { x: 50, y: 700, size: 14 });
        const p2 = pdf1.addPage([595, 842]);
        p2.drawText('Document A - Page 2', { x: 50, y: 750, size: 24 });
        const bytes1 = await pdf1.save();

        // PDF 2 (1 page)
        const pdf2 = await window.PDFLib.PDFDocument.create();
        const p3 = pdf2.addPage([595, 842]);
        p3.drawText('Document B - Page 1 (Appendix)\nMultiTools Hub Sample PDF', { x: 50, y: 750, size: 24 });
        p3.drawText('Merge Document A and Document B seamlessly in browser.', { x: 50, y: 700, size: 14 });
        const bytes2 = await pdf2.save();

        pdfFiles.push({
          id: 'sample_1',
          name: 'Demo_Document_Part_1.pdf',
          size: bytes1.byteLength,
          pageCount: 2,
          arrayBuffer: bytes1.buffer
        });

        pdfFiles.push({
          id: 'sample_2',
          name: 'Demo_Document_Part_2.pdf',
          size: bytes2.byteLength,
          pageCount: 1,
          arrayBuffer: bytes2.buffer
        });

        renderFileList();
        window.showToast('2 Demo PDFs loaded! Try reordering or click Merge.', 'success');
      } catch (err) {
        console.error(err);
        window.showToast('Failed to generate demo PDFs', 'error');
      }
    });
  }

  async function handleFilesSelected(files) {
    const validFiles = Array.from(files).filter(file => file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf'));
    
    if (validFiles.length === 0) {
      window.showToast('Please upload valid PDF files (.pdf)', 'error');
      return;
    }

    window.showToast(`Loading ${validFiles.length} PDF file(s)...`, 'info');

    for (const file of validFiles) {
      const fileId = 'pdf_' + Math.random().toString(36).substr(2, 9);
      try {
        const arrayBuffer = await file.arrayBuffer();
        let pageCount = '?';
        try {
          if (window.PDFLib) {
            const pdfDoc = await window.PDFLib.PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
            pageCount = pdfDoc.getPageCount();
          }
        } catch (e) {
          console.warn('Could not read page count for', file.name, e);
        }

        pdfFiles.push({
          id: fileId,
          file: file,
          name: file.name,
          size: file.size,
          pageCount: pageCount,
          arrayBuffer: arrayBuffer
        });
      } catch (err) {
        console.error('Error reading PDF:', err);
        window.showToast(`Failed to read ${file.name}`, 'error');
      }
    }

    renderFileList();
    fileInput.value = '';
  }

  function renderFileList() {
    if (pdfFiles.length === 0) {
      emptyState.classList.remove('hidden');
      fileListEl.classList.add('hidden');
      mergeBtn.disabled = true;
      clearBtn.disabled = true;
      if (totalStatsEl) totalStatsEl.textContent = '0 files • 0 pages';
      return;
    }

    emptyState.classList.add('hidden');
    fileListEl.classList.remove('hidden');
    mergeBtn.disabled = false;
    clearBtn.disabled = false;

    let totalPages = 0;
    let totalBytes = 0;

    fileListEl.innerHTML = '';
    pdfFiles.forEach((item, index) => {
      if (typeof item.pageCount === 'number') totalPages += item.pageCount;
      totalBytes += item.size;

      const row = document.createElement('div');
      row.className = 'flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700/80 transition-all hover:border-indigo-400 dark:hover:border-indigo-500';
      row.innerHTML = `
        <div class="flex items-center gap-3 min-w-0 flex-1 mr-3">
          <span class="flex-shrink-0 w-6 h-6 rounded-md bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold text-xs flex items-center justify-center">
            ${index + 1}
          </span>
          <div class="min-w-0 flex-1">
            <p class="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">${escapeHtml(item.name)}</p>
            <div class="flex items-center gap-2 mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              <span>${window.formatBytes(item.size)}</span>
              <span>•</span>
              <span class="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-medium bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                ${item.pageCount} ${item.pageCount === 1 ? 'page' : 'pages'}
              </span>
            </div>
          </div>
        </div>
        <div class="flex items-center gap-1">
          <button type="button" class="p-1.5 text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors ${index === 0 ? 'opacity-30 cursor-not-allowed' : ''}" title="Move Up" ${index === 0 ? 'disabled' : ''} onclick="window.pdfMergerMove(${index}, -1)">
            <i data-lucide="arrow-up" class="w-4 h-4"></i>
          </button>
          <button type="button" class="p-1.5 text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors ${index === pdfFiles.length - 1 ? 'opacity-30 cursor-not-allowed' : ''}" title="Move Down" ${index === pdfFiles.length - 1 ? 'disabled' : ''} onclick="window.pdfMergerMove(${index}, 1)">
            <i data-lucide="arrow-down" class="w-4 h-4"></i>
          </button>
          <button type="button" class="p-1.5 text-rose-500 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors" title="Remove PDF" onclick="window.pdfMergerRemove(${index})">
            <i data-lucide="trash-2" class="w-4 h-4"></i>
          </button>
        </div>
      `;
      fileListEl.appendChild(row);
    });

    if (totalStatsEl) {
      totalStatsEl.textContent = `${pdfFiles.length} ${pdfFiles.length === 1 ? 'file' : 'files'} • ~${totalPages} pages total • ${window.formatBytes(totalBytes)}`;
    }

    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  window.pdfMergerMove = function (index, direction) {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= pdfFiles.length) return;
    const temp = pdfFiles[index];
    pdfFiles[index] = pdfFiles[targetIndex];
    pdfFiles[targetIndex] = temp;
    renderFileList();
  };

  window.pdfMergerRemove = function (index) {
    pdfFiles.splice(index, 1);
    renderFileList();
    window.showToast('File removed', 'info');
  };

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      pdfFiles = [];
      renderFileList();
      window.showToast('All files cleared', 'info');
    });
  }

  if (mergeBtn) {
    mergeBtn.addEventListener('click', async () => {
      if (pdfFiles.length === 0) return;
      if (!window.PDFLib) {
        window.showToast('PDF Library is still loading. Please wait a moment.', 'error');
        return;
      }

      mergeBtn.disabled = true;
      progressContainer.classList.remove('hidden');
      progressBar.style.width = '10%';
      progressText.textContent = 'Initializing merged document...';

      try {
        const mergedPdf = await window.PDFLib.PDFDocument.create();
        const total = pdfFiles.length;

        for (let i = 0; i < total; i++) {
          const item = pdfFiles[i];
          progressText.textContent = `Merging ${i + 1} of ${total}: ${item.name}...`;
          progressBar.style.width = `${Math.round(((i + 1) / (total + 1)) * 90)}%`;

          try {
            const donorPdf = await window.PDFLib.PDFDocument.load(item.arrayBuffer, { ignoreEncryption: true });
            const pageIndices = donorPdf.getPageIndices();
            const copiedPages = await mergedPdf.copyPages(donorPdf, pageIndices);
            copiedPages.forEach(page => mergedPdf.addPage(page));
          } catch (err) {
            console.error('Error copying pages from:', item.name, err);
            window.showToast(`Warning: Skipped encrypted or corrupt file ${item.name}`, 'error');
          }
        }

        progressText.textContent = 'Finalizing and generating PDF...';
        progressBar.style.width = '95%';

        const pdfBytes = await mergedPdf.save();
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const downloadUrl = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = `merged-document-${Date.now()}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        setTimeout(() => URL.revokeObjectURL(downloadUrl), 5000);

        progressBar.style.width = '100%';
        progressText.textContent = 'Merge complete!';
        window.showToast('PDF merged and downloaded successfully!', 'success');
      } catch (err) {
        console.error('Merge error:', err);
        window.showToast('Failed to merge PDFs: ' + err.message, 'error');
      } finally {
        mergeBtn.disabled = false;
        setTimeout(() => {
          progressContainer.classList.add('hidden');
          progressBar.style.width = '0%';
        }, 2000);
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
