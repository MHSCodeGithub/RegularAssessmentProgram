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

// Query a specific student
router.get('/single', authCheck, (req, res) => {
  if(req.query.name != null && req.session.user.access > 0) {
    console.log(req.session.user.name + " looked up scores for " + req.query.name);
    res.render('checkScores', {user: req.session.user, queryName: req.query.name});
  } else {
    res.render('checkScores', {user: req.session.user});
  }
});

module.exports = router;
