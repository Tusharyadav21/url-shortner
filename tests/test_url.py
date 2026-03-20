import httpx

from conftest import URL_URL, create_short_url, create_user_and_token


def test_create_and_redirect(services_up):
    token, _ = create_user_and_token()
    short_id = create_short_url(token)

    response = httpx.get(f"{URL_URL}/url/{short_id}", follow_redirects=False, timeout=10)
    assert response.status_code == 307
