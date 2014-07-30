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
    },

    /**
     * 1: OK
     * 0: not-processed-yet
     * -1: NG
     */
    status: 'integer',

    result: 'array'

  	/* e.g.
  	nickname: 'string'
  	*/
    
  },

  generateId: function (revision, capture) {
    return this.md5Of('revision:' + revision + ':capture:' + capture);
  }

}, require('./common'));
