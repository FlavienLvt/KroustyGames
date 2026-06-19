const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000'

export const fetchGames = async (section = '') => {
  const url = section 
    ? `${apiBaseUrl}/games?section=${section}` 
    : `${apiBaseUrl}/games`;

  const response = await fetch(url);
  if (!response.ok) throw new Error('Erreur lors du chargement des jeux');
  
  return response.json();
}