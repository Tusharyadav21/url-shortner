# Integration Tests

These tests hit the running services. Start the stack first:

```bash
docker compose up --build
```

Then run:

```bash
python -m venv .venv-tests
source .venv-tests/bin/activate
pip install -r /Users/tusharyadav/Dev/url-shortner/tests/requirements.txt
pytest /Users/tusharyadav/Dev/url-shortner/tests
```

Shortcut:

```bash
/Users/tusharyadav/Dev/url-shortner/tests/run-tests.sh
```

You can override service URLs:

```bash
AUTH_URL=http://localhost:8000 \
URL_URL=http://localhost:8000 \
ANALYTICS_URL=http://localhost:8000 \
pytest /Users/tusharyadav/Dev/url-shortner/tests
```
