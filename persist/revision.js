
var isTesting = process.env.NODE_ENV == 'test';

module.exports = {
  id: Number,
  updatedAt: {
    type: Date,
    default: isTesting ?
        function() { return new Date('1970-01-01T00:00:00.000Z') } :
        function() { return new Date }
  }
};
