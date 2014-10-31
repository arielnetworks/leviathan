
module.exports = function(mongoose) {
  return mongoose.model('Capture', mongoose.Schema({
    id: String, // revision:{rid}:capture:{cid}
    revision: Number,
    capture: String,
    capture_name: String,

    status: String,
    vector: [ {} ],

    created_at: Date,
    updated_at: Date
  }));
};

// TODO: Use virtual field?

