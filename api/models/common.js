
module.exports = {

  /**
   * @param {string} id
   * @return {Object}
   */
  upsertById: function(id, document) {
    var that = this;
    return that.findOne(id)
    .then(function(doc) {
      return doc ?
          that.update(id, document).toPromise().get(0) :
          that.create(document).toPromise();
    });
  },

  /**
   * @param {Object} condition
   * @return {Array.<Object>}
   */
  upsert: function(condition, document) {
    var that = this;
    return that.findOne(condition)
    .then(function(doc) {
      return doc ?
          that.update(condition, document).toPromise() :
          that.create(document).then(function(doc) { return [doc] });
    });
  }

};

