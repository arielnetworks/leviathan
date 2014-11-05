
module.exports = {
  id: String, // revision:{rid}:capture:{cid}
  revision: Number,
  capture: String,
  captureName: String,
  modifiedStatus: String, // "UNPROCESSED" | "IS_OK" | "IS_BUG"
  modifiedBy: String,
  createdAt: Date,
  updatedAt: Date

  // From "tidal-wave" module
  status: String, // "SUSPICIOUS" | "OK" | "ERROR"
  vector: [{}]
};

// TODO: Use virtual field?

