# RAON ERP v13.2.0 Gold Master 통합검수 체크리스트

## 배포 전
- [ ] GitHub 기존 파일 삭제 또는 빈 repo 상태 확인
- [ ] package.json / server.js / public 폴더가 루트에 있는지 확인
- [ ] public/app.js.tmp 없음
- [ ] public/src/shared/app.js 없음
- [ ] public/index.html 이 /app.js 를 로드하는지 확인

## 대시보드
- [ ] 대시보드 진입 정상
- [ ] KPI 표시 정상
- [ ] 일정 캘린더 표시 정상
- [ ] 빠른 이동 버튼 정상

## 현장관리
- [ ] 현장 추가 정상
- [ ] 현장 수정 정상
- [ ] 현장 삭제 확인창 정상
- [ ] 저장 후 대시보드 반영 정상

## 견적관리
- [ ] 싱글형 제품 드롭다운 정상
- [ ] 멀티형 제품 드롭다운 정상
- [ ] 모델 수 배지 정상
- [ ] 천원단위 절삭 정상
- [ ] 멀티 실외기 DC / 실내기 DC 별도 적용 정상
- [ ] 품목 / 제품명 분리 표시 정상

## 자재관리
- [ ] 자재 붙여넣기 자동분류 정상
- [ ] 자재 저장 정상

## 세무관리
- [ ] 매출 등록 팝업 정상
- [ ] 매입 등록 팝업 정상
- [ ] 입금 등록 팝업 정상
- [ ] 카드내역 붙여넣기 정상
- [ ] VAT 계산 정상

## Render
- [ ] Manual Deploy 성공
- [ ] Logs: RAON ERP v13 Gold Master 13.2.0 full reset clean running
