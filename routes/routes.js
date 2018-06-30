const router = require('express').Router();
const mongoose = require('mongoose');
const fileUpload = require('express-fileupload');
const Student = require('../models/student');
const Teacher = require('../models/teacher');
const RapPeriods = require('../models/rapPeriods');
const FormData = require('form-data');
const schedule = require('node-schedule');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const csv = require("csvtojson");
var async = require('async');

// Batch job to update averages every 5 minutes
var updateJob = schedule.scheduleJob('*/5 * * * *', function(){
  updateAverages();
});

// loops through all students and updates their averages
function updateAverages() {
  try {
    RapPeriods.findOne({ active: true }, function(err, currentPeriod) {
      if(currentPeriod) {
        Student.find({
          $and: [
            { 'rap.year': currentPeriod.year },
            { 'rap.term': currentPeriod.term },
            { 'rap.week': currentPeriod.week }
          ]
        }).then(function(users) {
          var itemsProcessed = 0;
          var schoolTotal = 0;
          var schoolCount = 0;
          var year7total = 0;
          var year7count = 0;
          var year8total = 0;
          var year8count = 0;
          var year9total = 0;
          var year9count = 0;
          var year10total = 0;
          var year10count = 0;
          users.forEach(function(u, index, array) {
            let userTotal = 0;
            let userCount = 0;
            u.rap.forEach(function(r) {
              if(r.year == currentPeriod.year
              && r.term == currentPeriod.term
              && r.week == currentPeriod.week) {
                let rapTotal = 0;
                let rapCount = 0;
                r.scores.forEach(function(s) {
                  if(s.value > 0) {
                    rapTotal += s.value;
                    rapCount++;
                  }
                });
                if(rapTotal == 0 ) {
                  r.average = 0;
                } else {
                  if(rapCount > 0) {
                    r.average = Number(rapTotal/rapCount).toFixed("2");
                  }
                }
                if(r.average > 0) {
                  userTotal += r.average;
                  schoolTotal += r.average;
                  userCount++;
                  schoolCount++;
                  if(r.grade == 7) {
                    year7total += r.average;
                    year7count++;
                  } else if(r.grade == 8) {
                    year8total += r.average;
                    year8count++;
                  } else if(r.grade == 9) {
                    year9total += r.average;
                    year9count++;
                  } else if(r.grade == 10) {
                    year10total += r.average;
                    year10count++;
                  }
                  //console.log("Calc: " + schoolTotal + " / " + schoolCount + " = " + Number(schoolTotal / schoolCount).toFixed(2));
                }
              } else {
                // Add scores from other RAP periods to the user's long term average
                if(r.average > 0) {
                  userTotal += r.average;
                  userCount++;
                }
              }
            });
            if(userTotal == 0 ) {
              //console.log(u.name + " has a total of " + userTotal);
              u.longTermAverage = 0;
            } else {
              if(userCount > 0) {
                u.longTermAverage = Number(userTotal/userCount).toFixed(2);
              }
            }
            u.save().then((newUser) => {
              itemsProcessed++;
              if(itemsProcessed == array.length) {
                if(schoolCount > 0) {
                  if(schoolTotal > 0) {
                    currentPeriod.average = Number(schoolTotal / schoolCount).toFixed(2);
                    //console.log("Whole School: " + currentPeriod.average);
                  }
                  if(year7total > 0) {
                    currentPeriod.year7 = Number(year7total / year7count).toFixed(2);
                    //console.log("Year 7: " + currentPeriod.year7);
                  }
                  if(year8total > 0) {
                    currentPeriod.year8 = Number(year8total / year8count).toFixed(2);
                    //console.log("Year 8: " + currentPeriod.year8);
                  }
                  if(year9total > 0) {
                    currentPeriod.year9 = Number(year9total / year9count).toFixed(2);
                    //console.log("Year 9: " + currentPeriod.year9);
                  }
                  if(year10total > 0) {
                    currentPeriod.year10 = Number(year10total / year10count).toFixed(2);
                    //console.log("Year 10: " + currentPeriod.year10);
                  }
                }
                currentPeriod.save().then((newPeriod) => {
                  //console.log('All student average RAP scores recalculated successfully');
                  return true;
                });
              }
            });
          });
        });
      }
    });
  } catch (error) {
    console.log('An error occured while attempting to update averages:');
    console.log(error);
    return false;
  }
}

// Returns the current RAP Period
function getCurrentPeriod() {
  RapPeriods.findOne({ current: true }, function (err, period) {
      return period;
  });
}

// Check if logged in
const authCheck = (req, res, next) => {
  if(!req.session.user) {
    res.redirect('/login');
  } else {
    next();
  }
}

// Basic home route
router.get('/', authCheck, (req, res) => {
  if(req.session.user.access == 0) {
    res.render('studentHome', {user: req.session.user});
  } else {
    RapPeriods.findOne({ active: true }, function (err, period) {
        if(period) {
          res.render('teacherHome', {user: req.session.user});
        } else {
          RapPeriods.findOne({ current: true }, function (err, period2) {
            res.render('teacherHomeLocked', {user: req.session.user});
          });
        }
    });
  }
});

