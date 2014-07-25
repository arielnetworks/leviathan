/**
 * Difference
 *
 * @module      :: Model
 * @description :: A short summary of how this model works and what it represents.
 * @docs		:: http://sailsjs.org/#!documentation/models
 */

module.exports = {

  attributes: {
  	
    id: {
      primaryKey: true,
      type: 'string'
    }

  	/* e.g.
  	nickname: 'string'
  	*/
    
  },

  upsert: function(id, document) {
    return Difference.findOne(id)
    .then(function(doc) {
      return doc ?
          Difference.update(id, document).done(function() {}) :
          Difference.create(document).done(function() {});
    })
  }

};
