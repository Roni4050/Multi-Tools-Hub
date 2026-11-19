/**
 * Tool 11: Amazon KDP & Print Bleed Calculator
 * Precise KDP cover calculation with interactive canvas blueprint and template export
 */

document.addEventListener('DOMContentLoaded', () => {
  const trimSelect = document.getElementById('trim-size-select');
  const customTrimBox = document.getElementById('custom-trim-box');
  const customWInput = document.getElementById('custom-trim-w');
  const customHInput = document.getElementById('custom-trim-h');

  const pageCountInput = document.getElementById('page-count-input');
  const paperTypeSelect = document.getElementById('paper-type-select');
  const bleedSelect = document.getElementById('bleed-select');

  // Outputs
  const spineInchesEl = document.getElementById('out-spine-in');
  const spineMmEl = document.getElementById('out-spine-mm');
  const fullCoverInchesEl = document.getElementById('out-full-in');
  const fullCoverPixelsEl = document.getElementById('out-full-px');
  const safeMarginEl = document.getElementById('out-safe-margin');

  const blueprintCanvas = document.getElementById('kdp-blueprint-canvas');
  const ctx = blueprintCanvas ? blueprintCanvas.getContext('2d') : null;

  const downloadTemplateBtn = document.getElementById('download-kdp-template-btn');
  const copyDimsBtn = document.getElementById('copy-kdp-dims-btn');

  // Paper multipliers (inches per page for Amazon KDP)
  const CALIPERS = {
    white: 0.002252,
    cream: 0.002500,
    color: 0.002347
  };

  const TRIM_PRESETS = {
    '6x9': { w: 6.0, h: 9.0 },
    '5x8': { w: 5.0, h: 8.0 },
    '5.5x8.5': { w: 5.5, h: 8.5 },
    '7x10': { w: 7.0, h: 10.0 },
    '8.5x11': { w: 8.5, h: 11.0 },
    '8.5x8.5': { w: 8.5, h: 8.5 }
  };

  function calculateKdp() {
    let trimW = 6.0;
    let trimH = 9.0;

    const trimChoice = trimSelect ? trimSelect.value : '6x9';
    if (trimChoice === 'custom') {
      if (customTrimBox) customTrimBox.classList.remove('hidden');
      trimW = parseFloat(customWInput.value) || 6.0;
      trimH = parseFloat(customHInput.value) || 9.0;
    } else {
      if (customTrimBox) customTrimBox.classList.add('hidden');
      if (TRIM_PRESETS[trimChoice]) {
        trimW = TRIM_PRESETS[trimChoice].w;
        trimH = TRIM_PRESETS[trimChoice].h;
      }
    }

    const pages = Math.max(24, parseInt(pageCountInput.value, 10) || 120);
    const paper = paperTypeSelect ? paperTypeSelect.value : 'white';
    const hasBleed = bleedSelect ? bleedSelect.value === 'yes' : true;
    const bleedVal = hasBleed ? 0.125 : 0.0;

    const caliper = CALIPERS[paper] || CALIPERS.white;
    const spineW = pages * caliper;

    // Full cover calculations
    const fullCoverW = bleedVal + trimW + spineW + trimW + bleedVal;
    const fullCoverH = bleedVal + trimH + bleedVal;

    const fullCoverPxW = Math.round(fullCoverW * 300);
    const fullCoverPxH = Math.round(fullCoverH * 300);

    // Display numbers
    if (spineInchesEl) spineInchesEl.textContent = `${spineW.toFixed(3)}"`;
    if (spineMmEl) spineMmEl.textContent = `${(spineW * 25.4).toFixed(2)} mm`;
    if (fullCoverInchesEl) fullCoverInchesEl.textContent = `${fullCoverW.toFixed(3)}" × ${fullCoverH.toFixed(3)}"`;
    if (fullCoverPixelsEl) fullCoverPixelsEl.textContent = `${fullCoverPxW} × ${fullCoverPxH} px`;
    if (safeMarginEl) safeMarginEl.textContent = `0.25" (~6.4mm) from all trim edges`;

    drawBlueprint(trimW, trimH, spineW, bleedVal, fullCoverW, fullCoverH, pages);
  }

  function drawBlueprint(trimW, trimH, spineW, bleed, fullW, fullH, pages) {
    if (!ctx || !blueprintCanvas) return;

    const w = 1200;
    const h = 640;
    blueprintCanvas.width = w;
    blueprintCanvas.height = h;

    // Background
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, w, h);

    const padding = 60;
    const drawAreaW = w - padding * 2;
    const drawAreaH = h - padding * 2;

    const scale = Math.min(drawAreaW / fullW, drawAreaH / fullH);
    const renderW = fullW * scale;
    const renderH = fullH * scale;

    const startX = (w - renderW) / 2;
    const startY = (h - renderH) / 2;

    const bleedPx = bleed * scale;
    const trimWPx = trimW * scale;
    const trimHPx = trimH * scale;
    const spineWPx = spineW * scale;

    // 1. Bleed Background
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(startX, startY, renderW, renderH);

    // 2. Bleed Outline (Red Dashed)
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 6]);
    ctx.strokeRect(startX, startY, renderW, renderH);
    ctx.setLineDash([]);

    // Coordinates for trims
    const backLeft = startX + bleedPx;
    const spineLeft = backLeft + trimWPx;
    const frontLeft = spineLeft + spineWPx;
    const contentTop = startY + bleedPx;

    // 3. Back Cover Area
    ctx.fillStyle = '#334155';
    ctx.fillRect(backLeft, contentTop, trimWPx, trimHPx);
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(backLeft, contentTop, trimWPx, trimHPx);

    // 4. Spine Area
    ctx.fillStyle = '#475569';
    ctx.fillRect(spineLeft, contentTop, spineWPx, trimHPx);
    ctx.strokeStyle = '#94a3b8';
    ctx.strokeRect(spineLeft, contentTop, spineWPx, trimHPx);

    // 5. Front Cover Area
    ctx.fillStyle = '#334155';
    ctx.fillRect(frontLeft, contentTop, trimWPx, trimHPx);
    ctx.strokeStyle = '#64748b';
    ctx.strokeRect(frontLeft, contentTop, trimWPx, trimHPx);

    // 6. Safe Margin Guides (Green dashed)
    const safeMarginPx = 0.25 * scale;
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);

    // Back cover safe zone
    ctx.strokeRect(
      backLeft + safeMarginPx,
      contentTop + safeMarginPx,
      trimWPx - safeMarginPx * 2,
      trimHPx - safeMarginPx * 2
    );

    // Front cover safe zone
    ctx.strokeRect(
      frontLeft + safeMarginPx,
      contentTop + safeMarginPx,
      trimWPx - safeMarginPx * 2,
      trimHPx - safeMarginPx * 2
    );
    ctx.setLineDash([]);

    // 7. Barcode Box (Standard 2" x 1.2" on bottom of back cover)
    const barcodeW = 2.0 * scale;
    const barcodeH = 1.2 * scale;
    const barcodeX = backLeft + safeMarginPx + 10;
    const barcodeY = contentTop + trimHPx - safeMarginPx - barcodeH - 10;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.fillRect(barcodeX, barcodeY, barcodeW, barcodeH);
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Barcode Zone', barcodeX + barcodeW / 2, barcodeY + barcodeH / 2 + 4);

    // Labels & Text
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';

    // Back Cover Label
    ctx.font = 'bold 18px sans-serif';
    ctx.fillText('BACK COVER', backLeft + trimWPx / 2, contentTop + trimHPx / 2 - 15);
    ctx.font = '14px sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText(`${trimW}" × ${trimH}"`, backLeft + trimWPx / 2, contentTop + trimHPx / 2 + 15);

    // Spine Label
    if (spineWPx > 20) {
      ctx.save();
      ctx.translate(spineLeft + spineWPx / 2, contentTop + trimHPx / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 14px sans-serif';
      ctx.fillText(`SPINE (${spineW.toFixed(3)}") • ${pages} pages`, 0, 4);
      ctx.restore();
    }

    // Front Cover Label
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 18px sans-serif';
    ctx.fillText('FRONT COVER', frontLeft + trimWPx / 2, contentTop + trimHPx / 2 - 15);
    ctx.font = '14px sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText(`${trimW}" × ${trimH}"`, frontLeft + trimWPx / 2, contentTop + trimHPx / 2 + 15);

    // Dimensions banner
    ctx.fillStyle = '#818cf8';
    ctx.font = 'bold 15px monospace';
    ctx.fillText(`Total Blueprint: ${fullW.toFixed(3)}" × ${fullH.toFixed(3)}" @ 300 DPI (${Math.round(fullW * 300)} × ${Math.round(fullH * 300)} px)`, w / 2, startY - 18);
  }

  // Listeners
  if (trimSelect) trimSelect.addEventListener('change', calculateKdp);
  if (customWInput) customWInput.addEventListener('input', calculateKdp);
  if (customHInput) customHInput.addEventListener('input', calculateKdp);
  if (pageCountInput) pageCountInput.addEventListener('input', calculateKdp);
  if (paperTypeSelect) paperTypeSelect.addEventListener('change', calculateKdp);
  if (bleedSelect) bleedSelect.addEventListener('change', calculateKdp);

  // Copy dimensions
  if (copyDimsBtn) {
    copyDimsBtn.addEventListener('click', () => {
      const text = `Amazon KDP Dimensions:\nSpine Width: ${spineInchesEl.textContent} (${spineMmEl.textContent})\nFull Cover: ${fullCoverInchesEl.textContent}\nResolution: ${fullCoverPixelsEl.textContent} (300 DPI)`;
      window.copyToClipboard(text, 'KDP dimensions copied to clipboard!');
    });
  }

  // Download high-resolution PNG template
  if (downloadTemplateBtn) {
    downloadTemplateBtn.addEventListener('click', () => {
      blueprintCanvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `kdp-cover-blueprint-${Date.now()}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 5000);
        window.showToast('KDP template blueprint downloaded!', 'success');
      });
    });
  }

  // Initial render
  calculateKdp();
});
