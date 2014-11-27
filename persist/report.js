
module.exports = {
  id: String, // revision:{revision}:capture:{capture}
  revision: String,
  capture: String,
  captureName: String,
  updatedAt: {
    type: Date,
    default: function() { return new Date }
  },

  // From "tidal-wave" module
  status: String, // "SUSPICIOUS" | "OK" | "ERROR"
  span: Number,
  threshold: Number,
  vector: [Object], // jugglingdb cannot do this: { x: Number, y: Number, dx: Number, dy: Number }],
  time: Number,
  target_image: String,
  expect_image: String

  // captureName: String,
  // modifiedStatus: {
  //   type: String, // "UNPROCESSED" | "IS_OK" | "IS_BUG"
  //   default: 'UNPROCESSED'
  // },
  // modifiedBy: String,
};

// TODO: Use virtual field?

