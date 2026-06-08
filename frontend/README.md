# Visits by Country - Frontend 🌍

A modern, real-time dashboard for visualizing website visits by country. Built with **React 19 + TypeScript + Vite**, featuring interactive charts, auto-refresh capabilities, and a beautiful gradient UI.

## ✨ Features

- 📊 **Interactive Visualizations** - Bar charts and pie charts powered by Recharts
- 📈 **Real-time Statistics** - Auto-refresh every 10 seconds
- 🎯 **Statistics Cards** - Total visits, countries tracked, and top country metrics
- 📋 **Detailed Table View** - Country breakdown with visit counts and percentages
- 🔄 **Manual Controls** - Refresh and simulate visit buttons for testing
- 🎨 **Modern UI** - Beautiful gradient design with Tailwind CSS
- ⚡ **Lightning Fast** - Vite for instant HMR and optimized builds
- 🐳 **Production Ready** - Dockerized with Nginx and healthchecks
- 🔌 **API Integration** - Seamless connection to NestJS backend
- ❌ **Error Handling** - User-friendly error messages

## 🚀 Quick Start

### Development

For local development with hot module replacement (HMR):

```bash
# Install dependencies
npm install

# Start dev server
npm run dev
```

The dev server will start at **http://localhost:5173** with instant hot-reload.

**Default API endpoint:** `http://localhost:3000/api`

To use a different API URL, create a `.env` file:

```bash
echo "VITE_API_URL=http://localhost:3000/api" > .env
```

### Production (Docker)

For production deployment with Nginx:

```bash
# Using environment variables
VITE_API_URL=https://api.yourcompany.com/api docker-compose build
docker-compose up -d

# OR using .env file (recommended)
cat > .env << EOF
VITE_API_URL=http://localhost:3000/api
FRONTEND_PORT=80
VERSION=latest
EOF

docker-compose build
docker-compose up -d
```

Access the production app at: **http://localhost** (or your configured `FRONTEND_PORT`)

**View logs:**

```bash
docker-compose logs -f
```

**Stop and remove:**

```bash
docker-compose down
```

## ⚙️ Environment Variables

| Variable        | Description                | Development Default         | Production Default |
| --------------- | -------------------------- | --------------------------- | ------------------ |
| `VITE_API_URL`  | Backend API endpoint       | `http://localhost:3000/api` | Required (build)   |
| `FRONTEND_PORT` | Host port mapping (Docker) | N/A (use dev server)        | `80`               |
| `VERSION`       | Docker image tag           | N/A                         | `latest`           |

**Important:** `VITE_API_URL` is embedded at **build time**, not runtime. To change the API URL in production, you must rebuild the Docker image.

## 🛠️ Available Scripts

### Development

| Script            | Description                                |
| ----------------- | ------------------------------------------ |
| `npm run dev`     | Start Vite dev server with HMR             |
| `npm run build`   | TypeScript compile + Vite production build |
| `npm run preview` | Preview production build locally           |
| `npm run lint`    | Run ESLint with auto-fix                   |

### Docker (Production)

| Script                   | Description                       |
| ------------------------ | --------------------------------- |
| `npm run docker:build`   | Build production Docker image     |
| `npm run docker:up`      | Start container in detached mode  |
| `npm run docker:down`    | Stop and remove container         |
| `npm run docker:logs`    | View container logs (follow mode) |
| `npm run docker:restart` | Restart container                 |
| `npm run docker:rebuild` | Full rebuild (down, build, up)    |

### Manual Docker Commands

