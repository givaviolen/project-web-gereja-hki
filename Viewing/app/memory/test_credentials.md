"# Test Credentials - HKI Laguboti Website

## Admin Account
- Email: `admin@hkilaguboti.id`
- Password: `HKILaguboti2026!`
- Role: admin

## Auth Endpoints
- POST `/api/auth/login` - body: `{\"email\": \"...\", \"password\": \"...\"}` returns `{token, user}`
- GET `/api/auth/me` - requires `Authorization: Bearer <token>`
- POST `/api/auth/logout` - requires auth

## Admin Endpoints (require Bearer token)
- GET/POST `/api/jemaat`
- PUT/DELETE `/api/jemaat/{id}`
- GET `/api/jemaat/stats`
- GET `/api/jemaat/export-csv`
- POST/PUT `/api/admin/daily-verse`
- POST/PUT/DELETE `/api/admin/news`
- POST/PUT/DELETE `/api/admin/schedules`
- POST/DELETE `/api/admin/gallery`

## Public Endpoints
- GET `/api/public/daily-verse`
- GET `/api/public/schedules`
- GET `/api/public/news`
- GET `/api/public/gallery`
- GET `/api/public/live-stream`
"
