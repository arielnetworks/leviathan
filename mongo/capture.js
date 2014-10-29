
module.exports = function(mongoose) {
  return mongoose.model('Capture', mongoose.Schema({
    id: String,
    revision: Number,
    capture: Number,
    capture_name: String,
    created_at: Date,
    updated_at: Date
  }));
};

// TODO: Use virtual field?

