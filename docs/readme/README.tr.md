# FileNavigation

[Tüm diller](../../README.md) · [En son sürüm](https://github.com/CSXFanMeng/filenavigation/releases/latest)

FileNavigation, seçilen yerel dizindeki dosya ve klasörleri bulmak için Rust + Tauri ile geliştirilmiş bir masaüstü uygulamasıdır. Arama tamamen yerel bilgisayarda çalışır; adlar, yollar veya içerik yüklenmez.

## Özellikler

- Yerel dosya ve klasör arama
- İptal ve canlı ilerleme destekli tamamen asenkron Rust/Tauri arka ucu
- Sonuç filtreleme, tür filtresi, sıralama ve aşamalı işleme
- Lucide simgeleri ve erişilebilir odak durumlarıyla modern duyarlı arayüz
- Uygulamanın çizdiği kenarlık ve yerelleştirilmiş denetimlerle çerçevesiz pencere
- Sabit çalışma alanı ve bağımsız kayan sonuç listesi
- Ayrı dil dosyalarıyla 20 dil arayüzü
- En son GitHub Release ve geçerli dilde sürüm notu kontrolü
- Bütünlük doğrulaması için yükleyici özetleri

## İndirmeler

- Windows: `.exe` ve `.msi`
- macOS: `.dmg` ve `.app`
- Linux: `.deb`, `.rpm` ve `.AppImage`

[GitHub Releases](https://github.com/CSXFanMeng/filenavigation/releases/latest) sayfasından indirin.

## Geliştirme Ve Derleme

```bash
npm install
npm run tauri:dev
npm run tauri:build
```

PowerShell `npm.ps1` dosyasını engellerse `npm.cmd` kullanın. Çıktılar `src-tauri/target/release/bundle/` altındadır.

## Diller Ve Güncellemeler

Çeviriler `src/i18n/locales` altında tutulur. [RELEASE_NOTES.md](../../RELEASE_NOTES.md), `<!-- lang:xx -->` bloklarını kullanır. Güncelleme denetimi geçerli dili, ardından İngilizceyi ve son olarak tam Release metnini seçer.

## Lisans

Proje [FileNavigation Non-Commercial Source License](../../LICENSE.md) kullanır. Ticari kullanım, yeniden satış, SaaS barındırma, ücretli hizmetler, kapalı ticari entegrasyon ve ticari ürünlerde paketleme yasaktır.
