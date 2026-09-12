import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Trophy, ArrowLeft } from 'lucide-react';
import { getStandings } from '../api/sportsApi';
import Skeleton from '../components/Skeleton';

const LEAGUES = [
  { sport: 'football', slug: 'english-premier-league', label: 'EPL' },
  { sport: 'football', slug: 'spanish-la-liga', label: 'La Liga' },
  { sport: 'football', slug: 'bundesliga', label: 'Bundesliga' },
  { sport: 'football', slug: 'italian-serie-a', label: 'Serie A' },
  { sport: 'football', slug: 'french-ligue-1', label: 'Ligue 1' },
  { sport: 'football', slug: 'uefa-champions-league', label: 'UCL' },
];

const StandingsPage = () => {
  const [activeLeague, setActiveLeague] = useState(LEAGUES[0]);
  const [standings, setStandings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStandings = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getStandings(activeLeague.sport, activeLeague.slug);
        setStandings(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchStandings();
  }, [activeLeague]);

  const table = standings?.tables?.[0];
  const rows = table?.rows || [];

  return (
    <div className="standings-page">
      <div className="page-header">
        <Link to="/" className="back-home-btn"><ArrowLeft /> Home</Link>
        <h1 className="page-title">
          <Trophy /> Standings
        </h1>
      </div>

      <div className="league-tabs">
        {LEAGUES.map((league) => (
          <button
            key={league.slug}
            className={`league-tab ${activeLeague.slug === league.slug ? 'active' : ''}`}
            onClick={() => setActiveLeague(league)}
          >
            {league.label}
          </button>
        ))}
      </div>

      {loading ? (
        <Skeleton type="table" count={1} />
      ) : error ? (
        <div className="error-container">
          <p className="error-message">⚠️ {error}</p>
          <button className="retry-btn" onClick={() => setActiveLeague({ ...activeLeague })}>
            Try Again
          </button>
        </div>
      ) : rows.length === 0 ? (
        <div className="empty-state">
          <span className="empty-emoji">📋</span>
          <p>No standings available</p>
        </div>
      ) : (
        <div className="standings-container">
          <div className="standings-header">
            {standings?.competition_logo && (
              <img src={standings.competition_logo} alt="" className="competition-logo" />
            )}
            <h2 className="competition-name">{standings?.competition || activeLeague.label}</h2>
          </div>

          <div className="table-wrapper">
            <table className="standings-table">
              <thead>
                <tr>
                  <th className="col-pos">#</th>
                  <th className="col-team">Team</th>
                  <th className="col-stat">P</th>
                  <th className="col-stat">W</th>
                  <th className="col-stat">D</th>
                  <th className="col-stat">L</th>
                  <th className="col-stat">GF</th>
                  <th className="col-stat">GA</th>
                  <th className="col-stat">GD</th>
                  <th className="col-pts">Pts</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.team_slug} className={row.promo_color ? 'highlighted' : ''}>
                    <td className="col-pos">
                      <span className="pos-badge" style={{ backgroundColor: row.promo_color || 'transparent' }}>
                        {row.pos}
                      </span>
                    </td>
                    <td className="col-team">
                      <div className="team-cell">
                        {row.team_logo && <img src={row.team_logo} alt="" className="team-logo-sm" />}
                        <span className="team-name-standings">{row.team}</span>
                      </div>
                    </td>
                    <td className="col-stat">{row.p}</td>
                    <td className="col-stat">{row.w}</td>
                    <td className="col-stat">{row.d}</td>
                    <td className="col-stat">{row.l}</td>
                    <td className="col-stat">{row.gf}</td>
                    <td className="col-stat">{row.ga}</td>
                    <td className="col-stat">{row.gd > 0 ? `+${row.gd}` : row.gd}</td>
                    <td className="col-pts">{row.pts}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {rows.some((r) => r.promo_name) && (
            <div className="standings-legend">
              {[...new Set(rows.filter((r) => r.promo_name).map((r) => r.promo_name))].map((name) => {
                const color = rows.find((r) => r.promo_name === name)?.promo_color;
                return (
                  <div key={name} className="legend-item">
                    <span className="legend-dot" style={{ backgroundColor: color }} />
                    <span>{name}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StandingsPage;
