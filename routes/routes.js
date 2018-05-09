const router = require('express').Router();
const Student = require('../models/student');
const Teacher = require('../models/teacher');

var year = 2018;
var term = 2;
var week = 5;

// Returns classes and student lists for a certain teacher
router.get('/teacher', (req, res) => {

  var teacher = req.query.name;
  let classes = [];

  // Build list of classes and students for this teacher
  // Loop through every student
  Student.find({}).then(function(users) {
    users.forEach(function(u) {
      // then loop through RAP period for each student
      u.rap.forEach(function(r) {
        // then through the individual subject scores for each student
        r.scores.forEach(function(s) {
          // if the teacher input matches the student's teacher
          if(s.teacher == teacher) {
            let classFound = false;
            // then loop through the class list for the teacher to see if the class is added yet
            classes.forEach(function(c) {
              // if the class already exists then push the student into the list
              if(c.code == s.code) {
                classFound = true;
                c.students.push({name: u.name, score: s.value});
                //console.log('Class already exists, adding ' + c.students[c.students.length-1]);
              }
            });
            // if the class was NOT found then push the class and student into the array
            if(!classFound) {
              let studentsArr = [{name: u.name, score: s.value}];
              classes.push({code: s.code, subject: s.subject, students: studentsArr});
              //console.log('-----New class added: ' + classes[classes.length-1].subject);
            }
          }
        });
      });
    });

    // Pass JSON string of Teacher's class data back to Client
    res.send(JSON.stringify(classes));
  });

});

// Returns a list of Teachers for the autocomplete
router.get('/autocomplete', (req, res) => {
  Teacher.find({}).then(function(users) {
    let teachers = [];
    users.forEach(function(u) {
      teachers.push(u.name);
    });
    //console.log(teachers);
    res.send(JSON.stringify(teachers));
  });
});

// Saves an individual RAP score for a certain student/class
router.post('/save', (req, res) => {

  var student = req.body.student;
  var classCode = req.body.classCode;
  var score = req.body.score;

  Student.findOne({ name: student }, function (err, user) {
    if (err) { console.log(err); }
    if (user) {
      //console.log("student="+student+"&classCode="+classCode+"&score="+score);
      user.rap.forEach(function(r) {
        //console.log(r);
        if(r.year == year && r.term == term && r.week == week) {
          r.scores.forEach(function(s) {
            if(s.code == classCode) {
              s.value = score;
              user.save().then((newUser) => {
                console.log('Updated score to ' + score + ' for ' + student);
                res.end();
              });
            }
          });
        }
      });
    }
  });
});

// Fills the RAP scores for a certain class with a single score
router.post('/fillRadios', (req, res) => {

  // Set parameters
  let classCode = req.body.classCode;
  let score = req.body.score;
  let students = req.body.students;
  console.log("Updating scores for " + classCode + " to " + score);

  // Loop through every student from class list
  Student.find({"$or":students}).then(function(users) {
    //console.log(users);
    users.forEach(function(u) {
      // then loop through RAP period for each student
      u.rap.forEach(function(r) {
        // then through the individual subject scores for each student
        r.scores.forEach(function(s) {
          // if the class code matches the code sent
          if(s.code == classCode) {
            s.value = score;
            u.save().then((stu) => {
              console.log("Score updated for " + u.name);
              // Score saved!
            });
          }
        });
      });
    });
  });
  res.end();
});

module.exports = router;
