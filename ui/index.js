
'use strict';
var React = require('react');
var _ = require('underscore');

var MySelect = React.createClass({
  render: function () {
    return (
      <select id="" name="">
        {_.map(this.props.options, (option) =>
          <option name={option.name}>{option.label}</option>
        )}
      </select>
    )
  }
});

var MyApp = React.createClass({
  render () {
    return (
      <div>
        <MySelect options={[ {name: 'n', label: 'booooooooom'} ]} />
      </div>
    )
  } 
});

React.render(
  <MyApp />,
  document.querySelector('.container')
);





