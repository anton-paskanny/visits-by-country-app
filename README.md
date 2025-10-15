# Visits by Country - Backend API 🌍

A high-performance REST API for tracking website visits by country with automatic **GeoIP detection**. Built with **NestJS + TypeScript + Redis**, designed to handle 1,500+ requests per minute with atomic operations, rate limiting, and graceful shutdown handling. **Scales horizontally to 1,000+ req/s** with load balancing.

## 🚀 Tech Stack

| Technology          | Version | Purpose                              |
| ------------------- | ------- | ------------------------------------ |
| **NestJS**          | 11.0    | Progressive Node.js framework        |
| **TypeScript**      | 5.7     | Type-safe development                |
| **Redis**           | 7       | In-memory data store (Alpine)        |
| **geoip-lite**      | 1.4     | IP geolocation without external APIs |
| **class-validator** | 0.14    | DTO validation with decorators       |
| **Throttler**       | 6.4     | Rate limiting (1500 req/min per IP)  |
| **Jest**            | 29.7    | Testing framework                    |
| **Docker**          | -       | Multi-stage containerization         |

## 📋 Features

- ✅ **GeoIP Detection** - Automatic country detection from IP address (geoip-lite)
- ✅ **Smart IP Extraction** - Handles X-Forwarded-For, X-Real-IP headers for proxy/load balancer
- ✅ **Type Safety** - Full TypeScript strict mode implementation
- ✅ **Rate Limiting** - 1,500 requests per minute per IP (25 req/s) - DDoS protection
- ✅ **Atomic Operations** - Redis HINCRBY for thread-safe increments
- ✅ **Input Validation** - Automatic DTO validation with class-validator
- ✅ **Global Exception Filter** - Centralized error handling with AllExceptionsFilter
- ✅ **Comprehensive Tests** - Unit, integration, and e2e tests with mocks
- ✅ **Docker Support** - Multi-stage Dockerfile with production optimizations
- ✅ **Graceful Shutdown** - Proper Redis connection cleanup
- ✅ **Health Checks** - Redis connectivity monitoring endpoint
- ✅ **Dependency Injection** - Clean architecture with NestJS IoC container
- ✅ **CORS Support** - Configurable cross-origin resource sharing
- ✅ **Connection Resilience** - Auto-reconnection with exponential backoff
- ✅ **Request Timeouts** - 30s timeout with keep-alive configuration

## 🎯 API Endpoints

### Base URL

```
http://localhost:3000/api
```

### 1. Health Check

```http
GET /api/health
```

**Response:**

```json
{
  "status": "healthy",
  "timestamp": "2025-10-15T12:00:00.000Z",
  "services": {
    "redis": "connected"
  }
}
```

**Status Values:**

- `healthy` - All services operational
- `degraded` - Redis disconnected

---

### 2. Record Visit (with GeoIP Detection)

```http
POST /api/visits
Content-Type: application/json

{}
```

**Response:**

```json
{
  "country": "us",
  "count": 123
}
```

**Behavior:**

- **Auto-detection**: If body is empty, country is detected from IP address
- **Manual override**: Provide `{"country": "us"}` to set country explicitly
- **IP Headers**: Supports `X-Forwarded-For` and `X-Real-IP` for proxies
- **Local development**: Returns `us` for localhost/private IPs

**Validation (if country provided manually):**

- Country code must be a 2-letter ISO 3166-1 alpha-2 code
- Case-insensitive (automatically normalized to lowercase)
- Whitespace trimmed
- Examples: `us`, `ru`, `it`, `fr`, `de`, `cn`, `jp`, `uk`

**Error Example:**

```json
{
  "statusCode": 400,
  "message": "Unable to detect country from IP address",
  "error": "Bad Request"
}
```

### 3. Get Statistics

```http
GET /api/stats
```

**Response:**

```json
{
  "us": 456,
  "ru": 123,
  "it": 789,
  "fr": 234
}
```

