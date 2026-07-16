# FileNavigation

[Wszystkie języki](../../README.md) · [Najnowsze wydanie](https://github.com/CSXFanMeng/filenavigation/releases/latest)

FileNavigation to aplikacja desktopowa Rust + Tauri do wyszukiwania plików i folderów w wybranym lokalnym katalogu. Wyszukiwanie działa całkowicie na komputerze; nazwy, ścieżki i zawartość nie są wysyłane.

## Funkcje

- Lokalne wyszukiwanie plików i folderów
- W pełni asynchroniczny backend Rust/Tauri z anulowaniem i postępem na żywo
- Filtrowanie, sortowanie i stopniowe renderowanie wyników
- Nowoczesny responsywny interfejs z ikonami Lucide i dostępnym fokusem
- Okno bez systemowej ramki z obramowaniem aplikacji i zlokalizowanymi przyciskami
- Stały obszar roboczy i niezależnie przewijana lista wyników
- Interfejs w 20 językach zapisanych w osobnych plikach
- Okno aktualizacji na pasku tytułu z przewijanymi, zlokalizowanymi notatkami GitHub i podpisaną automatyczną instalacją
- Okno ustawień z zapisywanymi jasnym i ciemnym motywem
- Wyświetlanie skrótów instalatorów do sprawdzania integralności

## Pobieranie

- Windows: `.exe` i `.msi`
- macOS: `.dmg` i `.app`
- Linux: `.deb`, `.rpm` i `.AppImage`

Pobierz z [GitHub Releases](https://github.com/CSXFanMeng/filenavigation/releases/latest).

## Rozwój I Budowanie

```bash
npm install
npm run tauri:dev
npm run tauri:build
```

Jeśli PowerShell blokuje `npm.ps1`, użyj `npm.cmd`. Pliki wynikowe znajdują się w `src-tauri/target/release/bundle/`.

## Języki I Aktualizacje

Tłumaczenia znajdują się w `src/i18n/locales`. [RELEASE_NOTES.md](../../RELEASE_NOTES.md) używa bloków `<!-- lang:xx -->`. Aktualizator wybiera aktywny język, następnie angielski, a na końcu pełny tekst Release.

## Zbudowano Z OpenAI Codex I GPT-5.6

OpenAI Codex i GPT-5.6 wykorzystano jako partnerów inżynieryjnych przy projektowaniu architektury, anulowalnego wyszukiwania asynchronicznego, modułowej internacjonalizacji, debugowaniu responsywnego interfejsu bez ramek, automatyzacji wieloplatformowego CI i wydań, dokumentacji wielojęzycznej oraz ciągłej weryfikacji kompilacji i testów.

AI jest używana wyłącznie podczas rozwoju. FileNavigation nie wywołuje usług OpenAI w czasie działania i nie wysyła do modelu nazw plików, ścieżek, wyszukiwań ani zawartości plików.

## Licencja

Projekt używa [FileNavigation Non-Commercial Source License](../../LICENSE.md). Zabronione są użycie komercyjne, odsprzedaż, hosting SaaS, płatne usługi, zamknięta integracja komercyjna i dołączanie do produktów komercyjnych.
