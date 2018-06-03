const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Create Scheme
const RapPeriodsSchema = new Schema({
  year: Number,
  term: Number,
  week: Number,
  current: Boolean,
  active: Boolean,
  average: Number
});

// Create model
const RapPeriods = mongoose.model('rapPeriods', RapPeriodsSchema);

// Export to use in other files
module.exports = RapPeriods;
