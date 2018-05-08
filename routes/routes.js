const router = require('express').Router();
const Student = require('../models/student');

var year = 2018;
var term = 2;
var week = 5;

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
                c.students.push(u.name);
                //console.log('Class already exists, adding ' + c.students[c.students.length-1]);
              }
            });
            // if the class was NOT found then push the class and student into the array
            if(!classFound) {
              let studentsArr = [u.name];
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

router.get('/save', (req, res) => {

  var student = req.query.student;
  var classCode = req.query.classCode;
  var score = req.query.score;

  Student.findOne({ name: student }, function (err, user) {
    if (err) { return handleError(err); }
    if (user) {
      //console.log("student="+student+"&classCode="+classCode+"&score="+score);
      user.rap.forEach(function(r) {
        //console.log(r);
        if(r.year == year && r.term == term && r.week == week) {
          r.scores.forEach(function(s) {
            if(s.code == classCode) {
              s.value = score;
              user.save().then((newUser) => {
                //console.log('Updated score for ' + student);
                return "Score updated";
              });
            }
          });
        }
      });
    }
  });
});

router.get('/fillRadios', (req, res) => {

  var classCode = req.query.classCode;
  var score = req.query.score;

  // Loop through every student
  Student.find({}).then(function(users) {
    users.forEach(function(u) {
      // then loop through RAP period for each student
      u.rap.forEach(function(r) {
        // then through the individual subject scores for each student
        r.scores.forEach(function(s) {
          // if the class code matches the code sent
          if(s.code == classCode) {
            s.value = score;
            u.save().then((stu) => {
              // Score saved!
            });
          }
        });
      });
    });
  });
});

module.exports = router;
