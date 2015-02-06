
var _mixins = require('./_mixins');
var _ = require('underscore');
var React = require('react');
var RevisionStore = require('../stores/RevisionStore')
var Path = require('path');
var ReactKeyboardShortcut = require('react-keyboardshortcut');
var Router = require('react-router');

var StatusClassNameMap = {
  'OK': 'info',
  'SUSPICIOUS': 'warning',
  'ERROR': 'danger'
};

var RevisionCapture = React.createClass({

  mixins: [_mixins, ReactKeyboardShortcut('onKeyboardShortcut'), Router.State],

  onKeyboardShortcut(e) {
    console.log(e.identifier);
  },

  componentDidMount() {
    RevisionStore.fetchCapture(this.getParams().revision, this.getParams().capture);
    ReactKeyboardShortcut.register('A', 'a');
  },

  // TODO: "/captures" must come from global.configure
  render() {
    var current = this.state.current;
    if (!current) return <span>...</span>;
    var canvasSize = this.getCanvasSize();
    return (
      <div>
        <ol className="breadcrumb">
          <li><a href="#/">Leviathan</a></li>
          <li><a href={Path.join('#/revisions', this.getParams().revision)}>{this.getParams().revision}</a></li>
          <li className="active">{current.captureName}</li>
        </ol>
        <h1>Revision {this.getParams().revision}、{current.captureName} の報告です！</h1>
        <p className={'text-' + StatusClassNameMap[current.status]}>
          機械は<span className={'label label-' + StatusClassNameMap[current.status]}>{current.status}</span>と報告しています</p>
        <div className="image-and-svg" style={{width: canvasSize.w, height: canvasSize.h}}>
          <img onLoad={this.onImageLoad} src={Path.join('/captures/', current.expect_image)} />
          <img onLoad={this.onImageLoad} src={Path.join('/captures/', current.target_image)} />
          <svg className="revisioncapture" style={{width: canvasSize.w, height: canvasSize.h}}>
            {current.vector.map((v) =>
              <line x1={v.x} y1={v.y} x2={v.dx} y2={v.dy} /> 
            )}
          </svg>
        </div>

      </div>
    )
  },

  onImageLoad(e) {
    var currentSize = this.state.canvalSize;
    this.setState({
      canvalSize: {
        w: currentSize ? Math.max(currentSize.w, e.target.naturalWidth) : e.target.naturalWidth,
        h: currentSize ? Math.max(currentSize.h, e.target.naturalHeight) : e.target.naturalHeight
      }
    })
  },

  getCanvasSize() {
    var currentSize = this.state.canvalSize;
    return currentSize || { w: 0, h: 0 };
  }

});
module.exports = RevisionCapture;

