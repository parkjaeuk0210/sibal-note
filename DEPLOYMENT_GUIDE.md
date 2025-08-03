# InterectNote 배포 가이드

## 프로젝트 정보
- **GitHub 저장소**: https://github.com/parkjaeuk0210/interectnote1
- **Vercel 프로젝트**: 이미 연결되어 있음
- **프레임워크**: React + TypeScript + Vite
- **스타일링**: Tailwind CSS
- **상태 관리**: Zustand
- **백엔드**: Firebase (Realtime Database, Storage, Auth)

## 자동 배포 설정
GitHub 저장소와 Vercel이 연결되어 있어, `master` 브랜치에 푸시하면 자동으로 배포됩니다.

## 개발 환경 설정

### 1. 의존성 설치
```bash
cd "C:\Users\Administrator\interectnote1"
npm install
```

### 2. 개발 서버 실행
```bash
npm run dev
```

### 3. 빌드 테스트
```bash
npm run build
```

### 4. 타입 체크
```bash
npm run lint
```

## 코드 변경 및 배포 프로세스

### 1. 코드 수정
원하는 파일을 수정합니다.

### 2. Git 커밋
```bash
cd "C:\Users\Administrator\interectnote1"
git add -A
git commit -m "커밋 메시지"
```

### 3. GitHub에 푸시 (자동 배포 트리거)
```bash
git push origin master
```

### 4. 배포 확인
- Vercel 대시보드에서 배포 상태 확인
- 보통 1-2분 내에 배포 완료

## 주요 디렉토리 구조
```
interectnote1/
├── src/
│   ├── components/        # React 컴포넌트
│   │   ├── Canvas/       # 캔버스 관련 컴포넌트
│   │   ├── Note/         # 노트 관련 컴포넌트
│   │   ├── UI/           # UI 컴포넌트
│   │   └── Auth/         # 인증 관련 컴포넌트
│   ├── contexts/         # React Context
│   ├── hooks/            # 커스텀 훅
│   ├── store/            # Zustand 스토어
│   ├── styles/           # CSS 파일
│   ├── types/            # TypeScript 타입 정의
│   ├── utils/            # 유틸리티 함수
│   └── lib/              # 외부 라이브러리 설정 (Firebase 등)
├── public/               # 정적 파일
├── package.json          # 프로젝트 설정
├── tsconfig.json         # TypeScript 설정
├── vite.config.ts        # Vite 설정
├── vercel.json           # Vercel 배포 설정
└── tailwind.config.js    # Tailwind CSS 설정
```

## 환경 변수 (Vercel에서 설정)
```
VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID
VITE_FIREBASE_DATABASE_URL
```

## 최근 변경사항
- **2025-08-03**: 배포 가이드 문서 추가

## 문제 해결

### 배포가 안 될 때
1. Git 상태 확인: `git status`
2. 변경사항이 없으면 빈 커밋 생성:
   ```bash
   echo " " >> README.md
   git add README.md
   git commit -m "Trigger deployment"
   git push origin master
   ```

### 로컬에서 테스트
```bash
npm run dev
```
브라우저에서 http://localhost:3000 접속

### 빌드 에러 확인
```bash
npm run build
```

## 추가 기능 개발 시 참고사항
1. **컴포넌트 추가**: `src/components/` 디렉토리에 생성
2. **상태 관리**: `src/store/canvasStore.ts` 수정
3. **타입 정의**: `src/types/index.ts`에 추가
4. **스타일링**: Tailwind CSS 클래스 사용 또는 `src/styles/`에 CSS 파일 추가
5. **다크 모드**: `useAppStore`의 `isDarkMode` 상태 활용

## Git 명령어 모음
```bash
# 상태 확인
git status

# 모든 변경사항 추가
git add -A

# 커밋
git commit -m "메시지"

# 푸시 (자동 배포)
git push origin master

# 이전 커밋 취소
git reset --soft HEAD~1

# 브랜치 확인
git branch

# 로그 확인
git log --oneline -5

# 특정 커밋으로 롤백
git reset --hard 커밋ID

# 강제 푸시 (롤백 후)
git push origin master --force
```

## 유용한 NPM 스크립트
```bash
npm run dev        # 개발 서버 실행
npm run build      # 프로덕션 빌드
npm run lint       # TypeScript 타입 체크
npm run preview    # 빌드된 결과물 미리보기
npm run test       # 테스트 실행
```

## Vercel 배포 설정
프로젝트에 `vercel.json` 파일이 필요한 경우:
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

---

이 문서는 InterectNote 프로젝트의 배포 및 개발 과정을 자동화하기 위한 가이드입니다.
대화가 초기화되더라도 이 문서를 참고하여 작업을 계속할 수 있습니다.