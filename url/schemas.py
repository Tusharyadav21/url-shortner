from pydantic import AnyHttpUrl, BaseModel


class URLCreate(BaseModel):
    url: AnyHttpUrl


class URLResponse(BaseModel):
    short_id: str
