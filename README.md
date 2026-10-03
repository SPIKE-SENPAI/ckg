# CKG Data Converter — Web Lightweight (Prototype 0.1.2)

Prototype aplikasi browser untuk mengelola beberapa peserta CKG dan mengekspor data ke empat template Excel:

- CKG Umum — Local
- CKG Umum — Non-Local
- CKG Sekolah — Local
- CKG Sekolah — Non-Local

## Menjalankan

1. Ekstrak ZIP ke satu folder.
2. Pastikan perangkat terhubung ke internet saat pertama membuka aplikasi (library JSZip dimuat dari CDN).
3. Jalankan server statis pada folder ini. Di komputer yang memiliki Python:
   - Windows: jalankan `start-server.bat`
   - macOS/Linux: jalankan `./start-server.sh`
4. Buka alamat yang ditampilkan server (biasanya `http://localhost:8000`).

Jangan membuka `index.html` langsung melalui `file://` bila browser membatasi pemuatan script.

## Fitur pada prototype

- Tampilan responsif untuk layar ponsel, tablet, dan desktop.
- Pilihan jenis CKG dan format Local/Non-Local.
- Form peserta yang menyesuaikan jenis dan format template.
- Tambah, edit, salin, hapus, cari peserta, dan hapus semua.
- Nama file ekspor dapat disesuaikan.
- Pemetaan kolom untuk keempat template.
- NIK dan nomor telepon ditulis sebagai teks agar nol di depan tidak hilang.
- Tanggal dikonversi ke format `DD/MM/YYYY`.
- Data peserta diproses di browser; tidak ada endpoint unggah data.
- Data sesi hanya berada di memori halaman. Muat ulang halaman untuk menghapusnya.

## Aturan pemetaan Sekolah

- Input `Jenjang Pendidikan` dan `Kelas` disediakan terpisah.
- Template Sekolah Local tidak memiliki kolom khusus Jenjang Pendidikan yang berdiri sendiri. Sesuai keputusan, nilai `Kelas` (contoh `Kelas 4`) masuk ke kolom `Jenjang Pendidikan` pada template Local.
- Template Sekolah Non-Local menerima nilai `Kelas` di kolom `KELAS`.
- Nilai `Jenjang Pendidikan` (SD/SMP/SMA/SMK, dan seterusnya) tetap menjadi input tersendiri dan tidak diekspor karena template tidak menyediakan kolomnya.

## Batasan yang diketahui

- Ini prototype UI dan mesin ekspor, belum versi produksi.
- Login Firebase, role Admin/Petugas, pengelolaan akun, dan hosting Google Apps Script belum dibuat.
- Library JSZip dimuat dari CDN; koneksi internet diperlukan saat membuka aplikasi. Mesin ekspor mengubah XML lembar kerja langsung agar struktur, style, validasi, dan sheet template yang ada tetap dipertahankan sebanyak mungkin.
- Keluaran perlu diuji di Excel dan pada ekstensi CKG yang digunakan sebelum dipakai dengan data operasional. Khusus template Umum Local, file sumber memiliki metadata font `family=18` yang tidak sesuai rentang SpreadsheetML; file di folder `templates` diperbaiki secara minimal menjadi `family=2` agar dapat dibaca pustaka spreadsheet.
- Gunakan data dummy saat menguji prototype. Jangan masukkan data pasien sungguhan sebelum proses validasi dan uji penerimaan selesai.

## Privasi

Prototype ini tidak memiliki database dan tidak mengirim data peserta ke server. Hindari menambahkan fitur penyimpanan otomatis atau telemetri yang memuat data pasien tanpa keputusan privasi dan persetujuan terpisah.


## Firebase Authentication (v0.1.3)
1. In Firebase Console, open Authentication > Sign-in method.
2. Enable Email/Password.
3. Create user accounts from Authentication > Users (there is no public sign-up screen).
4. Serve this folder through localhost or an HTTPS host. ES modules and Firebase require a web server; do not open index.html as file://.
5. Add the hosting domain to Authentication > Settings > Authorized domains if needed.

This release adds Firebase email/password sign-in and sign-out only. It does not yet implement role enforcement, admin/staff management, or trusted backend authorization. Do not treat hiding the UI as an authorization boundary. Those functions require a trusted backend before production use. Patient records remain in browser memory and are not written to Firebase.

## Manajemen akun (v0.1.6, Apps Script gratis)
- Super Admin dapat membuat Admin/Petugas, mengubah role, mengaktifkan/menonaktifkan, dan menghapus akses secara logis.
- Admin hanya dapat membuat/mengelola Petugas.
- Petugas tidak melihat menu manajemen akun.
- Password dikirim ke Firebase Authentication dan tidak ditulis ke Google Sheets.
- Pastikan Apps Script v0.3-free sudah dideploy sebagai Web App dan URL di `firebase-auth.js` sesuai.
- Penghapusan akun adalah penghapusan logis pada Sheet; akun Firebase tetap ada.
- Pengelolaan pengguna belum diuji pada akun operasional. Uji dahulu dengan akun dummy.