```bash
# Build with custom API URL
VITE_API_URL=https://api.production.com/api docker-compose build

# Start container
docker-compose up -d

# View logs
docker-compose logs -f

# Check status
docker-compose ps

# Stop
docker-compose down
```

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/           # React components
│   │   ├── Header.tsx        # App title with globe icon
│   │   ├── StatsCards.tsx    # Total visits, countries, top country
│   │   ├── Controls.tsx      # Refresh & simulate visit buttons
│   │   ├── ErrorMessage.tsx  # Error display component
│   │   ├── BarChartCard.tsx  # Bar chart visualization (Recharts)
│   │   ├── PieChartCard.tsx  # Pie chart distribution (Recharts)
│   │   └── StatsTable.tsx    # Detailed table with percentages
│   ├── constants/
│   │   └── index.ts          # API_URL & chart colors
│   ├── types/
│   │   └── index.ts          # TypeScript interfaces (CountryStats)
│   ├── App.tsx               # Main app component with state & API calls
│   ├── main.tsx              # React entry point
│   └── index.css             # Tailwind imports & global styles
├── public/
│   └── vite.svg              # Favicon
├── dist/                     # Build output (git ignored)
├── Dockerfile                # Multi-stage: build + nginx
├── docker-compose.yml        # Production deployment config
├── nginx.conf                # Nginx configuration with healthcheck
├── vite.config.ts            # Vite build config with code splitting
├── tailwind.config.js        # Tailwind CSS configuration
├── tsconfig.json             # TypeScript configuration
├── eslint.config.js          # ESLint rules
├── .dockerignore             # Docker build exclusions
└── package.json              # Dependencies & scripts
```

## 🎨 Component Architecture

### Main App (`App.tsx`)

- **State Management**: React hooks for stats, loading, errors
- **API Integration**: Fetch stats from backend (`/api/stats`)
- **Auto-refresh**: Updates every 10 seconds automatically
- **Visit Recording**: POST to `/api/visits` for manual testing

### UI Components

| Component      | Purpose                                    |
| -------------- | ------------------------------------------ |
| `Header`       | App title with globe icon                  |
| `StatsCards`   | 3-card grid: total visits, countries, top  |
| `Controls`     | Refresh and simulate visit action buttons  |
| `ErrorMessage` | Displays API errors with red alert styling |
| `BarChartCard` | Horizontal bar chart of visits by country  |
| `PieChartCard` | Pie chart showing distribution percentages |
| `StatsTable`   | Detailed table with visit counts & %       |

## 🏗️ Technology Stack

| Technology       | Version | Purpose                            |
| ---------------- | ------- | ---------------------------------- |
| **React**        | 19.1    | UI framework                       |
| **TypeScript**   | 5.9     | Type safety & developer experience |
| **Vite**         | 7.1     | Build tool & dev server with HMR   |
| **Tailwind CSS** | 3.4     | Utility-first CSS framework        |
| **Recharts**     | 3.2     | Data visualization (charts)        |
| **Axios**        | 1.12    | HTTP client (code-split chunk)     |
| **Lucide React** | 0.545   | Icon library (Globe, RefreshCw)    |
| **Nginx**        | Alpine  | Production web server              |
| **Docker**       | -       | Containerization & deployment      |

## 🚢 Production Build

### Multi-stage Dockerfile

1. **Build Stage** (`node:20-alpine`)
   - Install dependencies with `npm ci`
   - Build with Vite (outputs to `/app/dist`)
   - Injects `VITE_API_URL` at build time

2. **Production Stage** (`nginx:alpine`)
   - Copies built static assets to `/usr/share/nginx/html`
   - Configures Nginx on port 3000
   - Includes healthcheck endpoint

### Build Optimizations

- **Code Splitting**: Vendor chunk (React + React DOM), Axios chunk, and Recharts chunk
- **Minification**: ESBuild minifier for fast builds
- **No Source Maps**: Disabled for production
- **Tree Shaking**: Removes unused code automatically

### Docker Features

- **Healthcheck**: Curl-based health monitoring every 30s
- **Resource Limits**: 1 CPU / 512M RAM max (configurable)
- **Logging**: JSON logs with 10MB rotation, 3 file limit
- **Restart Policy**: Always restart on failure
- **Networks**: Custom bridge network for isolation

## 📝 Development Notes

- **API URL**: Configured at **build time** via `VITE_API_URL` (default: `http://localhost:3000/api`)
- **Hot Module Replacement**: Instant updates in dev mode without page refresh
- **TypeScript**: Strict mode enabled for maximum type safety
- **Responsive Design**: Gradient background (blue-50 to indigo-100) with mobile-friendly layout
- **Auto-refresh**: Frontend polls backend every 10 seconds for real-time updates
