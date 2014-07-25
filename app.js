

/***/
global.path = require('path');

/***/
global.fs = require('q-io/fs');

/***/
global.Q = require('q');

/***/
global._ = require('underscore');
_.longStackSupport = true;

/***/
global.assert = require('assert');

// Start sails and pass it command line arguments
require('sails').lift(require('optimist').argv);

