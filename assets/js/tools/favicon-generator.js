/**
 * MultiTools Hub - Favicon & PWA App Icon Generator
 * 100% Client-side Canvas resizing + JSZip bundle
 * Generates: 16x16, 32x32, 48x48, 180x180 (Apple), 192x192 (PWA), 512x512 (Splash)
 * + site.webmanifest + HTML snippet
 */
(function FaviconGeneratorModule() {
  'use strict';

  let sourceImage = null;
  const iconSizes = [
    { name: 'favicon-16x16.png', size: 16, label: '16x16 (Browser Tab Favicon)', category: 'Favicon' },
    { name: 'favicon-32x32.png', size: 32, label: '32x32 (Standard Desktop Favicon)', category: 'Favicon' },
    { name: 'favicon-48x48.png', size: 48, label: '48x48 (Windows Desktop Shortcut)', category: 'Favicon' },
    { name: 'apple-touch-icon.png', size: 180, label: '180x180 (Apple iOS Touch Icon)', category: 'Apple iOS' },
    { name: 'android-chrome-192x192.png', size: 192, label: '192x192 (Android / PWA App Icon)', category: 'Android / PWA' },
    { name: 'android-chrome-512x512.png', size: 512, label: '512x512 (PWA Splash / Store Icon)', category: 'Android / PWA' }
  ];

  let generatedBlobs = {};

  function init() {
    const dropzone = document.getElementById('fav-dropzone');
    const fileInput = document.getElementById('fav-file-input');
    const sampleBtn = document.getElementById('fav-sample-btn');
    const zipBtn = document.getElementById('fav-download-zip-btn');
    const copyHtmlBtn = document.getElementById('fav-copy-html-btn');

    if (window.setupDropZone && dropzone && fileInput) {
      window.setupDropZone(dropzone, fileInput, (files) => {
        if (files && files[0]) loadFile(files[0]);
      });
    }

    if (sampleBtn) sampleBtn.addEventListener('click', loadSampleLogo);
    if (zipBtn) zipBtn.addEventListener('click', downloadAllZip);
    if (copyHtmlBtn) copyHtmlBtn.addEventListener('click', copyHtmlSnippet);
  }

  function loadFile(file) {
    if (!file.type.startsWith('image/')) {
      if (window.showToast) window.showToast('Please upload a valid image (PNG or JPG)', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        sourceImage = img;
        generateAllIcons();
        if (window.showToast) window.showToast('Logo loaded! Generated 6 icons and manifest.', 'success');
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  function loadSampleLogo() {
    // Generate a sleek modern geometric app logo
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // Rounded rectangle background with indigo gradient
    const grad = ctx.createLinearGradient(0, 0, 512, 512);
    grad.addColorStop(0, '#4f46e5');
    grad.addColorStop(1, '#7c3aed');
    ctx.fillStyle = grad;
    roundRect(ctx, 0, 0, 512, 512, 100);
    ctx.fill();

    // Geometric layers logo inside
    ctx.fillStyle = '#ffffff';
    // Diamond 1
    ctx.beginPath();
    ctx.moveTo(256, 120);
    ctx.lineTo(380, 190);
    ctx.lineTo(256, 260);
    ctx.lineTo(132, 190);
    ctx.closePath();
    ctx.fill();

    // Layer 2
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.beginPath();
    ctx.moveTo(132, 230);
    ctx.lineTo(256, 300);
    ctx.lineTo(380, 230);
    ctx.lineTo(380, 270);
    ctx.lineTo(256, 340);
    ctx.lineTo(132, 270);
    ctx.closePath();
    ctx.fill();

    // Layer 3
    ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
    ctx.beginPath();
    ctx.moveTo(132, 310);
    ctx.lineTo(256, 380);
    ctx.lineTo(380, 310);
    ctx.lineTo(380, 350);
    ctx.lineTo(256, 420);
    ctx.lineTo(132, 350);
    ctx.closePath();
    ctx.fill();

    const img = new Image();
    img.onload = () => {
      sourceImage = img;
      generateAllIcons();
      if (window.showToast) window.showToast('Sample 512x512 app logo loaded!', 'success');
    };
    img.src = canvas.toDataURL('image/png');
  }

  function roundRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }

  function generateAllIcons() {
    if (!sourceImage) return;

    generatedBlobs = {};
    const resultsContainer = document.getElementById('fav-results-grid');
    const actionsRow = document.getElementById('fav-actions-row');
    const manifestSection = document.getElementById('fav-manifest-section');

    if (resultsContainer) resultsContainer.innerHTML = '';

    iconSizes.forEach((iconDef) => {
      const canvas = document.createElement('canvas');
      canvas.width = iconDef.size;
      canvas.height = iconDef.size;
      const ctx = canvas.getContext('2d');

      // Crisp downsampling with imageSmoothing
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(sourceImage, 0, 0, iconDef.size, iconDef.size);

      canvas.toBlob((blob) => {
        generatedBlobs[iconDef.name] = blob;
        const dataUrl = canvas.toDataURL('image/png');

        if (resultsContainer) {
          const card = document.createElement('div');
          card.className = 'p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 flex items-center justify-between gap-3';
          card.innerHTML = `
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center p-1 shadow-sm flex-shrink-0">
                <img src="${dataUrl}" alt="${iconDef.name}" class="max-w-full max-h-full object-contain">
              </div>
              <div class="min-w-0">
                <p class="text-xs font-bold text-slate-900 dark:text-white truncate">${iconDef.name}</p>
                <p class="text-[11px] text-slate-500">${iconDef.label}</p>
              </div>
            </div>
            <button type="button" class="fav-download-single-btn px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 hover:bg-indigo-50 hover:text-indigo-600 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors flex items-center gap-1.5" data-name="${iconDef.name}">
              <i data-lucide="download" class="w-3.5 h-3.5"></i>
              <span>Save</span>
            </button>
          `;

          const saveBtn = card.querySelector('.fav-download-single-btn');
          saveBtn.addEventListener('click', () => {
            downloadBlob(blob, iconDef.name);
          });

          resultsContainer.appendChild(card);
          if (window.lucide) window.lucide.createIcons();
        }
      }, 'image/png');
    });

    if (actionsRow) actionsRow.classList.remove('hidden');
    if (manifestSection) manifestSection.classList.remove('hidden');
    updateManifestPreview();
  }

  function downloadBlob(blob, filename) {
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

  function getManifestJsonString() {
    const appName = document.getElementById('fav-app-name')?.value || 'My Awesome App';
    const shortName = document.getElementById('fav-short-name')?.value || 'App';
    const themeColor = document.getElementById('fav-theme-color')?.value || '#4f46e5';

    const manifestObj = {
      name: appName,
      short_name: shortName,
      icons: [
        {
          src: '/android-chrome-192x192.png',
          sizes: '192x192',
          type: 'image/png'
        },
        {
          src: '/android-chrome-512x512.png',
          sizes: '512x512',
          type: 'image/png'
        }
      ],
      theme_color: themeColor,
      background_color: '#ffffff',
      display: 'standalone',
      start_url: '/'
    };
    return JSON.stringify(manifestObj, null, 2);
  }

  function updateManifestPreview() {
    const codeEl = document.getElementById('fav-manifest-code');
    if (codeEl) {
      codeEl.textContent = getManifestJsonString();
    }
  }

  async function downloadAllZip() {
    if (!window.JSZip) {
      if (window.showToast) window.showToast('JSZip not ready. Please refresh.', 'error');
      return;
    }

    const zip = new window.JSZip();
    const folder = zip.folder('favicons');

    // Add all icons
    for (const [name, blob] of Object.entries(generatedBlobs)) {
      const arr = await blob.arrayBuffer();
      folder.file(name, arr);
    }

    // Add site.webmanifest
    const manifestStr = getManifestJsonString();
    folder.file('site.webmanifest', manifestStr);

    // Add README.txt with HTML embed tags
    const htmlCode = getHtmlCodeString();
    folder.file('html-head-tags.html', htmlCode);

    const zipBlob = await zip.generateAsync({ type: 'blob' });
    downloadBlob(zipBlob, 'favicon-pwa-package.zip');
    if (window.showToast) window.showToast('Complete Favicon & PWA ZIP package downloaded!', 'success');
  }

  function getHtmlCodeString() {
    const themeColor = document.getElementById('fav-theme-color')?.value || '#4f46e5';
    return `<!-- Favicon & PWA Web Icons -->
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
<meta name="theme-color" content="${themeColor}">`;
  }

  function copyHtmlSnippet() {
    const snippet = getHtmlCodeString();
    if (window.copyToClipboard) {
      window.copyToClipboard(snippet, 'HTML <head> tags copied to clipboard!');
    }
  }

  document.addEventListener('DOMContentLoaded', init);
})();
