
var path = require('path');


require('./app').launch({
  port: process.env.PORT || 3000,
  expectedDir: path.resolve(__dirname, 'test/fixture/expected'),
  targetDirPrefix: path.resolve(__dirname, 'test/fixture/revision'),
  db: {}
});
