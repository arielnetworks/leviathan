
var path = require('path');
var _ = require('underscore');
var request = require('supertest');
var assert = require('assert');

describe('Application', function() {

  var server;
  after(function() {
    if (server) {
      server.close();
      server = null;
    }
  });

  _.each(['nedb'], function(dbType) {
    
    it('should launch good in ' + dbType, function(done) {
      launchApplication(dbType).then(function(v) {
        server = v.server;
        request(v.app)
        .get('/revisions')
        .expect(200, done);
      })
    });

  })

});

function launchApplication(dbType) {
  var application = require('../app');
  var configure;
  switch(dbType) {
    case 'nedb':
      configure = {
        PORT: 3000,
        NEDB: path.resolve(__dirname, '.nedb')
      };
      break;
    case 'mongodb':
      configure = {
        PORT: 3000,
        MONGODB: process.env.MONGODB || null
      };
      break;
  }
  if (!configure) throw new Error('booom');
  return application.launch(configure);
}

