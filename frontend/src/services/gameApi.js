const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001'

export async function fetchGames() {
  try {
    console.log('Fetching from:', `${apiBaseUrl}/api/games`); // Debug
    const response = await fetch(`${apiBaseUrl}/api/games`)
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error:', response.status, errorText); // Debug
      throw new Error(`API Error: ${response.status} - ${errorText}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error('fetchGames error:', error);
    throw error;
  }
}