import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import SportSelector from '../components/SportSelector';
import LiveScoreCard from '../components/LiveScoreCard';
import Sidebar from '../components/Sidebar';
import Skeleton from '../components/Skeleton';
import useLiveScores from '../hooks/useLiveScores';

const HomePage = () => {
  const [activeSport, setActiveSport] = useState('cricket');
  const { matches, loading, error, refetch } = useLiveScores(activeSport);

  const liveMatches = useMemo(
    () => matches.filter((m) => m.status === 'live' || m.status === 'in_progress'),
    [matches]
  );
  const upcomingMatches = useMemo(
    () => matches.filter((m) => m.status === 'scheduled' || m.status === 'upcoming'),
    [matches]
  );
  const recentResults = useMemo(
    () => matches.filter((m) => m.status === 'finished' || m.status === 'completed'),
    [matches]
  );

  const formatDate = (date) => {
    return date.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const today = new Date();
  const [selectedDate, setSelectedDate] = useState(today);

  const goBack = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    setSelectedDate(d);
  };

  const goForward = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    setSelectedDate(d);
  };

  const isToday = selectedDate.toDateString() === today.toDateString();
  const isAllSports = activeSport === 'All' || activeSport === 'all';

  return (
    <div className="home-page">
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">
            {isAllSports ? 'All Sports' : activeSport}
            {liveMatches.length > 0 && <span className="live-count">{liveMatches.length} live</span>}
          </h1>
        </div>
        <div className="date-nav" aria-label="Date navigation">
          <button className="date-nav-btn" onClick={goBack} aria-label="Previous day">
            <ChevronLeft />
          </button>
          <span className="date-current">{formatDate(selectedDate)}</span>
          <button className="date-nav-btn" onClick={goForward} aria-label="Next day">
            <ChevronRight />
          </button>
          {!isToday && (
            <button className="date-today" onClick={() => setSelectedDate(today)}>
              Today
            </button>
          )}
        </div>
      </div>

      <SportSelector activeSport={activeSport} onSportChange={setActiveSport} />

      <div className="home-layout">
        <div className="home-main">
          {loading ? (
            <Skeleton type="card" count={6} />
          ) : error ? (
            <div className="error-container">
              <p className="error-message">Unable to load live scores</p>
              <p className="empty-sub">Something went wrong while updating the scoreboard.</p>
              <button className="retry-btn" onClick={refetch}>
                Try Again
              </button>
            </div>
          ) : matches.length === 0 ? (
            <div className="empty-state">
              <p>{isAllSports ? 'No live matches across any sport' : 'No live matches right now'}</p>
              <p className="empty-sub">{isAllSports ? 'Check back when matches are in progress.' : 'There are no live events in this sport right now.'}</p>
            </div>
          ) : (
            <>
              <section aria-label="Live matches">
                <div className="section-header">
                  <span className="section-title">Live Now</span>
                  <span className="section-link">{liveMatches.length} matches</span>
                </div>
                <div className="matches-grid" aria-live="polite">
                  {liveMatches.map((match, index) => (
                    <LiveScoreCard key={match.url || match._slug || index} match={match} sport={match._sport || activeSport} />
                  ))}
                </div>
              </section>

              {!isAllSports && upcomingMatches.length > 0 && (
                <section aria-label="Upcoming matches" className="section-mt">
                  <div className="section-header">
                    <span className="section-title">Upcoming</span>
                  </div>
                  <div className="matches-grid">
                    {upcomingMatches.map((match, index) => (
                      <LiveScoreCard key={match.url || match._slug || index} match={match} sport={match._sport || activeSport} />
                    ))}
                  </div>
                </section>
              )}

              {!isAllSports && recentResults.length > 0 && (
                <section aria-label="Recent results" className="section-mt">
                  <div className="section-header">
                    <span className="section-title">Results</span>
                  </div>
                  <div className="matches-grid">
                    {recentResults.map((match, index) => (
                      <LiveScoreCard key={match.url || match._slug || index} match={match} sport={match._sport || activeSport} />
                    ))}
                  </div>
                </section>
              )}
            </>
          )}

          <div className="attribution">
            Powered by <a href="https://sportscore.com/" target="_blank" rel="noopener noreferrer">SportScore</a> & <a href="https://www.thesportsdb.com/" target="_blank" rel="noopener noreferrer">TheSportsDB</a>
          </div>
        </div>

        <Sidebar liveMatches={matches} />
      </div>
    </div>
  );
};

export default HomePage;
