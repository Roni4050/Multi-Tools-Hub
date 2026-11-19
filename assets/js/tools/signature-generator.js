/**
 * MultiTools Hub - US Signature & Initials Maker (Transparent PNG & SVG)
 * 100% Client-side Canvas drawing + SVG vector path export + Cursive font rendering
 */
(function SignatureMakerModule() {
  'use strict';

  let currentMode = 'draw'; // 'draw' or 'type'
  let drawCanvas, drawCtx;
  let isDrawing = false;
  let inkColor = '#0f172a'; // Deep slate / black standard
  let strokeWidth = 3;
  let paths = []; // Array of { points: [{x, y}], color, width }
  let currentPath = [];

  // Type Mode State
  let typedName = 'Alexander Hamilton';
  let typedInitials = 'AH';
  let selectedFont = 'Dancing Script';
  let typeColor = '#0f172a';

  function init() {
    initTabs();
    initDrawCanvas();
    initDrawControls();
    initTypeControls();
    initExportButtons();
    loadSampleSignature();
  }

  function initTabs() {
    const tabBtns = document.querySelectorAll('[data-sig-tab]');
    const panels = document.querySelectorAll('[data-sig-panel]');

    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const target = btn.getAttribute('data-sig-tab');
        currentMode = target;

        tabBtns.forEach(b => {
          b.classList.remove('bg-indigo-600', 'text-white', 'shadow-sm');
          b.classList.add('text-slate-600', 'dark:text-slate-300', 'bg-transparent');
        });
        btn.classList.add('bg-indigo-600', 'text-white', 'shadow-sm');
        btn.classList.remove('text-slate-600', 'dark:text-slate-300', 'bg-transparent');

        panels.forEach(p => {
          p.classList.toggle('hidden', p.getAttribute('data-sig-panel') !== target);
        });

        if (target === 'type') {
          renderTypePreview();
        }
      });
    });
  }

  function initDrawCanvas() {
    drawCanvas = document.getElementById('sig-draw-canvas');
    if (!drawCanvas) return;
    drawCtx = drawCanvas.getContext('2d');

    // Canvas sizing
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Mouse events
    drawCanvas.addEventListener('mousedown', (e) => {
      isDrawing = true;
      const pt = getCanvasCoordinates(e);
      currentPath = [pt];
      paths.push({ points: currentPath, color: inkColor, width: strokeWidth });
      redrawCanvas();
    });

    window.addEventListener('mousemove', (e) => {
      if (!isDrawing) return;
      const pt = getCanvasCoordinates(e);
      currentPath.push(pt);
      redrawCanvas();
    });

    window.addEventListener('mouseup', () => {
      isDrawing = false;
    });

    // Touch events for phone/tablet/stylus
    drawCanvas.addEventListener('touchstart', (e) => {
      if (e.touches.length !== 1) return;
      e.preventDefault();
      isDrawing = true;
      const pt = getTouchCoordinates(e.touches[0]);
      currentPath = [pt];
      paths.push({ points: currentPath, color: inkColor, width: strokeWidth });
      redrawCanvas();
    }, { passive: false });

    drawCanvas.addEventListener('touchmove', (e) => {
      if (!isDrawing || e.touches.length !== 1) return;
      e.preventDefault();
      const pt = getTouchCoordinates(e.touches[0]);
      currentPath.push(pt);
      redrawCanvas();
    }, { passive: false });

    drawCanvas.addEventListener('touchend', () => {
      isDrawing = false;
    });
  }

  function resizeCanvas() {
    if (!drawCanvas) return;
    // Keep internal coordinate resolution high (1200x400)
    drawCanvas.width = 1200;
    drawCanvas.height = 400;
    redrawCanvas();
  }

  function getCanvasCoordinates(e) {
    const rect = drawCanvas.getBoundingClientRect();
    const scaleX = drawCanvas.width / rect.width;
    const scaleY = drawCanvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  }

  function getTouchCoordinates(touch) {
    const rect = drawCanvas.getBoundingClientRect();
    const scaleX = drawCanvas.width / rect.width;
    const scaleY = drawCanvas.height / rect.height;
    return {
      x: (touch.clientX - rect.left) * scaleX,
      y: (touch.clientY - rect.top) * scaleY
    };
  }

  function redrawCanvas() {
    if (!drawCtx) return;
    drawCtx.clearRect(0, 0, drawCanvas.width, drawCanvas.height);

    // Draw baseline guideline
    drawCtx.save();
    drawCtx.strokeStyle = 'rgba(203, 213, 225, 0.4)';
    drawCtx.lineWidth = 2;
    drawCtx.setLineDash([8, 8]);
    drawCtx.beginPath();
    drawCtx.moveTo(80, 280);
    drawCtx.lineTo(1120, 280);
    drawCtx.stroke();
    drawCtx.restore();

    // Draw all strokes with smooth quadratic curves
    paths.forEach(p => {
      if (!p.points || p.points.length === 0) return;
      drawCtx.strokeStyle = p.color;
      drawCtx.lineWidth = p.width;
      drawCtx.lineCap = 'round';
      drawCtx.lineJoin = 'round';

      drawCtx.beginPath();
      if (p.points.length === 1) {
        drawCtx.arc(p.points[0].x, p.points[0].y, p.width / 2, 0, Math.PI * 2);
        drawCtx.fillStyle = p.color;
        drawCtx.fill();
        return;
      }

      drawCtx.moveTo(p.points[0].x, p.points[0].y);
      for (let i = 1; i < p.points.length - 1; i++) {
        const xc = (p.points[i].x + p.points[i + 1].x) / 2;
        const yc = (p.points[i].y + p.points[i + 1].y) / 2;
        drawCtx.quadraticCurveTo(p.points[i].x, p.points[i].y, xc, yc);
      }
      // Last point
      drawCtx.lineTo(p.points[p.points.length - 1].x, p.points[p.points.length - 1].y);
      drawCtx.stroke();
    });
  }

  function initDrawControls() {
    const clearBtn = document.getElementById('sig-draw-clear');
    const undoBtn = document.getElementById('sig-draw-undo');
    const strokeSlider = document.getElementById('sig-stroke-width');
    const strokeVal = document.getElementById('sig-stroke-val');
    const colorPills = document.querySelectorAll('[data-sig-color]');
    const customColorInput = document.getElementById('sig-custom-color');

    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        paths = [];
        redrawCanvas();
        if (window.showToast) window.showToast('Canvas cleared', 'info');
      });
    }

    if (undoBtn) {
      undoBtn.addEventListener('click', () => {
        if (paths.length > 0) {
          paths.pop();
          redrawCanvas();
        }
      });
    }

    if (strokeSlider) {
      strokeSlider.addEventListener('input', () => {
        strokeWidth = parseInt(strokeSlider.value, 10);
        if (strokeVal) strokeVal.textContent = strokeWidth + 'px';
      });
    }

    colorPills.forEach(pill => {
      pill.addEventListener('click', () => {
        inkColor = pill.getAttribute('data-sig-color');
        typeColor = inkColor;
        colorPills.forEach(p => p.classList.remove('ring-2', 'ring-indigo-500', 'ring-offset-2'));
        pill.classList.add('ring-2', 'ring-indigo-500', 'ring-offset-2');
        renderTypePreview();
      });
    });

    if (customColorInput) {
      customColorInput.addEventListener('input', () => {
        inkColor = customColorInput.value;
        typeColor = inkColor;
        renderTypePreview();
      });
    }
  }

  function initTypeControls() {
    const nameInput = document.getElementById('sig-type-name');
    const initInput = document.getElementById('sig-type-initials');
    const fontCards = document.querySelectorAll('[data-sig-font]');

    if (nameInput) {
      nameInput.addEventListener('input', () => {
        typedName = nameInput.value || 'Your Signature';
        renderTypePreview();
      });
    }

    if (initInput) {
      initInput.addEventListener('input', () => {
        typedInitials = initInput.value || 'YS';
        renderTypePreview();
      });
    }

    fontCards.forEach(card => {
      card.addEventListener('click', () => {
        selectedFont = card.getAttribute('data-sig-font');
        fontCards.forEach(c => c.classList.remove('border-indigo-600', 'bg-indigo-50/50', 'dark:bg-indigo-950/40'));
        card.classList.add('border-indigo-600', 'bg-indigo-50/50', 'dark:bg-indigo-950/40');
        renderTypePreview();
      });
    });
  }

  function renderTypePreview() {
    const previewNameEl = document.getElementById('sig-type-preview-name');
    const previewInitEl = document.getElementById('sig-type-preview-initials');

    if (previewNameEl) {
      previewNameEl.textContent = typedName;
      previewNameEl.style.fontFamily = `'${selectedFont}', cursive`;
      previewNameEl.style.color = typeColor;
    }

    if (previewInitEl) {
      previewInitEl.textContent = typedInitials;
      previewInitEl.style.fontFamily = `'${selectedFont}', cursive`;
      previewInitEl.style.color = typeColor;
    }
  }

  function loadSampleSignature() {
    // Generate a natural-looking signature path for Alexander Hamilton
    paths = [];
    const color = '#1e3a8a'; // Deep Navy
    const w = 4;

    // Capital A flourish
    paths.push({
      color, width: w,
      points: [
        { x: 180, y: 280 }, { x: 220, y: 150 }, { x: 240, y: 120 },
        { x: 270, y: 220 }, { x: 300, y: 280 }, { x: 320, y: 270 },
        { x: 210, y: 220 }, { x: 330, y: 210 }
      ]
    });

    // Cursive 'lexander'
    paths.push({
      color, width: w - 1,
      points: [
        { x: 320, y: 270 }, { x: 340, y: 230 }, { x: 350, y: 260 },
        { x: 370, y: 230 }, { x: 380, y: 265 }, { x: 400, y: 240 },
        { x: 420, y: 270 }, { x: 440, y: 235 }, { x: 460, y: 270 },
        { x: 490, y: 230 }, { x: 510, y: 265 }
      ]
    });

    // Capital H loop
    paths.push({
      color, width: w,
      points: [
        { x: 570, y: 140 }, { x: 560, y: 280 }, { x: 560, y: 210 },
        { x: 620, y: 210 }, { x: 620, y: 130 }, { x: 620, y: 280 }
      ]
    });

    // Cursive 'amilton' with underline flourish
    paths.push({
      color, width: w - 1,
      points: [
        { x: 620, y: 270 }, { x: 640, y: 245 }, { x: 660, y: 270 },
        { x: 680, y: 230 }, { x: 700, y: 270 }, { x: 730, y: 220 },
        { x: 760, y: 270 }, { x: 790, y: 240 }, { x: 820, y: 265 },
        // Underline flourish
        { x: 840, y: 280 }, { x: 700, y: 310 }, { x: 400, y: 320 },
        { x: 200, y: 310 }, { x: 350, y: 330 }, { x: 750, y: 325 }
      ]
    });

    redrawCanvas();
    renderTypePreview();
  }

  function initExportButtons() {
    const pngBtn = document.getElementById('sig-download-png');
    const svgBtn = document.getElementById('sig-download-svg');
    const sampleBtn = document.getElementById('sig-sample-btn');

    if (sampleBtn) sampleBtn.addEventListener('click', loadSampleSignature);

    if (pngBtn) {
      pngBtn.addEventListener('click', downloadTransparentPng);
    }

    if (svgBtn) {
      svgBtn.addEventListener('click', downloadVectorSvg);
    }
  }

  function downloadTransparentPng() {
    if (currentMode === 'draw') {
      if (paths.length === 0) {
        if (window.showToast) window.showToast('Please draw your signature first', 'info');
        return;
      }

      // Create pure transparent canvas without guide lines
      const exportCanvas = document.createElement('canvas');
      exportCanvas.width = 1200;
      exportCanvas.height = 400;
      const exportCtx = exportCanvas.getContext('2d');

      paths.forEach(p => {
        if (!p.points || p.points.length === 0) return;
        exportCtx.strokeStyle = p.color;
        exportCtx.lineWidth = p.width;
        exportCtx.lineCap = 'round';
        exportCtx.lineJoin = 'round';

        exportCtx.beginPath();
        if (p.points.length === 1) {
          exportCtx.arc(p.points[0].x, p.points[0].y, p.width / 2, 0, Math.PI * 2);
          exportCtx.fillStyle = p.color;
          exportCtx.fill();
          return;
        }

        exportCtx.moveTo(p.points[0].x, p.points[0].y);
        for (let i = 1; i < p.points.length - 1; i++) {
          const xc = (p.points[i].x + p.points[i + 1].x) / 2;
          const yc = (p.points[i].y + p.points[i + 1].y) / 2;
          exportCtx.quadraticCurveTo(p.points[i].x, p.points[i].y, xc, yc);
        }
        exportCtx.lineTo(p.points[p.points.length - 1].x, p.points[p.points.length - 1].y);
        exportCtx.stroke();
      });

      exportCanvas.toBlob((blob) => {
        saveBlob(blob, 'my-digital-signature.png');
      }, 'image/png');

    } else {
      // Type Mode: render font to transparent canvas
      const exportCanvas = document.createElement('canvas');
      exportCanvas.width = 1200;
      exportCanvas.height = 400;
      const exportCtx = exportCanvas.getContext('2d');

      exportCtx.font = `90px '${selectedFont}', cursive`;
      exportCtx.fillStyle = typeColor;
      exportCtx.textAlign = 'center';
      exportCtx.textBaseline = 'middle';
      exportCtx.fillText(typedName, 600, 200);

      exportCanvas.toBlob((blob) => {
        saveBlob(blob, `${typedName.toLowerCase().replace(/\s+/g, '-')}-signature.png`);
      }, 'image/png');
    }
  }

  function downloadVectorSvg() {
    if (currentMode === 'draw') {
      if (paths.length === 0) {
        if (window.showToast) window.showToast('Please draw your signature first', 'info');
        return;
      }

      let svgPaths = '';
      paths.forEach(p => {
        if (!p.points || p.points.length === 0) return;
        let d = `M ${p.points[0].x.toFixed(1)} ${p.points[0].y.toFixed(1)}`;
        for (let i = 1; i < p.points.length - 1; i++) {
          const xc = (p.points[i].x + p.points[i + 1].x) / 2;
          const yc = (p.points[i].y + p.points[i + 1].y) / 2;
          d += ` Q ${p.points[i].x.toFixed(1)} ${p.points[i].y.toFixed(1)}, ${xc.toFixed(1)} ${yc.toFixed(1)}`;
        }
        if (p.points.length > 1) {
          const last = p.points[p.points.length - 1];
          d += ` L ${last.x.toFixed(1)} ${last.y.toFixed(1)}`;
        }
        svgPaths += `<path d="${d}" fill="none" stroke="${p.color}" stroke-width="${p.width}" stroke-linecap="round" stroke-linejoin="round"/>\n  `;
      });

      const svgString = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 400" width="1200" height="400">
  <title>Digital Signature</title>
  ${svgPaths}
</svg>`;

      const blob = new Blob([svgString], { type: 'image/svg+xml' });
      saveBlob(blob, 'my-digital-signature.svg');

    } else {
      // Type mode vector SVG with embedded font
      const svgString = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 400" width="1200" height="400">
  <title>${escapeXml(typedName)} Signature</title>
  <defs>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=${encodeURIComponent(selectedFont)}&amp;display=swap');
      .sig-text { font-family: '${selectedFont}', cursive; font-size: 90px; fill: ${typeColor}; text-anchor: middle; dominant-baseline: middle; }
    </style>
  </defs>
  <text x="600" y="200" class="sig-text">${escapeXml(typedName)}</text>
</svg>`;

      const blob = new Blob([svgString], { type: 'image/svg+xml' });
      saveBlob(blob, `${typedName.toLowerCase().replace(/\s+/g, '-')}-signature.svg`);
    }
  }

  function saveBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    if (window.showToast) window.showToast(`Saved ${filename}`, 'success');
  }

  function escapeXml(unsafe) {
    return (unsafe || '').replace(/[<>&'"]/g, c => {
      switch (c) {
        case '<': return '&lt;';
        case '>': return '&gt;';
        case '&': return '&amp;';
        case '\'': return '&apos;';
        case '"': return '&quot;';
      }
    });
  }

  document.addEventListener('DOMContentLoaded', init);
})();
