# Visits by Country — Backend API

A REST API for tracking website visits by country with automatic GeoIP detection. Built with **NestJS + TypeScript + Redis**.

## Tech Stack

| Technology          | Purpose                              |
| ------------------- | ------------------------------------ |
| **NestJS 11**       | Progressive Node.js framework        |
| **TypeScript 5.7**  | Type-safe development                |
| **Redis 7**         | In-memory data store                 |
| **geoip-lite**      | IP geolocation without external APIs |
| **class-validator** | DTO validation with decorators       |
| **Throttler**       | Rate limiting (1500 req/min per IP)  |
| **Jest**            | Testing framework                    |
| **Docker**          | Containerization                     |

## Quick Start

### Prerequisites

- Node.js 18+, npm 8+, Redis 6+

### Local Development

```bash
# Install dependencies
npm install

# Copy environment config
cp .env.example .env

# Start Redis (if not running)
redis-server

# Start in dev mode (with auto-reload)
npm run start:dev
```

The API will be available at `http://localhost:3000`.

### Docker

```bash
# Start API + Redis
docker-compose up -d

# View logs
docker-compose logs -f api

# Stop
docker-compose down
```

## Environment Variables

| Variable                | Default       | Description              |
| ----------------------- | ------------- | ------------------------ |
| `PORT`                  | `3000`        | Server port              |
| `HOST`                  | `0.0.0.0`     | Server host              |
| `NODE_ENV`              | `development` | Environment              |
| `REDIS_HOST`            | `localhost`   | Redis host               |
| `REDIS_PORT`            | `6379`        | Redis port               |
| `REDIS_PASSWORD`        | -             | Redis password (optional)|
| `CORS_ORIGIN`           | `*`           | CORS allowed origin      |

See `.env.example` for all available options.

## API Endpoints

Base URL: `http://localhost:3000/api`

### GET /api/health

```json
{
  "status": "healthy",
  "timestamp": "2025-10-15T12:00:00.000Z",
  "services": { "redis": "connected" }
}
```

### POST /api/visits

Records a visit. Country is auto-detected from the request IP if not provided.

```bash
# Auto-detect country from IP
curl -X POST http://localhost:3000/api/visits \
  -H "Content-Type: application/json" \
  -d '{}'

# Manual country override
curl -X POST http://localhost:3000/api/visits \
  -H "Content-Type: application/json" \
  -d '{"country": "us"}'
```

Response:
```json
{ "country": "us", "count": 42 }
```

Country code must be a 2-letter ISO 3166-1 alpha-2 code (e.g. `us`, `fr`, `de`). Case-insensitive.

### GET /api/stats

Returns visit counts for all countries.

```json
{ "us": 42, "fr": 15, "de": 8 }
```

## Project Structure

```
src/
├── common/
│   ├── filters/
│   │   └── http-exception.filter.ts  # Global exception handler
│   └── utils/
│       └── geoip.service.ts          # Country lookup from IP
├── config/
│   └── configuration.ts              # Environment config
├── redis/
│   ├── redis.module.ts
│   └── redis.service.ts              # Connection lifecycle
├── visits/
│   ├── dto/
│   │   ├── create-visit.dto.ts       # Request validation
│   │   └── visit-response.dto.ts     # Response types
│   ├── visits.controller.ts          # HTTP endpoints
│   ├── visits.service.ts             # Business logic
│   └── visits.module.ts
├── app.module.ts
└── main.ts
```

## Architecture

```
Request
  → Rate limiter (1500 req/min per IP)
  → Validation pipe (class-validator)
  → VisitsController
      POST /visits → GeoIpService.getCountryFromIp() → VisitsService.incrementVisit() → Redis HINCRBY
      GET  /stats  → VisitsService.getAllStats() → Redis HGETALL
      GET  /health → RedisService.isConnected()
  → Global exception filter
```

Visit counts are stored in a Redis hash:

```
HINCRBY visits:by_country us 1   # atomic increment
HGETALL visits:by_country        # { us: 42, fr: 15 }
```

## Testing

```bash
# Unit tests
npm test

# Unit tests with coverage
npm run test:cov

# E2E tests (requires Redis)
npm run test:e2e
```

## Frontend

A React + TypeScript dashboard is included in the [`/frontend`](./frontend) directory.

```bash
# Start backend
docker-compose up -d

# Start frontend (separate terminal)
cd frontend && docker-compose up -d
```

- Backend: http://localhost:3000
- Frontend: http://localhost
