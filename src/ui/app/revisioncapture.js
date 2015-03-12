
var _mixins = require('./_mixins');
var _ = require('underscore');
var React = require('react');
var Path = require('path');
var reactKeyboardShortcut = require('react-keyboardshortcut');
var {State, HistoryLocation,Link} = require('react-router');
var {StatusClassNameMap,
     CheckedAsClassNameMap,
     ToggleCheckedAsOrder} = require('../../const');
var Actions = require('../actions/Actions');
var ProgressBar = require('../components/ProgressBar');
var Navbar = require('../components/Navbar');

var keyboardShortcut = reactKeyboardShortcut('onKeyboardShortcut', {
  'LEFT': 'left',
  'RIGHT': 'right',
  'UP': 'up',
  'DOWN': 'down',
  'H': 'h',
  'J': 'j',
  'K': 'k',
  'L': 'l'
});

var RevisionCapture = React.createClass({

  getInitialState() {
    var store = this.props.store.getStore();
    return {
      revision: store.revisionsTable[this.getParams().revision],
      capture: store.capturesTable[this.getParams().capture]
    };
  },

  _onChange() {
    var store = this.props.store.getStore();
    this.setState({
      revision: store.revisionsTable[this.getParams().revision],
      capture: store.capturesTable[this.getParams().capture]
    });
  },

  mixins: [_mixins, keyboardShortcut, State],

  onKeyboardShortcut(e) {
    var current = this.state.capture;
    var siblings = current && current['@siblings'];
    if (!siblings) return;
    switch (e.identifier) {
      case 'LEFT':
      case 'H':
        if (siblings.previous) gotoSibling.call(this, siblings.previous.capture);
        break;
      case 'RIGHT':
      case 'L':
        if (siblings.next) gotoSibling.call(this, siblings.next.capture);
        break;
      case 'UP':
      case 'K':
        Actions.toggleCheckedAs(this.state.capture, -1);
        break;
      case 'DOWN':
      case 'J':
        Actions.toggleCheckedAs(this.state.capture, 1);
        break;
    }
  },

  onChangeDiableBlink() {
    this.setState({
      disableBlink: !this.state.disableBlink
    });
  },

  // TODO: "/captures" must come from global.configure
  render() {
    // TODO: Sync once.
    this.props.store.syncCaptures(this.getParams().revision, 1);
    this.props.store.syncCapture(this.getParams().revision, this.getParams().capture);
    var current = this.state.capture;
    if (!current) return <span>...</span>;
    var revision = this.state.revision;
    return (
      <div className="app-revisioncapture">
        <Navbar capture={current} />
        <div className="container">
          {<ProgressBar cssModifier="large" revision={revision} />}
          <h2 className="app-revisioncapture__keyboarshortcut__title">
            これは
            <button className={'app-revisioncapture__keyboarshortcut__title__btn btn btn-lg btn-' + CheckedAsClassNameMap[current.checkedAs]}
                  onClick={() => Actions.toggleCheckedAs(current, 1)}>
              {current.checkedAs}
            </button>
            ですね！
            <small>
              <small className={'text-' + StatusClassNameMap[current.status]}>
                機械は <small className={'label label-' + StatusClassNameMap[current.status]}>{current.status}</small> と報告しています
              </small>
              <small>
                <label for="enableBlink">
                  <input id="enableBlink"type="checkbox" checked={!this.state.disableBlink} onChange={this.onChangeDiableBlink} /> 点滅
                </label>
              </small>
            </small>
          </h2>
          <div className={'app-revisioncapture__keyboarshortcut__svg ' + (this.state.disableBlink ? '' : 'app-revisioncapture__keyboarshortcut__svg--blink')}
               style={{width: current.width, height: current.height}}>
            <img className="app-revisioncapture__keyboarshortcut__svg__expected" src={Path.join('/captures/', current.expect_image)} />
            <img className="app-revisioncapture__keyboarshortcut__svg__target" src={Path.join('/captures/', current.target_image)} />
            <svg className="revisioncapture" style={{width: current.width, height: current.height}}>
              {current.vector.map((v, i) =>
                <line key={i} x1={v.x} y1={v.y} x2={v.x + v.dx} y2={v.y + v.dy} />
              )}
            </svg>
          </div>
          <div className="app-revisioncapture__keyboarshortcut__togglebuttons">
            このキャプチャは...
            {_.map(ToggleCheckedAsOrder, as =>
              <button key={as} className={'btn btn-' + CheckedAsClassNameMap[as] + (current.checkedAs === as ? ' active' : '')} onClick={Actions.checkAs.bind(null, this.getParams().revision, this.getParams().capture, as)}>{as}</button>)}
            です
          </div>
          {renderPrevNextNavigation_.call(this)}
          <div className="app-revisioncapture__keyboarshortcut">
            <span className="app-revisioncapture__keyboarshortcut__item">
              <kbd>←</kbd> to previous,
            </span>
            <span className="app-revisioncapture__keyboarshortcut__item">
              <kbd>→</kbd> to next,
            </span>
            <span className="app-revisioncapture__keyboarshortcut__item">
              <kbd>↓</kbd> / <kbd>↑</kbd> to toggle status
            </span>
          </div>
        </div>
      </div>
    );
  }

});
module.exports = RevisionCapture;



function gotoSibling(capture) {
  HistoryLocation.push(Path.join('#/revisions', this.getParams().revision, 'captures', capture));
}

function renderPrevNextNavigation_() {
  var current = this.state.capture;
  var siblings = current && current['@siblings'];
  if (!siblings) return;
  var items = [];
  if (siblings.previous) {
    items.push(
      <li key="previous" className="previous">
        <Link to="/revisions/:revision/captures/:capture" params={{revision: this.getParams().revision, captures: siblings.previous.capture}}>
          <span aria-hidden="true">&larr;</span> {siblings.previous.captureName}
        </Link>
      </li>
    );
  }
  if (siblings.next) {
    items.push(
      <li key="next" className="next">
        <Link to="/revisions/:revision/captures/:capture" params={{revision: this.getParams().revision, captures: siblings.next.capture}}>
          {siblings.next.captureName} <span aria-hidden="true">&rarr;</span>
        </Link>
      </li>
    );
  }
  if (items.length) {
    return (
      <nav><ul className="pager">{items}</ul></nav>
    );
  }
  return;
}
