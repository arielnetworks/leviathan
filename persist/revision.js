
var isTesting = process.env.NODE_ENV == 'test';

module.exports = {
  id: String,
  total: Number,
  'UNPROCESSED': Number,
  'IS_OK': Number,
  'IS_BUG': Number,
  updatedAt: {
    type: Date,
    default: function() { return new Date }
  }
};
