# PROJECT CONTEXT — LiveSportsTicker

> This file contains everything an AI assistant needs to understand this project.
> Read this before making any changes.

---

## 1. WHAT THIS PROJECT IS

A **real-time multi-sport live scores tracker** built with React.js + Vite. Shows live scores for 6 sports: Cricket, Football, Basketball, Tennis, Badminton, Hockey. Kabaddi is listed but shows "Coming Soon" (no free API exists).

**Live URL:** https://live-sports-ticker.vercel.app/
**GitHub:** https://github.com/Vivekjoshi1973/LiveSportsTicker
**Author:** Vivekjoshi1973 (vivek.joshi2634@gmail.com)

---

## 2. TRIPLE API ARCHITECTURE

The app uses 3 different APIs. Each serves a different purpose:

| API | Base URL | Purpose |
|-----|----------|---------|
| SportScore | `https://sportscore.com` | Primary: football, cricket, basketball, tennis listing + logos + standings |
| Sofascore | `https://api.sofascore.com/api/v1` | Cricket detail: venue, toss, innings, run rates |
| TheSportsDB | `https://www.thesportsdb.com/api/v1/json/3` | Badminton (eventsday.php), Hockey (livescore.php) |

### How Each Sport Uses APIs

| Sport | Primary API | Secondary API | Notes |
|-------|------------|---------------|-------|
| Football | SportScore | — | Listing + standings |
| Cricket | SportScore + Sofascore | — | Parallel fetch, fuzzy team name matching merges data |
| Basketball | SportScore | — | Listing only, no standings |
| Tennis | SportScore | — | Listing only |
| Badminton | TheSportsDB | — | eventsday.php with today's date |
| Hockey | TheSportsDB | — | livescore.php |
| Kabaddi | None | — | Returns empty array, shows "Coming Soon" |

### Cricket Detail (Dual API)
Cricket is special — it fetches from BOTH SportScore and Sofascore simultaneously:
1. SportScore provides: team names, logos, basic scores, competition
2. Sofascore provides: venue, toss, detailed innings, run rates
3. They're merged using **fuzzy team name matching** (`matchTeams()` function)
4. If SportScore slug doesn't match any Sofascore event, the match stays as SportScore data
5. Sofascore-only matches (not in SportScore) are added to the list

---

## 3. CORS STRATEGY (CRITICAL)

### The Problem
In dev, Vite proxy bypasses CORS. In production on Vercel, there's no proxy.

### What We Tried (and Why It Failed)
1. **Vercel Rewrites** (`vercel.json`) — APIs returned 403 from Vercel's IPs
2. **Vercel Serverless Functions** (`api/proxy.js`) — APIs blocked Vercel server IPs (403)
3. **CORS proxy services** (corsproxy.io, allorigins.win) — returned 401/522, unreliable
4. **Direct browser calls** — WORKS because SportScore has `access-control-allow-origin: *`

### The Solution
```javascript
// src/api/sportsApi.js
const isDev = import.meta.env.DEV;

// Dev: Vite proxy (localhost:5173/sportscore → sportscore.com)
// Prod: Direct browser calls (CORS supported by SportScore)
const sportscoreClient = axios.create({
  baseURL: isDev ? '/sportscore' : 'https://sportscore.com',
});
```

### Key Insight
SportScore API has full CORS support (`access-control-allow-origin: *`). Always check API headers before building proxies.

---

## 4. FILE STRUCTURE

