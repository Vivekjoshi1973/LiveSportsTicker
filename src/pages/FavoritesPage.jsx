import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Star, ArrowLeft, X, Share2 } from 'lucide-react';
import { useFavorites } from '../context/FavoritesContext';
import { getMatchDetail } from '../api/sportsApi';
import { formatMatchStatus } from '../utils/helpers';

const FavoritesPage = () => {
  const { favorites, removeFavorite } = useFavorites();
  const [liveScores, setLiveScores] = useState({});

  useEffect(() => {
    if (favorites.length === 0) return;

    const fetchScores = async () => {
      const updates = {};
      await Promise.allSettled(
        favorites.map(async (fav) => {
          try {
            const detail = await getMatchDetail(fav.sport, fav.id);
            if (detail) {
              updates[fav.id] = {
                score1: detail.home_score ?? fav.score1,
                score2: detail.away_score ?? fav.score2,
                status: detail.status ?? fav.status,
              };
            }
          } catch {}
        })
      );
      setLiveScores((prev) => ({ ...prev, ...updates }));
    };

    fetchScores();
    const interval = setInterval(fetchScores, 30000);
    return () => clearInterval(interval);
  }, [favorites]);

  const handleShare = async (fav) => {
    const score = liveScores[fav.id] || fav;
    const text = `${fav.team1} ${score.score1 || '-'} vs ${score.score2 || '-'} ${fav.team2}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: 'LiveSportsTicker', text, url: window.location.origin + `/match/${fav.sport}/${encodeURIComponent(fav.id)}` });
      } catch {}
    } else {
      navigator.clipboard?.writeText(text);
    }
  };

  return (
    <div className="favorites-page">
      <div className="page-header">
        <h1 className="page-title">
          <Star /> My Favorites
        </h1>
      </div>

      {favorites.length === 0 ? (
        <div className="empty-state">
          <p>No favorites yet</p>
          <p className="empty-sub">Click the star on any match to add it here</p>
          <Link to="/" className="back-link"><ArrowLeft /> Browse Live Scores</Link>
        </div>
      ) : (
        <div className="favorites-list" aria-label="Favorite matches">
          {favorites.map((match) => {
            const live = liveScores[match.id] || {};
            const score1 = live.score1 ?? match.score1;
            const score2 = live.score2 ?? match.score2;
            const status = live.status ?? match.status;
            return (
              <div key={match.id} className="favorite-item">
                <Link to={`/match/${match.sport}/${encodeURIComponent(match.id)}`} className="favorite-content">
                  <div className="favorite-teams">
                    <span className="team-name">{match.team1}</span>
                    <span className="vs">vs</span>
                    <span className="team-name">{match.team2}</span>
                  </div>
                  <div className="favorite-scores">
                    <span className="score">{score1 || '-'}</span>
                    <span className="score">{score2 || '-'}</span>
                  </div>
                  <span className={`match-status-badge ${status === 'live' ? 'live' : 'finished'}`}>
                    {formatMatchStatus(status)}
                  </span>
                </Link>
                <div className="favorite-actions">
                  <button className="share-btn" onClick={() => handleShare(match)} aria-label="Share match">
                    <Share2 size={14} />
                  </button>
                  <button className="remove-btn" onClick={() => removeFavorite(match.id)} aria-label="Remove from favorites">
                    <X size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="attribution">
        Powered by <a href="https://sportscore.com/" target="_blank" rel="noopener noreferrer">SportScore</a>
      </div>
    </div>
  );
};

export default FavoritesPage;
