
var isTesting = process.env.NODE_ENV == 'test';

module.exports = {
  id: String, // revision:{rid}:capture:{cid}
  revision: Number,
  capture: String,
  captureName: String,
  modifiedStatus: String, // "UNPROCESSED" | "IS_OK" | "IS_BUG"
  modifiedBy: String,
  updatedAt: {
    type: Date,
    default: isTesting ?
        function() { return new Date('1970-01-01T00:00:00.000Z') } :
        function() { return new Date }
  },

  // From "tidal-wave" module
  status: String, // "SUSPICIOUS" | "OK" | "ERROR"
  span: Number,
  threshold: Number,
  vector: [Object], // jugglingdb cannot do this: { x: Number, y: Number, dx: Number, dy: Number }],
  time: Number,
  target_image: String,
  expect_image: String
};

// TODO: Use virtual field?

