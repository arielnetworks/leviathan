
var path = require('path');

// Setup global configuration
var configure = {
  PORT: process.env.PORT || 3000,
  // Example: "mongodb://localhost/leviathan"
  // If null, nedb (disk persistence). will be used.
  MONGODB: process.env.MONGODB || null,
  NEDB_PATH: process.env.NEDB_PATH || path.resolve(__dirname, 'nedb')
};

var promiseLaunch = require('./app').launch(configure);
promiseLaunch.then(function(args) {
  console.log(args.server);
})

// console.log(app);
// 
// setTimeout(function() {
//   app.close();
// }, 3000);
