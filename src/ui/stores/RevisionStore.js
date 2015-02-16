
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
global._store = _store;



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
        _store.revisionsTotal >= 0 ? _store.revisionsTotal - skip : Number.MAX_VALUE,
        perPage);
    var range = _.range(skip, skip + limit);
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

  syncCaptures(revision, page) {
    // TODO: Not clear enough. Use "rid" as an revision id.
    // TODO: Similar code. Refactor.
    page = page || 1;
    var skip = (page - 1) * perPage;
    var limit = Math.min(
        _store.revisionsTable[revision] && _.isNumber(_store.revisionsTable[revision].total) ?
            _store.revisionsTable[revision].total - skip : Number.MAX_VALUE,
        perPage);
    var range = _.range(skip, skip + limit);
    if (_store.revisionsTable[revision] &&
        !_store.revisionsTable[revision]['@expired'] &&
        _store.revisionsTable[revision]['@captures'] &&
        range.every(i => !!_store.revisionsTable[revision]['@captures'][i])
    ) {
      return;
    }
    xhr(Path.join('/api/revisions', revision, 'captures?') + QueryString.stringify({skip, limit}))
    .then(json => {
      if (_store.revisionsTable[revision]) delete _store.revisionsTable[revision]['@expired'];
      // Use _.extend to keep _store.revisions[i] and _store.revisionsTable[revision] the same reference.
      _store.revisionsTable[revision] = _.extend(_store.revisionsTable[revision] || {}, json.current);
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
        !_store.capturesTable[capture]['@expired'] &&
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
        _store.revisionsTable[action.revision]['@expired'] = true;
      if (_store.capturesTable[action.capture])
        _store.capturesTable[action.capture]['@expired'] = true;
      RevisionStore.checkAs(action.revision, action.capture, action.as);
      break;
  }
});



function handleCaptureResponse(json) {
  _store.capturesTable[json.current.capture] = json.current;
  this.emit(CHANGE_EVENT);
}

