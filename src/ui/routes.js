var React = require('react');
var Router = require('react-router');
var {
  Route,
  DefaultRoute,
  NotFoundRoute,
  RouteHandler
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
      <RouteHandler/>
    );
  }
});

var NotFound = React.createClass({
  render: function () {
    return <h2>Not found</h2>;
  }
});

module.exports = (
  <Route handler={App}>
    <DefaultRoute handler={Index}/>
    <Route handler={Revision} name="revision" path="revisions/:revision" />
    <Route handler={RevisionCapture} name="revisioncapture" path="revisions/:revision/captures/:capture" />
    <NotFoundRoute handler={NotFound}/>
  </Route>
);
