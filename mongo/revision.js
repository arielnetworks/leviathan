
module.exports = function(mongoose) {
  return mongoose.model('Revision', mongoose.Schema({
    id: Number,
    created_at: Date,
    updated_at: Date
  }));
};
