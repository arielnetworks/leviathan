
var React = require('react');
var Const = require('../const');
var Router = require('react-router');
var Path = require('path');



var Navbar = React.createClass({
  mixins: [Router.State],
  render() {
    var revision = this.getParams().revision
    var crumbs = [
      <li key="brand" className="breadcrumb--headernav__brand"><a href="#/">
        Leviathan
      </a></li>
    ];
    if (revision) {
      if (this.props.capture) {
        crumbs.push(
          <li key="revision" className="active">
            <a href={Path.join('#/revisions', revision)}>{revision}</a>
          </li>
        )
      } else {
        crumbs.push(
          <li key="revision">{revision}</li>
        )
      }
    }
    if (this.props.capture) {
      crumbs.push(
        <li key="capture" className="active">{this.props.capture.captureName}</li>
      )
    }
    return (
      <nav className="navbar">
        <div className="container">
          <div className="navbar-header">
            <ol className="breadcrumb breadcrumb--headernav">
              {crumbs}
            </ol>
          </div>
        </div>
      </nav>
    )
  }

});

module.exports = Navbar;
