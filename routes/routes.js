const router = require('express').Router();
const fileUpload = require('express-fileupload');
const Student = require('../models/student');
const Teacher = require('../models/teacher');
const settings = require('../config/settings');
const FormData = require('form-data');
const fs = require('fs');
var csv = require("csvtojson");
var async = require('async');

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
      console.log("Not logged in");
      res.render('login', {error: "Invalid username or password"});
    } else {
      // See if user is a teacher
      console.log("Checking to see if the user is a staff member...");
      Teacher.findOne({ username: username }, function (err, user) {
        if(user) {
          req.session.user = user;
          res.redirect('/');
        } else {
          // See if user is a student
          console.log("Checking to see if the user is a student...");
          Student.findOne({ username: username }, function (err, user) {
            if(user) {
              req.session.user = user;
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
    res.render('home', {user: req.session.user});
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

// Updates a single teacher's username, returns true if successful
router.get('/updateTeacher', (req, res) => {

  console.log(req.query.name);

  // Redirect invalid requests to this route
  if(req.query.name == null) {
    return false;
  }
  var teacher = req.query.name;
  var username = req.query.username;
  var access = req.query.access;

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
  res.render('teachers', {user: req.session.user, message: req.session.message});
});

// Re-calculate averages for each student
router.get('/updateAverages', (req, res) => {
  Student.find({}).then(function(users) {
    users.forEach(function(u) {
        Student.findOne({name: u.name}, function(err, stu){
          if(err){ console.log("Something went wrong when searching the data!"); }
          stu.rap.forEach(function(r) {
            let total = 0;
            let count = 0;
            r.scores.forEach(function(s) {
              if(s.value > 0) {
                total += s.value;
                count++;
              }
            });
            r.average = Number(total/count).toFixed(2);
          });
          stu.save().then((newUser) => {
            console.log('Updated averages for ' + stu.name);
          });
        });
    });
  });
  res.render('home', {user: req.session.user});
});

// refresh teacher list
router.get('/refreshTeachers', (req, res) => {
  // Find all students
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
                  console.log(newTeacher);
                } catch(err) {
                  console.log(err);
                }
              }
            } catch(err) {
              console.log(err);
            }
        });
      });
    });
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

// Returns a list of Teachers including all details
router.get('/getTeachers', (req, res) => {
  Teacher.find({}).then(function(users) {
    let teachers = [];
    users.forEach(function(u) {
      teachers.push({name: u.name, username: u.username, access: u.access});
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
        if(r.year == settings.rapPeriod.year
          && r.term == settings.rapPeriod.term
          && r.week == settings.rapPeriod.week) {
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

        // Joins first and last name together
        let surname = student["Surname"].charAt(0).toUpperCase() + student["Surname"].slice(1).toLowerCase();
        let firstname = student["First name"].charAt(0).toUpperCase() + student["First name"].slice(1).toLowerCase();
        let studentName = firstname + " " + surname;
        studentName = studentName.replace(/(^|[\s-])\S/g, function (match) { return match.toUpperCase(); });

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
                let rand = Math.floor((Math.random() * 5) + 1);
                user.rap[user.rap.length-1].scores.push({subject: student['Subject'], code: student['Course code'] + student['Class id'], teacher: teacher, value: rand});
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
              id: idNum
            });

            let rand = Math.floor((Math.random() * 5) + 1);
            stu.rap.push({year: year, term: term, week: week, grade: student['Year'], average: 0});
            stu.rap[0].scores.push({subject: student['Subject'], code: student['Course code'] + student['Class id'], teacher: teacher, value: rand});

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
      }
    });

  });

});

// Useful for updating teacher email addresses
router.post('/uploadTeachers', function(req, res) {

  // Read in the POST data
  let fileUpload = req.files.fileUpload;

  // Move the file to a local folder on the server
  fileUpload.mv('./uploads/teachers.csv', function(err) {
    if (err) { return res.status(500).send(err); }
  });

  // Set CSV file path
  var csvFilePath = "./uploads/teachers.csv";

  // Imports CSV and corrects structure for RAP usage
  csv().fromFile(csvFilePath).on("end_parsed", function(jsonArrayObj) {

    // Async loop to play nice with MongoDB
    async.eachSeries(jsonArrayObj, function(teacher, callback) {

      let teacherName = teacher['First Name'] + " " + teacher['Last Name'];
      let username = teacher['Username'].toLowerCase();

      // Searches for current teacher in DB
      Teacher.findOne({ name: teacherName }, function (err, user) {
        if (err) {
          return handleError(err);
          console.log("Error with query");
          callback();
        }
        if(user) {
          user.username = username;
          user.access = 0; // Comment this out after initial setup
          user.save().then((stu) => {
            console.log("Details updated for " + user.name);
          });
          callback();
        } else {
          console.log(teacherName + " not found");
          callback();
        }

      });
    }, function(err) {
      if( err ) {
      console.log('An error occurred: ' + err);
      } else {
        console.log('All teachers have been processed successfully');
        req.flash('success_msg', 'All teachers have been processed successfully');
        res.redirect('editTeachers');
        return null;
      }
    });

  });


});

module.exports = router;
