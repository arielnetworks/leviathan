
module.exports = function(mongoose) {
  return mongoose.model('Revision', mongoose.Schema({
    id: Number
  }));
};
