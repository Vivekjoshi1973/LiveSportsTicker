import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { lazy, Suspense, useState, useEffect } from 'react';
import { FavoritesProvider } from './context/FavoritesContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import LiveTicker from './components/LiveTicker';
import BottomNav from './components/BottomNav';
import ErrorBoundary from './components/ErrorBoundary';
import Skeleton from './components/Skeleton';
import './styles/global.css';

const HomePage = lazy(() => import('./pages/HomePage'));
const MatchDetailPage = lazy(() => import('./pages/MatchDetailPage'));
const FavoritesPage = lazy(() => import('./pages/FavoritesPage'));
const SearchPage = lazy(() => import('./pages/SearchPage'));
const StandingsPage = lazy(() => import('./pages/StandingsPage'));

function OfflineBanner() {
  const [online, setOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (online) return null;
  return (
    <div className="offline-banner" role="alert">
      You are offline. Scores may not update.
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <FavoritesProvider>
        <Router>
          <ErrorBoundary>
            <div className="app">
              <OfflineBanner />
              <Navbar />
              <LiveTicker />
              <main className="main-content" id="main-content">
                <Suspense fallback={<Skeleton type="card" count={6} />}>
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/match/:sport/:matchId" element={<MatchDetailPage />} />
                    <Route path="/favorites" element={<FavoritesPage />} />
                    <Route path="/search" element={<SearchPage />} />
                    <Route path="/standings" element={<StandingsPage />} />
                  </Routes>
                </Suspense>
              </main>
              <BottomNav />
            </div>
          </ErrorBoundary>
        </Router>
      </FavoritesProvider>
    </ThemeProvider>
  );
}

export default App;
