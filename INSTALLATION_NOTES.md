# Installation Notes for Bug Fixes

## Required Package Installation

### Frontend
Run this command in the frontend directory to install the required SPL Token package:

```bash
cd frontend
npm install @solana/spl-token
```

### Backend
No additional packages needed. The fix uses built-in Express body-parser.

## After Installation

1. Restart the backend server (if running)
2. Restart the frontend development server (if running)
3. Test the fixes:
   - Upload images with base64 encoding (should work up to 10MB now)
   - Create comment replies (should nest properly under parent comments)
   - Try tipping with USDC (should open wallet for transaction approval)
