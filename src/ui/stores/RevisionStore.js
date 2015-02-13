
var Dispatcher = require('../dispatcher/Dispatcher');
var EventEmitter = require('events').EventEmitter;
var {CheckedAs, Actions} = require('../const');
var assign = require('object-assign');
var Q = require('q');
Q.longStackSupport = true;
var xhr = require('../xhr');
var _ = require('underscore');
var assert = require('assert');
var Path = require('path');
var QueryString = require('querystring');

var CHANGE_EVENT = 'change';

var perPage = 20; // TODO: Const

// _revisions[revision][capture]
// TODO: We have to have two conatainers: [] (skip, limit) and {} (id dictionary)
var _store = {
  revisionsTotal: -1,
  revisions: [],
  revisionsTable: {},
  capturesTable: {}
};



var RevisionStore = assign({}, EventEmitter.prototype, {

  get() {
    return _store;
  },

  addChangeListener(callback) {
    this.on(CHANGE_EVENT, callback);
  },

  removeChangeListener(callback) {
    this.removeListener(CHANGE_EVENT, callback);
  },

  syncRevisions(page) {
    // TODO: Similar code. Refactor.
    page = page || 1;
    var skip = (page - 1) * perPage;
    var limit = Math.min(
        _store.revisionsTotal >= 0 ? _store.revisionsTotal : Number.MAX_VALUE,
        perPage);
    var range = _.range(skip, skip + limit);
    // TODO: Should think about total otherwise it loops infinitly.
    if (range.every(i => _store.revisions[i])) {
      return;
    }
    xhr('/api/revisions?' + QueryString.stringify({skip, limit}))
    .then(json => {
      _store.revisionsTotal = json.meta.total;
      _.each(range, i => {
        var item = json.items[i - skip];
        if (!item) return;
        _store.revisions[i] = item;
        _store.revisionsTable[item.id] = item;
      });
      this.emit(CHANGE_EVENT);
    })
    .catch(err => console.error(err.stack));
  },

  syncRevision(revision, page) {
    // TODO: Use "rid" as an revision id.
    // TODO: Similar code. Refactor.
    page = page || 1;
    var skip = (page - 1) * perPage;
    var limit = Math.min(
        _store.revisionsTable[revision] && _.isNumber(_store.revisionsTable[revision].total) ?
            _store.revisionsTable[revision].total : Number.MAX_VALUE,
        perPage);
    var range = _.range(skip, limit);
    if (_store.revisionsTable[revision] &&
        !_store.revisionsTable[revision]['_expired'] &&
        _store.revisionsTable[revision]['@captures'] &&
        range.every(i => !!_store.revisionsTable[revision]['@captures'][i])
    ) {
      return;
    }
    xhr(Path.join('/api/revisions', revision, 'captures?') + QueryString.stringify({skip, limit}))
    .then(json => {
      _store.revisionsTable[revision] = json.current;
      _store.revisionsTable[revision]['@captures'] = _store.revisionsTable[revision]['@captures'] || [];
      _.each(range, i => {
        var item = json.items[i - skip];
        if (!item) return;
        _store.revisionsTable[revision]['@captures'][i] = item;
        _store.capturesTable[item.capture] = item;
      });
      this.emit(CHANGE_EVENT);
    })
    .catch((err) => console.error(err.stack));
  },

  syncCapture(revision, capture) {
    if (_store.capturesTable[capture] &&
        !_store.capturesTable[capture]['_expired'] &&
        _store.capturesTable[capture]['@siblings']) return;
    xhr(Path.join('/api/revisions', revision, 'captures', capture))
    .then(handleCaptureResponse.bind(this))
    .catch((err) => console.error(err.stack));
  },

  checkAs(revision, capture, as) {
    xhr.post(Path.join('/api/revisions', revision, 'captures', capture), {
      checkedAs: as
    })
    .then(handleCaptureResponse.bind(this))
    .catch(err => console.error(err.stack));
  }

});
module.exports = RevisionStore;

Dispatcher.register(function(action) {
  switch(action.type) {
    case Actions.CHECKAS:
      // We should not erase record here, otherwise UI will
      // be rendered twice and it's not good look.
      if (_store.revisionsTable[action.revision])
        _store.revisionsTable[action.revision]['_expired'] = true;
      if (_store.capturesTable[action.capture])
        _store.capturesTable[action.capture]['_expired'] = true;
      RevisionStore.checkAs(action.revision, action.capture, action.as);
      break;
  }
});



function handleCaptureResponse(json) {
  _store.capturesTable[json.current.capture] = json.current;
  this.emit(CHANGE_EVENT);
}

function hasAll(arr, from, to) {
  for (var i = from; i < to; i++) {
    if (arr[i] === undefined) {
      return false;
    }
  }
  return true;
}
(function testHasAll() {
  var arr = [undefined, {}, undefined, {}, {}, {}, undefined];
  assert(hasAll(arr, 1, 2));
  assert(hasAll(arr, 3, 6));
  assert(!hasAll(arr, 0, 6));
  assert(!hasAll(arr, 1, 6));
  assert(!hasAll(arr, 3, 7));
})();
