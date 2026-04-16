
## 기술 스택

- Framework: React
- UI Library: Ant Design
- Chart: ECharts (`echarts-for-react`; npm의 `react-echarts` 패키지는 구버전이므로 사용하지 않음)
- Theme: 라이트 모드 / 다크 모드 모두 지원

## 테마 규칙

- Ant Design Default Style을 사용한다. 
- 다크/라이트 전환은 `ConfigProvider`로 관리한다.
- 모든 컴포넌트는 다크/라이트 모드를 모두 고려해 만든다.
- 커스텀 색상은 CSS 변수로 관리한다.

## 폴더 규칙

- 공통 컴포넌트: `src/shared/ui/common`
- 레이아웃 컴포넌트: `src/shared/ui/layout`
- 차트 컴포넌트: `src/shared/ui/charts`
- 위 분류에 해당하지 않는 새로운 유형의 컴포넌트가 생기면 성격에 맞는 폴더명을 판단해서 `src/shared/ui` 안에 새 폴더를 만들어 정리할 것

## 화면 ID 규칙

### 형식

`[포탈코드]-[카테고리코드]-[화면코드]-[순번]`

예시: `DV-DF-RG-001`

### 규칙

1. 모든 코드는 영문 대문자 2자리
2. 순번은 3자리 숫자 (001부터 시작)
3. 구분자는 하이픈(-)으로 통일
4. 형식은 영문-영문-영문-숫자로 고정 (4단계)
5. depth가 3단계 이상일 경우 가장 식별력 있는 카테고리 하나로 압축
6. 같은 카테고리는 항상 동일한 코드 유지
7. 기존 코드와 중복되지 않게 생성
8. 새로운 화면 ID 생성 시 해당 ID와 화면명을 목록으로 정리해서 알려줄 것 (`screens.csv` 업데이트는 직접 함)

### 포탈 코드

- CO: Common
- DV: Dev 포탈
- CS: Customer 포탈
- SP: Support 포탈
- AD: Admin 포탈

##언어 규칙
- 모든 화면은 영문으로 표기 (단, Description 선택 시, 노출되는 사이드바의 내용은 한글로 작성)


## 화면 개발 원칙

### 이미지 참고 방식
- 첨부 이미지는 레이아웃과 구조 파악용으로만 참고
- 이미지를 그대로 구현하지 말 것
- Ant Design 컴포넌트에 최적화된 방식으로 재해석해서 구현

### Ant Design 최적화 원칙
- 모든 UI는 Ant Design 기본 컴포넌트 우선 사용
- Ant Design에 없는 경우에만 커스텀 구현
- Ant Design 디자인 가이드라인 준수
- 컴포넌트 Props와 variant를 최대한 활용
- 불필요한 CSS 커스텀 최소화

### 화면 구현 순서
1. Ant Design 컴포넌트로 구조 잡기
2. 레이아웃 이미지 참고해서 배치 조정
3. 테마/컬러 적용
4. 다크/라이트 모드 확인