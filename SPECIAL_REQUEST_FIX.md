# Special Request Validation Fix

## Issue
When submitting a special request with only a product link (no part details), the API was returning "Internal server error".

## Root Cause
The Zod validation schema was too strict with optional fields:
- `websiteUrl` was defined as `.url().optional().or(z.literal(''))` which failed when the field was undefined
- Other optional fields weren't properly handling null/undefined values

## Fix Applied

### 1. API Validation Schema (`src/app/api/special-requests/route.ts`)
**Before:**
```typescript
websiteUrl: z.string().url().optional().or(z.literal(''))
estimatedPrice: z.number().optional()
imageUrls: z.array(z.string()).optional()
projectId: z.string().optional()
```

**After:**
```typescript
websiteUrl: z.string().optional().nullable()
estimatedPrice: z.number().optional().nullable()
imageUrls: z.array(z.string()).optional().nullable()
projectId: z.string().optional().nullable()
```

### 2. Frontend Data Submission (`src/app/requests/special/page.tsx`)
**Before:**
```typescript
websiteUrl: websiteUrl || undefined
estimatedPrice: estimatedPrice ? parseFloat(estimatedPrice) : undefined
imageUrls: imagePreviews.length > 0 ? imagePreviews : undefined
projectId: selectedProject !== 'OTHER' ? selectedProject : undefined
```

**After:**
```typescript
websiteUrl: websiteUrl.trim() || null
estimatedPrice: estimatedPrice ? parseFloat(estimatedPrice) : null
imageUrls: imagePreviews.length > 0 ? imagePreviews : null
projectId: selectedProject !== 'OTHER' ? selectedProject : null
```

### 3. Better Error Handling
Added detailed error logging to help debug issues:
```typescript
console.error('Server error:', error)
alert(`Failed to submit request: ${error.error || 'Unknown error'}${error.details ? '\n' + JSON.stringify(error.details) : ''}`)
```

### 4. Redirect Fix
Changed redirect from `/requests/my-requests` to `/requests/special-list` after successful submission.

## Testing Scenarios

### Test 1: Product Link Only ✅
1. Leave part name empty
2. Leave description empty
3. Paste product URL: `https://robu.in/product/esp32-cam`
4. Add purpose: "Need for IoT project"
5. Submit
6. **Expected**: Success, redirects to special requests list

### Test 2: Images Only ✅
1. Leave part name empty
2. Leave description empty
3. Leave URL empty
4. Upload 1-2 images
5. Add purpose: "Need for IoT project"
6. Submit
7. **Expected**: Success, redirects to special requests list

### Test 3: Part Details Only ✅
1. Fill part name: "ESP32-CAM"
2. Fill description: "WiFi camera module with OV2640"
3. Leave URL empty
4. Don't upload images
5. Add purpose: "Need for IoT project"
6. Submit
7. **Expected**: Success, redirects to special requests list

### Test 4: Everything ✅
1. Fill all fields
2. Add URL
3. Upload images
4. Add purpose
5. Submit
6. **Expected**: Success, redirects to special requests list

### Test 5: Nothing ❌
1. Leave everything empty
2. Try to submit
3. **Expected**: Validation error before API call

## Changes Summary
- ✅ Fixed Zod schema to properly handle optional/nullable fields
- ✅ Changed undefined to null for consistency
- ✅ Added `.trim()` to websiteUrl to handle whitespace
- ✅ Improved error messages with details
- ✅ Fixed redirect path
- ✅ All test scenarios should now work

## Status
✅ Fixed and ready for testing
