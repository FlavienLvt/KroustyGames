const gameService = require('../services/gameService');

async function getGames(req, res) {
  try {
    // Récupération de la section depuis l'URL (ex: /games?section=new)
    const { section, search } = req.query;
    const games = await gameService.listGames(section, search);
    
    res.status(200).json(games);
  } catch (error) {
    console.error('Erreur lors de la récupération des jeux:', error);
    res.status(500).json({ message: "Erreur interne du serveur" });
  }
}

async function getGameBySlug(req, res) {
  try {
    // Récupération du slug depuis les paramètres de l'URL (ex: /games/krousty-run)
    const { slug } = req.params;
    const game = await gameService.getGameBySlug(slug);
    
    if (!game) {
      return res.status(404).json({ message: "Jeu introuvable" });
    }
    
    res.status(200).json(game);
  } catch (error) {
    console.error('Erreur lors de la récupération du jeu:', error);
    res.status(500).json({ message: "Erreur interne du serveur" });
  }
}

async function getGamesBySection(req, res) {
  try {
    const { section } = req.params;
    const games = await gameService.listGames(section);
    
    res.status(200).json(games);
  } catch (error) {
    console.error('Erreur lors de la récupération des jeux par section:', error);
    res.status(500).json({ message: "Erreur interne du serveur" });
  }
}

module.exports = {
  getGames,
  getGameBySlug,
  getGamesBySection
};