// Fix apostrophes
router.get('/namefix', authCheck, (req, res) => {
  Student.find({}).then(function(users) {
    users.forEach(function(user, index, array) {
      if(user.name.indexOf("`") > -1)
      {
        user.name = user.name.replace(/`/g, '\'');
        user.save();
        console.log("Updated " + user.name);
      }
    });
  });
});

// RAP Period administration
router.get('/rapPeriods', authCheck, (req, res) => {
  if(req.session.user.access < 2) {
    res.render('/', {user: req.session.user});
  } else {
    res.render('rapPeriods', {user: req.session.user});
  }
});

// Backup RAP Data
router.get('/backupRAP', authCheck, (req, res) => {
  res.render('backupRAP', {user: req.session.user});
});

// Insights
router.get('/insights', authCheck, (req, res) => {
  if(req.session.user.access == 0) {
    res.render('studentHome', {user: req.session.user});
  } else {
    res.render('insights', {user: req.session.user});
  }
});

// Generate Letters
router.get('/generateLetters', authCheck, (req, res) => {
  if(req.session.user.access < 2) {
    res.redirect('/');
  } else {
    res.render('generateLetters', {user: req.session.user});
  }
});

// Generate Posters
router.get('/generatePosters.pdf', authCheck, (req, res) => {
  if(req.session.user.access < 2) {
    res.redirect('/');
  } else {

      var year7 = "";
      var year8 = "";
      var year9 = "";
      var year10 = "";
      var count7 = 0;
      var count8 = 0;
      var count9 = 0;
      var count10 = 0;

      RapPeriods.findOne({ current: true }, function(err, currentPeriod) {
        Student.find({}).sort({name: 'ascending'}).then(function(users) {
          users.forEach(function(u) {
            u.rap.forEach(function(r) {
              if(r.year == currentPeriod.year
              && r.term == currentPeriod.term
              && r.week == currentPeriod.week) {
                if(r.grade == 7 && r.average >= 3) {
                  year7 += u.name + " (" + Number(r.average).toFixed(2) + ")\n";
                  count7++;
                } else if(r.grade == 8 && r.average >= 3) {
                  year8 += u.name + " (" + Number(r.average).toFixed(2) + ")\n";
                  count8++;
                } else if(r.grade == 9 && r.average >= 3) {
                  year9 += u.name + " (" + Number(r.average).toFixed(2) + ")\n";
                  count9++;
                } else if(r.grade == 10 && r.average >= 3) {
                  year10 += u.name + " (" + Number(r.average).toFixed(2) + ")\n";
                  count10++;
                }
              }
            });
          });

          var doc = new PDFDocument({
            layout: 'portrait',
            size: [842, 1191],
            margins: {
              top: 150,
              bottom: 50,
              left: 20,
              right: 20
            }
          });

          doc.pipe(res);

          doc.image('public/img/rap-poster.jpg', 0, 0);

          doc.fontSize(34)
            .font('Helvetica-Bold')
            .text("Year 7 - Term " + currentPeriod.term + " Week " + currentPeriod.week,
            {
              height: 100,
              width: 842,
              align: 'center',
              lineGap: 20,
            }
          );

          function calcLineGap(count) {
            //console.log(count);
            if(count > 126) {
              return 0;
            } else if(count > 118) {
              return 2;
            } else if(count > 110) {
              return 3;
            } else if(count > 96) {
              return 4;
            } else if(count > 90) {
              return 7;
            } else if(count > 85) {
              return 9;
            } else if(count > 80) {
              return 11;
            } else if(count > 70) {
              return 14;
            } else if(count > 60) {
              return 18;
            } else {
              return 24;
            }
          }

          doc.fontSize(16)
          .font('Helvetica')
            .text(year7, {
              columns: 3,
              columnGap: 5,
              height: 820,
              width: 802,
              align: 'center',
              lineGap: calcLineGap(count7)
            }
          );

          doc.addPage();

          doc.image('public/img/rap-poster.jpg', 0, 0);

          doc.fontSize(34)
            .font('Helvetica-Bold')
            .text("Year 8 - Term " + currentPeriod.term + " Week " + currentPeriod.week,
            {
              height: 100,
              width: 842,
              align: 'center',
              lineGap: 20,
            }
          );

          doc.fontSize(16)
          .font('Helvetica')
            .text(year8, {
              columns: 3,
              columnGap: 5,
              height: 820,
              width: 802,
              align: 'center',
              lineGap: calcLineGap(count8)
            }
          );

          doc.addPage();

          doc.image('public/img/rap-poster.jpg', 0, 0);

          doc.fontSize(34)
            .font('Helvetica-Bold')
            .text("Year 9 - Term " + currentPeriod.term + " Week " + currentPeriod.week,
            {
              height: 100,
              width: 842,
              align: 'center',
              lineGap: 20,
            }
          );

          doc.fontSize(16)
          .font('Helvetica')
            .text(year9, {
              columns: 3,
              columnGap: 5,
              height: 820,
              width: 802,
              align: 'center',
              lineGap: calcLineGap(count9)
            }
          );

          doc.addPage();

          doc.image('public/img/rap-poster.jpg', 0, 0);

          doc.fontSize(34)
            .font('Helvetica-Bold')
            .text("Year 10 - Term " + currentPeriod.term + " Week " + currentPeriod.week,
            {
              height: 100,
              width: 842,
              align: 'center',
              lineGap: 20,
            }
          );

          doc.fontSize(16)
          .font('Helvetica')
            .text(year10, {
              columns: 3,
              columnGap: 5,
              height: 820,
              width: 802,
              align: 'center',
              lineGap: calcLineGap(count10)
            }
          );

          doc.end();

        });
      });





  }
});

// Sets the current RAP Period
router.post('/setCurrentPeriod', (req, res) => {

  let year = req.body.year;
  let term = req.body.term;
  let week = req.body.week;
  let active = req.body.active;

  RapPeriods.find({}).then(function(periods) {
    let found = false;
    periods.forEach(function(p) {
      if(p.year == year && p.term == term && p.week == week) {
        found = true;
        p.current = true;
        p.save().then((period) => {
          console.log("Current RAP Period is now current: " + p.year + ", " + p.term + ", " + p.week + ", Active: " + p.active);
        });
      } else {
        p.current = false;
        p.save().then((period) => {
          //console.log("RAP Period no longer current: " + p.year + ", " + p.term + ", " + p.week);
        });
      }
    });
    if(!found) {
      let rp = new RapPeriods({
        year: year,
        term: term,
        week: week,
      });
      rp.save().then((period) => {
        console.log("New RAP period created: " + period.year + ", " + period.term + ", " + period.week);
        res.redirect("/rapPeriods");
      });
    } else {
      res.send("true");
    }
  });

});

// Sets the active RAP Period
router.post('/setActivePeriod', (req, res) => {

  let year = req.body.year;
  let term = req.body.term;
  let week = req.body.week;
  let active = req.body.active;

  RapPeriods.find({}).then(function(periods) {
    let found = false;
    periods.forEach(function(p) {
      if(p.year == year && p.term == term && p.week == week) {
        if(active == "true") {
          p.active = true;
        } else {
          p.active = false;
        }
        p.save().then((period) => {
          console.log("Current RAP Period is now current: " + p.year + ", " + p.term + ", " + p.week + ", Active: " + p.active);
          found = true;
        });
      } else {
        p.active = false;
        p.save();
      }
    });
    res.send("true");
  });
});

// Gets the current RAP Period
router.get('/getRapPeriods', (req, res) => {
  RapPeriods.find({}).sort({year: 'descending', term: 'descending', week: 'descending'}).then(function(periods) {
    res.send(JSON.stringify(periods));
  });
});

// Render 'Import From Edval' screen
router.get('/importEdval', authCheck, (req, res) => {
  res.render('importEdval', {user: req.session.user});
});

// Render 'Import From Old Data' screen
router.get('/importOld', authCheck, (req, res) => {
  res.render('importOld', {user: req.session.user});
});

// Rubric
router.get('/rubric', (req, res) => {
  res.render('rubric', {user: req.session.user});
});

// Render login screen
router.get('/login', (req,res) => {
  if(req.session.user != null) {
    res.redirect('/');
  } else {
    res.render('login');
  }
});

// Authenticate against Sentral server, redirect to home page
router.post('/login', (req, res) => {

  var username = req.body.username.toLowerCase();
  var password = req.body.password;

  Teacher.findOne({ username: username }, function (err, user) {
    if(user) {
      req.session.user = {'name':user.name, 'access':user.access, 'username':user.username};
      console.log("Teacher: " + user.name + " logged in");
      res.redirect('/');
    } else {
      Student.findOne({ username: username }, function (err, user) {
        if(user) {
          req.session.user = {'name':user.name, 'access':user.access, 'username':user.username};
          console.log("Student: " + user.name + " logged in");
          res.redirect('/');
        } else {
          res.render('login', {error: "Invalid username or password"});
        }
      });
    }
  });

  // try {
  //   var username = req.body.username.toLowerCase();
  // 	var password = req.body.password;
  //   var form = new FormData();
  //   form.append('username', username);
  //   form.append('password', password);
  //   form.submit('https://web2.mullumbimb-h.schools.nsw.edu.au/portal/login/login', function(err, response) {
  //     if(response.headers.location != "/portal/dashboard") {
  //       console.log(username + " was not able to log in via Sentral Student Portal");
  //       // try again with different portal for staff
  //       var form2 = new FormData();
  //       form2.append('sentral-username', username);
  //       form2.append('sentral-password', password);
  //       form2.submit('https://web2.mullumbimb-h.schools.nsw.edu.au/check_login', function(err2, response2) {
  //         if(response2.statusCode == 200) {
  //           console.log(username + " was not able to log in via Sentral Staff Portal");
  //           res.render('login', {error: "Invalid username or password"});
  //         } else {
  //           console.log("Logged in through Sentral Staff Portal");
  //           console.log("Checking to see if the user is a staff member...");
  //           Teacher.findOne({ username: username }, function (err, user) {
  //             if(user) {
  //               req.session.user = {'name':user.name, 'access':user.access, 'username':user.username};
  //               console.log(user.name + " logged in");
  //               res.redirect('/');
  //             } else {
  //               console.log("Checking to see if the user is a student...");
  //               Student.findOne({ username: username }, function (err, user) {
  //                 if(user) {
  //                   req.session.user = {'name':user.name, 'access':user.access, 'username':user.username};
  //                   console.log(user.name + " logged in");
  //                   res.redirect('/');
  //                 } else {
  //                   res.render('login', {error: "Invalid username or password"});
  //                 }
  //               });
  //             }
  //           });
  //         }
  //       });
  //     } else {
  //       // See if user is a teacher
  //       Teacher.findOne({ username: username }, function (err, user) {
  //         if(user) {
  //           req.session.user = {'name':user.name, 'access':user.access, 'username':user.username};
  //           console.log(user.name + " logged in");
  //           res.redirect('/');
  //         } else {
  //           // See if user is a student
  //           console.log("Checking to see if the user is a student...");
  //           Student.findOne({ username: username }, function (err, user) {
  //             if(user) {
  //               req.session.user = {'name':user.name, 'access':user.access, 'username':user.username};
  //               console.log(user.name + " logged in");
  //               res.redirect('/');
  //             } else {
  //               res.render('login', {error: "Invalid username or password"});
  //             }
  //           });
  //         }
  //       });
  //     }
  //   });
  // } catch (e) {
  //   res.render('login', {error: "Invalid username or password"});
  // }

});

// Auth logout
router.get('/logout', function(req, res){
  req.session = null;
	res.redirect('/login');
});

// Returns classes and student lists for a certain teacher
router.get('/teacher', (req, res) => {

  var teacher = req.query.name;
  let classes = [];

  // This function searches for all students with the current teacher in the current RAP period
  // It then loops through and builds a list of students for each of the teacher's classes
  RapPeriods.findOne({$or: [{ active: true}, { current: true }]}).sort({active: -1}).then(function(currentPeriod) {
    Student.find({
      $and: [
        { 'rap.scores.teacher': teacher },
        { 'rap.year': currentPeriod.year },
        { 'rap.term': currentPeriod.term },
        { 'rap.week': currentPeriod.week }
      ]
    }).sort({name: 'ascending'}).then(function(users) {
      users.forEach(function(u) {
        u.rap.forEach(function(r) {
          if(r.year == currentPeriod.year
          && r.term == currentPeriod.term
          && r.week == currentPeriod.week) {
            r.scores.forEach(function(s) {
              if(s.teacher == teacher) {
                let classFound = false;
                classes.forEach(function(c) { // see if the class is added yet
                  if(c.code == s.code) {
                    classFound = true;
                    c.students.push({name: u.name, score: s.value, id: u.id}); // if class exists push the student into the array
                  }
                });
                if(!classFound) { // if class NOT found then push the class and student into the array
                  let studentsArr = [{name: u.name, score: s.value, id: u.id}];
                  classes.push({code: s.code, subject: s.subject, students: studentsArr});
                }
              }
            });
          }
        });
      });
      res.send(JSON.stringify(classes)); // Pass JSON string of Teacher's class data back to Client
    });
  });
});

// Returns all details about a specific student
router.get('/student', (req, res) => {

  // Redirect invalid requests to this route
  if(req.query.name == null) {
    res.redirect('/');
    return null;
  }
  var student = req.query.name;

  Student.findOne({name: req.query.name}).then(function(stu) {
    if(req.session.user.name == req.query.name) {
      RapPeriods.findOne({ current: true }, function(err, currentPeriod) {
        stu.rap.forEach(function(r) {
          if(r.year == currentPeriod.year
          && r.term == currentPeriod.term
          && r.week == currentPeriod.week) {
            r.checked = true;
            stu.save().then((newStu) => {
              console.log(req.session.user.name + " checked their own scores");
            });
          }
        });
      });
    } else {
      console.log(req.session.user.name + " looked up scores for " + req.query.name);
    }
    res.send(JSON.stringify(stu));
  });

});

// Tracks how many students have checked their RAP scores in the current period
router.get('/trackChecked', (req, res) => {
  RapPeriods.findOne({ current: true }, function(err, currentPeriod) {
    Student.find({}).then(function(users) {
      var unchecked = 0;
      var checked = 0;
      let students = [];
      users.forEach(function(u) {
        u.rap.forEach(function(r) {
          if(r.year == currentPeriod.year
          && r.term == currentPeriod.term
          && r.week == currentPeriod.week) {
            if (r.checked == true) {
              checked++;
            } else {
              unchecked++;
            }
          }
        });
      });
      console.log({'unchecked':unchecked,'checked':checked});
      res.send(JSON.stringify({'unchecked':unchecked,'checked':checked}));
    });
  });
});

// Adds a missing student to a class
router.post('/addStudent', (req, res) => {

  var student = req.body.student;
  var classCode = req.body.classCode;
  var teacher = req.body.teacher;
  let subject = req.body.subject;

  RapPeriods.findOne({ active: true }, function(err, currentPeriod) {
    Student.findOne({
      $and: [
        { name: student },
        { 'rap.year': currentPeriod.year },
        { 'rap.term': currentPeriod.term },
        { 'rap.week': currentPeriod.week }
      ]
    }, function (err, user) {
      if (err) { console.log(err); }
      if (user) {
        user.rap.forEach(function(r) {
          if(r.year == currentPeriod.year
          && r.term == currentPeriod.term
          && r.week == currentPeriod.week) {
            let found = false;
            r.scores.forEach(function(s) {
              if(s.code == classCode) {
                found = true;
              }
            });
            if(found) {
              console.log(student + " already member of " + classCode);
              res.send(JSON.stringify(false));
            } else {
              r.scores.push({subject: subject, code: classCode, teacher: teacher, value: 0});
              user.save().then((stu) => {
                console.log(req.session.user.name + " added " + student + " to " + classCode);
                res.send(JSON.stringify(user));
              });
            }
          }
        });
      }
    });
  });
});

// Deletes a student from a class
router.post('/deleteStudent', (req, res) => {

  var student = req.body.student;
  var classCode = req.body.classCode;
  var teacherName = req.body.teacherName;
  console.log("Attempting to delete " + student);

  RapPeriods.findOne({ active: true }, function(err, currentPeriod) {
    Student.findOne({
      $and: [
        { name: student },
        { 'rap.year': currentPeriod.year },
        { 'rap.term': currentPeriod.term },
        { 'rap.week': currentPeriod.week }
      ]
    }, function (err, user) {
      if (err) { console.log("Error deleting student"); }
      if (user) {
        user.rap.forEach(function(r) {
          if(r.year == currentPeriod.year
          && r.term == currentPeriod.term
          && r.week == currentPeriod.week) {
            let found = false;
            r.scores.forEach(function(s) {
              // Ensure to only delete from class if teacher also matches
              if(s.code == classCode && s.teacher == teacherName) {
                found = true;
                r.scores.pull(s);
                user.save().then((stu) => {
                  console.log(req.session.user.name + " deleted " + student + " from " + classCode + " with teacher " + teacherName);
                  res.send(JSON.stringify(true));
                });
              }
            });
            if(!found) {
              console.log("Error Deleting Student");
              res.send(JSON.stringify(false));
            }
          }
        });
      }
    });
  });
});

// Deletes a student from a class
router.post('/deleteStudentFromPeriod', (req, res) => {

  var student = req.body.student;
  console.log("Attempting to delete " + student + " from active RAP period...");

  RapPeriods.findOne({ active: true }, function(err, currentPeriod) {
    Student.findOne({
      $and: [
        { id: student },
        { 'rap.year': currentPeriod.year },
        { 'rap.term': currentPeriod.term },
        { 'rap.week': currentPeriod.week }
      ]
    }, function (err, user) {
      if (err) { console.log("Error deleting student"); }
      if (user) {
        let found = false;
        user.rap.forEach(function(r) {
          if(r.year == currentPeriod.year
          && r.term == currentPeriod.term
          && r.week == currentPeriod.week) {
            user.rap.pull(r); // deletes entire RAP period from student's history
            found = true;
            user.save().then((stu) => {
              console.log(req.session.user.name + " deleted " + stu.name + " from active RAP Period.");
              res.send(JSON.stringify(true));
            });
          }
        });
        if(!found) {
          console.log("Error Deleting Student");
          res.send(JSON.stringify(false));
        }
      }
    });
  });
});

// Deletes a teacher from the system
router.post('/deleteTeacher', (req, res) => {
  var teacher = req.body.teacher;
  console.log("Attempting to delete " + teacher);
  Teacher.findOneAndRemove({ name: teacher }, function (err, user) {
    if (err) { console.log(err); }
    if (user) {
      console.log("Successfully Deleted " + teacher);
      res.send(JSON.stringify(true));
    } else {
      console.log("Error Deleting Teacher");
      res.send(JSON.stringify(false));
    }
  });
});

// Adds a teacher to the system
router.post('/addTeacher', (req, res) => {
  var teacher = req.body.teacher;
  Teacher.findOne({ name: teacher }, function (err, user) {
    if (err) { console.log(err); }
    if (user) {
      console.log("Error: " + teacher + " already exists");
      res.send(JSON.stringify(false));
    } else {
      let tch = new Teacher({
        name: teacher,
        access: 1
      });
      tch.save().then((stu) => {
        console.log(req.session.user.name + " successfuly added " + teacher + " to list");
        res.send(JSON.stringify(true));
      });
    }
  });
});

// Adds a missing class to a teacher
router.post('/addClass', (req, res) => {

  var classCode = req.body.classCode;
  var teacher = req.body.teacher;

  RapPeriods.findOne({ active: true }, function(err, currentPeriod) {
    Student.find({
      $and: [
        { 'rap.scores.code': classCode },
        { 'rap.year': currentPeriod.year },
        { 'rap.term': currentPeriod.term },
        { 'rap.week': currentPeriod.week }
      ]
    }, function (err, users) {
      if (err) { console.log("Error adding class"); }
      if (users) {
        let count = 0;
        users.forEach(function(u) {
          u.rap.forEach(function(r) {
            if(r.year == currentPeriod.year
            && r.term == currentPeriod.term
            && r.week == currentPeriod.week) {

              // Check to see if teacher already has subject
              let alreadyHasClass = false;
              r.scores.forEach(function(s) {
                if(s.code == classCode && s.teacher == teacher) {
                  alreadyHasClass = true;
                }
              });

              // If teacher not already on this class, then attempt to add them
              let found = false;
              let subject = "";
              if(!alreadyHasClass) {
                r.scores.forEach(function(s) {
                  // Lookup class code to ensure it exists
                  if(s.code == classCode) {
                    if(s.teacher == "No Teacher") {
                      // If the class exsists but there is no teacher
                      // Add the teacher and reset score to 0
                      s.teacher = teacher;
                      s.value = 0;
                      count++;
                    } else {
                      // Otherwise, duplicate the subject for the new teacher
                      found = true;
                      subject = s.subject;
                    }
                  }
                });
              }
              if(found) {
                r.scores.push({subject: subject, code: classCode, teacher: teacher, value: 0});
                count++;
              }
            }
          });
          u.save();
        });
        console.log(req.session.user.name + " added " + teacher + " to " + classCode + " for " + count + " students.");
        res.send(JSON.stringify(true));
      } else {
        // TODO: Add error message system
        res.send(JSON.stringify(false));
      }
    });
  });


});

// Removes a class from a teacher
router.post('/removeClass', (req, res) => {
  var classCode = req.body.classCode;
  var teacher = req.body.teacher;
  RapPeriods.findOne({ active: true }, function(err, currentPeriod) {
    Student.find({
      $and: [
        { 'rap.scores.code': classCode },
        { 'rap.year': currentPeriod.year },
        { 'rap.term': currentPeriod.term },
        { 'rap.week': currentPeriod.week }
      ]
    }, function (err, users) {
      if (err) { console.log(err); }
      if (users) {
        let count = 0;
        users.forEach(function(u) {
          u.rap.forEach(function(r) {
            if(r.year == currentPeriod.year
            && r.term == currentPeriod.term
            && r.week == currentPeriod.week) {

              // Check to see if another teacher has the class
              let hasOtherTeacher = false;
              r.scores.forEach(function(s) {
                if(s.code == classCode && s.teacher != teacher) {
                  hasOtherTeacher = true;
                }
              });

              // Remove teacher from class
              r.scores.forEach(function(s) {
                if(s.code == classCode && s.teacher == teacher) {
                  if(hasOtherTeacher) {
                    r.scores.pull(s);
                    count++;
                  } else {
                    s.teacher = "No Teacher";
                    s.value = 0;
                    count++;
                  }
                }
              });
            }
          });
          u.save();
        });
        console.log(req.session.user.name + " removed " + teacher + " from " + classCode + " for " + count + " students.");
        res.send(JSON.stringify(true));
      } else {
        res.send(JSON.stringify(false));
      }
    });
  });
});

// Updates a single teacher's username and access, returns true if successful
router.get('/updateTeacher', (req, res) => {

  console.log(req.query.name);

  // Redirect invalid requests to this route
  if(req.query.name == null) {
    return false;
  }
  var teacher = req.query.name;
  var username = req.query.username;
  var access = req.query.access;
  var faculty = req.query.faculty;

  // Loop through every student
  Teacher.findOne({ name: teacher }, function (err, user) {
    if (err) {
      return handleError(err);
      console.log("Error with query");
      return false;
      res.send(JSON.stringify({"result":false}));
    }
    if(user) {
      user.username = username;
      user.access = access;
      user.faculty = faculty;
      user.save().then((stu) => {
        console.log("Details updated for " + user.name);
        res.send(JSON.stringify({"result":true}));
      });
    } else {
      console.log(teacher + " not found");
      return false;
      res.send(JSON.stringify({"result":false}));
    }
  });

});

// Teacher dashboard page
router.get('/editTeachers', (req, res) => {
  res.render('editTeachers', {user: req.session.user, message: req.session.message});
});

// Reset scores to 0 for each student
router.get('/resetScores', authCheck, (req, res) => {
  res.render('resetScores', {user: req.session.user});
});

// Reset scores to 0 for each student
router.post('/resetScores', (req, res) => {
  let year = req.body.year;
	let term = req.body.term;
  let week = req.body.week;
  Student.find({}).then(function(users) {
    var itemsProcessed = 0;
    users.forEach(function(u, index, array) {
      Student.findOne({name: u.name}, function(err, stu){
        if(err){ console.log("Something went wrong when searching the data!"); }
        stu.rap.forEach(function(r) {
          if(r.year == year && r.term == term && r.week == week) {
            r.average = 0;
            r.scores.forEach(function(s) {
              s.value = 0;
            });
          }
        });
        stu.save().then((newUser) => {
          itemsProcessed++;
          console.log(itemsProcessed + " / " + array.length + " - Reset score for " + stu.name);
          if(itemsProcessed == array.length) {
            console.log('All student RAP scores reset to 0');
            req.flash('success_msg', 'All student RAP scores reset to 0');
            res.redirect('/resetScores');
            return null;
          }
        });
      });
    });
  });
});

// Re-calculate averages for each student
router.get('/updateAverages', authCheck, (req, res) => {
  res.render('updateAverages', {user: req.session.user});
});

// Re-calculate averages for each student
router.post('/updateAverages', (req, res) => {
  updateAverages();
  console.log('All students have been processed successfully');
  req.flash('success_msg', 'All student usernames been updated successfully');
  res.redirect('/updateAverages');
  return null;
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

// Returns a list of Students for the autocomplete
router.get('/autocompleteStudents', (req, res) => {
  Student.find({}).sort({name: 'ascending'}).then(function(users) {
    let students = [];
    users.forEach(function(u) {
      students.push(u.name);
    });
    res.send(JSON.stringify(students));
  });
});

// Returns a list of Students for the autocomplete
router.get('/autocompleteClasses', (req, res) => {
  RapPeriods.findOne({$or: [{ current: true}, { active: true }]}, function(err, currentPeriod) {
    Student.find({
      $and: [
        { 'rap.year': currentPeriod.year },
        { 'rap.term': currentPeriod.term },
        { 'rap.week': currentPeriod.week }
      ]
    }).then(function(users) {
      let classes = [];
      users.forEach(function(u) {
        u.rap.forEach(function(r) {
          r.scores.forEach(function(s) {
            classes.push(s.code);
          });
        });
      });
      let classesUnique = Array.from(new Set(classes));
      res.send(JSON.stringify(classesUnique));
      return null;
    });
  });
});

// Returns a list of Students for the autocomplete
router.get('/autocompleteSubjects', (req, res) => {
  RapPeriods.findOne({$or: [{ current: true}, { active: true }]}, function(err, currentPeriod) {
    Student.find({
      $and: [
        { 'rap.year': currentPeriod.year },
        { 'rap.term': currentPeriod.term },
        { 'rap.week': currentPeriod.week }
      ]
    }).then(function(users) {
      let subjects = [];
      users.forEach(function(u) {
        u.rap.forEach(function(r) {
          r.scores.forEach(function(s) {
            subjects.push(s.subject);
          });
        });
      });
      let subjectsUnique = Array.from(new Set(subjects));
      res.send(JSON.stringify(subjectsUnique));
      return null;
    });
  });
});

// Returns a list of Teachers including all details
router.get('/getTeachers', (req, res) => {
  Teacher.find({}).sort({name: 'ascending'}).then(function(users) {
    let teachers = [];
    users.forEach(function(u) {
      teachers.push({name: u.name, username: u.username,
        access: u.access, faculty: u.faculty});
    });
    //console.log(teachers);
    res.send(JSON.stringify(teachers));
  });
});

// Exports a list of Teachers including all details
router.get('/exportTeachers', (req, res) => {
  Teacher.find({}).then(function(users) {
    fs.writeFile("./downloads/teachers.json", JSON.stringify(users, null, 4), (err) => {
      if (err) {
        console.error(err);
        return false;
      } else {
        console.log("Teachers export file has been created");
        res.send(JSON.stringify(users, null, 4));
      }
    });
  });
});

// Exports a list of Teachers including all details
router.get('/exportRAP', (req, res) => {
  Student.find({}).then(function(users) {
    fs.writeFile("./downloads/students.json", JSON.stringify(users, null, 4), (err) => {
      if (err) {
        console.error(err);
        return false;
      } else {
        console.log("Students export file has been created");
        res.send(JSON.stringify(users, null, 4));
      }
    });
  });
});

// Saves an individual RAP score for a certain student/class
router.post('/save', (req, res) => {

  var student = req.body.student;
  var classCode = req.body.classCode;
  var score = req.body.score;
  var teacher = req.body.teacher;

  RapPeriods.findOne({ active: true }, function(err, currentPeriod) {
    Student.findOne({
      $and: [
        { name: student },
        { 'rap.year': currentPeriod.year },
        { 'rap.term': currentPeriod.term },
        { 'rap.week': currentPeriod.week }
      ]
    }, function (err, user) {
      if (err) { console.log(err); }
      if (user) {
        var success = false;
        user.rap.forEach(function(r) {
          if(r.year == currentPeriod.year
            && r.term == currentPeriod.term
            && r.week == currentPeriod.week) {
            r.scores.forEach(function(s) {
              if(s.code == classCode && s.teacher == teacher) {
                if(s.value == score) {
                  s.value = 0;
                  user.save().then((newUser) => {
                    console.log(req.session.user.name + ' unset score for ' + student + ' in ' + classCode + " with teacher " + teacher);
                    res.send(JSON.stringify(false));
                  });
                } else {
                  s.value = score;
                  user.save().then((newUser) => {
                    success = true;
                    console.log(req.session.user.name + ' updated score to ' + score + ' for ' + student + ' in ' + classCode + " with teacher " + teacher);
                    res.send(JSON.stringify(true));
                  });
                }
              }
            });
          }
        });
      }
    });
  });
});

// Show which students have no teacher assigned for a particular class
router.get('/showNoTeacher', (req, res) => {
  Student.find({"rap.scores.teacher":"No Teacher"}).then(function(users) {
    users.forEach(function(u) {
      u.rap.forEach(function(r) {
        r.scores.forEach(function(s) {
          if(s.teacher == "No Teacher") {
            console.log(u.name + " has no teacher for " + s.code);
          }
        });
      });
    });
    res.send(JSON.stringify(users));
  });
});

// Render page of classes/teachers not completed
router.get('/checkNotDone', (req, res) => {
  res.render('checkNotDone', {user: req.session.user});
});

// Show which classes have mostly zeroes
router.get('/showNoScores', (req, res) => {
  RapPeriods.findOne({ current: true }, function(err, currentPeriod) {
    Student.find().distinct('rap.scores.teacher', function(error, teachers) {
      let teacherArray = [];
      async.eachSeries(teachers, function(teacher, callback) {
        let classes = [];
        Student.find({
          $and: [
            { 'rap.scores.teacher': teacher },
            { 'rap.year': currentPeriod.year },
            { 'rap.term': currentPeriod.term },
            { 'rap.week': currentPeriod.week }
          ]
        }).sort({name: 'ascending'}).then(function(users) {
          users.forEach(function(u) {
            u.rap.forEach(function(r) {
              if(r.year == currentPeriod.year
              && r.term == currentPeriod.term
              && r.week == currentPeriod.week) {
                r.scores.forEach(function(s) {
                  if(s.teacher == teacher) {
                    let classFound = false;
                    classes.forEach(function(c) { // see if the class is added yet
                      if(c.code == s.code && c.teacher == s.teacher) {
                        classFound = true;
                        c.scores.push(s.value); // if class exists push the student into the array
                      }
                    });
                    if(!classFound) { // if class NOT found then push the class and student into the array
                      let scores = [s.value];
                      classes.push({"code": s.code, "teacher": s.teacher, "scores": scores});
                    }
                  }
                });
              }
            });
          });
          teacherArray.push(classes);
          callback();
        });
      }, function(err) {
        if( err ) {
          console.log('An error occurred: ' + err);
        } else {
          let classesNotDone = [];
          for (var i = 0; i < teacherArray.length; i++) {
            for (var j = 0; j < teacherArray[i].length; j++) {
              if(teacherArray[i][j].scores.reduce(function(acc, val) { return acc + val; }) == 0) {
                classesNotDone.push({"code":teacherArray[i][j].code, "teacher":teacherArray[i][j].teacher});
              }
            }
          }
          //console.log(classesNotDone);
          res.send(JSON.stringify(classesNotDone));
        }
      });
    });
  });
});

// Show which classes have no teacher
router.get('/showNoTeacher', (req, res) => {
  Student.find({"rap.scores.teacher":"No Teacher"}).then(function(users) {
    users.forEach(function(u) {
      u.rap.forEach(function(r) {
        r.scores.forEach(function(s) {
          if(s.teacher == "No Teacher") {
            console.log(u.name + " has no teacher for " + s.code);
          }
        });
      });
    });
    res.send(JSON.stringify(users));
  });
});

// Count individual score values
router.get('/countScores', (req, res) => {

    RapPeriods.findOne({current:true}).then(function(currentPeriod) {

      var data = {'current':new Array};

      Student.find({}).then(function(students) {

        var whole = [0,0,0,0,0];
        var year7 = [0,0,0,0,0];
        var year8 = [0,0,0,0,0];
        var year9 = [0,0,0,0,0];
        var year10 = [0,0,0,0,0];

        students.forEach(function(student) {
          // then loop through each RAP period to find the current one
          student.rap.forEach(function(r) {
            if(currentPeriod.year == r.year
            && currentPeriod.term == r.term
            && currentPeriod.week == r.week
            && r.average > 0) {
              r.scores.forEach(function(s) {
                if(s.value == 1) {
                  whole[0]++;
                  if(r.grade == 7) {
                    year7[0]++;
                  } else if(r.grade ==8) {
                    year8[0]++;
                  } else if(r.grade == 9) {
                    year9[0]++;
                  } else if(r.grade == 10) {
                    year10[0]++;
                  }
                }
                if(s.value == 2) {
                  whole[1]++;
                  if(r.grade == 7) {
                    year7[1]++;
                  } else if(r.grade ==8) {
                    year8[1]++;
                  } else if(r.grade == 9) {
                    year9[1]++;
                  } else if(r.grade == 10) {
                    year10[1]++;
                  }
                }
                if(s.value == 3) {
                  whole[2]++;
                  if(r.grade == 7) {
                    year7[2]++;
                  } else if(r.grade ==8) {
                    year8[2]++;
                  } else if(r.grade == 9) {
                    year9[2]++;
                  } else if(r.grade == 10) {
                    year10[2]++;
                  }
                }
                if(s.value == 4) {
                  whole[3]++;
                  if(r.grade == 7) {
                    year7[3]++;
                  } else if(r.grade ==8) {
                    year8[3]++;
                  } else if(r.grade == 9) {
                    year9[3]++;
                  } else if(r.grade == 10) {
                    year10[3]++;
                  }
                }
                if(s.value == 5) {
                  whole[4]++;
                  if(r.grade == 7) {
                    year7[4]++;
                  } else if(r.grade ==8) {
                    year8[4]++;
                  } else if(r.grade == 9) {
                    year9[4]++;
                  } else if(r.grade == 10) {
                    year10[4]++;
                  }
                }
              });
            }
          });
        });

        var counts = {'whole':whole, 'year7':year7, 'year8': year8, 'year9':year9, 'year10':year10};
        var totals = {'whole':whole, 'year7':year7, 'year8': year8, 'year9':year9, 'year10':year10};
        var percentages = {'whole':whole, 'year7':year7, 'year8': year8, 'year9':year9, 'year10':year10};
        var averages = {'whole':whole, 'year7':year7, 'year8': year8, 'year9':year9, 'year10':year10};

        totals.whole = whole[0] + whole[1] + whole[2] + whole[3] + whole[4];
        totals.year7 = year7[0] + year7[1] + year7[2] + year7[3] + year7[4];
        totals.year8 = year8[0] + year8[1] + year8[2] + year8[3] + year8[4];
        totals.year9 = year9[0] + year9[1] + year9[2] + year9[3] + year9[4];
        totals.year10 = year10[0] + year10[1] + year10[2] + year10[3] + year10[4];

        percentages.whole = [
          Number(whole[0] / totals.whole * 100).toFixed(2),
          Number(whole[1] / totals.whole * 100).toFixed(2),
          Number(whole[2] / totals.whole * 100).toFixed(2),
          Number(whole[3] / totals.whole * 100).toFixed(2),
          Number(whole[4] / totals.whole * 100).toFixed(2)
        ];

        percentages.year7 = [
          Number(year7[0] / totals.year7 * 100).toFixed(2),
          Number(year7[1] / totals.year7 * 100).toFixed(2),
          Number(year7[2] / totals.year7 * 100).toFixed(2),
          Number(year7[3] / totals.year7 * 100).toFixed(2),
          Number(year7[4] / totals.year7 * 100).toFixed(2)
        ];

        percentages.year8 = [
          Number(year8[0] / totals.year8 * 100).toFixed(2),
          Number(year8[1] / totals.year8 * 100).toFixed(2),
          Number(year8[2] / totals.year8 * 100).toFixed(2),
          Number(year8[3] / totals.year8 * 100).toFixed(2),
          Number(year8[4] / totals.year8 * 100).toFixed(2)
        ];

        percentages.year9 = [
          Number(year9[0] / totals.year9 * 100).toFixed(2),
          Number(year9[1] / totals.year9 * 100).toFixed(2),
          Number(year9[2] / totals.year9 * 100).toFixed(2),
          Number(year9[3] / totals.year9 * 100).toFixed(2),
          Number(year9[4] / totals.year9 * 100).toFixed(2)
        ];

        percentages.year10 = [
          Number(year10[0] / totals.year10 * 100).toFixed(2),
          Number(year10[1] / totals.year10 * 100).toFixed(2),
          Number(year10[2] / totals.year10 * 100).toFixed(2),
          Number(year10[3] / totals.year10 * 100).toFixed(2),
          Number(year10[4] / totals.year10 * 100).toFixed(2)
        ];

        averages.whole = Number((whole[0] + (whole[1] * 2) + (whole[2] * 3) + (whole[3] * 4) + (whole[4] * 5)) / totals.whole).toFixed("2");
        averages.year7 = Number((year7[0] + (year7[1] * 2) + (year7[2] * 3) + (year7[3] * 4) + (year7[4] * 5)) / totals.year7).toFixed("2");
        averages.year8 = Number((year8[0] + (year8[1] * 2) + (year8[2] * 3) + (year8[3] * 4) + (year8[4] * 5)) / totals.year8).toFixed("2");
        averages.year9 = Number((year9[0] + (year9[1] * 2) + (year9[2] * 3) + (year9[3] * 4) + (year9[4] * 5)) / totals.year9).toFixed("2");
        averages.year10 = Number((year10[0] + (year10[1] * 2) + (year10[2] * 3) + (year10[3] * 4) + (year10[4] * 5)) / totals.year10).toFixed("2");

        var data = {'counts':counts, 'totals':totals, 'percentages':percentages, 'averages':averages};

        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(data, null, 4));

      });
    });
});

// Get the whole-school average for either the current, or all RAP periods
router.get('/getWholeAverage', (req, res) => {
  var current = req.query.current;
  if(current == 'true') {
    RapPeriods.findOne({ current: true }, function(err, currentPeriod) {
      res.send(JSON.stringify(currentPeriod.average));
    });
  } else {
    RapPeriods.find({}).sort({year: 'ascending', term: 'ascending', week: 'ascending'}).then(function(allPeriods) {
      var averages = [];
      var periods = [];
      var data = {'periods':periods, 'averages':averages};
      allPeriods.forEach(function(currentPeriod) {
        if(currentPeriod.average > 0) {
          var string = "W" + currentPeriod.week + ",T" + currentPeriod.term + "," + String(currentPeriod.year).substring(2, 4);
          data.periods.push(string);
          data.averages.push(currentPeriod.average);
        }
      });
      res.send(JSON.stringify(data));
    });
  }
});

// Get the averages for each year group for either the current, or all RAP periods
router.get('/getGroupAverage', (req, res) => {
  var current = req.query.current;
  if(current == 'true') {
    RapPeriods.findOne({ current: true }, function(err, currentPeriod) {
      res.send(JSON.stringify({
        'year7':currentPeriod.year7,
        'year8':currentPeriod.year8,
        'year9':currentPeriod.year9,
        'year10':currentPeriod.year10
      }));
    });
  } else {

    RapPeriods.find({}).sort({year: 'ascending', term: 'ascending', week: 'ascending'}).then(function(allPeriods) {

      var year7 = {'periods':new Array, 'averages':new Array};
      var year8 = {'periods':new Array, 'averages':new Array};
      var year9 = {'periods':new Array, 'averages':new Array};
      var year10 = {'periods':new Array, 'averages':new Array};
      var data = {'year7':year7,'year8':year8,'year9':year9,'year10':year10};

      allPeriods.forEach(function(currentPeriod) {

        var string = "W" + currentPeriod.week + ",T" + currentPeriod.term + "," + String(currentPeriod.year).substring(2, 4);

        if(currentPeriod.year7 > 0) {
          data.year7.periods.push(string);
          data.year7.averages.push(currentPeriod.year7);
        } else {
          if(currentPeriod.average > 0) {
            data.year7.periods.push(string);
            data.year7.averages.push(undefined);
          }
        }

        if(currentPeriod.year8 > 0) {
          data.year8.periods.push(string);
          data.year8.averages.push(currentPeriod.year8);
        } else {
          if(currentPeriod.average > 0) {
            data.year8.periods.push(string);
            data.year8.averages.push(undefined);
          }
        }

        if(currentPeriod.year9 > 0) {
          data.year9.periods.push(string);
          data.year9.averages.push(currentPeriod.year9);
        }
        else {
          if(currentPeriod.average > 0) {
            data.year9.periods.push(string);
            data.year9.averages.push(undefined);
          }
        }

        if(currentPeriod.year10 > 0) {
          data.year10.periods.push(string);
          data.year10.averages.push(currentPeriod.year10);
        } else {
          if(currentPeriod.average > 0) {
            data.year10.periods.push(string);
            data.year10.averages.push(undefined);
          }
        }

      });

      res.setHeader('Content-Type', 'application/json');
      res.send(JSON.stringify(data, null, 4));

    });
  }
});

// Get the averages for each cohort as they progress through the years
router.get('/getCohortAverage', (req, res) => {

  // Find all rap periods and sort them oldest to newest
  RapPeriods.find({}).sort({year: 'ascending', term: 'ascending', week: 'ascending'}).then(function(allPeriods) {

    // Setup data structures
    var year7 = {'periods':new Array, 'averages':new Array};
    var year8 = {'periods':new Array, 'averages':new Array};
    var year9 = {'periods':new Array, 'averages':new Array};
    var year10 = {'periods':new Array, 'averages':new Array};
    var data = {'year7':year7,'year8':year8,'year9':year9,'year10':year10};
    var currentYear = 0;

    // Find the current year
    allPeriods.forEach(function(currentPeriod) {
      if(currentPeriod.current == true) {
        currentYear = currentPeriod.year;
      }
    });

    // Loop through each rap period and add the average to the correct cohort
    allPeriods.forEach(function(currentPeriod) {

      var string = "W" + currentPeriod.week + ",T" + currentPeriod.term + "," + String(currentPeriod.year).substring(2, 4);

      // Push the current year 10 scores from when they were in year 7
      if(currentPeriod.year == currentYear - 3) {
        data.year7.periods.push(string);
        data.year7.averages.push(undefined);
        data.year8.periods.push(string);
        data.year8.averages.push(undefined);
        data.year9.periods.push(string);
        data.year9.averages.push(undefined);
        if(currentPeriod.year7 > 0) {
          data.year10.periods.push(string);
          data.year10.averages.push(currentPeriod.year7);
        }
      }
      // Push the current year 9 scores from when they were in year 7
      // Push the current year 10 scores from when they were in year 8
      if(currentPeriod.year == currentYear - 2) {
        data.year7.periods.push(string);
        data.year7.averages.push(undefined);
        data.year8.periods.push(string);
        data.year8.averages.push(undefined);
        if(currentPeriod.year7 > 0) {
          data.year9.periods.push(string);
          data.year9.averages.push(currentPeriod.year7);
        }
        if(currentPeriod.year8 > 0) {
          data.year10.periods.push(string);
          data.year10.averages.push(currentPeriod.year8);
        }
      }
      // Push the current year 8 scores from when they were in year 7
      // Push the current year 9 scores from when they were in year 8
      // Push the current year 10 scores from when they were in year 9
      if(currentPeriod.year == currentYear - 1) {
        data.year7.periods.push(string);
        data.year7.averages.push(undefined);
        if(currentPeriod.year7 > 0) {
          data.year8.periods.push(string);
          data.year8.averages.push(currentPeriod.year7);
        }
        if(currentPeriod.year8 > 0) {
          data.year9.periods.push(string);
          data.year9.averages.push(currentPeriod.year8);
        }
        if(currentPeriod.year9 > 0) {
          data.year10.periods.push(string);
          data.year10.averages.push(currentPeriod.year9);
        }
      }
      // Push all year group current scores
      if(currentPeriod.year == currentYear) {
        if(currentPeriod.year7 > 0) {
          data.year7.periods.push(string);
          data.year7.averages.push(currentPeriod.year7);
        }
        if(currentPeriod.year8 > 0) {
          data.year8.periods.push(string);
          data.year8.averages.push(currentPeriod.year8);
        }
        if(currentPeriod.year9 > 0) {
          data.year9.periods.push(string);
          data.year9.averages.push(currentPeriod.year9);
        }
        if(currentPeriod.year10 > 0) {
          data.year10.periods.push(string);
          data.year10.averages.push(currentPeriod.year10);
        }
      }
    });
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(data, null, 4));
  });

});

// Get the averages for each year gender for either the current, or all RAP periods
router.get('/getGenderAverage', (req, res) => {
  RapPeriods.find({}).sort({year: 'ascending', term: 'ascending', week: 'ascending'}).then(function(allPeriods) {

    var male = {'periods':new Array, 'averages':new Array};
    var female = {'periods':new Array, 'averages':new Array};
    var data = {'male':male,'female':female};
    var year = req.query.year;

    Student.find({}).then(function(students) {
      allPeriods.forEach(function(currentPeriod) {
        var string = "W" + currentPeriod.week + ",T" + currentPeriod.term + "," + String(currentPeriod.year).substring(2, 4);
        var maleTotal = 0;
        var femaleTotal = 0;
        var maleCount = 0;
        var femaleCount = 0;

        students.forEach(function(student) {
          // then loop through each RAP period to find the current one
          student.rap.forEach(function(r) {
            if(currentPeriod.year == r.year
            && currentPeriod.term == r.term
            && currentPeriod.week == r.week
            && r.average > 0) {
              if(year == undefined || year == "all") {
                if(student.gender == "M") {
                  maleTotal += r.average;
                  maleCount++;
                } else if (student.gender == "F") {
                  femaleTotal += r.average;
                  femaleCount++;
                }
              }
              else if(r.grade == parseInt(year)) {
                if(student.gender == "M") {
                  maleTotal += r.average;
                  maleCount++;
                } else if (student.gender == "F") {
                  femaleTotal += r.average;
                  femaleCount++;
                }
              }
            }
          });
        });

        if(maleTotal > 0 && maleCount > 0) {
          data.male.periods.push(string);
          data.male.averages.push(Number(maleTotal/maleCount).toFixed("2"));
          data.female.periods.push(string);
          data.female.averages.push(Number(femaleTotal/femaleCount).toFixed("2"));
        }

      });

      res.setHeader('Content-Type', 'application/json');
      res.send(JSON.stringify(data, null, 4));

    });
  });
});

// Fills the RAP scores for a certain class with a single score
router.post('/fillRadios', (req, res) => {

  // Set parameters
  let classCode = req.body.classCode;
  let score = req.body.score;
  let teacher = req.body.teacher;

  // Match the rap period to the current period
  RapPeriods.findOne({ active: true }, function(err, currentPeriod) {
    // Loop through every student from class list
    Student.find({
      $and: [
        { 'rap.scores.code': classCode },
        { 'rap.year': currentPeriod.year },
        { 'rap.term': currentPeriod.term },
        { 'rap.week': currentPeriod.week }
      ]
    }).then(function(users) {
      //console.log(users);
      users.forEach(function(u) {
        // then loop through each RAP period to find the current one
        u.rap.forEach(function(r) {
          if(currentPeriod.year == r.year
            && currentPeriod.term == r.term
            && currentPeriod.week == r.week) {
            // then through the individual subject scores for each student
            r.scores.forEach(function(s) {
              // if the class code matches the code sent
              if(s.code == classCode && s.teacher == teacher) {
                s.value = score;
                u.save().then((stu) => {
                  console.log(req.session.user.name + " updated scores for " + u.name + " in " + classCode + " (with " + teacher + ") to " + score);
                  // Score saved!
                });
              }
            });
          }
        });
      });
    });
  });
  res.end();
});

// Import data from Edval to setup students with classes/teachers
router.post('/upload', function(req, res) {

  // Read in the POST data
  let fileUpload = req.files.fileUpload;
  let year = req.body.year;
	let term = req.body.term;
  let week = req.body.week;

  // Move the file to a local folder on the server
  fileUpload.mv('./uploads/imported.csv', function(err) {
    if (err) { return res.status(500).send(err); }
    //res.send('File moved!');
  });

  // Set CSV file path
  var csvFilePath = "./uploads/imported.csv";

  // Imports CSV and corrects structure for RAP usage
  csv().fromFile(csvFilePath).then(function(jsonArrayObj) {

    // Async loop to play nice with MongoDB
    async.eachSeries(jsonArrayObj, function(student, callback) {

      // Ignore entire row if it is a redundant subject
      if(student["Subject"] == "Assembly" || student["Subject"] == "Care" || student["Subject"] == "Sport"
       || student["Subject"] == "Distance ED" || student["Teacher"] == "undefined "
       || student["Year"] == "11" || student["Year"] == "12" || student["Student code"] == "undefined" ) {
        callback();
      } else {

        // Fixes Teacher Name
        let teacher = student["Teacher name"].replace(/;/g," ").replace(/  /g," ");
        teacher = teacher.split(' ')[1] + " " + teacher.split(' ')[0].charAt(0).toUpperCase() + teacher.split(' ')[0].slice(1).toLowerCase();
        teacher = teacher.replace(/(^|[\s-])\S/g, function (match) { return match.toUpperCase(); }); // capitalize after hyphen

        // Joins first and last name together
        let surname = student["Surname"].charAt(0).toUpperCase() + student["Surname"].slice(1).toLowerCase();
        let firstname = student["First name"].charAt(0).toUpperCase() + student["First name"].slice(1).toLowerCase();
        let studentName = firstname + " " + surname;
        studentName = studentName.replace(/(^|[\s-])\S/g, function (match) { return match.toUpperCase(); }); // capitalize after hyphen
        studentName = studentName.replace(/'/g, '\''); // get rid of apostrophes

        // Import ID Numbers, set invalid numbers to 0
        let idNum = student["Student code"];
        if(parseInt(idNum)!=idNum){
        	callback();
        }

        // Searches for current student in DB, adds them if not found
        Student.findOne({ id: idNum }, function (err, user) {
          if (err) {
            return handleError(err);
            callback();
          }
          if(user) {

            console.log(user.name + " found, updating details...");

            // Update student for new RAP period
            let found = false;
            for (let i = 0; i < user.rap.length; i++) {
              if(user.rap[i].year == year &&
                 user.rap[i].term == term &&
                 user.rap[i].week == week) {
                  found = true;
              }
            }
            if(!found) {
              user.rap.push({year: year, term: term, week: week, grade: student['Year'], average: 0});
              user.rap[user.rap.length-1].scores.push({subject: student['Subject'], code: student['Course code'] + student['Class id'], teacher: teacher, value: 0});
              user.save().then((newUser) => {
                console.log('Adding RAP period data for: ' + studentName);
              });
            } else {
              console.log("RAP period " + user.rap[user.rap.length-1].year + ", term " +
                          user.rap[user.rap.length-1].term + ", week " + user.rap[user.rap.length-1].week + " already exsists for " + studentName);
              // Update student if new class data found
              let found2 = false;
              //for (let i = 0; i < user.rap[user.rap.length-1].scores.length; i++) {
              async.eachSeries(user.rap[user.rap.length-1].scores, function(score, callback2) {
                if(score.subject == student['Subject']) {
                    //console.log(score.subject);
                    found2 = true;
                }
                callback2();
              });
              if(!found2) {
                user.rap[user.rap.length-1].scores.push({subject: student['Subject'], code: student['Course code'] + student['Class id'], teacher: teacher, value: 0});
                user.save().then((newUser) => {
                  console.log('Adding new class data for: ' + studentName);
                });
              } else {
                console.log("Class data already exists for " + studentName + " in " + student['Subject']);
              }
            }

            callback();

          } else {

            // If student doesn't exist then create them
            let stu = new Student({
              name: studentName,
              id: idNum,
              access: 0
            });

            stu.rap.push({year: year, term: term, week: week, grade: student['Year'], average: 0});
            stu.rap[0].scores.push({subject: student['Subject'], code: student['Course code'] + student['Class id'], teacher: teacher, value: 0});

            stu.save().then((newUser) => {
              console.log('New user created: ' + studentName);
              callback();
            });

          }
        });
      }
    }, function(err) {
      if( err ) {
      console.log('An error occurred: ' + err);
      } else {
        console.log('All students have been processed successfully');
        fs.unlink(csvFilePath, (err) => {
          if(err) {
            console.log("An error occured");
            throw err;
          } else {
            console.log('Temporary file was deleted');
          }
        });
        // After import, refresh Teachers list
        Student.find({}).then(async function(users) {
          users.forEach(async function(u) {
            // then loop through RAP period for each student
            u.rap.forEach(async function(r) {
              // then through the individual subjects for each student
              r.scores.forEach(async function(s) {
                try {
                  // search for the teacher
                  let foundTeacher = await Teacher.findOne({ name: s.teacher });
                    if(!foundTeacher) {
                      // If teacher doesn't exist then create them
                      let newTeacher = new Teacher({ name: s.teacher });
                      try {
                        let newTeacherResult = await newTeacher.save()
                        console.log("Added " + s.teacher + " to the list of teachers");
                      } catch(err) {
                        //console.log("Error adding teacher: possible duplicate");
                      }
                    }
                  } catch(err) {
                    console.log("Error searching for teacher");
                  }
              });
            });
          });
        });
        //console.log('Teacher list refreshed successfully');
        req.flash('success_msg', 'All students have been imported successfully');
        res.redirect('/importEdval');
        return null;
      }
    });

  });

});

// Render Import From EMU Screen
router.get('/importEMU', authCheck, (req, res) => {
  res.render('importEMU', {user: req.session.user});
});

// Import data from EMU to update student usernames
router.post('/importEMU', function(req, res) {

  // Read in the POST data
  let fileUpload = req.files.fileUpload;

  // Move the file to a local folder on the server
  fileUpload.mv('./uploads/importedEMU.csv', function(err) {
    if (err) {
      console.log("There was an error while attempting to upload the EMU data");
      return res.status(500).send(err);
    }
  });

  // Set CSV file path
  var csvFilePath = "./uploads/importedEMU.csv";

  // Imports CSV and corrects structure for RAP usage
  csv().fromFile(csvFilePath).then(function(jsonArrayObj) {

    console.log("Importing " + jsonArrayObj.length + " students...");

    // Async loop to play nice with MongoDB
    async.eachSeries(jsonArrayObj, function(student, callback) {

      // Ignore entire row if it doesn't contain the data we need
      if(student["studentNo"] == null || student["DEC User ID"] == null) {
        console.log("Error in EMU file");
        callback();
      } else {

        // Set variables
        let id = student["studentNo"];
        let username = student["DEC User ID"];

        // Searches for current student in DB, adds them if not found
        Student.findOne({ id: id }, function (err, user) {
          if (err) {
            // If there is an error with the query
            return handleError(err);
            callback();
          }
          if(user) {
            // If student ID number is found
            user.username = username;
            user.access = 0;
            user.save().then((stu) => {
              console.log("Username '" + stu.username + "' updated for " + stu.name);
            });
            callback();
          } else {
            // If student ID number is NOT found
            callback();
          }
        });
      }
    }, function(err) {
      if( err ) {
        console.log('An error occurred: ' + err); return false;
        req.flash('error_msg', 'Error updating student usernames');
        res.redirect('/importEMU');
        return null;
      }
      else {
        console.log('All students have been processed successfully');
        fs.unlink(csvFilePath, (err) => {
          if(err) {
            console.log("An error occured");
            throw err;
          } else {
            console.log('Temporary file was deleted');
          }
        });
        req.flash('success_msg', 'All student usernames been updated successfully');
        res.redirect('/importEMU');
        return null;
      }
    });
  });
});

// Restores list of teachers (so that they can log in)
router.post('/uploadTeachers', function(req, res) {

  // Read in the POST data
  let fileUpload = req.files.fileUpload;

  // Set JSON file path
  let jsonFilePath = "./uploads/teachers.json";

  // Move the file to a local folder on the server
  fileUpload.mv(jsonFilePath, function(err) {
    if (err) { return res.status(500).send(err); }
  });

  // Import file
  fs.readFile(jsonFilePath, 'utf8', function (err, data) {
    if (err) throw err;
    console.log(data);
    var jsonArrayObj = JSON.parse(data);

    // Async loop to play nice with MongoDB
    async.eachSeries(jsonArrayObj, function(teacher, callback) {

      let teacherName = teacher.name;
      let username = teacher.username;
      let faculty = teacher.faculty;
      let access = teacher.access;

      // Searches for current teacher in DB
      Teacher.findOne({ name: teacherName }, function (err, user) {
        if (err) {
          return handleError(err);
          console.log("Error with query");
          callback();
        }
        if(user) {
          // If teacher already exists then update the record
          user.username = username;
          user.access = access;
          user.faculty = faculty;
          user.save().then((tch) => {
            console.log("Details imported for " + teacherName);
            callback();
          });
        } else {
          // Create a new teacher in the system
          let teach = new Teacher({
            name: teacherName,
            faculty: faculty,
            access: access,
            username: username
          });
          teach.save().then((tch) => {
            console.log("New teacher created: " + teacherName);
            callback();
          });
        }
      });
    }, function(err) {
      if( err ) {
      console.log('An error occurred: ' + err);
      } else {
        console.log('All teachers have been imported successfully');
        fs.unlink(jsonFilePath, (err) => {
          if(err) {
            console.log("An error occured");
            throw err;
          } else {
            console.log('Temporary file was deleted');
          }
        });
        req.flash('success_msg', 'All teachers have been imported successfully');
        res.redirect('/editTeachers');
        return null;
      }
    });
  });
});

// Restores all RAP data (clears then re-writes database)
router.post('/restoreRAP', function(req, res) {

  // Read in the POST data
  let fileUpload = req.files.fileUpload;

  // Set JSON file path and upload
  let jsonFilePath = "./uploads/students.json";
  fileUpload.mv(jsonFilePath, function(err) {
    if (err) { return res.status(500).send(err); }
  });

  // Import file
  fs.readFile(jsonFilePath, 'utf8', function (err, data) {
    if (err) {
      throw err;
    } else {

      // Backup all the data before continuing with restore
      Student.find({}).then(function(users) {
        fs.writeFile("./downloads/backup.json", JSON.stringify(users, null, 4), (err) => {
          if (err) {
            console.error(err);
            return false;
          } else {
            console.log("Backup file has been created");

            // Delete everything old collection
            Student.remove({}).then(() => {
              console.log("Old data removed!");

              // Parse and loop through data
              var jsonArrayObj = JSON.parse(data);
              async.eachSeries(jsonArrayObj, function(student, callback) {

                // Create student
                let stu = new Student({
                  name: student.name,
                  username: student.username,
                  gender: student.gender,
                  id: student.id,
                  access: student.access,
                  longTermAverage: student.longTermAverage,
                  rap: student.rap
                });

                // Save student
                stu.save().then((newStu) => {
                  console.log("Saved: " + student.name);
                });

                callback();
              }, function(err) {
                if( err ) {
                console.log('An error occurred: ' + err);
                } else {
                  console.log('All RAP Data has been imported successfully');
                  fs.unlink(jsonFilePath, (err) => {
                    if(err) {
                      console.log("An error occured");
                      throw err;
                    } else {
                      console.log('Temporary file was deleted');
                    }
                  });
                  req.flash('success_msg', 'All RAP Data has been imported successfully');
                  res.redirect('/backupRAP');
                  return null;
                }
              });
            });
          }
        });
      });
    }
  });
});

// Imports old RAP data (Name and Average)
router.post('/importOld', function(req, res) {

  // Read in the POST data
  let fileUpload = req.files.fileUpload;
  let year = req.body.year;
  let term = req.body.term;
  let week = req.body.week;

  // Set JSON file path and upload
  let csvFilePath = "./uploads/oldData.csv";
  fileUpload.mv(csvFilePath, function(err) {
    if (err) {
      console.log("Encountered an error uploading file");
      return res.status(500).send(err);
    }
  });

  // Import CSV file
  csv().fromFile(csvFilePath).then(function(jsonArrayObj) {

    console.log(jsonArrayObj);

    // Loop through each line in the CSV file
    async.eachSeries(jsonArrayObj, function(student, callback) {

      // Ignore entire row if it is a redundant subject
      if(student["Name"] == null || student["Score"] == null || student["Grade"] == null) {
        callback();
      } else {

        let studentName = student["Name"];
        let studentGrade = student["Grade"];
        let studentScore = student["Score"];

        console.log("Reading in - Name: " + studentName + ", Grade: " + studentGrade + ", Score: " + studentScore);

        // Searches for current student in DB, updates if found
        Student.findOne({ name: studentName }, function (err, user) {
          if (err) {
            return handleError(err);
            callback();
          }
          if(user) {
            // Searches for already existing RAP period
            let found = false;
            for (let i = 0; i < user.rap.length; i++) {
              if(user.rap[i].year == year &&
                 user.rap[i].term == term &&
                 user.rap[i].week == week) {
                  found = true;
                  user.rap[i].average = studentScore;
                  user.save().then((newUser) => {
                    console.log('Updating RAP period data for: ' + studentName);
                    callback();
                  });
              }
            }
            // Update student if RAP period not found
            // Don't touch already existing RAP periods
            if(!found) {
              user.rap.push({average: studentScore, year: year, term: term, week: week, grade: studentGrade});
              user.save().then((newUser) => {
                console.log('Adding old RAP period data for: ' + studentName);
                callback();
              });
            }
          } else {
            console.log("Student doesn't exist on system, skipping...");
            callback();
          }
        });
      }
    }, function(err) {
      if( err ) {
      console.log('An error occurred: ' + err);
      } else {
        console.log('All students have been processed successfully');
        fs.unlink(csvFilePath, (err) => {
          if(err) {
            console.log("An error occured");
            throw err;
          } else {
            console.log('Temporary file was deleted');
          }
        });
        req.flash('success_msg', 'All students have been imported successfully');
        res.redirect('/importOld');
        return null;
      }
    });

  });
});

// Imports old RAP data (Name and Average)
router.get('/calculateAveragesOld', function(req, res) {
  RapPeriods.find({}, function(err, allPeriods) {
    allPeriods.forEach(function(currentPeriod) {
      var count = 0;
      var total = 0;
      var itemsProcessed = 0;
      var year7total = 0;
      var year7count = 0;
      var year8total = 0;
      var year8count = 0;
      var year9total = 0;
      var year9count = 0;
      var year10total = 0;
      var year10count = 0;
      Student.find({
        $and: [
          { 'rap.year': currentPeriod.year },
          { 'rap.term': currentPeriod.term },
          { 'rap.week': currentPeriod.week }
        ]
      }).then(function(users) {
        users.forEach(function(u, index, array) {
          u.rap.forEach(function(r) {
            if(r.year == currentPeriod.year
            && r.term == currentPeriod.term
            && r.week == currentPeriod.week) {
              if(r.average != null) {
                if(r.average > 0 ) {
                  total += r.average;
                  count++;
                  //console.log(count + " - " + u.name + " - " + total);
                  if(r.grade == 7) {
                    year7total += r.average;
                    year7count++;
                  }
                  if(r.grade == 8) {
                    year8total += r.average;
                    year8count++;
                  }
                  if(r.grade == 9) {
                    year9total += r.average;
                    year9count++;
                  }
                  if(r.grade == 10) {
                    year10total += r.average;
                    year10count++;
                  }
                }
              }
            }
          });
        });
        if(count > 0) {
          //console.log(total + " / " + count);
          currentPeriod.average = Number(total/count).toFixed(2);
          if(year7total > 0) { currentPeriod.year7 = Number(year7total / year7count).toFixed(2); }
          if(year8total > 0) { currentPeriod.year8 = Number(year8total / year7count).toFixed(2); }
          if(year9total > 0) { currentPeriod.year9 = Number(year9total / year9count).toFixed(2); }
          if(year10total > 0) { currentPeriod.year10 = Number(year10total / year10count).toFixed(2); }
          currentPeriod.save().then((newPeriod) => {
            console.log("Year: " + currentPeriod.year + ", Term: " + currentPeriod.term + ", Week: " + currentPeriod.week + ", Average: " + currentPeriod.average);
            console.log("Year 7: " + Number(year7total / year7count).toFixed(2));
            console.log("Year 8: " + Number(year8total / year8count).toFixed(2));
            console.log("Year 9: " + Number(year9total / year9count).toFixed(2));
            console.log("Year 10: " + Number(year10total / year10count).toFixed(2));
          });
        }
      });
    });
    res.send("Averages updated!");
  });
});

// Gets the current RAP Period
router.get('/calculateChange', (req, res) => {
  Student.find().then(function(students) {
    students.forEach(function(student) {
      console.log("Calculating change for " + student.name);
      // Sort the RAP Periods into order first
      student.rap.sort((a, b) => {
        if (a.year < b.year) {
          return -1;
        }
        if (a.year > b.year) {
          return 1;
        }
        if (a.term < b.term) {
          return -1;
        }
        if (a.term > b.term) {
          return 1;
        }
        if (a.week < b.week) {
          return -1;
        }
        if (a.week > b.week) {
          return 1;
        }
        return 0;
      });
      // Loop through each RAP Period and calculate the change
      for (var i = 1; i < student.rap.length; i++) {
        if(student.rap[i].average > 0 && student.rap[i-1].average > 0) {
          student.rap[i].change = Number(student.rap[i].average - student.rap[i-1].average).toFixed(2);
        } else {
          student.rap[i].change = 0;
        }
      }
      // Save the data back to the student's file
      student.save();
    });
    res.send("success");
  });
});

// Render Import From EMU Screen
router.get('/importLMBR', authCheck, (req, res) => {
  res.render('importLMBR', {user: req.session.user});
});

// Import data from EMU to update student usernames
router.post('/importLMBR', function(req, res) {

  // Read in the POST data
  let fileUpload = req.files.fileUpload;

  // Set CSV file path
  var csvFilePath = "./uploads/importedLMBR.csv";

  // Move the file to a local folder on the server
  fileUpload.mv(csvFilePath, function(err) {
    if (err) {
      console.log("There was an error while attempting to upload the EMU data");
      return res.status(500).send(err);
    }
  });

  // Imports CSV and corrects structure for RAP usage
  csv().fromFile(csvFilePath).then(function(jsonArrayObj) {

    console.log("Importing " + jsonArrayObj.length + " students...");

    // Async loop to play nice with MongoDB
    async.eachSeries(jsonArrayObj, function(student, callback) {

      // Ignore entire row if it doesn't contain the data we need
      if(student["StudentCode"] == null || student["M/F"] == null) {
        console.log("Error in LMBR file");
        callback();
      } else {

        // Set variables
        let id = student["StudentCode"];
        let gender = student["M/F"];

        // Searches for current student in DB, adds them if not found
        Student.findOne({ id: id }, function (err, user) {
          if (err) {
            // If there is an error with the query
            return handleError(err);
            callback();
          }
          if(user) {
            // If student ID number is found
            user.gender = gender;
            user.save().then((stu) => {
              console.log("Gender '" + stu.gender + "' updated for " + stu.name);
            });
            callback();
          } else {
            // If student ID number is NOT found
            callback();
          }
        });
      }
    }, function(err) {
      if( err ) {
        console.log('An error occurred: ' + err); return false;
        req.flash('error_msg', 'Error updating student genders');
        res.redirect('/importLMBR');
        return null;
      }
      else {
        console.log('All student genders have been updated successfully');
        fs.unlink(csvFilePath, (err) => {
          if(err) {
            console.log("An error occured");
            throw err;
          } else {
            console.log('Temporary file was deleted');
          }
        });
        req.flash('success_msg', 'All student genders have been updated successfully');
        res.redirect('/importLMBR');
        return null;
      }
    });
  });
});

module.exports = router;
