# 디자인 시스템

## 테마 규칙
- Ant Design Default Style 사용
- 다크/라이트 전환은 ConfigProvider로 관리
- 모든 컴포넌트 다크/라이트 모드 모두 고려
- 커스텀 색상은 CSS 변수로 관리

## 콘텐츠 영역 규칙
- max-width: 1200px
- max-width 안에서 가로 100% 채워서 구성
- 1200px 이상: 중앙 정렬
- 1200px 이하: 양쪽 padding 유지
- LNB 있는 화면: LNB 제외한 영역 기준
- LNB 없는 화면: 전체 화면 기준
- GNB 제외
