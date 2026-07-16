# FileNavigation

[Semua bahasa](../../README.md) · [Rilis terbaru](https://github.com/CSXFanMeng/filenavigation/releases/latest)

FileNavigation adalah aplikasi desktop Rust + Tauri untuk menemukan file dan folder di dalam direktori lokal yang dipilih. Pencarian berjalan sepenuhnya di komputer lokal; nama, jalur, dan isi file tidak diunggah.

## Fitur

- Pencarian file dan folder lokal
- Backend Rust/Tauri sepenuhnya asinkron dengan pembatalan dan progres langsung
- Filter hasil, filter jenis, pengurutan, dan rendering bertahap
- Antarmuka responsif modern dengan ikon Lucide dan fokus yang mudah diakses
- Jendela tanpa bingkai buatan aplikasi dengan kontrol terlokalisasi
- Ruang kerja tetap dan daftar hasil yang bergulir secara mandiri
- Antarmuka 20 bahasa dalam file bahasa terpisah
- Pemeriksaan GitHub Release terbaru dengan catatan sesuai bahasa aktif
- Tampilan digest installer untuk verifikasi integritas

## Unduhan

- Windows: `.exe` dan `.msi`
- macOS: `.dmg` dan `.app`
- Linux: `.deb`, `.rpm`, dan `.AppImage`

Unduh dari [GitHub Releases](https://github.com/CSXFanMeng/filenavigation/releases/latest).

## Pengembangan Dan Build

```bash
npm install
npm run tauri:dev
npm run tauri:build
```

Jika PowerShell memblokir `npm.ps1`, gunakan `npm.cmd`. Hasil build berada di `src-tauri/target/release/bundle/`.

## Bahasa Dan Pembaruan

Terjemahan berada di `src/i18n/locales`. [RELEASE_NOTES.md](../../RELEASE_NOTES.md) menggunakan blok `<!-- lang:xx -->`. Pemeriksa pembaruan memilih bahasa aktif, lalu bahasa Inggris, dan terakhir isi Release lengkap.

## Lisensi

Proyek menggunakan [FileNavigation Non-Commercial Source License](../../LICENSE.md). Penggunaan komersial, penjualan kembali, hosting SaaS, layanan berbayar, integrasi komersial tertutup, dan bundling produk komersial dilarang.
