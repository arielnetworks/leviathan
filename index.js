
var path = require('path');


require('./app').launch({
  baseImageDir: path.resolve(__dirname, 'test/fixture'),
  relativeExpectedDir: 'expected',
  relativeTargetDirPrefix: 'revision'
});
