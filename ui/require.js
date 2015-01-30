

var React = require('react');


require('./app/index');
require('./app/revision');

/* はやくやめたい jade から渡したい */
var data = {};
try {
  data.revision = window.location.pathname.match(/^\/revisions\/(.+?)\/?/)[1];
  data.capture = window.location.pathname.match(/^\/revisions\/.+?\/captures\/(.+)/)[1] ||
                 window.location.pathname.match(/^\/captures\/(.+)/)[1];
} catch (e) {}

/* watchify -r の調子が悪いのでこうするしかない */
['index', 'revision'].some(pagename => {
  var tmp;
  if (tmp = document.querySelector('.container-' + pagename)) {
    React.render(new React.createElement(require('./app/' + pagename), data), tmp);
  }
})
