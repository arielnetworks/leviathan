
var mongoose = require('mongoose');



// Establish mongodb connection
mongoose.connect('mongodb://localhost/leviathan');
var connection = module.exports.connection = mongoose.connection;
connection.on('error', console.error.bind(console, '***connection error:'));



// Expose schemas
module.exports.Schema = {};
['revision', 'capture'].forEach(function(name) {
  module.exports.Schema[name] = require('./' + name)(mongoose);
});

