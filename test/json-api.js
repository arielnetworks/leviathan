
var path = require('path');
var request = require('supertest');
var assert = require('assert');
var launched = require('../app').launch({
  PORT: 3000,
  NEDB_PATH: path.resolve(__dirname, 'nedb')
});

describe('Application', function() {

  var server;
  after(function() {
    if (server) {
      server.close();
      server = null;
    }
  });

  it('should launch good.', function(done) {
    launched.then(function(v) {
      server = v.server;
      request(v.app)
      .get('/revisions')
      .expect(200, done);
    })
  });

});
