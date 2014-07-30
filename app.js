

/***/
global.path = require('path');

/***/
global.Q = require('q');

/***/
global._ = require('underscore');
_.longStackSupport = true;

/***/
global.assert = require('assert');

// Start sails and pass it command line arguments
var sails;
(sails = require('sails')).lift(require('optimist').argv);


