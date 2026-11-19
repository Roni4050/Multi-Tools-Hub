/**
 * Tool 3: Social Media Safe Zone Checker
 * YouTube Shorts, Instagram Reels & TikTok Safe Margins
 * 100% Client-Side Canvas Rendering
 */

document.addEventListener('DOMContentLoaded', () => {
  const dropZone = document.getElementById('safezone-dropzone');
  const fileInput = document.getElementById('safezone-file-input');
  const previewCard = document.getElementById('safezone-preview-card');
  const canvas = document.getElementById('safezone-canvas');
  const ctx = canvas ? canvas.getContext('2d') : null;

  const platformSelect = document.getElementById('platform-select');
  const opacitySlider = document.getElementById('opacity-slider');
  const opacityValueText = document.getElementById('opacity-value-text');
  const dimUnsafeCheck = document.getElementById('dim-unsafe-check');
  const showCenterCheck = document.getElementById('show-center-check');
  const resetBtn = document.getElementById('safezone-reset-btn');
  const sampleBtn = document.getElementById('safezone-sample-btn');
  const downloadCompositeBtn = document.getElementById('download-composite-btn');
  const downloadCleanBtn = document.getElementById('download-clean-btn');

  let currentImage = null; // HTMLImageElement
  let originalFileName = 'safe-zone-preview';

  function createSampleFrame() {
    const sCanvas = document.createElement('canvas');
    sCanvas.width = 1080;
    sCanvas.height = 1920;
    const sCtx = sCanvas.getContext('2d');

    // Rich gradient background
    const grad = sCtx.createLinearGradient(0, 0, 1080, 1920);
    grad.addColorStop(0, '#1e1b4b');
    grad.addColorStop(0.5, '#4338ca');
    grad.addColorStop(1, '#0f172a');
    sCtx.fillStyle = grad;
    sCtx.fillRect(0, 0, 1080, 1920);

    // Decorative shapes
    sCtx.fillStyle = 'rgba(99, 102, 241, 0.2)';
    sCtx.beginPath();
    sCtx.arc(540, 960, 400, 0, Math.PI * 2);
    sCtx.fill();

    sCtx.fillStyle = 'rgba(236, 72, 153, 0.15)';
    sCtx.beginPath();
    sCtx.arc(300, 600, 250, 0, Math.PI * 2);
    sCtx.fill();

    // Text instructions / Sample Frame
    sCtx.fillStyle = '#ffffff';
    sCtx.font = 'bold 54px sans-serif';
    sCtx.textAlign = 'center';
    sCtx.fillText('CREATOR SHORT / REEL', 540, 800);

    sCtx.fillStyle = '#a5b4fc';
    sCtx.font = 'bold 36px sans-serif';
    sCtx.fillText('9:16 VERTICAL VIDEO TEST FRAME', 540, 880);

    sCtx.fillStyle = '#e2e8f0';
    sCtx.font = '28px sans-serif';
    sCtx.fillText('Keep titles & face within the clear central zone', 540, 960);
    sCtx.fillText('Check if top headers or bottom captions cover text', 540, 1010);

    // Visual center box
    sCtx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    sCtx.lineWidth = 4;
    sCtx.setLineDash([12, 12]);
    sCtx.strokeRect(100, 400, 880, 1120);
    sCtx.setLineDash([]);

    const img = new Image();
    img.onload = () => {
      currentImage = img;
      originalFileName = 'sample-vertical-video';
      dropZone.classList.add('hidden');
      previewCard.classList.remove('hidden');
      renderCanvas();
      window.showToast('Sample 9:16 frame loaded into Safe Zone Checker!', 'success');
    };
    img.src = sCanvas.toDataURL('image/png');
  }

  if (sampleBtn) {
    sampleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      createSampleFrame();
    });
  }

  if (!canvas || !dropZone || !fileInput) return;

  window.setupDropZone(dropZone, fileInput, (files) => {
    const file = files[0];
    if (!file || !file.type.startsWith('image/')) {
      window.showToast('Please select a valid image file', 'error');
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
        previewCard.classList.remove('hidden');
        renderCanvas();
        window.showToast('Image loaded! Adjust platform overlays as needed.', 'success');
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  // Event Listeners for Controls
  if (platformSelect) platformSelect.addEventListener('change', renderCanvas);
  if (opacitySlider) {
    opacitySlider.addEventListener('input', (e) => {
      if (opacityValueText) opacityValueText.textContent = `${e.target.value}%`;
      renderCanvas();
    });
  }
  if (dimUnsafeCheck) dimUnsafeCheck.addEventListener('change', renderCanvas);
  if (showCenterCheck) showCenterCheck.addEventListener('change', renderCanvas);

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      currentImage = null;
      fileInput.value = '';
      previewCard.classList.add('hidden');
      dropZone.classList.remove('hidden');
    });
  }

  function renderCanvas() {
    if (!currentImage || !ctx) return;

    // Standard high-definition 9:16 target resolution
    const targetW = 1080;
    const targetH = 1920;
    canvas.width = targetW;
    canvas.height = targetH;

    // Draw background and image (cover mode to 9:16)
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, targetW, targetH);

    const imgRatio = currentImage.naturalWidth / currentImage.naturalHeight;
    const targetRatio = targetW / targetH; // 9 / 16 = 0.5625

    let renderW, renderH, offsetX, offsetY;

    if (imgRatio > targetRatio) {
      // Image is wider than 9:16: crop left and right
      renderH = targetH;
      renderW = targetH * imgRatio;
      offsetX = (targetW - renderW) / 2;
      offsetY = 0;
    } else {
      // Image is taller or equal: crop top and bottom
      renderW = targetW;
      renderH = targetW / imgRatio;
      offsetX = 0;
      offsetY = (targetH - renderH) / 2;
    }

    ctx.drawImage(currentImage, offsetX, offsetY, renderW, renderH);

    // Draw Overlay Guides
    const platform = platformSelect ? platformSelect.value : 'shorts';
    const opacity = opacitySlider ? parseInt(opacitySlider.value, 10) / 100 : 0.7;
    const dimUnsafe = dimUnsafeCheck ? dimUnsafeCheck.checked : true;
    const showCenter = showCenterCheck ? showCenterCheck.checked : true;

    ctx.save();

    if (showCenter) {
      // Draw center guide lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.setLineDash([8, 8]);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(targetW / 2, 0);
      ctx.lineTo(targetW / 2, targetH);
      ctx.moveTo(0, targetH / 2);
      ctx.lineTo(targetW, targetH / 2);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    if (platform === 'shorts') {
      renderYouTubeShortsOverlay(targetW, targetH, opacity, dimUnsafe);
    } else if (platform === 'reels') {
      renderInstagramReelsOverlay(targetW, targetH, opacity, dimUnsafe);
    } else {
      renderTikTokOverlay(targetW, targetH, opacity, dimUnsafe);
    }

    ctx.restore();
  }

  function renderYouTubeShortsOverlay(w, h, opacity, dimUnsafe) {
    // Unsafe zones for YouTube Shorts:
    // Top header zone: 0 to 240px
    // Bottom caption & audio: 1440px to 1920px (height 480px)
    // Right action buttons: right 180px, from Y: 900 to 1750px
    const topH = 240;
    const bottomH = 480;
    const rightW = 180;
    const rightTopY = 900;
    const rightBottomY = 1750;

    if (dimUnsafe) {
      ctx.fillStyle = `rgba(0, 0, 0, ${opacity * 0.75})`;
      // Top unsafe
      ctx.fillRect(0, 0, w, topH);
      // Bottom unsafe
      ctx.fillRect(0, h - bottomH, w - rightW, bottomH);
      // Right unsafe
      ctx.fillRect(w - rightW, rightTopY, rightW, rightBottomY - rightTopY + 170);
    }

    // Safe zone boundary rectangle
    ctx.strokeStyle = '#ef4444'; // Red warning border
    ctx.lineWidth = 4;
    ctx.strokeRect(40, topH, w - 40 - rightW, h - topH - bottomH);

    // Labels & Mockups
    drawOverlayBadge('YOUTUBE SHORTS SAFE ZONE', 60, topH + 50, '#10b981');

    // Draw Simulated UI Elements
    ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
    ctx.font = '600 28px -apple-system, sans-serif';
    ctx.fillText('🔍 Search & Camera (Blocked Area)', 50, 140);

    // Right Action Icons mockup
    const icons = ['👍 Like', '👎 Dislike', '💬 1.2K', '↗ Share', '🔀 Remix'];
    icons.forEach((text, i) => {
      const y = rightTopY + i * 150;
      ctx.beginPath();
      ctx.arc(w - 90, y, 42, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(30, 41, 59, ${opacity * 0.9})`;
      ctx.fill();
      ctx.strokeStyle = `rgba(255, 255, 255, ${opacity * 0.8})`;
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
      ctx.font = '500 20px -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(text, w - 90, y + 65);
    });
    ctx.textAlign = 'left';

    // Bottom Channel info mockup
    ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
    ctx.font = 'bold 32px -apple-system, sans-serif';
    ctx.fillText('@YourChannelName • Subscribe', 60, h - 360);
    ctx.font = '28px -apple-system, sans-serif';
    ctx.fillText('Video title and description caption zone (2-3 lines of text)', 60, h - 300);
    ctx.fillText('🎵 Original Audio Sound Track marquee', 60, h - 230);
  }

  function renderInstagramReelsOverlay(w, h, opacity, dimUnsafe) {
    const topH = 220;
    const bottomH = 500;
    const rightW = 160;
    const rightY = 960;

    if (dimUnsafe) {
      ctx.fillStyle = `rgba(0, 0, 0, ${opacity * 0.75})`;
      ctx.fillRect(0, 0, w, topH);
      ctx.fillRect(0, h - bottomH, w - rightW, bottomH);
      ctx.fillRect(w - rightW, rightY, rightW, h - rightY);
    }

    ctx.strokeStyle = '#ec4899'; // Pink/Rose boundary
    ctx.lineWidth = 4;
    ctx.strokeRect(40, topH, w - 40 - rightW, h - topH - bottomH);

    drawOverlayBadge('INSTAGRAM REELS SAFE ZONE', 60, topH + 50, '#ec4899');

    // Simulated UI Elements
    ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
    ctx.font = 'bold 36px -apple-system, sans-serif';
    ctx.fillText('Reels', 60, 130);

    // Right Action Icons
    const reelIcons = ['❤️ Like', '💬 Comment', '✈️ Share', '🔖 Save', '⋯ More'];
    reelIcons.forEach((text, i) => {
      const y = rightY + i * 140;
      ctx.beginPath();
      ctx.arc(w - 80, y, 38, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(15, 23, 42, ${opacity * 0.85})`;
      ctx.fill();
      ctx.strokeStyle = `rgba(255, 255, 255, ${opacity * 0.7})`;
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
      ctx.font = '500 18px -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(text, w - 80, y + 60);
    });
    ctx.textAlign = 'left';

    // Bottom Caption
    ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
    ctx.font = 'bold 32px -apple-system, sans-serif';
    ctx.fillText('creator_username • Follow', 60, h - 380);
    ctx.font = '26px -apple-system, sans-serif';
    ctx.fillText('Caption text zone: keeps followers engaged without getting cut off...', 60, h - 320);
    ctx.fillText('🎵 Trending Audio Song Title', 60, h - 250);
  }

  function renderTikTokOverlay(w, h, opacity, dimUnsafe) {
    const topH = 200;
    const bottomH = 460;
    const rightW = 160;
    const rightY = 880;

    if (dimUnsafe) {
      ctx.fillStyle = `rgba(0, 0, 0, ${opacity * 0.75})`;
      ctx.fillRect(0, 0, w, topH);
      ctx.fillRect(0, h - bottomH, w - rightW, bottomH);
      ctx.fillRect(w - rightW, rightY, rightW, h - rightY);
    }

    ctx.strokeStyle = '#06b6d4'; // Cyan TikTok boundary
    ctx.lineWidth = 4;
    ctx.strokeRect(40, topH, w - 40 - rightW, h - topH - bottomH);

    drawOverlayBadge('TIKTOK SAFE ZONE', 60, topH + 50, '#06b6d4');

    // Simulated Top Header
    ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
    ctx.font = 'bold 32px -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('LIVE   |   Following   |   For You', w / 2, 130);
    ctx.textAlign = 'left';

    // Right Action Icons
    const tiktokIcons = ['Avatar (+)', '❤️ 45.2K', '💬 3,810', '🔖 12.1K', '↗ Share', '💿 Sound'];
    tiktokIcons.forEach((text, i) => {
      const y = rightY + i * 135;
      ctx.beginPath();
      ctx.arc(w - 80, y, 36, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(15, 23, 42, ${opacity * 0.85})`;
      ctx.fill();
      ctx.strokeStyle = `rgba(255, 255, 255, ${opacity * 0.7})`;
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
      ctx.font = '500 17px -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(text, w - 80, y + 55);
    });
    ctx.textAlign = 'left';

    // Bottom info
    ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
    ctx.font = 'bold 32px -apple-system, sans-serif';
    ctx.fillText('@tiktok_creator', 60, h - 350);
    ctx.font = '26px -apple-system, sans-serif';
    ctx.fillText('TikTok caption with #hashtags and mentions zone', 60, h - 290);
    ctx.fillText('🎵 Original sound - viral trending track', 60, h - 220);
  }

  function drawOverlayBadge(text, x, y, color) {
    ctx.save();
    ctx.font = 'bold 22px -apple-system, sans-serif';
    const textWidth = ctx.measureText(text).width;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.roundRect(x, y - 28, textWidth + 30, 42, 8);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.fillText(text, x + 15, y);
    ctx.restore();
  }

  // Download Composite with overlay
  if (downloadCompositeBtn) {
    downloadCompositeBtn.addEventListener('click', () => {
      if (!currentImage) return;
      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const platform = platformSelect ? platformSelect.value : 'shorts';
        a.download = `${originalFileName}-${platform}-safe-zone-preview.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 5000);
        window.showToast('Composite preview downloaded!', 'success');
      }, 'image/png');
    });
  }

  // Download Clean 9:16 cropped image
  if (downloadCleanBtn) {
    downloadCleanBtn.addEventListener('click', () => {
      if (!currentImage) return;
      const cleanCanvas = document.createElement('canvas');
      cleanCanvas.width = 1080;
      cleanCanvas.height = 1920;
      const cCtx = cleanCanvas.getContext('2d');

      const imgRatio = currentImage.naturalWidth / currentImage.naturalHeight;
      const targetRatio = 1080 / 1920;
      let renderW, renderH, offsetX, offsetY;

      if (imgRatio > targetRatio) {
        renderH = 1920;
        renderW = 1920 * imgRatio;
        offsetX = (1080 - renderW) / 2;
        offsetY = 0;
      } else {
        renderW = 1080;
        renderH = 1080 / imgRatio;
        offsetX = 0;
        offsetY = (1920 - renderH) / 2;
      }

      cCtx.drawImage(currentImage, offsetX, offsetY, renderW, renderH);

      cleanCanvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${originalFileName}-clean-9x16.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 5000);
        window.showToast('Clean 9:16 crop downloaded!', 'success');
      }, 'image/png');
    });
  }
});
