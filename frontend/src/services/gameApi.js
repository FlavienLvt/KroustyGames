const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:3001'

export const fetchGames = async (section = '') => {
  const url = section
    ? `${apiBaseUrl}/api/games?section=${section}`
    : `${apiBaseUrl}/api/games`;

  const response = await fetch(url);
  if (!response.ok) throw new Error('Erreur lors du chargement des jeux');
  
  return response.json();
}