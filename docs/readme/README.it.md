# FileNavigation

[Tutte le lingue](../../README.md) · [Ultima versione](https://github.com/CSXFanMeng/filenavigation/releases/latest)

FileNavigation è un’app desktop Rust + Tauri per trovare file e cartelle in una directory locale selezionata. La ricerca viene eseguita interamente sul computer locale; nomi, percorsi e contenuti non vengono caricati.

## Funzionalità

- Ricerca locale di file e cartelle
- Corrispondenza letterale o tramite espressione regolare dei nomi con controllo maiuscole
- Backend Rust/Tauri completamente asincrono con annullamento e avanzamento in tempo reale
- Filtri, ordinamento e rendering progressivo dei risultati
- Interfaccia moderna e responsive con icone Lucide e focus accessibile
- Finestra senza cornice disegnata dall’app con controlli localizzati
- Area di lavoro fissa e lista risultati con scorrimento indipendente
- Interfaccia in 20 lingue memorizzate in file separati
- Finestra di aggiornamento nella barra del titolo con note GitHub localizzate e scorrevoli e installazione automatica firmata
- Finestra delle impostazioni con temi chiaro e scuro persistenti
- Visualizzazione dei digest degli installer per verificarne l’integrità

## Download

- Windows: `.exe` e `.msi`
- macOS: `.dmg` e `.app`
- Linux: `.deb`, `.rpm` e `.AppImage`

Scarica i pacchetti da [GitHub Releases](https://github.com/CSXFanMeng/filenavigation/releases/latest).

## Sviluppo E Build

```bash
npm install
npm run tauri:dev
npm run tauri:build
```

Se PowerShell blocca `npm.ps1`, usa `npm.cmd`. I pacchetti vengono creati in `src-tauri/target/release/bundle/`.

## Lingue E Aggiornamenti

Le traduzioni sono in `src/i18n/locales`. [RELEASE_NOTES.md](../../RELEASE_NOTES.md) usa blocchi `<!-- lang:xx -->`. Il controllo aggiornamenti prova la lingua corrente, poi l’inglese e infine il testo completo della Release.

## Sviluppato Con OpenAI Codex E GPT-5.6

OpenAI Codex e GPT-5.6 sono stati utilizzati come collaboratori di ingegneria per l'architettura, la ricerca asincrona annullabile, l'internazionalizzazione modulare, il debug dell'interfaccia reattiva e senza bordi, l'automazione multipiattaforma di CI e release, la documentazione multilingue e la verifica continua tramite build e test.

L'IA viene usata solo durante lo sviluppo. FileNavigation non chiama servizi OpenAI durante l'esecuzione e non invia a modelli nomi di file, percorsi, ricerche o contenuti dei file.

## Licenza

Il progetto usa la [FileNavigation Non-Commercial Source License](../../LICENSE.md). Sono vietati uso commerciale, rivendita, hosting SaaS, servizi a pagamento, integrazione commerciale chiusa e distribuzione in prodotti commerciali.
