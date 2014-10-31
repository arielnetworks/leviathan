
module.exports = function(mongoose) {
  return mongoose.model('Capture', mongoose.Schema({
    id: String, // revision:{rid}:capture:{cid}
    revision: Number,
    capture: String,
    captureName: String,

    status: String,
    vector: [ {} ],

    createdAt: Date,
    updatedAt: Date
  }));
};

// TODO: Use virtual field?

