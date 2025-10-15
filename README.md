# Visits by Country API 🌍

A high-performance REST API built with **NestJS + TypeScript** for tracking website visits by country. Designed to handle 1,000+ requests per second with Redis for blazing-fast data storage.

## 🚀 Tech Stack

- **[NestJS](https://nestjs.com/)** - Progressive Node.js framework
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe development
- **[Redis](https://redis.io/)** - In-memory data store
- **[class-validator](https://github.com/typestack/class-validator)** - DTO validation
- **[Jest](https://jestjs.io/)** - Testing framework
- **[Docker](https://www.docker.com/)** - Containerization

## 📋 Features

- ✅ **Type Safety** - Full TypeScript implementation
- ✅ **High Performance** - Optimized for 1,000+ RPS
- ✅ **Input Validation** - Automatic DTO validation with decorators
- ✅ **Error Handling** - Custom exceptions and global filters
- ✅ **Standardized Responses** - Consistent API response format
- ✅ **Comprehensive Tests** - Unit, integration, and e2e tests
- ✅ **Docker Support** - Production and development containers
- ✅ **Graceful Shutdown** - Proper cleanup on termination
- ✅ **Health Checks** - Built-in health monitoring endpoint
- ✅ **Dependency Injection** - Clean architecture with IoC

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
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2025-10-15T12:00:00.000Z",
    "services": {
      "redis": "connected"
    }
  }
}
```

### 2. Record Visit

```http
POST /api/visits
Content-Type: application/json

{
  "country": "us"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "country": "us",
    "count": 123
  }
}
```

**Validation:**

- Country code must be a 2-letter ISO 3166-1 alpha-2 code
- Case-insensitive (automatically normalized to lowercase)
- Whitespace trimmed
- Examples: `us`, `ru`, `it`, `fr`, `de`, `cn`, `jp`, `uk`

### 3. Get Statistics

```http
GET /api/stats
```

**Response:**

```json
{
  "success": true,
  "data": {
    "us": 456,
    "ru": 123,
    "it": 789,
    "fr": 234
  }
}
```

### Error Response Format

```json
{
  "success": false,
  "error": {
    "statusCode": 400,
    "message": "Country code must be a 2-letter ISO 3166-1 alpha-2 code (e.g., us, ru, it)",
    "error": "Bad Request"
  }
}
```

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
│   ├── common/                   # Shared modules
│   │   ├── exceptions/           # Custom exceptions
│   │   │   └── database.exception.ts
│   │   ├── filters/              # Exception filters
│   │   │   └── http-exception.filter.ts
│   │   └── interceptors/         # Response interceptors
│   │       └── response.interceptor.ts
│   ├── config/                   # Configuration
│   │   └── configuration.ts
│   ├── redis/                    # Redis module
│   │   ├── redis.module.ts
│   │   └── redis.service.ts
│   ├── visits/                   # Visits module
│   │   ├── dto/                  # Data Transfer Objects
│   │   │   ├── create-visit.dto.ts
│   │   │   └── visit-response.dto.ts
│   │   ├── visits.controller.ts  # HTTP endpoints
│   │   ├── visits.controller.spec.ts
│   │   ├── visits.service.ts     # Business logic
│   │   ├── visits.service.spec.ts
│   │   └── visits.module.ts
│   ├── app.module.ts             # Root module
│   └── main.ts                   # Bootstrap
├── test/                         # E2E tests
│   ├── app.e2e-spec.ts
│   └── jest-e2e.json
├── .dockerignore
├── .env.example
├── .gitignore
├── docker-compose.yml
├── Dockerfile
├── nest-cli.json
├── package.json
├── README.md
├── tsconfig.build.json
└── tsconfig.json
```

## ⚙️ Configuration

### Environment Variables

| Variable         | Default       | Description                          |
| ---------------- | ------------- | ------------------------------------ |
| `PORT`           | `3000`        | Server port                          |
| `HOST`           | `0.0.0.0`     | Server host (use 0.0.0.0 for Docker) |
| `NODE_ENV`       | `development` | Environment (development/production) |
| `REDIS_HOST`     | `localhost`   | Redis host                           |
| `REDIS_PORT`     | `6379`        | Redis port                           |
| `REDIS_PASSWORD` | -             | Redis password (optional)            |
| `REDIS_DB`       | `0`           | Redis database number                |
| `CORS_ORIGIN`    | `*`           | CORS allowed origin                  |

**Note:** The application binds to `0.0.0.0` by default, making it accessible from any network interface. This is essential for Docker containers and cloud deployments.

### TypeScript Configuration

The project uses strict TypeScript settings for maximum type safety:

- `strict: true`
- `strictNullChecks: true`
- `noImplicitAny: true`
- `esModuleInterop: true`

## 📊 Performance & Scalability

### Load Testing

```bash
# Install Apache Bench
# macOS: brew install httpd
# Ubuntu: apt-get install apache2-utils

# Test POST endpoint
ab -n 10000 -c 100 -p post-data.json -T application/json http://localhost:3000/api/visits

# Test GET endpoint
ab -n 10000 -c 100 http://localhost:3000/api/stats
```

**post-data.json:**

```json
{ "country": "us" }
```

### Performance Optimizations

1. **Redis HINCRBY** - Atomic O(1) increments
2. **Global Validation Pipe** - Automatic DTO validation
3. **Response Interceptor** - Consistent response wrapping
4. **Connection Pooling** - Redis client reuse
5. **Graceful Shutdown** - Prevents data loss

### Horizontal Scaling

For 10,000+ RPS:

1. **Load Balancer** - Nginx, HAProxy, or cloud LB
2. **Multiple API Instances** - Scale horizontally
3. **Redis Cluster** - Distribute data across nodes
4. **Monitoring** - Prometheus + Grafana
5. **Rate Limiting** - Use `@nestjs/throttler`

## 🔒 Security Best Practices

- ✅ Non-root user in Docker containers
- ✅ Input validation with class-validator
- ✅ CORS configuration
- ✅ Environment variable configuration
- ✅ No sensitive data in logs
- ✅ Dependency vulnerability scanning

**Production Recommendations:**

- Add rate limiting (`@nestjs/throttler`)
- Add authentication/API keys (`@nestjs/passport`)
- Enable HTTPS/TLS
- Use Redis AUTH password
- Add request logging (`nest-morgan`)
- Add monitoring (Prometheus, DataDog, New Relic)
- Use helmet for security headers

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

# Record a visit
curl -X POST http://localhost:3000/api/visits \
  -H "Content-Type: application/json" \
  -d '{"country": "us"}'

# Get statistics
curl http://localhost:3000/api/stats
```

### Using JavaScript (fetch)

```javascript
// Record visit
const response = await fetch('http://localhost:3000/api/visits', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ country: 'us' }),
});
const data = await response.json();
console.log(data);

// Get statistics
const statsResponse = await fetch('http://localhost:3000/api/stats');
const stats = await statsResponse.json();
console.log(stats.data);
```

### Using TypeScript (axios)

```typescript
import axios from 'axios';

// Record visit
const { data } = await axios.post('http://localhost:3000/api/visits', {
  country: 'us',
});
console.log(data);

// Get statistics
const { data: stats } = await axios.get('http://localhost:3000/api/stats');
console.log(stats.data);
```

## 🎨 Frontend Integration

This backend is ready for frontend integration. Suggested frontends:

### React + TypeScript

```bash
npx create-react-app frontend --template typescript
cd frontend
npm install axios recharts react-leaflet
```

### Vue.js + TypeScript

```bash
npm init vue@latest
```

### Next.js

```bash
npx create-next-app@latest frontend --typescript
```

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
