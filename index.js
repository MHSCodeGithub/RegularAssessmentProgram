const express = require('express');
const mongoose = require('mongoose');
const routes = require('./routes/routes');
const keys = require('./config/keys');
const Student = require('./models/student');
const Teacher = require('./models/teacher');
var csv = require("csvtojson");
var async = require('async');
var bodyParser = require('body-parser');

mongoose.Promise = global.Promise;
const app = express();
app.set('view engine', 'pug');
app.set('views', './views');

// Serve static files
app.use(express.static('./public'));

// Support json and encoded bodies
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Connect to mongodb
mongoose.connect(keys.mongodb.dbURI);

// Check if connection made to DB
mongoose.connection.once('open',function() {
  console.log("Mongodb Connection made");
}).on('error', function() {
  console.log('Connection error',error);
});

// Set up routes
app.use('/', routes);

var FormData = require('form-data');
var fs = require('fs');
var form = new FormData();
form.append('sentral-username', '####');
form.append('sentral-password', '####');

form.submit('https://web2.mullumbimb-h.schools.nsw.edu.au/check_login', function(err, res) {
  if(res.statusCode == 200) {
    console.log("Not logged in");
  } else {
    console.log("Logged in");
  }
});

// write function for student email import from EMU
function importStudentEmails() {

}

// write function for staff email import from Edval
function importStaffEmails() {

}

function importCSV(y, t, w) {

  var csvFilePath = "./students.csv";
  var year = y;
  var term = t;
  var week = w;

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

}

function updateAverages() {
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
}

async function refreshTeachers() {
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
                  //console.log(err);
                }
              }
            } catch(err) {
              //console.log(err);
            }
        });
      });
    });
  });
}

// These need to be accessible routes from an admin page:
// importCSV(2018,2,5);
// refreshTeachers();
// updateAverages();

app.get('/', (req, res) => res.render('home'));

app.listen(3000, () => console.log('RAP listening on port 3000!'));
