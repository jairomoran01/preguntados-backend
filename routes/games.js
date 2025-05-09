const express = require('express');
const router = express.Router();
const gameController = require('../controllers/gameController');

router.post('/', gameController.saveGame);
router.get('/leaderboard', gameController.getLeaderboard);

module.exports = router;