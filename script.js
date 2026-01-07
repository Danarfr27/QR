const canvas = document.getElementById('qrCanvas');
const ctx = canvas.getContext('2d');
const linkInput = document.getElementById('linkInput');
const imgInput = document.getElementById('imgInput');
const downloadBtn = document.getElementById('downloadBtn');
const cancelImgBtn = document.getElementById('cancelImgBtn');
const qrImageInput = document.getElementById('qrImageInput');
const scanModeRadios = document.querySelectorAll('input[name="scanMode"]');
const scanResult = document.getElementById('scanResult');
const tbody = document.querySelector('#scanTable tbody');

let overlayImage = null;
let html5QrCode = null;
let scanHistory = [];

// responsive canvas helper
function resizeCanvas() {
  const container = canvas.parentElement || document.body;
  const max = Math.min(512, Math.floor(container.clientWidth * 0.7));
  const size = Math.max(180, max);
  if (canvas.width !== size) {
    canvas.width = size;
    canvas.height = size;
    if (linkInput.value) generateQR(linkInput.value, overlayImage);
  }
}

function debounce(fn, wait){
  let t; return function(...a){ clearTimeout(t); t = setTimeout(()=>fn.apply(this,a), wait); }
}

// Tab switching
function showTab(tab) {
  document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
  document.getElementById(tab + 'Tab').classList.add('active');
}

// Generate QR with optional overlay
function generateQR(link, overlayImg) {
  const qr = qrcode(0, 'H');
  qr.addData(link);
  qr.make();

  const size = canvas.width || 256;
  const tile = size / qr.getModuleCount();
  ctx.clearRect(0, 0, size, size);

  for (let row = 0; row < qr.getModuleCount(); row++) {
    for (let col = 0; col < qr.getModuleCount(); col++) {
      ctx.fillStyle = qr.isDark(row, col) ? "#000" : "#fff";
      ctx.fillRect(col * tile, row * tile, tile, tile);
    }
  }

  if (overlayImg) {
    const imgSize = size * 0.3;
    ctx.drawImage(overlayImg, (size - imgSize) / 2, (size - imgSize) / 2, imgSize, imgSize);
  }

  canvas.classList.add('show');
}

// Input events
imgInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function (evt) {
      overlayImage = new Image();
      overlayImage.onload = () => {
        if (linkInput.value) generateQR(linkInput.value, overlayImage);
      };
      overlayImage.src = evt.target.result;
    };
    reader.readAsDataURL(file);
  }
});

linkInput.addEventListener('input', () => {
  if (linkInput.value) generateQR(linkInput.value, overlayImage);
});

cancelImgBtn.addEventListener('click', () => {
  overlayImage = null;
  imgInput.value = '';
  if (linkInput.value) generateQR(linkInput.value, null);
});

downloadBtn.addEventListener('click', () => {
  const link = document.createElement('a');
  link.download = 'qr.png';
  link.href = canvas.toDataURL();
  link.click();
});

function toggleDarkMode() {
  document.body.classList.toggle('dark');
}

// SCANNER via CAMERA
function startScanner() {
  scanResult.textContent = 'Memulai pemindaian...';
  html5QrCode = new Html5Qrcode("reader");

  Html5Qrcode.getCameras().then(devices => {
  if (devices.length) {
    const backCam = devices.find(d => d.label.toLowerCase().includes('back')) || devices[0];
    const cameraId = backCam.id;
    const isMobile = 'ontouchstart' in window || window.innerWidth < 700;
    const boxSize = Math.min(360, Math.floor(window.innerWidth * (isMobile ? 0.7 : 0.4)));
    html5QrCode.start(
      cameraId,
      { fps: isMobile ? 7 : 10, qrbox: { width: boxSize, height: boxSize } },
      qrCodeMessage => {
        const now = new Date().toLocaleString();
        scanHistory.push([qrCodeMessage, now]);
        scanResult.innerHTML = `✔ QR ditemukan:<br><a href="${qrCodeMessage}" target="_blank">${qrCodeMessage}</a>`;
        const row = document.createElement('tr');
        row.innerHTML = `<td><a href="${qrCodeMessage}" target="_blank">${qrCodeMessage}</a></td><td>${now}</td>`;
        tbody.appendChild(row);
        html5QrCode.stop();
      },
      errorMessage => {}
    ).catch(err => {
      scanResult.textContent = `❌ Gagal memulai scanner: ${err}`;
    });
  } else {
    scanResult.textContent = 'Tidak ada kamera terdeteksi.';
  }
}).catch(err => {
  scanResult.textContent = `❌ Kesalahan kamera: ${err}`;
});
}

function stopScanner() {
  if (html5QrCode) {
    html5QrCode.stop().then(() => {
      scanResult.textContent = '🚫 Scan telah dihentikan.';
      html5QrCode.clear();
    }).catch(err => {
      scanResult.textContent = `❌ Gagal menghentikan scanner: ${err}`;
    });
  } else {
    scanResult.textContent = 'Scanner belum aktif.';
  }
}

// SCANNER via UPLOAD
qrImageInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const html5QrCode = new Html5Qrcode("reader");
  html5QrCode.scanFile(file, true)
    .then(qrCodeMessage => {
      const now = new Date().toLocaleString();
      scanHistory.push([qrCodeMessage, now]);
      scanResult.innerHTML = `✔ QR ditemukan dari gambar:<br><a href="${qrCodeMessage}" target="_blank">${qrCodeMessage}</a>`;
      const row = document.createElement('tr');
      row.innerHTML = `<td><a href="${qrCodeMessage}" target="_blank">${qrCodeMessage}</a></td><td>${now}</td>`;
      tbody.appendChild(row);
    })
    .catch(err => {
      scanResult.textContent = `❌ Gagal membaca QR dari gambar: ${err}`;
    });
});

// SCAN MODE SWITCH
scanModeRadios.forEach(radio => {
  radio.addEventListener('change', (e) => {
    const mode = e.target.value;
    document.getElementById('scanViaCamera').classList.toggle('hidden', mode !== 'camera');
    document.getElementById('scanViaUpload').classList.toggle('hidden', mode !== 'upload');
  });
});

// SAVE HISTORY as CSV
function downloadScanHistory() {
  if (scanHistory.length === 0) return alert("Belum ada data scan yang tersimpan.");

  let csvContent = "data:text/csv;charset=utf-8,Link,Tanggal dan Waktu\n";
  scanHistory.forEach(item => {
    csvContent += item.join(",") + "\n";
  });

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "scan_history.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// WHATSAPP SHARE
function sendViaWhatsApp() {
  if (scanHistory.length === 0) return alert("Belum ada hasil yang bisa dikirim.");
  const lastScan = scanHistory[scanHistory.length - 1];
  const message = encodeURIComponent(`Hasil scan:\n${lastScan[0]}\nWaktu: ${lastScan[1]}`);
  window.open(`https://wa.me/?text=${message}`, '_blank');
}

// --- Parallax background (simple, performant) ---
(() => {
  const isTouch = 'ontouchstart' in window || window.innerWidth < 700;
  if (isTouch) return; // disable parallax on small/touch devices

  let ticking = false;
  function onScroll() {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        const y = window.scrollY;
        // move background slightly for parallax effect
        document.body.style.backgroundPosition = `center ${-y * 0.25}px`;
        ticking = false;
      });
      ticking = true;
    }
  }
  // enable on load
  window.addEventListener('scroll', onScroll, { passive: true });
  // also trigger once to initialize
  onScroll();
})();

// init responsive canvas and listeners
resizeCanvas();
window.addEventListener('resize', debounce(resizeCanvas, 150));
