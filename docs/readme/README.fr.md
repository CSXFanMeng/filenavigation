# FileNavigation

[Toutes les langues](../../README.md) · [Dernière version](https://github.com/CSXFanMeng/filenavigation/releases/latest)

FileNavigation est une application de bureau Rust + Tauri permettant de rechercher des fichiers et dossiers dans un répertoire local sélectionné. La recherche reste entièrement sur l’ordinateur ; aucun nom, chemin ou contenu n’est envoyé.

## Fonctionnalités

- Recherche locale de fichiers et dossiers
- Backend Rust/Tauri entièrement asynchrone avec annulation et progression en direct
- Filtrage, tri et rendu progressif des résultats
- Interface moderne et adaptative avec icônes Lucide et focus accessible
- Fenêtre sans bordure dessinée par l’application avec commandes localisées
- Espace de travail fixe et liste de résultats défilant indépendamment
- Interface en 20 langues stockées dans des fichiers séparés
- Vérification de la dernière GitHub Release avec notes dans la langue active
- Affichage des empreintes des installateurs pour vérifier leur intégrité

## Téléchargements

- Windows : `.exe` et `.msi`
- macOS : `.dmg` et `.app`
- Linux : `.deb`, `.rpm` et `.AppImage`

Téléchargez les paquets depuis [GitHub Releases](https://github.com/CSXFanMeng/filenavigation/releases/latest).

## Développement Et Compilation

```bash
npm install
npm run tauri:dev
npm run tauri:build
```

Sous PowerShell, utilisez `npm.cmd` si `npm.ps1` est bloqué. Les paquets sont générés dans `src-tauri/target/release/bundle/`.

## Langues Et Mises À Jour

Les traductions sont dans `src/i18n/locales`. [RELEASE_NOTES.md](../../RELEASE_NOTES.md) utilise des blocs `<!-- lang:xx -->`. Le vérificateur choisit la langue active, puis l’anglais, puis le texte complet de la Release.

## Licence

Le projet utilise la [FileNavigation Non-Commercial Source License](../../LICENSE.md). L’usage commercial, la revente, l’hébergement SaaS, les services payants, l’intégration commerciale fermée et l’inclusion dans un produit commercial sont interdits.
