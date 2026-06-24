# 보드게임 헬퍼

모바일에서 설치해 사용할 수 있는 React + TypeScript + Vite 기반 PWA입니다. 주사위, 사다리타기, 원판 돌리기, 턴 타이머를 백엔드 없이 localStorage와 오프라인 캐시로 제공합니다.

## 설치

```bash
npm install
```

## 실행

```bash
npm run dev
```

## 테스트

```bash
npm run test
```

## 빌드

```bash
npm run build
```

빌드 결과는 `dist` 폴더에 생성됩니다.

## GitHub Pages 배포

이 프로젝트는 GitHub Pages의 저장소 하위 경로에서 동작하도록 `vite.config.ts`에 `base: './'`와 PWA 상대 경로 설정을 적용했습니다.

1. GitHub에 저장소를 만들고 코드를 push합니다.
2. 저장소의 `Settings` > `Pages`로 이동합니다.
3. `Build and deployment`의 `Source`를 `GitHub Actions`로 선택합니다.
4. `main` 또는 `master` 브랜치에 push하면 `.github/workflows/deploy-pages.yml` 워크플로가 실행됩니다.
5. 배포가 끝나면 Pages 화면에 표시되는 HTTPS 주소로 접속합니다.

## 모바일 PWA 설치

GitHub Pages 배포 주소를 모바일 브라우저에서 연 뒤 설치합니다.

- Android Chrome: 메뉴 `⋮` > `앱 설치` 또는 `홈 화면에 추가`
- iPhone Safari: 공유 버튼 > `홈 화면에 추가`

설치 후 정적 파일은 서비스 워커가 캐시하므로 주요 기능은 오프라인에서도 동작합니다.

## 주요 구조

- `src/components`: 공통 헤더, 메뉴, 오류 경계
- `src/features/dice`: 주사위 UI, 난수 기반 굴림 로직, 테스트
- `src/features/ladder`: 사다리 생성/추적 로직, SVG 표시, 테스트
- `src/features/wheel`: 원판 결과 결정/회전 로직, SVG 원판, 테스트
- `src/features/timer`: 턴 타이머 상태 계산, 복원 확인, 테스트
- `src/lib`: localStorage, 난수, 시간, 진동/효과음 유틸
