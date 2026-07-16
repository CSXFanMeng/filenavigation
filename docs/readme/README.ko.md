# FileNavigation

[모든 언어](../../README.md) · [최신 릴리스](https://github.com/CSXFanMeng/filenavigation/releases/latest)

FileNavigation은 선택한 로컬 디렉터리에서 파일과 폴더를 찾는 Rust + Tauri 데스크톱 애플리케이션입니다. 검색은 전적으로 로컬 컴퓨터에서 실행되며 이름, 경로 또는 파일 내용은 업로드되지 않습니다.

## 기능

- 로컬 파일 및 폴더 검색
- 취소와 실시간 진행 상황을 지원하는 완전 비동기 Rust/Tauri 백엔드
- 결과 필터링, 유형 필터, 정렬 및 점진적 렌더링
- Lucide 아이콘과 접근 가능한 포커스 상태를 갖춘 반응형 UI
- 앱이 그린 테두리와 다국어 제어를 갖춘 프레임리스 창
- 고정 작업 공간과 독립적으로 스크롤되는 결과 목록
- 개별 언어 파일로 관리되는 20개 언어 인터페이스
- 최신 GitHub Release 및 현재 언어에 맞는 릴리스 노트 확인
- 설치 파일 무결성 확인을 위한 다이제스트 표시

## 다운로드

- Windows: `.exe`, `.msi`
- macOS: `.dmg`, `.app`
- Linux: `.deb`, `.rpm`, `.AppImage`

[GitHub Releases](https://github.com/CSXFanMeng/filenavigation/releases/latest)에서 다운로드할 수 있습니다.

## 개발 및 빌드

```bash
npm install
npm run tauri:dev
npm run tauri:build
```

PowerShell에서 `npm.ps1`이 차단되면 `npm.cmd`를 사용하십시오. 결과물은 `src-tauri/target/release/bundle/`에 생성됩니다.

## 언어 및 업데이트

번역은 `src/i18n/locales`에 분리되어 있습니다. [RELEASE_NOTES.md](../../RELEASE_NOTES.md)는 `<!-- lang:xx -->` 블록을 사용합니다. 업데이트 확인은 현재 언어, 영어, 전체 Release 본문 순서로 대체합니다.

## OpenAI Codex 및 GPT-5.6으로 개발

OpenAI Codex와 GPT-5.6은 아키텍처, 취소 가능한 비동기 검색, 모듈식 국제화, 반응형 및 프레임리스 UI 디버깅, 크로스 플랫폼 CI와 릴리스 자동화, 다국어 문서, 지속적인 빌드 및 테스트 검증을 위한 엔지니어링 협업 도구로 사용되었습니다.

AI는 개발 과정에서만 사용됩니다. FileNavigation은 실행 중 OpenAI 서비스를 호출하지 않으며 파일 이름, 경로, 검색 내용 또는 파일 내용을 모델로 전송하지 않습니다.

## 라이선스

이 프로젝트는 [FileNavigation Non-Commercial Source License](../../LICENSE.md)를 사용합니다. 상업적 이용, 재판매, SaaS 호스팅, 유료 관리 서비스, 비공개 상업 통합 및 상업 제품 번들링은 금지됩니다.
