# FileNavigation

[Todos los idiomas](../../README.md) · [Última versión](https://github.com/CSXFanMeng/filenavigation/releases/latest)

FileNavigation es una aplicación de escritorio creada con Rust y Tauri para encontrar archivos y carpetas dentro de un directorio local seleccionado. La búsqueda se ejecuta completamente en el equipo local y no sube nombres, rutas ni contenido.

## Funciones

- Búsqueda local de archivos y carpetas
- Backend Rust/Tauri totalmente asíncrono con cancelación y progreso en vivo
- Filtros, ordenación y renderizado progresivo de resultados
- Interfaz moderna y adaptable con iconos Lucide y foco accesible
- Ventana sin marco dibujada por la app con controles localizados
- Área de trabajo fija y lista de resultados con desplazamiento independiente
- Interfaz en 20 idiomas mediante archivos de idioma separados
- Actualizaciones desde la última GitHub Release con notas en el idioma actual
- Resúmenes de instaladores para verificar su integridad

## Descargas

- Windows: `.exe` y `.msi`
- macOS: `.dmg` y `.app`
- Linux: `.deb`, `.rpm` y `.AppImage`

Descarga los paquetes desde [GitHub Releases](https://github.com/CSXFanMeng/filenavigation/releases/latest).

## Desarrollo Y Compilación

```bash
npm install
npm run tauri:dev
npm run tauri:build
```

En PowerShell, si `npm.ps1` está bloqueado, usa `npm.cmd`. Los paquetes se generan en `src-tauri/target/release/bundle/`.

## Idiomas Y Actualizaciones

Las traducciones están en `src/i18n/locales`. [RELEASE_NOTES.md](../../RELEASE_NOTES.md) usa bloques `<!-- lang:xx -->`. El actualizador selecciona el idioma actual, después inglés y finalmente el texto completo de la Release.

## Creado Con OpenAI Codex Y GPT-5.6

OpenAI Codex y GPT-5.6 se utilizaron como colaboradores de ingeniería para la arquitectura, la búsqueda asíncrona cancelable, la internacionalización modular, la depuración de la interfaz adaptable y sin bordes, la automatización multiplataforma de CI y lanzamientos, la documentación multilingüe y la verificación continua mediante compilaciones y pruebas.

La IA solo se utiliza durante el desarrollo. FileNavigation no llama a servicios de OpenAI durante la ejecución ni envía nombres de archivos, rutas, búsquedas o contenido de archivos a ningún modelo.

## Licencia

El proyecto usa la [FileNavigation Non-Commercial Source License](../../LICENSE.md). Se prohíben el uso comercial, la reventa, el alojamiento SaaS, los servicios de pago, la integración comercial cerrada y la distribución dentro de productos comerciales.
