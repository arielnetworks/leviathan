
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

var CHANGE_EVENT = 'change';

// _revisions[revision][capture]
// TODO: We have to have two conatainers: [] (skip, limit) and {} (id dictionary)
var _store = {
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

  fetchRevisions(skip, limit) {
    // TODO: Pagination
    // if (hasAll(_store.revisions, skip, skip + limit)) return;
    if (_store.revisions.length) return;
    xhr('/api/revisions')
    .then(json => {
      _.each(json.items, (revision) => {
        _store.revisions.push(revision); // TODO: Insert to the right index with skip/limit
        _store.revisionsTable[revision.id] = revision;
      });
      this.emit(CHANGE_EVENT);
    })
    .catch(err => console.error(err.stack));
  },

  fetchRevision(revision) {
    // TODO: Pagination
    if (_store.revisionsTable[revision] &&
        _store.revisionsTable[revision].total != null &&
        _store.revisionsTable[revision].reportedAs != null) {
      return;
    }
    xhr(Path.join('/api/revisions', revision, 'captures'))
    .then(json => {
      _store.revisionsTable[revision] = json.current;
      _store.revisionsTable[revision]['@captures'] = json.items;//TODO: Insert to the right index with skip/limit
      _.each(json.items, (capture) => _store.capturesTable[capture.capture] = capture);
      this.emit(CHANGE_EVENT);
    })
    .catch((err) => console.error(err.stack));
  },

  fetchCapture(revision, capture) {
    if (_store.capturesTable[capture] &&
        _.isBoolean(_store.capturesTable[capture].hasSibling)) return;
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
  console.log(action);
  switch(action.type) {
    case Actions.CHECKAS:
      if (_store.revisionsTable[action.revision])
        _store.revisionsTable[action.revision] = null;
      if (_store.capturesTable[action.capture])
        _store.capturesTable[action.capture] = null;
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
