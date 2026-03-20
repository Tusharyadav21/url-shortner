# Manual Test Checklist

## Auth
- Signup with a new email returns access and refresh tokens.
- Signup with existing email returns 400.
- Login with valid credentials returns access and refresh tokens.
- Login with invalid credentials returns 401.
- Refresh rotates refresh token.

## URL Service
- Create URL with valid token returns short_id.
- Create URL without token returns 401.
- Redirect returns 307 and points to destination.

## Analytics
- Redirect event shows in analytics within 10 seconds.
- Total clicks increments after multiple redirects.

## UI
- Signup page stores access token.
- Login page updates token.
- Create URL page requires token.
- Analytics page loads counts for short_id.
