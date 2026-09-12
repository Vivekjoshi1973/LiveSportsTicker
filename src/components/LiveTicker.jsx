import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { getLiveMatches } from '../api/sportsApi';

const LiveTicker = () => {
  const [tickerMatches, setTickerMatches] = useState([]);
  const scrollRef = useRef(null);

  useEffect(() => {
    const fetchTicker = async () => {
      try {
        const sports = ['cricket', 'football', 'basketball', 'tennis'];
        const results = await Promise.allSettled(
          sports.map((sport) => getLiveMatches(sport).then((d) => ({ sport, matches: d?.matches || [] })))
        );
        const live = results
          .filter((r) => r.status === 'fulfilled')
          .flatMap((r) => r.value.matches.filter((m) => m.status === 'live' || m.status === 'in_progress').map((m) => ({ ...m, _sport: r.value.sport })))
          .slice(0, 12);
        setTickerMatches(live);
      } catch {}
    };
    fetchTicker();
    const interval = setInterval(fetchTicker, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!scrollRef.current || tickerMatches.length === 0) return;
    const el = scrollRef.current;
    let animId;
    let scrollPos = 0;

    const animate = () => {
      scrollPos += 0.5;
      if (scrollPos >= el.scrollWidth - el.clientWidth) {
        scrollPos = 0;
      }
      el.scrollLeft = scrollPos;
      animId = requestAnimationFrame(animate);
    };
    animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, [tickerMatches]);

  if (tickerMatches.length === 0) return null;

  return (
    <div className="live-ticker" aria-label="Live scores ticker" role="marquee">
      <div className="live-ticker-inner">
        <div className="ticker-label">
          <span className="ticker-label-dot" />
          LIVE
        </div>
        <div className="ticker-items" ref={scrollRef}>
          {tickerMatches.map((match, i) => (
            <Link
              key={i}
              to={`/match/${match._sport}/${encodeURIComponent(match._slug || '')}`}
              className="ticker-item"
            >
              <span className="ticker-sport">{match._sport}</span>
              <span className="ticker-teams">
                {match.home} vs {match.away}
              </span>
              <span className="ticker-score">
                {match.home_score} - {match.away_score}
              </span>
              {match.status_text && (
                <span className="ticker-status">{match.status_text}</span>
              )}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LiveTicker;
