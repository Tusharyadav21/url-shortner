# URL Shortener (FastAPI + Postgres + Redis + RabbitMQ)

URL shortener with authentication, caching, and analytics. The codebase is organized into modular services (Auth, URL, Analytics) with a shared layer, but runs as **one app** today for simplicity.

## Architecture

```
url-shortener/
├── auth/              # Signup/login/refresh + user models
├── url/               # URL creation + redirect + caching
├── analytics/         # Metrics + events consumer
├── shared/            # Config, DB, JWT helpers
├── web-ui/            # Static Tailwind UI
├── tests/             # Integration tests
├── docs/              # Planning and architecture docs
├── docker-compose.yml
├── Dockerfile
└── main.py            # Single app entrypoint
```

## Quick Start (Docker)

```bash
cd /Users/tusharyadav/Dev/url-shortner
docker compose up --build
```

- App: `http://localhost:8000`
- Docs: `http://localhost:8000/docs`

## Run the UI

```bash
cd /Users/tusharyadav/Dev/url-shortner/web-ui
python -m http.server 8080
```

Open:

- `http://localhost:8080/index.html`
- `http://localhost:8080/signup.html`
- `http://localhost:8080/login.html`
- `http://localhost:8080/create.html`
- `http://localhost:8080/analytics.html`

## Endpoints

Auth:

- `POST /auth/signup`
- `POST /auth/login`
- `POST /auth/refresh`

URL:

- `POST /url` (requires Bearer token)
- `GET /url/{short_id}` (redirect)
- `GET /url/resolve/{short_id}` (JSON only)

Analytics:

- `GET /analytics/url/{short_id}`

## Example: Signup + Create URL

```bash
curl -X POST http://localhost:8000/auth/signup \
  -H 'Content-Type: application/json' \
  -d '{"name":"Test User","email":"testuser@example.com","password":"secret123"}'
```

Use the access token:

```bash
curl -X POST http://localhost:8000/url \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer <ACCESS_TOKEN>' \
  -d '{"url":"https://example.com"}'
```

## Running Tests

```bash
/Users/tusharyadav/Dev/url-shortner/tests/run-tests.sh
```

Or manually:

```bash
python -m venv .venv-tests
source .venv-tests/bin/activate
pip install -r /Users/tusharyadav/Dev/url-shortner/tests/requirements.txt
pytest /Users/tusharyadav/Dev/url-shortner/tests
```

## Configuration

Environment variables (optional, defaults shown in `shared/config.py`):

- `DATABASE_URL`
- `JWT_SECRET`
- `REDIS_URL`
- `RABBITMQ_URL`
- `ACCESS_TOKEN_MINUTES`
- `REFRESH_TOKEN_DAYS`

## Services (modular, detachable)

The code is organized so each module can be separated later:

- `auth/`
- `url/`
- `analytics/`

Dockerfiles exist in each folder if you want to run them separately.

## Notes

- Redirect endpoint (`/url/{short_id}`) returns a 307; Swagger UI will show “Failed to fetch” because browsers block cross‑origin redirects. Use `/url/resolve/{short_id}` for JSON inspection.
