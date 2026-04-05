# HGM Workspace — Meeting Bot Frontend

HGM 동아리 내부 협업 솔루션의 **회의록 관리 시스템 프론트엔드**입니다.
Discord OAuth 기반 인증, AI 기반 STT 요약, Asana 연동을 하나의 웹 UI로 제공합니다.

---

## 제공 기능

### 인증 (Auth)
- Discord OAuth를 통한 로그인 / 자동 회원가입
- Access Token 자동 갱신 (Axios 인터셉터 기반)
- 역할(Role) 기반 접근 제어 — RBAC (메뉴 필터링 + 라우트 가드)

### 대시보드 (Dashboard)
- 회의 목록 조회 — 프로젝트 / 파트 / 키워드 필터
- 처리 중 회의 실시간 상태 갱신 (5초 폴링)
- 휴지통 모드 — 삭제된 회의 조회 및 복구 (관리자 전용)
- 회의 임시 삭제 (휴지통 이동)

### 회의 관리 (Meeting)
- AI 요약 설정 모달 — 모델·키워드·프롬프트 선택
- 요약 결과 뷰어 (Markdown 렌더링, DOMPurify 보안 처리)
- 요약 내용 직접 편집 및 저장
- Asana Task 자동 업로드 및 완료 링크 제공
- 회의 복구 (휴지통 → 정상)

### 설정 (Settings)
- 프로젝트 / 파트 생성 및 관리
- 파트별 Google Drive 폴더 연결
- Asana 설정 자동 파싱 (URL 입력 → ID 자동 완성)
- LLM API 키 등록 (OpenAI, Gemini 등)
- Discord Role ↔ 서비스 권한 매핑 (RBAC 규칙 정의)
- 시스템 프롬프트 CRUD
- STT 키워드 세트 관리

### 관리자 (Admin)
- 사용자 목록 조회 및 권한 관리

---

## 기술 스택

| 분류 | 라이브러리 |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5.7 |
| Styling | Tailwind CSS 4 + shadcn/ui |
| Server State | TanStack Query v5 |
| Client State | Zustand v5 |
| HTTP | Axios |
| Forms | react-hook-form + Zod |
| Markdown | react-markdown + remark-gfm + DOMPurify |

---

## 환경 설정 및 시작 가이드

### 사전 요구사항

- Node.js 20 이상
- pnpm (권장) 또는 npm

### 1. 저장소 클론

```bash
git clone <repo-url>
cd hgm-meetingbot-frontend
```

### 2. 의존성 설치

```bash
pnpm install
```

### 3. 환경변수 설정

프로젝트 루트에 `.env.local` 파일을 생성합니다.

```bash
cp .env.local.example .env.local   # 예시 파일이 없다면 아래 내용으로 직접 생성
```

```env
# 백엔드 API 기본 URL
# 로컬 개발 시 Next.js rewrites를 통해 프록시하는 경우 /api 사용
NEXT_PUBLIC_API_BASE_URL=/api
```

> **참고:** 백엔드 서버를 직접 호출하는 경우 `http://localhost:8000` 등으로 변경하세요.

### 4. 개발 서버 실행

```bash
pnpm dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)으로 접속합니다.

### 5. 프로덕션 빌드

```bash
pnpm build
pnpm start
```

---

## 프로젝트 구조

```
app/                  # Next.js App Router 라우트
├── login/            # 로그인 페이지
├── auth/             # Discord OAuth 콜백
├── dashboard/        # 회의 목록
├── settings/         # 설정 (프로젝트, 파트, 프롬프트 등)
└── admin/            # 관리자 (사용자, 프로젝트 관리)
components/           # 공통 UI 컴포넌트 (shadcn/ui 기반)
lib/                  # API 클라이언트, 유틸리티
hooks/                # 커스텀 훅
docs/                 # 기능명세서, 화면설계서, API 스펙
legacy/               # 구버전 Vue.js 구현 (참고용)
```

