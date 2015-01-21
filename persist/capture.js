
var Schema = require('jugglingdb').Schema;
var isTesting = process.env.NODE_ENV == 'test';

module.exports = {
  id: String, // Same as "capture"
  expectedRevision: Schema.JSON,
  capture: String, // A hash of "captureName"
  captureName: String, // A short file path to a capture (without revision directory)
  updatedBy: {
    type: String, // User ID
    default: 'system'
  },
  updatedAt: {
    type: Date,
    default: function() { return new Date }
  }
};

