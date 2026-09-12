import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Coins, Star, BarChart3, Users, Activity, Share2 } from 'lucide-react';
import { getMatchDetail } from '../api/sportsApi';
import { useFavorites } from '../context/FavoritesContext';
import { formatMatchStatus, getScoreColor } from '../utils/helpers';
import Skeleton from '../components/Skeleton';

const CricketScorecard = ({ match }) => {
  if (!match?._cricket) return null;

  return (
    <div className="cricket-scorecard">
      {match.venue && (
        <div className="venue-info">
          <MapPin />
          <span>{match.venue.name}{match.venue.city ? `, ${match.venue.city}` : ''}{match.venue.country ? `, ${match.venue.country}` : ''}</span>
        </div>
      )}
      {match.toss && (
        <div className="toss-info">
          <Coins />
          <span>{match.toss.winner} won the toss and elected to {match.toss.decision}</span>
        </div>
      )}

      {match.homeInnings?.length > 0 && match.homeInnings.map((inn, i) => (
        <div key={`home-${i}`} className="innings-card">
          <div className="innings-header">
            <h3>{match.home} - {inn.label}</h3>
            <span className="innings-run-rate">RR: {inn.runRate}</span>
          </div>
          <div className="innings-score">
            <span className="big-score">{inn.score}/{inn.wickets}</span>
            <span className="overs">({inn.overs} ov)</span>
          </div>
        </div>
      ))}

      {match.awayInnings?.length > 0 && match.awayInnings.map((inn, i) => (
        <div key={`away-${i}`} className="innings-card">
          <div className="innings-header">
            <h3>{match.away} - {inn.label}</h3>
            <span className="innings-run-rate">RR: {inn.runRate}</span>
          </div>
          <div className="innings-score">
            <span className="big-score">{inn.score}/{inn.wickets}</span>
            <span className="overs">({inn.overs} ov)</span>
          </div>
        </div>
      ))}

      {match.currentPeriod && (
        <div className="current-status">
          <span className="status-label">Current:</span>
          <span className="status-value">{match.currentPeriod}</span>
        </div>
      )}
    </div>
  );
};

const TennisScorecard = ({ match }) => {
  if (!match) return null;
  const homeScore = parseInt(match.home_score) || 0;
  const awayScore = parseInt(match.away_score) || 0;
  const maxSets = Math.max(homeScore, awayScore, 3);

  return (
    <div className="tennis-scorecard">
      <div className="tennis-sets">
        <div className="set-row">
          <span className="player-name">{match.home}</span>
          <div className="sets">
            {[...Array(maxSets)].map((_, i) => (
              <span key={i} className={`set ${i < homeScore ? 'won' : ''}`}>{i < homeScore ? (i + 1) : '-'}</span>
            ))}
          </div>
        </div>
        <div className="set-row">
          <span className="player-name">{match.away}</span>
          <div className="sets">
            {[...Array(maxSets)].map((_, i) => (
              <span key={i} className={`set ${i < awayScore ? 'won' : ''}`}>{i < awayScore ? (i + 1) : '-'}</span>
            ))}
          </div>
        </div>
      </div>
      <div className="tennis-status">
        <span>{match.status_text || (match.status === 'finished' ? 'Match Ended' : 'In Progress')}</span>
      </div>
    </div>
  );
};

