import { createContext, useContext } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';

const FavoritesContext = createContext();

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};

export const FavoritesProvider = ({ children }) => {
  const [favorites, setFavorites] = useLocalStorage('sports-favorites', []);

  const addFavorite = (match) => {
    setFavorites((prev) => {
      if (prev.some((fav) => fav.id === match.id)) return prev;
      return [...prev, match];
    });
  };

  const removeFavorite = (matchId) => {
    setFavorites((prev) => prev.filter((fav) => fav.id !== matchId));
  };

  const isFavorite = (matchId) => {
    return favorites.some((fav) => fav.id === matchId);
  };

  const toggleFavorite = (match) => {
    if (isFavorite(match.id)) {
      removeFavorite(match.id);
    } else {
      addFavorite(match);
    }
  };

  return (
    <FavoritesContext.Provider
      value={{ favorites, addFavorite, removeFavorite, isFavorite, toggleFavorite }}
    >
      {children}
    </FavoritesContext.Provider>
  );
};

export default FavoritesContext;
