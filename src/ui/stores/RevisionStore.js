
var AppDispatcher = require('../dispatcher/AppDispatcher');
var EventEmitter = require('events').EventEmitter;
// var TodoConstants = require('../constants/TodoConstants');
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
  current: undefined,
  revisions: [],
  revisionsTable: {},
  captures: [],
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
    .then((json) => {
      _.each(json.items, (revision) => {
        _store.revisions.push(revision);
        _store.revisionsTable[revision.id] = revision;
      });
      this.emit(CHANGE_EVENT);
    })
    .catch((err) => console.error(err.stack));
  },

  fetchCaptures(revision) {
    // TODO: Pagination
    if (_store.current) return;
    xhr(Path.join('/api/revisions', revision, 'captures'))
    .then((json) => {
      _store.current = json.current;
      _.each(json.items, (capture) => {
        _store.captures.push(capture);
        _store.capturesTable[capture.capture] = capture;
      });
      this.emit(CHANGE_EVENT);
    })
    .catch((err) => console.error(err.stack));
  },

  fetchCapture(revision, capture) {
    if (_store.current) return;
    xhr(Path.join('/api/revisions', revision, 'captures', capture))
    .then((json) => {
      _store.current = json.current;
      this.emit(CHANGE_EVENT);
    })
    .catch((err) => console.error(err.stack));
  }

});
module.exports = RevisionStore;

AppDispatcher.register(function(action) {
  switch(action.type) {
  }
});



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
