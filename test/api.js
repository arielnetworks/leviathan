
process.env.NODE_ENV = 'test';

var Path = require('path');
var request = require('supertest');
var persist = require('../src/persist');

describe('Application', function() {

  describe('should work' + ' storage', function() {

    var tmp = require('../app').launch({
      port: 3000,
      baseImageDir: Path.resolve(__dirname, 'fixture'),
      relativeTargetDirPrefix: 'revision'
    });
    var server = tmp.server;
    var app = tmp.app;

    before(persist._destroy);
    // after(persist._destroy);

    it('should launch', function(done) {
      request(app)
      .get('/api/revisions')
      .expect(200)
      .expect({ items: [] }, done);
    });

    it('POST /api/tidal-wave/1', function(done) {
      request(app)
      .post('/api/tidal-wave/1')
      .send({ revisionAt: 1000 })
      .expect(200)
      .expect({ data: 2, error: 0, request: 2 }, done);
    });

    it('GET /api/revisions' , function(done) {
      request(app)
      .get('/api/revisions')
      .expect(200)
      .expect({
        items: [
          {
            id: 1,
            revisionAt: '1970-01-01T00:00:01.000Z',
            updatedAt: '1970-01-01T00:00:00.000Z'
          }
        ]
      }, done);
    });

    it('GET /api/revisions/1' , function(done) {
      request(app)
      .get('/api/revisions/1')
      .expect(200)
      .expect({
        current: {
          id: 1,
          revisionAt: '1970-01-01T00:00:01.000Z',
          total: 2,
          UNPROCESSED: 0,
          IS_OK: 2,
          IS_BUG: 0,
          updatedAt: '1970-01-01T00:00:00.000Z'
        }
      }, done);
    });

    it('GET /api/revisions/1/captures' , function(done) {
      request(app)
      .get('/api/revisions/1/captures')
      .expect(200)
      .expect({
        current: {
          id: '1',
          revisionAt: '1970-01-01T00:00:01.000Z',
          total: 2,
          UNPROCESSED: 0,
          IS_OK: 2,
          IS_BUG: 0,
          updatedAt: '1970-01-01T00:00:00.000Z'
        },
        items: [{
          checkedAs: 'IS_OK',
          capture: 'db38f7f3f5d7d765f97e45d185066cc9',
          captureName: 'scenario2/capture2.png',
          expect_image: 'revision1/scenario2/capture2.png',
          revision: '1',
          span: 10,
          status: 'OK',
          target_image: 'revision1/scenario2/capture2.png',
          threshold: 5,
          time: 0.1,
          revisionAt: '1970-01-01T00:00:01.000Z',
          updatedBy: 'system',
          updatedAt: '1970-01-01T00:00:00.000Z',
          vector: []
        },
        {
          checkedAs: 'IS_OK',
          capture: '9018988ae55e012e437aa24cbf9a400a',
          captureName: 'scenario1/capture1.jpg',
          expect_image: 'revision1/scenario1/capture1.jpg',
          revision: '1',
          span: 10,
          status: 'OK',
          target_image: 'revision1/scenario1/capture1.jpg',
          threshold: 5,
          time: 0.1,
          revisionAt: '1970-01-01T00:00:01.000Z',
          updatedBy: 'system',
          updatedAt: '1970-01-01T00:00:00.000Z',
          vector: []
        }]
      }, done);
    });

    it('GET /api/revisions/1/captures/db38f7f3f5d7d765f97e45d185066cc9' , function(done) {
      request(app)
      .get('/api/revisions/1/captures/db38f7f3f5d7d765f97e45d185066cc9')
      .expect(200)
      .expect({
        current: {
          checkedAs: 'IS_OK',
          capture: 'db38f7f3f5d7d765f97e45d185066cc9',
          captureName: 'scenario2/capture2.png',
          expect_image: 'revision1/scenario2/capture2.png',
          revision: '1',
          span: 10,
          status: 'OK',
          target_image: 'revision1/scenario2/capture2.png',
          threshold: 5,
          time: 0.1,
          revisionAt: '1970-01-01T00:00:01.000Z',
          updatedBy: 'system',
          updatedAt: '1970-01-01T00:00:00.000Z',
          vector: []
        }
      }, done);
    });

    it('GET /api/captures' , function(done) {
      request(app)
      .get('/api/captures')
      .expect(200)
      .expect({
        items: [
          {
            _id: 'db38f7f3f5d7d765f97e45d185066cc9',
            expectedRevisions: ['1'],
            updatedAt: '1970-01-01T00:00:00.000Z',
            updatedBy: 'system'
          },
          {
            _id: '9018988ae55e012e437aa24cbf9a400a',
            expectedRevisions: ['1'],
            updatedAt: '1970-01-01T00:00:00.000Z',
            updatedBy: 'system'
          }
        ]
      }, done);
    });

    it('POST /api/tidal-wave/2 should report zero', function(done) {
      request(app)
      .post('/api/tidal-wave/2')
      .send({ revisionAt: 2000 })
      .expect(200)
      .expect({ data: 2, error: 0, request: 2 }, done);
    });

    // // Now we have 2 revisions in a store.

    it('/api/captures should not changed any data ' , function(done) {
      request(app)
      .get('/api/captures')
      .expect(200)
      .expect({
        items: [
          {
            _id: 'db38f7f3f5d7d765f97e45d185066cc9',
            expectedRevisions: ['1'],
            updatedAt: '1970-01-01T00:00:00.000Z',
            updatedBy: 'system'
          },
          {
            _id: '9018988ae55e012e437aa24cbf9a400a',
            expectedRevisions: ['1'],
            updatedAt: '1970-01-01T00:00:00.000Z',
            updatedBy: 'system'
          }
        ]
      }, done);
    });

    it('GET /api/revisions' , function(done) {
      request(app)
      .get('/api/revisions')
      .expect(200)
      .expect({
        items: [
          {
            id: 2,
            revisionAt: '1970-01-01T00:00:02.000Z',
            updatedAt: '1970-01-01T00:00:00.000Z'
          },
          {
            id: 1,
            revisionAt: '1970-01-01T00:00:01.000Z',
            updatedAt: '1970-01-01T00:00:00.000Z'
          }
        ]
      }, done);
    });

    it('GET /api/revisions/2' , function(done) {
      request(app)
      .get('/api/revisions/2')
      .expect(200)
      .expect({
        current: {
          id: 2,
          revisionAt: '1970-01-01T00:00:02.000Z',
          total: 2,
          UNPROCESSED: 2,
          IS_OK: 0,
          IS_BUG: 0,
          updatedAt: '1970-01-01T00:00:00.000Z'
        }
      }, done);
    });

    it('GET /api/revisions/2/captures' , function(done) {
      request(app)
      .get('/api/revisions/2/captures')
      .expect({
        current: {
          id: '2',
          revisionAt: '1970-01-01T00:00:02.000Z',
          total: 2,
          UNPROCESSED: 2,
          IS_OK: 0,
          IS_BUG: 0,
          updatedAt: '1970-01-01T00:00:00.000Z'
        },
        items: [
          {
            capture: 'db38f7f3f5d7d765f97e45d185066cc9',
            captureName: 'scenario2/capture2.png',
            checkedAs: 'UNPROCESSED',
            expect_image: 'revision1/scenario2/capture2.png',
            revision: '2',
            span: 10,
            status: 'SUSPICIOUS',
            target_image: 'revision2/scenario2/capture2.png',
            threshold: 5,
            time: 0.1,
            revisionAt: '1970-01-01T00:00:02.000Z',
            updatedBy: 'system',
            updatedAt: '1970-01-01T00:00:00.000Z',
            vector: [
              { dx: -5.360568046569824, dy: -0.0551748163998127, x: 80, y: 70 },
              { dx: -6.001735687255859, dy: -1.3181204795837402, x: 130, y: 70 },
              { dx: -71.92633819580078, dy: -0.5746171474456787, x: 140, y: 70 },
              { dx: -5.842303276062012, dy: -1.6100093126296997, x: 170, y: 70 },
              { dx: 6.5268402099609375, dy: 1.0273534059524536, x: 110, y: 80 },
              { dx: -18.383054733276367, dy: 1.066022515296936, x: 130, y: 80 },
              { dx: -88.46060180664062, dy: 0.5541346073150635, x: 140, y: 80 },
              { dx: -6.80324125289917, dy: 1.1075118780136108, x: 160, y: 80 },
              { dx: -8.922819137573242, dy: 0.7354532480239868, x: 170, y: 80 },
              { dx: -5.266021728515625, dy: 2.406721591949463, x: 160, y: 90 },
              { dx: -5.1159467697143555, dy: 2.25892972946167, x: 170, y: 90 },
              { dx: 0.7105715870857239, dy: -7.616470813751221, x: 90, y: 100 },
              { dx: 2.2438039779663086, dy: -8.364863395690918, x: 100, y: 100 },
              { dx: 1.3381984233856201, dy: -5.666755676269531, x: 110, y: 100 },
              { dx: 0.940326452255249, dy: -6.6747002601623535, x: 120, y: 100 },
              { dx: -5.092167377471924, dy: -2.799497604370117, x: 160, y: 100 },
              { dx: -3.990016460418701, dy: -5.452290058135986, x: 170, y: 100 },
              { dx: -1.5481517314910889, dy: -5.242636680603027, x: 80, y: 110 },
              { dx: 0.8682486414909363, dy: -9.285847663879395, x: 90, y: 110 },
              { dx: 2.520627975463867, dy: -9.215091705322266, x: 100, y: 110 },
              { dx: 7.245147228240967, dy: -8.47363567352295, x: 110, y: 110 },
              { dx: 2.8622498512268066, dy: -9.007637023925781, x: 120, y: 110 },
              { dx: -6.2871503829956055, dy: -0.9457563161849976, x: 160, y: 110 },
              { dx: -7.390625476837158, dy: -5.659643173217773, x: 170, y: 110 }
            ]
          },
          {
            capture: '9018988ae55e012e437aa24cbf9a400a',
            captureName: 'scenario1/capture1.jpg',
            checkedAs: 'UNPROCESSED',
            expect_image: 'revision1/scenario1/capture1.jpg',
            revision: '2',
            span: 10,
            status: 'OK',
            target_image: 'revision2/scenario1/capture1.jpg',
            threshold: 5,
            time: 0.1,
            revisionAt: '1970-01-01T00:00:02.000Z',
            updatedBy: 'system',
            updatedAt: '1970-01-01T00:00:00.000Z',
            vector: []
          }
        ]
      }, done);
    });




    // Parameters test
    // Without "order" parameter,
    //  * "/api/revisions" ordered by "id DESC"
    //  * other api ordered by "updatedAt DESC"
    it('GET /api/revisions returns 2 documents' , function(done) {
      request(app)
      .get('/api/revisions')
      .expect({
        items: [
          {
            id: 2,
            revisionAt: '1970-01-01T00:00:02.000Z',
            updatedAt: '1970-01-01T00:00:00.000Z'
          },
          {
            id: 1,
            revisionAt: '1970-01-01T00:00:01.000Z',
            updatedAt: '1970-01-01T00:00:00.000Z'
          }
        ]
      }, done);
    });
    it('GET /api/revisions?limit=1 should return the first document' , function(done) {
      request(app)
      .get('/api/revisions?limit=1')
      .expect({
        items: [
          {
            id: 2,
            revisionAt: '1970-01-01T00:00:02.000Z',
            updatedAt: '1970-01-01T00:00:00.000Z'
          }
        ]
      }, done);
    });
    it('GET /api/revisions?limit=1&skip=1 should skip one document' , function(done) {
      request(app)
      .get('/api/revisions?limit=1&skip=1')
      .expect({
        items: [
          {
            id: 1,
            revisionAt: '1970-01-01T00:00:01.000Z',
            updatedAt: '1970-01-01T00:00:00.000Z'
          }
        ]
      }, done);
    });
    it('GET /api/revisions?order=id%20ASC should sorts docs as "id ASC"' , function(done) {
      request(app)
      .get('/api/revisions?order=id%20ASC')
      .expect({
        items: [
          {
            id: 1,
            revisionAt: '1970-01-01T00:00:01.000Z',
            updatedAt: '1970-01-01T00:00:00.000Z'
          },
          {
            id: 2,
            revisionAt: '1970-01-01T00:00:02.000Z',
            updatedAt: '1970-01-01T00:00:00.000Z'
          }
        ]
      }, done);
    });
    it('GET /api/revisions/1/captures returns 2 documents' , function(done) {
      request(app)
      .get('/api/revisions/1/captures')
      .expect({
        current: {
          id: 1,
          revisionAt: '1970-01-01T00:00:01.000Z',
          total: 2,
          UNPROCESSED: 0,
          IS_OK: 2,
          IS_BUG: 0,
          updatedAt: '1970-01-01T00:00:00.000Z'
        },
        items: [{ checkedAs: 'IS_OK',
             revision: '1',
             capture: 'db38f7f3f5d7d765f97e45d185066cc9',
             captureName: 'scenario2/capture2.png',
             revisionAt: '1970-01-01T00:00:01.000Z',
             updatedBy: 'system',
             updatedAt: '1970-01-01T00:00:00.000Z',
             status: 'OK',
             span: 10,
             threshold: 5,
             vector: [],
             time: 0.1,
             target_image: 'revision1/scenario2/capture2.png',
             expect_image: 'revision1/scenario2/capture2.png' },
           { checkedAs: 'IS_OK',
             revision: '1',
             capture: '9018988ae55e012e437aa24cbf9a400a',
             captureName: 'scenario1/capture1.jpg',
             revisionAt: '1970-01-01T00:00:01.000Z',
             updatedBy: 'system',
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
    it('GET /api/revisions/1/captures?limit=1 returns 2 documents' , function(done) {
      request(app)
      .get('/api/revisions/1/captures?limit=1')
      .expect({
        current: {
          id: 1,
          revisionAt: '1970-01-01T00:00:01.000Z',
          total: 2,
          UNPROCESSED: 0,
          IS_OK: 2,
          IS_BUG: 0,
          updatedAt: '1970-01-01T00:00:00.000Z'
        },
        items:
         [{ checkedAs: 'IS_OK',
             revision: '1',
             capture: 'db38f7f3f5d7d765f97e45d185066cc9',
             captureName: 'scenario2/capture2.png',
             revisionAt: '1970-01-01T00:00:01.000Z',
             updatedBy: 'system',
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
    it('GET /api/revisions/1/captures?limit=1&skip=1 returns 2 documents' , function(done) {
      request(app)
      .get('/api/revisions/1/captures?limit=1&skip=1')
      .expect({
        current: {
          id: 1,
          revisionAt: '1970-01-01T00:00:01.000Z',
          total: 2,
          UNPROCESSED: 0,
          IS_OK: 2,
          IS_BUG: 0,
          updatedAt: '1970-01-01T00:00:00.000Z'
        },
        items:
         [{ checkedAs: 'IS_OK',
             revision: '1',
             capture: '9018988ae55e012e437aa24cbf9a400a',
             captureName: 'scenario1/capture1.jpg',
             revisionAt: '1970-01-01T00:00:01.000Z',
             updatedBy: 'system',
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

    // Test changing "checkedAs" status

    it('POST /api/revisions/2/captures/db38f7f3f5d7d765f97e45d185066cc9 should change "checkedAs"' , function(done) {
      request(app)
      .post('/api/revisions/2/captures/db38f7f3f5d7d765f97e45d185066cc9')
      .send({ checkedAs: 'IS_BUG' })
      .expect({
        current: {

          checkedAs: 'IS_BUG', // <== Changed

          capture: 'db38f7f3f5d7d765f97e45d185066cc9',
          captureName: 'scenario2/capture2.png',
          expect_image: 'revision1/scenario2/capture2.png',
          revision: '2',
          span: 10,
          status: 'SUSPICIOUS',
          target_image: 'revision2/scenario2/capture2.png',
          threshold: 5,
          time: 0.1,
          revisionAt: '1970-01-01T00:00:02.000Z',
          updatedBy: 'system',
          updatedAt: '1970-01-01T00:00:00.000Z',
          vector: [
            { dx: -5.360568046569824, dy: -0.0551748163998127, x: 80, y: 70 },
            { dx: -6.001735687255859, dy: -1.3181204795837402, x: 130, y: 70 },
            { dx: -71.92633819580078, dy: -0.5746171474456787, x: 140, y: 70 },
            { dx: -5.842303276062012, dy: -1.6100093126296997, x: 170, y: 70 },
            { dx: 6.5268402099609375, dy: 1.0273534059524536, x: 110, y: 80 },
            { dx: -18.383054733276367, dy: 1.066022515296936, x: 130, y: 80 },
            { dx: -88.46060180664062, dy: 0.5541346073150635, x: 140, y: 80 },
            { dx: -6.80324125289917, dy: 1.1075118780136108, x: 160, y: 80 },
            { dx: -8.922819137573242, dy: 0.7354532480239868, x: 170, y: 80 },
            { dx: -5.266021728515625, dy: 2.406721591949463, x: 160, y: 90 },
            { dx: -5.1159467697143555, dy: 2.25892972946167, x: 170, y: 90 },
            { dx: 0.7105715870857239, dy: -7.616470813751221, x: 90, y: 100 },
            { dx: 2.2438039779663086, dy: -8.364863395690918, x: 100, y: 100 },
            { dx: 1.3381984233856201, dy: -5.666755676269531, x: 110, y: 100 },
            { dx: 0.940326452255249, dy: -6.6747002601623535, x: 120, y: 100 },
            { dx: -5.092167377471924, dy: -2.799497604370117, x: 160, y: 100 },
            { dx: -3.990016460418701, dy: -5.452290058135986, x: 170, y: 100 },
            { dx: -1.5481517314910889, dy: -5.242636680603027, x: 80, y: 110 },
            { dx: 0.8682486414909363, dy: -9.285847663879395, x: 90, y: 110 },
            { dx: 2.520627975463867, dy: -9.215091705322266, x: 100, y: 110 },
            { dx: 7.245147228240967, dy: -8.47363567352295, x: 110, y: 110 },
            { dx: 2.8622498512268066, dy: -9.007637023925781, x: 120, y: 110 },
            { dx: -6.2871503829956055, dy: -0.9457563161849976, x: 160, y: 110 },
            { dx: -7.390625476837158, dy: -5.659643173217773, x: 170, y: 110 }
          ]
        }
      }, done);
    });

    it('should update its revision count' , function(done) {
      request(app)
      .get('/api/revisions/2')
      .expect(200)
      .expect({
        current: {
          id: 2,
          revisionAt: '1970-01-01T00:00:02.000Z',
          total: 2,
          UNPROCESSED: 1,
          IS_OK: 0,
          IS_BUG: 1,
          updatedAt: '1970-01-01T00:00:00.000Z'
        }
      }, done);
    });

    it('/api/captures should not changed any data ' , function(done) {
      request(app)
      .get('/api/captures')
      .expect(200)
      .expect({
        items: [
          {
            _id: 'db38f7f3f5d7d765f97e45d185066cc9',
            expectedRevisions: ['1'],
            updatedAt: '1970-01-01T00:00:00.000Z',
            updatedBy: 'system'
          },
          {
            _id: '9018988ae55e012e437aa24cbf9a400a',
            expectedRevisions: ['1'],
            updatedAt: '1970-01-01T00:00:00.000Z',
            updatedBy: 'system'
          }
        ]
      }, done);
    });

    it('POST /api/revisions/2/captures/db38f7f3f5d7d765f97e45d185066cc9 should change status again' , function(done) {
      request(app)
      .post('/api/revisions/2/captures/db38f7f3f5d7d765f97e45d185066cc9')
      .send({ checkedAs: 'IS_OK' })
      .expect({
        current: {
          checkedAs: 'IS_OK', /* <- changed */

          capture: 'db38f7f3f5d7d765f97e45d185066cc9',
          captureName: 'scenario2/capture2.png',
          expect_image: 'revision1/scenario2/capture2.png',
          revision: 2,
          span: 10,
          status: 'SUSPICIOUS',
          target_image: 'revision2/scenario2/capture2.png',
          threshold: 5,
          time: 0.1,
          revisionAt: '1970-01-01T00:00:02.000Z',
          updatedBy: 'system',
          updatedAt: '1970-01-01T00:00:00.000Z',
          vector: [
            { dx: -5.360568046569824, dy: -0.0551748163998127, x: 80, y: 70 },
            { dx: -6.001735687255859, dy: -1.3181204795837402, x: 130, y: 70 },
            { dx: -71.92633819580078, dy: -0.5746171474456787, x: 140, y: 70 },
            { dx: -5.842303276062012, dy: -1.6100093126296997, x: 170, y: 70 },
            { dx: 6.5268402099609375, dy: 1.0273534059524536, x: 110, y: 80 },
            { dx: -18.383054733276367, dy: 1.066022515296936, x: 130, y: 80 },
            { dx: -88.46060180664062, dy: 0.5541346073150635, x: 140, y: 80 },
            { dx: -6.80324125289917, dy: 1.1075118780136108, x: 160, y: 80 },
            { dx: -8.922819137573242, dy: 0.7354532480239868, x: 170, y: 80 },
            { dx: -5.266021728515625, dy: 2.406721591949463, x: 160, y: 90 },
            { dx: -5.1159467697143555, dy: 2.25892972946167, x: 170, y: 90 },
            { dx: 0.7105715870857239, dy: -7.616470813751221, x: 90, y: 100 },
            { dx: 2.2438039779663086, dy: -8.364863395690918, x: 100, y: 100 },
            { dx: 1.3381984233856201, dy: -5.666755676269531, x: 110, y: 100 },
            { dx: 0.940326452255249, dy: -6.6747002601623535, x: 120, y: 100 },
            { dx: -5.092167377471924, dy: -2.799497604370117, x: 160, y: 100 },
            { dx: -3.990016460418701, dy: -5.452290058135986, x: 170, y: 100 },
            { dx: -1.5481517314910889, dy: -5.242636680603027, x: 80, y: 110 },
            { dx: 0.8682486414909363, dy: -9.285847663879395, x: 90, y: 110 },
            { dx: 2.520627975463867, dy: -9.215091705322266, x: 100, y: 110 },
            { dx: 7.245147228240967, dy: -8.47363567352295, x: 110, y: 110 },
            { dx: 2.8622498512268066, dy: -9.007637023925781, x: 120, y: 110 },
            { dx: -6.2871503829956055, dy: -0.9457563161849976, x: 160, y: 110 },
            { dx: -7.390625476837158, dy: -5.659643173217773, x: 170, y: 110 }
          ]
        }
      }, done);
    });

    it('should update its revision count again' , function(done) {
      request(app)
      .get('/api/revisions/2')
      .expect(200)
      .expect({
        current: {
          id: 2,
          revisionAt: '1970-01-01T00:00:02.000Z',
          total: 2,
          UNPROCESSED: 1,
          IS_OK: 1,
          IS_BUG: 0,
          updatedAt: '1970-01-01T00:00:00.000Z'
        }
      }, done);
    });

    it('should update captures ' , function(done) {
      request(app)
      .get('/api/captures')
      .expect(200)
      .expect({
        items: [
          {
            _id: 'db38f7f3f5d7d765f97e45d185066cc9',
            expectedRevisions: ['1', '2'],
            updatedAt: '1970-01-01T00:00:00.000Z',
            updatedBy: 'system'
          },
          {
            _id: '9018988ae55e012e437aa24cbf9a400a',
            expectedRevisions: ['1'],
            updatedAt: '1970-01-01T00:00:00.000Z',
            updatedBy: 'system'
          }
        ]
      }, done);
    });

    it('GET /api/revisions/2/captures?status=SUSPICIOUS should filter docs by status' , function(done) {
      request(app)
      .get('/api/revisions/2/captures?status=SUSPICIOUS')
      .expect({
        current: {
          id: 2,
          revisionAt: '1970-01-01T00:00:02.000Z',
          total: 2,
          UNPROCESSED: 1,
          IS_OK: 1,
          IS_BUG: 0,
          updatedAt: '1970-01-01T00:00:00.000Z'
        },
        items:
         [{ revision: '2',
             capture: 'db38f7f3f5d7d765f97e45d185066cc9',
             captureName: 'scenario2/capture2.png',
             checkedAs: 'IS_OK',
             revisionAt: '1970-01-01T00:00:02.000Z',
             updatedBy: 'system',
             updatedAt: '1970-01-01T00:00:00.000Z',
             status: 'SUSPICIOUS',
             span: 10,
             threshold: 5,
             vector: [
               { dx: -5.360568046569824, dy: -0.0551748163998127, x: 80, y: 70 },
               { dx: -6.001735687255859, dy: -1.3181204795837402, x: 130, y: 70 },
               { dx: -71.92633819580078, dy: -0.5746171474456787, x: 140, y: 70 },
               { dx: -5.842303276062012, dy: -1.6100093126296997, x: 170, y: 70 },
               { dx: 6.5268402099609375, dy: 1.0273534059524536, x: 110, y: 80 },
               { dx: -18.383054733276367, dy: 1.066022515296936, x: 130, y: 80 },
               { dx: -88.46060180664062, dy: 0.5541346073150635, x: 140, y: 80 },
               { dx: -6.80324125289917, dy: 1.1075118780136108, x: 160, y: 80 },
               { dx: -8.922819137573242, dy: 0.7354532480239868, x: 170, y: 80 },
               { dx: -5.266021728515625, dy: 2.406721591949463, x: 160, y: 90 },
               { dx: -5.1159467697143555, dy: 2.25892972946167, x: 170, y: 90 },
               { dx: 0.7105715870857239, dy: -7.616470813751221, x: 90, y: 100 },
               { dx: 2.2438039779663086, dy: -8.364863395690918, x: 100, y: 100 },
               { dx: 1.3381984233856201, dy: -5.666755676269531, x: 110, y: 100 },
               { dx: 0.940326452255249, dy: -6.6747002601623535, x: 120, y: 100 },
               { dx: -5.092167377471924, dy: -2.799497604370117, x: 160, y: 100 },
               { dx: -3.990016460418701, dy: -5.452290058135986, x: 170, y: 100 },
               { dx: -1.5481517314910889, dy: -5.242636680603027, x: 80, y: 110 },
               { dx: 0.8682486414909363, dy: -9.285847663879395, x: 90, y: 110 },
               { dx: 2.520627975463867, dy: -9.215091705322266, x: 100, y: 110 },
               { dx: 7.245147228240967, dy: -8.47363567352295, x: 110, y: 110 },
               { dx: 2.8622498512268066, dy: -9.007637023925781, x: 120, y: 110 },
               { dx: -6.2871503829956055, dy: -0.9457563161849976, x: 160, y: 110 },
               { dx: -7.390625476837158, dy: -5.659643173217773, x: 170, y: 110 }],
             time: 0.1,
             target_image: 'revision2/scenario2/capture2.png',
             expect_image: 'revision1/scenario2/capture2.png' }] })
      .end(done);
    });

    it('GET /api/revisions/2/captures?checkedAs=UNPROCESSED should filter docs by checkedAs' , function(done) {
      request(app)
      .get('/api/revisions/2/captures?checkedAs=UNPROCESSED')
      .expect({
        current: {
          id: 2,
          revisionAt: '1970-01-01T00:00:02.000Z',
          total: 2,
          UNPROCESSED: 1,
          IS_OK: 1,
          IS_BUG: 0,
          updatedAt: '1970-01-01T00:00:00.000Z'
        },
        items:
         [{ revision: '2',
             capture: '9018988ae55e012e437aa24cbf9a400a',
             captureName: 'scenario1/capture1.jpg',
             checkedAs: 'UNPROCESSED',
             revisionAt: '1970-01-01T00:00:02.000Z',
             updatedBy: 'system',
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

