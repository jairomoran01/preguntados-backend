const Question = require('../models/Question');
const geminiService = require('../services/geminiService');

exports.getQuestionsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    let questions = await Question.find({ category })
      .select('question options category correctAnswer')
      .limit(5);

    const questionTexts = new Set(questions.map(q => q.question));
    const newGeneratedQuestions = [];

    if (questions.length < 5) {
      const numQuestionsNeeded = 5 - questions.length;
      const MAX_GENERATION_ATTEMPTS_PER_QUESTION = 3;

      for (let i = 0; i < numQuestionsNeeded; i++) {
        let generatedQuestionData;
        let attempts = 0;
        let isUnique = false;

        do {
          generatedQuestionData = await geminiService.generateQuestions(category);
          attempts++;

          if (generatedQuestionData && generatedQuestionData.question && !questionTexts.has(generatedQuestionData.question)) {
            isUnique = true;
          } else if (!generatedQuestionData || !generatedQuestionData.question) {
            console.error('Gemini service returned invalid or no question data.');
            break;
          }

        } while (!isUnique && attempts < MAX_GENERATION_ATTEMPTS_PER_QUESTION);

        if (isUnique && generatedQuestionData) {
          const newQuestion = new Question({
            category,
            question: generatedQuestionData.question,
            options: generatedQuestionData.options,
            correctAnswer: generatedQuestionData.correctAnswer
          });
          await newQuestion.save();
          newGeneratedQuestions.push(newQuestion);
          questionTexts.add(newQuestion.question);
        } else if (generatedQuestionData && generatedQuestionData.question && questionTexts.has(generatedQuestionData.question)) {
          console.warn(`Could not generate a unique question for ${category} after ${attempts} attempts.`);
        }
      }
      questions = [...questions, ...newGeneratedQuestions];
    }

    let finalUniqueQuestions = questions.filter((q, index, self) =>
      index === self.findIndex((t) => t.question === q.question)
    );

    const shuffledQuestions = finalUniqueQuestions.sort(() => Math.random() - 0.5);
    
    res.json(shuffledQuestions.slice(0, 5));
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener las preguntas', error: error.message });
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
