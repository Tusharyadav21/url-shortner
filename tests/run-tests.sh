#!/usr/bin/env bash
set -euo pipefail

python -m venv .venv-tests
source .venv-tests/bin/activate
pip install -r /Users/tusharyadav/Dev/url-shortner/tests/requirements.txt
pytest /Users/tusharyadav/Dev/url-shortner/tests
