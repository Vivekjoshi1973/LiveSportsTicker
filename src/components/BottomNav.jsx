import { Link, useLocation } from 'react-router-dom';
import { Home, Trophy, Search, Star } from 'lucide-react';

const NAV_ITEMS = [
  { path: '/', label: 'Home', icon: Home },
  { path: '/standings', label: 'Standings', icon: Trophy },
  { path: '/search', label: 'Search', icon: Search },
  { path: '/favorites', label: 'Favorites', icon: Star },
];

const BottomNav = () => {
  const location = useLocation();

  return (
    <nav className="bottom-nav" aria-label="Main navigation">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path;
        return (
          <Link
            key={item.path}
            to={item.path}
            className={`bottom-nav-item ${isActive ? 'active' : ''}`}
            aria-label={item.label}
            aria-current={isActive ? 'page' : undefined}
          >
            <Icon />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
};

export default BottomNav;