```
sports-tracker/
├── api/                          # (DELETED — was serverless functions, didn't work)
├── prerequisite/                 # Documentation for interview prep
│   ├── 01_PROJECT_BRIEF.md
│   ├── 02_FEATURES.md
│   ├── 03_PAGES.md
│   ├── 04_UI_UX_SPEC.md
│   ├── 05_DESIGN_SYSTEM.md
│   ├── 06_TECH_STACK.md
│   ├── 07_VIBE_CODING_PROMPT.md
│   └── 08_BUILD_WEBSITE.md
├── public/
│   ├── LiveSportsTicker-Icon-512.png   # App logo
│   ├── favicon.svg
│   ├── icons.svg
│   └── manifest.json              # PWA manifest
├── src/
│   ├── api/
│   │   └── sportsApi.js           # ALL API logic lives here (308 lines)
│   ├── assets/
│   │   ├── hero.png
│   │   ├── react.svg
│   │   └── vite.svg
│   ├── components/
│   │   ├── BottomNav.jsx          # Mobile fixed bottom nav
│   │   ├── ErrorBoundary.jsx      # Class component, catches render crashes
│   │   ├── LiveScoreCard.jsx      # Match card (React.memo)
│   │   ├── LiveTicker.jsx         # Auto-scrolling horizontal strip
│   │   ├── Navbar.jsx             # Dark navy bar, sport tabs, search
│   │   ├── Sidebar.jsx            # Desktop right column (trending + leagues)
│   │   ├── Skeleton.jsx           # Shimmer loading placeholders
│   │   └── SportSelector.jsx      # Horizontal pill filter bar
│   ├── context/
│   │   ├── FavoritesContext.jsx    # Add/remove/toggle favorites (localStorage)
│   │   └── ThemeContext.jsx        # Dark/light mode (localStorage)
│   ├── hooks/
│   │   ├── useDebounce.js         # 500ms debounce for search input
│   │   ├── useLiveScores.js       # 30s polling, AbortController
│   │   └── useLocalStorage.js     # Persistent key-value store
│   ├── pages/
│   │   ├── FavoritesPage.jsx      # Saved matches with live scores
│   │   ├── HomePage.jsx           # Main page (70/30 grid)
│   │   ├── MatchDetailPage.jsx    # Sport-specific scorecards
│   │   ├── SearchPage.jsx         # Multi-sport search
│   │   └── StandingsPage.jsx      # League tables (6 football leagues)
│   ├── styles/
│   │   └── global.css             # ALL styles (single file, ~800 lines)
│   ├── utils/
│   │   └── helpers.js             # getScoreColor, formatTime, etc.
│   ├── App.jsx                    # Root: ErrorBoundary, React.lazy, Routes
│   └── main.jsx                   # ReactDOM.createRoot
├── guide.md                       # 2164-line interview prep guide
├── index.html                     # Meta tags, OG, manifest link
├── package.json
├── README.md
├── vite.config.js                 # Vite proxy config for dev
└── .gitignore                     # Excludes guide.md and prerequisite/
```

---

## 5. API LAYER DETAILS (`sportsApi.js`)

### Axios Clients
```javascript
const sportscoreClient = axios.create({
  baseURL: isDev ? '/sportscore' : 'https://sportscore.com',
  timeout: 15000,
});
const sofascoreClient = axios.create({
  baseURL: isDev ? '/sofascore/api/v1' : 'https://api.sofascore.com/api/v1',
  timeout: 15000,
});
const thesportsdbClient = axios.create({
  baseURL: isDev ? '/thesportsdb/api/v1/json/3' : 'https://www.thesportsdb.com/api/v1/json/3',
  timeout: 15000,
});

// Auto-unwrap .data from all responses
[sportscoreClient, sofascoreClient, thesportsdbClient].forEach((client) => {
  client.interceptors.response.use(
    (response) => response.data,
    (error) => Promise.reject(error)
  );
});
```

### Key Functions (exported)
| Function | Purpose |
|----------|---------|
| `getLiveMatches(sport)` | Routes to correct API by sport name |
| `getMatchDetail(sport, slug)` | Detail view with Sofascore enrichment for cricket |
| `getStandings(sport, slug)` | League tables (football only) |
| `searchTeams(sport, query)` | Search across all sports |

### Internal Functions
| Function | Purpose |
|----------|---------|
| `getAllSportsMatches()` | Parallel fetch all 6 sports via `Promise.allSettled` |
| `getCricketMatches()` | Dual API: SportScore + Sofascore with fuzzy matching |
| `getBadmintonMatches()` | TheSportsDB eventsday.php |
| `getHockeyMatches()` | TheSportsDB livescore.php |
| `getCricketMatchDetail(slug)` | Sofascore first, fallback to SportScore |
| `findSofascoreMatch(slug)` | Searches live → next → last endpoints |
| `getTheSportsDBMatchDetail(sport, eventId)` | TheSportsDB event lookup |
| `formatCricketFromSportScore(match)` | Adapter for SportScore data |
| `formatCricketFromSofascore(event)` | Adapter for Sofascore data |
| `formatFromTheSportsDB(event, sport)` | Adapter for TheSportsDB data |
| `cleanSlug(slug)` | Strips URL prefixes from slugs |
| `matchTeams(slug, event)` | Fuzzy team name matching |

