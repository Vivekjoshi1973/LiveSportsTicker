import React from 'react';
import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';
import { useFavorites } from '../context/FavoritesContext';

const STATUS_LABELS = {
  live: 'LIVE',
  in_progress: 'LIVE',
  finished: 'FT',
  completed: 'FT',
  scheduled: 'SCHEDULED',
  upcoming: 'UPCOMING',
  postponed: 'POSTPONED',
  cancelled: 'CANCELLED',
};

const LiveScoreCard = React.memo(({ match, sport }) => {
  const { isFavorite, toggleFavorite } = useFavorites();

  const matchSlug = match._slug || (match.url?.includes('/match/') ? match.url.split('/match/')[1]?.replace(/\/+$/, '') : null) || 'unknown';
  const favorite = isFavorite(matchSlug);

  const homeTeam = match.home || 'Team 1';
  const awayTeam = match.away || 'Team 2';
  const homeScore = match.home_score ?? null;
  const awayScore = match.away_score ?? null;
  const status = match.status || 'scheduled';
  const statusText = match.status_text || '';
  const competition = match.competition || '';
  const isLive = status === 'live' || status === 'in_progress';
  const isFinished = status === 'finished' || status === 'completed';
  const hasScore = homeScore !== null && awayScore !== null && homeScore !== '-' && awayScore !== '-';

  const handleFavoriteClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite({
      id: matchSlug, sport, team1: homeTeam, team2: awayTeam,
      score1: homeScore, score2: awayScore, status,
    });
  };

  const formatTime = (time) => {
    if (!time) return '';
    return new Date(time).toLocaleString('en-IN', {
      hour: '2-digit', minute: '2-digit', hour12: true,
    });
  };

  const statusLabel = STATUS_LABELS[status] || status?.toUpperCase() || '';

  return (
    <Link
      to={`/match/${sport}/${encodeURIComponent(matchSlug)}`}
      className="match-card"
      aria-label={`${homeTeam} vs ${awayTeam}, ${statusLabel}`}
    >
      <div className="match-card-header">
        <div className="match-card-meta">
          {competition && <span className="match-competition">{competition}</span>}
        </div>
        <div className="match-card-actions">
          <span className={`match-status-badge ${isLive ? 'live' : isFinished ? 'finished' : 'scheduled'}`}>
            {statusLabel}
          </span>
          <button
            className={`favorite-btn ${favorite ? 'active' : ''}`}
            onClick={handleFavoriteClick}
            aria-label={favorite ? `Remove ${homeTeam} vs ${awayTeam} from favorites` : `Add ${homeTeam} vs ${awayTeam} to favorites`}
          >
            <Star fill={favorite ? 'currentColor' : 'none'} />
          </button>
        </div>
      </div>

      <div className="match-teams">
        <div className="match-team-row">
          {match.home_logo ? (
            <img src={match.home_logo} alt={`${homeTeam} logo`} className="team-logo" loading="lazy" />
          ) : (
            <div className="team-logo-placeholder" />
          )}
          <span className="team-name">{homeTeam}</span>
          {hasScore ? (
            <span className={`team-score ${isFinished && Number(homeScore) < Number(awayScore) ? 'loser' : ''}`}>
              {homeScore}
            </span>
          ) : isLive && statusText ? (
            <span className="team-score status-text">
              {statusText}
            </span>
          ) : null}
        </div>
        <div className="match-team-row">
          {match.away_logo ? (
            <img src={match.away_logo} alt={`${awayTeam} logo`} className="team-logo" loading="lazy" />
          ) : (
            <div className="team-logo-placeholder" />
          )}
          <span className="team-name">{awayTeam}</span>
          {hasScore ? (
            <span className={`team-score ${isFinished && Number(awayScore) < Number(homeScore) ? 'loser' : ''}`}>
              {awayScore}
            </span>
          ) : isLive && statusText ? (
            <span className="team-score status-text">
              {statusText}
            </span>
          ) : null}
        </div>
      </div>

      <div className="match-card-footer">
        {match.time && !hasScore && (
          <span className="match-time">{formatTime(match.time)}</span>
        )}
        {hasScore && isFinished && (
          <span className="match-time">Full Time</span>
        )}
        {isLive && statusText && !hasScore && (
          <span className="match-time">{statusText}</span>
        )}
        <span className="match-detail-link">Match Centre</span>
      </div>
    </Link>
  );
});

LiveScoreCard.displayName = 'LiveScoreCard';

export default LiveScoreCard;
