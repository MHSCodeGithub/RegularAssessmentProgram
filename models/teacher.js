const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Create Scheme
const TeacherSchema = new Schema({
  name: {
    type: String,
    unique: true },
  username: String,
  access: Number,
  faculty: String
});

// Create model
const Teacher = mongoose.model('teacher', TeacherSchema);

// Export to use in other files
module.exports = Teacher;