**Note:** Returns empty object `{}` if no visits have been recorded yet.

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+
- **npm** 8+
- **Redis** 6+
- **Docker & Docker Compose** (optional)

### Installation

1. **Clone the repository**

```bash
git clone <repository-url>
cd visits-by-country-app
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up environment variables**

```bash
cp .env.example .env
# Edit .env with your settings
```

4. **Start Redis** (if not using Docker)

```bash
redis-server
```

5. **Start the application**

```bash
# Development mode (with auto-reload)
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

The API will be available at `http://localhost:3000`

## 🐳 Docker Deployment

The Docker setup reads configuration from your `.env` file, making it environment-agnostic.

### Quick Start with npm Scripts

**Production:**

```bash
npm run docker:prod      # Start in production mode (background)
npm run docker:logs      # View logs (all services)
npm run docker:logs:api  # View API logs only
npm run docker:down      # Stop all services
```

**Development:**

```bash
npm run docker:dev       # Start in dev mode with hot reload (foreground)
npm run docker:logs:api  # View API logs (in another terminal)
```

**Testing:**

```bash
npm run docker:test      # Run unit tests in Docker
npm run docker:test:e2e  # Run e2e tests in Docker
```

**Maintenance:**

```bash
npm run docker:build     # Rebuild containers from scratch
npm run docker:rebuild   # Stop, rebuild, and restart
npm run docker:clean     # Remove all containers and volumes
```

### Manual Docker Commands

**Production:**

```bash
# Start all services (API + Redis)
docker-compose up -d

# View logs
docker-compose logs -f api

# Stop services
docker-compose down
```

**Development:**

```bash
# Start with hot reload
BUILD_TARGET=development VOLUME_MODE=rw docker-compose up

# View logs
docker-compose logs -f api
```

### Cloud/Orchestration Deployment

For Kubernetes, Docker Swarm, or cloud platforms where port binding is handled externally:

```bash
# Disable external port mappings (orchestrator handles this)
API_HOST_PORT= REDIS_HOST_PORT= docker-compose up -d

# Or create a .env.docker file with your orchestration settings
cp .env.docker.example .env.docker
# Edit .env.docker
docker-compose --env-file .env.docker up -d
```

**Resource constraints** are automatically applied for production orchestration and scaling.

**Environment Variables for Docker:**

_Build & Volume:_

- `BUILD_TARGET` - Docker build stage: `production` (default) or `development`
- `VOLUME_MODE` - Volume mount: `ro` (read-only) or `rw` (read-write for dev hot reload)

_Port Mappings (cloud-native, optional):_

- `API_HOST_PORT` - Host port for API: `3000` (default), leave empty to disable external access
- `REDIS_HOST_PORT` - Host port for Redis: `6379` (default), leave empty to disable external access

_Resource Limits (production orchestration):_

- `API_CPU_LIMIT`/`API_CPU_RESERVATION` - API CPU: `1.0`/`0.5` (default)
- `API_MEMORY_LIMIT`/`API_MEMORY_RESERVATION` - API memory: `512M`/`256M` (default)
- `REDIS_CPU_LIMIT`/`REDIS_CPU_RESERVATION` - Redis CPU: `0.50`/`0.25` (default)
- `REDIS_MEMORY_LIMIT`/`REDIS_MEMORY_RESERVATION` - Redis memory: `256M`/`128M` (default)

_App Configuration:_

- All app config (PORT, HOST, NODE_ENV, etc.) comes from `.env` file

See `.env.docker.example` for complete Docker configuration options.

### Build and Push to Registry

```bash
# Build production image
docker build -t visits-by-country-api:latest --target production .

# Tag and push to registry
docker tag visits-by-country-api:latest your-registry/visits-by-country-api:latest
docker push your-registry/visits-by-country-api:latest
```

## 🧪 Testing

### Run All Tests

```bash
# Unit tests
npm test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov

# Watch mode
npm run test:watch
```

### Test Structure

