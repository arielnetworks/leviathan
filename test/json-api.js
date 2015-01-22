
process.env.NODE_ENV = 'test';

var path = require('path');
var _ = require('underscore');
var request = require('supertest');
var assert = require('assert');
var persist = require('../persist');

describe('Application', function() {

  var dbType = 'memory';

  describe('should work in ' + dbType + ' storage', function() {

    var tmp = launchApplication(dbType);
    var server = tmp.server;
    var app = tmp.app;

    // Cleanup a data after each testing for "dbType".
    after(function(done) {
      persist.cleanup().then(done);
    });

    it('should launch in ' + dbType, function(done) {
      request(app)
      .get('/api/revisions')
      .expect(200)
      .expect({ revisions: [] }, done);
    });

    it('POST /api/tidal-wave/1 in ' + dbType, function(done) {
      request(app)
      .post('/api/tidal-wave/1')
      .expect(200)
      .expect({ data: 2, error: 0, request: 2 }, done);
    });

    it('GET /api/revisions in' + dbType, function(done) {
      request(app)
      .get('/api/revisions')
      .expect(200)
      .expect({
        revisions: [
          {
            id: 1,
            total: 2,
            "UNPROCESSED": 2,
            "IS_OK": 0,
            "IS_BUG": 0,
            updatedAt: '1970-01-01T00:00:00.000Z'
          }
        ]
      }, done);
    });

    it('GET /api/captures' + dbType, function(done) {
      request(app)
      .get('/api/captures')
      .expect(200)
      .expect({
        "captures": [
          {
            "capture": "9018988ae55e012e437aa24cbf9a400a",
            "expectedRevision": ["1"],
            "id": "9018988ae55e012e437aa24cbf9a400a",
            "updatedAt": "1970-01-01T00:00:00.000Z",
            "updatedBy": "system"
          },
          {
            "capture": "db38f7f3f5d7d765f97e45d185066cc9",
            "expectedRevision": ["1"],
            "id": "db38f7f3f5d7d765f97e45d185066cc9",
            "updatedAt": "1970-01-01T00:00:00.000Z",
            "updatedBy": "system"
          }
        ]
      }, done);
    });

    it('GET /api/revisions/1 in' + dbType, function(done) {
      request(app)
      .get('/api/revisions/1')
      .expect(200)
      .expect({
        id: 1,
        total: 2,
        "UNPROCESSED": 2,
        "IS_OK": 0,
        "IS_BUG": 0,
        updatedAt: '1970-01-01T00:00:00.000Z'
      }, done);
    });

    it('GET /api/revisions/1/captures in' + dbType, function(done) {
      request(app)
      .get('/api/revisions/1/captures')
      .expect(200)
      .expect({
        revision: {
          id: '1',
          total: 2,
          "UNPROCESSED": 2,
          "IS_OK": 0,
          "IS_BUG": 0,
          updatedAt: '1970-01-01T00:00:00.000Z'
        },
        captures: [{
          checkedAs: 'UNPROCESSED',
          id: 'revision:1:capture:db38f7f3f5d7d765f97e45d185066cc9',
          capture: 'db38f7f3f5d7d765f97e45d185066cc9',
          captureName: 'scenario2/capture2.png',
          expect_image: 'revision1/scenario2/capture2.png',
          revision: '1',
          span: 10,
          status: 'OK',
          target_image: 'revision1/scenario2/capture2.png',
          threshold: 5,
          time: 0.1,
          updatedAt: '1970-01-01T00:00:00.000Z',
          vector: []
        },
        {
          checkedAs: 'UNPROCESSED',
          capture: '9018988ae55e012e437aa24cbf9a400a',
          captureName: 'scenario1/capture1.jpg',
          expect_image: 'revision1/scenario1/capture1.jpg',
          id: 'revision:1:capture:9018988ae55e012e437aa24cbf9a400a',
          revision: '1',
          span: 10,
          status: 'OK',
          target_image: 'revision1/scenario1/capture1.jpg',
          threshold: 5,
          time: 0.1,
          updatedAt: '1970-01-01T00:00:00.000Z',
          vector: []
        }]
      }, done);
    });

    it('GET /api/revisions/2/captures/revision:1:capture:db38f7f3f5d7d765f97e45d185066cc9 in' + dbType, function(done) {
      request(app)
      .get('/api/revisions/2/captures/revision:1:capture:db38f7f3f5d7d765f97e45d185066cc9')
      .expect(200)
      .expect({
        checkedAs: 'UNPROCESSED',
        id: 'revision:1:capture:db38f7f3f5d7d765f97e45d185066cc9',
        capture: 'db38f7f3f5d7d765f97e45d185066cc9',
        captureName: 'scenario2/capture2.png',
        expect_image: 'revision1/scenario2/capture2.png',
        revision: '1',
        span: 10,
        status: 'OK',
        target_image: 'revision1/scenario2/capture2.png',
        threshold: 5,
        time: 0.1,
        updatedAt: '1970-01-01T00:00:00.000Z',
        vector: []
      }, done);
    });

    it('POST /api/tidal-wave/2 should report zero in ' + dbType, function(done) {
      request(app)
      .post('/api/tidal-wave/2')
      .expect(200)
      .expect({ data: 2, error: 0, request: 2 }, done);
    });

    // Now we have 2 revisions in a store.

    it('/api/captures should not changed any data ' + dbType, function(done) {
      request(app)
      .get('/api/captures')
      .expect(200)
      .expect({
        "captures": [
          {
            "capture": "9018988ae55e012e437aa24cbf9a400a",
            "expectedRevision": ["1"],
            "id": "9018988ae55e012e437aa24cbf9a400a",
            "updatedAt": "1970-01-01T00:00:00.000Z",
            "updatedBy": "system"
          },
          {
            "capture": "db38f7f3f5d7d765f97e45d185066cc9",
            "expectedRevision": ["1"],
            "id": "db38f7f3f5d7d765f97e45d185066cc9",
            "updatedAt": "1970-01-01T00:00:00.000Z",
            "updatedBy": "system"
          }
        ]
      }, done);
    });

    it('GET /api/revisions in' + dbType, function(done) {
      request(app)
      .get('/api/revisions')
      .expect(200)
      .expect({
        revisions: [
          {
            id: 2,
            total: 2,
            "UNPROCESSED": 2,
            "IS_OK": 0,
            "IS_BUG": 0,
            updatedAt: '1970-01-01T00:00:00.000Z' 
          },
          {
            id: 1,
            total: 2,
            "UNPROCESSED": 2,
            "IS_OK": 0,
            "IS_BUG": 0,
            updatedAt: '1970-01-01T00:00:00.000Z'
          }
        ]
      }, done);
    });

    it('GET /api/revisions/2 in' + dbType, function(done) {
      request(app)
      .get('/api/revisions/2')
      .expect(200)
      .expect({
        id: 2,
        total: 2,
        "UNPROCESSED": 2,
        "IS_OK": 0,
        "IS_BUG": 0,
        updatedAt: '1970-01-01T00:00:00.000Z'
      }, done);
    });

    it('GET /api/revisions/2/captures in' + dbType, function(done) {
      request(app)
      .get('/api/revisions/2/captures')
      .expect({
        revision: {
          id: "2",
          total: 2,
          "UNPROCESSED": 2,
          "IS_OK": 0,
          "IS_BUG": 0,
          updatedAt: "1970-01-01T00:00:00.000Z"
        },
        captures: [
          {
            capture: "db38f7f3f5d7d765f97e45d185066cc9",
            captureName: "scenario2/capture2.png",
            checkedAs: "UNPROCESSED",
            expect_image: "revision1/scenario2/capture2.png",
            id: "revision:2:capture:db38f7f3f5d7d765f97e45d185066cc9",
            revision: "2",
            span: 10,
            status: "SUSPICIOUS",
            target_image: "revision2/scenario2/capture2.png",
            threshold: 5,
            time: 0.1,
            updatedAt: "1970-01-01T00:00:00.000Z",
            vector: [
              { dx: -5.360568046569824, dy: -0.0551748163998127, id: 1, x: 80, y: 70 },
              { dx: -6.001735687255859, dy: -1.3181204795837402, id: 2, x: 130, y: 70 },
              { dx: -71.92633819580078, dy: -0.5746171474456787, id: 3, x: 140, y: 70 },
              { dx: -5.842303276062012, dy: -1.6100093126296997, id: 4, x: 170, y: 70 },
              { dx: 6.5268402099609375, dy: 1.0273534059524536, id: 5, x: 110, y: 80 },
              { dx: -18.383054733276367, dy: 1.066022515296936, id: 6, x: 130, y: 80 },
              { dx: -88.46060180664062, dy: 0.5541346073150635, id: 7, x: 140, y: 80 },
              { dx: -6.80324125289917, dy: 1.1075118780136108, id: 8, x: 160, y: 80 },
              { dx: -8.922819137573242, dy: 0.7354532480239868, id: 9, x: 170, y: 80 },
              { dx: -5.266021728515625, dy: 2.406721591949463, id: 10, x: 160, y: 90 },
              { dx: -5.1159467697143555, dy: 2.25892972946167, id: 11, x: 170, y: 90 },
              { dx: 0.7105715870857239, dy: -7.616470813751221, id: 12, x: 90, y: 100 },
              { dx: 2.2438039779663086, dy: -8.364863395690918, id: 13, x: 100, y: 100 },
              { dx: 1.3381984233856201, dy: -5.666755676269531, id: 14, x: 110, y: 100 },
              { dx: 0.940326452255249, dy: -6.6747002601623535, id: 15, x: 120, y: 100 },
              { dx: -5.092167377471924, dy: -2.799497604370117, id: 16, x: 160, y: 100 },
              { dx: -3.990016460418701, dy: -5.452290058135986, id: 17, x: 170, y: 100 },
              { dx: -1.5481517314910889, dy: -5.242636680603027, id: 18, x: 80, y: 110 },
              { dx: 0.8682486414909363, dy: -9.285847663879395, id: 19, x: 90, y: 110 },
              { dx: 2.520627975463867, dy: -9.215091705322266, id: 20, x: 100, y: 110 },
              { dx: 7.245147228240967, dy: -8.47363567352295, id: 21, x: 110, y: 110 },
              { dx: 2.8622498512268066, dy: -9.007637023925781, id: 22, x: 120, y: 110 },
              { dx: -6.2871503829956055, dy: -0.9457563161849976, id: 23, x: 160, y: 110 },
              { dx: -7.390625476837158, dy: -5.659643173217773, id: 24, x: 170, y: 110 }
            ]
          },
          {
            capture: "9018988ae55e012e437aa24cbf9a400a",
            captureName: "scenario1/capture1.jpg",
            checkedAs: "UNPROCESSED",
            expect_image: "revision1/scenario1/capture1.jpg",
            id: "revision:2:capture:9018988ae55e012e437aa24cbf9a400a",
            revision: "2",
            span: 10,
            status: "OK",
            target_image: "revision2/scenario1/capture1.jpg",
            threshold: 5,
            time: 0.1,
            updatedAt: "1970-01-01T00:00:00.000Z",
            vector: []
          }
        ]
      }, done);
    });




    // Parameters test
    // Without "order" parameter,
    //  * "/api/revisions" ordered by "id DESC"
    //  * other api ordered by "updatedAt DESC"
    it('GET /api/revisions returns 2 documents in' + dbType, function(done) {
      request(app)
      .get('/api/revisions')
      .expect({
        revisions: [
          {
            id: 2,
            total: 2,
            "UNPROCESSED": 2,
            "IS_OK": 0,
            "IS_BUG": 0,
            updatedAt: '1970-01-01T00:00:00.000Z'
          },
          {
            id: 1,
            total: 2,
            "UNPROCESSED": 2,
            "IS_OK": 0,
            "IS_BUG": 0,
            updatedAt: '1970-01-01T00:00:00.000Z'
          }
        ]
      }, done);
    });
    it('GET /api/revisions?limit=1 should return the first document' + dbType, function(done) {
      request(app)
      .get('/api/revisions?limit=1')
      .expect({
        revisions: [
          {
            id: 2,
            total: 2,
            "UNPROCESSED": 2,
            "IS_OK": 0,
            "IS_BUG": 0,
            updatedAt: '1970-01-01T00:00:00.000Z'
          }
        ]
      }, done);
    });
    it('GET /api/revisions?limit=1&skip=1 should skip one document' + dbType, function(done) {
      request(app)
      .get('/api/revisions?limit=1&skip=1')
      .expect({
        revisions: [
          {
            id: 1,
            total: 2,
            "UNPROCESSED": 2,
            "IS_OK": 0,
            "IS_BUG": 0,
            updatedAt: '1970-01-01T00:00:00.000Z'
          }
        ]
      }, done);
    });
    it('GET /api/revisions?order=id%20ASC should sorts docs as "id ASC"' + dbType, function(done) {
      request(app)
      .get('/api/revisions?order=id%20ASC')
      .expect({
        revisions: [
          {
            id: 1,
            total: 2,
            "UNPROCESSED": 2,
            "IS_OK": 0,
            "IS_BUG": 0,
            updatedAt: '1970-01-01T00:00:00.000Z'
          },
          {
            id: 2,
            total: 2,
            "UNPROCESSED": 2,
            "IS_OK": 0,
            "IS_BUG": 0,
            updatedAt: '1970-01-01T00:00:00.000Z'
          }
        ]
      }, done);
    });
    it('GET /api/revisions/1/captures returns 2 documents in' + dbType, function(done) {
      request(app)
      .get('/api/revisions/1/captures')
      .expect({
        revision: {
          id: 1,
          total: 2,
          "UNPROCESSED": 2,
          "IS_OK": 0,
          "IS_BUG": 0,
          updatedAt: '1970-01-01T00:00:00.000Z'
        },
        captures: [{ checkedAs: 'UNPROCESSED',
             id: 'revision:1:capture:db38f7f3f5d7d765f97e45d185066cc9',
             revision: '1',
             capture: 'db38f7f3f5d7d765f97e45d185066cc9',
             captureName: 'scenario2/capture2.png',
             updatedAt: '1970-01-01T00:00:00.000Z',
             status: 'OK',
             span: 10,
             threshold: 5,
             vector: [],
             time: 0.1,
             target_image: 'revision1/scenario2/capture2.png',
             expect_image: 'revision1/scenario2/capture2.png' },
           { checkedAs: 'UNPROCESSED',
             id: 'revision:1:capture:9018988ae55e012e437aa24cbf9a400a',
             revision: '1',
             capture: '9018988ae55e012e437aa24cbf9a400a',
             captureName: 'scenario1/capture1.jpg',
             updatedAt: '1970-01-01T00:00:00.000Z',
             status: 'OK',
             span: 10,
             threshold: 5,
             vector: [],
             time: 0.1,
             target_image: 'revision1/scenario1/capture1.jpg',
             expect_image: 'revision1/scenario1/capture1.jpg' }] })
      .end(done);
    });
    it('GET /api/revisions/1/captures?limit=1 returns 2 documents in' + dbType, function(done) {
      request(app)
      .get('/api/revisions/1/captures?limit=1')
      .expect({
        revision: {
          id: 1,
          total: 2,
          "UNPROCESSED": 2,
          "IS_OK": 0,
          "IS_BUG": 0,
          updatedAt: '1970-01-01T00:00:00.000Z'
        },
        captures:
         [{ checkedAs: 'UNPROCESSED',
             id: 'revision:1:capture:db38f7f3f5d7d765f97e45d185066cc9',
             revision: '1',
             capture: 'db38f7f3f5d7d765f97e45d185066cc9',
             captureName: 'scenario2/capture2.png',
             updatedAt: '1970-01-01T00:00:00.000Z',
             status: 'OK',
             span: 10,
             threshold: 5,
             vector: [],
             time: 0.1,
             target_image: 'revision1/scenario2/capture2.png',
             expect_image: 'revision1/scenario2/capture2.png' }] })
      .end(done);
    });
    it('GET /api/revisions/1/captures?limit=1&skip=1 returns 2 documents in' + dbType, function(done) {
      request(app)
      .get('/api/revisions/1/captures?limit=1&skip=1')
      .expect({
        revision: {
          id: 1,
          total: 2,
          "UNPROCESSED": 2,
          "IS_OK": 0,
          "IS_BUG": 0,
          updatedAt: '1970-01-01T00:00:00.000Z'
        },
        captures:
         [{ checkedAs: 'UNPROCESSED',
             id: 'revision:1:capture:9018988ae55e012e437aa24cbf9a400a',
             revision: '1',
             capture: '9018988ae55e012e437aa24cbf9a400a',
             captureName: 'scenario1/capture1.jpg',
             updatedAt: '1970-01-01T00:00:00.000Z',
             status: 'OK',
             span: 10,
             threshold: 5,
             vector: [],
             time: 0.1,
             target_image: 'revision1/scenario1/capture1.jpg',
             expect_image: 'revision1/scenario1/capture1.jpg' }] })
      .end(done);
    });
    it('GET /api/revisions/1/captures?order=target_image sorts docs by "target_image ASC" in' + dbType, function(done) {
      request(app)
      .get('/api/revisions/1/captures?order=target_image')
      .expect({
        revision: {
          id: 1,
          total: 2,
          "UNPROCESSED": 2,
          "IS_OK": 0,
          "IS_BUG": 0,
          updatedAt: '1970-01-01T00:00:00.000Z'
        },
        captures:
         [{ checkedAs: 'UNPROCESSED',
             id: 'revision:1:capture:9018988ae55e012e437aa24cbf9a400a',
             revision: '1',
             capture: '9018988ae55e012e437aa24cbf9a400a',
             captureName: 'scenario1/capture1.jpg',
             updatedAt: '1970-01-01T00:00:00.000Z',
             status: 'OK',
             span: 10,
             threshold: 5,
             vector: [],
             time: 0.1,
             target_image: 'revision1/scenario1/capture1.jpg',
             expect_image: 'revision1/scenario1/capture1.jpg' },
           { checkedAs: 'UNPROCESSED',
             id: 'revision:1:capture:db38f7f3f5d7d765f97e45d185066cc9',
             revision: '1',
             capture: 'db38f7f3f5d7d765f97e45d185066cc9',
             captureName: 'scenario2/capture2.png',
             updatedAt: '1970-01-01T00:00:00.000Z',
             status: 'OK',
             span: 10,
             threshold: 5,
             vector: [],
             time: 0.1,
             target_image: 'revision1/scenario2/capture2.png',
             expect_image: 'revision1/scenario2/capture2.png' }] })
      .end(done);
    });

    // Test changing "checkedAs" status

    it('POST /api/revisions/2/captures/revision:2:capture:db38f7f3f5d7d765f97e45d185066cc9 should change "checkedAs" in' + dbType, function(done) {
      request(app)
      .post('/api/revisions/2/captures/revision:2:capture:db38f7f3f5d7d765f97e45d185066cc9')
      .send({ checkedAs: 'IS_BUG' })
      .expect({

        checkedAs: "IS_BUG", // <== Changed

        capture: 'db38f7f3f5d7d765f97e45d185066cc9',
        captureName: 'scenario2/capture2.png',
        expect_image: 'revision1/scenario2/capture2.png',
        id: 'revision:2:capture:db38f7f3f5d7d765f97e45d185066cc9',
        revision: "2",
        span: 10,
        status: 'SUSPICIOUS',
        target_image: 'revision2/scenario2/capture2.png',
        threshold: 5,
        time: 0.1,
        updatedAt: '1970-01-01T00:00:00.000Z',
        vector: [
          { dx: -5.360568046569824, dy: -0.0551748163998127, id: 1, x: 80, y: 70 },
          { dx: -6.001735687255859, dy: -1.3181204795837402, id: 2, x: 130, y: 70 },
          { dx: -71.92633819580078, dy: -0.5746171474456787, id: 3, x: 140, y: 70 },
          { dx: -5.842303276062012, dy: -1.6100093126296997, id: 4, x: 170, y: 70 },
          { dx: 6.5268402099609375, dy: 1.0273534059524536, id: 5, x: 110, y: 80 },
          { dx: -18.383054733276367, dy: 1.066022515296936, id: 6, x: 130, y: 80 },
          { dx: -88.46060180664062, dy: 0.5541346073150635, id: 7, x: 140, y: 80 },
          { dx: -6.80324125289917, dy: 1.1075118780136108, id: 8, x: 160, y: 80 },
          { dx: -8.922819137573242, dy: 0.7354532480239868, id: 9, x: 170, y: 80 },
          { dx: -5.266021728515625, dy: 2.406721591949463, id: 10, x: 160, y: 90 },
          { dx: -5.1159467697143555, dy: 2.25892972946167, id: 11, x: 170, y: 90 },
          { dx: 0.7105715870857239, dy: -7.616470813751221, id: 12, x: 90, y: 100 },
          { dx: 2.2438039779663086, dy: -8.364863395690918, id: 13, x: 100, y: 100 },
          { dx: 1.3381984233856201, dy: -5.666755676269531, id: 14, x: 110, y: 100 },
          { dx: 0.940326452255249, dy: -6.6747002601623535, id: 15, x: 120, y: 100 },
          { dx: -5.092167377471924, dy: -2.799497604370117, id: 16, x: 160, y: 100 },
          { dx: -3.990016460418701, dy: -5.452290058135986, id: 17, x: 170, y: 100 },
          { dx: -1.5481517314910889, dy: -5.242636680603027, id: 18, x: 80, y: 110 },
          { dx: 0.8682486414909363, dy: -9.285847663879395, id: 19, x: 90, y: 110 },
          { dx: 2.520627975463867, dy: -9.215091705322266, id: 20, x: 100, y: 110 },
          { dx: 7.245147228240967, dy: -8.47363567352295, id: 21, x: 110, y: 110 },
          { dx: 2.8622498512268066, dy: -9.007637023925781, id: 22, x: 120, y: 110 },
          { dx: -6.2871503829956055, dy: -0.9457563161849976, id: 23, x: 160, y: 110 },
          { dx: -7.390625476837158, dy: -5.659643173217773, id: 24, x: 170, y: 110 }
        ]
      }, done);
    });

    it('should update its revision count' + dbType, function(done) {
      request(app)
      .get('/api/revisions/2')
      .expect(200)
      .expect({
        id: 2,
        total: 2,
        "UNPROCESSED": 1,
        "IS_OK": 0,
        "IS_BUG": 1,
        updatedAt: '1970-01-01T00:00:00.000Z'
      }, done);
    });

    it('/api/captures should not changed any data ' + dbType, function(done) {
      request(app)
      .get('/api/captures')
      .expect(200)
      .expect({
        "captures": [
          {
            "capture": "9018988ae55e012e437aa24cbf9a400a",
            "expectedRevision": ["1"],
            "id": "9018988ae55e012e437aa24cbf9a400a",
            "updatedAt": "1970-01-01T00:00:00.000Z",
            "updatedBy": "system"
          },
          {
            "capture": "db38f7f3f5d7d765f97e45d185066cc9",
            "expectedRevision": ["1"],
            "id": "db38f7f3f5d7d765f97e45d185066cc9",
            "updatedAt": "1970-01-01T00:00:00.000Z",
            "updatedBy": "system"
          }
        ]
      }, done);
    });

    it('POST /api/revisions/2/captures/revision:2:capture:db38f7f3f5d7d765f97e45d185066cc9 should change status again in' + dbType, function(done) {
      request(app)
      .post('/api/revisions/2/captures/revision:2:capture:db38f7f3f5d7d765f97e45d185066cc9')
      .send({ checkedAs: 'IS_OK' })
      .expect({

        checkedAs: 'IS_OK', /* <- changed */

        capture: 'db38f7f3f5d7d765f97e45d185066cc9',
        captureName: 'scenario2/capture2.png',
        expect_image: 'revision1/scenario2/capture2.png',
        id: 'revision:2:capture:db38f7f3f5d7d765f97e45d185066cc9',
        revision: 2,
        span: 10,
        status: 'SUSPICIOUS',
        target_image: 'revision2/scenario2/capture2.png',
        threshold: 5,
        time: 0.1,
        updatedAt: '1970-01-01T00:00:00.000Z',
        vector: [
          { dx: -5.360568046569824, dy: -0.0551748163998127, id: 1, x: 80, y: 70 },
          { dx: -6.001735687255859, dy: -1.3181204795837402, id: 2, x: 130, y: 70 },
          { dx: -71.92633819580078, dy: -0.5746171474456787, id: 3, x: 140, y: 70 },
          { dx: -5.842303276062012, dy: -1.6100093126296997, id: 4, x: 170, y: 70 },
          { dx: 6.5268402099609375, dy: 1.0273534059524536, id: 5, x: 110, y: 80 },
          { dx: -18.383054733276367, dy: 1.066022515296936, id: 6, x: 130, y: 80 },
          { dx: -88.46060180664062, dy: 0.5541346073150635, id: 7, x: 140, y: 80 },
          { dx: -6.80324125289917, dy: 1.1075118780136108, id: 8, x: 160, y: 80 },
          { dx: -8.922819137573242, dy: 0.7354532480239868, id: 9, x: 170, y: 80 },
          { dx: -5.266021728515625, dy: 2.406721591949463, id: 10, x: 160, y: 90 },
          { dx: -5.1159467697143555, dy: 2.25892972946167, id: 11, x: 170, y: 90 },
          { dx: 0.7105715870857239, dy: -7.616470813751221, id: 12, x: 90, y: 100 },
          { dx: 2.2438039779663086, dy: -8.364863395690918, id: 13, x: 100, y: 100 },
          { dx: 1.3381984233856201, dy: -5.666755676269531, id: 14, x: 110, y: 100 },
          { dx: 0.940326452255249, dy: -6.6747002601623535, id: 15, x: 120, y: 100 },
          { dx: -5.092167377471924, dy: -2.799497604370117, id: 16, x: 160, y: 100 },
          { dx: -3.990016460418701, dy: -5.452290058135986, id: 17, x: 170, y: 100 },
          { dx: -1.5481517314910889, dy: -5.242636680603027, id: 18, x: 80, y: 110 },
          { dx: 0.8682486414909363, dy: -9.285847663879395, id: 19, x: 90, y: 110 },
          { dx: 2.520627975463867, dy: -9.215091705322266, id: 20, x: 100, y: 110 },
          { dx: 7.245147228240967, dy: -8.47363567352295, id: 21, x: 110, y: 110 },
          { dx: 2.8622498512268066, dy: -9.007637023925781, id: 22, x: 120, y: 110 },
          { dx: -6.2871503829956055, dy: -0.9457563161849976, id: 23, x: 160, y: 110 },
          { dx: -7.390625476837158, dy: -5.659643173217773, id: 24, x: 170, y: 110 }
        ]
      }, done);
    });

    it('should update its revision count again in' + dbType, function(done) {
      request(app)
      .get('/api/revisions/2')
      .expect(200)
      .expect({
        id: 2,
        total: 2,
        "UNPROCESSED": 1,
        "IS_OK": 1,
        "IS_BUG": 0,
        updatedAt: '1970-01-01T00:00:00.000Z'
      }, done);
    });

    it('should update captures ' + dbType, function(done) {
      request(app)
      .get('/api/captures')
      .expect(200)
      .expect({
        "captures": [
          {
            "capture": "9018988ae55e012e437aa24cbf9a400a",
            "expectedRevision": ["1"],
            "id": "9018988ae55e012e437aa24cbf9a400a",
            "updatedAt": "1970-01-01T00:00:00.000Z",
            "updatedBy": "system"
          },
          {
            "capture": "db38f7f3f5d7d765f97e45d185066cc9",
            "expectedRevision": ["2"], //XXX
            "id": "db38f7f3f5d7d765f97e45d185066cc9",
            "updatedAt": "1970-01-01T00:00:00.000Z",
            "updatedBy": "system"
          }
        ]
      }, done);
    });

    it('GET /api/revisions/2/captures?status=SUSPICIOUS should filter docs by status in' + dbType, function(done) {
      request(app)
      .get('/api/revisions/2/captures?status=SUSPICIOUS')
      .expect({
        revision: {
          id: 2,
          total: 2,
          "UNPROCESSED": 1,
          "IS_OK": 1,
          "IS_BUG": 0,
          updatedAt: '1970-01-01T00:00:00.000Z'
        },
        captures:
         [{ id: 'revision:2:capture:db38f7f3f5d7d765f97e45d185066cc9',
             revision: '2',
             capture: 'db38f7f3f5d7d765f97e45d185066cc9',
             captureName: 'scenario2/capture2.png',
             checkedAs: 'IS_OK',
             updatedAt: '1970-01-01T00:00:00.000Z',
             status: 'SUSPICIOUS',
             span: 10,
             threshold: 5,
             vector: [
               { dx: -5.360568046569824, dy: -0.0551748163998127, id: 1, x: 80, y: 70 },
               { dx: -6.001735687255859, dy: -1.3181204795837402, id: 2, x: 130, y: 70 },
               { dx: -71.92633819580078, dy: -0.5746171474456787, id: 3, x: 140, y: 70 },
               { dx: -5.842303276062012, dy: -1.6100093126296997, id: 4, x: 170, y: 70 },
               { dx: 6.5268402099609375, dy: 1.0273534059524536, id: 5, x: 110, y: 80 },
               { dx: -18.383054733276367, dy: 1.066022515296936, id: 6, x: 130, y: 80 },
               { dx: -88.46060180664062, dy: 0.5541346073150635, id: 7, x: 140, y: 80 },
               { dx: -6.80324125289917, dy: 1.1075118780136108, id: 8, x: 160, y: 80 },
               { dx: -8.922819137573242, dy: 0.7354532480239868, id: 9, x: 170, y: 80 },
               { dx: -5.266021728515625, dy: 2.406721591949463, id: 10, x: 160, y: 90 },
               { dx: -5.1159467697143555, dy: 2.25892972946167, id: 11, x: 170, y: 90 },
               { dx: 0.7105715870857239, dy: -7.616470813751221, id: 12, x: 90, y: 100 },
               { dx: 2.2438039779663086, dy: -8.364863395690918, id: 13, x: 100, y: 100 },
               { dx: 1.3381984233856201, dy: -5.666755676269531, id: 14, x: 110, y: 100 },
               { dx: 0.940326452255249, dy: -6.6747002601623535, id: 15, x: 120, y: 100 },
               { dx: -5.092167377471924, dy: -2.799497604370117, id: 16, x: 160, y: 100 },
               { dx: -3.990016460418701, dy: -5.452290058135986, id: 17, x: 170, y: 100 },
               { dx: -1.5481517314910889, dy: -5.242636680603027, id: 18, x: 80, y: 110 },
               { dx: 0.8682486414909363, dy: -9.285847663879395, id: 19, x: 90, y: 110 },
               { dx: 2.520627975463867, dy: -9.215091705322266, id: 20, x: 100, y: 110 },
               { dx: 7.245147228240967, dy: -8.47363567352295, id: 21, x: 110, y: 110 },
               { dx: 2.8622498512268066, dy: -9.007637023925781, id: 22, x: 120, y: 110 },
               { dx: -6.2871503829956055, dy: -0.9457563161849976, id: 23, x: 160, y: 110 },
               { dx: -7.390625476837158, dy: -5.659643173217773, id: 24, x: 170, y: 110 }],
             time: 0.1,
             target_image: 'revision2/scenario2/capture2.png',
             expect_image: 'revision1/scenario2/capture2.png' }] })
      .end(done);
    });

    it('GET /api/revisions/2/captures?checkedAs=UNPROCESSED should filter docs by checkedAs in' + dbType, function(done) {
      request(app)
      .get('/api/revisions/2/captures?checkedAs=UNPROCESSED')
      .expect({
        revision: {
          id: 2,
          total: 2,
          "UNPROCESSED": 1,
          "IS_OK": 1,
          "IS_BUG": 0,
          updatedAt: '1970-01-01T00:00:00.000Z'
        },
        captures:
         [{ id: 'revision:2:capture:9018988ae55e012e437aa24cbf9a400a',
             revision: '2',
             capture: '9018988ae55e012e437aa24cbf9a400a',
             captureName: 'scenario1/capture1.jpg',
             checkedAs: 'UNPROCESSED',
             updatedAt: '1970-01-01T00:00:00.000Z',
             status: 'OK',
             span: 10,
             threshold: 5,
             vector: [],
             time: 0.1,
             target_image: 'revision2/scenario1/capture1.jpg',
             expect_image: 'revision1/scenario1/capture1.jpg' }] })
      .end(done);
    });

  });

});

function launchApplication(dbType) {
  var application = require('../app');
  var configure = {
    port: 3000,
    baseImageDir: path.resolve(__dirname, 'fixture'),
    relativeTargetDirPrefix: 'revision',
    db: { debug: true }
  };
  switch (dbType) {
    case 'memory':
      _.extend(configure, {
        db: { type: 'memory' }
      });
      break;
    case 'mongodb':
      _.extend(configure, {
        db: {
          type: 'mongodb',
          host: 'localhost',
          database: 'leviathan_test'
        }
      });
      break;
  }
  if (!configure) throw new Error('booom');
  return application.launch(configure);
}

