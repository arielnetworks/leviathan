
/**
 * Module dependencies.
 */

var express = require('express');
// var routes = require('./routes');
var http = require('http');
var path = require('path');
var Q = require('q');
var _ = require('underscore');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.cookieParser('your secret here'));
app.use(express.session());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

// Routing
_.each([
  'revisions',
  'tidal-wave'
], function(name) {
  _.each(require('./routes/' + name), function(actions, method) {
    _.each(actions, function(handler, action) {
      app[method]('/' + name + (action == 'index' ? '' : '/' + action), handler);
    });
  });
});

// After connecting DB, launch HTTP server.
require('./persistent').connection.on('open', function() {
  http.createServer(app).listen(app.get('port'), function() {
    console.log('Express server listening on port ' + app.get('port'));
  });

  // // Generate dummy data
  // var db = require('./persistent').db;
  // var captureNames = [
  //   'ダイアログ', '一覧', 'メニューカテゴリー', 'クイックボタン', 'コンテンツセレクター',
  //   'タイトルボックス', 'アプリケーションメニュー', 'パターンセレクター', 'フィールド', 'ウィジェット',
  //   'ユーザー・グループ選択ウィジェット', 'タイムライン文書', '関連文書', '通知情報', '新しい文書がありますボタン'
  // ];
  // var creatingDummyData = [];
  // for (var i = 0; i < 10; i++) {
  //   creatingDummyData.push(Q.nfcall(db.revision.update.bind(db.revision, { id: i }, {
  //     id: i,
  //     updated_at: new Date(),
  //     $setOnInsert: { created_at: new Date() }
  //   }, { upsert: true })));
  //   for (var j = 0; j < 15; j++) {
  //     var captureId = 'revision' + i + ':capture' + j;
  //     creatingDummyData.push(Q.nfcall(db.capture.update.bind(db.capture, { id: captureId }, {
  //       id: captureId,
  //       revision: i,
  //       capture: j,
  //       capture_name: captureNames[j],
  //       updated_at: new Date(),
  //       $setOnInsert: { created_at: new Date() }
  //     }, { upsert: true })));
  //   }
  // }
  // Q.all(creatingDummyData).then(function() {
  //   console.log('-- Dummy data ready.');
  // });

});
