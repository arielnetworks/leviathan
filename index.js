
var path = require('path');

// Setup global configuration
var configure = {
  PORT: process.env.PORT || 3000,
  // Example: "mongodb://localhost/leviathan"
  // If null, nedb (disk persistence). will be used.
  MONGODB: process.env.MONGODB || null,
  NEDB_PATH: process.env.NEDB_PATH || path.resolve(__dirname, 'nedb')
};

require('./app').launch(configure);
