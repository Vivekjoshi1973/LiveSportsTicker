import { Link } from 'react-router-dom';

const LEAGUES = [
  { name: 'Premier League', sport: 'football', slug: 'english-premier-league' },
  { name: 'Champions League', sport: 'football', slug: 'uefa-champions-league' },
  { name: 'La Liga', sport: 'football', slug: 'spanish-la-liga' },
  { name: 'IPL', sport: 'cricket', slug: 'ipl' },
  { name: 'NBA', sport: 'basketball', slug: 'nba' },
  { name: 'ATP Tour', sport: 'tennis', slug: 'atp-tour' },
  { name: 'Bundesliga', sport: 'football', slug: 'german-bundesliga' },
  { name: 'Serie A', sport: 'football', slug: 'italian-serie-a' },
];

const Sidebar = ({ liveMatches = [] }) => {
  const trending = liveMatches.slice(0, 5);

  return (
    <aside className="home-sidebar" aria-label="Sidebar">
      {trending.length > 0 && (
        <div className="sidebar-card">
          <div className="sidebar-card-title">Trending Now</div>
          {trending.map((match, i) => (
            <Link
              key={i}
              to={`/match/${match._sport || 'cricket'}/${encodeURIComponent(match._slug || '')}`}
              className="trending-item"
            >
              <span className="trending-teams">
                {match.home} vs {match.away}
              </span>
              <span className="trending-score">
                {match.home_score} - {match.away_score}
              </span>
            </Link>
          ))}
        </div>
      )}

      <div className="sidebar-card">
        <div className="sidebar-card-title">Top Leagues</div>
        {LEAGUES.map((league) => (
          <Link
            key={league.slug}
            to="/standings"
            className="sidebar-league-item"
          >
            <span className="sidebar-league-name">{league.name}</span>
            <span className="sidebar-league-sport">{league.sport}</span>
          </Link>
        ))}
      </div>
    </aside>
  );
};

export default Sidebar;
