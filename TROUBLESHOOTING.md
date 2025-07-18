# 🔧 Troubleshooting Guide - InterectNote

이 문서는 InterectNote 개발 중 발생한 문제들과 해결 방법을 정리한 것입니다.
같은 실수를 반복하지 않기 위해 작성되었습니다.

## 📱 PWA & Mobile 관련 이슈

### 1. Manifest 아이콘 오류
**문제**: "Error while trying to use the following icon from the Manifest: http://localhost:3001/vite.svg (Download error or resource isn't a valid image)"

**원인**: 
- PWA manifest에서 SVG 아이콘만 사용하면 일부 브라우저에서 오류 발생
- PNG 형식의 아이콘이 필수적으로 필요함

**해결 방법**:
1. PNG 아이콘 생성 (최소 192x192, 512x512)
2. manifest.json 업데이트:
```json
{
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png", 
      "sizes": "512x512",
      "type": "image/png"
    },
    {
      "src": "/icon-512.svg",
      "sizes": "any",
      "type": "image/svg+xml"
    }
  ]
}
```

### 2. Deprecated Meta 태그 경고
**문제**: "`<meta name="apple-mobile-web-app-capable" content="yes">` is deprecated"

**원인**: 
- 구버전 iOS 전용 메타 태그만 사용
- 표준 PWA 메타 태그 누락

**해결 방법**:
```html
<!-- 표준 PWA 태그 추가 -->
<meta name="mobile-web-app-capable" content="yes" />
<!-- iOS 호환성을 위해 유지 -->
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
```

### 3. Touch-action 경고
**문제**: "@use-gesture: The drag target has its `touch-action` style property set to `auto`"

**원인**:
- 터치 기기에서 브라우저의 기본 스크롤과 드래그 제스처가 충돌
- touch-action이 설정되지 않으면 드래그 동작이 불안정해짐

**해결 방법**:
1. 드래그 가능한 컨테이너에 inline 스타일 추가:
```jsx
<div ref={containerRef} style={{ touchAction: 'none' }}>
```

2. 또는 CSS 클래스 사용:
```css
.draggable {
  touch-action: none;
  -webkit-user-drag: none;  /* 이미지/링크 드래그 방지 */
  user-select: none;        /* 텍스트 선택 방지 */
}
```

## 🎨 Konva.js 관련 이슈

### 4. TypeScript 타입 오류
**문제**: Konva.Group의 shadow 속성 관련 타입 오류

**원인**:
- Konva의 일부 메서드가 TypeScript 타입 정의에 없음
- shadowBlur(), shadowColor() 등이 인식되지 않음

**해결 방법**:
```typescript
// 메서드 체이닝 대신 setAttrs 사용
group.setAttrs({
  shadowEnabled: true,
  shadowBlur: 20,
  shadowColor: 'rgba(0, 0, 0, 0.15)',
  shadowOffsetX: 0,
  shadowOffsetY: 10
});
```

## 📦 패키지 관련 이슈

### 5. Tailwind CSS v4 호환성 문제
**문제**: Tailwind CSS v4가 정상적으로 작동하지 않음

**원인**:
- Tailwind CSS v4는 아직 실험적 버전
- 일부 PostCSS 플러그인과 호환성 문제

**해결 방법**:
```json
// package.json
{
  "dependencies": {
    "tailwindcss": "^3.4.0"  // v4 대신 안정적인 v3 사용
  }
}
```

## ✅ PWA 개발 체크리스트

프로젝트 시작 시 확인해야 할 사항들:

- [ ] **아이콘 준비**
  - [ ] 192x192 PNG
  - [ ] 512x512 PNG  
  - [ ] SVG (선택사항)
  - [ ] Apple Touch Icon

- [ ] **Manifest.json**
  - [ ] 올바른 아이콘 경로
  - [ ] theme_color 설정
  - [ ] display: "standalone"

- [ ] **Meta 태그**
  - [ ] `mobile-web-app-capable`
  - [ ] `apple-mobile-web-app-capable`
  - [ ] viewport 설정 (user-scalable=no)

- [ ] **터치 인터랙션**
  - [ ] 드래그 요소에 `touch-action: none`
  - [ ] 제스처 라이브러리 설정 확인

- [ ] **성능 최적화**
  - [ ] 번들 크기 확인 (500KB 경고)
  - [ ] 코드 스플리팅 고려
  - [ ] 이미지 최적화

## 🔍 디버깅 팁

1. **개발자 도구 Application 탭 확인**
   - Manifest 로드 상태
   - Service Worker 등록 상태
   - 아이콘 로드 여부

2. **모바일 디버깅**
   - Chrome DevTools 원격 디버깅 사용
   - 실제 기기에서 테스트 필수

3. **콘솔 경고 주의 깊게 확인**
   - 개발 모드에서만 나타나는 경고도 무시하지 말 것
   - 프로덕션에서 문제가 될 수 있음

## 📚 참고 자료

- [@use-gesture 공식 문서](https://use-gesture.netlify.app/docs/extras/#touch-action)
- [PWA 체크리스트](https://web.dev/pwa-checklist/)
- [Konva.js 문서](https://konvajs.org/docs/)
- [Tailwind CSS 마이그레이션 가이드](https://tailwindcss.com/docs/upgrade-guide)

---

*마지막 업데이트: 2025-01-18*