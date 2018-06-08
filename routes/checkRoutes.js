const router = require('express').Router();
const Student = require('../models/student');
const Teacher = require('../models/teacher');
const RapPeriods = require('../models/rapPeriods');
const FormData = require('form-data');
const csv = require("csvtojson");
const async = require('async');

// Check if logged in
const authCheck = (req, res, next) => {
  if(!req.session.user) {
    res.redirect('/login');
  } else {
    next();
  }
}

// Search for teacher on Check Teacher page
router.get('/teacher', authCheck, (req, res) => {
  res.render('checkTeacher', {user: req.session.user});
});

// Search for teacher on Check Teacher page
router.get('/faculty', authCheck, (req, res) => {
  res.render('checkFaculty', {user: req.session.user});
});

// Query a specific student
router.get('/single', authCheck, (req, res) => {
  if(req.query.name != null && req.session.user.access > 0) {
    console.log(req.session.user.name + " looked up scores for " + req.query.name);
    res.render('checkScores', {user: req.session.user, queryName: req.query.name});
  } else {
    res.render('checkScores', {user: req.session.user});
  }
});

// Query a specific class (render page)
router.get('/class', authCheck, (req, res) => {
  res.render('checkClass', {user: req.session.user});
});

// Query a specific class (get data)
router.get('/getClass', authCheck, (req, res) => {
  var classCode = req.query.code;
  console.log(req.session.user.name + " looked up scores for " + classCode);
  RapPeriods.findOne({ current: true }, function(err, currentPeriod) {
    Student.find({'rap.scores.code':classCode}).sort({name: 'ascending'}).then(function(users) {
      let students = [];
      users.forEach(function(u) {
        u.rap.forEach(function(r) {
          if(r.year == currentPeriod.year
          && r.term == currentPeriod.term
          && r.week == currentPeriod.week) {
            r.scores.forEach(function(s) {
              if(s.code == classCode) {
                students.push({name: u.name, grade: r.grade, longTermAverage: u.longTermAverage,
                  currentAverage: r.average, score: s.value, teacher: s.teacher, id: u.id });
              }
            });
          }
        });
      });
      students.sort((a, b) => b.score - a.score);
      res.send(JSON.stringify(students));
    });
  });
});

// Query a specific subject (render page)
router.get('/subject', authCheck, (req, res) => {
  res.render('checkSubject', {user: req.session.user});
});

// Query a specific subject (get data)
router.get('/getSubject', authCheck, (req, res) => {
  var subject = req.query.subject;
  console.log(req.session.user.name + " looked up scores for " + subject);
  RapPeriods.findOne({ current: true }, function(err, currentPeriod) {
    Student.find({'rap.scores.subject':subject}).sort({name: 'ascending'}).then(function(users) {
      let students = [];
      users.forEach(function(u) {
        u.rap.forEach(function(r) {
          if(r.year == currentPeriod.year
          && r.term == currentPeriod.term
          && r.week == currentPeriod.week) {
            r.scores.forEach(function(s) {
              if(s.subject == subject) {
                students.push({name: u.name, grade: r.grade, longTermAverage: u.longTermAverage,
                  currentAverage: r.average, score: s.value, teacher: s.teacher, code: s.code, id: u.id });
              }
            });
          }
        });
      });
      students.sort((a, b) => a.name - b.name);
      students.sort((a, b) => b.score - a.score);
      res.send(JSON.stringify(students));
    });
  });
});

// Query a specific year group (render page)
router.get('/year', authCheck, (req, res) => {
  res.render('checkYear', {user: req.session.user});
});

// Query a specific year group (get data)
router.get('/getYear', authCheck, (req, res) => {
  var year = req.query.year;
  RapPeriods.findOne({ current: true }, function(err, currentPeriod) {
    Student.find({}).then(function(users) {
      let students = [];
      users.forEach(function(u) {
        u.rap.forEach(function(r) {
          if(r.year == currentPeriod.year
          && r.term == currentPeriod.term
          && r.week == currentPeriod.week) {
            if(r.grade == year) {
              students.push({name: u.name, grade: r.grade, longTermAverage: u.longTermAverage, currentAverage: r.average });
            }
          }
        });
      });
      students.sort((a, b) => b.currentAverage - a.currentAverage);
      res.send(JSON.stringify(students));
    });
  });
});

