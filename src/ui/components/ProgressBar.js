
var React = require('react');



var ProgressBar = React.createClass({
  render() {
    var revision = this.props.revision;
    var contentHTML;
    if (revision) {
      var total = revision.total;
      var processed = (total - revision['UNPROCESSED && !OK']) / total * 100;
      var needToProcess = revision['UNPROCESSED && !OK'] / total * 100;
      var done = revision['UNPROCESSED && !OK'] === 0;
      contentHTML = [
        <div key="success" className={'progress-bar ' + (done ? 'progress-bar-success' : 'progress-bar-info progress-bar-striped active')}
             style={{width: processed + '%'}}><span>
             <i className="fa fa-check"></i>
             機械OKまたは人間処理済</span></div>,
        <div key="danger" className={'progress-bar progress-bar-danger'}
             style={{width: needToProcess + '%'}}><span>のこり {revision['UNPROCESSED && !OK']}件！ 機械NGかつ人間未処理</span></div>
      ];
    }
    return (
      <div className={'progress ' + (this.props.cssModifier ? 'progress--' + this.props.cssModifier : '')}>
        {contentHTML}
      </div>
    );
  }
});

module.exports = ProgressBar;
