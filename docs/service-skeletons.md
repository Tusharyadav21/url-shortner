# Service Skeletons and Folder Structure

## Folder Structure

- /Users/tusharyadav/Dev/url-shortner/auth
- /Users/tusharyadav/Dev/url-shortner/url
- /Users/tusharyadav/Dev/url-shortner/analytics

## Auth Service

Entry point
- /Users/tusharyadav/Dev/url-shortner/auth/routes.py

Ports
- 8001

Endpoints (placeholders)
- GET /health
- POST /auth/signup
- POST /auth/login
- POST /auth/refresh
- GET /auth/jwks

## URL Service

Entry point
- /Users/tusharyadav/Dev/url-shortner/url/routes.py

Ports
- 8002

Endpoints (placeholders)
- GET /health
- POST /url
- GET /url/{short_id}

## Analytics Service

Entry point
- /Users/tusharyadav/Dev/url-shortner/analytics/routes.py

Ports
- 8003

Endpoints (placeholders)
- GET /health
- GET /analytics/url/{short_id}
