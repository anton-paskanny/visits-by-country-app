# Visits by Country — Frontend

A real-time dashboard for visualizing website visits by country. Built with **React 19 + TypeScript + Vite**.

## Tech Stack

| Technology       | Purpose                          |
| ---------------- | -------------------------------- |
| **React 19**     | UI framework                     |
| **TypeScript**   | Type safety                      |
| **Vite**         | Build tool and dev server        |
| **Tailwind CSS** | Utility-first styling            |
| **Recharts**     | Bar and pie chart visualizations |
| **Axios**        | HTTP client                      |
| **Lucide React** | Icons                            |
| **Nginx**        | Production web server            |

## Quick Start

### Local Development

```bash
npm install
npm run dev
```

The dev server starts at `http://localhost:5173`. By default it points to `http://localhost:3000/api`.

To use a different backend URL create a `.env` file:

```bash
VITE_API_URL=http://localhost:3000/api
```

### Docker

```bash
# Build and start
docker-compose up -d

# With a custom backend URL
VITE_API_URL=https://api.example.com/api docker-compose build
docker-compose up -d
```

The app is served at `http://localhost` (port 80 by default).

## Project Structure

```
src/
├── components/
│   ├── Header.tsx        # Title and globe icon
│   ├── StatsCards.tsx    # Total visits, countries tracked, top country
│   ├── Controls.tsx      # Refresh and simulate visit buttons
│   ├── ErrorMessage.tsx  # API error display
│   ├── BarChartCard.tsx  # Bar chart (Recharts)
│   ├── PieChartCard.tsx  # Pie chart (Recharts)
│   └── StatsTable.tsx    # Detailed table with percentages
├── constants/index.ts    # API_URL and chart colours
├── types/index.ts        # CountryStats interface
├── App.tsx               # Root component — state, API calls, auto-refresh
├── main.tsx              # Entry point
└── index.css             # Tailwind imports
```

## How It Works

`App.tsx` fetches `/api/stats` on mount and every 10 seconds. The "Simulate Visit" button posts to `/api/visits`, which triggers the backend's GeoIP detection and records a visit for the caller's country.
