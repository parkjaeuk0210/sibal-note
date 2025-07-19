export const messages = {
  ko: {
    // App
    appName: 'InterectNote - 무한 캔버스 메모',
    appDescription: '애플 스타일의 무한 캔버스 메모 앱',
    
    // Errors
    storageQuotaExceeded: '저장 공간이 부족합니다. 일부 항목을 삭제하고 다시 시도해주세요.',
    storageQuotaExceededImage: '저장 공간이 부족합니다. 일부 이미지를 삭제하고 다시 시도해주세요.',
    storageQuotaExceededFile: '저장 공간이 부족합니다. 일부 파일을 삭제하고 다시 시도해주세요.',
    imageTooLarge: (fileName: string, size: string) => `이미지 "${fileName}"의 크기가 너무 큽니다 (${size}). 더 작은 이미지를 사용해주세요.`,
    fileTooLarge: (fileName: string, size: string) => `파일 "${fileName}"의 크기가 너무 큽니다 (${size}). 더 작은 파일을 사용해주세요.`,
    imageProcessingError: (fileName: string) => `이미지 처리 중 오류가 발생했습니다: ${fileName}`,
    
    // UI
    colorPicker: '색상 선택',
    currentColor: (color: string) => `현재 색상: ${color}`,
    changeColorTo: (color: string) => `색상 ${color}로 변경`,
    colorName: (color: string) => `색상: ${color}`,
    
    // Actions
    addFile: '파일 추가',
    deleteNote: '메모 삭제',
    delete: '삭제',
    clearAll: '모두 지우기',
    confirmClearAll: '모든 메모를 삭제하시겠습니까?',
    
    // Canvas
    freeTransform: '자유 변형',
    maintainRatio: '비율 유지',
    doubleClickToOpen: '더블클릭으로 열기',
    doubleClickToWrite: '더블 클릭하여 메모 작성',
    
    // Dark mode
    switchToLightMode: '라이트 모드로 전환',
    switchToDarkMode: '다크 모드로 전환',
    
    // Floating button
    addNewNote: '새 메모 추가',
    
    // Help
    gettingStarted: '시작하기',
    addNoteHelp: '더블 클릭 또는 + 버튼으로 메모 추가',
    navigateHelp: '드래그로 캔버스 이동, 휠로 확대/축소',
    moveNoteHelp: '메모 헤더 드래그로 위치 이동',
    editNoteHelp: '더블 클릭으로 내용 편집',
    
    // Storage
    storageUsage: (percent: number) => `저장공간 ${percent}%`,
  },
  en: {
    // App
    appName: 'InterectNote - Infinite Canvas Memo',
    appDescription: 'Apple-style infinite canvas memo app',
    
    // Errors
    storageQuotaExceeded: 'Storage space is full. Please delete some items and try again.',
    storageQuotaExceededImage: 'Storage space is full. Please delete some images and try again.',
    storageQuotaExceededFile: 'Storage space is full. Please delete some files and try again.',
    imageTooLarge: (fileName: string, size: string) => `Image "${fileName}" is too large (${size}). Please use a smaller image.`,
    fileTooLarge: (fileName: string, size: string) => `File "${fileName}" is too large (${size}). Please use a smaller file.`,
    imageProcessingError: (fileName: string) => `Error processing image: ${fileName}`,
    
    // UI
    colorPicker: 'Select Color',
    currentColor: (color: string) => `Current color: ${color}`,
    changeColorTo: (color: string) => `Change color to ${color}`,
    colorName: (color: string) => `Color: ${color}`,
    
    // Actions
    addFile: 'Add File',
    deleteNote: 'Delete Note',
    delete: 'Delete',
    clearAll: 'Clear All',
    confirmClearAll: 'Delete all notes?',
    
    // Canvas
    freeTransform: 'Free Transform',
    maintainRatio: 'Maintain Ratio',
    doubleClickToOpen: 'Double-click to open',
    doubleClickToWrite: 'Double-click to write a note',
    
    // Dark mode
    switchToLightMode: 'Switch to Light Mode',
    switchToDarkMode: 'Switch to Dark Mode',
    
    // Floating button
    addNewNote: 'Add New Note',
    
    // Help
    gettingStarted: 'Getting Started',
    addNoteHelp: 'Double-click or press + button to add a note',
    navigateHelp: 'Drag to move canvas, wheel to zoom',
    moveNoteHelp: 'Drag note header to move position',
    editNoteHelp: 'Double-click to edit content',
    
    // Storage
    storageUsage: (percent: number) => `Storage ${percent}%`,
  },
};

export type Language = keyof typeof messages;
export type MessageKey = keyof typeof messages.ko;