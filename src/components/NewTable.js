// import React from "react";
// no imports are required when this is being rendered in the browser
// no export statement is necessary either

// ReactDataGrid = require("react-data-grid");

// import ReactDataGrid from 'react-data-grid';

const e = React.createElement;

const columns = [
  { key: 'id', name: 'ID' },
  { key: 'title', name: 'Title' },
  { key: 'count', name: 'Count' } ];

const rows = [{id: 0, title: 'row1', count: 20}, {id: 1, title: 'row1', count: 40}, {id: 2, title: 'row1', count: 60}];

var data = {
  first_variable: [1, 2, 3],
  second_variable: [4, 5 , 6]
}

class GridTest extends React.Component {
  rowGetter(i) {
    return this.props.rows[i];
  }
  getSize() {
    return this.props.rows.length;
  }
  handleGridRowsUpdated({ fromRow, toRow, updated }) {
    console.log("handleGridRowsUpdated", arguments);
  }
  render() {
    return (
      // <ReactDataGrid
      //   columns={this.props.columns}
      //   rowGetter={this.rowGetter.bind(this)}
      //   rowsCount={this.props.rows.length}
      //   onGridRowsUpdated={this.handleGridRowsUpdated}
      //   rowsCount={this.getSize()}
      //   minHeight={200}
      //   enableCellSelect={true}
      // />
      <ReactTabulator
        data={data}
        tooltips={true}
        layout={"fitData"}
      />
    );
  }
}

const initialState = {
  columns: [
    {
      key: "id",
      name: "ID",
      resizable: true,
      width: 40
    },
    {
      key: "title",
      name: "Title",
      resizable: true
    },
    {
      key: "count",
      name: "Count",
      resizable: true
    }
  ],
  rows: []
};
for (let i = 1; i < 10; i++) {
  initialState.rows.push({
    id: i,
    title: "Title " + i,
    count: i * 1000
  });
}

// const insertReact = document.getElementById("insertReact")
ReactDOM.render(
  <GridTest columns={initialState.columns} rows={initialState.rows} />,
  document.querySelector("#insertReact")
);
