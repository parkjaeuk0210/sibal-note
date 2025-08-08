# Rate Limiting Implementation Guide

## Overview
Rate limiting has been implemented to prevent abuse and ensure fair usage of the application's resources. The system uses a client-side rate limiter with progressive blocking for repeated violations.

## Protected Operations

### 1. Anonymous Sign-In
- **Limit**: 3 attempts per 15 minutes
- **Purpose**: Prevent spam account creation
- **Location**: `src/components/Sharing/ShareLanding.tsx`

### 2. Canvas Join
- **Limit**: 5 attempts per 5 minutes
- **Purpose**: Prevent brute-force attacks on share tokens
- **Location**: `src/components/Sharing/ShareLanding.tsx`

### 3. Share Token Generation
- **Limit**: 10 tokens per hour
- **Purpose**: Prevent token spam and enumeration attacks
- **Location**: `src/components/Sharing/ShareModal.tsx`

### 4. Failed Login (Reserved)
- **Limit**: 5 attempts per 30 minutes
- **Purpose**: Prevent brute-force login attempts
- **Status**: Ready for implementation when needed

## How It Works

### Client Identification
The rate limiter uses multiple factors to identify clients:
- Browser user agent
- Language settings
- Screen resolution
- Timezone offset
- Persistent client ID (stored in localStorage)

### Progressive Blocking
When limits are exceeded:
1. First violation: Blocked for the standard window duration
2. Subsequent violations: Block duration doubles each time
3. Example: 15 min → 30 min → 60 min → 120 min

### Storage
- Rate limit data is stored in memory (Map)
- Automatic cleanup of old entries every minute
- Entries older than 1 hour are removed

## User Experience

### Error Messages
Users receive clear, localized messages when rate limited:
- "다시 시도하려면 X초 기다려주세요." (seconds)
- "다시 시도하려면 X분 기다려주세요." (minutes)
- "다시 시도하려면 X시간 기다려주세요." (hours)

### Visual Feedback
- Buttons are disabled during rate limiting
- Error messages show remaining wait time
- Progressive loading indicators during operations

## Configuration

Rate limits can be adjusted in `src/utils/rateLimit.ts`:

```typescript
export const RATE_LIMITS = {
  ANONYMOUS_SIGNIN: {
    maxAttempts: 3,
    windowMs: 15 * 60 * 1000, // 15 minutes
    key: 'anonymous_signin'
  },
  // ... other limits
}
```

## Testing Rate Limits

To test rate limiting in development:

1. **Anonymous Sign-In**:
   - Click "바로 참여하기 (게스트)" 4 times rapidly
   - Should block on the 4th attempt

2. **Canvas Join**:
   - Try joining a canvas 6 times within 5 minutes
   - Should block on the 6th attempt

3. **Share Token Generation**:
   - Generate 11 share links within an hour
   - Should block on the 11th attempt

## Security Considerations

### Client-Side Limitations
- This is a client-side rate limiter for UX improvement
- For production, implement server-side rate limiting
- Consider using Firebase Security Rules for additional protection

### Recommendations
1. Add server-side rate limiting with Redis or similar
2. Implement IP-based rate limiting at the edge (CDN/WAF)
3. Add CAPTCHA for repeated violations
4. Monitor and log rate limit violations

## Future Improvements

1. **Server-Side Integration**:
   - Move rate limiting to Firebase Functions
   - Use Firebase Security Rules for enforcement
   - Implement distributed rate limiting

2. **Enhanced Detection**:
   - Add fingerprinting library for better client identification
   - Implement device trust scoring
   - Add behavioral analysis

3. **Monitoring**:
   - Add analytics for rate limit hits
   - Create admin dashboard for monitoring
   - Set up alerts for suspicious patterns