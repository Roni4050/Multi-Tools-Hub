/**
 * Tool 4: YouTube & Reels Thumbnail Previewer
 * Real-time responsive feed mockups with theme switching
 */

document.addEventListener('DOMContentLoaded', () => {
  const dropZone = document.getElementById('thumb-dropzone');
  const fileInput = document.getElementById('thumb-file-input');
  const avatarInput = document.getElementById('avatar-file-input');
  
  const titleInput = document.getElementById('video-title-input');
  const channelInput = document.getElementById('channel-name-input');
  const durationInput = document.getElementById('video-duration-input');
  const viewsInput = document.getElementById('video-views-input');
  const timeInput = document.getElementById('video-time-input');
  
  const charCountEl = document.getElementById('char-count');
  const charStatusEl = document.getElementById('char-status');

  const themeDarkBtn = document.getElementById('mockup-dark-btn');
  const themeLightBtn = document.getElementById('mockup-light-btn');
  const mockupContainers = document.querySelectorAll('.mockup-container');

  // Preview elements
  const thumbPreviews = document.querySelectorAll('.mockup-thumb-img');
  const avatarPreviews = document.querySelectorAll('.mockup-avatar-img');
  const titlePreviews = document.querySelectorAll('.mockup-title');
  const channelPreviews = document.querySelectorAll('.mockup-channel');
  const metaPreviews = document.querySelectorAll('.mockup-meta');
  const durationBadges = document.querySelectorAll('.mockup-duration');

  const presetButtons = document.querySelectorAll('.thumb-preset-btn');

  // Setup thumbnail upload
  if (dropZone && fileInput) {
    window.setupDropZone(dropZone, fileInput, (files) => {
      const file = files[0];
      if (!file || !file.type.startsWith('image/')) {
        window.showToast('Please upload a valid thumbnail image (JPG, PNG, WEBP)', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        updateThumbnailSrc(e.target.result);
        window.showToast('Thumbnail updated!', 'success');
      };
      reader.readAsDataURL(file);
    });
  }

  // Setup avatar upload
  if (avatarInput) {
    avatarInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (evt) => {
          avatarPreviews.forEach(el => el.src = evt.target.result);
          window.showToast('Channel avatar updated!', 'success');
        };
        reader.readAsDataURL(file);
      }
    });
  }

  function updateThumbnailSrc(src) {
    thumbPreviews.forEach(img => {
      img.src = src;
    });
  }

  // Title input listener with character counter and warning
  if (titleInput) {
    titleInput.addEventListener('input', () => {
      const text = titleInput.value.trim() || 'How to Master Video Creation in 2026 (Full Tutorial)';
      titlePreviews.forEach(el => el.textContent = text);

      const len = titleInput.value.length;
      if (charCountEl) charCountEl.textContent = len;

      if (charStatusEl) {
        if (len === 0) {
          charStatusEl.textContent = 'Empty';
          charStatusEl.className = 'text-slate-400';
        } else if (len < 30) {
          charStatusEl.textContent = 'Short (Consider adding keywords)';
          charStatusEl.className = 'text-amber-500 font-medium';
        } else if (len <= 65) {
          charStatusEl.textContent = 'Optimal length (Great visibility)';
          charStatusEl.className = 'text-emerald-500 font-medium';
        } else {
          charStatusEl.textContent = 'May truncate on mobile feeds';
          charStatusEl.className = 'text-rose-500 font-medium';
        }
      }
    });
  }

  // Channel Name listener
  if (channelInput) {
    channelInput.addEventListener('input', () => {
      const name = channelInput.value.trim() || 'MultiTools Studio';
      channelPreviews.forEach(el => el.textContent = name);
    });
  }

  // Duration listener
  if (durationInput) {
    durationInput.addEventListener('input', () => {
      const dur = durationInput.value.trim() || '12:45';
      durationBadges.forEach(el => el.textContent = dur);
    });
  }

  // Views & Time listeners
  function updateMeta() {
    const views = viewsInput ? viewsInput.value.trim() || '142K views' : '142K views';
    const time = timeInput ? timeInput.value.trim() || '3 days ago' : '3 days ago';
    const combined = `${views} • ${time}`;
    metaPreviews.forEach(el => el.textContent = combined);
  }

  if (viewsInput) viewsInput.addEventListener('input', updateMeta);
  if (timeInput) timeInput.addEventListener('input', updateMeta);

  // Theme Toggle for Mockups
  if (themeDarkBtn && themeLightBtn) {
    themeDarkBtn.addEventListener('click', () => {
      mockupContainers.forEach(container => {
        container.classList.remove('bg-white', 'text-slate-900', 'border-slate-200');
        container.classList.add('bg-[#0f0f0f]', 'text-white', 'border-zinc-800');
      });
      themeDarkBtn.classList.add('bg-indigo-600', 'text-white');
      themeDarkBtn.classList.remove('bg-slate-200', 'text-slate-700', 'dark:bg-slate-700', 'dark:text-slate-200');
      themeLightBtn.classList.remove('bg-indigo-600', 'text-white');
      themeLightBtn.classList.add('bg-slate-200', 'text-slate-700', 'dark:bg-slate-700', 'dark:text-slate-200');
    });

    themeLightBtn.addEventListener('click', () => {
      mockupContainers.forEach(container => {
        container.classList.remove('bg-[#0f0f0f]', 'text-white', 'border-zinc-800');
        container.classList.add('bg-white', 'text-slate-900', 'border-slate-200');
      });
      themeLightBtn.classList.add('bg-indigo-600', 'text-white');
      themeLightBtn.classList.remove('bg-slate-200', 'text-slate-700', 'dark:bg-slate-700', 'dark:text-slate-200');
      themeDarkBtn.classList.remove('bg-indigo-600', 'text-white');
      themeDarkBtn.classList.add('bg-slate-200', 'text-slate-700', 'dark:bg-slate-700', 'dark:text-slate-200');
    });
  }

  // Presets
  presetButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const title = btn.getAttribute('data-title');
      const channel = btn.getAttribute('data-channel');
      const duration = btn.getAttribute('data-duration');
      const views = btn.getAttribute('data-views');
      const time = btn.getAttribute('data-time');
      const bg = btn.getAttribute('data-color') || '#4f46e5';

      if (titleInput) titleInput.value = title;
      if (channelInput) channelInput.value = channel;
      if (durationInput) durationInput.value = duration;
      if (viewsInput) viewsInput.value = views;
      if (timeInput) timeInput.value = time;

      // Generate a dynamic placeholder canvas thumbnail
      const c = document.createElement('canvas');
      c.width = 1280;
      c.height = 720;
      const ctx = c.getContext('2d');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, 1280, 720);

      // Gradient accent
      const grad = ctx.createLinearGradient(0, 0, 1280, 720);
      grad.addColorStop(0, 'rgba(255,255,255,0.15)');
      grad.addColorStop(1, 'rgba(0,0,0,0.4)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 1280, 720);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 72px -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(title.substring(0, 24) + '...', 640, 360);

      updateThumbnailSrc(c.toDataURL('image/jpeg', 0.85));

      // Trigger inputs
      if (titleInput) titleInput.dispatchEvent(new Event('input'));
      if (channelInput) channelInput.dispatchEvent(new Event('input'));
      if (durationInput) durationInput.dispatchEvent(new Event('input'));
      updateMeta();
      window.showToast('Sample preset loaded!', 'info');
    });
  });
});
