const mongoose = require('mongoose');
const { faker } = require('@faker-js/faker');
require('dotenv').config();
const dburl = process.env.DBURL

const answerSchema = new mongoose.Schema({
  text: String,
});

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

async function generateTestData(userID, numberOfSurveys) {
  try {
    await mongoose.connect(`${dburl}/TFG`, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    for (let i = 0; i < numberOfSurveys; i++) {
      const survey = new Survey({
        userID: userID,
        title: faker.lorem.sentence(),
        questions: generateQuestions(),
      });
      await survey.save();
    }

    console.log(`${numberOfSurveys} surveys have been created for userID: ${userID}`);
  } catch (error) {
    console.error('Error generating test data:', error);
  } finally {
    mongoose.connection.close();
  }
}

function generateQuestions() {
  const numberOfQuestions = faker.number.int({ min: 1, max: 10 });
  const questionTypes = ['text', 'multipleChoice', 'checkbox', 'linear'];

  const questions = [];
  for (let i = 0; i < numberOfQuestions; i++) {
    const type = questionTypes[faker.number.int({ min: 0, max: questionTypes.length - 1 })];
    questions.push({
      text: faker.lorem.sentence(),
      type: type,
      answers: generateAnswers(type),
      mandatory: faker.datatype.boolean(),
    });
  }
  return questions;
}

function generateAnswers(type) {
    if (type === 'text') {
      return [];
    }
  
    if (type === 'linear') {
      const start = faker.datatype.boolean() ? 0 : 1;
      const end = faker.number.int({ min: 5, max: 10 });
      return Array.from({ length: end - start + 1 }, (_, i) => ({ text: (start + i).toString() }));
    }
  
    const numberOfAnswers = faker.number.int({ min: 2, max: 5 });
    const answers = [];
    for (let i = 0; i < numberOfAnswers; i++) {
      answers.push({
        text: faker.lorem.words(),
      });
    }
    return answers;
  }

const userID = '6665b2f08ed4badf721a6af1';
const numberOfSurveys = 100; // Number of surveys to generate
generateTestData(userID, numberOfSurveys);