// Query all students (render page and get data)
router.get('/all', authCheck, (req, res) => {
  RapPeriods.findOne({ current: true }, function(err, currentPeriod) {
    Student.find({}).then(function(users) {
      let students = [];
      users.forEach(function(u) {
        u.rap.forEach(function(r) {
          if(r.year == currentPeriod.year
          && r.term == currentPeriod.term
          && r.week == currentPeriod.week) {
            students.push({name: u.name, grade: r.grade, longTermAverage: u.longTermAverage, currentAverage: r.average });
          }
        });
      });
      students.sort((a, b) => b.currentAverage - a.currentAverage);
      res.render('checkAll', {user: req.session.user, students: students});
    });
  });
});

// Query all students (render page and get data)
router.get('/logins', authCheck, (req, res) => {
  RapPeriods.findOne({ current: true }, function(err, currentPeriod) {
    Student.find({}).then(function(users) {
      let students = [];
      users.forEach(function(u) {
        u.rap.forEach(function(r) {
          if(r.year == currentPeriod.year
          && r.term == currentPeriod.term
          && r.week == currentPeriod.week
          && r.checked == true) {
            students.push({name: u.name, grade: r.grade, longTermAverage: u.longTermAverage, currentAverage: r.average });
          }
        });
      });
      students.sort((a, b) => b.currentAverage - a.currentAverage);
      res.render('whoChecked', {user: req.session.user, students: students});
    });
  });
});

// Query change
router.get('/change', authCheck, (req, res) => {
  RapPeriods.findOne({ current: true }, function(err, currentPeriod) {
    Student.find({}).then(function(users) {
      let goodStudents = [];
      let badStudents = [];
      let students = {'goodStudents':goodStudents,'badStudents':badStudents};
      users.forEach(function(u) {
        u.rap.forEach(function(r) {
          if(r.year == currentPeriod.year
          && r.term == currentPeriod.term
          && r.week == currentPeriod.week
          && r.change !=null && r.change != 0) {
            if(r.change > 0) {
              students.goodStudents.push({name: u.name, grade: r.grade, longTermAverage: u.longTermAverage, currentAverage: r.average, change: r.change });
            } else {
              students.badStudents.push({name: u.name, grade: r.grade, longTermAverage: u.longTermAverage, currentAverage: r.average, change: r.change });
            }
          }
        });
      });
      students.goodStudents.sort((a, b) => b.change - a.change);
      students.badStudents.sort((a, b) => a.change - b.change);
      students.goodStudents = students.goodStudents.slice(0,50);
      students.badStudents = students.badStudents.slice(0,50);
      res.render('checkChange', {user: req.session.user, students: students});
    });
  });
});

// Query all students (render page and get data)
router.get('/fives', authCheck, (req, res) => {
  RapPeriods.findOne({ current: true }, function(err, currentPeriod) {
    Student.find({}).then(function(users) {
      let students = [];
      users.forEach(function(u) {
        u.rap.forEach(function(r) {
          if(r.year == currentPeriod.year
          && r.term == currentPeriod.term
          && r.week == currentPeriod.week) {
            if(r.average == 5) {
              students.push({name: u.name, grade: r.grade, longTermAverage: u.longTermAverage, currentAverage: r.average });
            }
          }
        });
      });
      res.render('checkFives', {user: req.session.user, students: students});
    });
  });
});

// Query all students (render page and get data)
router.get('/threes', authCheck, (req, res) => {
  RapPeriods.findOne({ current: true }, function(err, currentPeriod) {
    Student.find({}).then(function(users) {
      let students = [];
      users.forEach(function(u) {
        u.rap.forEach(function(r) {
          if(r.year == currentPeriod.year
          && r.term == currentPeriod.term
          && r.week == currentPeriod.week) {
            if(r.average < 3) {
              students.push({name: u.name, grade: r.grade, longTermAverage: u.longTermAverage, currentAverage: r.average });
            }
          }
        });
      });
      students.sort((a, b) => b.currentAverage - a.currentAverage);
      res.render('checkThrees', {user: req.session.user, students: students});
    });
  });
});

module.exports = router;
