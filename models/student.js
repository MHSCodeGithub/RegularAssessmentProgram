const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Create schemas
const ScoreSchema = new Schema({
  subject: String,
  code: String,
  teacher: String,
  value: {
    type: Number,
    min: [0, 'Too low'],
    max: [5, 'Too high']
  }
});

const RapSchema = new Schema({
  year: Number,
  term: Number,
  week: Number,
  grade: Number,
  average: {
    type: Number,
    min: [0, 'Too low'],
    max: [5, 'Too high']
  },
  scores: [ScoreSchema]
});

const StudentSchema = new Schema({
  name: String,
  username: String,
  gender: String,
  id: Number,
  access: Number,
  rap: [RapSchema]
});

// Create model
const Student = mongoose.model('student', StudentSchema);

// Export to use in other files
module.exports = Student;
