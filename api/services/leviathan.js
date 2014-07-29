


/**
 * Care about Revision and Difference
 */

module.exports = {
  tidalwave: function (context) {
    return Difference.destroy({revision: context.id})
    .then(function() {
      return Q.all(_.map(context.differences, function (v, k) {
        var id = Difference.generateId(context.id, k);
        return Difference.upsert(id, _.extend({}, { id: id }))
      }))
    })
    .then(function(results) {
      context.differences = _.map(results, function(v) { return v[0] });
      return Revision.upsert(context.id, _.extend({}, context, {
        differences: _.map(context.differences, function(d) { return d.id })
      }))
    })
    .then(function(docs) {
      return docs[0];
    });
  }
};
