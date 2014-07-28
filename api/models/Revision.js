/**
 * Revision
 *
 * @module      :: Model
 * @description :: A short summary of how this model works and what it represents.
 * @docs		:: http://sailsjs.org/#!documentation/models
 */

module.exports = {

  attributes: {

  	/* e.g.
  	nickname: 'string'
  	*/

  },

  afterCreate: afterUpsert,

  afterUpdate: afterUpsert,

  upsert: function(id, document) {
    return Difference.destroy({revision: id})
    .then(function() {
      return Revision.findOne(id);
    })
    .then(function(doc) {
      return doc ?
          Revision.update(id, document).done(function() {}) :
          Revision.create(document).done(function() {});
    });
  }

};

function afterUpsert(revision, next) {
  Q.all(_.map(revision.differences, function(difference, key) {
    var id = 'revision:' + revision.id + ':capture:' + key;
    var doc = _.extend(_.clone(difference), {
      id: id,
      revision: revision.id,
      capture: +key
    });
    return Difference.upsert(id, doc);
  }))
  .then(next);
}
