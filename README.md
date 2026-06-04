# CineMatch Agent — Movie Recommendation Agent

A portfolio-grade movie recommendation app with a conversational AI agent. Tell CineMatch what you're in the mood for, and it searches **TMDB** for real films, then uses **Groq (Llama 3.3)** to curate personalized picks with ratings, descriptions, posters, trailers, and "why you should watch it" reasons.

![CineMatch Agent](https://via.placeholder.com/800x450/0a0a0f/f5c518?text=CineMatch+Agent+Demo)

## Features

- **Conversational chat UI** — describe genres, moods, eras, or reference films naturally
- **TMDB integration** — real movie data, posters, ratings, and YouTube trailers
- **AI curation** — Groq-powered agent picks 3–5 films and explains why each one fits
- **Cinema-themed design** — dark gradient UI, glassmorphism cards, Framer Motion animations
- **Quick suggestions** — one-click prompts to demo the agent instantly

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Vite + React 19 + TypeScript |
| UI | Tailwind CSS + shadcn/ui |
| Animation | Framer Motion |
| Movie data | [TMDB API v3](https://developer.themoviedb.org/docs) |
| AI agent | [Groq API](https://console.groq.com) — `llama-3.3-70b-versatile` |
| Icons | lucide-react |

## Workflow

```
User chat input
    ↓
Groq extracts preferences (genre, era, mood, reference film)
    ↓
TMDB discover / search → 15–20 candidate movies
    ↓
Groq curates 3–5 picks with "why watch" reasons (structured JSON)
    ↓
TMDB enriches each pick (poster, details, trailer)
    ↓
Animated movie cards rendered in the UI
```

## Getting Started

### Prerequisites

- Node.js 18+
- [TMDB API key](https://www.themoviedb.org/settings/api) (free Developer key)
- [Groq API key](https://console.groq.com) (free tier)

### Setup

```bash
# Clone or navigate to the project
cd movie-recommendation-agent

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Edit .env and add your API keys

# Start dev server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) and try a suggestion like *"Dark sci-fi from the 2010s"*.

### Build for production

```bash
npm run build
npm run preview
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `VITE_TMDB_API_KEY` | TMDB API key (v3) |
| `VITE_GROQ_API_KEY` | Groq API key |

> **Note:** Keys prefixed with `VITE_` are bundled into the client for local demo use. Before deploying publicly, move API calls to serverless routes (Vercel `/api/*`) so keys stay server-side.

## Project Structure

```
src/
├── components/
│   ├── chat/          # ChatPanel, MessageBubble
│   ├── movies/        # MovieCard, MovieGrid, TrailerModal
│   ├── layout/        # HeroHeader
│   └── ui/            # shadcn components
├── hooks/
│   └── useMovieAgent.ts   # Orchestration pipeline
├── services/
│   ├── tmdb.ts            # TMDB API helpers
│   └── agentService.ts    # Groq preference extraction + recommendations
└── types/
    └── movie.ts           # Shared TypeScript types
```

## API Attribution

This product uses the [TMDB API](https://www.themoviedb.org/) but is not endorsed or certified by TMDB.

## License

MIT
