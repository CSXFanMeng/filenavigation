# FileNavigation

[Alle talen](../../README.md) · [Nieuwste release](https://github.com/CSXFanMeng/filenavigation/releases/latest)

FileNavigation is een Rust + Tauri-desktopapp om bestanden en mappen in een gekozen lokale map te vinden. De zoekactie draait volledig lokaal; namen, paden en inhoud worden niet geüpload.

## Functies

- Lokaal zoeken naar bestanden en mappen
- Volledig asynchrone Rust/Tauri-backend met annuleren en live voortgang
- Resultaatfilters, typefilters, sortering en geleidelijke weergave
- Moderne responsieve interface met Lucide-pictogrammen en toegankelijke focus
- Randloos, door de app getekend venster met vertaalde bediening
- Vaste werkruimte met onafhankelijk scrollende resultatenlijst
- Interface in 20 talen via afzonderlijke taalbestanden
- Controle van de nieuwste GitHub Release met notities in de actieve taal
- Weergave van installatiedigests voor integriteitscontrole

## Downloads

- Windows: `.exe` en `.msi`
- macOS: `.dmg` en `.app`
- Linux: `.deb`, `.rpm` en `.AppImage`

Download via [GitHub Releases](https://github.com/CSXFanMeng/filenavigation/releases/latest).

## Ontwikkeling En Build

```bash
npm install
npm run tauri:dev
npm run tauri:build
```

Gebruik `npm.cmd` als PowerShell `npm.ps1` blokkeert. Uitvoer staat in `src-tauri/target/release/bundle/`.

## Talen En Updates

Vertalingen staan in `src/i18n/locales`. [RELEASE_NOTES.md](../../RELEASE_NOTES.md) gebruikt `<!-- lang:xx -->`-blokken. De updatecontrole kiest eerst de actieve taal, daarna Engels en ten slotte de volledige Release-tekst.

## Licentie

Het project gebruikt de [FileNavigation Non-Commercial Source License](../../LICENSE.md). Commercieel gebruik, wederverkoop, SaaS-hosting, betaalde diensten, gesloten commerciële integratie en bundeling in commerciële producten zijn verboden.