### SportScore API Endpoints Used
- `GET /api/widget/matches/?sport={sport}&limit=30` — match listings
- `GET /api/widget/match/?sport={sport}&slug={slug}` — single match detail
- `GET /api/widget/standings/?sport={sport}&slug={slug}` — league standings

### Sofascore API Endpoints Used
- `GET /sport/cricket/events/live` — live cricket events
- `GET /sport/cricket/events/next/0` — upcoming cricket
- `GET /sport/cricket/events/last/0` — recent cricket

### TheSportsDB API Endpoints Used
- `GET /eventsday.php?d={date}&s=Badminton` — badminton by date
- `GET /livescore.php?s=Ice Hockey` — hockey livescore
- `GET /lookupevent.php?i={eventId}` — single event detail

### SportScore Standings Slugs (Verified Working)
| Slug | League |
|------|--------|
| `english-premier-league` | EPL |
| `spanish-la-liga` | La Liga |
| `bundesliga` | Bundesliga |
| `italian-serie-a` | Serie A |
| `french-ligue-1` | Ligue 1 |
| `uefa-champions-league` | UCL |

**Note:** NBA/basketball slugs return 404 — SportScore has no basketball standings data.

---

## 6. DATA FLOW

```
User selects sport in SportSelector
  → HomePage calls getLiveMatches(sport)
  → sportsApi.js routes to correct API
  → Response intercepted (auto-unwrap .data)
  → Data normalized via format*() functions
  → HomePage filters: live, upcoming, results
  → LiveScoreCard renders each match
  → User clicks card → navigate(`/sport/match/slug`)
  → MatchDetailPage calls getMatchDetail(sport, slug)
  → For cricket: Sofascore detail with innings data
  → For others: SportScore detail
  → 30s polling via useLiveScores hook
  → Stops polling when match status is 'finished'
```

### Favorites Flow
```
User clicks star on LiveScoreCard
  → FavoritesContext.toggleFavorite(match)
  → Saved to localStorage as JSON array
  → FavoritesPage reads from context
  → Live scores polled every 30s
```

---

## 7. COMPONENT BEHAVIORS

### LiveScoreCard
- **React.memo** wrapped for performance
- Extracts slug from `match.url` when `_slug` is missing (fixes football/tennis/basketball linking)
- `hasScore` logic: treats `"-"` (string dash) as no real score, shows `statusText` instead
- `isLive` checks `'in_progress'` status (not `'inprogress'`)

### Navbar
- Sport tabs use **lowercase IDs**: `'football'`, `'cricket'`, etc.
- Display name: `.charAt(0).toUpperCase() + sport.slice(1)`
- Search input navigates to `/search?q=query`

### HomePage
- **All Sports** tab: fetches all 6 sports, only shows live matches (hides upcoming/results)
- Individual sports: shows live + upcoming + results sections
- `useMemo` for filter operations (live, upcoming, results)
- 70/30 grid layout (main + sidebar) on desktop

### MatchDetailPage
- 30s polling via `useLiveScores` hook
- Polling stops when match finishes (`status === 'finished'`)
- Share button uses Web Share API (native) with clipboard fallback
- Sport-specific rendering: cricket innings, football stats, etc.

### StandingsPage
- 6 football leagues only (SportScore has no basketball standings)
- Table columns: #, Team, P, W, D, L, GF, GA, GD, Pts
- Promotion/relegation colors via `promo_color`

---

## 8. STYLING

### Single CSS File
All styles are in `src/styles/global.css` (~800 lines).

### CSS Variables (Light Theme)
```css
--bg-primary: #f5f5f5
--bg-secondary: #ffffff
--text-primary: #1a1a1a
--text-secondary: #6b6b6b
--accent: #d32f2f
--success: #2e7d32
--border: #e0e0e0
```

### CSS Variables (Dark Theme)
```css
--bg-primary: #0d1117
--bg-secondary: #161b22
--text-primary: #e6edf3
--text-secondary: #8b949e
--accent: #f85149
--success: #3fb950
--border: #30363d
```

### Key CSS Classes
- `.match-card` — white card with border, hover effect
- `.match-status-badge` — colored status pill (LIVE=red, FT=green)
- `.team-score` — large bold score with tabular nums
- `.sport-selector` — horizontal pill bar
- `.live-ticker` — auto-scrolling strip below navbar
- `.standings-table` — league table with responsive wrapper
- `.skeleton` — shimmer loading animation
- `.error-container` — centered error message with retry button

