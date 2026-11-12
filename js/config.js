// config.js
// All the words, names, colors, and answers live here.
// Edit this file to personalize the greeting card.

const config = {
  instructorName: "Ma'am",
  websiteTitle: "A Little Surprise for You, Ma'am! 💜",
  studentNames: ['Your Students'],
  sectionName: '',

  theme: {
    lavender: '#B9A7F5',
    pink: '#F8C8DC',
    cream: '#FFF9F2',
    purple: '#49376B'
  },

  // {name} is replaced with the instructor name
  greetingHeading: 'Thank You for Everything, {name}! 💜',
  greetingMessage:
    "Dear {name},\n\n" +
    "Thank you for your patience, dedication, understanding, and the knowledge you continuously share with us.\n\n" +
    "Your guidance has helped us grow not only as students but also as individuals.\n\n" +
    "We appreciate every lesson, every encouragement, and every effort you've made to help us succeed.\n\n" +
    "Thank you for being part of our journey and for inspiring us to keep learning.",

  // Challenge 1: word game (letters only)
  word: {
    clue: 'Someone who inspires, teaches, and helps students grow.',
    answer: 'TEACHER',
    hint: 'It starts with T and ends with R. You do this every day!'
  },

  // Challenge 5: secret words
  secret: {
    clue: "It's what your students want to say to you today.",
    answer: 'THANK YOU',
    hint: 'Two little words. The first is THANK.'
  },

  // Challenge 3: quiz. "correct" is the position of the right answer (starts at 0)
  quiz: [
    {
      question: 'What makes an amazing instructor?',
      answers: ['Patience', 'Dedication', 'Kindness', 'All of the above'],
      correct: 3
    },
    {
      question: 'What do students appreciate the most?',
      answers: ['Guidance', 'Encouragement', 'Understanding', 'All of the above'],
      correct: 3
    },
    {
      question: 'Who deserves appreciation today?',
      answers: ['Our instructor', 'Ma’am', 'The person reading this', 'All of the above'],
      correct: 3
    }
  ],

  // Shown one by one when "Open Another Surprise" is clicked
  surprises: [
    'Some lessons stay in our notebooks. Yours stay with us.',
    'You make a difference, even on the days you might not see it.',
    'Behind every confident student is someone who believed in them. Thank you for being that someone.'
  ]
};
