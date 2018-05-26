const express = require('express');
const mongoose = require('mongoose');
const routes = require('./routes/routes');
const checkRoutes = require('./routes/checkRoutes');
const keys = require('./config/keys');
const Student = require('./models/student');
const Teacher = require('./models/teacher');
const RapPeriods = require('./models/rapPeriods');
const fileUpload = require('express-fileupload');
const flash = require('connect-flash');
const cookieSession = require('cookie-session');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const schedule = require('node-schedule');
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

// Connect Flash
app.use(flash());

// Global Vars
app.use(function (req, res, next) {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
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
app.use('/check', checkRoutes);

app.listen(3000, () => console.log('RAP listening on port 3000!'));
