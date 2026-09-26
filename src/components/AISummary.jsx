import { useState } from 'react';
import { BookOpen, Loader2, AlertCircle } from 'lucide-react';
import { generateMatchSummary } from '../api/geminiService';

const AISummary = ({ match }) => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [show, setShow] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    setShow(true);
    try {
      const text = await generateMatchSummary(match);
      if (text) setSummary(text);
      else setError('No response from AI');
    } catch (err) {
      setError(err.message || 'Failed to generate summary');
    } finally {
      setLoading(false);
    }
  };

  if (match.status !== 'finished') return null;

  return (
    <div className="ai-summary">
      <button className="summary-btn" onClick={handleGenerate} disabled={loading}>
        {loading ? <Loader2 size={16} className="spin" /> : <BookOpen size={16} />}
        {loading ? 'Generating...' : 'AI Match Summary'}
      </button>
      {error && <div className="summary-error"><AlertCircle size={14} /> {error}</div>}
      {summary && <div className="summary-text">{summary}</div>}
    </div>
  );
};

export default AISummary;
