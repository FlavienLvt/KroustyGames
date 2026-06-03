const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000'

export async function fetchGames() {
  const response = await fetch(`${apiBaseUrl}/api/games`)

  if (!response.ok) {
    throw new Error('Unable to load games')
  }

  return response.json()
}