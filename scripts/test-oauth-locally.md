# Testing Google OAuth Locally

## Setup

1. **Install dependencies** (if not already done):
```bash
pnpm install
```

2. **Set up your `.env` file**:
```bash
cp .env.example .env
```

Then edit `.env` with your actual values:
```env
JWT_SECRET="your-super-secret-jwt-key-min-32-characters-long"
DATABASE_URL="postgresql://username:password@localhost:5432/database_name"

# Google OAuth
GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-client-secret"
GOOGLE_REDIRECT_URI="http://localhost:3000/api/auth/callback/google"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

3. **Run database migration**:
```bash
pnpm prisma migrate dev
```

4. **Start the dev server**:
```bash
pnpm dev
```

## Test Flow

1. Open http://localhost:3000/login
2. Click the "Google" button
3. You should be redirected to Google's OAuth consent screen
4. Sign in with your Google account
5. Grant permissions
6. You should be redirected back to http://localhost:3000/dashboard
7. Check that you're logged in

## Debugging

### Check if environment variables are loaded:
```bash
# In your terminal where you run pnpm dev
echo $GOOGLE_CLIENT_ID
```

### Check API routes:
```bash
# Test the OAuth initiation endpoint
curl http://localhost:3000/api/auth/google

# Should redirect to Google
```

### Check browser console:
- Open DevTools (F12)
- Go to Console tab
- Look for any errors when clicking the Google button

### Check server logs:
- Look at your terminal where `pnpm dev` is running
- Any errors will appear there

## Common Local Issues

### "OAuth configuration error"
- Check that `GOOGLE_CLIENT_ID` is in your `.env` file
- Restart the dev server after adding env vars

### "redirect_uri_mismatch"
- Make sure `http://localhost:3000/api/auth/callback/google` is added to Google Console
- Check for typos in the redirect URI

### Database connection error
- Make sure PostgreSQL is running
- Verify `DATABASE_URL` is correct
- Run `pnpm prisma migrate dev` to ensure schema is up to date

### "Module not found" errors
- Run `pnpm install` again
- Clear `.next` folder: `rm -rf .next` (or `rmdir /s /q .next` on Windows)
- Restart dev server
