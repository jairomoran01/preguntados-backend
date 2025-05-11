const Question = require('../models/Question');
const geminiService = require('../services/geminiService');

exports.getQuestionsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const MAX_TOTAL_QUESTIONS = 5;
    const MAX_GENERATION_ATTEMPTS = 20; // Aumentar intentos
    const generatedQuestions = [];
    let totalAttempts = 0;
    let successfulGenerations = 0;

    // Primero intentamos obtener preguntas existentes de la base de datos
    const existingQuestions = await Question.find({ category }).limit(MAX_TOTAL_QUESTIONS);
    if (existingQuestions.length > 0) {
      return res.json(existingQuestions);
    }

    // Si no hay preguntas en la base de datos, generamos nuevas
    while (successfulGenerations < MAX_TOTAL_QUESTIONS && totalAttempts < MAX_GENERATION_ATTEMPTS) {
      try {
        const generatedQuestionData = await geminiService.generateQuestions(category);
        totalAttempts++;

        if (generatedQuestionData && generatedQuestionData.question) {
          // Verificamos si la pregunta ya existe en la base de datos
          const existingQuestion = await Question.findOne({ 
            question: generatedQuestionData.question 
          });

          if (!existingQuestion) {
            // Guardamos la nueva pregunta en la base de datos
            const newQuestion = new Question({
              category,
              question: generatedQuestionData.question,
              options: generatedQuestionData.options,
              correctAnswer: generatedQuestionData.correctAnswer
            });
            await newQuestion.save();

            generatedQuestions.push(newQuestion);
            successfulGenerations++;
          }
        }
      } catch (error) {
        console.error(`Error generando pregunta (intento ${totalAttempts}):`, error);
        continue;
      }
    }

    res.json(generatedQuestions);
  } catch (error) {
    console.error('Error en getQuestionsByCategory:', error);
    res.status(500).json({ 
      message: 'Error al obtener las preguntas', 
      error: error.message 
    });
  }
};
exports.createQuestion = async (req, res) => {
  try {
    const { question, options, correctAnswer, category } = req.body;
    const newQuestion = new Question({
      question,
      options,
      correctAnswer,
      category
    });

    await newQuestion.save();
    res.status(201).json(newQuestion);
  } catch (error) {
    res.status(400).json({ message: 'Error al crear la pregunta', error: error.message });
  }
};
