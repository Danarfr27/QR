# Changelog — Perbaikan & Penjelasan

Dokumentasi singkat mengenai semua perbaikan dan perubahan yang telah diterapkan pada proyek.

Files yang dimodifikasi

- `index.html`
- `style.css`
- `script.js`

Ringkasan Perbaikan

1. Struktur dan tata letak

- `index.html`: Elemen tombol "Back" (`<a class="back-btn">`) dipindahkan dari posisi fixed di pojok kiri ke dalam container `.tab-buttons` sehingga sejajar dengan tombol `Generate` dan `Scan`.
- `style.css`: Reset dasar ditambahkan (`box-sizing`) dan `.card` diubah agar dapat mengisi lebar kontainer/viewport (menghapus `max-width: 760px`) sehingga tampilan menjadi full-bleed pada layar lebar.

2. Kontras dan aksesibilitas

- `style.css`: Input dan tombol diberi outline/focus-visible yang lebih tebal, `box-shadow` yang lebih kuat, dan `font-weight` lebih tebal untuk menjaga keterbacaan terhadap background foto.
- Tombol Back mendapatkan garis tepi hitam kuat (`border: 4px solid #000000`) agar tidak tenggelam di atas gambar latar.

3. Background image dan opasitas

- `style.css`: Overlay putih semi-opa pada `.card` dihapus sehingga gambar latar tampil penuh (opasitas 100%) sesuai permintaan.

4. Responsivitas dan tata ulang (mobile)

- `style.css`: `.tab-buttons` diatur `flex-wrap: wrap` dan ada aturan `@media (max-width: 700px)` untuk menumpuk (stack) tombol pada layar kecil. Ini mencegah back button menimpa tombol Generate/Scan.
- Ukuran tombol besar disesuaikan pada breakpoint mobile agar semua kontrol tetap mudah dijangkau.

5. Elemen visual tambahan

- `style.css`: Marquee (teks berjalan) ditambahkan berisi "QR Code Generator By FE4RD0WN" dengan animasi CSS.
- `script.js`: Snippet parallax ringan ditambahkan (mengubah `background-position` menggunakan `requestAnimationFrame`) untuk efek visual saat scroll.
- Utility `.parallax-layer` ditambahkan untuk performa saat efek animasi aktif.

6. Spacing dan kebersihan CSS

- `style.css`: Beberapa properti duplikat dibersihkan dan spacing input/canvas disesuaikan agar tampil konsisten pada seluruh ukuran layar.

Catatan teknis & cara pengujian

- Menjalankan lokal: buka `index.html` di browser modern (Chrome/Edge/Firefox) — tidak perlu build.
- Verifikasi layout full-width: perbesar jendela browser; `.card` akan mengisi container dan gambar latar tampil penuh.
- Verifikasi back button:
  - Tombol Back kini berada di dalam bar tab atas, sejajar dengan `Generate` dan `Scan`.
  - Pada layar kecil (atau jika mengubah ukuran viewport ke <=700px), tombol akan menumpuk agar tidak menimpa.
- Kontras kontrol: periksa outline/gambar pada elemen input, tombol `Download`, `Dark Mode`, dan ikon kamera — harus terlihat jelas di atas foto.
- Marquee & parallax:
  - Marquee berjalan secara horizontal (kanan→kiri).
  - Scroll halaman untuk melihat efek parallax pada background (jika perangkat/setting mengizinkan).

Reversi & tips

- Jika ingin mengembalikan overlay putih pada `.card`, buka `style.css` dan tambahkan kembali `linear-gradient(...)` sebelum `url(...)` di properti `background-image` pada `.card`.
- Untuk menonaktifkan parallax pada perangkat lambat atau pengguna dengan `prefers-reduced-motion`, bisa menambah pemeriksaan di `script.js` yang menghormati media query tersebut.

Jika ingin saya tambahkan contoh diff sebelum/ sesudah tiap file, atau menulis instruksi deploy singkat, beri tahu — saya akan tambahkan di file ini.
