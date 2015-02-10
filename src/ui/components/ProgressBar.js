
var React = require('react');
var Const = require('../const');



var ProgressBar = React.createClass({
  render() {
    var revision = this.props.revision;
    var contentHTML;
    if (revision) {
      var total = revision.total;
      var processed = (total - revision['UNPROCESSED && !OK']) / total * 100;
      var needToProcess = revision['UNPROCESSED && !OK'] / total * 100;
      var done = revision['UNPROCESSED && !OK'] == 0;
      contentHTML = [
        <div className={'progress-bar progress-bar-success' + (done ? '' : ' progress-bar-striped active')}
             style={{width: processed + '%'}}><span>機械OKまたは人間処理済</span></div>,
        <div className={'progress-bar progress-bar-danger'}
             style={{width: needToProcess + '%'}}><span>のこり {revision['UNPROCESSED && !OK']}件！ 機械NGかつ人間未処理</span></div>
      ];
    }
    return (
      <div className="progress">
        {contentHTML}
      </div>  
    )
  }
});

module.exports = ProgressBar;
