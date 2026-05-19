# ✅ GANGNAM X CUBE — 해야 할 일 목록
> 작성일: 2026-05-19 | 우선순위 순 정렬

---

## 🔴 1순위 — Cloud Run 백엔드 배포 (이미지 업로드 / 데이터 연동)

이미지 업로드·관리페이지 연동이 이것에 달려 있습니다.

### 1-1. GCS 버킷 생성
Google Cloud Console → Cloud Shell (`>_`) 에서 실행:

```bash
gcloud storage buckets create gs://gangnam-x-cube-site-media \
  --project=gangnam-x-cube-site \
  --location=asia-northeast3

gcloud storage buckets add-iam-policy-binding gs://gangnam-x-cube-site-media \
  --member=allUsers --role=roles/storage.objectViewer
```

### 1-2. backend 폴더를 Cloud Shell에 업로드
- Google Cloud Console → Cloud Shell → **파일 업로드** 기능 사용
- 또는 GitHub에 push 후 `git clone`으로 가져오기
- 업로드 대상: `backend/` 폴더 전체 (server.js, package.json, Dockerfile)

### 1-3. Cloud Run 서비스 배포
```bash
cd backend
gcloud run deploy gxcube-api \
  --source . \
  --project=gangnam-x-cube-site \
  --region=asia-northeast3 \
  --allow-unauthenticated \
  --set-env-vars="GCS_BUCKET=gangnam-x-cube-site-media"
```

### 1-4. API URL을 main.js에 입력
배포 완료 후 나오는 Service URL을 복사:
```
예: https://gxcube-api-xxxxxxxx-an.a.run.app
```

`main.js` 7번째 줄 수정:
```js
// 변경 전
const API_URL = window.GX_API_URL || 'https://gxcube-api-REPLACE_ME.a.run.app';

// 변경 후 (실제 URL로)
const API_URL = window.GX_API_URL || 'https://gxcube-api-실제URL.a.run.app';
```

### 1-5. GitHub에 push
```bash
git add .
git commit -m "feat: Google Cloud Run 백엔드 연동, Firebase SDK 제거"
git push
```

---

## 🟠 2순위 — SEO 외부 등록 (검색 노출)

### 2-1. Google Search Console
1. https://search.google.com/search-console 접속
2. 속성 추가 → `gangnamxcube.com` 도메인 입력
3. DNS TXT 레코드 또는 HTML 파일로 소유권 인증
4. 사이드바 → **Sitemaps** → `https://gangnamxcube.com/sitemap.xml` 제출

### 2-2. 네이버 서치어드바이저 (국내 필수)
1. https://searchadvisor.naver.com 접속
2. 사이트 등록 → `gangnamxcube.com`
3. HTML 파일 인증 (파일을 프로젝트 루트에 추가 후 push)
4. 사이트맵 제출: `https://gangnamxcube.com/sitemap.xml`
5. **RSS 제출도 권장**

### 2-3. Google My Business (지도 검색 노출)
1. https://business.google.com 접속
2. 비즈니스 등록: **GANGNAM X CUBE**
3. 주소: 서울시 서초구 서초대로 397 부띠크모나코 B1
4. 전화: 02-344-5042
5. 카테고리: 이벤트 공간 / 전시장
6. 사진 등록 (event_1~5.jpg, main_grandhall.jpg 등)

### 2-4. 네이버 플레이스 (국내 지도 노출)
1. https://new.smartplace.naver.com 접속
2. 업체 등록 → 동일 정보 입력
3. 사진 최소 5장 이상 등록

---

## 🟡 3순위 — 콘텐츠 / 이미지 관리

### 3-1. 관리페이지에서 갤러리 이미지 교체
Cloud Run 배포 완료 후:
1. `gangnamxcube.com/admin` 접속 → 로그인
2. **콘텐츠 관리 (CMS)** 탭 → 글로벌 갤러리 이미지 관리
3. 📷 이미지 업로드 버튼 → 새 이미지 선택 → Google Cloud Storage 자동 업로드
4. **변경사항 최종 저장하기** 클릭

### 3-2. 메인 히어로 이미지 교체
- 관리페이지 CMS → 메인 히어로 이미지 섹션
- 새 이미지 업로드 → URL 자동 입력 → 저장

### 3-3. 홀별 대표 이미지 교체 (선택)
- CMS → Grand Hall / Reception Hall / Studio Hall 카드
- 업로드 버튼으로 각 홀 이미지 교체

---

## 🟢 4순위 — 완료된 작업 확인 (이미 적용됨)

- [x] **Favicon** 전 페이지 적용 (`favicon.png`)
- [x] **로고 이미지** 헤더·푸터 전 페이지 적용 (`logo.png`)
- [x] **OG/Twitter 썸네일** 전 페이지 적용 (`thumbnail.jpg`)
- [x] **SEO 메타태그** 강화 (keywords, description, canonical, OG, Twitter Card)
- [x] **구조화 데이터 (JSON-LD)** index.html에 LocalBusiness 스키마 삽입
- [x] **sitemap.xml** 업데이트 (전체 페이지, 최신 날짜)
- [x] **robots.txt** 크롤링 차단 경로 설정
- [x] **검색 키워드 확장**: 강남 대관, 강남 공관 대관, 강남 미술관 대관, 부띠크모나코 대관 등
- [x] **3d_view.html / inquiry_form.html** SEO + 로고 적용
- [x] **Firebase SDK 완전 제거** → Google Cloud Run REST API로 전환
- [x] **Admin 이미지 경로 오류 수정** (`/admin/` 하위에서 `../` 자동 prefix)

---

## 📋 참고 정보

| 항목 | 값 |
|---|---|
| Google Cloud 프로젝트 ID | `gangnam-x-cube-site` |
| Cloud Run 서비스명 | `gxcube-api` |
| GCS 버킷명 | `gangnam-x-cube-site-media` |
| 배포 리전 | `asia-northeast3` (서울) |
| 사이트 URL | `https://gangnamxcube.com` |
| 관리자 로그인 | `gangnamxcube.com/admin/login.html` |
| 기본 관리자 ID/PW | `admin` / `bmm2026!` |

---

> 문의 또는 추가 작업 필요 시 Antigravity에게 요청하세요.
