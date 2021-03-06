const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Create schemas
const ScoreSchema = new Schema(
  {
    subject: String,
    code: String,
    teacher: String,
    value: {
      type: Number,
      min: [0, "Too low"],
      max: [5, "Too high"]
    }
  },
  { versionKey: false }
);

const RapSchema = new Schema(
  {
    year: Number,
    term: Number,
    week: Number,
    grade: Number,
    average: {
      type: Number,
      min: [0, "Too low"],
      max: [5, "Too high"]
    },
    scores: [ScoreSchema],
    checked: Boolean,
    change: Number
  },
  { versionKey: false }
);

const StudentSchema = new Schema(
  {
    name: String,
    username: {
      type: String,
      lowercase: true
    },
    gender: String,
    id: {
      type: Number,
      index: { unique: true }
    },
    access: Number,
    longTermAverage: Number,
    rap: [RapSchema]
  },
  { versionKey: false }
);

// Create model
const Student = mongoose.model("student", StudentSchema);

// Export to use in other files
module.exports = Student;
