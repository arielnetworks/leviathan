
var React = require('react');
var Router = require('react-router');
var Path = require('path');
var Link = require('../components/Link');



var Navbar = React.createClass({
  mixins: [Router.State],
  render() {
    var revision = this.getParams().revision;
    var crumbs = [
      <li key="brand" className="breadcrumb--headernav__brand"><Link path="/">
        Leviathan
      </Link></li>
    ];
    if (revision) {
      if (this.props.capture) {
        crumbs.push(
          <li key="revision" className="active">
            <Link path={Path.join('/revisions', revision)}>{revision}</Link>
          </li>
        );
      } else {
        crumbs.push(
          <li key="revision">{revision}</li>
        );
      }
    }
    if (this.props.capture) {
      crumbs.push(
        <li key="capture" className="active">{this.props.capture.captureName}</li>
      );
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
    );
  }

});

module.exports = Navbar;
