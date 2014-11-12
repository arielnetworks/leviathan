
var path = require('path');


require('./app').launch({
  port: process.env.PORT || 3000,
  baseImageDir: path.resolve(__dirname, 'test/fixture'),
  relativeExpectedDir: 'expected',
  relativeTargetDirPrefix: 'revision', // Optional
  db: {}
});
