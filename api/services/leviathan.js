


/**
 * Care about Revision and Difference
 */

module.exports = {
  tidalwave: function (context) {
    return Difference.destroy({revision: context.id})
    .then(function() {
      return Q.all(_.map(context.differences, function (v, k) {
        var id = Difference.generateId(context.id, k);
        return Difference.upsertById(id, {}, { id: id }).get('id');
      }))
    })
    .then(function(differences) {
      context.differences = differences;
      return Revision.upsertById(context.id, context)
    })
  }
};
