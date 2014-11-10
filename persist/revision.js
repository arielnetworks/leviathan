
var isTesting = process.env.NODE_ENV == 'test';

module.exports = {
  id: String,
  updatedAt: {
    type: Date,
    default: function() { return new Date }
  }
};
