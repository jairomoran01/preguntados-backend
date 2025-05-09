const Game = require('../models/Game');

exports.saveGame = async (req, res) => {
  try {
    const { playerName, category, score } = req.body;
    const game = new Game({
      playerName,
      category,
      score
    });

    await game.save();
    res.status(201).json(game);
  } catch (error) {
    res.status(400).json({ message: 'Error al guardar el juego', error: error.message });
  }
};

exports.getLeaderboard = async (req, res) => {
  try {
    const leaderboard = await Game.find()
      .sort({ score: -1, playedAt: -1 })
      .limit(10);
    
    res.json(leaderboard);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener la tabla de clasificación', error: error.message });
  }
};