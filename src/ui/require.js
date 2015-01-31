

var React = require('react');


require('./app/index');
require('./app/revision');
require('./app/revisioncapture');

var data = {};
var dataset = document.body.dataset;
if (dataset.revision) data.revision = dataset.revision;
if (dataset.capture) data.capture = dataset.capture;

/* watchify -r の調子が悪いのでこうするしかない */
['index', 'revision', 'revisioncapture'].some(pagename => {
  var tmp;
  if (tmp = document.querySelector('.container-' + pagename)) {
    React.render(new React.createElement(require('./app/' + pagename), data), tmp);
  }
})
