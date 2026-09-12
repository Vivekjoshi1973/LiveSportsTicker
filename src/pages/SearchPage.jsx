import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, ArrowLeft } from 'lucide-react';
import { searchTeams } from '../api/sportsApi';
import LiveScoreCard from '../components/LiveScoreCard';
import Skeleton from '../components/Skeleton';

const SPORTS = ['cricket', 'football', 'tennis', 'basketball', 'badminton', 'hockey'];

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    let cancelled = false;
    const searchAll = async () => {
      setLoading(true);
      setError(null);
      setResults([]);
      try {
        const searches = SPORTS.map((sport) =>
          searchTeams(sport, query.trim()).then((data) => ({
            sport,
            matches: (data?.matches || []).map((m) => ({ ...m, _sport: sport })),
          }))
        );
        const allResults = await Promise.allSettled(searches);
        if (!cancelled) {
          const matches = allResults
            .filter((r) => r.status === 'fulfilled')
            .flatMap((r) => r.value.matches);
          setResults(matches);
        }
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    searchAll();
    return () => { cancelled = true; };
  }, [query]);

  return (
    <div className="home-page">
      <div className="page-header">
        <Link to="/" className="back-home-btn"><ArrowLeft /> Home</Link>
        <h1 className="page-title">
          <Search /> Search Results
        </h1>
        {query && (
          <span className="search-query-display">for &quot;{query}&quot;</span>
        )}
      </div>

      {!query.trim() ? (
        <div className="empty-state">
          <p>Search for teams across all sports</p>
          <p className="empty-sub">Type a team name in the search bar above</p>
        </div>
      ) : loading ? (
        <Skeleton type="card" count={6} />
      ) : error ? (
        <div className="error-container">
          <p className="error-message">{error}</p>
        </div>
      ) : results.length === 0 ? (
        <div className="empty-state">
          <p>No matches found for &quot;{query}&quot;</p>
          <p className="empty-sub">Try a different team name</p>
        </div>
      ) : (
        <div className="matches-grid" aria-live="polite">
          {results.map((match, index) => (
            <LiveScoreCard
              key={match.url || match._slug || index}
              match={match}
              sport={match._sport || 'cricket'}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchPage;
