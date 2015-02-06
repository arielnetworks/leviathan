
var _mixins = require('./_mixins');
var _ = require('underscore');
var React = require('react');
var RevisionStore = require('../stores/RevisionStore')
var Path = require('path');
var ReactKeyboardShortcut = require('react-keyboardshortcut');
var Router = require('react-router');

var keyboardShortcut = ReactKeyboardShortcut('onKeyboardShortcut', {
  'LEFT': 'left',
  'RIGHT': 'right' 
});

var StatusClassNameMap = {
  'OK': 'info',
  'SUSPICIOUS': 'warning',
  'ERROR': 'danger'
};

var CheckedAsClassNameMap = {
  'UNPROCESSED': 'info',
  'IS_OK': 'success',
  'IS_BUG': 'danger'
};

var RevisionCapture = React.createClass({

  mixins: [_mixins, keyboardShortcut, Router.State],

  onKeyboardShortcut(e) {
    var current = this.state.capturesTable[this.getParams().capture];
    if (!current) return;
    var goto;
    switch (e.identifier) {
      case 'LEFT':
        goto = current.previous;
        break;
      case 'RIGHT':
        goto = current.next;
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
    var canvasSize = this.getCanvasSize();
    return (
      <div className="app-revisioncapture">
        <ol className="breadcrumb">
          <li><a href="#/">Leviathan</a></li>
          <li><a href={Path.join('#/revisions', this.getParams().revision)}>{this.getParams().revision}</a></li>
          <li className="active">{current.captureName}</li>
        </ol>
        <h1>Revision {this.getParams().revision}、{current.captureName} の報告です！</h1>
        <p className={'text-' + StatusClassNameMap[current.status]}>
          機械は <span className={'label label-' + StatusClassNameMap[current.status]}>{current.status}</span> と報告しています</p>
        <p className={'text-' + CheckedAsClassNameMap[current.status]}>
          現在のステータスは <span className={'label label-' + CheckedAsClassNameMap[current.checkedAs]}>{current.checkedAs}</span> です</p>
        <div className="image-and-svg" style={{width: canvasSize.w, height: canvasSize.h}}>
          <img onLoad={this.onImageLoad} src={Path.join('/captures/', current.expect_image)} />
          <img onLoad={this.onImageLoad} src={Path.join('/captures/', current.target_image)} />
          <svg className="revisioncapture" style={{width: canvasSize.w, height: canvasSize.h}}>
            {current.vector.map((v) =>
              <line x1={v.x} y1={v.y} x2={v.dx} y2={v.dy} /> 
            )}
          </svg>
        </div>
        {renderPrevNextNavigation_.call(this)}
      </div>
    )
  },

  onImageLoad(e) {
    var currentSize = this.state.canvasSize;
    this.setState({
      canvasSize: {
        w: currentSize ? Math.max(currentSize.w, e.target.naturalWidth) : e.target.naturalWidth,
        h: currentSize ? Math.max(currentSize.h, e.target.naturalHeight) : e.target.naturalHeight
      }
    })
  },

  getCanvasSize() {
    var currentSize = this.state.canvasSize;
    return currentSize || { w: 0, h: 0 };
  }

});
module.exports = RevisionCapture;


function renderPrevNextNavigation_() {
  var current = this.state.capturesTable[this.getParams().capture];
  var items = [];
  if (current.previous) {
    items.push(
      <li className="previous">
        <a href={Path.join('#/revisions', this.getParams().revision, 'captures', current.previous.capture)}>
          <span aria-hidden="true">&larr;</span> {current.previous.captureName}
        </a>
      </li>
    )
  }
  if (current.next) {
    items.push(
      <li className="next">
        <a href={Path.join('#/revisions', this.getParams().revision, 'captures', current.next.capture)}>
          {current.next.captureName} <span aria-hidden="true">&rarr;</span>
        </a>
      </li>
    )
  }
  if (items.length) {
    return (
      <nav><ul className="pager">{items}</ul></nav>
    )
  }
  console.log('xxxxxxx');
  return;
}
