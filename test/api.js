process.env.NODE_ENV = 'test';

var Path = require('path');
var request = require('supertest');
var _ = require('underscore');
var Q = require('q');
var tmp = require('../app').launch({
  baseImageDir: Path.resolve(__dirname, 'fixture'),
  relativeTargetDirPrefix: 'revision',
  port: 3491,
  mongodb: 'mongodb://127.0.0.1:27017/leviathan_test',
  sessionSecret: 'boom..'
});
var app = tmp.app;
var promiseLaunch = tmp.promiseLaunch;



describe('Application', function() {

  before(function() {
    return promiseLaunch.then(function() {
      var persist = require('../src/persist');
      return persist._destroy();
    });
  });
  // after(persist._destroy);

  describe('App', function() {
    it('should launch at least', function(done) {
      request(app)
        .get('/api/revisions')
        .expect(200)
        .expect({
          "meta": {
            "skip": 0,
            "limit": 20,
            "total": 0
          },
          "items": []
        }, done);
    });
  });

  describe('When first and only revision is registered, ', function() {

    it('POST /api/tidal-wave/1 registers a revision', function(done) {
      request(app)
        .post('/api/tidal-wave/1')
        .send({
          "revisionAt": 1000
        })
        .expect(200)
        .expect({
          "data": 2,
          "error": 0,
          "request": 2
        }, done);
    });

    it('GET /api/revisions', function(done) {
      request(app)
        .get('/api/revisions')
        .expect(200)
        .expect({
          "meta": {
            "skip": 0,
            "limit": 20,
            "total": 1
          },
          "items": [{
            "id": '1',
            "revisionAt": '1970-01-01T00:00:01.000Z',
            "updatedAt": '1970-01-01T00:00:00.000Z',
            "total": 2,
            "checkedAs": {
              "IS_BUG": 0,
              "IS_OK": 2,
              "UNPROCESSED": 0
            },
            "reportedAs": {
              "ERROR": 0,
              "OK": 2,
              "SUSPICIOUS": 0
            },
            'UNPROCESSED && !OK': 0
          }]
        }, done);

    });

    it('GET /api/revisions/1', function(done) {
      request(app)
        .get('/api/revisions/1')
        .expect(200)
        .expect({
          "current": {
            "id": "1",
            "revisionAt": "1970-01-01T00:00:01.000Z",
            "updatedAt": "1970-01-01T00:00:00.000Z",
            "total": 2,
            "checkedAs": {
              "UNPROCESSED": 0,
              "IS_OK": 2,
              "IS_BUG": 0
            },
            "reportedAs": {
              "OK": 2,
              "SUSPICIOUS": 0,
              "ERROR": 0
            },
            "UNPROCESSED && !OK": 0
          }
        }, done)
    });

    it('GET /api/revisions/1/captures', function(done) {
      request(app)
        .get('/api/revisions/1/captures')
        .expect(200)
        .expect({
          "meta": {
            "skip": 0,
            "limit": 20,
            "total": 2
          },
          "items": [{
            "capture": 'd559beb5c41a96d2982f42deda2a2528',
            "revision": '1',
            "status": 'OK',
            "span": 10,
            "threshold": 5,
            "expect_image": 'revision1/scenario1/setting.png',
            "target_image": 'revision1/scenario1/setting.png',
            "time": 0.1,
            "height": 287,
            "width": 413,
            "vector": [],
            "captureName": 'scenario1/setting.png',
            "checkedAs": 'IS_OK',
            "revisionAt": '1970-01-01T00:00:01.000Z',
            "updatedBy": 'system',
            "updatedAt": '1970-01-01T00:00:00.000Z'
          }, {
            "capture": '4e87a40e30f483b5712e2f97254d7e48',
            "revision": '1',
            "status": 'OK',
            "span": 10,
            "threshold": 5,
            "expect_image": 'revision1/scenario2/canvas.png',
            "target_image": 'revision1/scenario2/canvas.png',
            "time": 0.1,
            "height": 544,
            "width": 713,
            "vector": [],
            "captureName": 'scenario2/canvas.png',
            "checkedAs": 'IS_OK',
            "revisionAt": '1970-01-01T00:00:01.000Z',
            "updatedBy": 'system',
            "updatedAt": '1970-01-01T00:00:00.000Z'
          }],
          "current": {
            "id": '1',
            "revisionAt": '1970-01-01T00:00:01.000Z',
            "updatedAt": '1970-01-01T00:00:00.000Z',
            "total": 2,
            "checkedAs": {
              "UNPROCESSED": 0,
              "IS_OK": 2,
              "IS_BUG": 0
            },
            "reportedAs": {
              "OK": 2,
              "SUSPICIOUS": 0,
              "ERROR": 0
            },
            'UNPROCESSED && !OK': 0
          }
        }, done);
    });

    it('GET /api/revisions/1/captures/d559beb5c41a96d2982f42deda2a2528', function(done) {
      request(app)
        .get('/api/revisions/1/captures/d559beb5c41a96d2982f42deda2a2528')
        .expect(200)
        .expect({
          "current": {
            "capture": "d559beb5c41a96d2982f42deda2a2528",
            "revision": "1",
            "status": "OK",
            "span": 10,
            "threshold": 5,
            "expect_image": "revision1/scenario1/setting.png",
            "target_image": "revision1/scenario1/setting.png",
            "time": 0.1,
            "height": 287,
            "width": 413,
            "vector": [],
            "captureName": "scenario1/setting.png",
            "checkedAs": "IS_OK",
            "revisionAt": "1970-01-01T00:00:01.000Z",
            "updatedBy": "system",
            "updatedAt": "1970-01-01T00:00:00.000Z",
            "@siblings": {}
          }
        }, done)
    });

    it('GET /api/revisions/1/captures/4e87a40e30f483b5712e2f97254d7e48', function(done) {
      request(app)
        .get('/api/revisions/1/captures/4e87a40e30f483b5712e2f97254d7e48')
        .expect(200)
        .expect({
          "current": {
            "capture": "4e87a40e30f483b5712e2f97254d7e48",
            "revision": "1",
            "status": "OK",
            "span": 10,
            "threshold": 5,
            "expect_image": "revision1/scenario2/canvas.png",
            "target_image": "revision1/scenario2/canvas.png",
            "time": 0.1,
            "height": 544,
            "width": 713,
            "vector": [],
            "captureName": "scenario2/canvas.png",
            "checkedAs": "IS_OK",
            "revisionAt": "1970-01-01T00:00:01.000Z",
            "updatedBy": "system",
            "updatedAt": "1970-01-01T00:00:00.000Z",
            "@siblings": {}
          }
        }, done)

    });

  });

  describe('"page" parameter', function() {

    before(registerAllRevisions);

    it('GET /api/revisions returns page 1.', function(done) {
      request(app)
        .get('/api/revisions')
        .expect(200)
        .expect({
          "meta": {
            "skip": 0,
            "limit": 20,
            "total": 23
          },
          "items": [{
            "id": "23",
            "revisionAt": "1970-01-01T00:00:23.000Z",
            "updatedAt": "1970-01-01T00:00:00.000Z",
            "total": 2,
            "checkedAs": {
              "UNPROCESSED": 2,
              "IS_OK": 0,
              "IS_BUG": 0
            },
            "reportedAs": {
              "OK": 2,
              "SUSPICIOUS": 0,
              "ERROR": 0
            },
            "UNPROCESSED && !OK": 0
          }, {
            "id": "22",
            "revisionAt": "1970-01-01T00:00:22.000Z",
            "updatedAt": "1970-01-01T00:00:00.000Z",
            "total": 2,
            "checkedAs": {
              "UNPROCESSED": 2,
              "IS_OK": 0,
              "IS_BUG": 0
            },
            "reportedAs": {
              "OK": 2,
              "SUSPICIOUS": 0,
              "ERROR": 0
            },
            "UNPROCESSED && !OK": 0
          }, {
            "id": "21",
            "revisionAt": "1970-01-01T00:00:21.000Z",
            "updatedAt": "1970-01-01T00:00:00.000Z",
            "total": 2,
            "checkedAs": {
              "UNPROCESSED": 2,
              "IS_OK": 0,
              "IS_BUG": 0
            },
            "reportedAs": {
              "OK": 2,
              "SUSPICIOUS": 0,
              "ERROR": 0
            },
            "UNPROCESSED && !OK": 0
          }, {
            "id": "20",
            "revisionAt": "1970-01-01T00:00:20.000Z",
            "updatedAt": "1970-01-01T00:00:00.000Z",
            "total": 2,
            "checkedAs": {
              "UNPROCESSED": 2,
              "IS_OK": 0,
              "IS_BUG": 0
            },
            "reportedAs": {
              "OK": 2,
              "SUSPICIOUS": 0,
              "ERROR": 0
            },
            "UNPROCESSED && !OK": 0
          }, {
            "id": "19",
            "revisionAt": "1970-01-01T00:00:19.000Z",
            "updatedAt": "1970-01-01T00:00:00.000Z",
            "total": 2,
            "checkedAs": {
              "UNPROCESSED": 2,
              "IS_OK": 0,
              "IS_BUG": 0
            },
            "reportedAs": {
              "OK": 2,
              "SUSPICIOUS": 0,
              "ERROR": 0
            },
            "UNPROCESSED && !OK": 0
          }, {
            "id": "18",
            "revisionAt": "1970-01-01T00:00:18.000Z",
            "updatedAt": "1970-01-01T00:00:00.000Z",
            "total": 2,
            "checkedAs": {
              "UNPROCESSED": 2,
              "IS_OK": 0,
              "IS_BUG": 0
            },
            "reportedAs": {
              "OK": 2,
              "SUSPICIOUS": 0,
              "ERROR": 0
            },
            "UNPROCESSED && !OK": 0
          }, {
            "id": "17",
            "revisionAt": "1970-01-01T00:00:17.000Z",
            "updatedAt": "1970-01-01T00:00:00.000Z",
            "total": 2,
            "checkedAs": {
              "UNPROCESSED": 2,
              "IS_OK": 0,
              "IS_BUG": 0
            },
            "reportedAs": {
              "OK": 2,
              "SUSPICIOUS": 0,
              "ERROR": 0
            },
            "UNPROCESSED && !OK": 0
          }, {
            "id": "16",
            "revisionAt": "1970-01-01T00:00:16.000Z",
            "updatedAt": "1970-01-01T00:00:00.000Z",
            "total": 2,
            "checkedAs": {
              "UNPROCESSED": 2,
              "IS_OK": 0,
              "IS_BUG": 0
            },
            "reportedAs": {
              "OK": 2,
              "SUSPICIOUS": 0,
              "ERROR": 0
            },
            "UNPROCESSED && !OK": 0
          }, {
            "id": "15",
            "revisionAt": "1970-01-01T00:00:15.000Z",
            "updatedAt": "1970-01-01T00:00:00.000Z",
            "total": 2,
            "checkedAs": {
              "UNPROCESSED": 2,
              "IS_OK": 0,
              "IS_BUG": 0
            },
            "reportedAs": {
              "OK": 2,
              "SUSPICIOUS": 0,
              "ERROR": 0
            },
            "UNPROCESSED && !OK": 0
          }, {
            "id": "14",
            "revisionAt": "1970-01-01T00:00:14.000Z",
            "updatedAt": "1970-01-01T00:00:00.000Z",
            "total": 2,
            "checkedAs": {
              "UNPROCESSED": 2,
              "IS_OK": 0,
              "IS_BUG": 0
            },
            "reportedAs": {
              "OK": 2,
              "SUSPICIOUS": 0,
              "ERROR": 0
            },
            "UNPROCESSED && !OK": 0
          }, {
            "id": "13",
            "revisionAt": "1970-01-01T00:00:13.000Z",
            "updatedAt": "1970-01-01T00:00:00.000Z",
            "total": 2,
            "checkedAs": {
              "UNPROCESSED": 2,
              "IS_OK": 0,
              "IS_BUG": 0
            },
            "reportedAs": {
              "OK": 2,
              "SUSPICIOUS": 0,
              "ERROR": 0
            },
            "UNPROCESSED && !OK": 0
          }, {
            "id": "12",
            "revisionAt": "1970-01-01T00:00:12.000Z",
            "updatedAt": "1970-01-01T00:00:00.000Z",
            "total": 2,
            "checkedAs": {
              "UNPROCESSED": 2,
              "IS_OK": 0,
              "IS_BUG": 0
            },
            "reportedAs": {
              "OK": 2,
              "SUSPICIOUS": 0,
              "ERROR": 0
            },
            "UNPROCESSED && !OK": 0
          }, {
            "id": "11",
            "revisionAt": "1970-01-01T00:00:11.000Z",
            "updatedAt": "1970-01-01T00:00:00.000Z",
            "total": 2,
            "checkedAs": {
              "UNPROCESSED": 2,
              "IS_OK": 0,
              "IS_BUG": 0
            },
            "reportedAs": {
              "OK": 2,
              "SUSPICIOUS": 0,
              "ERROR": 0
            },
            "UNPROCESSED && !OK": 0
          }, {
            "id": "10",
            "revisionAt": "1970-01-01T00:00:10.000Z",
            "updatedAt": "1970-01-01T00:00:00.000Z",
            "total": 2,
            "checkedAs": {
              "UNPROCESSED": 2,
              "IS_OK": 0,
              "IS_BUG": 0
            },
            "reportedAs": {
              "OK": 2,
              "SUSPICIOUS": 0,
              "ERROR": 0
            },
            "UNPROCESSED && !OK": 0
          }, {
            "id": "9",
            "revisionAt": "1970-01-01T00:00:09.000Z",
            "updatedAt": "1970-01-01T00:00:00.000Z",
            "total": 2,
            "checkedAs": {
              "UNPROCESSED": 2,
              "IS_OK": 0,
              "IS_BUG": 0
            },
            "reportedAs": {
              "OK": 1,
              "SUSPICIOUS": 1,
              "ERROR": 0
            },
            "UNPROCESSED && !OK": 1
          }, {
            "id": "8",
            "revisionAt": "1970-01-01T00:00:08.000Z",
            "updatedAt": "1970-01-01T00:00:00.000Z",
            "total": 2,
            "checkedAs": {
              "UNPROCESSED": 2,
              "IS_OK": 0,
              "IS_BUG": 0
            },
            "reportedAs": {
              "OK": 2,
              "SUSPICIOUS": 0,
              "ERROR": 0
            },
            "UNPROCESSED && !OK": 0
          }, {
            "id": "7",
            "revisionAt": "1970-01-01T00:00:07.000Z",
            "updatedAt": "1970-01-01T00:00:00.000Z",
            "total": 2,
            "checkedAs": {
              "UNPROCESSED": 2,
              "IS_OK": 0,
              "IS_BUG": 0
            },
            "reportedAs": {
              "OK": 2,
              "SUSPICIOUS": 0,
              "ERROR": 0
            },
            "UNPROCESSED && !OK": 0
          }, {
            "id": "6",
            "revisionAt": "1970-01-01T00:00:06.000Z",
            "updatedAt": "1970-01-01T00:00:00.000Z",
            "total": 2,
            "checkedAs": {
              "UNPROCESSED": 2,
              "IS_OK": 0,
              "IS_BUG": 0
            },
            "reportedAs": {
              "OK": 1,
              "SUSPICIOUS": 1,
              "ERROR": 0
            },
            "UNPROCESSED && !OK": 1
          }, {
            "id": "5",
            "revisionAt": "1970-01-01T00:00:05.000Z",
            "updatedAt": "1970-01-01T00:00:00.000Z",
            "total": 2,
            "checkedAs": {
              "UNPROCESSED": 2,
              "IS_OK": 0,
              "IS_BUG": 0
            },
            "reportedAs": {
              "OK": 1,
              "SUSPICIOUS": 1,
              "ERROR": 0
            },
            "UNPROCESSED && !OK": 1
          }, {
            "id": "4",
            "revisionAt": "1970-01-01T00:00:04.000Z",
            "updatedAt": "1970-01-01T00:00:00.000Z",
            "total": 2,
            "checkedAs": {
              "UNPROCESSED": 2,
              "IS_OK": 0,
              "IS_BUG": 0
            },
            "reportedAs": {
              "OK": 1,
              "SUSPICIOUS": 1,
              "ERROR": 0
            },
            "UNPROCESSED && !OK": 1
          }]
        }, done);

    });

    it('GET /api/revisions?page=2 returns page 2.', function(done) {
      request(app)
        .get('/api/revisions?page=2')
        .expect(200)
        .expect({
          "meta": {
            "skip": 20,
            "limit": 20,
            "total": 23
          },
          "items": [{
            "id": "3",
            "revisionAt": "1970-01-01T00:00:03.000Z",
            "updatedAt": "1970-01-01T00:00:00.000Z",
            "total": 2,
            "checkedAs": {
              "UNPROCESSED": 2,
              "IS_OK": 0,
              "IS_BUG": 0
            },
            "reportedAs": {
              "OK": 2,
              "SUSPICIOUS": 0,
              "ERROR": 0
            },
            "UNPROCESSED && !OK": 0
          }, {
            "id": "2",
            "revisionAt": "1970-01-01T00:00:02.000Z",
            "updatedAt": "1970-01-01T00:00:00.000Z",
            "total": 2,
            "checkedAs": {
              "UNPROCESSED": 2,
              "IS_OK": 0,
              "IS_BUG": 0
            },
            "reportedAs": {
              "OK": 2,
              "SUSPICIOUS": 0,
              "ERROR": 0
            },
            "UNPROCESSED && !OK": 0
          }, {
            "id": "1",
            "revisionAt": "1970-01-01T00:00:01.000Z",
            "updatedAt": "1970-01-01T00:00:00.000Z",
            "total": 2,
            "checkedAs": {
              "UNPROCESSED": 0,
              "IS_OK": 2,
              "IS_BUG": 0
            },
            "reportedAs": {
              "OK": 2,
              "SUSPICIOUS": 0,
              "ERROR": 0
            },
            "UNPROCESSED && !OK": 0
          }]
        }, done);

    });

    it('GET /api/captures', function(done) {
      request(app)
        .get('/api/captures')
        .expect(200)
        .expect({
          "items": [{
            "_id": "d559beb5c41a96d2982f42deda2a2528",
            "updatedAt": "1970-01-01T00:00:00.000Z",
            "updatedBy": "system",
            "expectedRevisions": ["1"]
          }, {
            "_id": "4e87a40e30f483b5712e2f97254d7e48",
            "updatedAt": "1970-01-01T00:00:00.000Z",
            "updatedBy": "system",
            "expectedRevisions": ["1"]
          }]
        }, done)
    });

  });

  describe('"order" parameter', function() {

    it('GET /api/revisions?order=revisionAt:ascending returns ascending order.', function(done) {
      request(app)
        .get('/api/revisions?order=revisionAt%3Aascending')
        .expect(200)
        .expect({
          "meta": {
            "skip": 0,
            "limit": 20,
            "total": 23
          },
          "items": [{
            "id": "1",
            "revisionAt": "1970-01-01T00:00:01.000Z",
            "updatedAt": "1970-01-01T00:00:00.000Z",
            "total": 2,
            "checkedAs": {
              "UNPROCESSED": 0,
              "IS_OK": 2,
              "IS_BUG": 0
            },
            "reportedAs": {
              "OK": 2,
              "SUSPICIOUS": 0,
              "ERROR": 0
            },
            "UNPROCESSED && !OK": 0
          }, {
            "id": "2",
            "revisionAt": "1970-01-01T00:00:02.000Z",
            "updatedAt": "1970-01-01T00:00:00.000Z",
            "total": 2,
            "checkedAs": {
              "UNPROCESSED": 2,
              "IS_OK": 0,
              "IS_BUG": 0
            },
            "reportedAs": {
              "OK": 2,
              "SUSPICIOUS": 0,
              "ERROR": 0
            },
            "UNPROCESSED && !OK": 0
          }, {
            "id": "3",
            "revisionAt": "1970-01-01T00:00:03.000Z",
            "updatedAt": "1970-01-01T00:00:00.000Z",
            "total": 2,
            "checkedAs": {
              "UNPROCESSED": 2,
              "IS_OK": 0,
              "IS_BUG": 0
            },
            "reportedAs": {
              "OK": 2,
              "SUSPICIOUS": 0,
              "ERROR": 0
            },
            "UNPROCESSED && !OK": 0
          }, {
            "id": "4",
            "revisionAt": "1970-01-01T00:00:04.000Z",
            "updatedAt": "1970-01-01T00:00:00.000Z",
            "total": 2,
            "checkedAs": {
              "UNPROCESSED": 2,
              "IS_OK": 0,
              "IS_BUG": 0
            },
            "reportedAs": {
              "OK": 1,
              "SUSPICIOUS": 1,
              "ERROR": 0
            },
            "UNPROCESSED && !OK": 1
          }, {
            "id": "5",
            "revisionAt": "1970-01-01T00:00:05.000Z",
            "updatedAt": "1970-01-01T00:00:00.000Z",
            "total": 2,
            "checkedAs": {
              "UNPROCESSED": 2,
              "IS_OK": 0,
              "IS_BUG": 0
            },
            "reportedAs": {
              "OK": 1,
              "SUSPICIOUS": 1,
              "ERROR": 0
            },
            "UNPROCESSED && !OK": 1
          }, {
            "id": "6",
            "revisionAt": "1970-01-01T00:00:06.000Z",
            "updatedAt": "1970-01-01T00:00:00.000Z",
            "total": 2,
            "checkedAs": {
              "UNPROCESSED": 2,
              "IS_OK": 0,
              "IS_BUG": 0
            },
            "reportedAs": {
              "OK": 1,
              "SUSPICIOUS": 1,
              "ERROR": 0
            },
            "UNPROCESSED && !OK": 1
          }, {
            "id": "7",
            "revisionAt": "1970-01-01T00:00:07.000Z",
            "updatedAt": "1970-01-01T00:00:00.000Z",
            "total": 2,
            "checkedAs": {
              "UNPROCESSED": 2,
              "IS_OK": 0,
              "IS_BUG": 0
            },
            "reportedAs": {
              "OK": 2,
              "SUSPICIOUS": 0,
              "ERROR": 0
            },
            "UNPROCESSED && !OK": 0
          }, {
            "id": "8",
            "revisionAt": "1970-01-01T00:00:08.000Z",
            "updatedAt": "1970-01-01T00:00:00.000Z",
            "total": 2,
            "checkedAs": {
              "UNPROCESSED": 2,
              "IS_OK": 0,
              "IS_BUG": 0
            },
            "reportedAs": {
              "OK": 2,
              "SUSPICIOUS": 0,
              "ERROR": 0
            },
            "UNPROCESSED && !OK": 0
          }, {
            "id": "9",
            "revisionAt": "1970-01-01T00:00:09.000Z",
            "updatedAt": "1970-01-01T00:00:00.000Z",
            "total": 2,
            "checkedAs": {
              "UNPROCESSED": 2,
              "IS_OK": 0,
              "IS_BUG": 0
            },
            "reportedAs": {
              "OK": 1,
              "SUSPICIOUS": 1,
              "ERROR": 0
            },
            "UNPROCESSED && !OK": 1
          }, {
            "id": "10",
            "revisionAt": "1970-01-01T00:00:10.000Z",
            "updatedAt": "1970-01-01T00:00:00.000Z",
            "total": 2,
            "checkedAs": {
              "UNPROCESSED": 2,
              "IS_OK": 0,
              "IS_BUG": 0
            },
            "reportedAs": {
              "OK": 2,
              "SUSPICIOUS": 0,
              "ERROR": 0
            },
            "UNPROCESSED && !OK": 0
          }, {
            "id": "11",
            "revisionAt": "1970-01-01T00:00:11.000Z",
            "updatedAt": "1970-01-01T00:00:00.000Z",
            "total": 2,
            "checkedAs": {
              "UNPROCESSED": 2,
              "IS_OK": 0,
              "IS_BUG": 0
            },
            "reportedAs": {
              "OK": 2,
              "SUSPICIOUS": 0,
              "ERROR": 0
            },
            "UNPROCESSED && !OK": 0
          }, {
            "id": "12",
            "revisionAt": "1970-01-01T00:00:12.000Z",
            "updatedAt": "1970-01-01T00:00:00.000Z",
            "total": 2,
            "checkedAs": {
              "UNPROCESSED": 2,
              "IS_OK": 0,
              "IS_BUG": 0
            },
            "reportedAs": {
              "OK": 2,
              "SUSPICIOUS": 0,
              "ERROR": 0
            },
            "UNPROCESSED && !OK": 0
          }, {
            "id": "13",
            "revisionAt": "1970-01-01T00:00:13.000Z",
            "updatedAt": "1970-01-01T00:00:00.000Z",
            "total": 2,
            "checkedAs": {
              "UNPROCESSED": 2,
              "IS_OK": 0,
              "IS_BUG": 0
            },
            "reportedAs": {
              "OK": 2,
              "SUSPICIOUS": 0,
              "ERROR": 0
            },
            "UNPROCESSED && !OK": 0
          }, {
            "id": "14",
            "revisionAt": "1970-01-01T00:00:14.000Z",
            "updatedAt": "1970-01-01T00:00:00.000Z",
            "total": 2,
            "checkedAs": {
              "UNPROCESSED": 2,
              "IS_OK": 0,
              "IS_BUG": 0
            },
            "reportedAs": {
              "OK": 2,
              "SUSPICIOUS": 0,
              "ERROR": 0
            },
            "UNPROCESSED && !OK": 0
          }, {
            "id": "15",
            "revisionAt": "1970-01-01T00:00:15.000Z",
            "updatedAt": "1970-01-01T00:00:00.000Z",
            "total": 2,
            "checkedAs": {
              "UNPROCESSED": 2,
              "IS_OK": 0,
              "IS_BUG": 0
            },
            "reportedAs": {
              "OK": 2,
              "SUSPICIOUS": 0,
              "ERROR": 0
            },
            "UNPROCESSED && !OK": 0
          }, {
            "id": "16",
            "revisionAt": "1970-01-01T00:00:16.000Z",
            "updatedAt": "1970-01-01T00:00:00.000Z",
            "total": 2,
            "checkedAs": {
              "UNPROCESSED": 2,
              "IS_OK": 0,
              "IS_BUG": 0
            },
            "reportedAs": {
              "OK": 2,
              "SUSPICIOUS": 0,
              "ERROR": 0
            },
            "UNPROCESSED && !OK": 0
          }, {
            "id": "17",
            "revisionAt": "1970-01-01T00:00:17.000Z",
            "updatedAt": "1970-01-01T00:00:00.000Z",
            "total": 2,
            "checkedAs": {
              "UNPROCESSED": 2,
              "IS_OK": 0,
              "IS_BUG": 0
            },
            "reportedAs": {
              "OK": 2,
              "SUSPICIOUS": 0,
              "ERROR": 0
            },
            "UNPROCESSED && !OK": 0
          }, {
            "id": "18",
            "revisionAt": "1970-01-01T00:00:18.000Z",
            "updatedAt": "1970-01-01T00:00:00.000Z",
            "total": 2,
            "checkedAs": {
              "UNPROCESSED": 2,
              "IS_OK": 0,
              "IS_BUG": 0
            },
            "reportedAs": {
              "OK": 2,
              "SUSPICIOUS": 0,
              "ERROR": 0
            },
            "UNPROCESSED && !OK": 0
          }, {
            "id": "19",
            "revisionAt": "1970-01-01T00:00:19.000Z",
            "updatedAt": "1970-01-01T00:00:00.000Z",
            "total": 2,
            "checkedAs": {
              "UNPROCESSED": 2,
              "IS_OK": 0,
              "IS_BUG": 0
            },
            "reportedAs": {
              "OK": 2,
              "SUSPICIOUS": 0,
              "ERROR": 0
            },
            "UNPROCESSED && !OK": 0
          }, {
            "id": "20",
            "revisionAt": "1970-01-01T00:00:20.000Z",
            "updatedAt": "1970-01-01T00:00:00.000Z",
            "total": 2,
            "checkedAs": {
              "UNPROCESSED": 2,
              "IS_OK": 0,
              "IS_BUG": 0
            },
            "reportedAs": {
              "OK": 2,
              "SUSPICIOUS": 0,
              "ERROR": 0
            },
            "UNPROCESSED && !OK": 0
          }]
        }, done)

    });

  });

  describe('Post "changeAs"', function() {

    it('"checkedAs" should be "IS_BUG"', function(done) {
      request(app)
        .post('/api/revisions/4/captures/d559beb5c41a96d2982f42deda2a2528')
        .send({
          "checkedAs": 'IS_BUG'
        })
        .expect({
          "current": {
            "capture": "d559beb5c41a96d2982f42deda2a2528",
            "revision": "4",
            "status": "SUSPICIOUS",
            "span": 10,
            "threshold": 5,
            "expect_image": "revision3/scenario1/setting.png",
            "target_image": "revision4/scenario1/setting.png",
            "time": 0.1,
            "height": 287,
            "width": 413,
            "vector": [{
              "x": 80,
              "y": 130,
              "dx": -10.588767051696777,
              "dy": 0.21128489077091217
            }, {
              "x": 90,
              "y": 130,
              "dx": -6.585290431976318,
              "dy": -0.08819150179624557
            }, {
              "x": 80,
              "y": 140,
              "dx": -11.487329483032227,
              "dy": 0.027357453480362892
            }, {
              "x": 90,
              "y": 140,
              "dx": -6.965066909790039,
              "dy": -0.20984062552452087
            }, {
              "x": 150,
              "y": 140,
              "dx": -6.915441036224365,
              "dy": -0.18180334568023682
            }, {
              "x": 160,
              "y": 140,
              "dx": -5.391066551208496,
              "dy": -0.019559767097234726
            }, {
              "x": 80,
              "y": 150,
              "dx": -11.042485237121582,
              "dy": -0.14318007230758667
            }, {
              "x": 90,
              "y": 150,
              "dx": -7.9087018966674805,
              "dy": -0.45151108503341675
            }, {
              "x": 150,
              "y": 150,
              "dx": -7.083597183227539,
              "dy": 0.05295655131340027
            }, {
              "x": 160,
              "y": 150,
              "dx": -5.293422222137451,
              "dy": 0.019966593012213707
            }, {
              "x": 70,
              "y": 160,
              "dx": 4.009397029876709,
              "dy": 4.2715325355529785
            }, {
              "x": 80,
              "y": 160,
              "dx": 3.1682729721069336,
              "dy": 5.371302604675293
            }, {
              "x": 100,
              "y": 160,
              "dx": -4.593771934509277,
              "dy": 3.109616994857788
            }, {
              "x": 110,
              "y": 160,
              "dx": -9.270939826965332,
              "dy": 3.2318742275238037
            }, {
              "x": 140,
              "y": 160,
              "dx": -7.462734222412109,
              "dy": 1.1068710088729858
            }, {
              "x": 150,
              "y": 160,
              "dx": -5.1640625,
              "dy": 0.3225458860397339
            }, {
              "x": 210,
              "y": 160,
              "dx": 4.887204170227051,
              "dy": 1.5841692686080933
            }, {
              "x": 220,
              "y": 160,
              "dx": 6.97722864151001,
              "dy": 2.3452770709991455
            }, {
              "x": 230,
              "y": 160,
              "dx": 4.777827262878418,
              "dy": 1.8913748264312744
            }, {
              "x": 310,
              "y": 160,
              "dx": -7.742730617523193,
              "dy": 2.3997392654418945
            }, {
              "x": 320,
              "y": 160,
              "dx": -8.056294441223145,
              "dy": 0.7136588096618652
            }, {
              "x": 70,
              "y": 170,
              "dx": 5.763466835021973,
              "dy": 2.289579153060913
            }, {
              "x": 100,
              "y": 170,
              "dx": -5.154594421386719,
              "dy": 1.0610947608947754
            }, {
              "x": 110,
              "y": 170,
              "dx": -8.850627899169922,
              "dy": 1.09554922580719
            }, {
              "x": 130,
              "y": 170,
              "dx": -5.16828727722168,
              "dy": 0.07046306133270264
            }, {
              "x": 140,
              "y": 170,
              "dx": -7.269974708557129,
              "dy": 0.3918849229812622
            }, {
              "x": 150,
              "y": 170,
              "dx": -6.64382266998291,
              "dy": 0.031145503744482994
            }, {
              "x": 210,
              "y": 170,
              "dx": 6.374290466308594,
              "dy": 0.5819551944732666
            }, {
              "x": 220,
              "y": 170,
              "dx": 7.661487102508545,
              "dy": 0.741302490234375
            }, {
              "x": 230,
              "y": 170,
              "dx": 5.565219402313232,
              "dy": 0.020863329991698265
            }, {
              "x": 310,
              "y": 170,
              "dx": -7.019439697265625,
              "dy": 1.8093390464782715
            }, {
              "x": 320,
              "y": 170,
              "dx": -9.34312629699707,
              "dy": 0.1560337394475937
            }, {
              "x": 70,
              "y": 180,
              "dx": 5.863265037536621,
              "dy": -4.719114780426025
            }, {
              "x": 80,
              "y": 180,
              "dx": 3.566934823989868,
              "dy": -3.6106321811676025
            }, {
              "x": 100,
              "y": 180,
              "dx": -5.396617412567139,
              "dy": -1.5499566793441772
            }, {
              "x": 110,
              "y": 180,
              "dx": -9.824209213256836,
              "dy": -1.7882658243179321
            }, {
              "x": 120,
              "y": 180,
              "dx": -4.858380317687988,
              "dy": -2.6533305644989014
            }, {
              "x": 130,
              "y": 180,
              "dx": -4.617563247680664,
              "dy": -2.2942490577697754
            }, {
              "x": 140,
              "y": 180,
              "dx": -6.716089725494385,
              "dy": -2.358243942260742
            }, {
              "x": 150,
              "y": 180,
              "dx": -5.227489471435547,
              "dy": -0.5965059399604797
            }, {
              "x": 210,
              "y": 180,
              "dx": 6.644838809967041,
              "dy": -1.9240751266479492
            }, {
              "x": 220,
              "y": 180,
              "dx": 8.212990760803223,
              "dy": -2.645220994949341
            }, {
              "x": 230,
              "y": 180,
              "dx": 5.624647617340088,
              "dy": -1.4263155460357666
            }, {
              "x": 310,
              "y": 180,
              "dx": -5.511805057525635,
              "dy": -1.1214256286621094
            }, {
              "x": 320,
              "y": 180,
              "dx": -7.112335205078125,
              "dy": 0.11561820656061172
            }],
            "captureName": "scenario1/setting.png",
            "checkedAs": "IS_BUG",
            "revisionAt": "1970-01-01T00:00:04.000Z",
            "updatedBy": "system",
            "updatedAt": "1970-01-01T00:00:00.000Z",
            "@siblings": {}
          }
        }, done)
    });

    it('"UNPROCESSED && !OK": 0', function(done) {
      request(app)
        .get('/api/revisions/4')
        .send({
          "checkedAs": 'IS_BUG'
        })
        .expect({
          "current": {
            "id": "4",
            "revisionAt": "1970-01-01T00:00:04.000Z",
            "updatedAt": "1970-01-01T00:00:00.000Z",
            "total": 2,
            "checkedAs": {
              "UNPROCESSED": 1,
              "IS_OK": 0,
              "IS_BUG": 1
            },
            "reportedAs": {
              "OK": 1,
              "SUSPICIOUS": 1,
              "ERROR": 0
            },
            "UNPROCESSED && !OK": 0
          }
        }, done)
    });

    it('"checkedAs" should be "UNPROCESSED"', function(done) {
      request(app)
        .post('/api/revisions/4/captures/d559beb5c41a96d2982f42deda2a2528')
        .send({
          "checkedAs": 'UNPROCESSED'
        })
        .expect({
          "current": {
            "capture": "d559beb5c41a96d2982f42deda2a2528",
            "revision": "4",
            "status": "SUSPICIOUS",
            "span": 10,
            "threshold": 5,
            "expect_image": "revision3/scenario1/setting.png",
            "target_image": "revision4/scenario1/setting.png",
            "time": 0.1,
            "height": 287,
            "width": 413,
            "vector": [{
              "x": 80,
              "y": 130,
              "dx": -10.588767051696777,
              "dy": 0.21128489077091217
            }, {
              "x": 90,
              "y": 130,
              "dx": -6.585290431976318,
              "dy": -0.08819150179624557
            }, {
              "x": 80,
              "y": 140,
              "dx": -11.487329483032227,
              "dy": 0.027357453480362892
            }, {
              "x": 90,
              "y": 140,
              "dx": -6.965066909790039,
              "dy": -0.20984062552452087
            }, {
              "x": 150,
              "y": 140,
              "dx": -6.915441036224365,
              "dy": -0.18180334568023682
            }, {
              "x": 160,
              "y": 140,
              "dx": -5.391066551208496,
              "dy": -0.019559767097234726
            }, {
              "x": 80,
              "y": 150,
              "dx": -11.042485237121582,
              "dy": -0.14318007230758667
            }, {
              "x": 90,
              "y": 150,
              "dx": -7.9087018966674805,
              "dy": -0.45151108503341675
            }, {
              "x": 150,
              "y": 150,
              "dx": -7.083597183227539,
              "dy": 0.05295655131340027
            }, {
              "x": 160,
              "y": 150,
              "dx": -5.293422222137451,
              "dy": 0.019966593012213707
            }, {
              "x": 70,
              "y": 160,
              "dx": 4.009397029876709,
              "dy": 4.2715325355529785
            }, {
              "x": 80,
              "y": 160,
              "dx": 3.1682729721069336,
              "dy": 5.371302604675293
            }, {
              "x": 100,
              "y": 160,
              "dx": -4.593771934509277,
              "dy": 3.109616994857788
            }, {
              "x": 110,
              "y": 160,
              "dx": -9.270939826965332,
              "dy": 3.2318742275238037
            }, {
              "x": 140,
              "y": 160,
              "dx": -7.462734222412109,
              "dy": 1.1068710088729858
            }, {
              "x": 150,
              "y": 160,
              "dx": -5.1640625,
              "dy": 0.3225458860397339
            }, {
              "x": 210,
              "y": 160,
              "dx": 4.887204170227051,
              "dy": 1.5841692686080933
            }, {
              "x": 220,
              "y": 160,
              "dx": 6.97722864151001,
              "dy": 2.3452770709991455
            }, {
              "x": 230,
              "y": 160,
              "dx": 4.777827262878418,
              "dy": 1.8913748264312744
            }, {
              "x": 310,
              "y": 160,
              "dx": -7.742730617523193,
              "dy": 2.3997392654418945
            }, {
              "x": 320,
              "y": 160,
              "dx": -8.056294441223145,
              "dy": 0.7136588096618652
            }, {
              "x": 70,
              "y": 170,
              "dx": 5.763466835021973,
              "dy": 2.289579153060913
            }, {
              "x": 100,
              "y": 170,
              "dx": -5.154594421386719,
              "dy": 1.0610947608947754
            }, {
              "x": 110,
              "y": 170,
              "dx": -8.850627899169922,
              "dy": 1.09554922580719
            }, {
              "x": 130,
              "y": 170,
              "dx": -5.16828727722168,
              "dy": 0.07046306133270264
            }, {
              "x": 140,
              "y": 170,
              "dx": -7.269974708557129,
              "dy": 0.3918849229812622
            }, {
              "x": 150,
              "y": 170,
              "dx": -6.64382266998291,
              "dy": 0.031145503744482994
            }, {
              "x": 210,
              "y": 170,
              "dx": 6.374290466308594,
              "dy": 0.5819551944732666
            }, {
              "x": 220,
              "y": 170,
              "dx": 7.661487102508545,
              "dy": 0.741302490234375
            }, {
              "x": 230,
              "y": 170,
              "dx": 5.565219402313232,
              "dy": 0.020863329991698265
            }, {
              "x": 310,
              "y": 170,
              "dx": -7.019439697265625,
              "dy": 1.8093390464782715
            }, {
              "x": 320,
              "y": 170,
              "dx": -9.34312629699707,
              "dy": 0.1560337394475937
            }, {
              "x": 70,
              "y": 180,
              "dx": 5.863265037536621,
              "dy": -4.719114780426025
            }, {
              "x": 80,
              "y": 180,
              "dx": 3.566934823989868,
              "dy": -3.6106321811676025
            }, {
              "x": 100,
              "y": 180,
              "dx": -5.396617412567139,
              "dy": -1.5499566793441772
            }, {
              "x": 110,
              "y": 180,
              "dx": -9.824209213256836,
              "dy": -1.7882658243179321
            }, {
              "x": 120,
              "y": 180,
              "dx": -4.858380317687988,
              "dy": -2.6533305644989014
            }, {
              "x": 130,
              "y": 180,
              "dx": -4.617563247680664,
              "dy": -2.2942490577697754
            }, {
              "x": 140,
              "y": 180,
              "dx": -6.716089725494385,
              "dy": -2.358243942260742
            }, {
              "x": 150,
              "y": 180,
              "dx": -5.227489471435547,
              "dy": -0.5965059399604797
            }, {
              "x": 210,
              "y": 180,
              "dx": 6.644838809967041,
              "dy": -1.9240751266479492
            }, {
              "x": 220,
              "y": 180,
              "dx": 8.212990760803223,
              "dy": -2.645220994949341
            }, {
              "x": 230,
              "y": 180,
              "dx": 5.624647617340088,
              "dy": -1.4263155460357666
            }, {
              "x": 310,
              "y": 180,
              "dx": -5.511805057525635,
              "dy": -1.1214256286621094
            }, {
              "x": 320,
              "y": 180,
              "dx": -7.112335205078125,
              "dy": 0.11561820656061172
            }],
            "captureName": "scenario1/setting.png",
            "checkedAs": "UNPROCESSED",
            "revisionAt": "1970-01-01T00:00:04.000Z",
            "updatedBy": "system",
            "updatedAt": "1970-01-01T00:00:00.000Z",
            "@siblings": {}
          }
        }, done)
    });

    it('"UNPROCESSED && !OK": 1', function(done) {
      request(app)
        .get('/api/revisions/4')
        .send({
          "checkedAs": 'IS_BUG'
        })
        .expect({
          "current": {
            "id": "4",
            "revisionAt": "1970-01-01T00:00:04.000Z",
            "updatedAt": "1970-01-01T00:00:00.000Z",
            "total": 2,
            "checkedAs": {
              "UNPROCESSED": 2,
              "IS_OK": 0,
              "IS_BUG": 0
            },
            "reportedAs": {
              "OK": 1,
              "SUSPICIOUS": 1,
              "ERROR": 0
            },
            "UNPROCESSED && !OK": 1
          }
        }, done)
    });

    it('"checkedAs" should be "IS_OK"', function(done) {
      request(app)
        .post('/api/revisions/4/captures/d559beb5c41a96d2982f42deda2a2528')
        .send({
          "checkedAs": 'IS_OK'
        })
        .expect({
          "current": {
            "capture": "d559beb5c41a96d2982f42deda2a2528",
            "revision": "4",
            "status": "SUSPICIOUS",
            "span": 10,
            "threshold": 5,
            "expect_image": "revision3/scenario1/setting.png",
            "target_image": "revision4/scenario1/setting.png",
            "time": 0.1,
            "height": 287,
            "width": 413,
            "vector": [{
              "x": 80,
              "y": 130,
              "dx": -10.588767051696777,
              "dy": 0.21128489077091217
            }, {
              "x": 90,
              "y": 130,
              "dx": -6.585290431976318,
              "dy": -0.08819150179624557
            }, {
              "x": 80,
              "y": 140,
              "dx": -11.487329483032227,
              "dy": 0.027357453480362892
            }, {
              "x": 90,
              "y": 140,
              "dx": -6.965066909790039,
              "dy": -0.20984062552452087
            }, {
              "x": 150,
              "y": 140,
              "dx": -6.915441036224365,
              "dy": -0.18180334568023682
            }, {
              "x": 160,
              "y": 140,
              "dx": -5.391066551208496,
              "dy": -0.019559767097234726
            }, {
              "x": 80,
              "y": 150,
              "dx": -11.042485237121582,
              "dy": -0.14318007230758667
            }, {
              "x": 90,
              "y": 150,
              "dx": -7.9087018966674805,
              "dy": -0.45151108503341675
            }, {
              "x": 150,
              "y": 150,
              "dx": -7.083597183227539,
              "dy": 0.05295655131340027
            }, {
              "x": 160,
              "y": 150,
              "dx": -5.293422222137451,
              "dy": 0.019966593012213707
            }, {
              "x": 70,
              "y": 160,
              "dx": 4.009397029876709,
              "dy": 4.2715325355529785
            }, {
              "x": 80,
              "y": 160,
              "dx": 3.1682729721069336,
              "dy": 5.371302604675293
            }, {
              "x": 100,
              "y": 160,
              "dx": -4.593771934509277,
              "dy": 3.109616994857788
            }, {
              "x": 110,
              "y": 160,
              "dx": -9.270939826965332,
              "dy": 3.2318742275238037
            }, {
              "x": 140,
              "y": 160,
              "dx": -7.462734222412109,
              "dy": 1.1068710088729858
            }, {
              "x": 150,
              "y": 160,
              "dx": -5.1640625,
              "dy": 0.3225458860397339
            }, {
              "x": 210,
              "y": 160,
              "dx": 4.887204170227051,
              "dy": 1.5841692686080933
            }, {
              "x": 220,
              "y": 160,
              "dx": 6.97722864151001,
              "dy": 2.3452770709991455
            }, {
              "x": 230,
              "y": 160,
              "dx": 4.777827262878418,
              "dy": 1.8913748264312744
            }, {
              "x": 310,
              "y": 160,
              "dx": -7.742730617523193,
              "dy": 2.3997392654418945
            }, {
              "x": 320,
              "y": 160,
              "dx": -8.056294441223145,
              "dy": 0.7136588096618652
            }, {
              "x": 70,
              "y": 170,
              "dx": 5.763466835021973,
              "dy": 2.289579153060913
            }, {
              "x": 100,
              "y": 170,
              "dx": -5.154594421386719,
              "dy": 1.0610947608947754
            }, {
              "x": 110,
              "y": 170,
              "dx": -8.850627899169922,
              "dy": 1.09554922580719
            }, {
              "x": 130,
              "y": 170,
              "dx": -5.16828727722168,
              "dy": 0.07046306133270264
            }, {
              "x": 140,
              "y": 170,
              "dx": -7.269974708557129,
              "dy": 0.3918849229812622
            }, {
              "x": 150,
              "y": 170,
              "dx": -6.64382266998291,
              "dy": 0.031145503744482994
            }, {
              "x": 210,
              "y": 170,
              "dx": 6.374290466308594,
              "dy": 0.5819551944732666
            }, {
              "x": 220,
              "y": 170,
              "dx": 7.661487102508545,
              "dy": 0.741302490234375
            }, {
              "x": 230,
              "y": 170,
              "dx": 5.565219402313232,
              "dy": 0.020863329991698265
            }, {
              "x": 310,
              "y": 170,
              "dx": -7.019439697265625,
              "dy": 1.8093390464782715
            }, {
              "x": 320,
              "y": 170,
              "dx": -9.34312629699707,
              "dy": 0.1560337394475937
            }, {
              "x": 70,
              "y": 180,
              "dx": 5.863265037536621,
              "dy": -4.719114780426025
            }, {
              "x": 80,
              "y": 180,
              "dx": 3.566934823989868,
              "dy": -3.6106321811676025
            }, {
              "x": 100,
              "y": 180,
              "dx": -5.396617412567139,
              "dy": -1.5499566793441772
            }, {
              "x": 110,
              "y": 180,
              "dx": -9.824209213256836,
              "dy": -1.7882658243179321
            }, {
              "x": 120,
              "y": 180,
              "dx": -4.858380317687988,
              "dy": -2.6533305644989014
            }, {
              "x": 130,
              "y": 180,
              "dx": -4.617563247680664,
              "dy": -2.2942490577697754
            }, {
              "x": 140,
              "y": 180,
              "dx": -6.716089725494385,
              "dy": -2.358243942260742
            }, {
              "x": 150,
              "y": 180,
              "dx": -5.227489471435547,
              "dy": -0.5965059399604797
            }, {
              "x": 210,
              "y": 180,
              "dx": 6.644838809967041,
              "dy": -1.9240751266479492
            }, {
              "x": 220,
              "y": 180,
              "dx": 8.212990760803223,
              "dy": -2.645220994949341
            }, {
              "x": 230,
              "y": 180,
              "dx": 5.624647617340088,
              "dy": -1.4263155460357666
            }, {
              "x": 310,
              "y": 180,
              "dx": -5.511805057525635,
              "dy": -1.1214256286621094
            }, {
              "x": 320,
              "y": 180,
              "dx": -7.112335205078125,
              "dy": 0.11561820656061172
            }],
            "captureName": "scenario1/setting.png",
            "checkedAs": "IS_OK",
            "revisionAt": "1970-01-01T00:00:04.000Z",
            "updatedBy": "system",
            "updatedAt": "1970-01-01T00:00:00.000Z",
            "@siblings": {}
          }
        }, done)
    });

    it('"UNPROCESSED && !OK": 0', function(done) {
      request(app)
        .get('/api/revisions/4')
        .send({
          "checkedAs": 'IS_BUG'
        })
        .expect({
          "current": {
            "id": "4",
            "revisionAt": "1970-01-01T00:00:04.000Z",
            "updatedAt": "1970-01-01T00:00:00.000Z",
            "total": 2,
            "checkedAs": {
              "UNPROCESSED": 1,
              "IS_OK": 1,
              "IS_BUG": 0
            },
            "reportedAs": {
              "OK": 1,
              "SUSPICIOUS": 1,
              "ERROR": 0
            },
            "UNPROCESSED && !OK": 0
          }
        }, done)
    });

  });

  // TODO: implement "filter=status:SUSPICIOUS"
  //   it('GET /api/revisions/2/captures?status=SUSPICIOUS should filter docs by status', function(done) {
  //     request(app)
  //     .get('/api/revisions/2/captures?status=SUSPICIOUS')
  //
  //   it('GET /api/revisions/2/captures?checkedAs=UNPROCESSED should filter docs by checkedAs', function(done) {
  //     request(app)
});



function registerAllRevisions() {
  var fixtureRevisionEnd = 23;
  this.timeout(3000 * fixtureRevisionEnd);
  return _.range(2, fixtureRevisionEnd + 1)
    .reduce(function(p, r) {
      return p.then(function() {
        return Q.ninvoke(request(app)
          .post('/api/tidal-wave/' + r)
          .send({
            "revisionAt": r * 1000
          }), 'end').delay(200);
      });
    }, Q());
}
