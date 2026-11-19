/**
 * MultiTools Hub - Free PDF Invoice & Receipt Generator (US Business Standard)
 * 100% Client-side generation using pdf-lib + live DOM preview
 * Generates official US Letter (8.5 x 11 in) PDF documents
 */
(function InvoiceGeneratorModule() {
  'use strict';

  let logoDataUrl = null;

  const defaultState = {
    docType: 'INVOICE',
    invoiceNumber: 'INV-2026-001',
    poNumber: '',
    date: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
    currency: '$',
    businessName: 'Acme Creative Studio LLC',
    businessAddress: '100 Broadway, Suite 400\nNew York, NY 10005\ncontact@acmecreative.com',
    clientName: 'Global Horizon Tech Corp',
    clientAddress: '500 Silicon Vista Blvd\nAustin, TX 78701\nbilling@globalhorizon.com',
    taxRate: 8.25,
    discountRate: 0,
    shippingFee: 0,
    paymentTerms: 'Payment due within 14 days of issue date via ACH or wire transfer.',
    notes: 'Thank you for your business! Please include the invoice number in the payment memo.',
    items: [
      { description: 'Full-Stack Web Application Development (Sprint 1)', qty: 40, rate: 85.00 },
      { description: 'UI/UX Interactive Component Design & Prototyping', qty: 15, rate: 75.00 },
      { description: 'Cloud Infrastructure & High-Availability Deployment', qty: 1, rate: 650.00 }
    ]
  };

  let state = JSON.parse(JSON.stringify(defaultState));

  function init() {
    bindFormInputs();
    bindItemRowButtons();
    bindLogoUpload();
    bindSampleBtn();
    bindExportBtn();
    renderItemsTable();
    updateLivePreview();
  }

  function bindFormInputs() {
    const bind = (id, prop, isNumber = false) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.addEventListener('input', () => {
        state[prop] = isNumber ? (parseFloat(el.value) || 0) : el.value;
        updateLivePreview();
      });
    };

    bind('inv-doc-type', 'docType');
    bind('inv-number', 'invoiceNumber');
    bind('inv-po', 'poNumber');
    bind('inv-date', 'date');
    bind('inv-due-date', 'dueDate');
    bind('inv-currency', 'currency');
    bind('inv-biz-name', 'businessName');
    bind('inv-biz-addr', 'businessAddress');
    bind('inv-client-name', 'clientName');
    bind('inv-client-addr', 'clientAddress');
    bind('inv-tax-rate', 'taxRate', true);
    bind('inv-discount-rate', 'discountRate', true);
    bind('inv-shipping', 'shippingFee', true);
    bind('inv-terms', 'paymentTerms');
    bind('inv-notes', 'notes');

    const addRowBtn = document.getElementById('inv-add-item-btn');
    if (addRowBtn) {
      addRowBtn.addEventListener('click', () => {
        state.items.push({ description: 'New Service Item', qty: 1, rate: 50.00 });
        renderItemsTable();
        updateLivePreview();
      });
    }
  }

  function bindItemRowButtons() {
    const tableBody = document.getElementById('inv-items-table-body');
    if (!tableBody) return;

    tableBody.addEventListener('input', (e) => {
      const target = e.target;
      const index = parseInt(target.getAttribute('data-index'), 10);
      const field = target.getAttribute('data-field');
      if (isNaN(index) || !field || !state.items[index]) return;

      if (field === 'qty' || field === 'rate') {
        state.items[index][field] = parseFloat(target.value) || 0;
        const totalEl = document.getElementById(`inv-item-total-${index}`);
        if (totalEl) {
          const tot = state.items[index].qty * state.items[index].rate;
          totalEl.textContent = `${state.currency}${tot.toFixed(2)}`;
        }
      } else {
        state.items[index][field] = target.value;
      }
      updateLivePreview();
    });

    tableBody.addEventListener('click', (e) => {
      const btn = e.target.closest('.inv-del-item-btn');
      if (!btn) return;
      const index = parseInt(btn.getAttribute('data-index'), 10);
      if (!isNaN(index) && state.items.length > 1) {
        state.items.splice(index, 1);
        renderItemsTable();
        updateLivePreview();
      } else if (state.items.length <= 1) {
        if (window.showToast) window.showToast('Invoice must contain at least one line item', 'info');
      }
    });
  }

  function renderItemsTable() {
    const tableBody = document.getElementById('inv-items-table-body');
    if (!tableBody) return;

    tableBody.innerHTML = state.items.map((item, i) => `
      <tr class="border-b border-slate-200 dark:border-slate-800 text-sm">
        <td class="py-2.5 pr-2">
          <input type="text" data-index="${i}" data-field="description" value="${escapeHtml(item.description)}" class="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-1 focus:ring-indigo-500">
        </td>
        <td class="py-2.5 px-2 w-20">
          <input type="number" min="0" step="any" data-index="${i}" data-field="qty" value="${item.qty}" class="w-full px-2 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold text-center focus:ring-1 focus:ring-indigo-500">
        </td>
        <td class="py-2.5 px-2 w-24">
          <input type="number" min="0" step="any" data-index="${i}" data-field="rate" value="${item.rate}" class="w-full px-2 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold text-right focus:ring-1 focus:ring-indigo-500">
        </td>
        <td class="py-2.5 px-2 w-24 text-right font-mono font-semibold text-xs text-slate-800 dark:text-slate-200" id="inv-item-total-${i}">
          ${state.currency}${(item.qty * item.rate).toFixed(2)}
        </td>
        <td class="py-2.5 pl-2 w-10 text-center">
          <button type="button" data-index="${i}" class="inv-del-item-btn p-1.5 rounded-md text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors">
            <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
          </button>
        </td>
      </tr>
    `).join('');

    if (window.lucide) window.lucide.createIcons();
  }

  function bindLogoUpload() {
    const logoInput = document.getElementById('inv-logo-input');
    const removeBtn = document.getElementById('inv-remove-logo-btn');
    if (logoInput) {
      logoInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (ev) => {
            logoDataUrl = ev.target.result;
            if (removeBtn) removeBtn.classList.remove('hidden');
            updateLivePreview();
          };
          reader.readAsDataURL(file);
        }
      });
    }
    if (removeBtn) {
      removeBtn.addEventListener('click', () => {
        logoDataUrl = null;
        if (logoInput) logoInput.value = '';
        removeBtn.classList.add('hidden');
        updateLivePreview();
      });
    }
  }

  function bindSampleBtn() {
    const btn = document.getElementById('inv-sample-btn');
    if (!btn) return;
    btn.addEventListener('click', () => {
      state = JSON.parse(JSON.stringify(defaultState));
      syncFormValues();
      renderItemsTable();
      updateLivePreview();
      if (window.showToast) window.showToast('Sample US business invoice data loaded!', 'success');
    });
  }

  function syncFormValues() {
    const set = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.value = val;
    };
    set('inv-doc-type', state.docType);
    set('inv-number', state.invoiceNumber);
    set('inv-po', state.poNumber);
    set('inv-date', state.date);
    set('inv-due-date', state.dueDate);
    set('inv-currency', state.currency);
    set('inv-biz-name', state.businessName);
    set('inv-biz-addr', state.businessAddress);
    set('inv-client-name', state.clientName);
    set('inv-client-addr', state.clientAddress);
    set('inv-tax-rate', state.taxRate);
    set('inv-discount-rate', state.discountRate);
    set('inv-shipping', state.shippingFee);
    set('inv-terms', state.paymentTerms);
    set('inv-notes', state.notes);
  }

  function calculateTotals() {
    let subtotal = 0;
    state.items.forEach(item => {
      subtotal += (item.qty || 0) * (item.rate || 0);
    });

    const discountAmount = subtotal * (state.discountRate / 100);
    const taxableAmount = Math.max(0, subtotal - discountAmount);
    const taxAmount = taxableAmount * (state.taxRate / 100);
    const total = taxableAmount + taxAmount + (state.shippingFee || 0);

    return {
      subtotal,
      discountAmount,
      taxAmount,
      total
    };
  }

  function updateLivePreview() {
    const previewEl = document.getElementById('inv-preview-sheet');
    if (!previewEl) return;

    const totals = calculateTotals();
    const curr = state.currency || '$';

    previewEl.innerHTML = `
      <div class="p-8 sm:p-12 bg-white text-slate-800 font-sans shadow-xl rounded-xl border border-slate-200 text-xs sm:text-sm">
        
        <!-- Header -->
        <div class="flex flex-col sm:flex-row justify-between items-start gap-6 pb-6 border-b-2 border-indigo-600">
          <div>
            ${logoDataUrl ? `<img src="${logoDataUrl}" alt="Logo" class="h-12 w-auto max-w-[180px] object-contain mb-3">` : ''}
            <h1 class="text-xl sm:text-2xl font-black text-slate-900 uppercase tracking-tight">${escapeHtml(state.businessName)}</h1>
            <p class="whitespace-pre-line text-slate-600 mt-1 text-xs leading-relaxed">${escapeHtml(state.businessAddress)}</p>
          </div>
          <div class="sm:text-right">
            <h2 class="text-2xl sm:text-3xl font-black text-indigo-600 tracking-wider uppercase">${escapeHtml(state.docType)}</h2>
            <p class="font-mono text-slate-500 font-semibold mt-1">#${escapeHtml(state.invoiceNumber)}</p>
            ${state.poNumber ? `<p class="text-xs text-slate-400">PO: ${escapeHtml(state.poNumber)}</p>` : ''}
            <div class="mt-3 space-y-0.5 text-xs text-slate-600">
              <p><strong>Issue Date:</strong> ${escapeHtml(state.date)}</p>
              <p><strong>Due Date:</strong> ${escapeHtml(state.dueDate)}</p>
            </div>
          </div>
        </div>

        <!-- Bill To -->
        <div class="my-6 p-4 rounded-lg bg-slate-50 border border-slate-100 flex flex-col sm:flex-row justify-between gap-4">
          <div>
            <span class="text-[10px] font-bold uppercase tracking-wider text-indigo-600">Billed To (Client):</span>
            <h3 class="text-base font-bold text-slate-900 mt-0.5">${escapeHtml(state.clientName)}</h3>
            <p class="whitespace-pre-line text-slate-600 text-xs mt-1 leading-relaxed">${escapeHtml(state.clientAddress)}</p>
          </div>
          <div class="sm:text-right">
            <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Amount Due:</span>
            <p class="text-2xl font-extrabold text-indigo-600 font-mono mt-0.5">${curr}${totals.total.toFixed(2)}</p>
          </div>
        </div>

        <!-- Table -->
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="border-b-2 border-slate-200 text-slate-600 uppercase text-[10px] tracking-wider">
                <th class="py-2.5 text-left font-bold">Item &amp; Description</th>
                <th class="py-2.5 text-center font-bold w-16">Qty</th>
                <th class="py-2.5 text-right font-bold w-24">Rate</th>
                <th class="py-2.5 text-right font-bold w-28">Amount</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 text-xs">
              ${state.items.map(it => `
                <tr>
                  <td class="py-3 font-medium text-slate-800">${escapeHtml(it.description)}</td>
                  <td class="py-3 text-center text-slate-600">${it.qty}</td>
                  <td class="py-3 text-right font-mono text-slate-600">${curr}${parseFloat(it.rate).toFixed(2)}</td>
                  <td class="py-3 text-right font-mono font-bold text-slate-900">${curr}${(it.qty * it.rate).toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <!-- Totals Breakdown -->
        <div class="mt-6 pt-4 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-start gap-6">
          <div class="text-xs text-slate-600 space-y-3 max-w-sm">
            ${state.paymentTerms ? `
              <div>
                <strong class="text-slate-900 uppercase text-[10px] tracking-wider block">Payment Terms:</strong>
                <p class="mt-0.5 leading-relaxed">${escapeHtml(state.paymentTerms)}</p>
              </div>` : ''}
            ${state.notes ? `
              <div>
                <strong class="text-slate-900 uppercase text-[10px] tracking-wider block">Notes &amp; Instructions:</strong>
                <p class="mt-0.5 leading-relaxed">${escapeHtml(state.notes)}</p>
              </div>` : ''}
          </div>

          <div class="w-full sm:w-64 space-y-1.5 text-xs text-slate-600">
            <div class="flex justify-between">
              <span>Subtotal:</span>
              <span class="font-mono font-medium">${curr}${totals.subtotal.toFixed(2)}</span>
            </div>
            ${state.discountRate > 0 ? `
              <div class="flex justify-between text-rose-600">
                <span>Discount (${state.discountRate}%):</span>
                <span class="font-mono">-${curr}${totals.discountAmount.toFixed(2)}</span>
              </div>` : ''}
            ${state.taxRate > 0 ? `
              <div class="flex justify-between">
                <span>Sales Tax (${state.taxRate}%):</span>
                <span class="font-mono">${curr}${totals.taxAmount.toFixed(2)}</span>
              </div>` : ''}
            ${state.shippingFee > 0 ? `
              <div class="flex justify-between">
                <span>Shipping &amp; Handling:</span>
                <span class="font-mono">${curr}${state.shippingFee.toFixed(2)}</span>
              </div>` : ''}
            <div class="flex justify-between items-center pt-2 border-t-2 border-slate-900 text-sm font-bold text-slate-900">
              <span class="uppercase">Total Due:</span>
              <span class="font-mono text-base text-indigo-600">${curr}${totals.total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="mt-8 pt-4 border-t border-slate-100 text-center text-[10px] text-slate-400">
          Generated professionally via MultiTools Hub • 100% Private Client-Side Compute
        </div>

      </div>
    `;
  }

  function bindExportBtn() {
    const pdfBtn = document.getElementById('inv-download-pdf-btn');
    const printBtn = document.getElementById('inv-print-btn');

    if (printBtn) {
      printBtn.addEventListener('click', () => {
        window.print();
      });
    }

    if (pdfBtn) {
      pdfBtn.addEventListener('click', generatePdf);
    }
  }

  async function generatePdf() {
    if (!window.PDFLib) {
      // Fallback: trigger browser print-to-pdf
      window.print();
      return;
    }

    const { PDFDocument, rgb, StandardFonts } = window.PDFLib;
    const totals = calculateTotals();
    const curr = state.currency || '$';

    try {
      const pdfDoc = await PDFDocument.create();
      // US Letter: 8.5 x 11 inches = 612 x 792 points
      const page = pdfDoc.addPage([612, 792]);
      const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

      const margin = 45;
      let y = 747;

      // Top Indigo Accent Line
      page.drawRectangle({
        x: margin,
        y: y,
        width: 522,
        height: 4,
        color: rgb(0.388, 0.4, 0.945), // #6366f1
      });
      y -= 25;

      // Business Name
      page.drawText(state.businessName, {
        x: margin,
        y: y,
        size: 16,
        font: helveticaBold,
        color: rgb(0.06, 0.09, 0.16),
      });

      // Invoice Title (Right aligned)
      const docTypeWidth = helveticaBold.widthOfTextAtSize(state.docType, 20);
      page.drawText(state.docType, {
        x: 612 - margin - docTypeWidth,
        y: y,
        size: 20,
        font: helveticaBold,
        color: rgb(0.388, 0.4, 0.945),
      });
      y -= 15;

      // Business Address (lines)
      const addrLines = (state.businessAddress || '').split('\n');
      addrLines.forEach(line => {
        page.drawText(line, {
          x: margin,
          y: y,
          size: 9,
          font: helvetica,
          color: rgb(0.3, 0.35, 0.4),
        });
        y -= 12;
      });

      // Invoice Details Right
      let rightY = 707;
      const invNumText = `#${state.invoiceNumber}`;
      page.drawText(invNumText, {
        x: 612 - margin - helveticaBold.widthOfTextAtSize(invNumText, 10),
        y: rightY,
        size: 10,
        font: helveticaBold,
        color: rgb(0.2, 0.25, 0.3),
      });
      rightY -= 14;

      const dateText = `Date: ${state.date}`;
      page.drawText(dateText, {
        x: 612 - margin - helvetica.widthOfTextAtSize(dateText, 9),
        y: rightY,
        size: 9,
        font: helvetica,
        color: rgb(0.4, 0.45, 0.5),
      });
      rightY -= 12;

      const dueText = `Due Date: ${state.dueDate}`;
      page.drawText(dueText, {
        x: 612 - margin - helvetica.widthOfTextAtSize(dueText, 9),
        y: rightY,
        size: 9,
        font: helvetica,
        color: rgb(0.4, 0.45, 0.5),
      });

      y = Math.min(y, rightY) - 20;

      // Bill To Box
      page.drawRectangle({
        x: margin,
        y: y - 55,
        width: 522,
        height: 65,
        color: rgb(0.97, 0.98, 0.99),
        borderColor: rgb(0.9, 0.92, 0.94),
        borderWidth: 1,
      });

      page.drawText('BILLED TO (CLIENT):', {
        x: margin + 12,
        y: y - 2,
        size: 8,
        font: helveticaBold,
        color: rgb(0.388, 0.4, 0.945),
      });

      page.drawText(state.clientName, {
        x: margin + 12,
        y: y - 16,
        size: 11,
        font: helveticaBold,
        color: rgb(0.06, 0.09, 0.16),
      });

      const clientAddrLines = (state.clientAddress || '').split('\n').slice(0, 2);
      let cY = y - 28;
      clientAddrLines.forEach(cl => {
        page.drawText(cl, {
          x: margin + 12,
          y: cY,
          size: 8,
          font: helvetica,
          color: rgb(0.35, 0.4, 0.45),
        });
        cY -= 10;
      });

      // Total Due Right inside box
      const totalLabel = 'TOTAL AMOUNT DUE:';
      const totalAmountText = `${curr}${totals.total.toFixed(2)}`;
      page.drawText(totalLabel, {
        x: 612 - margin - 12 - helveticaBold.widthOfTextAtSize(totalLabel, 8),
        y: y - 2,
        size: 8,
        font: helveticaBold,
        color: rgb(0.4, 0.45, 0.5),
      });
      page.drawText(totalAmountText, {
        x: 612 - margin - 12 - helveticaBold.widthOfTextAtSize(totalAmountText, 14),
        y: y - 22,
        size: 14,
        font: helveticaBold,
        color: rgb(0.388, 0.4, 0.945),
      });

      y -= 75;

      // Table Header
      page.drawRectangle({
        x: margin,
        y: y - 15,
        width: 522,
        height: 20,
        color: rgb(0.94, 0.95, 0.97),
      });

      page.drawText('DESCRIPTION', { x: margin + 10, y: y - 10, size: 8, font: helveticaBold, color: rgb(0.2, 0.25, 0.3) });
      page.drawText('QTY', { x: margin + 330, y: y - 10, size: 8, font: helveticaBold, color: rgb(0.2, 0.25, 0.3) });
      page.drawText('RATE', { x: margin + 390, y: y - 10, size: 8, font: helveticaBold, color: rgb(0.2, 0.25, 0.3) });
      page.drawText('AMOUNT', { x: margin + 465, y: y - 10, size: 8, font: helveticaBold, color: rgb(0.2, 0.25, 0.3) });

      y -= 25;

      // Table Rows
      state.items.forEach(it => {
        page.drawText(it.description.substring(0, 52), {
          x: margin + 10,
          y: y,
          size: 9,
          font: helvetica,
          color: rgb(0.1, 0.15, 0.2),
        });

        page.drawText(String(it.qty), {
          x: margin + 335,
          y: y,
          size: 9,
          font: helvetica,
          color: rgb(0.2, 0.25, 0.3),
        });

        page.drawText(`${curr}${parseFloat(it.rate).toFixed(2)}`, {
          x: margin + 390,
          y: y,
          size: 9,
          font: helvetica,
          color: rgb(0.2, 0.25, 0.3),
        });

        const rowTotal = `${curr}${(it.qty * it.rate).toFixed(2)}`;
        page.drawText(rowTotal, {
          x: margin + 465,
          y: y,
          size: 9,
          font: helveticaBold,
          color: rgb(0.1, 0.15, 0.2),
        });

        y -= 18;
      });

      y -= 10;
      page.drawLine({
        start: { x: margin, y: y },
        end: { x: 612 - margin, y: y },
        thickness: 0.5,
        color: rgb(0.8, 0.85, 0.9),
      });
      y -= 15;

      // Totals on Right
      const rightX = 612 - margin;
      const drawTotalRow = (label, val, isBold = false) => {
        page.drawText(label, {
          x: rightX - 160,
          y: y,
          size: 9,
          font: isBold ? helveticaBold : helvetica,
          color: isBold ? rgb(0.06, 0.09, 0.16) : rgb(0.4, 0.45, 0.5),
        });
        const vW = (isBold ? helveticaBold : helvetica).widthOfTextAtSize(val, 9);
        page.drawText(val, {
          x: rightX - vW,
          y: y,
          size: 9,
          font: isBold ? helveticaBold : helvetica,
          color: isBold ? rgb(0.388, 0.4, 0.945) : rgb(0.1, 0.15, 0.2),
        });
        y -= 14;
      };

      drawTotalRow('Subtotal:', `${curr}${totals.subtotal.toFixed(2)}`);
      if (state.discountRate > 0) {
        drawTotalRow(`Discount (${state.discountRate}%):`, `-${curr}${totals.discountAmount.toFixed(2)}`);
      }
      if (state.taxRate > 0) {
        drawTotalRow(`Sales Tax (${state.taxRate}%):`, `${curr}${totals.taxAmount.toFixed(2)}`);
      }
      if (state.shippingFee > 0) {
        drawTotalRow('Shipping & Handling:', `${curr}${state.shippingFee.toFixed(2)}`);
      }
      y -= 4;
      drawTotalRow('TOTAL DUE:', `${curr}${totals.total.toFixed(2)}`, true);

      // Terms & Notes Left
      let notesY = y + 55;
      if (state.paymentTerms) {
        page.drawText('PAYMENT TERMS:', {
          x: margin,
          y: notesY,
          size: 8,
          font: helveticaBold,
          color: rgb(0.2, 0.25, 0.3),
        });
        page.drawText(state.paymentTerms.substring(0, 60), {
          x: margin,
          y: notesY - 12,
          size: 8,
          font: helvetica,
          color: rgb(0.4, 0.45, 0.5),
        });
      }

      // Bottom Footer
      page.drawText('Generated professionally via MultiTools Hub • 100% Client-Side Privacy', {
        x: margin,
        y: 35,
        size: 7,
        font: helvetica,
        color: rgb(0.6, 0.65, 0.7),
      });

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${state.docType.toLowerCase()}-${state.invoiceNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      if (window.showToast) window.showToast('US Letter PDF Invoice downloaded successfully!', 'success');
    } catch (err) {
      console.error('PDF generation error:', err);
      // Fallback
      window.print();
    }
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  document.addEventListener('DOMContentLoaded', init);
})();
