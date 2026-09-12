const SPORTS = [
  { id: 'All', label: 'All' },
  { id: 'cricket', label: 'Cricket' },
  { id: 'football', label: 'Football' },
  { id: 'basketball', label: 'Basketball' },
  { id: 'tennis', label: 'Tennis' },
  { id: 'badminton', label: 'Badminton' },
  { id: 'hockey', label: 'Hockey' },
  { id: 'kabaddi', label: 'Kabaddi' },
];

const SportSelector = ({ activeSport, onSportChange }) => {
  return (
    <div className="sport-filter" role="tablist" aria-label="Sport filter">
      {SPORTS.map((sport) => (
        <button
          key={sport.id}
          role="tab"
          aria-selected={activeSport === sport.id}
          className={`sport-filter-btn ${activeSport === sport.id ? 'active' : ''}`}
          onClick={() => onSportChange(sport.id)}
        >
          {sport.label}
        </button>
      ))}
    </div>
  );
};

export default SportSelector;
