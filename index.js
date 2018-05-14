const express = require('express');
const mongoose = require('mongoose');
const routes = require('./routes/routes');
const keys = require('./config/keys');
const Student = require('./models/student');
const Teacher = require('./models/teacher');
const fileUpload = require('express-fileupload');
const cookieSession = require('cookie-session');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const csv = require("csvtojson");
const async = require('async');

// Setup app
mongoose.Promise = global.Promise;
const app = express();
app.set('view engine', 'pug');
app.set('views', './views');
app.set('trust proxy', 1);

// Set up cookies
app.use(cookieSession({
  name: 'session',
  maxAge: 72*60*60*1000, // 3 Days
  keys: [keys.session.cookieKey]
}));

// Global Vars
app.use(function (req, res, next) {
  res.locals.user = req.user || null;
  next();
});

// Serve static files
app.use(express.static('./public'));

// Support file uploads
app.use(fileUpload());

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

// write function for student email import from EMU
function importStudentEmails() {

}

// write function for staff email import from Edval
function importStaffEmails() {

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
// refreshTeachers();
// updateAverages();

// Check if logged in
const authCheck = (req, res, next) => {
  if(!req.session.user) {
    res.redirect('/login');
  } else {
    next();
  }
}

// Basic home route
app.get('/', authCheck, (req, res) => {
  res.render('home', {user: req.session.user});
});

// Basic admin route
app.get('/admin', authCheck, (req, res) => {
  res.render('admin', {user: req.session.user});
});

app.listen(3000, () => console.log('RAP listening on port 3000!'));
