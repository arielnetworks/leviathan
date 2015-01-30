
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
var _store = {
  revisions: []
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
      _.extend(_store.revisions, json.revisions)
      this.emit(CHANGE_EVENT);
    })
    .catch((err) => console.error(err.stack));
  },

  fetchSingle(revision) {
    if (!_.isString(revision)) return;
    if (_store.revisions[revision]) return;
    xhr(Path.join('/api/revisions', revision))
    .then((json) => {
      _store.revisions[revision] = json;
      this.emit(CHANGE_EVENT);
    })
    .catch((err) => console.error(err.stack));
  },

  fetchCaptures(revision) {
    if (_store.revisions[revision] && _store.revisions[revision].revision) return;
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
