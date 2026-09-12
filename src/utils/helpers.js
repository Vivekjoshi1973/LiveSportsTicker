export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

export const formatTime = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatMatchStatus = (status) => {
  const statusMap = {
    live: 'LIVE',
    in_progress: 'LIVE',
    finished: 'FT',
    completed: 'FT',
    upcoming: 'UPCOMING',
    scheduled: 'SCHEDULED',
    cancelled: 'CANCELLED',
    abandoned: 'ABANDONED',
  };
  return statusMap[status?.toLowerCase()] || status?.toUpperCase() || '';
};

export const getScoreColor = (status) => {
  if (status === 'live' || status === 'in_progress') return 'var(--accent, #d32f2f)';
  if (status === 'finished' || status === 'completed') return 'var(--success, #2e7d32)';
  return 'var(--text-secondary, #6b6b6b)';
};
