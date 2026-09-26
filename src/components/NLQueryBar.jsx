import { useState } from 'react';
import { Search, Loader2, Sparkles } from 'lucide-react';
import { askNaturalQuestion } from '../api/geminiService';

const NLQueryBar = ({ sportsData }) => {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!question.trim()) return;
    setLoading(true);
    const text = await askNaturalQuestion(question, sportsData);
    if (text) setAnswer(text);
    setLoading(false);
  };

  return (
    <div className="nl-query">
      <form onSubmit={handleSubmit} className="nl-form">
        <Sparkles size={18} />
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask anything... e.g. How many goals has Player X scored?"
          className="nl-input"
        />
        <button type="submit" disabled={loading || !question.trim()}>
          {loading ? <Loader2 size={18} className="spin" /> : <Search size={18} />}
        </button>
      </form>
      {answer && <div className="nl-answer">{answer}</div>}
    </div>
  );
};

export default NLQueryBar;