const BasketballScorecard = ({ match }) => {
  if (!match) return null;
  return (
    <div className="basketball-scorecard">
      <table className="quarter-table">
        <thead>
          <tr><th className="team-col">Team</th><th>Q1</th><th>Q2</th><th>Q3</th><th>Q4</th><th className="total-col">Final</th></tr>
        </thead>
        <tbody>
          <tr>
            <td className="team-col"><div className="team-cell">{match.home_logo && <img src={match.home_logo} alt="" className="team-logo-sm" />}{match.home}</div></td>
            <td>-</td><td>-</td><td>-</td><td>-</td>
            <td className="total-col">{match.home_score}</td>
          </tr>
          <tr>
            <td className="team-col"><div className="team-cell">{match.away_logo && <img src={match.away_logo} alt="" className="team-logo-sm" />}{match.away}</div></td>
            <td>-</td><td>-</td><td>-</td><td>-</td>
            <td className="total-col">{match.away_score}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

const FootballTimeline = ({ incidents }) => {
  if (!incidents?.length) return null;
  return (
    <div className="match-timeline">
      <h2><Activity /> Match Timeline</h2>
      <div className="timeline">
        {incidents.map((event, index) => (
          <div key={index} className={`timeline-event ${event.side}`}>
            <span className="event-time">{event.time}'</span>
            <span className="event-icon">
              {event.is_goal && '⚽'}
              {event.is_card && event.type === 'Yellow card' && '🟨'}
              {event.is_card && event.type === 'Red card' && '🟥'}
              {event.is_sub && '🔄'}
              {event.type === 'VAR' && '📺'}
              {!event.is_goal && !event.is_card && !event.is_sub && event.type !== 'VAR' && '•'}
            </span>
            <div className="event-details">
              <span className="event-type">{event.type}</span>
              <span className="event-player">{event.player}{event.is_sub && event.player_in && <span className="sub-detail"> ({event.player_in} ↔ {event.player_out})</span>}</span>
              {event.is_goal && event.home_score !== undefined && <span className="event-score">{event.home_score} - {event.away_score}</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const FootballLineups = ({ lineups, homeTeam, awayTeam }) => {
  if (!lineups) return null;
  return (
    <div className="match-lineups">
      <h2><Users /> Lineups</h2>
      {lineups.home_formation && <p className="formations">{homeTeam}: <strong>{lineups.home_formation}</strong> | {awayTeam}: <strong>{lineups.away_formation}</strong></p>}
      <div className="lineups-grid">
        <div className="lineup-team">
          <h3>{homeTeam}</h3>
          <p className="lineup-subtitle">Starting XI</p>
          <ul className="player-list">{lineups.home_xi?.map((p, i) => <li key={i} className="player-item"><span className="player-number">{p.number}</span><span className="player-name">{p.name}</span><span className="player-position">{p.position}</span>{p.captain && <span className="captain-badge">C</span>}</li>)}</ul>
          {lineups.home_subs?.length > 0 && <><p className="lineup-subtitle">Substitutes</p><ul className="player-list subs">{lineups.home_subs?.map((p, i) => <li key={i} className="player-item"><span className="player-number">{p.number}</span><span className="player-name">{p.name}</span><span className="player-position">{p.position}</span></li>)}</ul></>}
        </div>
        <div className="lineup-team">
          <h3>{awayTeam}</h3>
          <p className="lineup-subtitle">Starting XI</p>
          <ul className="player-list">{lineups.away_xi?.map((p, i) => <li key={i} className="player-item"><span className="player-number">{p.number}</span><span className="player-name">{p.name}</span><span className="player-position">{p.position}</span>{p.captain && <span className="captain-badge">C</span>}</li>)}</ul>
          {lineups.away_subs?.length > 0 && <><p className="lineup-subtitle">Substitutes</p><ul className="player-list subs">{lineups.away_subs?.map((p, i) => <li key={i} className="player-item"><span className="player-number">{p.number}</span><span className="player-name">{p.name}</span><span className="player-position">{p.position}</span></li>)}</ul></>}
        </div>
      </div>
    </div>
  );
};

const FootballStats = ({ stats }) => {
  if (!stats?.length) return null;
  return (
    <div className="match-stats">
      <h2><BarChart3 /> Match Statistics</h2>
      <div className="stats-bars">
        {stats.map((stat, index) => (
          <div key={index} className="stat-bar-item">
            <div className="stat-bar-labels">
              <span className="stat-home-value">{stat.home}{stat.suffix || ''}</span>
              <span className="stat-name">{stat.label}</span>
              <span className="stat-away-value">{stat.away}{stat.suffix || ''}</span>
            </div>
            <div className="stat-bar-track">
              <div className="stat-bar-home" style={{ width: `${stat.home_pct || 50}%` }}></div>
              <div className="stat-bar-away" style={{ width: `${stat.away_pct || 50}%` }}></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const MatchDetailPage = () => {
  const { sport, matchId } = useParams();
  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isFavorite, toggleFavorite } = useFavorites();
  const intervalRef = useRef(null);

  const fetchMatch = async (isPolling = false) => {
    try {
      if (!isPolling) setLoading(true);
      setError(null);
      const data = await getMatchDetail(sport, decodeURIComponent(matchId));
      setMatch(data);
      return data;
    } catch (err) {
      if (!isPolling) setError(err.message);
      return null;
    } finally {
      if (!isPolling) setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatch();

    intervalRef.current = setInterval(async () => {
      const data = await fetchMatch(true);
      if (data && (data.status === 'finished' || data.status === 'completed')) {
        clearInterval(intervalRef.current);
      }
    }, 30000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [sport, matchId]);

  if (loading) return <Skeleton type="detail" />;
  if (error) return <div className="error-container"><p className="error-message">⚠️ {error}</p><Link to="/" className="back-link">← Back to Home</Link></div>;
  if (!match) return <div className="empty-state"><p>Match not found</p><Link to="/" className="back-link"><ArrowLeft /> Back to Home</Link></div>;

  const homeTeam = match.home || 'Team 1';
  const awayTeam = match.away || 'Team 2';
  const homeScore = match.home_score ?? '-';
  const awayScore = match.away_score ?? '-';
  const status = match.status || 'scheduled';
  const favorite = isFavorite(matchId);
  const isCricket = match._cricket || sport === 'cricket';

  return (
    <div className="match-detail-page">
      <Link to="/" className="back-link"><ArrowLeft /> Back to Live Scores</Link>

      <div className="match-header">
        <div className="match-status-badge" style={{ backgroundColor: getScoreColor(status) }}>{formatMatchStatus(status)}</div>
        <h1 className="match-title">{homeTeam} vs {awayTeam}</h1>
        {match.time && <p className="match-info">{new Date(match.time).toLocaleString('en-IN')}</p>}
        {match.competition && <p className="match-venue">🏆 {match.competition}</p>}
      </div>

      <div className="score-display">
        <div className="score-team">
          {match.home_logo && <img src={match.home_logo} alt={`${homeTeam} logo`} className="team-logo-large" loading="lazy" />}
          <span className="team-name">{homeTeam}</span>
          <span className="team-score large">{homeScore}</span>
        </div>
        <span className="vs-divider">VS</span>
        <div className="score-team">
          {match.away_logo && <img src={match.away_logo} alt={`${awayTeam} logo`} className="team-logo-large" loading="lazy" />}
          <span className="team-name">{awayTeam}</span>
          <span className="team-score large">{awayScore}</span>
        </div>
      </div>

      <div className="match-actions-row">
        <button className={`favorite-btn-large ${favorite ? 'active' : ''}`} onClick={() => toggleFavorite({ id: matchId, sport, team1: homeTeam, team2: awayTeam, score1: homeScore, score2: awayScore, status })}>
          {favorite ? <><Star fill="currentColor" /> Favorited</> : <><Star /> Add to Favorites</>}
        </button>
        <button className="share-btn-large" onClick={() => {
          const text = `${homeTeam} ${homeScore} vs ${awayScore} ${awayTeam}`;
          if (navigator.share) {
            navigator.share({ title: 'LiveSportsTicker', text, url: window.location.href });
          } else {
            navigator.clipboard?.writeText(text);
          }
        }}>
          <Share2 /> Share
        </button>
      </div>

      {isCricket && <CricketScorecard match={match} />}
      {sport === 'tennis' && <TennisScorecard match={match} />}
      {sport === 'basketball' && <BasketballScorecard match={match} />}
      {sport === 'football' && <><FootballStats stats={match.stats} /><FootballLineups lineups={match.lineups} homeTeam={homeTeam} awayTeam={awayTeam} /><FootballTimeline incidents={match.incidents} /></>}

      <div className="attribution">
        Powered by {match._source === 'sofascore' ? <a href="https://www.sofascore.com/" target="_blank" rel="noopener noreferrer">Sofascore</a> : <a href="https://sportscore.com/" target="_blank" rel="noopener noreferrer">SportScore</a>}
      </div>
    </div>
  );
};

export default MatchDetailPage;
