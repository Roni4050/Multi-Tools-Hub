/**
 * MultiTools Hub - US Standard Envelope & Shipping Label Printer
 * 100% Client-Side PDF Generation using pdf-lib (4x6 Thermal & Avery 5160)
 */

document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const mode4x6Btn = document.getElementById('mode-4x6-btn');
  const modeAveryBtn = document.getElementById('mode-avery-btn');
  const modeEnvelopeBtn = document.getElementById('mode-envelope-btn');

  // Address Inputs
  const senderName = document.getElementById('sender-name');
  const senderCompany = document.getElementById('sender-company');
  const senderStreet = document.getElementById('sender-street');
  const senderCity = document.getElementById('sender-city');
  const senderState = document.getElementById('sender-state');
  const senderZip = document.getElementById('sender-zip');

  const recipName = document.getElementById('recip-name');
  const recipCompany = document.getElementById('recip-company');
  const recipStreet = document.getElementById('recip-street');
  const recipCity = document.getElementById('recip-city');
  const recipState = document.getElementById('recip-state');
  const recipZip = document.getElementById('recip-zip');

  const trackingNumber = document.getElementById('tracking-number');
  const packageWeight = document.getElementById('package-weight');
  const serviceClass = document.getElementById('service-class');

  // Preview Canvas & Download
  const previewCanvas = document.getElementById('shipping-preview-canvas');
  const downloadPdfBtn = document.getElementById('download-shipping-pdf-btn');

  let currentMode = '4x6'; // '4x6', 'avery', 'envelope'

  // Tab switching
  [
    { btn: mode4x6Btn, mode: '4x6' },
    { btn: modeAveryBtn, mode: 'avery' },
    { btn: modeEnvelopeBtn, mode: 'envelope' }
  ].forEach(({ btn, mode }) => {
    if (btn) {
      btn.addEventListener('click', () => {
        currentMode = mode;
        [mode4x6Btn, modeAveryBtn, modeEnvelopeBtn].forEach(b => {
          if (b) {
            b.classList.remove('bg-indigo-600', 'text-white');
            b.classList.add('bg-white', 'dark:bg-slate-900', 'text-slate-600', 'dark:text-slate-300');
          }
        });
        btn.classList.add('bg-indigo-600', 'text-white');
        btn.classList.remove('bg-white', 'dark:bg-slate-900', 'text-slate-600', 'dark:text-slate-300');
        renderCanvasPreview();
      });
    }
  });

  function renderCanvasPreview() {
    if (!previewCanvas) return;
    const ctx = previewCanvas.getContext('2d');

    const sName = senderName?.value || 'Jane Doe';
    const sComp = senderCompany?.value || 'Studio Crafts LLC';
    const sStreet = senderStreet?.value || '742 Evergreen Terrace';
    const sCity = senderCity?.value || 'Springfield';
    const sState = senderState?.value || 'OR';
    const sZip = senderZip?.value || '97477';

    const rName = recipName?.value || 'Johnathan Smith';
    const rComp = recipCompany?.value || 'Acme Logistics Corp';
    const rStreet = recipStreet?.value || '123 Market Street, Suite 400';
    const rCity = recipCity?.value || 'San Francisco';
    const rState = recipState?.value || 'CA';
    const rZip = recipZip?.value || '94105';

    const track = trackingNumber?.value || '9400 1118 9956 4321 0000 00';
    const sClass = serviceClass?.value || 'USPS PRIORITY MAIL 2-DAY®';

    if (currentMode === '4x6') {
      // 4" x 6" ratio: 400 x 600 px
      previewCanvas.width = 400;
      previewCanvas.height = 600;

      // Clean white sheet with 1px border
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, 400, 600);
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2;
      ctx.strokeRect(10, 10, 380, 580);

      // Top Service Header Box
      ctx.fillStyle = '#000000';
      ctx.fillRect(10, 10, 380, 50);

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 18px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(sClass, 200, 42);

      // FROM / SENDER SECTION
      ctx.fillStyle = '#000000';
      ctx.textAlign = 'left';
      ctx.font = 'bold 9px sans-serif';
      ctx.fillText('FROM:', 25, 80);

      ctx.font = '11px sans-serif';
      ctx.fillText(sName + (sComp ? ` • ${sComp}` : ''), 25, 96);
      ctx.fillText(sStreet, 25, 112);
      ctx.fillText(`${sCity}, ${sState} ${sZip}`, 25, 128);

      // Horizontal separator line
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(10, 145);
      ctx.lineTo(390, 145);
      ctx.stroke();

      // SHIP TO / RECIPIENT SECTION (Large & Clear)
      ctx.font = 'bold 11px sans-serif';
      ctx.fillText('SHIP TO:', 35, 175);

      ctx.font = 'bold 18px sans-serif';
      ctx.fillText(rName.toUpperCase(), 35, 205);

      ctx.font = 'bold 15px sans-serif';
      if (rComp) {
        ctx.fillText(rComp.toUpperCase(), 35, 228);
        ctx.fillText(rStreet.toUpperCase(), 35, 250);
        ctx.font = 'bold 20px sans-serif';
        ctx.fillText(`${rCity.toUpperCase()}, ${rState.toUpperCase()}  ${rZip}`, 35, 278);
      } else {
        ctx.fillText(rStreet.toUpperCase(), 35, 232);
        ctx.font = 'bold 20px sans-serif';
        ctx.fillText(`${rCity.toUpperCase()}, ${rState.toUpperCase()}  ${rZip}`, 35, 264);
      }

      // Barcode Zone Separator
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(10, 310);
      ctx.lineTo(390, 310);
      ctx.stroke();

      // Simulated High-Contrast Postal 1D Barcode
      ctx.fillStyle = '#000000';
      for (let x = 30; x < 370; x += 4) {
        let barWidth = ((x * 13) % 7 === 0) ? 3 : 1.5;
        if ((x * 17) % 5 !== 0) {
          ctx.fillRect(x, 340, barWidth, 120);
        }
      }

      // Tracking String under Barcode
      ctx.font = 'bold 13px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(track, 200, 485);

      // Bottom Details Strip
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(10, 510);
      ctx.lineTo(390, 510);
      ctx.stroke();

      ctx.textAlign = 'left';
      ctx.font = '10px sans-serif';
      ctx.fillText(`WEIGHT: ${packageWeight?.value || '1 LB 4 OZ'}`, 25, 545);
      ctx.fillText('ELECTRONIC RATE APPROVED #0248', 25, 565);

      ctx.textAlign = 'right';
      ctx.font = 'bold 14px sans-serif';
      ctx.fillText(`ZONE 4`, 370, 550);

    } else if (currentMode === 'avery') {
      // Avery 5160 Preview: 8.5 x 11 ratio (425 x 550 px)
      previewCanvas.width = 425;
      previewCanvas.height = 550;

      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, 425, 550);

      // 3 cols x 10 rows grid representation
      const colW = 120;
      const rowH = 45;
      const startX = 25;
      const startY = 35;

      for (let r = 0; r < 10; r++) {
        for (let c = 0; c < 3; c++) {
          const x = startX + c * 130;
          const y = startY + r * 48;

          ctx.strokeStyle = '#CBD5E1';
          ctx.lineWidth = 0.5;
          ctx.strokeRect(x, y, colW, rowH);

          ctx.fillStyle = '#1E293B';
          ctx.font = 'bold 7px sans-serif';
          ctx.textAlign = 'left';
          ctx.fillText(rName, x + 5, y + 12);
          ctx.font = '6px sans-serif';
          ctx.fillText(rStreet, x + 5, y + 23);
          ctx.fillText(`${rCity}, ${rState} ${rZip}`, x + 5, y + 33);
        }
      }

    } else {
      // #10 Envelope Preview: 9.5 x 4.125 ratio (570 x 248 px)
      previewCanvas.width = 570;
      previewCanvas.height = 248;

      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, 570, 248);
      ctx.strokeStyle = '#E2E8F0';
      ctx.strokeRect(0, 0, 570, 248);

      // Return Address Top-Left
      ctx.fillStyle = '#0F172A';
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(sName.toUpperCase(), 30, 35);
      if (sComp) ctx.fillText(sComp, 30, 48);
      ctx.font = '9.5px sans-serif';
      ctx.fillText(sStreet, 30, 62);
      ctx.fillText(`${sCity}, ${sState} ${sZip}`, 30, 76);

      // Recipient Address Centered
      ctx.font = 'bold 14px sans-serif';
      ctx.fillText(rName.toUpperCase(), 240, 130);
      if (rComp) ctx.fillText(rComp, 240, 148);
      ctx.font = '13px sans-serif';
      ctx.fillText(rStreet, 240, 166);
      ctx.font = 'bold 14px sans-serif';
      ctx.fillText(`${rCity.toUpperCase()}, ${rState.toUpperCase()}  ${rZip}`, 240, 186);

      // Stamp Placeholder Box Top-Right
      ctx.strokeStyle = '#94A3B8';
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      ctx.strokeRect(500, 20, 45, 55);
      ctx.setLineDash([]);
      ctx.font = '8px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#94A3B8';
      ctx.fillText('POSTAGE', 522, 50);
    }
  }

  // PDF Generation with PDFLib
  if (downloadPdfBtn) {
    downloadPdfBtn.addEventListener('click', async () => {
      downloadPdfBtn.disabled = true;
      downloadPdfBtn.innerHTML = '<i data-lucide="loader" class="w-4 h-4 animate-spin"></i> Generating PDF...';
      if (window.lucide) window.lucide.createIcons();

      try {
        if (typeof PDFLib === 'undefined') throw new Error('PDFLib not loaded');
        const { PDFDocument, rgb, StandardFonts } = PDFLib;
        const pdfDoc = await PDFDocument.create();
        const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
        const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
        const courierBold = await pdfDoc.embedFont(StandardFonts.CourierBold);

        const sName = senderName?.value || 'Jane Doe';
        const sComp = senderCompany?.value || '';
        const sStreet = senderStreet?.value || '742 Evergreen Terrace';
        const sCity = senderCity?.value || 'Springfield';
        const sState = senderState?.value || 'OR';
        const sZip = senderZip?.value || '97477';

        const rName = recipName?.value || 'Johnathan Smith';
        const rComp = recipCompany?.value || '';
        const rStreet = recipStreet?.value || '123 Market Street, Suite 400';
        const rCity = recipCity?.value || 'San Francisco';
        const rState = recipState?.value || 'CA';
        const rZip = recipZip?.value || '94105';

        const track = trackingNumber?.value || '9400 1118 9956 4321 0000 00';
        const sClass = serviceClass?.value || 'USPS PRIORITY MAIL 2-DAY®';

        if (currentMode === '4x6') {
          // 4 x 6 inches = 288 x 432 pt
          const page = pdfDoc.addPage([288, 432]);

          // Outer Border
          page.drawRectangle({
            x: 8,
            y: 8,
            width: 272,
            height: 416,
            borderColor: rgb(0, 0, 0),
            borderWidth: 1.5,
          });

          // Top Header Banner
          page.drawRectangle({
            x: 8,
            y: 390,
            width: 272,
            height: 34,
            color: rgb(0, 0, 0),
          });

          page.drawText(sClass, {
            x: 20,
            y: 402,
            size: 11,
            font: helveticaBold,
            color: rgb(1, 1, 1),
          });

          // FROM Section
          page.drawText('FROM:', { x: 18, y: 375, size: 7, font: helveticaBold, color: rgb(0, 0, 0) });
          page.drawText(`${sName} ${sComp ? '• ' + sComp : ''}`, { x: 18, y: 362, size: 8.5, font: helvetica, color: rgb(0, 0, 0) });
          page.drawText(sStreet, { x: 18, y: 350, size: 8.5, font: helvetica, color: rgb(0, 0, 0) });
          page.drawText(`${sCity}, ${sState} ${sZip}`, { x: 18, y: 338, size: 8.5, font: helvetica, color: rgb(0, 0, 0) });

          // Divider
          page.drawLine({ start: { x: 8, y: 326 }, end: { x: 280, y: 326 }, thickness: 1, color: rgb(0, 0, 0) });

          // SHIP TO Section
          page.drawText('SHIP TO:', { x: 25, y: 308, size: 9, font: helveticaBold, color: rgb(0, 0, 0) });
          page.drawText(rName.toUpperCase(), { x: 25, y: 288, size: 14, font: helveticaBold, color: rgb(0, 0, 0) });
          if (rComp) {
            page.drawText(rComp.toUpperCase(), { x: 25, y: 270, size: 11, font: helveticaBold, color: rgb(0, 0, 0) });
            page.drawText(rStreet.toUpperCase(), { x: 25, y: 254, size: 11, font: helveticaBold, color: rgb(0, 0, 0) });
            page.drawText(`${rCity.toUpperCase()}, ${rState.toUpperCase()}  ${rZip}`, { x: 25, y: 236, size: 14, font: helveticaBold, color: rgb(0, 0, 0) });
          } else {
            page.drawText(rStreet.toUpperCase(), { x: 25, y: 268, size: 11, font: helveticaBold, color: rgb(0, 0, 0) });
            page.drawText(`${rCity.toUpperCase()}, ${rState.toUpperCase()}  ${rZip}`, { x: 25, y: 248, size: 14, font: helveticaBold, color: rgb(0, 0, 0) });
          }

          // Divider
          page.drawLine({ start: { x: 8, y: 215 }, end: { x: 280, y: 215 }, thickness: 1.5, color: rgb(0, 0, 0) });

          // Simulated Barcode
          for (let bx = 25; bx < 265; bx += 3) {
            let bw = (bx % 7 === 0) ? 2.5 : 1.2;
            if (bx % 11 !== 0) {
              page.drawRectangle({
                x: bx,
                y: 110,
                width: bw,
                height: 85,
                color: rgb(0, 0, 0),
              });
            }
          }

          // Tracking Text
          page.drawText(track, {
            x: 35,
            y: 92,
            size: 9.5,
            font: courierBold,
            color: rgb(0, 0, 0),
          });

          // Bottom Info
          page.drawLine({ start: { x: 8, y: 78 }, end: { x: 280, y: 78 }, thickness: 1, color: rgb(0, 0, 0) });
          page.drawText(`WEIGHT: ${packageWeight?.value || '1 LB 4 OZ'}`, { x: 18, y: 50, size: 8.5, font: helveticaBold, color: rgb(0, 0, 0) });
          page.drawText('USPS TRACKING # eVS', { x: 18, y: 35, size: 7.5, font: helvetica, color: rgb(0, 0, 0) });
          page.drawText('ZONE 4', { x: 220, y: 50, size: 12, font: helveticaBold, color: rgb(0, 0, 0) });

        } else if (currentMode === 'avery') {
          // Avery 5160 on US Letter: 8.5 x 11 in (612 x 792 pt)
          // 30 labels (3 cols x 10 rows)
          // Label dimensions: 2.625 x 1.0 in (189 x 72 pt)
          // Margins: Top 0.5 in (36 pt), Left 0.1875 in (13.5 pt)
          const page = pdfDoc.addPage([612, 792]);
          const labelW = 189;
          const labelH = 72;
          const leftM = 14;
          const topM = 792 - 36;

          for (let r = 0; r < 10; r++) {
            for (let c = 0; c < 3; c++) {
              const lx = leftM + c * (labelW + 9);
              const ly = topM - (r + 1) * labelH;

              page.drawText(rName, { x: lx + 8, y: ly + labelH - 22, size: 9, font: helveticaBold, color: rgb(0, 0, 0) });
              if (rComp) page.drawText(rComp, { x: lx + 8, y: ly + labelH - 34, size: 8, font: helvetica, color: rgb(0.2, 0.2, 0.2) });
              page.drawText(rStreet, { x: lx + 8, y: ly + labelH - (rComp ? 46 : 36), size: 8, font: helvetica, color: rgb(0.2, 0.2, 0.2) });
              page.drawText(`${rCity}, ${rState} ${rZip}`, { x: lx + 8, y: ly + labelH - (rComp ? 58 : 48), size: 8.5, font: helveticaBold, color: rgb(0, 0, 0) });
            }
          }

        } else {
          // #10 Envelope: 9.5 x 4.125 inches (684 x 297 pt)
          const page = pdfDoc.addPage([684, 297]);

          // Sender Top-Left
          page.drawText(sName.toUpperCase(), { x: 36, y: 255, size: 9.5, font: helveticaBold, color: rgb(0, 0, 0) });
          if (sComp) page.drawText(sComp, { x: 36, y: 242, size: 8.5, font: helvetica, color: rgb(0.2, 0.2, 0.2) });
          page.drawText(sStreet, { x: 36, y: 229, size: 8.5, font: helvetica, color: rgb(0.2, 0.2, 0.2) });
          page.drawText(`${sCity}, ${sState} ${sZip}`, { x: 36, y: 216, size: 8.5, font: helvetica, color: rgb(0.2, 0.2, 0.2) });

          // Recipient Center
          page.drawText(rName.toUpperCase(), { x: 280, y: 155, size: 13, font: helveticaBold, color: rgb(0, 0, 0) });
          if (rComp) page.drawText(rComp, { x: 280, y: 138, size: 11, font: helvetica, color: rgb(0.1, 0.1, 0.1) });
          page.drawText(rStreet, { x: 280, y: 122, size: 11, font: helvetica, color: rgb(0.1, 0.1, 0.1) });
          page.drawText(`${rCity.toUpperCase()}, ${rState.toUpperCase()}  ${rZip}`, { x: 280, y: 104, size: 13, font: helveticaBold, color: rgb(0, 0, 0) });
        }

        const pdfBytes = await pdfDoc.save();
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = currentMode === '4x6'
          ? 'Shipping-Label-4x6-Thermal.pdf'
          : currentMode === 'avery'
          ? 'Avery-5160-Address-Labels-Sheet.pdf'
          : 'Envelope-Number-10-Print.pdf';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        if (window.showToast) window.showToast('Print-Ready PDF downloaded!');
      } catch (err) {
        console.error(err);
        if (window.showToast) window.showToast('Error generating PDF: ' + err.message, 'error');
      } finally {
        downloadPdfBtn.disabled = false;
        downloadPdfBtn.innerHTML = '<i data-lucide="printer" class="w-4 h-4"></i> Download Print-Ready PDF';
        if (window.lucide) window.lucide.createIcons();
      }
    });
  }

  // Trigger preview on any input change
  const allInputs = [
    senderName, senderCompany, senderStreet, senderCity, senderState, senderZip,
    recipName, recipCompany, recipStreet, recipCity, recipState, recipZip,
    trackingNumber, packageWeight, serviceClass
  ];
  allInputs.forEach(inp => {
    if (inp) inp.addEventListener('input', renderCanvasPreview);
  });

  renderCanvasPreview();
});