- **Unit Tests** - `*.spec.ts` files alongside source code
- **E2E Tests** - `/test/app.e2e-spec.ts`
- **Coverage** - Generated in `/coverage` directory

**Test Coverage:**

- ✅ Service layer tests with mocked Redis
- ✅ Controller tests with mocked services
- ✅ End-to-end API tests with real Redis
- ✅ Validation tests for DTOs
- ✅ Error handling tests
- ✅ Concurrent request handling

## 🏗️ Project Structure

```
visits-by-country-app/
├── src/
│   ├── common/                          # Shared modules
│   │   ├── filters/
│   │   │   └── http-exception.filter.ts # Global exception handler
│   │   └── utils/
│   │       └── geoip.service.ts         # GeoIP lookup service
│   ├── config/
│   │   └── configuration.ts             # Environment config factory
│   ├── redis/
│   │   ├── redis.module.ts              # Redis module definition
│   │   └── redis.service.ts             # Connection lifecycle management
│   ├── visits/
│   │   ├── dto/
│   │   │   ├── create-visit.dto.ts      # Request validation (optional country)
│   │   │   └── visit-response.dto.ts    # Response types
│   │   ├── visits.controller.ts         # HTTP endpoints (POST /visits, GET /stats, GET /health)
│   │   ├── visits.controller.spec.ts    # Controller unit tests
│   │   ├── visits.service.ts            # Business logic (HINCRBY, HGETALL)
│   │   ├── visits.service.spec.ts       # Service unit tests
│   │   └── visits.module.ts             # Module definition
│   ├── app.module.ts                    # Root module (throttler, config)
│   └── main.ts                          # Bootstrap (CORS, validation, timeout)
├── test/
│   ├── app.e2e-spec.ts                  # End-to-end API tests
│   └── jest-e2e.json                    # E2E Jest config
├── frontend/                            # React frontend (separate app)
├── dist/                                # Compiled output (git ignored)
├── node_modules/                        # Dependencies (git ignored)
├── .dockerignore                        # Docker build exclusions
├── .env.example                         # Environment variables template
├── .gitignore                           # Git exclusions
├── .prettierrc                          # Code formatting rules
├── docker-compose.yml                   # Production (API + Redis)
├── docker-compose.dev.yml               # Development with hot reload
├── Dockerfile                           # Multi-stage build
├── eslint.config.mjs                    # ESLint configuration
├── nest-cli.json                        # NestJS CLI config
├── package.json                         # Dependencies & scripts
├── README.md                            # This file
├── tsconfig.build.json                  # TypeScript build config
└── tsconfig.json                        # TypeScript config
```

## 🏛️ Architecture

### Request Flow

```
Client Request
     ↓
[Trust Proxy] → Extract real IP from X-Forwarded-For/X-Real-IP
     ↓
[Rate Limiter (Throttler)] → 1,500 req/min per IP (25 req/s)
     ↓
[Global Validation Pipe] → Validate & transform DTO
     ↓
[VisitsController]
     ├─ POST /api/visits
     │    ├─ GeoIpService.extractIp() → Get client IP
     │    ├─ GeoIpService.getCountryFromIp() → Lookup country (geoip-lite)
     │    └─ VisitsService.incrementVisit() → Redis HINCRBY
     ├─ GET /api/stats
     │    └─ VisitsService.getAllStats() → Redis HGETALL
     └─ GET /api/health
          └─ RedisService.isConnected() → Check connection
     ↓
[Global Exception Filter] → Format errors
     ↓
HTTP Response
```

### Core Components

| Component               | Responsibility                                      |
| ----------------------- | --------------------------------------------------- |
| **main.ts**             | Bootstrap app, configure CORS, validation, timeouts |
| **AppModule**           | Root module, imports ConfigModule, ThrottlerModule  |
| **VisitsController**    | HTTP endpoints, delegates to services               |
| **VisitsService**       | Business logic, Redis HINCRBY/HGETALL operations    |
| **GeoIpService**        | IP extraction, country lookup (geoip-lite)          |
| **RedisService**        | Connection lifecycle, reconnection, health checks   |
| **AllExceptionsFilter** | Global error handler, formats error responses       |

