

var React = require('react');


require('./app/index');
require('./app/revision');


/* watchify -r の調子が悪いのでこうするしかない */
['index', 'revision'].some(pagename => {
  var tmp;
  if (tmp = document.querySelector('.container-' + pagename)) {
    React.render(new React.createElement(require('./app/' + pagename)), tmp);
  }
})
