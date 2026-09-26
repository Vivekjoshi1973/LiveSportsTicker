import { useState, useEffect } from 'react';
import { MessagesSquare } from 'lucide-react';
import { generateLiveCommentary } from '../api/geminiService';

const LiveCommentary = ({ match }) => {
  const [commentary, setCommentary] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!match || match.status !== 'live') return;
    const interval = setInterval(async () => {
      setLoading(true);
      const text = await generateLiveCommentary({
        home: match.home,
        away: match.away,
        home_score: match.home_score,
        away_score: match.away_score,
        status: match.status,
        status_text: match.status_text,
        competition: match.competition,
      });
      if (text) {
        setCommentary((prev) => [...prev.slice(-19), { text, time: new Date().toLocaleTimeString() }]);
      }
      setLoading(false);
    }, 60000);
    return () => clearInterval(interval);
  }, [match]);

  if (commentary.length === 0 && !loading) return null;

  return (
    <div className="commentary-feed">
      <div className="commentary-header">
        <MessagesSquare size={16} />
        <span>AI Commentary</span>
      </div>
      <div className="commentary-list">
        {commentary.map((c, i) => (
          <div key={i} className="commentary-item">
            <span className="commentary-time">{c.time}</span>
            <span className="commentary-text">{c.text}</span>
          </div>
        ))}
        {loading && <span className="commentary-typing">Thinking...</span>}
      </div>
    </div>
  );
};

export default LiveCommentary;
