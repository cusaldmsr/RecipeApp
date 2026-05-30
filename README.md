<div align="center">

# 🍽️ RecipeVault

### A Smart MERN Stack Recipe Management Dashboard

[![CI](https://github.com/cusaldmsr/RecipeApp/actions/workflows/ci.yml/badge.svg)](https://github.com/cusaldmsr/RecipeApp/actions/workflows/ci.yml)
[![Security Audit](https://github.com/cusaldmsr/RecipeApp/actions/workflows/security-audit.yml/badge.svg)](https://github.com/cusaldmsr/RecipeApp/actions/workflows/security-audit.yml)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb&logoColor=white)
![Express](https://img.shields.io/badge/Express-4.x-000000?logo=express&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?logo=tailwindcss&logoColor=white)
![Node](https://img.shields.io/badge/Node.js-20.x-339933?logo=node.js&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-emerald)

<br/>

> Search millions of recipes. Save your favourites. Create your own.  
> Powered by **intelligent smart-caching proxy** — checks your local database first, fetches from the DummyJSON API only when needed, and saves new results automatically.

<br/>

![RecipeVault Dashboard](https://images.unsplash.com/photo-1466637574441-749b8f19452f?w=1200&h=500&fit=crop&q=80)

</div>

---

## 📌 Table of Contents

- [✨ Features](#-features)
- [🏗️ Architecture](#️-architecture)
- [🛠️ Tech Stack](#️-tech-stack)
- [📁 Project Structure](#-project-structure)
- [🚀 Getting Started](#-getting-started)
- [⚙️ Environment Variables](#️-environment-variables)
- [📡 API Reference](#-api-reference)
- [🔄 Smart Caching Logic](#-smart-caching-logic)
- [🔁 CI/CD Pipeline](#-cicd-pipeline)
- [🌿 Branching Strategy](#-branching-strategy)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🔍 **Smart Search** | Searches local DB first, falls back to DummyJSON API, auto-saves new results |
| 💡 **Typeahead Suggestions** | 300ms debounced dropdown with thumbnail previews, source badges & keyboard navigation |
| ♾️ **Infinite Scroll** | Paginated recipe grid (8 per page) with Intersection Observer — no buttons needed |
| 👁️ **Recipe Detail Modal** | Full view with hero image, ingredient checklist, numbered instruction steps |
| ✏️ **Full CRUD** | Create, Read, Update, Delete recipes with a polished modal form |
| 🏷️ **Source Badges** | Every card shows whether a recipe came from your vault or the DummyJSON API |
| 🎨 **GSAP Animations** | Page-load hero animation + staggered card entrance effects |
| 📱 **Responsive Design** | Mobile-first grid layout with glassmorphism dark UI |
| 🔐 **CI/CD Pipeline** | Full GitHub Actions pipeline with lint, build, audit, and deploy stages |

---

## 🏗️ Architecture

```
┌───────────────────────────────────────────────────────────┐
│                        BROWSER                            │
│                                                           │
│   React + Vite + Tailwind CSS + Shadcn UI + GSAP         │
│   ┌─────────────┐  ┌──────────────┐  ┌───────────────┐  │
│   │  SearchBar  │  │  RecipeGrid  │  │ RecipeDetail  │  │
│   │ (typeahead) │  │(infinite     │  │    Modal      │  │
│   └──────┬──────┘  │  scroll)     │  └───────────────┘  │
│          │         └──────────────┘                       │
└──────────┼────────────────────────────────────────────────┘
           │  HTTP (Vite proxy in dev / direct in prod)
┌──────────▼────────────────────────────────────────────────┐
│                   EXPRESS REST API                        │
│                   Node.js · ES Modules                    │
│                                                           │
│   GET  /api/recipes          ← paginated all recipes      │
│   GET  /api/recipes/search   ← smart hybrid search        │
│   GET  /api/recipes/suggestions ← typeahead               │
│   POST /api/recipes          ← create                     │
│   PUT  /api/recipes/:id      ← update                     │
│   DELETE /api/recipes/:id    ← delete                     │
│   GET  /api/health           ← health check               │
└──────────┬──────────────────────────┬─────────────────────┘
           │                          │
    ┌──────▼──────┐          ┌────────▼────────┐
    │  MongoDB    │          │  DummyJSON API  │
    │   Atlas     │          │ (external data) │
    │  (primary)  │          │  fetched only   │
    └─────────────┘          │  on cache miss  │
                             └─────────────────┘
```

---

## 🛠️ Tech Stack

### Backend
| Technology | Version | Purpose |
|-----------|---------|---------|
| **Node.js** | 20.x LTS | Runtime |
| **Express.js** | 4.x | REST API framework |
| **Mongoose** | 8.x | MongoDB ODM |
| **MongoDB Atlas** | Cloud | Database |
| **Axios** | 1.x | External API calls |
| **dotenv** | 16.x | Environment config |
| **cors** | 2.x | Cross-origin requests |

### Frontend
| Technology | Version | Purpose |
|-----------|---------|---------|
| **React** | 19 | UI framework |
| **Vite** | 8 | Build tool & dev server |
| **Tailwind CSS** | v4 | Utility-first styling |
| **Shadcn UI** | latest | Component primitives |
| **GSAP** | 3.x | Animations |
| **Axios** | 1.x | HTTP client |
| **Lucide React** | latest | Icon library |

### DevOps
| Technology | Purpose |
|-----------|---------|
| **GitHub Actions** | CI/CD pipeline |
| **Render.com** | Backend hosting |
| **Vercel** | Frontend hosting |
| **Dependabot** | Automated dependency updates |

---

## 📁 Project Structure

```
RecipeApp/
│
├── .github/
│   ├── workflows/
│   │   ├── ci.yml                 # 🔍 CI — runs on every push & PR
│   │   ├── cd-production.yml      # 🚀 CD — deploys main → Render + Vercel
│   │   ├── cd-staging.yml         # 🧪 CD — deploys develop → preview
│   │   └── security-audit.yml     # 🔐 Weekly security scans
│   └── dependabot.yml             # 🤖 Auto dependency updates
│
├── backend/
│   ├── models/
│   │   └── Recipe.js              # Mongoose schema & model
│   ├── routes/
│   │   └── recipes.js             # All API route handlers
│   ├── server.js                  # Express app entry point
│   ├── .env.example               # Environment variable template
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx          # Top navigation bar
│   │   │   ├── SearchBar.jsx       # Search input + portal dropdown
│   │   │   ├── RecipeGrid.jsx      # Masonry card grid with GSAP
│   │   │   ├── RecipeCard.jsx      # Individual recipe card
│   │   │   ├── RecipeModal.jsx     # Create / Edit form modal
│   │   │   ├── RecipeDetailModal.jsx # Full recipe viewer
│   │   │   └── ui/                 # Shadcn UI primitives
│   │   ├── hooks/
│   │   │   └── useRecipes.js       # Axios API hook
│   │   ├── lib/
│   │   │   └── utils.js            # cn() helper
│   │   ├── App.jsx                 # Root component + state management
│   │   ├── main.jsx                # React entry point
│   │   └── index.css              # Global styles + Tailwind directives
│   ├── .env.example
│   ├── vite.config.js
│   └── package.json
│
├── .gitignore
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v20+ → [nodejs.org](https://nodejs.org)
- **MongoDB Atlas** account → [mongodb.com/atlas](https://mongodb.com/atlas) *(free tier is fine)*
- **Git** → [git-scm.com](https://git-scm.com)

### 1 — Clone the Repository

```bash
git clone https://github.com/cusaldmsr/RecipeApp.git
cd RecipeApp
```

### 2 — Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create your environment file
cp .env.example .env
```

Edit `.env` with your values *(see [Environment Variables](#️-environment-variables) below)*:

```bash
# Start the development server
npm run dev
# → Backend running at http://localhost:5000
# → API available at http://localhost:5000/api/recipes
```

### 3 — Frontend Setup

Open a **new terminal**:

```bash
cd frontend

# Install dependencies
npm install

# Start the Vite dev server
npm run dev
# → Frontend running at http://localhost:5173
```

### 4 — Open the App

```
http://localhost:5173
```

> **Note:** The Vite dev server proxies all `/api/*` requests to `http://127.0.0.1:5000` automatically. Both servers must be running.

---

## ⚙️ Environment Variables

### Backend — `backend/.env`

```env
# MongoDB Atlas connection string
# Get it from: Atlas dashboard → Connect → Drivers → copy URI
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxxxxx.mongodb.net/recipeDB?retryWrites=true&w=majority&appName=Cluster0

# Express server port (default: 5000)
PORT=5000
```

### Frontend — `frontend/.env` *(only needed for production build)*

```env
# Your deployed backend URL — NOT needed for local dev (Vite proxy handles it)
VITE_API_BASE_URL=https://your-backend-url.onrender.com
```

> ⚠️ **Never commit real `.env` files.** Only `.env.example` files are tracked by git.

---

## 📡 API Reference

Base URL (local): `http://localhost:5000/api`

### Health Check

```http
GET /health
```
```json
{ "status": "OK", "message": "Recipe API is running 🍽️" }
```

---

### Get All Recipes *(paginated)*

```http
GET /recipes?page=1&limit=8
```

| Query Param | Type | Default | Description |
|-------------|------|---------|-------------|
| `page` | number | `1` | Page number |
| `limit` | number | `8` | Results per page (max 50) |

**Response:**
```json
{
  "source": "database",
  "recipes": [ { "...recipe objects..." } ],
  "total": 42,
  "page": 1,
  "totalPages": 6,
  "hasMore": true
}
```

---

### Smart Search

```http
GET /recipes/search?q=pasta
```

Runs a **parallel** query against local DB and DummyJSON API. Returns categorised results.

**Response:**
```json
{
  "dbRecipes":  [ { "...already saved recipes..." } ],
  "apiRecipes": [ { "...new results fetched from API..." } ],
  "total": 12
}
```

---

### Typeahead Suggestions

```http
GET /recipes/suggestions?q=pas
```

Returns up to 6 matching recipes from local DB for the dropdown (requires ≥ 2 chars).

**Response:**
```json
{
  "suggestions": [
    { "_id": "...", "name": "Pasta Carbonara", "image": "...", "source": "DummyJSON" }
  ]
}
```

---

### Create Recipe

```http
POST /recipes
Content-Type: application/json
```

```json
{
  "name": "Spaghetti Bolognese",
  "ingredients": ["500g mince", "1 onion", "2 garlic cloves", "400g canned tomatoes"],
  "instructions": ["Brown the mince.", "Add onion and garlic.", "Simmer with tomatoes."],
  "prepTimeMinutes": 10,
  "cookTimeMinutes": 30,
  "servings": 4,
  "image": "https://example.com/image.jpg"
}
```

**Response:** `201 Created` → saved recipe object.

---

### Update Recipe

```http
PUT /recipes/:id
Content-Type: application/json
```

Pass any fields to update. Returns updated recipe.

---

### Delete Recipe

```http
DELETE /recipes/:id
```

```json
{ "message": "Recipe deleted successfully.", "id": "..." }
```

---

## 🔄 Smart Caching Logic

This is the core intelligence of RecipeVault. On every search:

```
User searches "pasta"
       │
       ├─── 1. Query local MongoDB (fast, always)
       │         → dbRecipes  (already saved)
       │
       └─── 2. Query DummyJSON API (parallel, always)
                 │
                 ├── Filter: remove recipes already in DB (by external ID)
                 │         → only truly NEW results
                 │
                 ├── Upsert new results into MongoDB
                 │         (next search for "pasta" hits DB only)
                 │
                 └── Return new results as apiRecipes

Frontend displays:
  ┌───────────────────────────────────────────────────┐
  │  5 from your vault  ·  3 new from API             │
  │  [DB results first]    [API results after]         │
  └───────────────────────────────────────────────────┘
```

**Result:** The first search for any keyword is slightly slower (fetches from API). Every subsequent search for the same keyword is instant (served from MongoDB).

---

## 🔁 CI/CD Pipeline

Four GitHub Actions workflows run automatically:

```
Every push / PR to any branch
        │
        ▼
┌────────────────────────────────────────────────┐
│     🔍 ci.yml  (Continuous Integration)        │
│                                                │
│  backend-validate  ──┐                         │
│  backend-audit     ──┤                         │
│  backend-test      ──┼──► ✅ CI Quality Gate  │
│  frontend-build    ──┤        (blocks PR merge │
│  frontend-audit    ──┤         if any fail)    │
│  frontend-test     ──┘                         │
└─────────────────┬──────────────────────────────┘
                  │ CI passes on `main`
                  ▼
┌────────────────────────────────────────────────┐
│   🚀 cd-production.yml                         │
│                                                │
│   [Manual Approval Required]                   │
│   deploy-backend  → Render.com                 │
│   deploy-frontend → Vercel                     │
│   smoke-test      → health check endpoints     │
│   create-release  → GitHub Release + changelog │
└────────────────────────────────────────────────┘

CI passes on `develop`
        │
        ▼
┌────────────────────────────────────────────────┐
│   🧪 cd-staging.yml                            │
│                                                │
│   deploy-backend  → Render Staging service     │
│   deploy-frontend → Vercel Preview URL         │
│   PR comment      → posts preview URL on PR    │
└────────────────────────────────────────────────┘

Every Monday 08:00 UTC
        │
        ▼
┌────────────────────────────────────────────────┐
│   🔐 security-audit.yml                        │
│                                                │
│   audit-backend   → npm audit (JSON report)    │
│   audit-frontend  → npm audit (JSON report)    │
│   secret-scan     → detect committed .env files│
│   outdated-report → npm outdated for both      │
└────────────────────────────────────────────────┘
```

### Required GitHub Secrets

Go to **Settings → Secrets and variables → Actions** and add:

| Secret | Description |
|--------|-------------|
| `RENDER_BACKEND_DEPLOY_HOOK_URL` | Render deploy hook URL for the backend service |
| `RENDER_BACKEND_SERVICE_URL` | Your Render backend public URL |
| `VERCEL_TOKEN` | Vercel personal access token |
| `VERCEL_ORG_ID` | Vercel org/team ID |
| `VERCEL_PROJECT_ID` | Vercel project ID |
| `VITE_API_BASE_URL` | Production backend URL injected at build time |

> **CI works with zero secrets.** Secrets are only required to activate the CD (deploy) workflows.

---

## 🌿 Branching Strategy

```
main        ← production branch (protected, requires PR + CI pass)
  │
  └── develop ← staging branch (auto-deploys to preview)
        │
        ├── feature/recipe-ratings
        ├── fix/search-dropdown-zindex
        └── chore/update-dependencies
```

**Workflow:**
1. Create a feature branch from `develop`
2. Open a PR → CI runs automatically
3. Merge to `develop` → staging auto-deploys
4. Open PR from `develop` → `main` → manual approval → production deploys

---

## 🤝 Contributing

Contributions are welcome! Here's how:

```bash
# 1. Fork the repository on GitHub

# 2. Clone your fork
git clone https://github.com/<your-username>/RecipeApp.git
cd RecipeApp

# 3. Create a feature branch
git checkout -b feature/your-feature-name

# 4. Make your changes, then commit
git add .
git commit -m "feat: describe your change"

# 5. Push and open a Pull Request
git push origin feature/your-feature-name
```

### Commit Convention

This project follows [Conventional Commits](https://www.conventionalcommits.org/):

| Prefix | Use for |
|--------|---------|
| `feat:` | New features |
| `fix:` | Bug fixes |
| `ci:` | CI/CD changes |
| `chore:` | Maintenance, dependency updates |
| `docs:` | Documentation only |
| `refactor:` | Code restructuring |

### Adding Tests

**Backend (Jest):**
```bash
cd backend
npm install -D jest supertest
# Add tests to backend/tests/
```

**Frontend (Vitest):**
```bash
cd frontend
npm install -D vitest @testing-library/react @testing-library/jest-dom
# Add tests to frontend/src/__tests__/
```

---

## 📄 License

This project is licensed under the **MIT License**.

```
MIT License — Copyright (c) 2026 cusaldmsr

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software.
```

---

<div align="center">

Made with ❤️ using the MERN Stack

**[⬆ Back to top](#-recipevault)**

</div>
