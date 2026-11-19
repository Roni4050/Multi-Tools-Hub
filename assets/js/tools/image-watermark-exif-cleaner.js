/**
 * Tool 8: Image Watermark & EXIF Metadata Cleaner
 * 100% Client-side EXIF sanitization & customizable watermark overlay
 */

document.addEventListener('DOMContentLoaded', () => {
  const dropZone = document.getElementById('watermark-dropzone');
  const fileInput = document.getElementById('watermark-file-input');
  const workspace = document.getElementById('watermark-workspace');
  const canvas = document.getElementById('watermark-canvas');
  const ctx = canvas ? canvas.getContext('2d') : null;

  // Controls
  const modeCleanOnlyRadio = document.getElementById('mode-clean-only');
  const modeWatermarkRadio = document.getElementById('mode-watermark');
  const watermarkOptionsBox = document.getElementById('watermark-options');

  const wmTextInput = document.getElementById('wm-text');
  const wmColorInput = document.getElementById('wm-color');
  const wmFontSizeInput = document.getElementById('wm-fontsize');
  const wmFontSizeVal = document.getElementById('wm-fontsize-val');
  const wmOpacityInput = document.getElementById('wm-opacity');
  const wmOpacityVal = document.getElementById('wm-opacity-val');
  const wmPositionSelect = document.getElementById('wm-position');
  const wmOutputFormat = document.getElementById('wm-output-format');

  const resetBtn = document.getElementById('wm-reset-btn');
  const sampleBtn = document.getElementById('watermark-sample-btn');
  const downloadBtn = document.getElementById('wm-download-btn');
  const metaCleanBadge = document.getElementById('meta-clean-badge');

  let currentImage = null;
  let originalFileName = 'sanitized-image';

  if (!canvas || !dropZone || !fileInput) return;

  if (sampleBtn) {
    sampleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const c = document.createElement('canvas');
      c.width = 1600;
      c.height = 1000;
      const cctx = c.getContext('2d');
      // Rich gradient & graphics
      const g = cctx.createLinearGradient(0, 0, 1600, 1000);
      g.addColorStop(0, '#0f172a');
      g.addColorStop(0.5, '#1e293b');
      g.addColorStop(1, '#334155');
      cctx.fillStyle = g;
      cctx.fillRect(0, 0, 1600, 1000);

      cctx.fillStyle = '#6366f1';
      cctx.beginPath();
      cctx.arc(800, 500, 260, 0, Math.PI * 2);
      cctx.fill();

      cctx.fillStyle = '#ffffff';
      cctx.font = 'bold 56px sans-serif';
      cctx.textAlign = 'center';
      cctx.fillText('STOCK PHOTOGRAPHY ASSET', 800, 480);
      cctx.font = '32px sans-serif';
      cctx.fillText('Camera: Canon EOS R5 • ISO 100 • 50mm f/1.8', 800, 550);

      const img = new Image();
      img.onload = () => {
        currentImage = img;
        originalFileName = 'sample-stock-photo';
        dropZone.classList.add('hidden');
        workspace.classList.remove('hidden');
        renderCanvas();
        updateCleanBadge();
        window.showToast('Sample stock photo loaded! Customize watermark or clean EXIF.', 'success');
      };
      img.src = c.toDataURL('image/jpeg', 0.9);
    });
  }

  window.setupDropZone(dropZone, fileInput, (files) => {
    const file = files[0];
    if (!file || !file.type.startsWith('image/')) {
      window.showToast('Please upload a valid image (JPG, PNG, WebP)', 'error');
      return;
    }
    loadImage(file);
  });

  function loadImage(file) {
    originalFileName = file.name.replace(/\.[^/.]+$/, '');
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        currentImage = img;
        dropZone.classList.add('hidden');
        workspace.classList.remove('hidden');
        renderCanvas();
        window.showToast('Image loaded & EXIF metadata stripped!', 'success');
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  // Toggle mode
  if (modeCleanOnlyRadio && modeWatermarkRadio && watermarkOptionsBox) {
    modeCleanOnlyRadio.addEventListener('change', () => {
      watermarkOptionsBox.classList.add('hidden');
      renderCanvas();
    });
    modeWatermarkRadio.addEventListener('change', () => {
      watermarkOptionsBox.classList.remove('hidden');
      renderCanvas();
    });
  }

  // Control listeners
  if (wmTextInput) wmTextInput.addEventListener('input', renderCanvas);
  if (wmColorInput) wmColorInput.addEventListener('input', renderCanvas);
  if (wmFontSizeInput && wmFontSizeVal) {
    wmFontSizeInput.addEventListener('input', (e) => {
      wmFontSizeVal.textContent = `${e.target.value}px`;
      renderCanvas();
    });
  }
  if (wmOpacityInput && wmOpacityVal) {
    wmOpacityInput.addEventListener('input', (e) => {
      wmOpacityVal.textContent = `${e.target.value}%`;
      renderCanvas();
    });
  }
  if (wmPositionSelect) wmPositionSelect.addEventListener('change', renderCanvas);
  if (wmOutputFormat) wmOutputFormat.addEventListener('change', renderCanvas);

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      currentImage = null;
      fileInput.value = '';
      workspace.classList.add('hidden');
      dropZone.classList.remove('hidden');
    });
  }

  function renderCanvas() {
    if (!currentImage || !ctx) return;

    canvas.width = currentImage.naturalWidth;
    canvas.height = currentImage.naturalHeight;

    // Draw base image (stripping EXIF metadata cleanly through Canvas pipeline)
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(currentImage, 0, 0);

    const isWatermarkMode = modeWatermarkRadio ? modeWatermarkRadio.checked : true;

    if (isWatermarkMode) {
      applyWatermark();
    }

    if (metaCleanBadge) {
      metaCleanBadge.innerHTML = `
        <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300">
          <i data-lucide="shield-check" class="w-4 h-4"></i>
          EXIF & GPS Cleaned (Canvas Sanitized)
        </div>
      `;
      if (window.lucide) window.lucide.createIcons();
    }
  }

  function applyWatermark() {
    const text = wmTextInput ? wmTextInput.value.trim() || '© MultiTools Hub Preview' : '© MultiTools Hub Preview';
    const color = wmColorInput ? wmColorInput.value : '#ffffff';
    const fontSize = parseInt(wmFontSizeInput.value, 10) || 48;
    const opacity = (parseInt(wmOpacityInput.value, 10) || 60) / 100;
    const position = wmPositionSelect ? wmPositionSelect.value : 'tile';

    ctx.save();
    ctx.font = `bold ${fontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;

    // Hex to RGBA
    const rgb = hexToRgb(color);
    ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`;
    ctx.shadowColor = `rgba(0, 0, 0, ${opacity * 0.7})`;
    ctx.shadowBlur = Math.max(4, fontSize * 0.1);
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;

    const w = canvas.width;
    const h = canvas.height;

    if (position === 'tile') {
      // Repeated diagonal watermark across entire image
      ctx.rotate(-30 * Math.PI / 180);
      const textMetrics = ctx.measureText(text);
      const stepX = textMetrics.width + 140;
      const stepY = fontSize * 3.5;

      const diag = Math.sqrt(w * w + h * h);
      for (let y = -diag; y < diag * 1.5; y += stepY) {
        for (let x = -diag; x < diag * 1.5; x += stepX) {
          ctx.fillText(text, x, y);
        }
      }
    } else {
      // 9-point grid positioning
      const padding = Math.max(30, fontSize);
      const metrics = ctx.measureText(text);
      const textW = metrics.width;
      let x = padding;
      let y = padding + fontSize;

      if (position.includes('center')) {
        x = (w - textW) / 2;
      } else if (position.includes('right')) {
        x = w - textW - padding;
      }

      if (position.startsWith('center')) {
        y = h / 2 + fontSize / 3;
      } else if (position.startsWith('bottom')) {
        y = h - padding;
      }

      ctx.fillText(text, x, y);
    }

    ctx.restore();
  }

  function hexToRgb(hex) {
    const cleanHex = hex.replace('#', '');
    const bigint = parseInt(cleanHex, 16);
    return {
      r: (bigint >> 16) & 255,
      g: (bigint >> 8) & 255,
      b: bigint & 255
    };
  }

  if (downloadBtn) {
    downloadBtn.addEventListener('click', () => {
      if (!currentImage) return;

      const format = wmOutputFormat ? wmOutputFormat.value : 'jpeg';
      const mimeType = format === 'png' ? 'image/png' : 'image/jpeg';
      const isWatermarked = modeWatermarkRadio ? modeWatermarkRadio.checked : true;
      const suffix = isWatermarked ? 'watermarked' : 'exif-cleaned';

      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${originalFileName}-${suffix}.${format}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 5000);
        window.showToast('Cleaned image downloaded!', 'success');
      }, mimeType, 0.92);
    });
  }
});
