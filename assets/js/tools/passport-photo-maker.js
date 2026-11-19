/**
 * MultiTools Hub - US 2x2 Passport & Visa Photo Maker
 * 100% Client-side Canvas manipulation
 * Official US State Department 2x2 inch (600x600 px @ 300 DPI)
 * 4x6 inch Print Sheet (1200x1800 px @ 300 DPI with 6 photos)
 */
(function PassportPhotoModule() {
  'use strict';

  let sourceImage = null;
  let zoom = 1.0;
  let panX = 0;
  let panY = 0;
  let rotation = 0;
  let brightness = 100;
  let contrast = 100;
  let isDragging = false;
  let startDragX = 0;
  let startDragY = 0;

  // DOM Elements
  let previewCanvas, previewCtx;
  let zoomSlider, zoomVal;
  let rotateSlider, rotateVal;
  let brightSlider, brightVal;
  let contrastSlider, contrastVal;
  let fileInput, dropZone;
  let singleDownloadBtn, sheetDownloadBtn, sampleBtn, resetBtn;
  let showGuidesToggle;

  function init() {
    previewCanvas = document.getElementById('passport-preview-canvas');
    if (!previewCanvas) return;
    previewCtx = previewCanvas.getContext('2d');

    zoomSlider = document.getElementById('passport-zoom');
    zoomVal = document.getElementById('passport-zoom-val');
    rotateSlider = document.getElementById('passport-rotate');
    rotateVal = document.getElementById('passport-rotate-val');
    brightSlider = document.getElementById('passport-brightness');
    brightVal = document.getElementById('passport-brightness-val');
    contrastSlider = document.getElementById('passport-contrast');
    contrastVal = document.getElementById('passport-contrast-val');
    showGuidesToggle = document.getElementById('passport-show-guides');

    fileInput = document.getElementById('passport-file-input');
    dropZone = document.getElementById('passport-dropzone');
    singleDownloadBtn = document.getElementById('passport-download-single');
    sheetDownloadBtn = document.getElementById('passport-download-sheet');
    sampleBtn = document.getElementById('passport-sample-btn');
    resetBtn = document.getElementById('passport-reset-btn');

    // Setup Dropzone
    if (window.setupDropZone && dropZone && fileInput) {
      window.setupDropZone(dropZone, fileInput, (files) => {
        if (files && files[0]) loadUserFile(files[0]);
      });
    }

    // Sliders
    if (zoomSlider) {
      zoomSlider.addEventListener('input', () => {
        zoom = parseFloat(zoomSlider.value);
        if (zoomVal) zoomVal.textContent = zoom.toFixed(2) + 'x';
        draw();
      });
    }

    if (rotateSlider) {
      rotateSlider.addEventListener('input', () => {
        rotation = parseInt(rotateSlider.value, 10);
        if (rotateVal) rotateVal.textContent = rotation + '°';
        draw();
      });
    }

    if (brightSlider) {
      brightSlider.addEventListener('input', () => {
        brightness = parseInt(brightSlider.value, 10);
        if (brightVal) brightVal.textContent = brightness + '%';
        draw();
      });
    }

    if (contrastSlider) {
      contrastSlider.addEventListener('input', () => {
        contrast = parseInt(contrastSlider.value, 10);
        if (contrastVal) contrastVal.textContent = contrast + '%';
        draw();
      });
    }

    if (showGuidesToggle) {
      showGuidesToggle.addEventListener('change', draw);
    }

    if (resetBtn) {
      resetBtn.addEventListener('click', resetControls);
    }

    if (sampleBtn) {
      sampleBtn.addEventListener('click', loadSample);
    }

    if (singleDownloadBtn) {
      singleDownloadBtn.addEventListener('click', downloadSinglePhoto);
    }

    if (sheetDownloadBtn) {
      sheetDownloadBtn.addEventListener('click', downloadPrintSheet);
    }

    // Canvas dragging / panning
    previewCanvas.addEventListener('mousedown', (e) => {
      if (!sourceImage) return;
      isDragging = true;
      startDragX = e.clientX - panX;
      startDragY = e.clientY - panY;
      previewCanvas.style.cursor = 'grabbing';
    });

    window.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      panX = e.clientX - startDragX;
      panY = e.clientY - startDragY;
      draw();
    });

    window.addEventListener('mouseup', () => {
      if (isDragging) {
        isDragging = false;
        previewCanvas.style.cursor = 'grab';
      }
    });

    // Touch support for mobile dragging
    previewCanvas.addEventListener('touchstart', (e) => {
      if (!sourceImage || e.touches.length !== 1) return;
      isDragging = true;
      startDragX = e.touches[0].clientX - panX;
      startDragY = e.touches[0].clientY - panY;
    }, { passive: false });

    previewCanvas.addEventListener('touchmove', (e) => {
      if (!isDragging || e.touches.length !== 1) return;
      e.preventDefault();
      panX = e.touches[0].clientX - startDragX;
      panY = e.touches[0].clientY - startDragY;
      draw();
    }, { passive: false });

    previewCanvas.addEventListener('touchend', () => {
      isDragging = false;
    });

    // Initial render
    drawEmptyState();
  }

  function resetControls() {
    zoom = 1.0;
    panX = 0;
    panY = 0;
    rotation = 0;
    brightness = 100;
    contrast = 100;
    if (zoomSlider) zoomSlider.value = 1;
    if (zoomVal) zoomVal.textContent = '1.00x';
    if (rotateSlider) rotateSlider.value = 0;
    if (rotateVal) rotateVal.textContent = '0°';
    if (brightSlider) brightSlider.value = 100;
    if (brightVal) brightVal.textContent = '100%';
    if (contrastSlider) contrastSlider.value = 100;
    if (contrastVal) contrastVal.textContent = '100%';
    draw();
  }

  function loadUserFile(file) {
    if (!file.type.startsWith('image/')) {
      if (window.showToast) window.showToast('Please upload a valid image (JPG, PNG, WEBP)', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        sourceImage = img;
        fitImageToCanvas();
        enableControls();
        draw();
        if (window.showToast) window.showToast('Photo loaded! Align eyes and head with the guidelines.', 'success');
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  function fitImageToCanvas() {
    if (!sourceImage) return;
    const canvasSize = 600;
    const scale = Math.max(canvasSize / sourceImage.naturalWidth, canvasSize / sourceImage.naturalHeight);
    zoom = scale * 1.05;
    panX = 0;
    panY = 0;
    rotation = 0;
    if (zoomSlider) {
      zoomSlider.min = (scale * 0.5).toFixed(2);
      zoomSlider.max = (scale * 3.0).toFixed(2);
      zoomSlider.value = zoom.toFixed(2);
      if (zoomVal) zoomVal.textContent = zoom.toFixed(2) + 'x';
    }
  }

  function enableControls() {
    const controls = document.getElementById('passport-controls');
    if (controls) controls.classList.remove('opacity-50', 'pointer-events-none');
    if (singleDownloadBtn) singleDownloadBtn.disabled = false;
    if (sheetDownloadBtn) sheetDownloadBtn.disabled = false;
  }

  function loadSample() {
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 1000;
    const ctx = canvas.getContext('2d');

    // Studio background (pure off-white standard for US Passports)
    ctx.fillStyle = '#f8f9fa';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Shoulders
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.ellipse(400, 950, 360, 280, 0, 0, Math.PI * 2);
    ctx.fill();

    // Neck
    ctx.fillStyle = '#e2b397';
    ctx.fillRect(340, 580, 120, 160);

    // Head Oval
    ctx.fillStyle = '#f2c5a8';
    ctx.beginPath();
    ctx.ellipse(400, 480, 160, 200, 0, 0, Math.PI * 2);
    ctx.fill();

    // Hair
    ctx.fillStyle = '#331800';
    ctx.beginPath();
    ctx.arc(400, 420, 175, Math.PI, 0, false);
    ctx.fill();

    // Eyes
    ctx.fillStyle = '#292524';
    ctx.beginPath();
    ctx.ellipse(340, 470, 14, 8, 0, 0, Math.PI * 2);
    ctx.ellipse(460, 470, 14, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    // Eyebrows
    ctx.strokeStyle = '#331800';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(340, 450, 20, 0.8 * Math.PI, 0.2 * Math.PI, true);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(460, 450, 20, 0.8 * Math.PI, 0.2 * Math.PI, true);
    ctx.stroke();

    // Nose
    ctx.strokeStyle = '#d49b78';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(400, 470);
    ctx.lineTo(395, 520);
    ctx.lineTo(410, 520);
    ctx.stroke();

    // Neutral Mouth (US Passport requires neutral expression)
    ctx.strokeStyle = '#b97355';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(375, 560);
    ctx.lineTo(425, 560);
    ctx.stroke();

    const img = new Image();
    img.onload = () => {
      sourceImage = img;
      fitImageToCanvas();
      enableControls();
      draw();
      if (window.showToast) window.showToast('Sample US passport portrait loaded!', 'success');
    };
    img.src = canvas.toDataURL('image/jpeg', 0.95);
  }

  function drawEmptyState() {
    previewCanvas.width = 600;
    previewCanvas.height = 600;
    previewCtx.fillStyle = '#f8fafc';
    previewCtx.fillRect(0, 0, 600, 600);

    previewCtx.strokeStyle = '#cbd5e1';
    previewCtx.lineWidth = 2;
    previewCtx.setLineDash([8, 8]);
    previewCtx.strokeRect(10, 10, 580, 580);
    previewCtx.setLineDash([]);

    // Draw placeholder guidelines
    drawOfficialGuides(true);

    previewCtx.fillStyle = '#64748b';
    previewCtx.font = 'bold 18px sans-serif';
    previewCtx.textAlign = 'center';
    previewCtx.fillText('Upload Photo to Begin 2x2" Formatting', 300, 260);
    previewCtx.font = '14px sans-serif';
    previewCtx.fillStyle = '#94a3b8';
    previewCtx.fillText('Complies with US State Dept 2x2" Passport Standard', 300, 290);
  }

  function renderImageToContext(ctx, width, height) {
    if (!sourceImage) return;

    ctx.save();
    // Clean background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    // Apply Filters
    ctx.filter = `brightness(${brightness}%) contrast(${contrast}%)`;

    // Center translation
    ctx.translate(width / 2 + panX * (width / 600), height / 2 + panY * (height / 600));
    ctx.rotate((rotation * Math.PI) / 180);

    const imgScale = (width / 600) * zoom;
    const drawW = sourceImage.naturalWidth * imgScale;
    const drawH = sourceImage.naturalHeight * imgScale;

    ctx.drawImage(sourceImage, -drawW / 2, -drawH / 2, drawW, drawH);
    ctx.restore();
  }

  function drawOfficialGuides(isPlaceholder = false) {
    // US State Department Specs:
    // Photo size: 2 x 2 inches (600 x 600 px at 300 DPI)
    // Head height (crown to chin): 1 inch to 1 3/8 inches (300 px to 412 px = 50% to 69% of image height)
    // Eye level: 1 1/8 inches to 1 3/8 inches from bottom (337 px to 412 px from bottom = 188 px to 263 px from top)

    const guideColor = isPlaceholder ? 'rgba(100, 116, 139, 0.4)' : 'rgba(99, 102, 241, 0.85)';
    const eyeColor = isPlaceholder ? 'rgba(239, 68, 68, 0.4)' : 'rgba(239, 68, 68, 0.9)';

    previewCtx.save();

    // Head boundary oval (min head 300px, max head 412px)
    // Center at ~X=300, Y=270, radiusX=140, radiusY=180
    previewCtx.strokeStyle = guideColor;
    previewCtx.lineWidth = 2;
    previewCtx.setLineDash([6, 6]);
    previewCtx.beginPath();
    previewCtx.ellipse(300, 265, 135, 175, 0, 0, Math.PI * 2);
    previewCtx.stroke();

    // Top of head line (Crown max / min)
    previewCtx.strokeStyle = 'rgba(16, 185, 129, 0.8)';
    previewCtx.beginPath();
    previewCtx.moveTo(100, 90);
    previewCtx.lineTo(500, 90);
    previewCtx.stroke();

    // Eye line band (State Dept recommends eyes situated between 56% to 69% from bottom = Y=200 to Y=250)
    previewCtx.strokeStyle = eyeColor;
    previewCtx.lineWidth = 2;
    previewCtx.setLineDash([4, 4]);
    previewCtx.beginPath();
    previewCtx.moveTo(80, 235);
    previewCtx.lineTo(520, 235);
    previewCtx.stroke();

    // Chin line
    previewCtx.strokeStyle = guideColor;
    previewCtx.beginPath();
    previewCtx.moveTo(150, 440);
    previewCtx.lineTo(450, 440);
    previewCtx.stroke();

    // Vertical center line
    previewCtx.strokeStyle = 'rgba(99, 102, 241, 0.4)';
    previewCtx.lineWidth = 1;
    previewCtx.setLineDash([2, 4]);
    previewCtx.beginPath();
    previewCtx.moveTo(300, 20);
    previewCtx.lineTo(300, 580);
    previewCtx.stroke();

    // Label indicators
    previewCtx.setLineDash([]);
    previewCtx.fillStyle = eyeColor;
    previewCtx.font = 'bold 11px sans-serif';
    previewCtx.textAlign = 'left';
    previewCtx.fillText('EYE LEVEL TARGET (56-69%)', 85, 230);

    previewCtx.fillStyle = 'rgba(16, 185, 129, 0.9)';
    previewCtx.fillText('CROWN (TOP OF HAIR)', 105, 85);

    previewCtx.fillStyle = guideColor;
    previewCtx.fillText('CHIN LINE', 155, 435);

    previewCtx.restore();
  }

  function draw() {
    if (!sourceImage) {
      drawEmptyState();
      return;
    }

    previewCanvas.width = 600;
    previewCanvas.height = 600;

    renderImageToContext(previewCtx, 600, 600);

    // Overlay guidelines if checked
    if (!showGuidesToggle || showGuidesToggle.checked) {
      drawOfficialGuides(false);
    }
  }

  function downloadSinglePhoto() {
    if (!sourceImage) return;

    // Create 600x600 pure photo canvas with NO guidelines
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = 600;
    exportCanvas.height = 600;
    const exportCtx = exportCanvas.getContext('2d');

    renderImageToContext(exportCtx, 600, 600);

    exportCanvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'us-passport-photo-2x2-300dpi.jpg';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      if (window.showToast) window.showToast('2x2" Passport Photo (600x600 300DPI) downloaded!', 'success');
    }, 'image/jpeg', 0.98);
  }

  function downloadPrintSheet() {
    if (!sourceImage) return;

    // 4x6 inches at 300 DPI = 1800 x 1200 or 1200 x 1800 px
    // We'll create a 4x6" portrait (1200 x 1800 px) holding 6 passport photos (2 columns x 3 rows)
    // 2 photos wide (2 x 600px = 1200px)
    // 3 photos tall (3 x 600px = 1800px)
    // Perfectly fills the 4x6" sheet at 0 margins, or with thin cut lines!
    const sheetCanvas = document.createElement('canvas');
    sheetCanvas.width = 1200;
    sheetCanvas.height = 1800;
    const sheetCtx = sheetCanvas.getContext('2d');

    // White background
    sheetCtx.fillStyle = '#ffffff';
    sheetCtx.fillRect(0, 0, 1200, 1800);

    // Create single rendered photo
    const singleCanvas = document.createElement('canvas');
    singleCanvas.width = 600;
    singleCanvas.height = 600;
    const singleCtx = singleCanvas.getContext('2d');
    renderImageToContext(singleCtx, 600, 600);

    // Stamp 6 photos (2 columns x 3 rows)
    for (let col = 0; col < 2; col++) {
      for (let row = 0; row < 3; row++) {
        const x = col * 600;
        const y = row * 600;
        sheetCtx.drawImage(singleCanvas, x, y, 600, 600);

        // Thin cutting guide border
        sheetCtx.strokeStyle = 'rgba(203, 213, 225, 0.8)';
        sheetCtx.lineWidth = 1;
        sheetCtx.setLineDash([6, 6]);
        sheetCtx.strokeRect(x, y, 600, 600);
      }
    }

    // Corner crop marks for precise scissor cutting
    sheetCtx.setLineDash([]);
    sheetCtx.strokeStyle = '#64748b';
    sheetCtx.lineWidth = 2;

    // Center divider lines
    sheetCtx.beginPath();
    sheetCtx.moveTo(600, 0); sheetCtx.lineTo(600, 30);
    sheetCtx.moveTo(600, 1770); sheetCtx.lineTo(600, 1800);
    sheetCtx.moveTo(0, 600); sheetCtx.lineTo(30, 600);
    sheetCtx.moveTo(1170, 600); sheetCtx.lineTo(1200, 600);
    sheetCtx.moveTo(0, 1200); sheetCtx.lineTo(30, 1200);
    sheetCtx.moveTo(1170, 1200); sheetCtx.lineTo(1200, 1200);
    sheetCtx.stroke();

    sheetCanvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'us-passport-4x6-print-sheet-6-photos.jpg';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      if (window.showToast) window.showToast('4x6" Print Sheet (6 Photos, 300 DPI) ready for CVS/Walgreens/Walmart print!', 'success');
    }, 'image/jpeg', 0.98);
  }

  document.addEventListener('DOMContentLoaded', init);
})();
