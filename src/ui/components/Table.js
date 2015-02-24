var React = require('react');
var _ = require('underscore');
var Link = require('./Link');

var perPage = 20; // TODO: Const

var Table = React.createClass({

  // TODO: Impl sort function.

  render() {

    var start = (this.props.currPage - 1) * perPage;
    var end = Math.min(start + perPage, this.props.total);
    var rows = this.props.rows.slice(start, end);

    return (
      <div className={'paged-table ' + (this.props.cssModifier ? 'paged-table--' + this.props.cssModifier : '')}>
        <table className="table table-hover">
          <thead>
            <tr>
              {_.map(this.props.columns, column =>
                <th onClick={column.onClick} className={getCellCssName(column, true)} key={column.id}>{column.label}</th>)}
            </tr>
          </thead>
        </table>
        <div className="paged-table__canvas">
          <table className="table table-hover">
            <tbody>
              {rows.map((row, i) =>
                <tr key={(this.props.currPage * perPage - 1) + i}>
                  {_.map(this.props.columns, column =>
                    <td className={getCellCssName(column)} key={column.id}>{column.formatter.call(this, row)}</td>
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
    var margin = 5; // TODO: Const
    var maxPage = Math.ceil(this.props.total / perPage);
    var isLeftEdge = this.props.currPage === 1;
    var isRightEdge = this.props.currPage === maxPage;
    var rangeStart = Math.max(1, this.props.currPage - margin);
    var rangeEnd = Math.min(this.props.currPage + margin, maxPage);
    var leftskip;
    var rightskip;
    if (rangeStart > 1) {
      leftskip = <li><Link path={this.props.pageUrlBuilder(rangeStart - 1)}>...</Link></li>;
    }
    if (rangeEnd < maxPage) {
      rightskip = <li><Link path={this.props.pageUrlBuilder(rangeEnd + 1)}>...</Link></li>;
    }
    return (
      <nav className="text-center">
        <ul className="pagination">
          <li className={isLeftEdge ? 'disabled' : null}>
            <Link path={this.props.pageUrlBuilder(1)}>&laquo;</Link>
          </li>
          {leftskip}
          {_.map(_.range(rangeStart, rangeEnd + 1), page =>
            <li key={page} className={this.props.currPage === page ? 'active' : null}>
              <Link path={this.props.pageUrlBuilder(page)}>{page}</Link>
            </li>
          )}
          {rightskip}
          <li className={isRightEdge ? 'disabled' : null}>
            <Link path={this.props.pageUrlBuilder(maxPage)}>&raquo;</Link>
          </li>
        </ul>
      </nav>
    );
  }
});

function getCellCssName(column, isHeader) {
  return 'cell ' +
         'cell--' + column.id +
         (isHeader && column.onClick ? ' cell--clickable' : '') +
         (column.cssModifier ? ' cell--' + column.cssModifier : '');
}

module.exports = Table;
