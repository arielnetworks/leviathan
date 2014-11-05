
var path = require('path');


require('./app').launch({
  port: process.env.PORT || 3000,
  db: {}
});
