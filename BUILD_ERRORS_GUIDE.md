# Build Errors Guide

## Common TypeScript Build Errors and Solutions

### 1. Unused Parameter Error
**Error**: `error TS6133: 'paramName' is declared but its value is never read.`

**Solution**: Use underscore prefix for unused parameters
```typescript
// ❌ Bad
boundBoxFunc={(oldBox, newBox) => {
  // oldBox is not used
  return newBox;
}}

// ✅ Good
boundBoxFunc={(_, newBox) => {
  return newBox;
}}

// ✅ Also good - if you need the parameter name for clarity
boundBoxFunc={(_oldBox, newBox) => {
  return newBox;
}}
```

### 2. Unused Import Error
**Error**: `error TS6133: 'React' is declared but its value is never read.`

**Solution**: Remove unused imports
```typescript
// ❌ Bad
import React, { useState, useEffect } from 'react';  // If useEffect is not used

// ✅ Good
import React, { useState } from 'react';

// ❌ Bad - 자주 발생하는 오류
import React, { useCallback, useState, useRef, useEffect, useMemo } from 'react';
// useEffect를 실제로 사용하지 않는 경우

// ✅ Good
import React, { useCallback, useState, useRef, useMemo } from 'react';
```

### 3. Unused Variable Error
**Error**: `error TS6133: 'variableName' is declared but its value is never read.`

**Solution**: Remove unused variables or prefix with underscore if needed for destructuring
```typescript
// ❌ Bad
const { data, error } = await fetch();  // If error is not used

// ✅ Good - Option 1: Don't destructure unused variables
const { data } = await fetch();

// ✅ Good - Option 2: Use underscore for unused destructured variables
const { data, error: _error } = await fetch();
```

## TypeScript Compiler Settings

Add to `tsconfig.json` to customize unused variable handling:
```json
{
  "compilerOptions": {
    "noUnusedLocals": true,      // Error on unused locals
    "noUnusedParameters": true,  // Error on unused parameters
  }
}
```

## Best Practices

1. **Always run build before pushing**
   ```bash
   npm run build
   ```
   **중요**: GitHub Actions에서 빌드가 실패하면 배포가 안됩니다!

2. **Use ESLint for early detection**
   - Configure ESLint to catch unused variables during development
   - VS Code will show warnings inline

3. **Meaningful parameter names with underscore**
   - Use `_paramName` instead of just `_` when the parameter name adds clarity
   - Example: `(_event, index) => { }` is clearer than `(_, index) => { }`

4. **Clean up imports regularly**
   - Remove unused imports to keep code clean
   - Use VS Code's "Organize Imports" feature (Shift+Alt+O)

5. **커밋 전 체크리스트**
   - [ ] `npm run build` 실행하여 오류 없음 확인
   - [ ] 사용하지 않는 import 제거 (특히 useEffect, useState 등)
   - [ ] 선언했지만 사용하지 않는 변수 제거
   - [ ] TypeScript 오류 0개 확인

## 자주 실수하는 패턴

### useEffect import 후 제거
```typescript
// 처음에 useEffect 사용 계획
import React, { useCallback, useState, useRef, useEffect, useMemo } from 'react';

// 나중에 useEffect를 useMemo로 대체했지만 import를 제거하지 않음
// 이런 경우 빌드 오류 발생!
```

**해결**: 코드 리팩토링 후 항상 import 정리하기