var React = require('react');
var Router = require('react-router');
var {
  Route,
  DefaultRoute,
  NotFoundRoute,
  RouteHandler,
  Link
} = Router;

var Index = require('./app/index');
var Revision = require('./app/revision');
var RevisionCapture = require('./app/revisioncapture');




var App = React.createClass({
  getInitialState: function () {
    return {
    };
  },

  render: function () {
    return (
      <div className="App">
        <nav className="navbar">
        	<div className="container">
        		<div className="navbar-header">
        			<a href="/#/" className="navbar-brand">Leviathan</a>
        		</div>
        	</div>
        </nav>
        <div className="container">
          <RouteHandler/>
        </div>
      </div>
    );
  }
});


var NotFound = React.createClass({
  render: function () {
    return <h2>Not found</h2>;
  }
});

var routes = (
  <Route handler={App}>
    <DefaultRoute handler={Index}/>
    <Route handler={Revision} name="revision" path="revisions/:revision"/>
    <Route handler={RevisionCapture} name="revisioncapture" path="revisions/:revision/captures/:capture"/>
    <NotFoundRoute handler={NotFound}/>
  </Route>
);

Router.run(routes, function (Handler) {
  React.render(<Handler/>, document.body);
});
