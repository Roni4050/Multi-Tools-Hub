/**
 * MultiTools Hub - US Letterhead & Business Card Print Layout Maker
 * 100% Client-Side PDF Generation using pdf-lib
 */

document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const modeCardBtn = document.getElementById('mode-card-btn');
  const modeLetterheadBtn = document.getElementById('mode-letterhead-btn');
  const cardControls = document.getElementById('card-controls');
  const letterheadControls = document.getElementById('letterhead-controls');

  // Input Fields
  const inputFullName = document.getElementById('input-name');
  const inputTitle = document.getElementById('input-title');
  const inputCompany = document.getElementById('input-company');
  const inputPhone = document.getElementById('input-phone');
  const inputEmail = document.getElementById('input-email');
  const inputWebsite = document.getElementById('input-website');
  const inputAddress = document.getElementById('input-address');
  const inputColor = document.getElementById('input-color');
  const inputLogo = document.getElementById('input-logo');

  // Card Design Style
  const styleSelect = document.getElementById('card-style-select');

  // Letterhead fields
  const lhCompany = document.getElementById('lh-company');
  const lhTagline = document.getElementById('lh-tagline');
  const lhContact = document.getElementById('lh-contact');
  const lhFooter = document.getElementById('lh-footer');

  // Canvas Preview
  const previewCanvas = document.getElementById('preview-canvas');
  const downloadPdfBtn = document.getElementById('download-pdf-btn');

  let currentMode = 'card'; // 'card' or 'letterhead'
  let logoImage = null;

  // Handle Logo Upload
  if (inputLogo) {
    inputLogo.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const img = new Image();
          img.onload = () => {
            logoImage = img;
            renderPreview();
          };
          img.src = event.target.result;
        };
        reader.readAsDataURL(file);
      }
    });
  }

  // Switch modes
  if (modeCardBtn && modeLetterheadBtn) {
    modeCardBtn.addEventListener('click', () => {
      currentMode = 'card';
      modeCardBtn.classList.add('bg-indigo-600', 'text-white');
      modeCardBtn.classList.remove('bg-white', 'dark:bg-slate-900', 'text-slate-600', 'dark:text-slate-300');
      modeLetterheadBtn.classList.remove('bg-indigo-600', 'text-white');
      modeLetterheadBtn.classList.add('bg-white', 'dark:bg-slate-900', 'text-slate-600', 'dark:text-slate-300');

      if (cardControls) cardControls.classList.remove('hidden');
      if (letterheadControls) letterheadControls.classList.add('hidden');
      renderPreview();
    });

    modeLetterheadBtn.addEventListener('click', () => {
      currentMode = 'letterhead';
      modeLetterheadBtn.classList.add('bg-indigo-600', 'text-white');
      modeLetterheadBtn.classList.remove('bg-white', 'dark:bg-slate-900', 'text-slate-600', 'dark:text-slate-300');
      modeCardBtn.classList.remove('bg-indigo-600', 'text-white');
      modeCardBtn.classList.add('bg-white', 'dark:bg-slate-900', 'text-slate-600', 'dark:text-slate-300');

      if (cardControls) cardControls.classList.add('hidden');
      if (letterheadControls) letterheadControls.classList.remove('hidden');
      renderPreview();
    });
  }

  function renderPreview() {
    if (!previewCanvas) return;
    const ctx = previewCanvas.getContext('2d');
    const color = inputColor?.value || '#4F46E5';

    if (currentMode === 'card') {
      // 3.5 x 2 ratio preview (e.g. 700 x 400 px)
      previewCanvas.width = 700;
      previewCanvas.height = 400;

      // Background
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, 700, 400);

      // Accent element
      ctx.fillStyle = color;
      ctx.fillRect(0, 0, 16, 400); // Left bar
      ctx.fillRect(0, 0, 700, 8);  // Top trim

      // Draw Logo if exists
      if (logoImage) {
        ctx.drawImage(logoImage, 50, 40, 70, 70);
      } else {
        // Decorative geometric logo placeholder
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(85, 75, 25, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 24px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText((inputCompany?.value || 'M')[0].toUpperCase(), 85, 84);
      }

      // Company Name
      ctx.textAlign = 'left';
      ctx.fillStyle = '#0F172A';
      ctx.font = 'bold 24px sans-serif';
      ctx.fillText(inputCompany?.value || 'ACME Corporation Inc.', 135, 70);

      ctx.fillStyle = '#64748B';
      ctx.font = '14px sans-serif';
      ctx.fillText('Professional Services Group', 135, 92);

      // Name & Title
      ctx.fillStyle = '#0F172A';
      ctx.font = 'bold 30px sans-serif';
      ctx.fillText(inputFullName?.value || 'Alex Morgan', 50, 200);

      ctx.fillStyle = color;
      ctx.font = 'bold 16px sans-serif';
      ctx.fillText((inputTitle?.value || 'Senior Managing Director').toUpperCase(), 50, 230);

      // Dividing rule
      ctx.strokeStyle = '#E2E8F0';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(50, 255);
      ctx.lineTo(650, 255);
      ctx.stroke();

      // Contact details in 2 columns
      ctx.font = '14px sans-serif';
      ctx.fillStyle = '#334155';

      // Col 1
      ctx.fillText('📞 ' + (inputPhone?.value || '+1 (555) 234-5678'), 50, 290);
      ctx.fillText('✉️ ' + (inputEmail?.value || 'alex.morgan@example.com'), 50, 325);

      // Col 2
      ctx.fillText('🌐 ' + (inputWebsite?.value || 'www.acmecorp.com'), 360, 290);
      ctx.fillText('📍 ' + (inputAddress?.value || '123 Wall Street, New York, NY 10005'), 360, 325);

    } else {
      // Letterhead Preview (8.5 x 11 ratio e.g. 510 x 660 px)
      previewCanvas.width = 510;
      previewCanvas.height = 660;

      // Clean white sheet
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, 510, 660);

      // Top Modern Header
      ctx.fillStyle = color;
      ctx.fillRect(0, 0, 510, 10);
      ctx.fillRect(30, 25, 450, 2);

      // Company info
      ctx.fillStyle = '#0F172A';
      ctx.font = 'bold 22px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(lhCompany?.value || inputCompany?.value || 'MultiTools Hub Enterprises LLC', 30, 55);

      ctx.fillStyle = '#64748B';
      ctx.font = 'italic 12px sans-serif';
      ctx.fillText(lhTagline?.value || 'Quality • Innovation • Reliability', 30, 75);

      // Header contact info right-aligned
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'right';
      ctx.fillStyle = '#475569';
      ctx.fillText(inputPhone?.value || '+1 (555) 019-2834', 480, 50);
      ctx.fillText(inputEmail?.value || 'contact@multitools-hub.com', 480, 65);
      ctx.fillText(inputAddress?.value || '100 Broadway, Ste 400, New York, NY', 480, 80);

      // Simulated letter text placeholder lines
      ctx.strokeStyle = '#F1F5F9';
      ctx.lineWidth = 6;
      for (let y = 140; y < 540; y += 18) {
        ctx.beginPath();
        ctx.moveTo(30, y);
        ctx.lineTo(y % 36 === 0 ? 380 : 480, y);
        ctx.stroke();
      }

      // Bottom Footer Bar
      ctx.fillStyle = '#E2E8F0';
      ctx.fillRect(30, 615, 450, 1);

      ctx.textAlign = 'center';
      ctx.font = '10px sans-serif';
      ctx.fillStyle = '#94A3B8';
      ctx.fillText(lhFooter?.value || 'Confidential & Proprietary • MultiTools Hub Document System', 255, 635);
    }
  }

  // Live input triggers
  const allInputs = [
    inputFullName, inputTitle, inputCompany, inputPhone, inputEmail,
    inputWebsite, inputAddress, inputColor, lhCompany, lhTagline, lhContact, lhFooter
  ];
  allInputs.forEach(inp => {
    if (inp) inp.addEventListener('input', renderPreview);
  });

  // PDF Generation with PDFLib
  if (downloadPdfBtn) {
    downloadPdfBtn.addEventListener('click', async () => {
      downloadPdfBtn.disabled = true;
      downloadPdfBtn.innerHTML = '<i data-lucide="loader" class="w-4 h-4 animate-spin"></i> Generating PDF...';
      if (window.lucide) window.lucide.createIcons();

      try {
        if (typeof PDFLib === 'undefined') {
          throw new Error('PDFLib is not loaded');
        }

        const { PDFDocument, rgb, StandardFonts } = PDFLib;
        const pdfDoc = await PDFDocument.create();

        // 8.5 x 11 inches in PDF points (72 points per inch)
        // Width: 8.5 * 72 = 612 pts, Height: 11 * 72 = 792 pts
        const page = pdfDoc.addPage([612, 792]);
        const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
        const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);

        // Convert hex color to rgb
        const hex = (inputColor?.value || '#4F46E5').replace('#', '');
        const r = parseInt(hex.substring(0, 2), 16) / 255;
        const g = parseInt(hex.substring(2, 4), 16) / 255;
        const b = parseInt(hex.substring(4, 6), 16) / 255;
        const brandRgb = rgb(r, g, b);

        if (currentMode === 'card') {
          // Standard Avery 5371 10-Up Business Card Layout
          // Sheet: 8.5 x 11 in
          // Margins: Top 0.5 in (36 pt), Left 0.75 in (54 pt)
          // Card dimensions: 3.5 in wide (252 pt) x 2.0 in high (144 pt)
          // Grid: 2 columns x 5 rows = 10 cards per sheet!
          const cardWidth = 252;
          const cardHeight = 144;
          const leftMargin = 54;
          const topMargin = 792 - 36; // from bottom

          for (let row = 0; row < 5; row++) {
            for (let col = 0; col < 2; col++) {
              const x = leftMargin + col * cardWidth;
              const y = topMargin - (row + 1) * cardHeight;

              // Card boundary crop outline
              page.drawRectangle({
                x,
                y,
                width: cardWidth,
                height: cardHeight,
                borderColor: rgb(0.85, 0.85, 0.85),
                borderWidth: 0.5,
              });

              // Left Accent Line
              page.drawRectangle({
                x,
                y,
                width: 6,
                height: cardHeight,
                color: brandRgb,
              });

              // Company
              page.drawText(inputCompany?.value || 'ACME Corporation Inc.', {
                x: x + 18,
                y: y + cardHeight - 25,
                size: 10,
                font: helveticaBold,
                color: rgb(0.1, 0.1, 0.1),
              });

              // Name
              page.drawText(inputFullName?.value || 'Alex Morgan', {
                x: x + 18,
                y: y + cardHeight - 55,
                size: 13,
                font: helveticaBold,
                color: rgb(0.05, 0.05, 0.05),
              });

              // Title
              page.drawText((inputTitle?.value || 'Senior Director').toUpperCase(), {
                x: x + 18,
                y: y + cardHeight - 70,
                size: 7.5,
                font: helveticaBold,
                color: brandRgb,
              });

              // Dividing line
              page.drawLine({
                start: { x: x + 18, y: y + cardHeight - 80 },
                end: { x: x + cardWidth - 18, y: y + cardHeight - 80 },
                thickness: 0.5,
                color: rgb(0.85, 0.85, 0.85),
              });

              // Details
              page.drawText(`Phone: ${inputPhone?.value || '+1 555-234-5678'}`, {
                x: x + 18,
                y: y + cardHeight - 96,
                size: 7.5,
                font: helvetica,
                color: rgb(0.2, 0.2, 0.2),
              });

              page.drawText(`Email: ${inputEmail?.value || 'alex@example.com'}`, {
                x: x + 18,
                y: y + cardHeight - 110,
                size: 7.5,
                font: helvetica,
                color: rgb(0.2, 0.2, 0.2),
              });

              page.drawText(`Web: ${inputWebsite?.value || 'www.acme.com'}`, {
                x: x + 18,
                y: y + cardHeight - 124,
                size: 7.5,
                font: helvetica,
                color: rgb(0.2, 0.2, 0.2),
              });
            }
          }

          // Crop Marks on sheet corners
          const drawCrop = (cx, cy) => {
            page.drawLine({ start: { x: cx - 10, y: cy }, end: { x: cx + 10, y: cy }, thickness: 0.5, color: rgb(0.6, 0.6, 0.6) });
            page.drawLine({ start: { x: cx, y: cy - 10 }, end: { x: cx, y: cy + 10 }, thickness: 0.5, color: rgb(0.6, 0.6, 0.6) });
          };
          drawCrop(leftMargin, topMargin);
          drawCrop(leftMargin + 2 * cardWidth, topMargin);
          drawCrop(leftMargin, topMargin - 5 * cardHeight);
          drawCrop(leftMargin + 2 * cardWidth, topMargin - 5 * cardHeight);

        } else {
          // Official US Letterhead Layout (8.5 x 11 in)
          // Top Brand Stripe
          page.drawRectangle({
            x: 0,
            y: 782,
            width: 612,
            height: 10,
            color: brandRgb,
          });

          // Company
          page.drawText(lhCompany?.value || inputCompany?.value || 'MultiTools Hub Enterprises LLC', {
            x: 45,
            y: 735,
            size: 18,
            font: helveticaBold,
            color: rgb(0.08, 0.08, 0.1),
          });

          page.drawText(lhTagline?.value || 'Quality • Innovation • Reliability', {
            x: 45,
            y: 718,
            size: 9.5,
            font: helvetica,
            color: rgb(0.4, 0.4, 0.4),
          });

          // Right Contact Details in Header
          page.drawText(inputPhone?.value || '+1 (555) 019-2834', {
            x: 450,
            y: 740,
            size: 8.5,
            font: helvetica,
            color: rgb(0.25, 0.25, 0.25),
          });
          page.drawText(inputEmail?.value || 'contact@multitools-hub.com', {
            x: 450,
            y: 726,
            size: 8.5,
            font: helvetica,
            color: rgb(0.25, 0.25, 0.25),
          });
          page.drawText(inputAddress?.value || '100 Broadway, Ste 400, New York, NY', {
            x: 450,
            y: 712,
            size: 8.5,
            font: helvetica,
            color: rgb(0.25, 0.25, 0.25),
          });

          // Header separator line
          page.drawLine({
            start: { x: 45, y: 698 },
            end: { x: 567, y: 698 },
            thickness: 1,
            color: brandRgb,
          });

          // Bottom Footer Bar
          page.drawLine({
            start: { x: 45, y: 55 },
            end: { x: 567, y: 55 },
            thickness: 0.5,
            color: rgb(0.85, 0.85, 0.85),
          });

          page.drawText(lhFooter?.value || 'Official Corporate Correspondence • Privileged and Confidential', {
            x: 160,
            y: 40,
            size: 8,
            font: helvetica,
            color: rgb(0.5, 0.5, 0.5),
          });
        }

        const pdfBytes = await pdfDoc.save();
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = currentMode === 'card'
          ? 'US-Business-Cards-10Up-Print-Sheet.pdf'
          : 'Official-US-Letterhead-Layout.pdf';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        if (window.showToast) window.showToast('High-resolution PDF generated and downloaded!');
      } catch (err) {
        console.error(err);
        if (window.showToast) window.showToast('Failed to generate PDF: ' + err.message, 'error');
      } finally {
        downloadPdfBtn.disabled = false;
        downloadPdfBtn.innerHTML = '<i data-lucide="download" class="w-4 h-4"></i> Download Print-Ready PDF';
        if (window.lucide) window.lucide.createIcons();
      }
    });
  }

  // Initial render
  renderPreview();
});
