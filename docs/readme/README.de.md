# FileNavigation

[Alle Sprachen](../../README.md) · [Neueste Version](https://github.com/CSXFanMeng/filenavigation/releases/latest)

FileNavigation ist eine mit Rust und Tauri entwickelte Desktop-Anwendung zum Suchen von Dateien und Ordnern in einem ausgewählten lokalen Verzeichnis. Die Suche läuft vollständig lokal; Dateinamen, Pfade und Inhalte werden nicht hochgeladen.

## Funktionen

- Lokale Datei- und Ordnersuche
- Vollständig asynchrones Rust/Tauri-Backend mit Abbruch und Live-Fortschritt
- Filterung, Sortierung und schrittweises Rendern der Ergebnisse
- Moderne responsive Oberfläche mit Lucide-Symbolen und zugänglichem Fokus
- Rahmenloses, von der App gezeichnetes Fenster mit lokalisierten Bedienelementen
- Fester Arbeitsbereich mit unabhängig scrollender Ergebnisliste
- Oberfläche in 20 Sprachen mit getrennten Sprachdateien
- Updateprüfung über die neueste GitHub Release mit passenden Sprachhinweisen
- Anzeige von Paketprüfsummen zur Integritätsprüfung

## Downloads

- Windows: `.exe` und `.msi`
- macOS: `.dmg` und `.app`
- Linux: `.deb`, `.rpm` und `.AppImage`

Pakete stehen unter [GitHub Releases](https://github.com/CSXFanMeng/filenavigation/releases/latest) bereit.

## Entwicklung Und Build

```bash
npm install
npm run tauri:dev
npm run tauri:build
```

Falls PowerShell `npm.ps1` blockiert, verwenden Sie `npm.cmd`. Die Ausgaben liegen unter `src-tauri/target/release/bundle/`.

## Sprachen Und Updates

Übersetzungen liegen in `src/i18n/locales`. [RELEASE_NOTES.md](../../RELEASE_NOTES.md) verwendet `<!-- lang:xx -->`-Blöcke. Die Updateprüfung nutzt zuerst die aktive Sprache, dann Englisch und zuletzt den vollständigen Release-Text.

## Lizenz

Das Projekt verwendet die [FileNavigation Non-Commercial Source License](../../LICENSE.md). Kommerzielle Nutzung, Weiterverkauf, SaaS-Hosting, bezahlte Dienste, geschlossene kommerzielle Integration und Einbindung in kommerzielle Produkte sind untersagt.