### Data Storage

Redis Hash structure:

```redis
HSET visits:by_country us 123
HSET visits:by_country fr 45
HSET visits:by_country it 67

# Atomic increment
HINCRBY visits:by_country us 1  # Returns new count

# Get all stats
HGETALL visits:by_country  # Returns { us: 123, fr: 45, it: 67 }
```

### Dependency Injection Flow

```
AppModule
   ├─ ConfigModule (global)
   ├─ ThrottlerModule (global guard)
   └─ VisitsModule
        ├─ VisitsController
        │    ├─ VisitsService (injected)
        │    ├─ RedisService (injected)
        │    └─ GeoIpService (injected)
        ├─ VisitsService
        │    └─ RedisService (injected)
        └─ GeoIpService (stateless)
```

## ⚙️ Configuration

### Environment Variables

| Variable                | Default       | Description                            |
| ----------------------- | ------------- | -------------------------------------- |
| `PORT`                  | `3000`        | Server port                            |
| `HOST`                  | `0.0.0.0`     | Server host (0.0.0.0 for Docker/cloud) |
| `NODE_ENV`              | `development` | Environment (development/production)   |
| `REDIS_HOST`            | `localhost`   | Redis host                             |
| `REDIS_PORT`            | `6379`        | Redis port                             |
| `REDIS_PASSWORD`        | -             | Redis password (optional)              |
| `REDIS_DB`              | `0`           | Redis database number                  |
| `REDIS_COMMAND_TIMEOUT` | `5000`        | Command timeout in milliseconds        |
| `REDIS_MAX_RETRIES`     | `3`           | Max reconnection attempts              |
| `CORS_ORIGIN`           | `*`           | CORS allowed origin                    |

**Configuration Highlights:**

- **Host Binding**: `0.0.0.0` makes the API accessible from any network interface (essential for Docker/cloud)
- **Trust Proxy**: Enabled for IP detection behind load balancers/reverse proxies
- **Global Prefix**: All endpoints are prefixed with `/api`
- **Validation**: Global validation pipe with whitelist and transformation
- **Timeouts**: 30s request timeout, 65s keep-alive, 66s headers timeout

### TypeScript Configuration

Strict TypeScript settings for maximum type safety:

```json
{
  "compilerOptions": {
    "strict": true,
    "strictNullChecks": true,
    "noImplicitAny": true,
    "esModuleInterop": true,
    "target": "ES2021",
    "module": "commonjs",
    "moduleResolution": "node"
  }
}
```

## 📊 Performance & Scalability

### Performance Characteristics

- **Rate Limit**: 1,500 requests/minute per IP (25 req/s burst)
- **Redis Operations**: O(1) atomic HINCRBY for increments
- **Connection Pooling**: Single Redis client with auto-reconnect
- **Timeout Handling**: 30s request timeout, 5s Redis command timeout
- **Graceful Shutdown**: Proper cleanup on SIGTERM/SIGINT

### Load Testing

#### Using autocannon (Recommended)

```bash
# Install autocannon globally
npm install -g autocannon

# Test POST /api/visits with 1,000 req/s for 30 seconds
autocannon -c 100 -d 30 -R 1000 -m POST \
  -H "Content-Type: application/json" \
  -b '{"country":"us"}' \
  http://localhost:3000/api/visits

# Test POST with auto GeoIP detection
autocannon -c 100 -d 30 -R 1000 -m POST \
  -H "Content-Type: application/json" \
  -b '{}' \
  http://localhost:3000/api/visits

# Test GET /api/stats
autocannon -c 100 -d 30 -R 1000 \
  http://localhost:3000/api/stats
```

**Note:** When testing locally, all requests come from the same IP (`127.0.0.1`), so you'll hit the 1,500 req/min (25 req/s) rate limit. To test full 1,000 req/s capacity, either:

