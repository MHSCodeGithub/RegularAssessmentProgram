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
},{ _id : false });

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
},{ _id : false });

const StudentSchema = new Schema({
  name: String,
  username: String,
  gender: String,
  id: Number,
  access: Number,
  longTermAverage: Number,
  rap: [RapSchema]
},{ _id : false });

// Create model
const Student = mongoose.model('student', StudentSchema);

// Export to use in other files
module.exports = Student;
