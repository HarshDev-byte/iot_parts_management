# Debug Special Request Submission

## Current Status
Added extensive logging to both frontend and backend to identify the issue.

## How to Debug

### 1. Check Browser Console
Open browser DevTools (F12) and look for:
```
Submitting request data: { ... }
```
This shows exactly what data is being sent to the API.

### 2. Check Server Terminal
Look for these logs in your terminal where `npm run dev` is running:
```
Received request body: { ... }
Validated data: { ... }
Created special request: <id>
```

If you see an error, it will show:
```
Validation error: [ ... ]
OR
Error creating special request: <error details>
```

### 3. Test Scenario

**Fill out the form with:**
- Leave Part Name empty
- Leave Description empty  
- Website URL: `https://robu.in/product/esp32-cam`
- Leave Estimated Price empty
- Don't upload images
- Purpose: "Need for IoT project testing purposes"
- Project: "Other (Single Parts)"

**Click Submit**

### 4. Expected Logs

**Browser Console:**
```javascript
Submitting request data: {
  partName: "Special Component Request",
  description: "See attached link or images for details",
  quantity: 1,
  estimatedPrice: null,
  websiteUrl: "https://robu.in/product/esp32-cam",
  imageUrls: null,
  purpose: "Need for IoT project testing purposes",
  projectId: null
}
```

**Server Terminal:**
```
Received request body: { ... same as above ... }
Validated data: { ... same as above ... }
Created special request: clxxxxx...
```

### 5. Common Issues

#### Issue 1: Validation Error
**Symptom:** Server logs show "Validation error"
**Solution:** Check the `details` array in the error to see which field failed validation

#### Issue 2: Database Error
**Symptom:** Server logs show "Error creating special request" with Prisma error
**Possible causes:**
- Table doesn't exist (run migration again)
- Field type mismatch
- Missing required field

#### Issue 3: Auth Error
**Symptom:** Response status 401
**Solution:** Make sure you're logged in as a student

#### Issue 4: Empty Error Object
**Symptom:** Browser shows `Server error: {}`
**Cause:** Server returned error without proper JSON body
**Solution:** Check server terminal for actual error

### 6. Manual API Test

If the form doesn't work, test the API directly:

1. Sign in to the app
2. Open browser DevTools → Network tab
3. Find any request and copy the Cookie header
4. Run this in a new terminal:

```bash
curl -X POST http://localhost:3000/api/special-requests \
  -H "Content-Type: application/json" \
  -H "Cookie: <your-cookie-here>" \
  -d '{
    "partName": "Test Part",
    "description": "Test description for debugging",
    "quantity": 1,
    "estimatedPrice": null,
    "websiteUrl": "https://example.com",
    "imageUrls": null,
    "purpose": "Testing the API endpoint",
    "projectId": null
  }'
```

### 7. Check Database

Verify the table exists:
```bash
npx prisma studio
```

Look for `special_part_requests` table.

### 8. Regenerate Prisma Client

If you get Prisma errors:
```bash
# Stop the dev server first
npx prisma generate
npm run dev
```

## What I Changed

### API Route (`src/app/api/special-requests/route.ts`)
- Added `console.log` for received body
- Added `console.log` for validated data
- Added `console.log` for created request
- Added detailed error messages with `error.message`
- Made all optional fields `.nullable()`

### Frontend (`src/app/requests/special/page.tsx`)
- Added `console.log` for request data before sending
- Added NaN check for estimatedPrice
- Better null handling for all optional fields
- Improved error display with details

## Next Steps

1. **Try submitting again** with the test scenario above
2. **Check both browser console and server terminal**
3. **Copy the exact error messages** you see
4. **Share the logs** so we can identify the exact issue

The extensive logging should now show us exactly where the problem is!
