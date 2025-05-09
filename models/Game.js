//Esquema de juego
const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema({
  playerName: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  score: {
    type: Number,
    default: 0
  },
  playedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Game', gameSchema);
