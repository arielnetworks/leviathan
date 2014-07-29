/**
 * Difference
 *
 * @module      :: Model
 * @description :: A short summary of how this model works and what it represents.
 * @docs		:: http://sailsjs.org/#!documentation/models
 */

module.exports = _.extend({

  attributes: {
  	
    id: {
      primaryKey: true,
      type: 'string',
      unique: true
    }

  	/* e.g.
  	nickname: 'string'
  	*/
    
  },

  generateId: function (revision, capture) {
    return 'revision:' + revision + ':capture:' + capture;
  }

}, require('./common'));
