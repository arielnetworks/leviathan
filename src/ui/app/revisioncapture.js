
var _mixins = require('./_mixins');
var _ = require('underscore');
var React = require('react');
var RevisionStore = require('../stores/RevisionStore')
var Path = require('path');
var ReactKeyboardShortcut = require('react-keyboardshortcut');
var Router = require('react-router');
var {CheckedAs, StatusClassNameMap, CheckedAsClassNameMap} = require('../const');
var Actions = require('../actions/Actions');
var ProgressBar = require('../components/ProgressBar');
var Navbar = require('../components/Navbar');

var ToggleCheckedAsOrder = [CheckedAs.IS_OK, // UP
             CheckedAs.UNPROCESSED,
             CheckedAs.IS_BUG]; // DOWN

var keyboardShortcut = ReactKeyboardShortcut('onKeyboardShortcut', {
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
    var store = RevisionStore.get();
    return {
      revision: store.revisionsTable[this.getParams().revision],
      capture: store.capturesTable[this.getParams().capture]
    };
  },

  _onChange() {
    var store = RevisionStore.get();
    this.setState({
      revision: store.revisionsTable[this.getParams().revision],
      capture: store.capturesTable[this.getParams().capture]
    });
  },

  mixins: [_mixins, keyboardShortcut, Router.State],

  onKeyboardShortcut(e) {
    var current = this.state.capture;
    var siblings = current && current['@siblings'];
    if (!siblings) return;
    var goto;
    switch (e.identifier) {
      case 'LEFT':
      case 'H':
        if (siblings.previous) gotoSibling.call(this, siblings.previous.capture)
        break;
      case 'RIGHT':
      case 'L':
        if (siblings.next) gotoSibling.call(this, siblings.next.capture)
        break;
      case 'UP':
      case 'K':
        toggleCheckedAs.call(this, -1);
        break;
      case 'DOWN':
      case 'J':
        toggleCheckedAs.call(this, 1);
        break;
    }
  },

  onChangeDiableBlink() {
    this.setState({
      disableBlink: !this.state.disableBlink
    })
  },

  // TODO: "/captures" must come from global.configure
  render() {
    // TODO: Sync once.
    RevisionStore.syncCaptures(this.getParams().revision, 1);
    RevisionStore.syncCapture(this.getParams().revision, this.getParams().capture);
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
            <span className={'label label-' + CheckedAsClassNameMap[current.checkedAs]}>
              {current.checkedAs}
            </span>
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
            {_.map(ToggleCheckedAsOrder, as => {
              return <button key={as} className={'btn btn-' + CheckedAsClassNameMap[as] + (current.checkedAs == as ? ' active' : '')} onClick={Actions.checkAs.bind(null, this.getParams().revision, this.getParams().capture, as)}>{as}</button>
            })}
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
    )
  }

});
module.exports = RevisionCapture;



function toggleCheckedAs(direction) {
  var current = this.state.capture;
  if (!current) return;
  var currIndex = ToggleCheckedAsOrder.indexOf(current.checkedAs);
  var to = ToggleCheckedAsOrder[currIndex + direction];
  if (to) {
    Actions.checkAs(this.getParams().revision, this.getParams().capture, to);
  }
}

function gotoSibling(capture) {
  location.href = Path.join('#/revisions', this.getParams().revision, 'captures', capture);
}

function renderPrevNextNavigation_() {
  var current = this.state.capture;
  var siblings = current && current['@siblings'];
  if (!siblings) return;
  var items = [];
  if (siblings.previous) {
    items.push(
      <li key="previous" className="previous">
        <a href={Path.join('#/revisions', this.getParams().revision, 'captures', siblings.previous.capture)}>
          <span aria-hidden="true">&larr;</span> {siblings.previous.captureName}
        </a>
      </li>
    )
  }
  if (siblings.next) {
    items.push(
      <li key="next" className="next">
        <a href={Path.join('#/revisions', this.getParams().revision, 'captures', siblings.next.capture)}>
          {siblings.next.captureName} <span aria-hidden="true">&rarr;</span>
        </a>
      </li>
    )
  }
  if (items.length) {
    return (
      <nav><ul className="pager">{items}</ul></nav>
    )
  }
  return;
}

function renderTitleIcon_() {
}
