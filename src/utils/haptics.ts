// 모바일 햅틱 피드백 유틸리티
export const haptics = {
  // 가벼운 탭
  light: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
  },
  
  // 중간 강도 피드백
  medium: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(20);
    }
  },
  
  // 강한 피드백 (에러, 삭제 등)
  heavy: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate([30, 10, 30]);
    }
  },
  
  // 성공 피드백
  success: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate([10, 10, 10]);
    }
  },
  
  // 선택 피드백
  selection: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(5);
    }
  }
};