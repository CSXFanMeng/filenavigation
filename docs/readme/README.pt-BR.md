# FileNavigation

[Todos os idiomas](../../README.md) · [Última versão](https://github.com/CSXFanMeng/filenavigation/releases/latest)

FileNavigation é um aplicativo desktop em Rust + Tauri para localizar arquivos e pastas dentro de um diretório local selecionado. A pesquisa ocorre totalmente no computador local; nomes, caminhos e conteúdos não são enviados.

## Recursos

- Pesquisa local de arquivos e pastas
- Correspondência literal ou por expressão regular de nomes com controle de maiúsculas
- Backend Rust/Tauri totalmente assíncrono com cancelamento e progresso ao vivo
- Filtros, ordenação e renderização progressiva dos resultados
- Interface responsiva moderna com ícones Lucide e foco acessível
- Janela sem moldura desenhada pelo app com controles localizados
- Área de trabalho fixa e lista de resultados com rolagem independente
- Interface em 20 idiomas armazenados em arquivos separados
- Janela de atualização na barra de título com notas localizadas e roláveis do GitHub e instalação automática assinada
- Janela de configurações com temas claro e escuro persistentes
- Exibição de digest dos instaladores para verificar integridade

## Downloads

- Windows: `.exe` e `.msi`
- macOS: `.dmg` e `.app`
- Linux: `.deb`, `.rpm` e `.AppImage`

Baixe em [GitHub Releases](https://github.com/CSXFanMeng/filenavigation/releases/latest).

## Desenvolvimento E Build

```bash
npm install
npm run tauri:dev
npm run tauri:build
```

Se o PowerShell bloquear `npm.ps1`, use `npm.cmd`. Os pacotes ficam em `src-tauri/target/release/bundle/`.

## Idiomas E Atualizações

As traduções ficam em `src/i18n/locales`. [RELEASE_NOTES.md](../../RELEASE_NOTES.md) usa blocos `<!-- lang:xx -->`. O atualizador tenta o idioma atual, depois inglês e por fim o texto completo da Release.

## Desenvolvido Com OpenAI Codex E GPT-5.6

OpenAI Codex e GPT-5.6 foram usados como colaboradores de engenharia na arquitetura, pesquisa assíncrona cancelável, internacionalização modular, depuração da interface responsiva e sem bordas, automação multiplataforma de CI e releases, documentação multilíngue e verificação contínua por builds e testes.

A IA é usada somente durante o desenvolvimento. O FileNavigation não chama serviços da OpenAI em tempo de execução nem envia nomes de arquivos, caminhos, pesquisas ou conteúdo de arquivos para qualquer modelo.

## Licença

O projeto usa a [FileNavigation Non-Commercial Source License](../../LICENSE.md). São proibidos uso comercial, revenda, hospedagem SaaS, serviços pagos, integração comercial fechada e inclusão em produtos comerciais.
