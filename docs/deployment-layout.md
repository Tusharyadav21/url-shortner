# Docker Compose and Deployment Layout

## Docker Compose

File
- /Users/tusharyadav/Dev/url-shortner/docker-compose.yml

Services
- auth on port 8001
- url on port 8002
- analytics on port 8003
- postgres on port 5432
- redis on port 6379
- queue (rabbitmq) on ports 5672 and 15672

## Local Development

1. Build and run
- docker compose up --build

2. Health checks
- http://localhost:8001/health
- http://localhost:8002/health
- http://localhost:8003/health

## Deployment Notes

1. Each service has its own Dockerfile
- /Users/tusharyadav/Dev/url-shortner/auth/Dockerfile
- /Users/tusharyadav/Dev/url-shortner/url/Dockerfile
- /Users/tusharyadav/Dev/url-shortner/analytics/Dockerfile

2. Each service can be deployed independently
- Build and push each image to a registry
- Configure service-specific environment variables

3. Shared infrastructure
- Postgres and Redis can be managed services
- Queue can be RabbitMQ or Redis Streams
