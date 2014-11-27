
module.exports = {
  id: String, // revision:{revision}:capture:{capture}
  expectedRevision: String,
  capture: String,
  captureName: String,
  updatedBy: {
    type: String, // User ID
    default: 'system'
  },
  updatedAt: {
    type: Date,
    default: function() { return new Date }
  }
};

