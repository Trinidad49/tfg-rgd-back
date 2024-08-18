const mongoose = require('mongoose');
const { faker } = require('@faker-js/faker');
require('dotenv').config();
const dburl = process.env.DBURL

const answerSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
  },
  answer: {
    type: mongoose.Schema.Types.Mixed,
  },
});

const surveyAnswerSchema = new mongoose.Schema({
  surveyID: {
    type: String,
    required: true,
  },
  answers: [answerSchema],
});

const SurveyAnswer = mongoose.model('answers', surveyAnswerSchema);

const questionSchema = new mongoose.Schema({
  text: String,
  type: {
    type: String,
    enum: ['text', 'multipleChoice', 'checkbox', 'linear'],
  },
  answers: [answerSchema],
  mandatory: Boolean,
});

const surveySchema = new mongoose.Schema({
  userID: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  questions: {
    type: [questionSchema],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Survey = mongoose.model('surveys', surveySchema);

async function generateAnswersForSurvey(surveyID, numberOfResponses) {
  try {
    await mongoose.connect(`${dburl}/TFG`, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    const survey = await Survey.findById(surveyID);
    if (!survey) {
      throw new Error('Survey not found');
    }

    for (let i = 0; i < numberOfResponses; i++) {
      const responses = survey.questions.map((question) => {
        const answerText = question.text;
        const answerValue = generateAnswer(question);
        return {
          text: answerText,
          answer: answerValue,
        };
      });

      const surveyAnswer = new SurveyAnswer({
        surveyID: surveyID,
        answers: responses,
      });

      await surveyAnswer.save();
    }

    console.log(`${numberOfResponses} responses have been generated for surveyID: ${surveyID}`);
  } catch (error) {
    console.error('Error generating answers for survey:', error);
  } finally {
    mongoose.connection.close();
  }
}

function generateAnswer(question) {
  const { type, answers } = question;

  switch (type) {
    case 'text':
      return faker.lorem.sentence();
    case 'multipleChoice':
    case 'checkbox':
      if (answers.length === 0) return '';
      const selectedAnswer = faker.helpers.arrayElement(answers).text;
      return type === 'checkbox' ? [selectedAnswer] : selectedAnswer;
    case 'linear':
      if (answers.length === 0) return '';
      return faker.helpers.arrayElement(answers.map((a) => a.text));
    default:
      return '';
  }
}

const surveyID = '666a09368ed4badf721b36df';
const numberOfResponses = 300; // Number of responses to generate
generateAnswersForSurvey(surveyID, numberOfResponses);
