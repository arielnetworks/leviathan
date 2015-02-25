
var Dispatcher = require('../dispatcher/Dispatcher');
var EventEmitter = require('events').EventEmitter;
var {Actions, PER_PAGE} = require('../const');
var assign = require('object-assign');
var Q = require('q');
Q.longStackSupport = true;
var xhr = require('../xhr');
var _ = require('underscore');
var Path = require('path');
var QueryString = require('querystring');

var CHANGE_EVENT = 'change';




module.exports.create = () => {
  var _store;

  // TODO: this variable is not necessary. refactor. 
  var _emitter;

  clearStore();

  Dispatcher.register(function(action) {
    switch(action.type) {
      case Actions.CHECKAS:
        // We should not erase record here, otherwise UI will
        // be rendered twice and it's not good look.
        if (_store.revisionsTable[action.revision])
          _store.revisionsTable[action.revision]['@expired'] = true;
        if (_store.capturesTable[action.capture])
          _store.capturesTable[action.capture]['@expired'] = true;
        checkAs(action.revision, action.capture, action.as);
        break;
    }
  });

  return _emitter = assign({}, EventEmitter.prototype, {
    initialize,
    getStore,
    clearStore,
    addChangeListener,
    removeChangeListener,
    syncRevisions,
    storeRevisions,
    syncCaptures,
    storeCaptures,
    syncCapture,
    storeCapture,
    checkAs
  });

  function initialize(store) {
    _store = store;
  }

  function getStore() {
    return _store;
  }

  function clearStore() {
    _store = {
      revisionsTotal: -1,
      revisions: [],
      revisionsTable: {},
      capturesTable: {}
    };
  }

  function addChangeListener(callback) {
    _emitter.on(CHANGE_EVENT, callback);
  }

  function removeChangeListener(callback) {
    _emitter.removeListener(CHANGE_EVENT, callback);
  }

  function syncRevisions(page) {
    var { skip, limit, range } = getRequestParams(page, _store.revisionsTotal);
    if (range.every(i => _store.revisions[i])) {
      return;
    }
    xhr('/api/revisions?' + QueryString.stringify({skip, limit}))
    .then(storeRevisions)
    .catch(err => console.error(err.stack));
  }

  function syncCaptures(revision, page) {
    // TODO: Not clear enough. Use "rid" as an revision id.
    var { skip, limit, range } = getRequestParams(page,
        _store.revisionsTable[revision] ? _store.revisionsTable[revision].total : 0);
    if (_store.revisionsTable[revision] &&
        !_store.revisionsTable[revision]['@expired'] &&
        _store.revisionsTable[revision]['@captures'] &&
        range.every(i => !!_store.revisionsTable[revision]['@captures'][i])
    ) {
      return;
    }
    xhr(Path.join('/api/revisions', revision, 'captures?') + QueryString.stringify({skip, limit}))
    .then(storeCaptures.bind(null, range))
    .catch((err) => console.error(err.stack));
  }

  function storeCaptures(range, json) {
    var revision = json.current.id;
    if (_store.revisionsTable[revision]) delete _store.revisionsTable[revision]['@expired'];
    // Use _.extend to keep _store.revisions[i] and _store.revisionsTable[revision] the same reference.
    _store.revisionsTable[revision] = _.extend(_store.revisionsTable[revision] || {}, json.current);
    _store.revisionsTable[revision]['@captures'] = _store.revisionsTable[revision]['@captures'] || [];
    var skip = range[0] || 0;
    _.each(range, i => {
      var item = json.items[i - skip];
      if (!item) return;
      _store.revisionsTable[revision]['@captures'][i] = item;
      _store.capturesTable[item.capture] = item;
    });
    _emitter.emit(CHANGE_EVENT);
  }

  function syncCapture(revision, capture) {
    if (_store.capturesTable[capture] &&
        !_store.capturesTable[capture]['@expired'] &&
        _store.capturesTable[capture]['@siblings']) return;
    xhr(Path.join('/api/revisions', revision, 'captures', capture))
    .then(storeCapture)
    .catch((err) => console.error(err.stack));
  }

  function checkAs(revision, capture, as) {
    xhr.post(Path.join('/api/revisions', revision, 'captures', capture), {
      checkedAs: as
    })
    .then(storeCapture)
    .catch(err => console.error(err.stack));
  }

  function getRequestParams(page, total) {
    page = page || 1;
    var skip = (page - 1) * PER_PAGE;
    var limit = Math.min(
        total >= 0 ? total - skip : Number.MAX_VALUE,
        PER_PAGE);
    var range = _.range(skip, skip + limit);
    return { skip, limit, total, range };
  }

  function storeRevisions(json) {
    var range = _.range(json.meta.skip, json.meta.skip + json.meta.limit);
    var skip = range[0] || 0;
    _store.revisionsTotal = json.meta.total;
    _.each(range, i => {
      var item = json.items[i - skip];
      if (!item) return;
      _store.revisions[i] = item;
      _store.revisionsTable[item.id] = item;
    });
    _emitter.emit(CHANGE_EVENT);
  }

  function storeCapture(json) {
    _store.capturesTable[json.current.capture] = json.current;
    _emitter.emit(CHANGE_EVENT);
  }

};
