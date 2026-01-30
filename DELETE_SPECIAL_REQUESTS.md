# Delete Special Requests Feature

## Overview
Added the ability for students to delete their special part requests, but only if they are still in PENDING status.

## Implementation

### 1. API Endpoint
**File:** `src/app/api/special-requests/[id]/route.ts`

**Endpoint:** `DELETE /api/special-requests/[id]`

**Features:**
- ✅ Authentication required
- ✅ Students can only delete their own requests
- ✅ Only PENDING requests can be deleted
- ✅ Audit logging for deletions
- ✅ Proper error handling

**Security Rules:**
```typescript
// Check ownership
if (session.user.role === 'STUDENT' && specialRequest.studentId !== session.user.id) {
  return 403 Unauthorized
}

// Only allow deletion of PENDING requests
if (specialRequest.status !== 'PENDING') {
  return 400 Can only delete pending requests
}
```

### 2. Frontend UI
**File:** `src/app/requests/special-list/page.tsx`

**Features:**
- Delete button appears only for PENDING requests
- Confirmation dialog before deletion
- Loading state during deletion
- Red color scheme to indicate destructive action
- Automatic list refresh after deletion

**UI Elements:**
```tsx
{request.status === 'PENDING' && (
  <Button
    variant="outline"
    size="sm"
    onClick={() => handleDelete(request.id, request.partName)}
    disabled={deletingId === request.id}
    className="text-red-600 hover:text-red-700 border-red-200"
  >
    <Trash2 className="h-4 w-4 mr-2" />
    Delete
  </Button>
)}
```

## User Flow

### 1. View Special Requests
- Navigate to "Special Requests" in sidebar
- See list of all special requests

### 2. Identify Deletable Requests
- Only PENDING requests show a delete button
- Requests under review or approved cannot be deleted

### 3. Delete Request
1. Click "Delete" button on a PENDING request
2. Confirmation dialog appears:
   ```
   Are you sure you want to delete the request for "[Part Name]"?
   
   This action cannot be undone.
   ```
3. Click OK to confirm or Cancel to abort
4. Button shows "Deleting..." with spinner
5. Success: Request removed from list, alert shown
6. Error: Alert with error message

## Status-Based Deletion Rules

| Status | Can Delete? | Reason |
|--------|-------------|--------|
| PENDING | ✅ Yes | Not yet reviewed |
| UNDER_REVIEW | ❌ No | Being reviewed by admin |
| APPROVED | ❌ No | Already approved |
| REJECTED | ❌ No | Already processed |
| ORDERED | ❌ No | Component ordered |
| RECEIVED | ❌ No | Component received |

## Error Handling

### Request Not Found
```json
{
  "error": "Request not found"
}
```
**Status:** 404

### Not Owner
```json
{
  "error": "Unauthorized"
}
```
**Status:** 403

### Not Pending
```json
{
  "error": "Can only delete pending requests"
}
```
**Status:** 400

### Success
```json
{
  "success": true,
  "message": "Request deleted successfully"
}
```
**Status:** 200

## Audit Trail

Every deletion is logged:
```typescript
{
  userId: session.user.id,
  action: 'DELETE_SPECIAL_REQUEST',
  resource: 'SPECIAL_PART_REQUEST',
  details: {
    requestId: id,
    partName: specialRequest.partName
  }
}
```

## Testing

### Test 1: Delete Pending Request ✅
1. Create a special request
2. Go to special requests list
3. Click "Delete" on the pending request
4. Confirm deletion
5. **Expected:** Request deleted, list refreshed

### Test 2: Try to Delete Approved Request ❌
1. Have an approved special request
2. Go to special requests list
3. **Expected:** No delete button visible

### Test 3: Try to Delete Another Student's Request ❌
1. Sign in as Student A
2. Try to delete Student B's request via API
3. **Expected:** 403 Unauthorized error

### Test 4: Cancel Deletion ✅
1. Click "Delete" on a pending request
2. Click "Cancel" in confirmation dialog
3. **Expected:** Request not deleted

## UI/UX Features

### Visual Indicators
- 🗑️ Trash icon for delete action
- 🔴 Red color scheme (danger)
- ⏳ Loading spinner during deletion
- ✅ Success alert after deletion
- ❌ Error alert on failure

### Confirmation Dialog
- Shows part name in confirmation
- "This action cannot be undone" warning
- OK/Cancel buttons

### Button States
- **Normal:** Red outline, trash icon
- **Hover:** Red background
- **Loading:** Spinner, "Deleting..." text
- **Disabled:** Grayed out during deletion

## Files Created/Modified

### Created:
- `src/app/api/special-requests/[id]/route.ts` - DELETE endpoint

### Modified:
- `src/app/requests/special-list/page.tsx` - Added delete functionality

## Status
✅ Complete and ready for testing

## Future Enhancements

1. **Bulk Delete**: Select multiple pending requests to delete at once
2. **Undo Feature**: Soft delete with ability to restore within 24 hours
3. **Delete Reason**: Optional field to explain why deleting
4. **Admin Override**: Allow admins to delete any request with reason
5. **Email Notification**: Notify student when request is deleted by admin
