import { useState } from 'react';
import { BookOpen, Loader2 } from 'lucide-react';
import { generateMatchSummary } from '../api/geminiService';

const AISummary = ({ match }) => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    const text = await generateMatchSummary(match);
    if (text) setSummary(text);
    setLoading(false);
    setShow(true);
  };

  if (match.status !== 'finished') return null;

  return (
    <div className="ai-summary">
      <button className="summary-btn" onClick={handleGenerate} disabled={loading}>
        {loading ? <Loader2 size={16} className="spin" /> : <BookOpen size={16} />}
        {loading ? 'Generating...' : 'AI Match Summary'}
      </button>
      {summary && <div className="summary-text">{summary}</div>}
    </div>
  );
};

export default AISummary;
