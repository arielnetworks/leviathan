var React = require('react');
var _ = require('underscore');
var Path = require('path');
var QueryString = require('querystring');

var Table = React.createClass({

  render() {
    return (
      <div className="paged-table paged-table--captures">
        <table className="table table-hover">
          <thead>
            <tr>
              {_.map(this.props.columns, column => <th className={column.id} key={column.id}>{column.label}</th>)}
            </tr>
          </thead>
        </table>
        <div className="paged-table__canvas">
          <table className="table table-hover">
            <tbody>
              {this.props.rows.map((row, i) =>
                <tr key={i}>
                  {_.map(this.props.columns, column =>
                    <th className={column.id} key={column.id}>{column.formatter.call(this, row)}</th>
                  )}
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {this.renderPagination()}
      </div>
    );
  },

  renderPagination() {
    if (this.props.total <= perPage) return;
    var perPage = 20; // TODO: Const
    var margin = 5; // TODO: Const
    var maxPage = Math.ceil(this.props.total / perPage);
    var isLeftEdge = this.props.currPage == 1;
    var isRightEdge = this.props.currPage == maxPage;
    var rangeStart = Math.max(1, this.props.currPage - margin);
    var rangeEnd = Math.min(this.props.currPage + margin, maxPage);
    var leftskip;
    var rightskip;
    if (1 < rangeStart) {
      leftskip = <li><a href={this.props.pageUrlBuilder(rangeStart - 1)}><span>...</span></a></li>;
    }
    if (rangeEnd < maxPage) {
      rightskip = <li><a href={this.props.pageUrlBuilder(rangeEnd + 1)}><span>...</span></a></li>;
    }
    return (
      <nav className="text-center">
        <ul className="pagination">
          <li className={isLeftEdge ? 'disabled' : null}>
            <a href={this.props.pageUrlBuilder(1)}><span>&laquo;</span></a>
          </li>
          {leftskip}
          {_.map(_.range(rangeStart, rangeEnd + 1), page =>
            <li key={page} className={this.props.currPage == page ? 'active' : null}>
              <a href={this.props.pageUrlBuilder(page)}>{page}</a>
            </li>
          )}
          {rightskip}
          <li className={isRightEdge ? 'disabled' : null}>
            <a href={this.props.pageUrlBuilder(maxPage)}><span>&raquo;</span></a>
          </li>
        </ul>
      </nav>
    )
  }
});

module.exports = Table;
