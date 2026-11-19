/**
 * MultiTools Hub - Shared Core JavaScript
 * Handles Theme Toggle, Navigation, Toast Notifications, and Common Utilities
 */

// Theme Management
(function initTheme() {
  const savedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
})();

window.toggleTheme = function () {
  const isDark = document.documentElement.classList.toggle('dark');
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
  if (window.lucide) {
    window.lucide.createIcons();
  }
};

// Toast Notification System
window.showToast = function (message, type = 'success') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl text-sm font-medium border ${
    type === 'error'
      ? 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/80 dark:text-rose-200 dark:border-rose-800'
      : type === 'info'
      ? 'bg-sky-50 text-sky-800 border-sky-200 dark:bg-sky-950/80 dark:text-sky-200 dark:border-sky-800'
      : 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/80 dark:text-emerald-200 dark:border-emerald-800'
  }`;

  const iconName = type === 'error' ? 'alert-circle' : type === 'info' ? 'info' : 'check-circle-2';
  toast.innerHTML = `
    <i data-lucide="${iconName}" class="w-5 h-5 flex-shrink-0"></i>
    <span class="flex-1">${message}</span>
    <button type="button" class="text-current opacity-60 hover:opacity-100 transition-opacity ml-2" onclick="this.parentElement.remove()">
      <i data-lucide="x" class="w-4 h-4"></i>
    </button>
  `;

  container.appendChild(toast);
  if (window.lucide) {
    window.lucide.createIcons();
  }

  setTimeout(() => {
    toast.classList.add('toast-hide');
    setTimeout(() => toast.remove(), 200);
  }, 3500);
};

// Copy to Clipboard Utility
window.copyToClipboard = async function (text, message = 'Copied to clipboard!') {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
    } else {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.left = '-9999px';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
    window.showToast(message, 'success');
    return true;
  } catch (err) {
    console.error('Copy failed:', err);
    window.showToast('Failed to copy to clipboard', 'error');
    return false;
  }
};

// File size formatter utility
window.formatBytes = function (bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

// Setup Drag & Drop Zone helper
window.setupDropZone = function (dropZoneEl, fileInputEl, onFilesSelected) {
  if (!dropZoneEl) return;

  // Make the entire dropzone clickable to trigger the hidden file input
  dropZoneEl.style.cursor = 'pointer';
  dropZoneEl.addEventListener('click', (e) => {
    if (fileInputEl && e.target !== fileInputEl) {
      fileInputEl.click();
    }
  });

  ['dragenter', 'dragover'].forEach(eventName => {
    dropZoneEl.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropZoneEl.classList.add('dropzone-active');
    }, false);
  });

  ['dragleave', 'drop'].forEach(eventName => {
    dropZoneEl.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropZoneEl.classList.remove('dropzone-active');
    }, false);
  });

  dropZoneEl.addEventListener('drop', (e) => {
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      if (fileInputEl) fileInputEl.files = files;
      if (typeof onFilesSelected === 'function') onFilesSelected(files);
    }
  });

  if (fileInputEl) {
    fileInputEl.addEventListener('change', (e) => {
      const files = e.target.files;
      if (files && files.length > 0 && typeof onFilesSelected === 'function') {
        onFilesSelected(files);
      }
    });
  }
};

// Mobile Drawer Navigation Setup
document.addEventListener('DOMContentLoaded', () => {
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mobileMenuDrawer = document.getElementById('mobile-menu-drawer');
  const mobileMenuClose = document.getElementById('mobile-menu-close');
  const mobileMenuBackdrop = document.getElementById('mobile-menu-backdrop');

  function openMobileMenu() {
    if (!mobileMenuDrawer) return;
    mobileMenuDrawer.classList.remove('translate-x-full');
    if (mobileMenuBackdrop) mobileMenuBackdrop.classList.remove('hidden');
    document.body.classList.add('overflow-hidden');
  }

  function closeMobileMenu() {
    if (!mobileMenuDrawer) return;
    mobileMenuDrawer.classList.add('translate-x-full');
    if (mobileMenuBackdrop) mobileMenuBackdrop.classList.add('hidden');
    document.body.classList.remove('overflow-hidden');
  }

  if (mobileMenuBtn) mobileMenuBtn.addEventListener('click', openMobileMenu);
  if (mobileMenuClose) mobileMenuClose.addEventListener('click', closeMobileMenu);
  if (mobileMenuBackdrop) mobileMenuBackdrop.addEventListener('click', closeMobileMenu);

  // Initialize Lucide icons
  if (window.lucide) {
    window.lucide.createIcons();
  }
});