1. Temporarily increase the rate limit in `src/app.module.ts`
2. Deploy with horizontal scaling and test through a load balancer
3. Use distributed load testing from multiple IPs

#### Using Apache Bench

```bash
# Install Apache Bench
# macOS: brew install httpd
# Ubuntu: apt-get install apache2-utils

# Test with auto GeoIP detection (empty body)
echo '{}' > empty.json
ab -n 1000 -c 50 -p empty.json -T application/json http://localhost:3000/api/visits

# Test with manual country
echo '{"country":"us"}' > post-data.json
ab -n 1000 -c 50 -p post-data.json -T application/json http://localhost:3000/api/visits

# Test GET endpoint
ab -n 1000 -c 50 http://localhost:3000/api/stats
```

#### Load Test Results (Single Instance)

**Expected Performance:**

- **Throughput**: 500-600 req/s
- **Latency p50**: ~50-100ms
- **Latency p99**: ~200-400ms
- **Rate Limit**: Kicks in at 25 req/s per IP

### Performance Optimizations

| Optimization            | Implementation                           | Benefit                |
| ----------------------- | ---------------------------------------- | ---------------------- |
| Atomic Operations       | Redis HINCRBY (thread-safe)              | O(1) concurrent writes |
| Rate Limiting           | @nestjs/throttler (1500/min per IP)      | Prevents abuse & DDoS  |
| Connection Reuse        | Single Redis client with reconnect logic | Reduces overhead       |
| Validation Pipeline     | class-validator with transformation      | Input sanitization     |
| Global Exception Filter | Centralized error handling               | Consistent responses   |
| Graceful Shutdown       | OnModuleDestroy hooks                    | Prevents data loss     |
| Health Checks           | Redis connectivity monitoring            | Observability          |

### Redis Configuration (Production)

```yaml
# docker-compose.yml
redis:
  command: |
    redis-server
    --appendonly yes           # Persistence
    --maxmemory 400mb          # Memory limit
    --maxmemory-policy allkeys-lru  # Eviction policy
    --tcp-backlog 511          # Connection queue
    --tcp-keepalive 300        # Keep-alive (seconds)
```

### Achieving 1,000+ Requests Per Second

**Current Single Instance Capacity:** ~500-600 req/s

**To achieve 1,000+ req/s, you need horizontal scaling:**

#### Why Horizontal Scaling?

- **Per-IP Rate Limit**: 1,500 req/min (25 req/s) - Protects against DDoS
- **Single Instance Limit**: Node.js is single-threaded, maxes out at ~500-600 req/s
- **Total System Capacity**: Achieved by running multiple instances behind a load balancer

#### Architecture for 1,000+ req/s

```
                    ┌─────────────────────┐
                    │   Nginx/HAProxy     │
                    │   Load Balancer     │
                    └──────────┬──────────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                │
         ┌────▼────┐      ┌────▼────┐     ┌────▼────┐
         │  API #1 │      │  API #2 │     │  API #3 │
         │ 550 r/s │      │ 550 r/s │     │ 550 r/s │
         └────┬────┘      └────┬────┘     └────┬────┘
              │                │                │
              └────────────────┼────────────────┘
                               │
                        ┌──────▼──────┐
                        │    Redis    │
                        │   (Shared)  │
                        └─────────────┘
```

**Math:**

- 2 instances × 550 req/s = **1,100 req/s** ✅
- 3 instances × 550 req/s = **1,650 req/s** ✅
- Each instance protected by 1,500 req/min rate limit per IP

#### Quick Start: Horizontal Scaling

**Option 1: Docker Compose Scale** (Development/Testing)

```bash
# Scale to 3 API instances
docker-compose up -d --scale api=3

# Note: This shares the same port, so you'll need nginx for production
```

**Option 2: Kubernetes** (Production)

