// add this file to .gitignore

module.exports = {
  mongodb: {
    //dbURI: 'mongodb://user:pass@ds261755.mlab.com:61755/students' // online
    dbURI: 'mongodb://localhost:27017/rap'    // local
  },
  session: {
    cookieKey: 'MullumRAP'
  }
}
