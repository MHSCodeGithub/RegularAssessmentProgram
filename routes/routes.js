const router = require('express').Router();
const fileUpload = require('express-fileupload');
const Student = require('../models/student');
const Teacher = require('../models/teacher');
const RapPeriods = require('../models/rapPeriods');
const FormData = require('form-data');
const schedule = require('node-schedule');
const fs = require('fs');
var csv = require("csvtojson");
var async = require('async');

// Batch job to update averages every 5 minutes
var updateJob = schedule.scheduleJob('*/5 * * * *', function(){
  //console.log('Running batch job: Update Averages');
  updateAverages();
});

// loops through all students and updates their averages
function updateAverages() {
  try {
    Student.find({}).then(function(users) {
      var itemsProcessed = 0;
      users.forEach(function(u, index, array) {
        let userTotal = 0;
        let userCount = 0;
        u.rap.forEach(function(r) {
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
            r.average = Number(rapTotal/rapCount).toFixed(2);
          }
          if(r.average > 0) {
            userTotal += r.average;
            userCount++;
          }
        });
        if(userTotal == 0 ) {
          u.longTermAverage = 0;
        } else {
          u.longTermAverage = Number(userTotal/userCount).toFixed(2);
        }
        u.save().then((newUser) => {
          //console.log('Updated averages for ' + u.name);
          itemsProcessed++;
          //console.log(itemsProcessed + " / " + array.length);
          if(itemsProcessed == array.length) {
            //console.log('All student average RAP scores recalculated successfully');
            return true;
          }
        });
      });
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
    res.render('teacherHome', {user: req.session.user});
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

// Admin dashboard
router.get('/dashboard', authCheck, (req, res) => {
  if(req.session.user.access < 2) {
    res.render('/', {user: req.session.user});
  } else {
    res.render('dashboard', {user: req.session.user});
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
router.get('/generatePosters', authCheck, (req, res) => {
  if(req.session.user.access < 2) {
    res.redirect('/');
  } else {
    res.render('generatePosters', {user: req.session.user});
  }
});

// Sets the current RAP Period
router.post('/setCurrentPeriod', (req, res) => {

  // Set parameters
  let year = req.body.year;
  let term = req.body.term;
  let week = req.body.week;

  RapPeriods.find({}).then(function(periods) {
    let found = false;
    periods.forEach(function(p) {
      if(p.year == year && p.term == term && p.week == week) {
        found = true;
        p.current = true;
        p.save().then((period) => {
          console.log("Current RAP Period is updated: " + p.year + ", " + p.term + ", " + p.week);
        });
      } else {
        p.current = false;
        p.save().then((period) => {
          //console.log("Not current: " + p.year + ", " + p.term + ", " + p.week);
        });
      }
    });
    if(!found) {
      let rp = new RapPeriods({
        year: year,
        term: term,
        week: week,
        current: true,
        active: false
      });
      rp.save().then((period) => {
        console.log("New RAP period created: " + period.year + ", " + period.term + ", " + period.week);
      });
    }
  });

  req.flash('success_msg', 'RAP Period updated successfully');
  res.redirect('/dashboard');

});

// Query a specific teacher via URL
router.get('/queryTeacher', authCheck, (req, res) => {
  if(req.query.name != null) {
    console.log(req.session.user.name + " looked up scores for " + req.query.name);
    res.render('teacherHome', {user: req.session.user, queryName: req.query.name});
  } else {
    res.render('teacherHome', {user: req.session.user});
  }
});

// Search for teacher on Check Teacher page
router.get('/checkTeacher', authCheck, (req, res) => {
  res.render('checkTeacher', {user: req.session.user});
});

// Render Import From Edval Screen
router.get('/importEdval', authCheck, (req, res) => {
  res.render('importEdval', {user: req.session.user});
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
  var username = req.body.username;
	var password = req.body.password;
  var form = new FormData();
  form.append('username', username);
  form.append('password', password);
  form.submit('https://web2.mullumbimb-h.schools.nsw.edu.au/portal/login/login', function(err, response) {
    if(response.headers.location != "/portal/dashboard") {
      console.log(username + " was not able to log in via Sentral Student Portal");
      // try again with different portal for staff
      var form2 = new FormData();
      form2.append('sentral-username', username);
      form2.append('sentral-password', password);
      form2.submit('https://web2.mullumbimb-h.schools.nsw.edu.au/check_login', function(err2, response2) {
        if(response2.statusCode == 200) {
          console.log(username + " was not able to log in via Sentral Staff Portal");
        } else {
          console.log("Logged in through Sentral Staff Portal");
          console.log("Checking to see if the user is a staff member...");
          Teacher.findOne({ username: username }, function (err, user) {
            if(user) {
              req.session.user = user;
              res.redirect('/');
            }
          });
        }
      });
      res.render('login', {error: "Invalid username or password"});
    } else {
      // See if user is a teacher
      Teacher.findOne({ username: username }, function (err, user) {
        if(user) {
          req.session.user = user;
          console.log(user.name + " logged in");
          res.redirect('/');
        } else {
          // See if user is a student
          console.log("Checking to see if the user is a student...");
          Student.findOne({ username: username }, function (err, user) {
            if(user) {
              req.session.user = user;
              console.log(user.name + " logged in");
              res.redirect('/');
            } else {
              res.render('login', {error: "Invalid username or password"});
            }
          });
        }
      });
    }
  });
});

// Auth logout
router.get('/logout', function(req, res){
  req.session = null;
	res.redirect('/login');
});

// Returns classes and student lists for a certain teacher
router.get('/teacher', (req, res) => {

  // Redirect invalid requests to this route
  if(req.query.name == null) {
    res.render('teacherHome', {user: req.session.user});
    return null;
  }
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

// Returns all details about a specific student
router.get('/student', (req, res) => {

  // Redirect invalid requests to this route
  if(req.query.name == null) {
    res.redirect('/');
    return null;
  }
  var student = req.query.name;

  Student.findOne({name: req.query.name}).then(function(stu) {
    res.send(JSON.stringify(stu));
  });

});

// Adds a missing student to a class
router.post('/addStudent', (req, res) => {

  var student = req.body.student;
  var classCode = req.body.classCode;
  var teacher = req.body.teacher;
  let subject = req.body.subject;

  RapPeriods.findOne({ current: true }, function(err, currentPeriod) {
    Student.findOne({ name: student }, function (err, user) {
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
              r.scores.push({subject: subject, code: classCode, teacher: teacher});
              user.save().then((stu) => {
                console.log(req.session.user.name + " added " + student + " to " + classCode);
                res.send(JSON.stringify(true));
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
  console.log("Attempting to delete " + student);

  RapPeriods.findOne({ current: true }, function(err, currentPeriod) {
    Student.findOne({ name: student }, function (err, user) {
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
                r.scores.pull(s);
                user.save().then((stu) => {
                  console.log(req.session.user.name + " deleted " + student + " from " + classCode);
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

  RapPeriods.findOne({ current: true }, function(err, currentPeriod) {
    Student.find({}, function (err, users) {
      if (err) { console.log(err); }
      if (users) {
        let count = 0;
        users.forEach(function(u) {
          u.rap.forEach(function(r) {
            if(r.year == currentPeriod.year
            && r.term == currentPeriod.term
            && r.week == currentPeriod.week) {
              let found = false;
              let subject = "";
              r.scores.forEach(function(s) {
                if(s.code == classCode) {
                  if(s.teacher == null) {
                    // If the class exsists but there is no teacher
                    s.teacher = teacher;
                    count++;
                  } else {
                    // Otherwise, duplicate the subject for the new teacher
                    found = true;
                    subject = s.subject;
                  }
                }
              });
              if(found) {
                r.scores.push({subject: subject, code: classCode, teacher: teacher});
                count++;
              }
            }
          });
          u.save();
        });
        console.log(req.session.user.name + " added " + teacher + " to " + classCode + " for " + count + " students.");
        res.send(JSON.stringify(true));
      } else {
        res.send(JSON.stringify(false));
      }
    });
  });
});

// Removes a class from a teacher
router.post('/removeClass', (req, res) => {
  var classCode = req.body.classCode;
  var teacher = req.body.teacher;
  RapPeriods.findOne({ current: true }, function(err, currentPeriod) {
    Student.find({}, function (err, users) {
      if (err) { console.log(err); }
      if (users) {
        let count = 0;
        users.forEach(function(u) {
          u.rap.forEach(function(r) {
            if(r.year == currentPeriod.year
            && r.term == currentPeriod.term
            && r.week == currentPeriod.week) {
              r.scores.forEach(function(s) {
                if(s.code == classCode && s.teacher == teacher) {
                  //r.scores.pull(s); // This deletes the entire class
                  s.teacher = null;
                  count++;
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
  updateAverages()
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
  Student.find({}).then(function(users) {
    let students = [];
    users.forEach(function(u) {
      students.push(u.name);
    });
    //console.log(teachers);
    res.send(JSON.stringify(students));
  });
});

// Returns a list of Students for the autocomplete
router.get('/autocompleteClasses', (req, res) => {
  Student.find({}).then(function(users) {
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

// Returns a list of Students for the autocomplete
router.get('/autocompleteSubjects', (req, res) => {
  Student.find({}).then(function(users) {
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

// Returns a list of Teachers including all details
router.get('/getTeachers', (req, res) => {
  Teacher.find({}).then(function(users) {
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

  RapPeriods.findOne({ current: true }, function(err, currentPeriod) {
    Student.findOne({ name: student }, function (err, user) {
      if (err) { console.log(err); }
      if (user) {
        user.rap.forEach(function(r) {
          if(r.year == currentPeriod.year
            && r.term == currentPeriod.term
            && r.week == currentPeriod.week) {
            r.scores.forEach(function(s) {
              if(s.code == classCode) {
                s.value = score;
                user.save().then((newUser) => {
                  console.log(req.session.user.name + ' updated score to ' + score + ' for ' + student + ' in ' + classCode);
                  res.end();
                });
              }
            });
          }
        });
      }
    });
  });
});

// Fills the RAP scores for a certain class with a single score
router.post('/fillRadios', (req, res) => {

  // Set parameters
  let classCode = req.body.classCode;
  //console.log(req.body.classCode);
  let score = req.body.score;
  //console.log(req.body.score);
  let students = req.body.students;
  //console.log(req.body.students);
  console.log(req.session.user.name + " updated scores for " + classCode + " to " + score);

  // Match the rap period to the current period
  RapPeriods.findOne({ current: true }, function(err, currentPeriod) {
    // Loop through every student from class list
    Student.find({"$or":students}).then(function(users) {
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
              if(s.code == classCode) {
                s.value = score;
                u.save().then((stu) => {
                  //console.log("Score updated for " + u.name);
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
  csv().fromFile(csvFilePath).on("end_parsed", function(jsonArrayObj) {

    // Async loop to play nice with MongoDB
    async.eachSeries(jsonArrayObj, function(student, callback) {

      // Ignore entire row if it is a redundant subject
      if(student["Subject"] == "Assembly" || student["Subject"] == "Care" || student["Subject"] == "Sport"
       || student["Subject"] == "Distance ED" || student["Teacher"] == "undefined "
       || student["Year"] == "11" || student["Year"] == "12") {
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
        	idNum = 0;
        }

        // Searches for current student in DB, adds them if not found
        Student.findOne({ name: studentName }, function (err, user) {
          if (err) {
            return handleError(err);
            callback();
          }
          if(user) {

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
                        console.log("Error adding teacher: possible duplicate");
                      }
                    }
                  } catch(err) {
                    console.log("Error searching for teacher");
                  }
              });
            });
          });
        });
        console.log('Teacher list refreshed successfully');
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
    if (err) { return res.status(500).send(err); }
  });

  // Set CSV file path
  var csvFilePath = "./uploads/importedEMU.csv";

  // Imports CSV and corrects structure for RAP usage
  csv().fromFile(csvFilePath).on("end_parsed", function(jsonArrayObj) {

    // Async loop to play nice with MongoDB
    async.eachSeries(jsonArrayObj, function(student, callback) {

      // Ignore entire row if it doesn't contain the data we need
      if(student["studentNo"] == null || student["DEC User ID"] == null) {
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
        req.flash('success_msg', 'All teachers have been imported successfully');
        res.redirect('/editTeachers');
        return null;
      }
    });
  });
});

// TODO: Complete this route
// Restores list of teachers (so that they can log in)
router.post('/restoreRAP', function(req, res) {

  // Read in the POST data
  let fileUpload = req.files.fileUpload;

  // Set JSON file path
  let jsonFilePath = "./uploads/students.json";

  // Move the file to a local folder on the server
  fileUpload.mv(jsonFilePath, function(err) {
    if (err) { return res.status(500).send(err); }
  });

  // Import file
  fs.readFile(jsonFilePath, 'utf8', function (err, data) {
    if (err) throw err;
    var jsonArrayObj = JSON.parse(data);

    // Async loop to play nice with MongoDB
    async.eachSeries(jsonArrayObj, function(student, callback) {
      console.log(student.name);
      callback();
    }, function(err) {
      if( err ) {
      console.log('An error occurred: ' + err);
      } else {
        console.log('All RAP Data has been imported successfully');
        req.flash('success_msg', 'All RAP Data has been imported successfully');
        res.redirect('/backupRAP');
        return null;
      }
    });

  });

});

module.exports = router;
