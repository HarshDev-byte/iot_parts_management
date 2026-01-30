# Special Request - OR Design Implementation

## Visual Design
The special request form now uses an **OR** divider design to show that students can provide information in multiple ways.

## Layout Structure

```
┌─────────────────────────────────────────┐
│         Info Banner                     │
│  "Provide Part Details OR Product Link │
│   OR Product Images (or any combo)"    │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  📦 Part Details                        │
│  ─────────────────────────────────────  │
│  • Part Name (optional)                 │
│  • Description (optional)               │
│  • Quantity                             │
│  • Estimated Price                      │
└─────────────────────────────────────────┘

        ╔═══════════════╗
        ║      OR       ║
        ╚═══════════════╝

┌─────────────────────────────────────────┐
│  🔗 Product Link                        │
│  ─────────────────────────────────────  │
│  • Website URL (optional)               │
│  • Amazon, Robu.in, etc.                │
└─────────────────────────────────────────┘

        ╔═══════════════╗
        ║      OR       ║
        ╚═══════════════╝

┌─────────────────────────────────────────┐
│  🖼️ Product Images                      │
│  ─────────────────────────────────────  │
│  • Upload up to 5 images (optional)     │
│  • Drag & drop or click                 │
└─────────────────────────────────────────┘
```

## Key Features

### 1. OR Dividers
- Bold "OR" text in rounded pill
- Horizontal line through the section
- Clear visual separation between options
- Emphasizes that these are alternatives

### 2. Enhanced Card Headers
- Larger icons (h-6 w-6)
- Larger titles (text-xl)
- Larger descriptions (text-base)
- Gray background on headers (bg-gray-50 dark:bg-gray-800/50)
- Thicker borders (border-2)

### 3. Flexible Validation
**Required:**
- At least ONE of: Part Details, Product Link, or Images
- Purpose (always required)
- Quantity (always required)

**Optional:**
- Part Name
- Description
- Estimated Price
- Website URL
- Images
- Project

### 4. Smart Defaults
If student provides only a link or images:
- Part Name defaults to: "Special Component Request"
- Description defaults to: "See attached link or images for details"

## Validation Logic

```javascript
const hasPartDetails = partName.length >= 3 && description.length >= 10
const hasWebsiteUrl = websiteUrl.trim().length > 0
const hasImages = imageFiles.length > 0

// Must have at least one
if (!hasPartDetails && !hasWebsiteUrl && !hasImages) {
  alert('Please provide at least one of: Part Details, Product Link, or Product Images')
  return
}
```

## User Experience

### Scenario 1: Student has product link
1. Paste Amazon/Robu link
2. Add purpose
3. Submit ✅

### Scenario 2: Student has images
1. Upload product photos
2. Add purpose
3. Submit ✅

### Scenario 3: Student knows exact part
1. Fill part name and description
2. Add purpose
3. Submit ✅

### Scenario 4: Student provides everything
1. Fill all details
2. Add link
3. Upload images
4. Add purpose
5. Submit ✅ (Best case - fastest approval)

## Visual Styling

### OR Divider CSS
```jsx
<div className="relative">
  <div className="absolute inset-0 flex items-center">
    <div className="w-full border-t-2 border-gray-300 dark:border-gray-600"></div>
  </div>
  <div className="relative flex justify-center">
    <span className="bg-gray-50 dark:bg-gray-900 px-6 py-2 text-lg font-bold text-gray-500 dark:text-gray-400 rounded-full border-2 border-gray-300 dark:border-gray-600">
      OR
    </span>
  </div>
</div>
```

### Card Headers
```jsx
<CardHeader className="bg-gray-50 dark:bg-gray-800/50">
  <CardTitle className="flex items-center gap-2 text-xl">
    <Icon className="h-6 w-6" />
    Title
  </CardTitle>
  <CardDescription className="text-base">
    Description
  </CardDescription>
</CardHeader>
```

## Benefits

1. **Flexibility**: Students can provide info in whatever format they have
2. **Clarity**: OR dividers make it obvious these are alternatives
3. **Lower Barrier**: Don't need to know exact part name to request
4. **Better UX**: Can just paste a link or upload a photo
5. **Faster Submission**: Less friction in the request process

## Testing

1. **Test with link only**:
   - Leave part details empty
   - Paste product URL
   - Add purpose
   - Should submit successfully

2. **Test with images only**:
   - Leave part details empty
   - Leave URL empty
   - Upload 1-2 images
   - Add purpose
   - Should submit successfully

3. **Test with part details only**:
   - Fill name and description
   - Leave URL empty
   - Don't upload images
   - Add purpose
   - Should submit successfully

4. **Test validation**:
   - Leave everything empty
   - Try to submit
   - Should show error: "Provide at least one..."

## Status
✅ Complete with OR design implementation
