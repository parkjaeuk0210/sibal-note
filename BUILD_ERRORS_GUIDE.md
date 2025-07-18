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
import React, { useState } from 'react';  // If React is not used directly

// ✅ Good
import { useState } from 'react';
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

2. **Use ESLint for early detection**
   - Configure ESLint to catch unused variables during development
   - VS Code will show warnings inline

3. **Meaningful parameter names with underscore**
   - Use `_paramName` instead of just `_` when the parameter name adds clarity
   - Example: `(_event, index) => { }` is clearer than `(_, index) => { }`

4. **Clean up imports regularly**
   - Remove unused imports to keep code clean
   - Use VS Code's "Organize Imports" feature (Shift+Alt+O)