---

## 9. PERFORMANCE OPTIMIZATIONS

1. **React.lazy** — all 5 pages code-split (6-13KB each)
2. **React.memo** — LiveScoreCard wrapped
3. **useMemo** — filter operations in HomePage
4. **AbortController** — cancels stale requests on sport switch
5. **Promise.allSettled** — parallel API calls with graceful degradation
6. **30s polling** — stops when match finishes
7. **Skeleton loading** — instant visual feedback

---

## 10. ACCESSIBILITY

- `role="tablist"` on sport selector and league tabs
- `role="tab"` on each tab button
- `aria-selected` on active tab
- `aria-label` on interactive elements
- `aria-live="polite"` on live score containers
- `loading="lazy"` on images
- Keyboard navigable

---

## 11. DEPLOYMENT

### Vercel (Production)
- Framework: Vite
- Build command: `npm run build`
- Output: `dist`
- No special config needed (no vercel.json)
- APIs called directly from browser (CORS supported)

### Vite Dev Server
- Runs at `http://localhost:5173`
- Proxy forwards `/sportscore`, `/sofascore`, `/thesportsdb` to respective APIs
- Must use `npm run dev` (not `npm run build` + preview)

---

## 12. KNOWN ISSUES & LIMITATIONS

1. **NBA standings** — SportScore API returns 404 for all basketball standings slugs
2. **Kabaddi** — No free API exists, shows "Coming Soon"
3. **Sofascore in production** — May block some requests (used only for cricket detail)
4. **TheSportsDB** — Free API key (3), limited data quality
5. **SportScore** — Returns `"-"` (string dash) for cricket scores it doesn't have

---

## 13. GIT HISTORY KEY COMMITS

| Commit | Description |
|--------|-------------|
| Initial | Scaffolded React + Vite project |
| API layer | Triple API integration with interceptors |
| UI redesign | Professional sports data platform aesthetic |
| CORS fix | Vite proxy + conditional baseURL |
| All Sports | `Promise.allSettled` parallel fetch |
| Slug fix | Extract slug from `match.url` when `_slug` missing |
| Production fix | Added interceptors to auto-unwrap `.data` |
| Standings fix | Corrected Bundesliga slug, removed NBA |

---

## 14. INTERVIEW PREPARATION

See `guide.md` (2164 lines) for:
- Complete code explanations (every file, every function)
- 50+ interview Q&A
- Resume bullet points
- Architecture diagrams
- CSS theming deep dive
- Performance optimization details

See `prerequisite/` folder for:
- Project brief, features, pages
- UI/UX spec, design system
- Tech stack documentation
- Vibe coding prompt
- Build instructions

---

## 15. RULES FOR AI ASSISTANTS

1. **No emojis** in code or comments
2. **No comments** unless explicitly asked
3. **Use Lucide React** icons (never inline SVGs or emoji)
4. **Use CSS variables** from `global.css` (never hardcoded hex)
5. **Use `className`** not inline styles (except data-driven values)
6. **Use `React.memo`** on list item components
7. **Use `useMemo`** for expensive filter/sort operations
8. **Use `AbortController`** for fetch requests
9. **Use `Promise.allSettled`** for parallel API calls
10. **Use `??`** not `||` for default values
11. **Check API slugs** before adding new leagues (some return 404)
12. **SportScore only supports football standings** (no basketball)
13. **Dev uses Vite proxy, Prod uses direct browser calls** — check `import.meta.env.DEV`
14. **Guide and prerequisite files are excluded from git** (.gitignore)

---

## 16. ENVIRONMENT VARIABLES

None. The app has no `.env` file. All configuration is hardcoded.

---

## 17. DEPENDENCIES

| Package | Version | Purpose |
|---------|---------|---------|
| react | 19.2.8 | UI framework |
| react-dom | 19.2.8 | DOM rendering |
| react-router-dom | 7.18.3 | Client-side routing |
| axios | 1.20.0 | HTTP client |
| lucide-react | 1.45.0 | Icons |
| vite | 8.3.0 | Build tool |
| @vitejs/plugin-react | 6.1.1 | Vite React support |
| oxlint | 1.81.0 | Linting |

---

*Last updated: September 13, 2026*
*Project status: Production deployed on Vercel*
