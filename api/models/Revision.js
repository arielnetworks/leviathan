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


  upsert: function(id, document) {
    var that = this;
    return that.findOne(id)
    .then(function(doc) {
      return doc ?
          that.update(id, document).toPromise() :
          that.create(document).then(function(doc) { return [doc] })
    });
  }

};

