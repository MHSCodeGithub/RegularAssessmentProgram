const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Create Scheme
const SubjectSchema = new Schema({
  name: String,
  code: String,
  faculty: String
});

// Create model
const Subject = mongoose.model('subject', SubjectSchema);

// Export to use in other files
module.exports = Subject;
