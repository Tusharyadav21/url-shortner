# Developer Documentation and Planning

## User Flow

```mermaid
flowchart TD
  A["Visitor"] --> B["Login Page (/login)"]
  B -->|POST /user/login| C["Auth Service"]
  C -->|Set cookie 'token'| D["Dashboard (/)"]
  A --> E["Signup Page (/signup)"]
  E -->|POST /user| C
  D -->|POST /url| F["Create Short URL"]
  F --> G["Dashboard Updated (shows short URL)"]
  D -->|GET /url/{short_id}| H["Redirect + Record Visit"]
  D -->|GET /admin/urls (ADMIN)| I["Admin URL List"]
  D -->|GET /logout| J["Clear cookie + Redirect /login"]
```

## Request Flow (Runtime)

```mermaid
sequenceDiagram
  participant U as "User (Browser)"
  participant A as "FastAPI App"
  participant DB as "MongoDB"

  U->>A: "POST /user/login"
  A->>DB: "find users.email"
  DB-->>A: "User doc"
  A-->>U: "Set cookie token"

  U->>A: "POST /url (form)"
  A->>DB: "count urls createdBy in last 10m"
  DB-->>A: "Count"
  A->>DB: "find urls by createdBy + redirectedUrl"
  DB-->>A: "Existing or null"
  A->>DB: "insert new url doc"
  DB-->>A: "shortId"
  A-->>U: "HTML dashboard with short URL"

  U->>A: "GET /url/{short_id}"
  A->>DB: "find + push visitHistory"
  DB-->>A: "redirectedUrl"
  A-->>U: "307 redirect"
```

## Database Collections (Expected Schema)

```mermaid
erDiagram
  USERS ||--o{ URLS : "createdBy"
  USERS {
    ObjectId _id
    string name
    string email
    string password
    string role
    datetime lastLogin
    bool isActive
    int loginAttempts
    datetime lockUntil
    datetime createdAt
    datetime updatedAt
  }
  URLS {
    ObjectId _id
    string shortId
    string redirectedUrl
    ObjectId createdBy
    array visitHistory
    datetime createdAt
    datetime updatedAt
    datetime expiresAt
  }
  VISIT_HISTORY {
    datetime timestamp
    string ip
    string userAgent
  }
```

## Expected Load Model (Assumptions)

Assumptions: small personal project, 100 to 1,000 daily active users, 10 to 50 URLs per day per user, 1 to 10 clicks per URL per day.

```mermaid
flowchart LR
  A["Daily Active Users: 100-1,000"] --> B["Create URL Requests: 1,000-50,000 / day"]
  A --> C["Redirect Requests: 10,000-500,000 / day"]
  C --> D["Write visitHistory per redirect"]
  B --> E["Write url doc per create"]
  D --> F["Read + Update: urls collection"]
  E --> F
```

## Sample Data

```json
// users
{
  "_id": "64f1c2...e91",
  "name": "Asha",
  "email": "asha@example.com",
  "password": "<bcrypt-hash>",
  "role": "USER",
  "lastLogin": "2026-03-19T08:10:11Z",
  "isActive": true,
  "loginAttempts": 0,
  "lockUntil": null,
  "createdAt": "2026-03-10T12:00:00Z",
  "updatedAt": "2026-03-19T08:10:11Z"
}

// urls
{
  "_id": "64f1c2...f02",
  "shortId": "a1B2c3D4",
  "redirectedUrl": "https://example.com/very/long/url",
  "createdBy": "64f1c2...e91",
  "visitHistory": [
    {
      "timestamp": "2026-03-19T08:20:02Z",
      "ip": "203.0.113.10",
      "userAgent": "Mozilla/5.0"
    }
  ],
  "createdAt": "2026-03-19T08:19:50Z",
  "updatedAt": "2026-03-19T08:20:02Z",
  "expiresAt": null
}
```
