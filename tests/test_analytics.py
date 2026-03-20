import time

import httpx

from conftest import ANALYTICS_URL, URL_URL, create_short_url, create_user_and_token


def test_analytics_after_redirect(services_up):
    token, _ = create_user_and_token()
    short_id = create_short_url(token)

    httpx.get(f"{URL_URL}/url/{short_id}", follow_redirects=False, timeout=10)

    for _ in range(10):
        response = httpx.get(f"{ANALYTICS_URL}/analytics/url/{short_id}", timeout=10)
        response.raise_for_status()
        data = response.json()
        if data["total_clicks"] >= 1:
            return
        time.sleep(1)

    raise AssertionError("Analytics did not update in time")