```yaml
# k8s/api-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: visits-api
spec:
  replicas: 3 # 3 instances for 1,650 req/s capacity
  selector:
    matchLabels:
      app: visits-api
  template:
    metadata:
      labels:
        app: visits-api
    spec:
      containers:
        - name: api
          image: your-registry/visits-api:latest
          resources:
            requests:
              memory: '256Mi'
              cpu: '500m'
            limits:
              memory: '512Mi'
              cpu: '1000m'
---
apiVersion: v1
kind: Service
metadata:
  name: visits-api
spec:
  type: LoadBalancer
  selector:
    app: visits-api
  ports:
    - port: 80
      targetPort: 3000
```

**Option 3: Cloud Platforms**

- **AWS ECS/Fargate**: Set desired count to 3 tasks
- **Google Cloud Run**: Set max instances to 3
- **Azure Container Instances**: Deploy 3 container groups behind App Gateway

#### Load Testing

Test your scaled setup:

```bash
# Install autocannon globally
npm install -g autocannon

# Test 1,000 req/s for 30 seconds
autocannon -c 100 -d 30 -R 1000 -m POST \
  -H "Content-Type: application/json" \
  -b '{"country":"us"}' \
  http://your-load-balancer/api/visits
```

**Expected Results with 2-3 instances:**

- ✅ Throughput: 1,000+ req/s
- ✅ Latency p99: < 100ms
- ✅ Error rate: < 1%

#### Additional Optimizations

1. **Connection Pooling** - Nginx keepalive connections
2. **Redis Cluster** - For very high write loads (10,000+ req/s)
3. **Caching Layer** - CDN for static content
4. **Monitoring** - Prometheus + Grafana for metrics
5. **Auto-scaling** - Scale based on CPU/memory/request rate

## 🔒 Security Features

### Built-in Security

- ✅ **Rate Limiting** - 1,500 req/min per IP via @nestjs/throttler (DDoS protection, already enabled)
- ✅ **Input Validation** - class-validator with whitelist and forbidden non-whitelisted
- ✅ **CORS Configuration** - Configurable via `CORS_ORIGIN` environment variable
- ✅ **Global Exception Filter** - Prevents sensitive error details from leaking
- ✅ **Environment Variables** - Secrets loaded from .env file
- ✅ **No Hardcoded Credentials** - All config via environment
- ✅ **Trust Proxy** - Enabled for proper IP detection behind load balancers
- ✅ **Connection Limits** - Redis max retries and command timeouts

### Production Security Checklist

| Security Measure   | Implementation                         | Status         |
| ------------------ | -------------------------------------- | -------------- |
| Rate Limiting      | @nestjs/throttler (1500/min per IP)    | ✅ Enabled     |
| Input Validation   | class-validator with decorators        | ✅ Enabled     |
| CORS               | Configurable origin                    | ✅ Enabled     |
| Authentication     | Add @nestjs/passport for API keys      | ⚪ Optional    |
| HTTPS/TLS          | Use reverse proxy (Nginx, Cloudflare)  | ⚪ Deploy      |
| Redis AUTH         | Set `REDIS_PASSWORD` env var           | ⚪ Optional    |
| Helmet             | Add security headers                   | ⚪ Recommended |
| Logging            | Add structured logging (Winston, Pino) | ⚪ Recommended |
| Monitoring         | Add Prometheus, DataDog, New Relic     | ⚪ Recommended |
| Secrets Management | Use AWS Secrets Manager, Vault         | ⚪ Cloud       |

## 🚢 Deployment

> **🌍 Environment-Agnostic Design:** This API is designed to run in **any environment** - local, Docker, cloud platforms, or Kubernetes. No localhost hardcoding!

### Docker (Recommended)

```bash
docker-compose up -d
```

For detailed deployment instructions for **any platform**, see **[DEPLOYMENT.md](./DEPLOYMENT.md)**.

### Cloud Platforms

#### AWS (ECS/Fargate)

```bash
# Build and push to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com
docker build -t visits-api --target production .
docker tag visits-api:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/visits-api:latest
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/visits-api:latest
```

