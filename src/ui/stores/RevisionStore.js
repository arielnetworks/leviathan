
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
  var _dispatcherId;

  var emitter = assign({}, EventEmitter.prototype, {

    initialize(store) {
      _store = store;

      _dispatcherId = Dispatcher.register(action => {
        switch(action.type) {
          case Actions.CHECKAS:
            // We should not erase record here, otherwise UI will
            // be rendered twice and it's not good look.
            if (_store.revisionsTable[action.revision])
              _store.revisionsTable[action.revision]['@expired'] = true;
            if (_store.capturesTable[action.capture])
              _store.capturesTable[action.capture]['@expired'] = true;
            emitter.checkAs(action.revision, action.capture, action.as);
            break;
        }
      });
    },

    getStore() {
      return _store;
    },

    clearStore() {
      _store = {
        revisionsTotal: -1,
        revisions: [],
        revisionsTable: {},
        capturesTable: {}
      };
      if (_dispatcherId) {
        Dispatcher.unregister(_dispatcherId);
      }
    },

    addChangeListener(callback) {
      emitter.on(CHANGE_EVENT, callback);
    },

    removeChangeListener(callback) {
      emitter.removeListener(CHANGE_EVENT, callback);
    },

    syncRevisions(page) {
      var { skip, limit, range } = getRequestParams(page, _store.revisionsTotal);
      if (range.every(i => _store.revisions[i])) {
        return;
      }
      xhr('/api/revisions?' + QueryString.stringify({skip, limit}))
      .then(emitter.storeRevisions)
      .catch(err => console.error(err.stack));
    },

    syncCaptures(revision, page) {
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
      .then(emitter.storeCaptures)
      .catch((err) => console.error(err.stack));
    },

    storeCaptures(json) {
      var range = _.range(json.meta.skip, json.meta.skip + json.meta.limit);
      var skip = range[0] || 0;
      var revision = json.current.id;
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
      emitter.emit(CHANGE_EVENT);
    },

    syncCapture(revision, capture) {
      if (_store.capturesTable[capture] &&
          !_store.capturesTable[capture]['@expired'] &&
          _store.capturesTable[capture]['@siblings']) return;
      xhr(Path.join('/api/revisions', revision, 'captures', capture))
      .then(emitter.storeCapture)
      .catch((err) => console.error(err.stack));
    },

    checkAs(revision, capture, as) {
      xhr.post(Path.join('/api/revisions', revision, 'captures', capture), {
        checkedAs: as
      })
      .then(emitter.storeCapture)
      .catch(err => console.error(err.stack));
    },

    storeRevisions(json) {
      var range = _.range(json.meta.skip, json.meta.skip + json.meta.limit);
      var skip = range[0] || 0;
      _store.revisionsTotal = json.meta.total;
      _.each(range, i => {
        var item = json.items[i - skip];
        if (!item) return;
        _store.revisions[i] = item;
        _store.revisionsTable[item.id] = item;
      });
      emitter.emit(CHANGE_EVENT);
    },

    storeCapture(json) {
      _store.capturesTable[json.current.capture] = json.current;
      emitter.emit(CHANGE_EVENT);
    }

  });

  emitter.clearStore();

  return emitter;

};

function getRequestParams(page, total) {
  page = page || 1;
  var skip = (page - 1) * PER_PAGE;
  var limit = Math.min(
      total >= 0 ? total - skip : Number.MAX_VALUE,
      PER_PAGE);
  var range = _.range(skip, skip + limit);
  return { skip, limit, total, range };
}
