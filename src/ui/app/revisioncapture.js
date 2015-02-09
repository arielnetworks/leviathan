
var _mixins = require('./_mixins');
var _ = require('underscore');
var React = require('react');
var RevisionStore = require('../stores/RevisionStore')
var Path = require('path');
var ReactKeyboardShortcut = require('react-keyboardshortcut');
var Router = require('react-router');
var Const = require('../const');
var Actions = require('../actions/Actions');

var keyboardShortcut = ReactKeyboardShortcut('onKeyboardShortcut', {
  'LEFT': 'left',
  'RIGHT': 'right' 
});

var RevisionCapture = React.createClass({

  mixins: [_mixins, keyboardShortcut, Router.State],

  onKeyboardShortcut(e) {
    var current = this.state.capturesTable[this.getParams().capture];
    var siblings = current && current['@siblings'];
    if (!siblings) return;
    var goto;
    switch (e.identifier) {
      case 'LEFT':
        goto = siblings.previous;
        break;
      case 'RIGHT':
        goto = siblings.next;
        break;
    }
    if (goto) {
      location.href = Path.join('#/revisions', this.getParams().revision, 'captures', goto.capture);
    }
  },

  // TODO: "/captures" must come from global.configure
  render() {
    RevisionStore.fetchCapture(this.getParams().revision, this.getParams().capture);
    var current = this.state.capturesTable[this.getParams().capture];
    if (!current) return <span>...</span>;
    return (
      <div className="app-revisioncapture">
        <ol className="breadcrumb">
          <li><a href="#/">Leviathan</a></li>
          <li><a href={Path.join('#/revisions', this.getParams().revision)}>{this.getParams().revision}</a></li>
          <li className="active">{current.captureName}</li>
        </ol>
        <h1>Revision {this.getParams().revision}、{current.captureName} の報告です！</h1>
        <p className={'text-' + Const.StatusClassNameMap[current.status]}>
          機械は <span className={'label label-' + Const.StatusClassNameMap[current.status]}>{current.status}</span> と報告しています</p>
        <p className={'text-' + Const.CheckedAsClassNameMap[current.status]}>
          現在のステータスは <span className={'label label-' + Const.CheckedAsClassNameMap[current.checkedAs]}>{current.checkedAs}</span> です</p>
        <div className="image-and-svg" style={{width: current.width, height: current.height}}>
          <img src={Path.join('/captures/', current.expect_image)} />
          <img src={Path.join('/captures/', current.target_image)} />
          <svg className="revisioncapture" style={{width: current.width, height: current.height}}>
            {current.vector.map(v =>
              <line x1={v.x} y1={v.y} x2={v.dx} y2={v.dy} /> 
            )}
          </svg>
        </div>
        <h3>CheckAs</h3>
        <ul>
          {_.map(Const.CheckedAs, name => {
            return <button onClick={Actions.checkAs.bind(null, this.getParams().revision, this.getParams().capture, name)}>{name}</button>
          })}
        </ul>
        {renderPrevNextNavigation_.call(this)}
      </div>
    )
  }

});
module.exports = RevisionCapture;



function renderPrevNextNavigation_() {
  var current = this.state.capturesTable[this.getParams().capture];
  var siblings = current && current['@siblings'];
  if (!siblings) return;
  var items = [];
  if (siblings.previous) {
    items.push(
      <li className="previous">
        <a href={Path.join('#/revisions', this.getParams().revision, 'captures', siblings.previous.capture)}>
          <span aria-hidden="true">&larr;</span> {siblings.previous.captureName}
        </a>
      </li>
    )
  }
  if (siblings.next) {
    items.push(
      <li className="next">
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
