
module.exports = function(mongoose) {
  return mongoose.model('Conflict', mongoose.Schema({
    id: String,
    revision: Number,
    capture: Number,
    capture_name: String
  }));
};

// TODO: Use virtual field?

