import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Star, Bell, Trophy } from 'lucide-react';
import useDebounce from '../hooks/useDebounce';

const SPORTS = ['All', 'football', 'cricket', 'basketball', 'tennis'];

const Navbar = ({ activeSport, onSportChange }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const debouncedSearch = useDebounce(searchQuery);

  const handleSearch = (e) => {
    e.preventDefault();
    if (debouncedSearch.trim()) {
      navigate(`/search?q=${encodeURIComponent(debouncedSearch.trim())}`);
    }
  };

  return (
    <nav className="navbar" aria-label="Main navigation">
      <div className="navbar-content">
        <Link to="/" className="navbar-brand">
          <img src="/LiveSportsTicker-Icon-512.png" alt="LiveSportsTicker" className="brand-logo" />
          <span className="brand-text">
            LiveSportsTicker
            <span className="brand-live">
              <span className="brand-live-dot" />
              LIVE
            </span>
          </span>
        </Link>

        <div className="sport-nav" role="tablist" aria-label="Sport filter">
          {SPORTS.map((sport) => (
            <button
              key={sport}
              role="tab"
              aria-selected={(activeSport || 'cricket') === sport}
              className={`sport-nav-item ${(activeSport || 'cricket') === sport ? 'active' : ''}`}
              onClick={() => onSportChange && onSportChange(sport)}
            >
              {sport.charAt(0).toUpperCase() + sport.slice(1)}
            </button>
          ))}
        </div>

        <div className="navbar-right">
          <form className="navbar-search" onSubmit={handleSearch} role="search">
            <Search className="search-icon" />
            <input
              type="text"
              className="search-input"
              placeholder="Search teams..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search teams"
            />
          </form>

          <Link to="/favorites" className="nav-icon-btn" title="Favorites" aria-label="Favorites">
            <Star />
          </Link>
          <Link to="/standings" className="nav-icon-btn" title="Standings" aria-label="Standings">
            <Trophy />
          </Link>
          <button className="nav-icon-btn" title="Notifications" aria-label="Notifications">
            <Bell />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
