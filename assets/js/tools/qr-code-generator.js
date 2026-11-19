/**
 * Tool 12: Custom QR Code Generator
 * URLs, Wi-Fi, vCard, Email with high-resolution PNG & SVG exports
 */

document.addEventListener('DOMContentLoaded', () => {
  const typeSelect = document.getElementById('qr-type-select');

  // Input groups
  const groupUrl = document.getElementById('group-url');
  const groupText = document.getElementById('group-text');
  const groupWifi = document.getElementById('group-wifi');
  const groupVcard = document.getElementById('group-vcard');
  const groupEmail = document.getElementById('group-email');

  // Specific inputs
  const inputUrl = document.getElementById('qr-input-url');
  const inputText = document.getElementById('qr-input-text');
  
  const wifiSsid = document.getElementById('wifi-ssid');
  const wifiPass = document.getElementById('wifi-pass');
  const wifiType = document.getElementById('wifi-type');

  const vcardFn = document.getElementById('vcard-name');
  const vcardOrg = document.getElementById('vcard-org');
  const vcardPhone = document.getElementById('vcard-phone');
  const vcardEmail = document.getElementById('vcard-email');
  const vcardUrl = document.getElementById('vcard-url');

  const emailTo = document.getElementById('email-to');
  const emailSub = document.getElementById('email-sub');
  const emailBody = document.getElementById('email-body');

  // Customization
  const colorDark = document.getElementById('qr-color-dark');
  const colorLight = document.getElementById('qr-color-light');
  const errorLevel = document.getElementById('qr-error-level');
  const sizeSelect = document.getElementById('qr-size-select');

  const qrContainer = document.getElementById('qr-code-display');
  const downloadPngBtn = document.getElementById('download-qr-png');
  const downloadSvgBtn = document.getElementById('download-qr-svg');
  const copyBtn = document.getElementById('copy-qr-btn');

  let currentQrInstance = null;

  // Handle data type change
  if (typeSelect) {
    typeSelect.addEventListener('change', () => {
      const val = typeSelect.value;
      [groupUrl, groupText, groupWifi, groupVcard, groupEmail].forEach(g => {
        if (g) g.classList.add('hidden');
      });

      if (val === 'url' && groupUrl) groupUrl.classList.remove('hidden');
      if (val === 'text' && groupText) groupText.classList.remove('hidden');
      if (val === 'wifi' && groupWifi) groupWifi.classList.remove('hidden');
      if (val === 'vcard' && groupVcard) groupVcard.classList.remove('hidden');
      if (val === 'email' && groupEmail) groupEmail.classList.remove('hidden');

      generateQr();
    });
  }

  function getFormattedQrText() {
    const type = typeSelect ? typeSelect.value : 'url';

    if (type === 'url') {
      let val = inputUrl ? inputUrl.value.trim() : '';
      if (!val) val = 'https://multitools-hub.web.app';
      if (!val.startsWith('http://') && !val.startsWith('https://')) {
        val = 'https://' + val;
      }
      return val;
    }

    if (type === 'text') {
      return (inputText && inputText.value.trim()) || 'MultiTools Hub Creator Suite';
    }

    if (type === 'wifi') {
      const ssid = wifiSsid ? wifiSsid.value.trim() || 'MyHomeWiFi' : 'MyHomeWiFi';
      const pass = wifiPass ? wifiPass.value.trim() : '';
      const enc = wifiType ? wifiType.value : 'WPA';
      return `WIFI:S:${ssid};T:${enc};P:${pass};;`;
    }

    if (type === 'vcard') {
      const name = (vcardFn && vcardFn.value.trim()) || 'Alex Morgan';
      const org = (vcardOrg && vcardOrg.value.trim()) || 'Creative Studio';
      const phone = (vcardPhone && vcardPhone.value.trim()) || '+1234567890';
      const email = (vcardEmail && vcardEmail.value.trim()) || 'hello@example.com';
      const url = (vcardUrl && vcardUrl.value.trim()) || 'https://multitools-hub.web.app';

      return [
        'BEGIN:VCARD',
        'VERSION:3.0',
        `FN:${name}`,
        `ORG:${org}`,
        `TEL:${phone}`,
        `EMAIL:${email}`,
        `URL:${url}`,
        'END:VCARD'
      ].join('\n');
    }

    if (type === 'email') {
      const to = (emailTo && emailTo.value.trim()) || 'support@multitools-hub.web.app';
      const sub = (emailSub && emailSub.value.trim()) || 'Inquiry';
      const body = (emailBody && emailBody.value.trim()) || 'Hello from MultiTools Hub!';
      return `mailto:${to}?subject=${encodeURIComponent(sub)}&body=${encodeURIComponent(body)}`;
    }

    return 'https://multitools-hub.web.app';
  }

  function generateQr() {
    if (!qrContainer) return;
    const text = getFormattedQrText();
    const dark = colorDark ? colorDark.value : '#0f172a';
    const light = colorLight ? colorLight.value : '#ffffff';
    const correctLevelStr = errorLevel ? errorLevel.value : 'H';
    const targetSize = parseInt(sizeSelect ? sizeSelect.value : '512', 10) || 512;

    qrContainer.innerHTML = '';

    // If QRCode.js is loaded
    if (window.QRCode) {
      let level = window.QRCode.CorrectLevel.H;
      if (correctLevelStr === 'L') level = window.QRCode.CorrectLevel.L;
      if (correctLevelStr === 'M') level = window.QRCode.CorrectLevel.M;
      if (correctLevelStr === 'Q') level = window.QRCode.CorrectLevel.Q;

      currentQrInstance = new window.QRCode(qrContainer, {
        text: text,
        width: targetSize,
        height: targetSize,
        colorDark: dark,
        colorLight: light,
        correctLevel: level
      });
    } else {
      // Fallback message while library loads
      qrContainer.innerHTML = '<p class="text-sm text-slate-400">Loading QR Engine...</p>';
    }
  }

  // Event listeners for real-time updates
  const allInputs = [
    inputUrl, inputText, wifiSsid, wifiPass, wifiType,
    vcardFn, vcardOrg, vcardPhone, vcardEmail, vcardUrl,
    emailTo, emailSub, emailBody, colorDark, colorLight, errorLevel, sizeSelect
  ];

  allInputs.forEach(inp => {
    if (inp) {
      inp.addEventListener('input', generateQr);
      inp.addEventListener('change', generateQr);
    }
  });

  // Download PNG
  if (downloadPngBtn) {
    downloadPngBtn.addEventListener('click', () => {
      const canvas = qrContainer.querySelector('canvas');
      const img = qrContainer.querySelector('img');

      if (canvas) {
        canvas.toBlob((blob) => {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `qrcode-${Date.now()}.png`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          setTimeout(() => URL.revokeObjectURL(url), 5000);
          window.showToast('High-res QR Code PNG downloaded!', 'success');
        });
      } else if (img && img.src) {
        const a = document.createElement('a');
        a.href = img.src;
        a.download = `qrcode-${Date.now()}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.showToast('QR Code downloaded!', 'success');
      } else {
        window.showToast('No QR code ready for download', 'error');
      }
    });
  }

  // Download SVG
  if (downloadSvgBtn) {
    downloadSvgBtn.addEventListener('click', () => {
      const canvas = qrContainer.querySelector('canvas');
      if (!canvas) {
        window.showToast('Please wait for QR code to generate', 'error');
        return;
      }

      // Convert canvas pixels to simple vector SVG squares
      const ctx = canvas.getContext('2d');
      const w = canvas.width;
      const h = canvas.height;
      const imgData = ctx.getImageData(0, 0, w, h).data;
      const dark = colorDark ? colorDark.value : '#000000';
      const light = colorLight ? colorLight.value : '#ffffff';

      let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">\n`;
      svg += `  <rect width="100%" height="100%" fill="${light}"/>\n`;

      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const idx = (y * w + x) * 4;
          // check if pixel is closer to dark
          if (imgData[idx] < 128) {
            svg += `  <rect x="${x}" y="${y}" width="1" height="1" fill="${dark}"/>\n`;
          }
        }
      }
      svg += `</svg>`;

      const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `qrcode-${Date.now()}.svg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 5000);
      window.showToast('Vector QR Code SVG downloaded!', 'success');
    });
  }

  // Copy Image
  if (copyBtn) {
    copyBtn.addEventListener('click', async () => {
      const canvas = qrContainer.querySelector('canvas');
      if (!canvas) {
        window.showToast('No QR code generated yet', 'error');
        return;
      }
      try {
        canvas.toBlob(async (blob) => {
          if (navigator.clipboard && window.ClipboardItem) {
            await navigator.clipboard.write([
              new ClipboardItem({ 'image/png': blob })
            ]);
            window.showToast('QR Code copied to clipboard!', 'success');
          } else {
            window.showToast('Clipboard image copy not supported in this browser', 'info');
          }
        });
      } catch (err) {
        console.error('Copy QR error:', err);
        window.showToast('Failed to copy QR code image', 'error');
      }
    });
  }

  // Wait for QRCode library to be available then generate
  function checkAndInit() {
    if (window.QRCode) {
      generateQr();
    } else {
      setTimeout(checkAndInit, 100);
    }
  }
  checkAndInit();
});