#### Google Cloud Run

```bash
gcloud builds submit --tag gcr.io/PROJECT-ID/visits-api
gcloud run deploy --image gcr.io/PROJECT-ID/visits-api --platform managed
```

#### Heroku

```bash
heroku container:push web -a your-app-name
heroku container:release web -a your-app-name
```

### Kubernetes

Create deployment manifests in `/k8s` directory:

- `deployment.yaml` - API deployment
- `service.yaml` - Load balancer service
- `redis-deployment.yaml` - Redis deployment
- `configmap.yaml` - Configuration
- `secret.yaml` - Sensitive data

## 📚 API Examples

### Using cURL

```bash
# Health check
curl http://localhost:3000/api/health

# Record a visit with auto GeoIP detection (recommended)
curl -X POST http://localhost:3000/api/visits \
  -H "Content-Type: application/json" \
  -d '{}'

# Record a visit with manual country override
curl -X POST http://localhost:3000/api/visits \
  -H "Content-Type: application/json" \
  -d '{"country": "us"}'

# Get statistics
curl http://localhost:3000/api/stats
```

### Using JavaScript (fetch)

```javascript
// Record visit with auto GeoIP detection
const response = await fetch('http://localhost:3000/api/visits', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({}),
});
const data = await response.json();
console.log(data); // { country: 'us', count: 1 }

// Record visit with manual country
const response2 = await fetch('http://localhost:3000/api/visits', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ country: 'fr' }),
});
const data2 = await response2.json();
console.log(data2); // { country: 'fr', count: 1 }

// Get statistics
const statsResponse = await fetch('http://localhost:3000/api/stats');
const stats = await statsResponse.json();
console.log(stats); // { us: 1, fr: 1 }
```

### Using TypeScript (axios)

```typescript
import axios from 'axios';

// Record visit with auto GeoIP detection
const { data } = await axios.post('http://localhost:3000/api/visits', {});
console.log(data); // { country: 'us', count: 1 }

// Get statistics
const { data: stats } = await axios.get('http://localhost:3000/api/stats');
console.log(stats); // { us: 1, fr: 2 }
```

## 🎨 Frontend Integration

This backend is integrated with a React + TypeScript frontend. See the [`/frontend`](./frontend) directory for the complete dashboard implementation.

### Features of the Included Frontend

- ✅ Real-time visit statistics with auto-refresh
- ✅ Interactive bar and pie charts (Recharts)
- ✅ Automatic GeoIP detection
- ✅ Manual visit simulation for testing
- ✅ Responsive design with Tailwind CSS
- ✅ Docker deployment with Nginx

### Running the Full Stack

```bash
# Start backend (API + Redis)
npm run docker:prod

# Start frontend (in another terminal)
cd frontend
docker-compose up -d
```

- **Backend API**: http://localhost:3000
- **Frontend Dashboard**: http://localhost

## 🛠️ Development

### Code Quality

```bash
# Linting
npm run lint

# Formatting
npm run format

# Build
npm run build
```

### Adding New Features

1. Create module: `nest g module feature-name`
2. Create service: `nest g service feature-name`
3. Create controller: `nest g controller feature-name`
4. Add DTOs in `feature-name/dto/`
5. Write tests: `*.spec.ts`
6. Update documentation

### NestJS CLI Commands

```bash
# Generate module
nest g module visits

# Generate controller
nest g controller visits

# Generate service
nest g service visits

# Generate full resource (CRUD)
nest g resource resource-name
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

ISC

## 👨‍💻 Author

Built with ❤️ using NestJS + TypeScript

---

## 📖 Additional Resources

- [NestJS Documentation](https://docs.nestjs.com/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Redis Commands](https://redis.io/commands)
- [class-validator Documentation](https://github.com/typestack/class-validator)
- [Docker Documentation](https://docs.docker.com/)

---

**Need help?** Open an issue or check the [API documentation](#-api-endpoints) above.
