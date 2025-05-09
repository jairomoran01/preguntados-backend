const express = require('express');
const router = express.Router();
const questionController = require('../controllers/questionController');

router.get('/:category', questionController.getQuestionsByCategory);
router.post('/', questionController.createQuestion);

module.exports = router;